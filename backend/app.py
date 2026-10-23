"""
ExamVault Backend Main Application Entrypoint
Flask REST API configured with SQLAlchemy, JWT, Flask-Mail, CORS, and Hybrid Cryptography.
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database.db import db
from database.models import User, QuestionPaper, AuditLog
from services.otp_service import mail
from crypto_engine.rsa_manager import ensure_keypair_files
from routes.auth_routes import auth_bp
from routes.paper_routes import paper_bp
from routes.admin_routes import admin_bp
from routes.audit_routes import audit_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for React frontend (default: localhost:5173 and all local dev ports)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize Extensions
    db.init_app(app)
    jwt = JWTManager(app)
    mail.init_app(app)
    
    # Ensure working directories exist
    os.makedirs(app.config['KEYS_DIR'], exist_ok=True)
    os.makedirs(app.config['ENCRYPTED_FILES_DIR'], exist_ok=True)
    os.makedirs(app.config['UPLOADS_DIR'], exist_ok=True)
    os.makedirs(app.config['LOGS_DIR'], exist_ok=True)
    
    # Ensure Master Admin RSA Keypair exists on startup
    with app.app_context():
        ensure_keypair_files(
            app.config['ADMIN_PRIVATE_KEY_PATH'],
            app.config['ADMIN_PUBLIC_KEY_PATH'],
            key_size=2048
        )
        db.create_all()
        
    # Register API Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(paper_bp, url_prefix='/api/papers')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(audit_bp, url_prefix='/api/audit-logs')
    
    # Security Headers Middleware
    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        return response
        
    # Health Check Endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'ExamVault Cryptographic Backend',
            'version': '1.0.0',
            'crypto_engine': 'AES-256 + RSA-2048 + SHA-256'
        }), 200
        
    # Custom JWT Error Handlers
    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({'error': 'Authorization token is missing', 'message': error_string}), 401
        
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({'error': 'Invalid authorization token', 'message': error_string}), 401
        
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Session expired. Please log in again.'}), 401
        
    # Serve React Frontend (when built for unified single-service deployment)
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    if os.path.exists(frontend_dist):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_frontend(path):
            file_path = os.path.join(frontend_dist, path)
            if path != '' and os.path.exists(file_path):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, 'index.html')
        
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
