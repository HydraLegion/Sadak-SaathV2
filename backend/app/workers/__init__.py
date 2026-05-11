"""
Sadak Saathi — Celery Workers
Background task processing for detection, notifications, and analytics
"""
from celery import Task, group, chain
from app import celery_app
import logging

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, name='process_detection')
def process_detection(self, detection_id: str, media_url: str, media_type: str, location: dict) -> dict:
    """
    Process media detection in background.

    Steps:
    1. Download media from URL
    2. Run YOLO detection
    3. Calculate severity
    4. Store results in Firestore
    5. Trigger notifications if high severity
    """
    from app.services.detection import get_detection_service
    import firebase_admin.firestore as firestore

    try:
        self.update_state(state='PROCESSING', meta={'status': 'Downloading media'})

        # Download media
        # media_bytes = download_from_url(media_url)

        # Run detection
        detection_service = get_detection_service()
        if media_type == 'video':
            result = detection_service.detect_video(media_bytes)
        else:
            result = detection_service.detect_from_bytes(media_bytes)

        # Update Firestore
        db = firestore.client()
        db.collection('detections').document(detection_id).update({
            'status': 'completed',
            'results': result,
            'processedAt': firestore.SERVER_TIMESTAMP,
            'processedBy': 'ai'
        })

        # Create potholes for high-confidence detections
        if result['avg_confidence'] > 0.8:
            create_potholes_from_detection.delay(detection_id, result['detections'], location)

        return {'status': 'completed', 'detection_id': detection_id, 'result': result}

    except Exception as e:
        logger.error(f"Detection processing failed: {e}")
        db = firestore.client()
        db.collection('detections').document(detection_id).update({
            'status': 'failed',
            'error': str(e)
        })
        raise


@celery_app.task(bind=True, name='create_potholes_from_detection')
def create_potholes_from_detection(self, detection_id: str, detections: list, location: dict) -> list:
    """Create pothole documents from detection results."""
    import firebase_admin.firestore as firestore
    from datetime import datetime

    db = firestore.client()
    jurisdiction_id = get_jurisdiction_for_location(location['lat'], location['lng'])
    created_potholes = []

    for det in detections:
        if det['confidence'] > 0.85:
            pothole_ref = db.collection('potholes').document()
            pothole_data = {
                'lat': location['lat'],
                'lng': location['lng'],
                'severity': det['severity'],
                'confidence': det['confidence'],
                'status': 'pending',
                'jurisdictionId': jurisdiction_id,
                'detectionIds': [detection_id],
                'boundingBox': {
                    'x': det['x'],
                    'y': det['y'],
                    'width': det['width'],
                    'height': det['height']
                },
                'detectedAt': firestore.SERVER_TIMESTAMP,
                'createdAt': firestore.SERVER_TIMESTAMP,
            }
            pothole_ref.set(pothole_data)
            created_potholes.append(pothole_ref.id)

    return created_potholes


@celery_app.task(name='send_notification')
def send_notification(user_id: str, title: str, body: str, data: dict) -> dict:
    """Send push notification via Firebase Cloud Messaging."""
    from firebase_admin import messaging

    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={k: str(v) for k, v in data.items()},
            topic=f'user_{user_id}'
        )
        response = messaging.send(message)
        return {'success': True, 'message_id': response}
    except Exception as e:
        logger.error(f"Notification failed: {e}")
        return {'success': False, 'error': str(e)}


@celery_app.task(name='update_analytics_cache')
def update_analytics_cache(jurisdiction_id: str | None = None) -> dict:
    """Update analytics cache for specified jurisdiction."""
    import firebase_admin.firestore as firestore
    from datetime import datetime, timedelta

    db = firestore.client()

    # Calculate metrics
    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)

    query = db.collection('potholes')
    if jurisdiction_id:
        query = query.where('jurisdictionId', '==', jurisdiction_id)

    potholes = query.get()
    total = len(potholes)
    verified = sum(1 for p in potholes if p.to_dict().get('status') == 'verified')
    resolved = sum(1 for p in potholes if p.to_dict().get('status') == 'resolved')

    # Severity breakdown
    severity_breakdown = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
    for p in potholes:
        severity = p.to_dict().get('severity', 'low')
        severity_breakdown[severity] = severity_breakdown.get(severity, 0) + 1

    # Store cache
    cache_ref = db.collection('analytics_cache').document()
    cache_ref.set({
        'type': 'daily',
        'jurisdictionId': jurisdiction_id,
        'periodStart': firestore.SERVER_TIMESTAMP,
        'metrics': {
            'totalDetections': total,
            'verifiedPotholes': verified,
            'resolvedPotholes': resolved,
            'severityBreakdown': severity_breakdown
        },
        'computedAt': firestore.SERVER_TIMESTAMP
    })

    return {'status': 'completed', 'cache_id': cache_ref.id}


@celery_app.task(name='check_sla_deadlines')
def check_sla_deadlines() -> list:
    """Check and escalate complaints approaching SLA deadlines."""
    import firebase_admin.firestore as firestore
    from datetime import datetime, timedelta

    db = firestore.client()
    now = datetime.utcnow()
    upcoming = now + timedelta(hours=24)

    # Find complaints near SLA deadline
    complaints = db.collection('complaints').where('status', 'in', ['assigned', 'in_progress']).get()

    escalated = []
    for complaint in complaints:
        data = complaint.to_dict()
        sla_deadline = data.get('slaDeadline')

        if sla_deadline:
            sla_date = sla_deadline if isinstance(sla_deadline, datetime) else sla_deadline.to_datetime()

            if sla_date <= upcoming and not data.get('slaBreached'):
                # Update and escalate
                complaint.reference.update({'slaBreached': True, 'status': 'escalated'})
                escalated.append(complaint.id)

                # Notify assigned officer
                if data.get('assignedTo'):
                    send_notification.delay(
                        data['assignedTo'],
                        'SLA Alert',
                        f'Complaint {data.get("referenceNumber")} is approaching deadline',
                        {'complaintId': complaint.id, 'type': 'sla_alert'}
                    )

    return escalated


def get_jurisdiction_for_location(lat: float, lng: float) -> str:
    """Determine jurisdiction for given coordinates."""
    import firebase_admin.firestore as firestore

    db = firestore.client()
    jurisdictions = db.collection('jurisdictions').get()

    for jur in jurisdictions:
        data = jur.to_dict()
        bounds = data.get('bounds', [])
        if is_point_in_bounds(lat, lng, bounds):
            return jur.id

    return 'default'


def is_point_in_bounds(lat: float, lng: float, bounds: list) -> bool:
    """Simple point-in-polygon check."""
    if len(bounds) < 3:
        return False

    inside = False
    j = len(bounds) - 1
    for i in range(len(bounds)):
        xi, yi = bounds[i].get('lng', 0), bounds[i].get('lat', 0)
        xj, yj = bounds[j].get('lng', 0), bounds[j].get('lat', 0)

        if ((yi > lat) != (yj > lat)) and (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i

    return inside
