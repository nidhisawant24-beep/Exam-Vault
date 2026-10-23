"""
Admin Management and Analytics Routes Module
Provides system metrics, monthly distribution charts, faculty user CRUD,
self-registration approval workflows, and security oversight.
"""
from datetime import datetime, date
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy import func
from database.db import db
from database.models import User, QuestionPaper, AuditLog
from crypto_engine.rsa_manager import generate_rsa_keypair
from services.audit_service import record_audit, get_client_ip

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    """
    Returns high-level system statistics and chart aggregations for the Admin Dashboard:
    - Total Faculty
    - Total Papers
    - Upcoming Exams
    - Today's Exams
    - Pending Registration Approvals
    - Papers Uploaded Per Month
    - Subject Distribution
    - Security Activity Summary
    """
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    today_end = datetime(now.year, now.month, now.day, 23, 59, 59)
    
    total_faculty = User.query.filter_by(role='faculty', is_approved=True).count()
    total_papers = QuestionPaper.query.count()
    upcoming_exams = QuestionPaper.query.filter(QuestionPaper.exam_datetime > now).count()
    todays_exams = QuestionPaper.query.filter(
        QuestionPaper.exam_datetime >= today_start,
        QuestionPaper.exam_datetime <= today_end
    ).count()
    
    # Count pending self-registrations awaiting Admin approval
    pending_approvals = User.query.filter_by(approval_status='PENDING').count()
    
    # Subject Distribution
    subject_counts = db.session.query(
        QuestionPaper.subject,
        func.count(QuestionPaper.id)
    ).group_by(QuestionPaper.subject).all()
    
    subject_distribution = [
        {'subject': s[0], 'count': s[1]} for s in subject_counts
    ]
    
    # Monthly Upload Trends
    monthly_counts = db.session.query(
        func.strftime('%Y-%m', QuestionPaper.upload_date).label('month'),
        func.count(QuestionPaper.id)
    ).group_by('month').order_by('month').all()
    
    monthly_uploads = [
        {'month': m[0] or 'Recent', 'count': m[1]} for m in monthly_counts
    ]
    
    if not monthly_uploads:
        monthly_uploads = [{'month': now.strftime('%Y-%m'), 'count': total_papers}]
        
    # Activity Breakdown
    tamper_alerts = AuditLog.query.filter(AuditLog.action.like('%TAMPER%')).count()
    login_events = AuditLog.query.filter(AuditLog.action.like('%LOGIN%')).count()
    timelock_blocks = AuditLog.query.filter(AuditLog.action.like('%TIMELOCK%')).count()
    
    return jsonify({
        'total_faculty': total_faculty,
        'total_papers': total_papers,
        'upcoming_exams': upcoming_exams,
        'todays_exams': todays_exams,
        'pending_approvals': pending_approvals,
        'subject_distribution': subject_distribution,
        'monthly_uploads': monthly_uploads,
        'security_summary': {
            'tamper_alerts': tamper_alerts,
            'login_events': login_events,
            'timelock_blocks': timelock_blocks
        }
    }), 200

# ==========================================
# REGISTRATION APPROVAL WORKFLOW ENDPOINTS
# ==========================================

