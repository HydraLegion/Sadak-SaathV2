"""
Sadak Saathi — Auth API Blueprint
Firebase Authentication (OTP, Email/Password, Google)
"""
from flask import Blueprint, request, jsonify
import firebase_admin.auth as firebase_auth
import firebase_admin.firestore as firestore
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Send OTP to phone number."""
    data = request.get_json()
    phone = data.get('phone')

    if not phone:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Phone number required'}}), 400

    # In production, use Firebase Auth's SMS functionality
    # For MVP, we'll simulate OTP
    try:
        # TODO: Implement actual Firebase OTP
        # from firebase_admin import auth
        # auth.generate_sign_in_with_phone_number(phone, recaptcha_token)

        return jsonify({
            'success': True,
            'data': {
                'message': 'OTP sent successfully',
                'expiresIn': 300  # 5 minutes
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'auth_error', 'message': str(e)}}), 400


@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and return custom token."""
    data = request.get_json()
    phone = data.get('phone')
    otp = data.get('otp')

    if not phone or not otp:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Phone and OTP required'}}), 400

    try:
        # TODO: Implement actual Firebase OTP verification
        # verified_user = auth.verify_phone_number(phone, otp)

        # For MVP, accept any 6-digit OTP
        if len(otp) != 6:
            return jsonify({'success': False, 'error': {'code': 'invalid_otp', 'message': 'Invalid OTP'}}), 401

        # Get or create user in Firestore
        db = firestore.client()
        users = db.collection('users').where('phone', '==', phone).get()

        user_data = None
        if users:
            user_doc = users[0]
            user_data = {'id': user_doc.id, **user_doc.to_dict()}
        else:
            # Create new user
            user_ref = db.collection('users').document()
            user_data = {
                'id': user_ref.id,
                'phone': phone,
                'role': 'citizen',
                'createdAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP,
                'isActive': True
            }
            user_ref.set(user_data)

        # Generate custom token
        # TODO: Use actual Firebase UID
        custom_token = f'mvp_token_{phone}'  # Placeholder

        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                'token': custom_token
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'auth_error', 'message': str(e)}}), 401


@auth_bp.route('/google', methods=['POST'])
def google_auth():
    """Authenticate with Google ID token."""
    data = request.get_json()
    id_token = data.get('idToken')

    if not id_token:
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'ID token required'}}), 400

    try:
        # Verify Google ID token
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name')

        # Create or update user in Firestore
        db = firestore.client()
        user_ref = db.collection('users').document(uid)

        if user_ref.get().exists:
            user_ref.update({
                'lastLoginAt': firestore.SERVER_TIMESTAMP,
                'updatedAt': firestore.SERVER_TIMESTAMP
            })
        else:
            user_ref.set({
                'uid': uid,
                'email': email,
                'displayName': name,
                'role': 'citizen',
                'createdAt': firestore.SERVER_TIMESTAMP,
                'lastLoginAt': firestore.SERVER_TIMESTAMP,
                'isActive': True
            })

        user_data = user_ref.get().to_dict()
        user_data['id'] = uid

        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                'token': id_token
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'auth_error', 'message': str(e)}}), 401


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register with email and password."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('displayName')
    phone = data.get('phone')

    if not all([email, password, display_name, phone]):
        return jsonify({'success': False, 'error': {'code': 'validation_error', 'message': 'Missing required fields'}}), 400

    try:
        # Create user in Firebase Auth
        user = firebase_auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
            phone=phone
        )

        # Create user document in Firestore
        db = firestore.client()
        db.collection('users').document(user.uid).set({
            'uid': user.uid,
            'email': email,
            'displayName': display_name,
            'phone': phone,
            'role': 'citizen',
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'isActive': True
        })

        # Get custom token
        custom_token = firebase_auth.create_custom_token(user.uid).decode('utf-8')

        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'uid': user.uid,
                    'email': email,
                    'displayName': display_name,
                    'phone': phone,
                    'role': 'citizen'
                },
                'token': custom_token
            }
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'registration_error', 'message': str(e)}}), 400


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current authenticated user."""
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'error': {'code': 'unauthorized', 'message': 'Missing token'}}), 401

    token = auth_header.split(' ')[1]

    try:
        # TODO: Verify custom token and get UID
        # decoded = firebase_auth.verify_session_cookie(token)
        # uid = decoded['uid']

        # For MVP, extract UID from token
        uid = token.split('_')[-1] if '_' in token else None

        if not uid:
            return jsonify({'success': False, 'error': {'code': 'invalid_token', 'message': 'Invalid token'}}), 401

        db = firestore.client()
        user_doc = db.collection('users').document(uid).get()

        if not user_doc.exists:
            return jsonify({'success': False, 'error': {'code': 'not_found', 'message': 'User not found'}}), 404

        user_data = {'id': user_doc.id, **user_doc.to_dict()}
        return jsonify({'success': True, 'data': user_data})

    except Exception as e:
        return jsonify({'success': False, 'error': {'code': 'auth_error', 'message': str(e)}}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout user (revoke session)."""
    auth_header = request.headers.get('Authorization')

    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        try:
            # TODO: Revoke session cookie
            # firebase_auth.revoke_refresh_tokens(uid)
            pass
        except Exception as e:
            logger.error(f"Logout error: {e}")

    return jsonify({'success': True, 'data': {'message': 'Logged out successfully'}})
