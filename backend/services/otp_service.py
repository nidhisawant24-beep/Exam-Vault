"""
One-Time Password (OTP) Generation and Real-World Verification Service
Supports:
1. Real Email OTP delivery via Flask-Mail / Gmail SMTP.
2. Real Phone SMS OTP delivery via Fast2SMS / Twilio.
3. Development mode fallback logging for instant zero-config testing.
"""
import secrets
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from flask import current_app
from flask_mail import Mail, Message
from database.db import db
from database.models import User

mail = Mail()

OTP_VALIDITY_MINUTES = 5


def _is_placeholder_value(value):
    """Treat placeholder or demo credentials as unconfigured."""
    if value is None:
        return True

    normalized = str(value).strip()
    if not normalized:
        return True

    lowered = normalized.lower()
    if lowered in {'none', 'null', 'n/a', 'na'}:
        return True
    if lowered.startswith('your_') or lowered.startswith('replace_') or lowered.endswith('_here'):
        return True
    return False


def _smtp_is_configured(app_config) -> bool:
    """Check whether real SMTP credentials are usable."""
    username = app_config.get('MAIL_USERNAME')
    password = app_config.get('MAIL_PASSWORD')
    server = app_config.get('MAIL_SERVER')

    if not server or not username or not password:
        return False
    if _is_placeholder_value(username) or _is_placeholder_value(password):
        return False
    return True


def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    return f"{secrets.randbelow(900000) + 100000:06d}"

def send_sms_fast2sms(api_key: str, phone: str, otp_code: str) -> tuple[bool, str]:
    """Send SMS via Fast2SMS API (Popular in India, free trial credits)."""
    try:
        clean_phone = phone.replace("+91", "").replace(" ", "").replace("-", "").strip()
        if clean_phone.startswith('91') and len(clean_phone) > 10:
            clean_phone = clean_phone[2:]
        if len(clean_phone) == 11 and clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]

        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {
            "authorization": api_key,
            "Content-Type": "application/json"
        }
        data = {
            "variables_values": otp_code,
            "route": "otp",
            "numbers": clean_phone
        }
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            if res_json.get('return'):
                return True, "SMS sent successfully via Fast2SMS"
            return False, str(res_json.get('message', ['Failed']))
    except Exception as e:
        return False, f"Fast2SMS error: {str(e)}"

def send_sms_twilio(account_sid: str, auth_token: str, from_phone: str, to_phone: str, otp_code: str) -> tuple[bool, str]:
    """Send SMS via Twilio REST API."""
    try:
        import base64
        url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
        auth_string = f"{account_sid}:{auth_token}"
        auth_header = f"Basic {base64.b64encode(auth_string.encode('ascii')).decode('ascii')}"
        
        data = urllib.parse.urlencode({
            'To': to_phone,
            'From': from_phone,
            'Body': f"[ExamVault] Your verification OTP code is: {otp_code}. Valid for {OTP_VALIDITY_MINUTES} minutes."
        }).encode('utf-8')
        
        req = urllib.request.Request(url, data=data, headers={'Authorization': auth_header}, method='POST')
        with urllib.request.urlopen(req, timeout=10) as response:
            return True, "SMS sent successfully via Twilio"
    except Exception as e:
        return False, f"Twilio error: {str(e)}"

