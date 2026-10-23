"""
Authentication Routes Module
Implements Two-Factor Authentication (Password + Time-limited OTP),
Self-Registration with Admin Approval Gate,
Email or Phone Number Login, and Role-Based Access Control.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from database.db import db
from database.models import User
from services.otp_service import send_otp_for_user, verify_user_otp
from services.audit_service import record_audit, get_client_ip

auth_bp = Blueprint('auth_bp', __name__)

def find_user_by_identifier(identifier: str):
    """Lookup user by email address or mobile phone number."""
    clean_id = identifier.strip()
    if '@' in clean_id:
        return User.query.filter_by(email=clean_id.lower()).first()
    
    # Clean phone digits
    clean_phone = clean_id.replace(' ', '').replace('-', '')
    # Try exact match, or stripped +91 match
    user = User.query.filter_by(phone=clean_phone).first()
    if not user and clean_phone.startswith('+91'):
        user = User.query.filter_by(phone=clean_phone[3:]).first()
    if not user and len(clean_phone) == 10:
        user = User.query.filter(User.phone.like(f"%{clean_phone}")).first()
    if not user:
        # Fallback to email in case user entered email without @
        user = User.query.filter_by(email=clean_id.lower()).first()
    return user

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Self-Registration Endpoint:
    Allows faculty/users to register.
    ACCOUNT IS SET TO 'PENDING' APPROVAL BY DEFAULT.
    The user cannot log in until an Administrator approves their registry.
    """
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip().replace(' ', '').replace('-', '')
    password = data.get('password', '').strip()
    department = data.get('department', 'Computer Engineering').strip()
    role = data.get('role', 'faculty').strip().lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required fields.'}), 400

    # Ensure role is valid (default to faculty)
    if role not in ['faculty', 'invigilator']:
        role = 'faculty'

    # Check for existing email
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'A user account with this email address already exists.'}), 400

    # Check for existing phone if provided
    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({'error': 'A user account with this phone number already exists.'}), 400

    # Create user in PENDING state
    new_user = User(
        name=name,
        email=email,
        phone=phone or None,
        role=role,
        department=department,
        is_approved=False,
        approval_status='PENDING',
        is_active=True
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    record_audit(
        user=email,
        role=role,
        action='SELF_REGISTRATION_SUBMITTED',
        status='SUCCESS',
        details=f"New registration request submitted by {name} ({department}). Awaiting Admin Approval.",
        ip_address=get_client_ip()
    )

    return jsonify({
        'message': 'Registration submitted successfully! Your account is currently pending approval by the Examination Controller (Admin). Once approved, you will be able to log in with your email or phone number.',
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login-init', methods=['POST'])
def login_init():
    """
    Step 1 of Authentication:
    Validates user credentials (Email OR Phone number + Password).
    Enforces Admin Approval gate: Rejects pending or unapproved accounts.
    If valid, generates and delivers 6-digit OTP via real Email/SMS or dev fallback.
    """
    data = request.get_json() or {}
    identifier = data.get('identifier') or data.get('email') or ''
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Email / Phone number and password are required.'}), 400

    user = find_user_by_identifier(identifier)
    ip = get_client_ip()

    if not user or not user.check_password(password):
        record_audit(
            user=identifier,
            role='unknown',
            action='LOGIN_FAILED_CREDENTIALS',
            status='FAILED',
            details=f"Invalid password or user not found for {identifier}",
            ip_address=ip
        )
        return jsonify({'error': 'Invalid credentials. Please verify your email/phone and password.'}), 401

    # Check Admin Approval Gate
    if not user.is_approved or user.approval_status != 'APPROVED':
        record_audit(
            user=user.email,
            role=user.role,
            action='LOGIN_BLOCKED_UNAPPROVED',
            status='BLOCKED',
            details=f"User {user.email} attempted login while registration is {user.approval_status}",
            ip_address=ip
        )
        return jsonify({
            'error': 'Access Denied: Your registration is currently PENDING approval by the Examination Controller (Admin). Please wait for administration to approve your account.'
        }), 403

    if not user.is_active:
        record_audit(
            user=user.email,
            role=user.role,
            action='LOGIN_BLOCKED_INACTIVE',
            status='BLOCKED',
            details="Account is suspended or deactivated by Administrator",
            ip_address=ip
        )
        return jsonify({'error': 'Account is inactive or suspended. Contact Administrator.'}), 403

    # Admin Login: Bypass OTP verification (Direct password login)
    if user.role == 'admin':
        additional_claims = {
            'role': user.role,
            'email': user.email,
            'name': user.name,
            'department': user.department
        }
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)

        record_audit(
            user=user.email,
            role=user.role,
            action='ADMIN_DIRECT_LOGIN_SUCCESS',
            status='SUCCESS',
            details="Direct password authentication for Administrator (OTP verification bypassed for Admin)",
            ip_address=ip
        )

        return jsonify({
            'message': 'Admin authentication successful. Access granted.',
            'require_otp': False,
            'role': user.role,
            'token': access_token,
            'user': user.to_dict()
        }), 200

    # For other roles (Faculty, etc.): Dispatch OTP via real Email (SMTP) and/or SMS (Fast2SMS/Twilio)
    otp_result = send_otp_for_user(user)

    record_audit(
        user=user.email,
        role=user.role,
        action='OTP_DISPATCHED',
        status='SUCCESS',
        details=f"OTP dispatched. Email Sent: {otp_result.get('email_sent')}, SMS Sent: {otp_result.get('sms_sent')}",
        ip_address=ip
    )

    response_data = {
        'message': otp_result.get('message', 'OTP dispatched successfully.'),
        'require_otp': True,
        'email': user.email,
        'phone': user.phone,
        'identifier': user.email,
        'role': user.role,
        'email_sent': otp_result.get('email_sent'),
        'sms_sent': otp_result.get('sms_sent')
    }
    if otp_result.get('dev_otp'):
        response_data['dev_otp'] = otp_result['dev_otp']

    return jsonify(response_data), 200

@auth_bp.route('/login-verify-otp', methods=['POST'])
def login_verify_otp():
    """
    Step 2 of Authentication:
    Validates submitted 6-digit OTP.
    Accepts Email OR Phone identifier.
    If valid, issues JWT access token with role claims.
    """
    data = request.get_json() or {}
    identifier = data.get('identifier') or data.get('email') or ''
    otp = data.get('otp', '').strip()

    if not identifier or not otp:
        return jsonify({'error': 'Identifier (email/phone) and OTP code are required.'}), 400

    user = find_user_by_identifier(identifier)
    ip = get_client_ip()

    if not user:
        return jsonify({'error': 'User account not found.'}), 404

    is_valid, msg = verify_user_otp(user, otp)
    if not is_valid:
        record_audit(
            user=user.email,
            role=user.role,
            action='LOGIN_OTP_FAILED',
            status='FAILED',
            details=f"Failed OTP attempt: {msg}",
            ip_address=ip
        )
        return jsonify({'error': msg}), 400

    # Issue JWT Token
    additional_claims = {
        'role': user.role,
        'email': user.email,
        'name': user.name,
        'department': user.department
    }
    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)

    record_audit(
        user=user.email,
        role=user.role,
        action='LOGIN_SUCCESS',
        status='SUCCESS',
        details=f"Successful 2FA login for role: {user.role}",
        ip_address=ip
    )

    return jsonify({
        'message': 'Authentication successful. Access granted.',
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP to registered email/phone."""
    data = request.get_json() or {}
    identifier = data.get('identifier') or data.get('email') or ''

    user = find_user_by_identifier(identifier)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    otp_result = send_otp_for_user(user)
    record_audit(
        user=user.email,
        role=user.role,
        action='OTP_RESENT',
        status='SUCCESS',
        details="OTP re-dispatched upon request.",
        ip_address=get_client_ip()
    )

    response_data = {
        'message': otp_result.get('message', 'New OTP dispatched.'),
        'email_sent': otp_result.get('email_sent'),
        'sms_sent': otp_result.get('sms_sent')
    }
    if otp_result.get('dev_otp'):
        response_data['dev_otp'] = otp_result['dev_otp']

    return jsonify(response_data), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Retrieve authenticated user profile and RSA public key."""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict(include_keys=True)}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required(optional=True)
def logout():
    """Log out current session and record forensic audit trail."""
    claims = get_jwt()
    email = claims.get('email', 'UNKNOWN') if claims else 'UNKNOWN'
    role = claims.get('role', 'UNKNOWN') if claims else 'UNKNOWN'

    record_audit(
        user=email,
        role=role,
        action='USER_LOGOUT',
        status='SUCCESS',
        details="Session terminated by user",
        ip_address=get_client_ip()
    )
    return jsonify({'message': 'Logged out successfully'}), 200
