"""
Sadak Saathi — Upload API Blueprint
Media upload handling with Firebase Storage
"""
from flask import Blueprint, request, jsonify, send_file
import firebase_admin.storage as storage
from firebase_admin import firestore
import uuid
import os
import logging
from io import BytesIO

logger = logging.getLogger(__name__)
upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/image', methods=['POST'])
def upload_image():
    """Upload image to Firebase Storage."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'No file provided'}}), 400

    file = request.files['file']
    user_id = request.form.get('userId', 'anonymous')
    detection_id = request.form.get('detectionId')
    pothole_id = request.form.get('potholeId')

    if file.filename == '':
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Empty filename'}}), 400

    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        return jsonify({'success': False, 'error': {'code': 'invalid_file_type', 'message': f'Allowed types: {", ".join(allowed_types)}'}}), 400

    # Check file size (50MB max)
    max_size = 50 * 1024 * 1024
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)

    if size > max_size:
        return jsonify({'success': False, 'error': {'code': 'file_too_large', 'message': 'File exceeds 50MB limit'}}), 400

    try:
        # Generate unique path
        ext = os.path.splitext(file.filename)[1] or '.jpg'
        filename = f"{uuid.uuid4()}{ext}"

        # Determine storage path
        if detection_id:
            storage_path = f"detections/{detection_id}/{filename}"
        elif pothole_id:
            storage_path = f"potholes/{pothole_id}/{filename}"
        else:
            storage_path = f"uploads/{user_id}/{filename}"

        # Upload to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)
        blob.upload_from_file(file, content_type=file.content_type)

        # Make public
        blob.make_public()

        # Store metadata in Firestore
        db = firestore.client()
        media_ref = db.collection('media_assets').document()
        media_ref.set({
            'url': blob.public_url,
            'type': 'image',
            'bucket': bucket.name,
            'path': storage_path,
            'size': size,
            'uploadedBy': user_id,
            'detectionId': detection_id,
            'potholeId': pothole_id,
            'createdAt': firestore.SERVER_TIMESTAMP
        })

        return jsonify({
            'success': True,
            'data': {
                'id': media_ref.id,
                'url': blob.public_url,
                'path': storage_path,
                'size': size
            }
        })

    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({'success': False, 'error': {'code': 'upload_error', 'message': str(e)}}), 500


@upload_bp.route('/video', methods=['POST'])
def upload_video():
    """Upload video to Firebase Storage."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'No file provided'}}), 400

    file = request.files['file']
    user_id = request.form.get('userId', 'anonymous')
    detection_id = request.form.get('detectionId')

    if file.filename == '':
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Empty filename'}}), 400

    # Validate file type
    allowed_types = ['video/mp4', 'video/quicktime', 'video/x-msvideo']
    if file.content_type not in allowed_types:
        return jsonify({'success': False, 'error': {'code': 'invalid_file_type', 'message': f'Allowed types: {", ".join(allowed_types)}'}}), 400

    # Check file size (500MB max for videos)
    max_size = 500 * 1024 * 1024
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)

    if size > max_size:
        return jsonify({'success': False, 'error': {'code': 'file_too_large', 'message': 'File exceeds 500MB limit'}}), 400

    try:
        ext = os.path.splitext(file.filename)[1] or '.mp4'
        filename = f"{uuid.uuid4()}{ext}"
        storage_path = f"videos/{user_id}/{uuid.uuid4()}/{filename}"

        bucket = storage.bucket()
        blob = bucket.blob(storage_path)

        # Upload with chunking for large files
        blob.upload_from_file(
            file,
            content_type=file.content_type,
            chunk_size=1024 * 1024 * 10  # 10MB chunks
        )

        blob.make_public()

        # Store metadata
        db = firestore.client()
        media_ref = db.collection('media_assets').document()
        media_ref.set({
            'url': blob.public_url,
            'type': 'video',
            'bucket': bucket.name,
            'path': storage_path,
            'size': size,
            'uploadedBy': user_id,
            'detectionId': detection_id,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'status': 'pending'
        })

        # Queue for processing if detection_id provided
        if detection_id:
            from app.workers import process_detection
            process_detection.delay(detection_id, blob.public_url, 'video', {})

        return jsonify({
            'success': True,
            'data': {
                'id': media_ref.id,
                'url': blob.public_url,
                'path': storage_path,
                'size': size,
                'status': 'processing'
            }
        })

    except Exception as e:
        logger.error(f"Video upload error: {e}")
        return jsonify({'success': False, 'error': {'code': 'upload_error', 'message': str(e)}}), 500


@upload_bp.route('/thumbnail/<detection_id>', methods=['POST'])
def generate_thumbnail(detection_id: str):
    """Generate thumbnail from video."""
    timestamp = request.form.get('timestamp', 0, type=int)

    try:
        # TODO: Implement FFmpeg-based thumbnail generation
        # For now, return placeholder

        return jsonify({
            'success': True,
            'data': {
                'detectionId': detection_id,
                'thumbnailUrl': None,
                'message': 'Thumbnail generation queued'
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'processing_error', 'message': str(e)}}), 500


@upload_bp.route('/<media_id>', methods=['DELETE'])
def delete_media(media_id: str):
    """Delete media from storage."""
    db = firestore.client()
    media_doc = db.collection('media_assets').document(media_id).get()

    if not media_doc.exists:
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Media not found'}}), 404

    try:
        path = media_doc.to_dict().get('path')

        if path:
            bucket = storage.bucket()
            blob = bucket.blob(path)
            blob.delete()

        media_doc.reference.delete()

        return jsonify({'success': True, 'data': {'id': media_id}})

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'delete_error', 'message': str(e)}}), 500
