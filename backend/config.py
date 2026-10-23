import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    # Flask Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'examvault-super-secure-cryptographic-master-key-2026')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-vault-token-signature-secret-key-98765')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f"sqlite:///{os.path.join(BASE_DIR, 'database', 'examvault.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Storage Paths
    KEYS_DIR = os.path.join(BASE_DIR, 'keys')
    ENCRYPTED_FILES_DIR = os.path.join(BASE_DIR, 'encrypted_files')
    UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
    LOGS_DIR = os.path.join(BASE_DIR, 'logs')
    
    # RSA Key Paths
    ADMIN_PRIVATE_KEY_PATH = os.path.join(KEYS_DIR, 'admin_private.pem')
    ADMIN_PUBLIC_KEY_PATH = os.path.join(KEYS_DIR, 'admin_public.pem')
    
    # Mail / OTP Configuration (Real Email via Gmail / Outlook SMTP)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USE_SSL = os.environ.get('MAIL_USE_SSL', 'false').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', 'sawantnidhi677@gmail.com')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', 'ckrdbhsvdgbdfjoh').replace(' ', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'sawantnidhi677@gmail.com')
    
    # SMS / Phone OTP Configuration (Real SMS via Fast2SMS or Twilio)
    FAST2SMS_API_KEY = os.environ.get('FAST2SMS_API_KEY', None)
    TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', None)
    TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', None)
    TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', None)
    
    # Fallback to dev OTP if SMTP credentials are missing
    SIMULATE_EMAIL_OTP = os.environ.get('SIMULATE_EMAIL_OTP', 'true').lower() in ['true', 'on', '1']
    
    # Max file upload size (32MB)
    MAX_CONTENT_LENGTH = 32 * 1024 * 1024
