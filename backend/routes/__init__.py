"""
API Routes Package
"""
from .auth_routes import auth_bp
from .paper_routes import paper_bp
from .admin_routes import admin_bp
from .audit_routes import audit_bp

__all__ = ['auth_bp', 'paper_bp', 'admin_bp', 'audit_bp']
