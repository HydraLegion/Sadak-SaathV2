"""
Sadak Saathi — Analytics API Blueprint
Dashboard metrics, trends, and aggregated data
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin.firestore as firestore
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
analytics_bp = Blueprint('analytics', __name__)


def require_auth(f):
    """Decorator to require authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Missing token'}}), 401
        return f(*args, **kwargs)
    return decorated_function


@analytics_bp.route('/summary', methods=['GET'])
@require_auth
def get_summary():
    """Get analytics summary for dashboard."""
    jurisdiction_id = request.args.get('jurisdictionId')
    db = firestore.client()

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = today_start - timedelta(days=7)

    # Build queries
    potholes_query = db.collection('potholes')
    if jurisdiction_id:
        potholes_query = potholes_query.where('jurisdictionId', '==', jurisdiction_id)

    detections_query = db.collection('detections')
    if jurisdiction_id:
        detections_query = detections_query.where('jurisdictionId', '==', jurisdiction_id)

    complaints_query = db.collection('complaints')
    if jurisdiction_id:
        complaints_query = complaints_query.where('jurisdictionId', '==', jurisdiction_id)

    # Execute queries
    potholes = potholes_query.get()
    detections = detections_query.get()
    complaints = complaints_query.get()

    # Calculate metrics
    total_potholes = len(potholes)
    pending_count = sum(1 for p in potholes if p.to_dict().get('status') == 'pending')
    verified_count = sum(1 for p in potholes if p.to_dict().get('status') == 'verified')
    resolved_count = sum(1 for p in potholes if p.to_dict().get('status') == 'resolved')

    # Severity breakdown
    severity_breakdown = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
    for p in potholes:
        sev = p.to_dict().get('severity', 'low')
        severity_breakdown[sev] = severity_breakdown.get(sev, 0) + 1

    # Complaint metrics
    open_complaints = sum(1 for c in complaints if c.to_dict().get('status') not in ['resolved', 'closed'])
    sla_breached = sum(1 for c in complaints if c.to_dict().get('slaBreached', False))

    # Recent activity (last 24h)
    recent_potholes = sum(1 for p in potholes if p.to_dict().get('createdAt', today_start) >= today_start)
    recent_detections = sum(1 for d in detections if d.to_dict().get('createdAt', today_start) >= today_start)

    return jsonify({
        'success': True,
        'data': {
            'potholes': {
                'total': total_potholes,
                'pending': pending_count,
                'verified': verified_count,
                'resolved': resolved_count,
                'resolutionRate': round(resolved_count / total_potholes * 100, 1) if total_potholes > 0 else 0
            },
            'severityBreakdown': severity_breakdown,
            'complaints': {
                'open': open_complaints,
                'total': len(complaints),
                'slaBreached': sla_breached
            },
            'recentActivity': {
                'potholesToday': recent_potholes,
                'detectionsToday': recent_detections
            },
            'generatedAt': datetime.utcnow().isoformat()
        }
    })


