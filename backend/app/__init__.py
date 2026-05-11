"""
Sadak Saathi — Flask Application Factory
"""
import os
from flask import Flask
from flask_cors import CORS
from celery import Celery


def create_app() -> Flask:
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_VIDEO_SIZE_MB', 500)) * 1024 * 1024

    # CORS
    origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, origins=origins, supports_credentials=True)

    # Initialize extensions
    init_extensions(app)

    # Register blueprints
    register_blueprints(app)

    # Register error handlers
    register_error_handlers(app)

    return app


def init_extensions(app: Flask) -> None:
    """Initialize Flask extensions."""
    # Firebase Admin SDK
    init_firebase()

    # Prometheus metrics
    init_metrics()


def init_firebase() -> None:
    """Initialize Firebase Admin SDK."""
    import firebase_admin
    from firebase_admin import credentials

    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Use default credentials (GCP metadata)
        firebase_admin.initialize_app()


def init_metrics() -> None:
    """Initialize Prometheus metrics."""
    from prometheus_client import make_wsgi_app
    from werkzeug.middleware.dispatcher import DispatcherMiddleware


celery_app = Celery(
    'sadak_saathi',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
)


def register_blueprints(app: Flask) -> None:
    """Register API blueprints."""
    from app.api.auth import auth_bp
    from app.api.upload import upload_bp
    from app.api.detection import detection_bp
    from app.api.potholes import potholes_bp
    from app.api.complaints import complaints_bp
    from app.api.analytics import analytics_bp
    from app.api.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(upload_bp, url_prefix='/api/v1/upload')
    app.register_blueprint(detection_bp, url_prefix='/api/v1/detections')
    app.register_blueprint(potholes_bp, url_prefix='/api/v1/potholes')
    app.register_blueprint(complaints_bp, url_prefix='/api/v1/complaints')
    app.register_blueprint(analytics_bp, url_prefix='/api/v1/analytics')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')


def register_error_handlers(app: Flask) -> None:
    """Register error handlers."""
    from flask import jsonify

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'success': False, 'error': {'code': 'bad_request', 'message': str(error)}}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Unauthorized'}}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'success': False, 'error': {'code': 'forbidden', 'message': 'Forbidden'}}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'Resource not found'}}), 404

    @app.errorhandler(429)
    def rate_limit_exceeded(error):
        return jsonify({'success': False, 'error': {'code': 'rate_limit', 'message': 'Rate limit exceeded'}}), 429

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'success': False, 'error': {'code': 'internal_error', 'message': 'Internal server error'}}), 500
