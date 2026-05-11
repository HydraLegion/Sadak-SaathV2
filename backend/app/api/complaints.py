"""
Sadak Saathi — Complaints API Blueprint
Government complaint workflow automation
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin.firestore as firestore
from datetime import datetime, timedelta
import logging
import uuid

logger = logging.getLogger(__name__)
complaints_bp = Blueprint('complaints', __name__)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Missing token'}}), 401
        return f(*args, **kwargs)
    return decorated


def generate_reference_number(prefix: str, jurisdiction_code: str) -> str:
    """Generate government-style reference number."""
    year = datetime.utcnow().year
    seq = str(uuid.uuid4().int)[:6]
    return f"{prefix}/{jurisdiction_code}/{year}/{seq}"


def calculate_sla_deadline(priority: str) -> datetime:
    """Calculate SLA deadline based on priority."""
    sla_days = {'critical': 3, 'high': 7, 'medium': 14, 'low': 30}
    days = sla_days.get(priority, 30)
    return datetime.utcnow() + timedelta(days=days)


@complaints_bp.route('', methods=['POST'])
@require_auth
def create_complaint():
    """Create a new complaint from pothole."""
    data = request.get_json()
    pothole_id = data.get('potholeId')
    title = data.get('title')
    description = data.get('description')
    priority = data.get('priority', 'medium')
    user_id = data.get('userId')

    if not all([pothole_id, title, description]):
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Missing required fields'}}), 400

    try:
        db = firestore.client()

        # Get pothole details
        pothole = db.collection('potholes').document(pothole_id).get()
        if not pothole.exists:
            return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Pothole not found'}}), 404

        pothole_data = pothole.to_dict()

        # Get jurisdiction code
        jurisdiction_code = 'DEFAULT'
        jurisdiction = db.collection('jurisdictions').document(pothole_data.get('jurisdictionId')).get()
        if jurisdiction.exists:
            jurisdiction_code = jurisdiction.to_dict().get('code', 'DEFAULT')

        # Generate reference number
        ref_number = generate_reference_number('CMP', jurisdiction_code)

        # Create complaint
        complaint_ref = db.collection('complaints').document()
        complaint_ref.set({
            'potholeId': pothole_id,
            'userId': user_id,
            'status': 'submitted',
            'priority': priority,
            'referenceNumber': ref_number,
            'title': title,
            'description': description,
            'mediaUrls': data.get('mediaUrls', []),
            'jurisdictionId': pothole_data.get('jurisdictionId'),
            'departmentId': pothole_data.get('departmentId'),
            'slaDeadline': calculate_sla_deadline(priority),
            'slaBreached': False,
            'timeline': [{
                'id': str(uuid.uuid4()),
                'action': 'created',
                'description': 'Complaint submitted',
                'performedBy': user_id,
                'performedAt': firestore.SERVER_TIMESTAMP
            }],
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })

        # Update pothole status
        db.collection('potholes').document(pothole_id).update({
            'complaintId': complaint_ref.id,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })

        # Notify relevant officers
        from app.workers import send_notification
        send_notification.delay(
            pothole_data.get('jurisdictionId'),
            'New Complaint',
            f'Complaint {ref_number} submitted for review',
            {'complaintId': complaint_ref.id, 'type': 'new_complaint'}
        )

        return jsonify({
            'success': True,
            'data': {
                'id': complaint_ref.id,
                'referenceNumber': ref_number,
                'status': 'submitted',
                'slaDeadline': calculate_sla_deadline(priority).isoformat()
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'complaint_error', 'message': str(e)}}), 500


@complaints_bp.route('', methods=['GET'])
@require_auth
def list_complaints():
    """List complaints with filtering."""
    page = request.args.get('page', 1, type=int)
    page_size = min(request.args.get('pageSize', 20, type=int), 100)
    status = request.args.get('status')
    priority = request.args.get('priority')
    assigned_to = request.args.get('assignedTo')
    jurisdiction_id = request.args.get('jurisdictionId')

    db = firestore.client()
    query = db.collection('complaints').order_by('createdAt', direction=firestore.Query.DESCENDING)

    if status:
        query = query.where('status', '==', status)
    if priority:
        query = query.where('priority', '==', priority)
    if assigned_to:
        query = query.where('assignedTo', '==', assigned_to)
    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)

    offset = (page - 1) * page_size
    complaints = query.offset(offset).limit(page_size).get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': c.id, **c.to_dict()} for c in complaints],
            'page': page,
            'pageSize': page_size,
            'hasMore': len(complaints) == page_size
        }
    })


@complaints_bp.route('/<complaint_id>', methods=['GET'])
@require_auth
def get_complaint(complaint_id: str):
    """Get complaint details."""
    db = firestore.client()
    complaint = db.collection('complaints').document(complaint_id).get()

    if not complaint.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Complaint not found'}}), 404

    return jsonify({
        'success': True,
        'data': {'id': complaint.id, **complaint.to_dict()}
    })


@complaints_bp.route('/<complaint_id>', methods=['PATCH'])
@require_auth
def update_complaint(complaint_id: str):
    """Update complaint status or assign."""
    data = request.get_json()
    db = firestore.client()

    update_data = {'updatedAt': firestore.SERVER_TIMESTAMP}
    timeline_entry = {
        'id': str(uuid.uuid4()),
        'performedAt': firestore.SERVER_TIMESTAMP
    }

    if 'status' in data:
        update_data['status'] = data['status']
        timeline_entry['action'] = 'status_change'
        timeline_entry['description'] = f'Status changed to {data["status"]}'

        if data['status'] == 'resolved':
            update_data['resolvedAt'] = firestore.SERVER_TIMESTAMP
        elif data['status'] == 'escalated':
            update_data['escalatedAt'] = firestore.SERVER_TIMESTAMP

    if 'assignedTo' in data:
        update_data['assignedTo'] = data['assignedTo']
        update_data['status'] = 'assigned'
        timeline_entry['action'] = 'assigned'
        timeline_entry['description'] = f'Assigned to {data["assignedTo"]}'

    if 'priority' in data:
        update_data['priority'] = data['priority']
        update_data['slaDeadline'] = calculate_sla_deadline(data['priority'])
        timeline_entry['action'] = 'priority_change'
        timeline_entry['description'] = f'Priority changed to {data["priority"]}'

    # Add timeline entry
    complaint = db.collection('complaints').document(complaint_id).get()
    if complaint.exists:
        timeline = complaint.to_dict().get('timeline', [])
        timeline.append(timeline_entry)
        update_data['timeline'] = timeline

    db.collection('complaints').document(complaint_id).update(update_data)

    return jsonify({
        'success': True,
        'data': {'id': complaint_id, **update_data}
    })


@complaints_bp.route('/<complaint_id>/timeline', methods=['GET'])
@require_auth
def get_complaint_timeline(complaint_id: str):
    """Get complaint timeline."""
    db = firestore.client()
    complaint = db.collection('complaints').document(complaint_id).get()

    if not complaint.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Complaint not found'}}), 404

    return jsonify({
        'success': True,
        'data': {
            'id': complaint_id,
            'timeline': complaint.to_dict().get('timeline', [])
        }
    })