@analytics_bp.route('/trends', methods=['GET'])
@require_auth
def get_trends():
    """Get pothole detection trends over time."""
    jurisdiction_id = request.args.get('jurisdictionId')
    group_by = request.args.get('groupBy', 'day')  # day, week, month
    date_from = request.args.get('dateFrom', (datetime.utcnow() - timedelta(days=30)).isoformat())
    date_to = request.args.get('dateTo', datetime.utcnow().isoformat())

    db = firestore.client()

    # Determine date grouping
    date_format = '%Y-%m-%d' if group_by == 'day' else '%Y-%U' if group_by == 'week' else '%Y-%m'
    group_key = 'date' if group_by == 'day' else 'week' if group_by == 'week' else 'month'

    # Query potholes in date range
    query = db.collection('potholes')
    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)

    potholes = query.get()

    # Group by time period
    trends = {}
    for p in potholes:
        created = p.to_dict().get('createdAt')
        if created:
            if hasattr(created, 'to_datetime'):
                created = created.to_datetime()

            date_key = created.strftime(date_format)

            if date_key not in trends:
                trends[date_key] = {'total': 0, 'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'resolved': 0}

            trends[date_key]['total'] += 1
            sev = p.to_dict().get('severity', 'low')
            trends[date_key][sev] = trends[date_key].get(sev, 0) + 1

            if p.to_dict().get('status') == 'resolved':
                trends[date_key]['resolved'] += 1

    # Convert to sorted list
    trend_data = [
        {group_key: k, **v}
        for k, v in sorted(trends.items())
    ]

    return jsonify({
        'success': True,
        'data': {
            'groupBy': group_by,
            'trends': trend_data,
            'dateRange': {'from': date_from, 'to': date_to}
        }
    })


@analytics_bp.route('/severity', methods=['GET'])
@require_auth
def get_severity_distribution():
    """Get severity distribution across jurisdictions."""
    jurisdiction_id = request.args.get('jurisdictionId')

    db = firestore.client()
    query = db.collection('potholes')

    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)

    potholes = query.get()

    # Group by severity and jurisdiction
    distribution = {
        'overall': {'critical': 0, 'high': 0, 'medium': 0, 'low': 0},
        'byJurisdiction': {}
    }

    for p in potholes:
        data = p.to_dict()
        sev = data.get('severity', 'low')
        jur = data.get('jurisdictionId', 'unknown')

        distribution['overall'][sev] = distribution['overall'].get(sev, 0) + 1

        if jur not in distribution['byJurisdiction']:
            distribution['byJurisdiction'][jur] = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        distribution['byJurisdiction'][jur][sev] = distribution['byJurisdiction'][jur].get(sev, 0) + 1

    return jsonify({
        'success': True,
        'data': distribution
    })


@analytics_bp.route('/performance', methods=['GET'])
@require_auth
def get_performance_metrics():
    """Get performance metrics (resolution time, SLA compliance)."""
    jurisdiction_id = request.args.get('jurisdictionId')
    date_from = request.args.get('dateFrom', (datetime.utcnow() - timedelta(days=30)).isoformat())
    date_to = request.args.get('dateTo', datetime.utcnow().isoformat())

    db = firestore.client()
    query = db.collection('potholes').where('status', '==', 'resolved')

    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)

    potholes = query.get()

    # Calculate resolution times
    resolution_times = []
    sla_compliant = 0
    total_resolved = 0

    sla_thresholds = {'critical': 3, 'high': 7, 'medium': 14, 'low': 30}

    for p in potholes:
        data = p.to_dict()
        created = data.get('createdAt')
        resolved = data.get('resolvedAt')

        if created and resolved:
            if hasattr(created, 'to_datetime'):
                created = created.to_datetime()
            if hasattr(resolved, 'to_datetime'):
                resolved = resolved.to_datetime()

            days_to_resolve = (resolved - created).days
            resolution_times.append(days_to_resolve)

            sev = data.get('severity', 'low')
            threshold = sla_thresholds.get(sev, 30)

            if days_to_resolve <= threshold:
                sla_compliant += 1

            total_resolved += 1

    avg_resolution = sum(resolution_times) / len(resolution_times) if resolution_times else 0
    min_resolution = min(resolution_times) if resolution_times else 0
    max_resolution = max(resolution_times) if resolution_times else 0

    return jsonify({
        'success': True,
        'data': {
            'resolutionTime': {
                'average': round(avg_resolution, 1),
                'min': min_resolution,
                'max': max_resolution,
                'unit': 'days'
            },
            'slaCompliance': {
                'compliant': sla_compliant,
                'total': total_resolved,
                'rate': round(sla_compliant / total_resolved * 100, 1) if total_resolved > 0 else 0
            },
            'dateRange': {'from': date_from, 'to': date_to}
        }
    })
