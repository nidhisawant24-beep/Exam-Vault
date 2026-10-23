"""
Audit Logging and Compliance Routes Module
Provides paginated query access and CSV forensic export for administrative oversight.
"""
import io
import csv
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt
from database.models import AuditLog

audit_bp = Blueprint('audit_bp', __name__)

@audit_bp.route('', methods=['GET'])
@jwt_required()
def get_audit_logs():
    """Retrieve audit logs with optional filtering."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    limit = int(request.args.get('limit', 100))
    action_filter = request.args.get('action')
    status_filter = request.args.get('status')
    
    query = AuditLog.query
    if action_filter:
        query = query.filter(AuditLog.action.ilike(f"%{action_filter}%"))
    if status_filter:
        query = query.filter_by(status=status_filter.upper())
        
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return jsonify({'logs': [l.to_dict() for l in logs]}), 200

@audit_bp.route('/export-csv', methods=['GET'])
@jwt_required()
def export_audit_logs_csv():
    """Export all audit records as a CSV forensic report."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Admin access required'}), 403
        
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Timestamp (UTC)', 'User', 'Role', 'IP Address', 'Action', 'Status', 'Details'])
    
    for log in logs:
        writer.writerow([
            log.id,
            log.timestamp.isoformat() if log.timestamp else '',
            log.user,
            log.role,
            log.ip_address,
            log.action,
            log.status,
            log.details or ''
        ])
        
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=ExamVault_Audit_Report.csv'}
    )
