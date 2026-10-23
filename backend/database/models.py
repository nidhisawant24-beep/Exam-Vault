"""
Database Models for ExamVault
Defines User, QuestionPaper, and AuditLog tables.
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database.db import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='faculty')  # 'admin' or 'faculty'
    department = db.Column(db.String(100), default='Computer Engineering')
    
    # Registration approval state (Admin approval required for self-registered users)
    is_approved = db.Column(db.Boolean, default=True)
    approval_status = db.Column(db.String(20), default='APPROVED')  # 'APPROVED', 'PENDING', 'REJECTED'
    
    # OTP Authentication Fields
    otp = db.Column(db.String(6), nullable=True)
    otp_expiry = db.Column(db.DateTime, nullable=True)
    
    # RSA Keypair for hybrid crypto
    rsa_public_key = db.Column(db.Text, nullable=True)
    rsa_private_key = db.Column(db.Text, nullable=True)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self, include_keys: bool = False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'department': self.department,
            'is_approved': self.is_approved,
            'approval_status': self.approval_status,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_keys:
            data['rsa_public_key'] = self.rsa_public_key
            data['rsa_private_key'] = self.rsa_private_key
        return data


class QuestionPaper(db.Model):
    __tablename__ = 'question_papers'
    
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(150), nullable=False)
    paper_code = db.Column(db.String(50), nullable=False)
    filename = db.Column(db.String(255), nullable=False)  # Original filename (e.g. CS801_Midterm.pdf)
    encrypted_filename = db.Column(db.String(255), nullable=False)  # Stored .enc file
    
    # Cryptographic Metadata
    encrypted_key = db.Column(db.Text, nullable=False)  # Base64 string of RSA-encrypted AES key
    sha256_hash = db.Column(db.String(64), nullable=False)  # Hex digest of original PDF
    digital_signature = db.Column(db.Text, nullable=False)  # Base64 string of RSA signature
    
    # Schedule & Audit
    exam_datetime = db.Column(db.DateTime, nullable=False, index=True)
    duration_mins = db.Column(db.Integer, default=180)
    uploaded_by = db.Column(db.String(120), nullable=False)  # Admin email or name
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Target faculty assignment (optional: None means all verified faculty in department)
    target_faculty_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    target_faculty = db.relationship('User', foreign_keys=[target_faculty_id])
    
    def is_accessible(self) -> bool:
        """Returns True if current UTC time is greater than or equal to exam_datetime."""
        return datetime.utcnow() >= self.exam_datetime

    def to_dict(self):
        now = datetime.utcnow()
        can_access = now >= self.exam_datetime
        time_diff_seconds = (self.exam_datetime - now).total_seconds()
        
        return {
            'id': self.id,
            'subject': self.subject,
            'paper_code': self.paper_code,
            'filename': self.filename,
            'encrypted_filename': self.encrypted_filename,
            'encrypted_key': self.encrypted_key,
            'sha256_hash': self.sha256_hash,
            'digital_signature': self.digital_signature,
            'exam_datetime': self.exam_datetime.isoformat(),
            'duration_mins': self.duration_mins,
            'uploaded_by': self.uploaded_by,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'target_faculty_id': self.target_faculty_id,
            'is_accessible': can_access,
            'seconds_until_exam': max(0, int(time_diff_seconds))
        }


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(120), nullable=False)  # Email or "SYSTEM" / "ANONYMOUS"
    role = db.Column(db.String(20), nullable=False, default='unknown')
    action = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='SUCCESS')
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user,
            'role': self.role,
            'action': self.action,
            'status': self.status,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