def send_otp_for_user(user: User) -> dict:
    """
    Generate OTP, save to user with expiration, and dispatch via real Email / SMS.
    Returns status dict without exposing OTP to client.
    Dynamically re-reads backend/.env so newly entered credentials take effect immediately without server restart.
    """
    import os
    from dotenv import load_dotenv
    
    # Dynamically reload .env if user recently edited their passwords
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_file = os.path.join(base_dir, '.env')
    if os.path.exists(env_file):
        load_dotenv(env_file, override=True)
        if 'MAIL_USERNAME' in os.environ:
            current_app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
        if 'MAIL_PASSWORD' in os.environ:
            current_app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
        if 'MAIL_SERVER' in os.environ:
            current_app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
        if 'MAIL_DEFAULT_SENDER' in os.environ:
            current_app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
        if 'FAST2SMS_API_KEY' in os.environ:
            current_app.config['FAST2SMS_API_KEY'] = os.environ.get('FAST2SMS_API_KEY')

    code = generate_otp()
    user.otp = code
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=OTP_VALIDITY_MINUTES)
    db.session.commit()
    
    email_sent = False
    email_error = None
    sms_sent = False
    sms_status = None
    smtp_configured = _smtp_is_configured(current_app.config)

    # 1. Real Email Dispatch (via Gmail / SMTP)
    if user.email and smtp_configured:
        try:
            sender_email = current_app.config.get('MAIL_DEFAULT_SENDER') or current_app.config.get('MAIL_USERNAME')
            msg = Message(
                subject="[ExamVault Security] Your One-Time Password (OTP) Verification Code",
                sender=sender_email,
                recipients=[user.email],
                body=f"""Hello {user.name},

Your ExamVault verification code is: {code}

This code is valid for {OTP_VALIDITY_MINUTES} minutes.
Role: {user.role.upper()}
Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

If you did not request this code, please alert your University Examination Security Administrator immediately.

Regards,
ExamVault Automated Security Engine
"""
            )
            mail.send(msg)
            email_sent = True
            print(f"[OTP Service] Successfully sent real email to: {user.email}")
        except Exception as e:
            email_error = str(e)
            print(f"[OTP Service] Flask-Mail sending error: {email_error}")
    elif user.email:
        email_error = "Gmail App Password not set in backend/.env"
        print(f"[OTP Service] Email delivery skipped for {user.email}: {email_error}")

    # 2. Real SMS Dispatch (via Fast2SMS or Twilio)
    if user.phone:
        fast2sms_key = current_app.config.get('FAST2SMS_API_KEY')
        twilio_sid = current_app.config.get('TWILIO_ACCOUNT_SID')
        twilio_token = current_app.config.get('TWILIO_AUTH_TOKEN')
        twilio_phone = current_app.config.get('TWILIO_PHONE_NUMBER')
        
        if fast2sms_key and not _is_placeholder_value(fast2sms_key):
            sms_sent, sms_status = send_sms_fast2sms(fast2sms_key, user.phone, code)
            print(f"[OTP Service SMS Fast2SMS] To: {user.phone} -> Result: {sms_status}")
        elif twilio_sid and twilio_token and twilio_phone:
            sms_sent, sms_status = send_sms_twilio(twilio_sid, twilio_token, twilio_phone, user.phone, code)
            print(f"[OTP Service SMS Twilio] To: {user.phone} -> Result: {sms_status}")
        else:
            sms_status = "Fast2SMS API key not set in backend/.env"
            print(f"[OTP Service SMS] Skipped for {user.phone}: {sms_status}")
    
    # 3. Transparent audit log on server terminal
    print(f"\n=======================================================")
    print(f" [OTP DISPATCH] User: {user.name} ({user.email})")
    if user.phone:
        print(f" Mobile Phone: {user.phone}")
    print(f" Email Delivery: {'SENT to ' + user.email if email_sent else ('Failed: ' + str(email_error))}")
    print(f" SMS Delivery: {'SENT to ' + str(user.phone) if sms_sent else ('Status: ' + str(sms_status) if user.phone else 'No phone registered')}")
    print(f" >>> SERVER SECURE AUDIT OTP: {code} <<<")
    print(f" Valid until: {user.otp_expiry.strftime('%H:%M:%S UTC')}")
    print(f"=======================================================\n")
    
    # Build clear human-readable status message for user
    if email_sent and sms_sent:
        message = f"OTP code successfully sent to your Gmail ({user.email}) and mobile phone ({user.phone}) via SMS."
    elif email_sent:
        message = f"OTP code successfully sent to your Gmail ({user.email}). Check your inbox/spam folder."
    elif sms_sent:
        message = f"OTP code successfully sent to your mobile phone ({user.phone}) via SMS."
    else:
        message = (
            "Verification OTP generated. Live email & phone delivery are waiting for your real credentials in backend/.env. "
            "(To test right now, check your VS Code Flask terminal for the 6-digit OTP code)."
        )

    return {
        'success': True,
        'email_sent': email_sent,
        'sms_sent': sms_sent,
        'email_error': email_error,
        'sms_status': sms_status,
        'message': message
    }


def verify_user_otp(user: User, submitted_otp: str) -> tuple[bool, str]:
    """
    Verify submitted OTP against database record and expiration.
    Returns (is_valid, error_message).
    """
    if not user.otp:
        return False, "No active OTP found. Please request a new code."
        
    if not user.otp_expiry or datetime.utcnow() > user.otp_expiry:
        user.otp = None
        user.otp_expiry = None
        db.session.commit()
        return False, "OTP has expired. Please request a new code."
        
    if user.otp.strip() != submitted_otp.strip():
        return False, "Invalid OTP code. Please check and try again."
        
    # Valid OTP -> clear single-use token
    user.otp = None
    user.otp_expiry = None
    db.session.commit()
    return True, "OTP verified successfully."
