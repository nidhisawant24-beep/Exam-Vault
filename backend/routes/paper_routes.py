"""
Question Paper Cryptographic Operations and Distribution Routes
Handles PDF upload, AES encryption, RSA hybrid key wrapping, digital signing,
time-locked distribution, tamper verification, and secure PDF delivery.
"""
import os
import uuid
import base64
from datetime import datetime
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from werkzeug.utils import secure_filename
from database.db import db
from database.models import QuestionPaper, User
from crypto_engine import (
    generate_aes_key,
    encrypt_bytes_aes,
    decrypt_bytes_aes,
    encrypt_with_rsa_public,
    decrypt_with_rsa_private,
    calculate_sha256_hex,
    verify_sha256_integrity,
    sign_data_b64,
    verify_signature_b64,
    bytes_to_b64,
    b64_to_bytes
)
from services.audit_service import record_audit, get_client_ip

paper_bp = Blueprint('paper_bp', __name__)

def get_admin_keys():
    """Load Admin RSA keys from disk."""
    priv_path = current_app.config['ADMIN_PRIVATE_KEY_PATH']
    pub_path = current_app.config['ADMIN_PUBLIC_KEY_PATH']
    with open(priv_path, 'rb') as f:
        priv_pem = f.read()
    with open(pub_path, 'rb') as f:
        pub_pem = f.read()
    return priv_pem, pub_pem

@paper_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_question_paper():
    """
    Admin Endpoint:
    Uploads Question Paper PDF and executes full Hybrid Cryptographic Pipeline:
    1. SHA-256 Hashing of original PDF.
    2. Digital Signature creation using Admin RSA Private Key.
    3. Random AES-256 Session Key generation.
    4. AES-256 encryption of PDF file.
    5. RSA-OAEP encryption of AES Key.
    6. Vaulting of encrypted artifacts and metadata.
    """
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Only Administrators can upload question papers'}), 403
        
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Invalid file format: Only PDF files (.pdf) are permitted'}), 400
        
    subject = request.form.get('subject', '').strip()
    paper_code = request.form.get('paper_code', '').strip().upper()
    exam_datetime_str = request.form.get('exam_datetime', '').strip()
    duration_mins = int(request.form.get('duration_mins', 180))
    target_faculty_id = request.form.get('target_faculty_id', None)
    
    if not subject or not paper_code or not exam_datetime_str:
        return jsonify({'error': 'Subject, paper code, and exam datetime are required'}), 400
        
    try:
        exam_datetime = datetime.fromisoformat(exam_datetime_str.replace('Z', '+00:00')).replace(tzinfo=None)
    except Exception as e:
        return jsonify({'error': f'Invalid exam datetime format: {str(e)}'}), 400
        
    # Read original PDF bytes
    original_pdf_bytes = file.read()
    if len(original_pdf_bytes) == 0:
        return jsonify({'error': 'Uploaded file is empty'}), 400
        
    # Load Admin RSA Keys
    admin_priv_pem, admin_pub_pem = get_admin_keys()
    
    # Step 1: Compute SHA-256 Hash
    sha256_hash = calculate_sha256_hex(original_pdf_bytes)
    
    # Step 2: Generate Digital Signature using Admin RSA Private Key
    digital_signature_b64 = sign_data_b64(original_pdf_bytes, admin_priv_pem)
    
    # Step 3: Generate 256-bit AES Key
    aes_key = generate_aes_key()
    
    # Step 4: Encrypt PDF using AES-256-CBC
    encrypted_pdf_bytes = encrypt_bytes_aes(original_pdf_bytes, aes_key)
    
    # Step 5: Encrypt AES Key using Admin RSA Public Key (RSA-OAEP)
    encrypted_aes_key_bytes = encrypt_with_rsa_public(aes_key, admin_pub_pem)
    encrypted_key_b64 = bytes_to_b64(encrypted_aes_key_bytes)
    
    # Step 6: Save Encrypted File to Disk
    encrypted_dir = current_app.config['ENCRYPTED_FILES_DIR']
    os.makedirs(encrypted_dir, exist_ok=True)
    encrypted_filename = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}.enc"
    encrypted_filepath = os.path.join(encrypted_dir, encrypted_filename)
    
    with open(encrypted_filepath, 'wb') as f:
        f.write(encrypted_pdf_bytes)
        
    # Save record in Database
    uploader_email = claims.get('email', 'admin')
    paper = QuestionPaper(
        subject=subject,
        paper_code=paper_code,
        filename=secure_filename(file.filename),
        encrypted_filename=encrypted_filename,
        encrypted_key=encrypted_key_b64,
        sha256_hash=sha256_hash,
        digital_signature=digital_signature_b64,
        exam_datetime=exam_datetime,
        duration_mins=duration_mins,
        uploaded_by=uploader_email,
        target_faculty_id=int(target_faculty_id) if target_faculty_id else None
    )
    db.session.add(paper)
    db.session.commit()
    
    # Log Audit Record
    record_audit(
        user=uploader_email,
        role='admin',
        action='PAPER_UPLOADED',
        status='SUCCESS',
        details=f"Paper: {paper_code} - {subject}. Hash: {sha256_hash[:16]}... Scheduled: {exam_datetime.isoformat()}",
        ip_address=get_client_ip()
    )
    
    return jsonify({
        'message': 'Question paper encrypted and securely stored successfully!',
        'paper': paper.to_dict(),
        'crypto_details': {
            'aes_key_bits': 256,
            'sha256_hash': sha256_hash,
            'signature_algorithm': 'RSA-2048-PKCS1_v1.5-SHA256',
            'encrypted_payload_size': len(encrypted_pdf_bytes),
            'encrypted_key_length': len(encrypted_key_b64)
        }
    }), 201