@admin_bp.route('/pending-registrations', methods=['GET'])
@jwt_required()
def list_pending_registrations():
    """Retrieve all users waiting for Administrator approval."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403

    pending_users = User.query.filter_by(approval_status='PENDING').order_by(User.created_at.desc()).all()
    return jsonify({'pending': [u.to_dict() for u in pending_users]}), 200

@admin_bp.route('/pending-registrations/<int:user_id>/approve', methods=['POST'])
@jwt_required()
def approve_registration(user_id):
    """
    Admin Endpoint:
    Approves a self-registered user.
    Generates personal RSA-2048 PKI keypair and enables login permission.
    """
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    if user.approval_status == 'APPROVED':
        return jsonify({'message': 'User is already approved.'}), 200

    # Ensure user has RSA keypair
    if not user.rsa_public_key or not user.rsa_private_key:
        priv_pem, pub_pem = generate_rsa_keypair(2048)
        user.rsa_public_key = pub_pem.decode('utf-8')
        user.rsa_private_key = priv_pem.decode('utf-8')

    user.is_approved = True
    user.approval_status = 'APPROVED'
    user.is_active = True
    db.session.commit()

    record_audit(
        user=claims.get('email', 'admin'),
        role='admin',
        action='REGISTRATION_APPROVED',
        status='SUCCESS',
        details=f"Admin approved registration for {user.email} ({user.name}) - PKI keys generated.",
        ip_address=get_client_ip()
    )

    return jsonify({
        'message': f'Registration for {user.name} ({user.email}) has been APPROVED! They may now log in.',
        'user': user.to_dict()
    }), 200

@admin_bp.route('/pending-registrations/<int:user_id>/reject', methods=['POST'])
@jwt_required()
def reject_registration(user_id):
    """
    Admin Endpoint:
    Rejects a self-registration request.
    """
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    user.is_approved = False
    user.approval_status = 'REJECTED'
    user.is_active = False
    db.session.commit()

    record_audit(
        user=claims.get('email', 'admin'),
        role='admin',
        action='REGISTRATION_REJECTED',
        status='SUCCESS',
        details=f"Admin rejected registration request for {user.email} ({user.name}).",
        ip_address=get_client_ip()
    )

    return jsonify({
        'message': f'Registration for {user.email} has been REJECTED.',
        'user': user.to_dict()
    }), 200

# ==========================================
# FACULTY ROSTER MANAGEMENT
# ==========================================

@admin_bp.route('/faculty', methods=['GET'])
@jwt_required()
def list_faculty():
    """List all registered and approved faculty members."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    faculty_list = User.query.filter_by(role='faculty').order_by(User.created_at.desc()).all()
    return jsonify({'faculty': [f.to_dict() for f in faculty_list]}), 200

@admin_bp.route('/faculty', methods=['POST'])
@jwt_required()
def create_faculty():
    """Admin manually provisions a new faculty member with generated RSA Keypair."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip().replace(' ', '').replace('-', '')
    password = data.get('password', '').strip()
    department = data.get('department', 'Computer Engineering').strip()
    
    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'A user with this email already exists'}), 400

    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({'error': 'A user with this phone already exists'}), 400
        
    # Generate personal RSA keypair for faculty
    priv_pem, pub_pem = generate_rsa_keypair(2048)
    
    new_user = User(
        name=name,
        email=email,
        phone=phone or None,
        role='faculty',
        department=department,
        is_approved=True,
        approval_status='APPROVED',
        rsa_public_key=pub_pem.decode('utf-8'),
        rsa_private_key=priv_pem.decode('utf-8'),
        is_active=True
    )
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    record_audit(
        user=claims.get('email', 'admin'),
        role='admin',
        action='FACULTY_CREATED',
        status='SUCCESS',
        details=f"Created faculty account for {email} ({name})",
        ip_address=get_client_ip()
    )
    
    return jsonify({
        'message': f'Faculty member {name} registered successfully',
        'faculty': new_user.to_dict()
    }), 201

@admin_bp.route('/faculty/<int:faculty_id>/toggle-status', methods=['PUT'])
@jwt_required()
def toggle_faculty_status(faculty_id):
    """Enable or disable faculty user account."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    faculty = User.query.get_or_404(faculty_id)
    if faculty.role != 'faculty':
        return jsonify({'error': 'Cannot alter non-faculty user status'}), 400
        
    faculty.is_active = not faculty.is_active
    db.session.commit()
    
    status_str = "activated" if faculty.is_active else "deactivated"
    record_audit(
        user=claims.get('email', 'admin'),
        role='admin',
        action='FACULTY_STATUS_TOGGLED',
        status='SUCCESS',
        details=f"Account for {faculty.email} was {status_str}",
        ip_address=get_client_ip()
    )
    
    return jsonify({
        'message': f"Faculty account {faculty.email} {status_str}",
        'is_active': faculty.is_active
    }), 200

@admin_bp.route('/faculty/<int:faculty_id>', methods=['DELETE'])
@jwt_required()
def delete_faculty(faculty_id):
    """Delete a faculty user account."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    faculty = User.query.get_or_404(faculty_id)
    if faculty.role != 'faculty':
        return jsonify({'error': 'Cannot delete administrator account'}), 400
        
    email = faculty.email
    db.session.delete(faculty)
    db.session.commit()
    
    record_audit(
        user=claims.get('email', 'admin'),
        role='admin',
        action='FACULTY_DELETED',
        status='SUCCESS',
        details=f"Deleted faculty user {email}",
        ip_address=get_client_ip()
    )
    
    return jsonify({'message': f'Faculty {email} deleted successfully'}), 200
