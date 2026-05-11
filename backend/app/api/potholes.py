"""
Sadak Saathi — Potholes API Blueprint
Pothole listing, filtering, and individual retrieval
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin.firestore as firestore
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
potholes_bp = Blueprint('potholes', __name__)


def require_auth(f):
    """Decorator to require authentication."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Missing token'}}), 401
        return f(*args, **kwargs)
    return decorated_function


@potholes_bp.route('', methods=['GET'])
@require_auth
def list_potholes():
    """List potholes with filtering and pagination."""
    page = request.args.get('page', 1, type=int)
    page_size = min(request.args.get('pageSize', 20, type=int), 100)
    status = request.args.get('status')
    severity = request.args.get('severity')
    jurisdiction_id = request.args.get('jurisdictionId')
    date_from = request.args.get('dateFrom')
    date_to = request.args.get('dateTo')
    sort_by = request.args.get('sortBy', 'createdAt')
    sort_order = request.GET.get('sortOrder', 'desc')

    db = firestore.client()
    query = db.collection('potholes')

    # Apply filters
    if status:
        query = query.where('status', '==', status)
    if severity:
        query = query.where('severity', '==', severity)
    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)

    # Sort
    direction = firestore.Query.DESCENDING if sort_order == 'desc' else firestore.Query.ASCENDING
    query = query.order_by(sort_by, direction=direction)

    # Count total
    count_query = query
    total_count = len(count_query.get())

    # Paginate
    offset = (page - 1) * page_size
    potholes = query.offset(offset).limit(page_size).get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': p.id, **p.to_dict()} for p in potholes],
            'total': total_count,
            'page': page,
            'pageSize': page_size,
            'hasMore': (page * page_size) < total_count
        }
    })


@potholes_bp.route('/nearby', methods=['GET'])
@require_auth
def get_nearby_potholes():
    """Get potholes near a given location using geo-queries."""
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius_km = request.args.get('radiusKm', 5, type=float)

    if not lat or not lng:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'lat and lng are required'}}), 400

    # Simple bounding box query (for production, use Geohash or GeoFire)
    lat_delta = radius_km / 111  # Rough km to degree conversion
    lng_delta = radius_km / (111 * abs(111 * abs(lat) + 1) / 111)

    db = firestore.client()
    potholes = db.collection('potholes') \
        .where('lat', '>=', lat - lat_delta) \
        .where('lat', '<=', lat + lat_delta) \
        .where('lng', '>=', lng - lng_delta) \
        .where('lng', '<=', lng + lng_delta) \
        .where('status', '!=', 'resolved') \
        .get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': p.id, **p.to_dict()} for p in potholes],
            'center': {'lat': lat, 'lng': lng},
            'radiusKm': radius_km
        }
    })


@potholes_bp.route('/<pothole_id>', methods=['GET'])
@require_auth
def get_pothole(pothole_id: str):
    """Get a single pothole by ID."""
    db = firestore.client()
    pothole = db.collection('potholes').document(pothole_id).get()

    if not pothole.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Pothole not found'}}), 404

    return jsonify({
        'success': True,
        'data': {'id': pothole.id, **pothole.to_dict()}
    })


@potholes_bp.route('/<pothole_id>', methods=['PATCH'])
@require_auth
def update_pothole(pothole_id: str):
    """Update pothole status or details."""
    data = request.get_json()
    db = firestore.client()

    update_data = {**data, 'updatedAt': firestore.SERVER_TIMESTAMP}

    # Track status changes
    if 'status' in data:
        pothole = db.collection('potholes').document(pothole_id).get()
        if pothole.exists:
            old_status = pothole.to_dict().get('status')
            update_data['previousStatus'] = old_status

            if data['status'] == 'resolved':
                update_data['resolvedAt'] = firestore.SERVER_TIMESTAMP

    db.collection('potholes').document(pothole_id).update(update_data)

    return jsonify({'success': True, 'data': {'id': pothole_id, **update_data}})


@potholes_bp.route('/<pothole_id>/timeline', methods=['GET'])
@require_auth
def get_pothole_timeline(pothole_id: str):
    """Get timeline of events for a pothole."""
    db = firestore.client()

    # Get pothole
    pothole = db.collection('potholes').document(pothole_id).get()
    if not pothole.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Pothole not found'}}), 404

    # Get associated complaints
    complaints = db.collection('complaints').where('potholeId', '==', pothole_id).get()

    # Get repair updates
    repairs = db.collection('repair_updates').where('potholeId', '==', pothole_id).order_by('createdAt').get()

    timeline = []

    for c in complaints:
        timeline.append({
            'type': 'complaint',
            'id': c.id,
            'status': c.to_dict().get('status'),
            'createdAt': c.to_dict().get('createdAt')
        })

    for r in repairs:
        timeline.append({
            'type': 'repair',
            'id': r.id,
            'status': r.to_dict().get('status'),
            'createdAt': r.to_dict().get('createdAt')
        })

    # Sort by date
    timeline.sort(key=lambda x: x.get('createdAt', datetime.min), reverse=True)

    return jsonify({
        'success': True,
        'data': {
            'potholeId': pothole_id,
            'timeline': timeline
        }
    })


@potholes_bp.route('/heatmap', methods=['GET'])
@require_auth
def get_heatmap_data():
    """Get heatmap data for pothole density visualization."""
    jurisdiction_id = request.args.get('jurisdictionId')
    severity = request.args.get('severity')

    db = firestore.client()
    query = db.collection('potholes').where('status', '!=', 'resolved')

    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)
    if severity:
        query = query.where('severity', '==', severity)

    potholes = query.get()

    # Generate heatmap points
    points = []
    for p in potholes:
        data = p.to_dict()
        severity_weight = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}.get(data.get('severity', 'low'), 1)

        points.append({
            'lat': data.get('lat'),
            'lng': data.get('lng'),
            'intensity': severity_weight,
            'severity': data.get('severity')
        })

    return jsonify({
        'success': True,
        'data': {
            'points': points,
            'total': len(points)
        }
    })