@paper_bp.route('', methods=['GET'])
@jwt_required()
def get_papers():
    """
    List question papers.
    For Faculty: includes dynamic `is_accessible` calculation and remaining countdown seconds.
    """
    claims = get_jwt()
    user_id = int(get_jwt_identity())
    role = claims.get('role', 'faculty')
    
    if role == 'admin':
        papers = QuestionPaper.query.order_by(QuestionPaper.exam_datetime.asc()).all()
    else:
        # Faculty sees all papers or papers specifically assigned to them
        papers = QuestionPaper.query.filter(
            (QuestionPaper.target_faculty_id == None) | (QuestionPaper.target_faculty_id == user_id)
        ).order_by(QuestionPaper.exam_datetime.asc()).all()
        
    return jsonify({'papers': [p.to_dict() for p in papers]}), 200

@paper_bp.route('/<int:paper_id>/download-encrypted', methods=['GET'])
@jwt_required()
def download_encrypted_paper(paper_id):
    """
    Download raw encrypted (.enc) file.
    Enforces Strict Time-Lock: If user is Faculty and exam has not started,
    returns 403 Forbidden with "Access Denied. Exam has not started."
    """
    claims = get_jwt()
    role = claims.get('role', 'faculty')
    user_email = claims.get('email', 'unknown')
    
    paper = QuestionPaper.query.get_or_404(paper_id)
    ip = get_client_ip()
    
    # Enforce Time-based Access Control for Faculty
    if role == 'faculty' and not paper.is_accessible():
        record_audit(
            user=user_email,
            role='faculty',
            action='DOWNLOAD_BLOCKED_TIMELOCK',
            status='BLOCKED',
            details=f"Unauthorized early download attempt for {paper.paper_code}. Exam starts at {paper.exam_datetime.isoformat()} UTC",
            ip_address=ip
        )
        return jsonify({
            'error': 'Access Denied. Exam has not started.',
            'exam_datetime': paper.exam_datetime.isoformat(),
            'seconds_remaining': paper.to_dict()['seconds_until_exam']
        }), 403
        
    encrypted_filepath = os.path.join(current_app.config['ENCRYPTED_FILES_DIR'], paper.encrypted_filename)
    if not os.path.exists(encrypted_filepath):
        return jsonify({'error': 'Encrypted file not found on vault server'}), 404
        
    record_audit(
        user=user_email,
        role=role,
        action='PAPER_DOWNLOADED_ENCRYPTED',
        status='SUCCESS',
        details=f"Downloaded encrypted package for {paper.paper_code}",
        ip_address=ip
    )
    
    return send_file(
        encrypted_filepath,
        mimetype='application/octet-stream',
        as_attachment=True,
        download_name=f"{paper.paper_code}_{paper.filename}.enc"
    )

