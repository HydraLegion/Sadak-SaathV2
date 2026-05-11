"""
Sadak Saathi — Admin API Blueprint
User management, moderation, jurisdiction management
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin.firestore as firestore
import logging

logger = logging.getLogger(__name__)
admin_bp = Blueprint('admin', __name__)


def require_role(required_roles: list):
    """Decorator to require specific roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # TODO: Implement with Firebase Auth custom claims
            # For now, check Authorization header
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Missing token'}}), 401

            # TODO: Validate token and check role
            # For MVP, allow all authenticated requests
            return f(*args, **kwargs)
        return decorated_function
    return decorator


@admin_bp.route('/users', methods=['GET'])
@require_role(['admin', 'super_admin'])
def list_users():
    """List all users with pagination."""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)
    role = request.args.get('role')

    db = firestore.client()
    query = db.collection('users').order_by('createdAt', direction=firestore.Query.DESCENDING)

    if role:
        query = query.where('role', '==', role)

    offset = (page - 1) * page_size
    users = query.offset(offset).limit(page_size).get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': u.id, **u.to_dict()} for u in users],
            'page': page,
            'pageSize': page_size
        }
    })


@admin_bp.route('/users/<user_id>', methods=['PATCH'])
@require_role(['admin', 'super_admin'])
def update_user(user_id: str):
    """Update user role or status."""
    data = request.get_json()

    if 'role' in data:
        # TODO: Verify admin is allowed to set this role
        pass

    db = firestore.client()
    db.collection('users').document(user_id).update({
        **data,
        'updatedAt': firestore.SERVER_TIMESTAMP
    })

    # Log action
    log_admin_action(request, 'update_user', 'users', user_id, data)

    return jsonify({'success': True, 'data': {'id': user_id, **data}})


@admin_bp.route('/moderation/queue', methods=['GET'])
@require_role(['admin', 'super_admin'])
def get_moderation_queue():
    """Get pending moderation items."""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 20, type=int)

    db = firestore.client()
    detections = db.collection('detections') \
        .where('moderationStatus', '==', 'pending') \
        .order_by('createdAt', direction=firestore.Query.DESCENDING) \
        .offset((page - 1) * page_size) \
        .limit(page_size) \
        .get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': d.id, **d.to_dict()} for d in detections],
            'page': page,
            'pageSize': page_size
        }
    })


@admin_bp.route('/moderation/decide', methods=['POST'])
@require_role(['admin', 'super_admin'])
def moderation_decision():
    """Make moderation decision on a detection."""
    data = request.get_json()
    detection_id = data.get('detectionId')
    decision = data.get('decision')  # approve, reject, needs_review
    reason = data.get('reason')

    if not all([detection_id, decision, reason]):
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Missing required fields'}}), 400

    db = firestore.client()

    # Update detection
    db.collection('detections').document(detection_id).update({
        'moderationStatus': decision,
        'moderationDecision': {
            'decision': decision,
            'reason': reason,
            'moderatedBy': 'admin_user',  # TODO: Get from auth
            'moderatedAt': firestore.SERVER_TIMESTAMP
        }
    })

    # If approved and has high confidence, create potholes
    if decision == 'approve':
        create_potholes_from_detection.delay(detection_id)

    # Log action
    log_admin_action(request, 'moderation_decision', 'detections', detection_id, data)

    return jsonify({'success': True, 'data': {'detectionId': detection_id, 'decision': decision}})


@admin_bp.route('/jurisdictions', methods=['GET', 'POST'])
@require_role(['admin', 'super_admin'])
def manage_jurisdictions():
    """List or create jurisdictions."""
    if request.method == 'GET':
        db = firestore.client()
        jurisdictions = db.collection('jurisdictions').get()

        return jsonify({
            'success': True,
            'data': [{'id': j.id, **j.to_dict()} for j in jurisdictions]
        })

    else:
        data = request.get_json()
        db = firestore.client()

        jur_ref = db.collection('jurisdictions').document()
        jur_ref.set({
            **data,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })

        log_admin_action(request, 'create_jurisdiction', 'jurisdictions', jur_ref.id, data)

        return jsonify({'success': True, 'data': {'id': jur_ref.id}}), 201


@admin_bp.route('/audit-logs', methods=['GET'])
@require_role(['admin', 'super_admin'])
def get_audit_logs():
    """Get audit logs with filtering."""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('pageSize', 50, type=int)
    user_id = request.args.get('userId')
    action = request.args.get('action')
    resource = request.args.get('resource')
    date_from = request.args.get('dateFrom')
    date_to = request.args.get('dateTo')

    db = firestore.client()
    query = db.collection('audit_logs').order_by('createdAt', direction=firestore.Query.DESCENDING)

    if user_id:
        query = query.where('userId', '==', user_id)
    if action:
        query = query.where('action', '==', action)
    if resource:
        query = query.where('resource', '==', resource)

    offset = (page - 1) * page_size
    logs = query.offset(offset).limit(page_size).get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': l.id, **l.to_dict()} for l in logs],
            'page': page,
            'pageSize': page_size
        }
    })


def log_admin_action(request, action: str, resource: str, resource_id: str, changes: dict):
    """Log admin action to audit log."""
    import firebase_admin.firestore as firestore

    db = firestore.client()

    # TODO: Extract user from auth token
    log_entry = {
        'userId': 'admin_user',  # TODO: Get from auth
        'userRole': 'admin',
        'action': action,
        'resource': resource,
        'resourceId': resource_id,
        'changes': changes,
        'ip': request.remote_addr,
        'userAgent': request.headers.get('User-Agent', ''),
        'createdAt': firestore.SERVER_TIMESTAMP
    }

    db.collection('audit_logs').add(log_entry)


# Import for deferred execution
from app.workers import create_potholes_from_detection
