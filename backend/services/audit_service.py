"""
Security Audit Logging Service
Records system actions, authentication events, access attempts, and tamper alerts.
"""
import os
from datetime import datetime
from flask import request, current_app
from database.db import db
from database.models import AuditLog

def get_client_ip() -> str:
    """Extract client IP handling proxies."""
    if request:
        if request.headers.get('X-Forwarded-For'):
            return request.headers.get('X-Forwarded-For').split(',')[0].strip()
        return request.remote_addr or '127.0.0.1'
    return '127.0.0.1'

def record_audit(user: str, role: str, action: str, status: str = 'SUCCESS', details: str = None, ip_address: str = None) -> AuditLog:
    """
    Persist an audit log record to database and disk file.
    """
    if not ip_address:
        ip_address = get_client_ip()
        
    log_entry = AuditLog(
        user=user,
        role=role,
        action=action,
        status=status,
        details=details,
        ip_address=ip_address,
        timestamp=datetime.utcnow()
    )
    
    try:
        db.session.add(log_entry)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[Audit Log Error] DB insert failed: {e}")
        
    # Also write to local text log for forensic resilience
    try:
        logs_dir = current_app.config.get('LOGS_DIR', os.path.join(os.path.dirname(__file__), '..', 'logs'))
        os.makedirs(logs_dir, exist_ok=True)
        log_file = os.path.join(logs_dir, 'audit.log')
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"[{datetime.utcnow().isoformat()}Z] IP={ip_address} USER={user} ROLE={role} ACTION={action} STATUS={status} DETAILS={details or '-'}\n")
    except Exception as e:
        print(f"[Audit Log Error] Disk write failed: {e}")
        
    return log_entry
