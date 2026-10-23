"""
Services Package
"""
from .otp_service import mail, send_otp_for_user, verify_user_otp
from .audit_service import record_audit, get_client_ip

__all__ = ['mail', 'send_otp_for_user', 'verify_user_otp', 'record_audit', 'get_client_ip']