@paper_bp.route('/<int:paper_id>/verify-and-decrypt', methods=['POST'])
@jwt_required()
def verify_and_decrypt_paper(paper_id):
    """
    Faculty Access & Decryption Verification Pipeline:
    1. Verify current time >= exam start time.
    2. Decrypt AES Key using RSA-OAEP Private Key.
    3. Decrypt Paper using AES-256.
    4. Verify RSA Digital Signature against Admin Public Key.
    5. Verify SHA-256 Hash of decrypted content against stored hash.
    6. If tamper simulated or hash mismatch -> Return "Tampering Detected".
    7. If verified -> Return decrypted PDF data for secure in-browser viewing.
    """
    claims = get_jwt()
    role = claims.get('role', 'faculty')
    user_email = claims.get('email', 'unknown')
    ip = get_client_ip()
    
    paper = QuestionPaper.query.get_or_404(paper_id)
    
    # Strict Time-Lock Enforcement
    if role == 'faculty' and not paper.is_accessible():
        record_audit(
            user=user_email,
            role='faculty',
            action='DECRYPT_BLOCKED_TIMELOCK',
            status='BLOCKED',
            details=f"Premature decryption attempt blocked for {paper.paper_code}. Exam at {paper.exam_datetime.isoformat()}",
            ip_address=ip
        )
        return jsonify({
            'error': 'Access Denied. Exam has not started.',
            'is_accessible': False,
            'exam_datetime': paper.exam_datetime.isoformat(),
            'seconds_remaining': paper.to_dict()['seconds_until_exam']
        }), 403
        
    data = request.get_json() or {}
    simulate_tamper = data.get('simulate_tamper', False)
    
    encrypted_filepath = os.path.join(current_app.config['ENCRYPTED_FILES_DIR'], paper.encrypted_filename)
    if not os.path.exists(encrypted_filepath):
        return jsonify({'error': 'Vault file not found on storage disk'}), 404
        
    with open(encrypted_filepath, 'rb') as f:
        encrypted_bytes = f.read()
        
    # If simulated tamper requested, inject a single-byte bit flip into ciphertext
    if simulate_tamper:
        mutated = bytearray(encrypted_bytes)
        if len(mutated) > 30:
            mutated[28] ^= 0xAA  # Flip bits
        encrypted_bytes = bytes(mutated)
        
    admin_priv_pem, admin_pub_pem = get_admin_keys()
    
    # Step 1: Decrypt AES session key with RSA Private Key
    try:
        encrypted_key_bytes = b64_to_bytes(paper.encrypted_key)
        recovered_aes_key = decrypt_with_rsa_private(encrypted_key_bytes, admin_priv_pem)
    except Exception as e:
        record_audit(
            user=user_email,
            role=role,
            action='TAMPER_RSA_DECRYPT_FAILURE',
            status='WARNING',
            details=f"RSA Key Decryption failed: {str(e)}",
            ip_address=ip
        )
        return jsonify({
            'verified': False,
            'error': 'Tampering Detected: RSA Key recovery failed or key block corrupted.',
            'step_failed': 'RSA_KEY_DECRYPT'
        }), 400

    # Step 2: Decrypt Ciphertext with AES-256
    try:
        decrypted_pdf_bytes = decrypt_bytes_aes(encrypted_bytes, recovered_aes_key)
    except Exception as e:
        record_audit(
            user=user_email,
            role=role,
            action='TAMPER_AES_DECRYPT_FAILURE',
            status='WARNING',
            details=f"AES Decryption error (padding/integrity failure): {str(e)}",
            ip_address=ip
        )
        return jsonify({
            'verified': False,
            'error': 'Tampering Detected: Ciphertext corruption detected during AES block decryption.',
            'step_failed': 'AES_DECRYPT'
        }), 400

    # Step 3: Verify Digital Signature
    sig_valid = verify_signature_b64(decrypted_pdf_bytes, paper.digital_signature, admin_pub_pem)
    if not sig_valid:
        record_audit(
            user=user_email,
            role=role,
            action='TAMPER_SIGNATURE_INVALID',
            status='WARNING',
            details=f"Digital Signature invalid for {paper.paper_code}",
            ip_address=ip
        )
        return jsonify({
            'verified': False,
            'error': 'Tampering Detected: Digital signature verification failed! The paper author cannot be authenticated.',
            'step_failed': 'DIGITAL_SIGNATURE'
        }), 400

    # Step 4: Verify SHA-256 Hash
    hash_valid = verify_sha256_integrity(decrypted_pdf_bytes, paper.sha256_hash)
    if not hash_valid:
        record_audit(
            user=user_email,
            role=role,
            action='TAMPER_HASH_MISMATCH',
            status='WARNING',
            details=f"SHA-256 hash mismatch for {paper.paper_code}",
            ip_address=ip
        )
        return jsonify({
            'verified': False,
            'error': 'Tampering Detected: SHA-256 digest mismatch. File has been modified or corrupted.',
            'step_failed': 'SHA256_HASH'
        }), 400

    # All verifications successful!
    record_audit(
        user=user_email,
        role=role,
        action='PAPER_DECRYPTED_VERIFIED',
        status='SUCCESS',
        details=f"Successful cryptographic verification & paper access for {paper.paper_code}",
        ip_address=ip
    )
    
    # Encode decrypted PDF to base64 for secure web viewer rendering
    pdf_b64 = base64.b64encode(decrypted_pdf_bytes).decode('utf-8')
    
    return jsonify({
        'verified': True,
        'message': 'Cryptographic integrity verified successfully! Document is authentic.',
        'paper': paper.to_dict(),
        'pdf_base64': pdf_b64,
        'verification_steps': {
            'rsa_key_decrypted': True,
            'aes_payload_decrypted': True,
            'digital_signature_valid': True,
            'sha256_hash_matched': True,
            'calculated_hash': paper.sha256_hash
        }
    }), 200

@paper_bp.route('/<int:paper_id>', methods=['DELETE'])
@jwt_required()
def delete_paper(paper_id):
    """Admin Endpoint: Delete question paper and stored ciphertext."""
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'error': 'Unauthorized: Only Administrators can delete papers'}), 403
        
    paper = QuestionPaper.query.get_or_404(paper_id)
    user_email = claims.get('email', 'admin')
    
    # Remove file from disk
    try:
        encrypted_filepath = os.path.join(current_app.config['ENCRYPTED_FILES_DIR'], paper.encrypted_filename)
        if os.path.exists(encrypted_filepath):
            os.remove(encrypted_filepath)
    except Exception as e:
        print(f"[File Delete Warning]: {e}")
        
    subject = paper.subject
    paper_code = paper.paper_code
    
    db.session.delete(paper)
    db.session.commit()
    
    record_audit(
        user=user_email,
        role='admin',
        action='PAPER_DELETED',
        status='SUCCESS',
        details=f"Deleted paper: {paper_code} - {subject}",
        ip_address=get_client_ip()
    )
    
    return jsonify({'message': f'Paper {paper_code} deleted successfully'}), 200
