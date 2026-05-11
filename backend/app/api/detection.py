"""
Sadak Saathi — Detection API Blueprint
AI-powered pothole detection endpoints
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin.firestore as firestore
import logging

logger = logging.getLogger(__name__)
detection_bp = Blueprint('detections', __name__)


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Missing token'}}), 401
        return f(*args, **kwargs)
    return decorated


@detection_bp.route('', methods=['POST'])
@require_auth
def create_detection():
    """Create a new detection task."""
    data = request.get_json()
    media_url = data.get('mediaUrl')
    media_type = data.get('mediaType', 'image')
    location = data.get('location')

    if not media_url or not location:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'mediaUrl and location required'}}), 400

    try:
        db = firestore.client()

        # Create detection document
        detection_ref = db.collection('detections').document()
        detection_ref.set({
            'mediaUrl': media_url,
            'mediaType': media_type,
            'location': location,
            'status': 'pending',
            'metadata': data.get('metadata', {}),
            'createdAt': firestore.SERVER_TIMESTAMP
        })

        # Queue for processing
        from app.workers import process_detection
        process_detection.delay(detection_ref.id, media_url, media_type, location)

        return jsonify({
            'success': True,
            'data': {
                'id': detection_ref.id,
                'status': 'queued'
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'detection_error', 'message': str(e)}}), 500


@detection_bp.route('', methods=['GET'])
@require_auth
def list_detections():
    """List detections with filtering."""
    page = request.args.get('page', 1, type=int)
    page_size = min(request.args.get('pageSize', 20, type=int), 100)
    status = request.args.get('status')

    db = firestore.client()
    query = db.collection('detections').order_by('createdAt', direction=firestore.Query.DESCENDING)

    if status:
        query = query.where('status', '==', status)

    offset = (page - 1) * page_size
    detections = query.offset(offset).limit(page_size).get()

    return jsonify({
        'success': True,
        'data': {
            'items': [{'id': d.id, **d.to_dict()} for d in detections],
            'page': page,
            'pageSize': page_size
        }
    })


@detection_bp.route('/<detection_id>', methods=['GET'])
@require_auth
def get_detection(detection_id: str):
    """Get detection details."""
    db = firestore.client()
    detection = db.collection('detections').document(detection_id).get()

    if not detection.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Detection not found'}}), 404

    return jsonify({
        'success': True,
        'data': {'id': detection.id, **detection.to_dict()}
    })


@detection_bp.route('/<detection_id>/status', methods=['GET'])
@require_auth
def get_detection_status(detection_id: str):
    """Poll detection processing status."""
    db = firestore.client()
    detection = db.collection('detections').document(detection_id).get()

    if not detection.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Detection not found'}}), 404

    data = detection.to_dict()

    return jsonify({
        'success': True,
        'data': {
            'id': detection_id,
            'status': data.get('status'),
            'result': data.get('results') if data.get('status') == 'completed' else None,
            'error': data.get('error') if data.get('status') == 'failed' else None
        }
    })


@detection_bp.route('/batch', methods=['POST'])
@require_auth
def batch_detect():
    """Process multiple media URLs in batch."""
    data = request.get_json()
    media_items = data.get('media', [])

    if not media_items or len(media_items) > 10:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Provide 1-10 media items'}}), 400

    created = []
    db = firestore.client()

    for item in media_items:
        detection_ref = db.collection('detections').document()
        detection_ref.set({
            'mediaUrl': item['url'],
            'mediaType': item.get('type', 'image'),
            'location': item.get('location', {}),
            'status': 'pending',
            'batchId': data.get('batchId'),
            'createdAt': firestore.SERVER_TIMESTAMP
        })

        from app.workers import process_detection
        process_detection.delay(detection_ref.id, item['url'], item.get('type', 'image'), item.get('location', {}))

        created.append({'id': detection_ref.id, 'mediaUrl': item['url']})

    return jsonify({
        'success': True,
        'data': {
            'batchId': data.get('batchId'),
            'detections': created
        }
    }), 201
