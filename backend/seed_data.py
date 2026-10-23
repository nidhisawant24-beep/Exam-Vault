"""
Database Seeding Script for ExamVault
Generates initial Admin, Faculty accounts, realistic examination PDF files using ReportLab,
executes the full Hybrid Cryptographic pipeline on them, and saves encrypted vault packages.
"""
import io
import os
import uuid
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

from app import create_app
from database.db import db
from database.models import User, QuestionPaper, AuditLog
from crypto_engine import (
    generate_aes_key,
    encrypt_bytes_aes,
    encrypt_with_rsa_public,
    calculate_sha256_hex,
    sign_data_b64,
    bytes_to_b64,
    generate_rsa_keypair
)

def generate_sample_pdf(title: str, course_code: str, date_str: str) -> bytes:
    """Generate a clean, official-looking university examination PDF in memory."""
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header Banner
    p.setFillColor(colors.HexColor("#1e3a8a"))  # Navy Blue
    p.rect(0, height - 80, width, 80, fill=True, stroke=False)
    
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2.0, height - 35, "METROPOLITAN UNIVERSITY OF TECHNOLOGY")
    p.setFont("Helvetica", 11)
    p.drawCentredString(width / 2.0, height - 55, "OFFICE OF THE CONTROLLER OF EXAMINATIONS • CONFIDENTIAL")
    
    # Metadata Block
    p.setFillColor(colors.HexColor("#1e293b"))
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, height - 120, f"COURSE: {course_code} - {title.upper()}")
    
    p.setFont("Helvetica", 10)
    p.drawString(50, height - 140, f"Exam Session: {date_str}  |  Duration: 3 Hours  |  Max Marks: 100")
    p.drawString(50, height - 155, "Instructions: Answer all questions in Section A and any four from Section B.")
    
    p.setStrokeColor(colors.HexColor("#cbd5e1"))
    p.setLineWidth(1)
    p.line(50, height - 165, width - 50, height - 165)
    
    # Section A
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 190, "SECTION A (Short Answer Questions - 20 Marks)")
    
    p.setFont("Helvetica", 10)
    questions_a = [
        "Q1. Define the Shannon criteria for perfect secrecy. Explain how One-Time Pad fulfills it.",
        "Q2. Contrast the computational complexities of AES-256 and RSA-2048 key exchange.",
        "Q3. How does PKCS#1 v1.5 padding protect against Bleichenbacher attack vectors?",
        "Q4. Explain the avalanche effect in cryptographic hash functions with reference to SHA-256.",
        "Q5. Differentiate between Symmetric Key Wrap and Asymmetric Key Encapsulation (KEM)."
    ]
    y = height - 215
    for q in questions_a:
        p.drawString(60, y, q)
        y -= 25
        
    # Section B
    y -= 10
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "SECTION B (Long Answer & Design Questions - 80 Marks)")
    y -= 25
    
    questions_b = [
        "Q6. (20 Marks) Design an end-to-end Hybrid Cryptosystem for confidential multi-recipient distribution.",
        "    Detail the session key derivation, IV selection, and digital certificate trust chain.",
        "Q7. (20 Marks) Mathematical Analysis of RSA Key Generation and Modular Inversion.",
        "    Given primes p = 61 and q = 53, compute n, Euler totient phi(n), choose e = 17, and find private key d.",
        "Q8. (20 Marks) Describe the anatomy of a Time-Locked Cryptographic Vault with Digital Signatures.",
        "    How does non-repudiation prevent insider tampering during examination packaging?"
    ]
    for q in questions_b:
        p.drawString(60, y, q)
        y -= 22
        
    # Security Watermark Footer
    p.setFont("Helvetica-Oblique", 9)
    p.setFillColor(colors.HexColor("#64748b"))
    p.drawCentredString(width / 2.0, 40, "EXAMVAULT CRYPTOGRAPHIC INTEGRITY VERIFIED • END OF QUESTION PAPER")
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer.getvalue()

def seed_database():
    app = create_app()
    with app.app_context():
        print("[ExamVault Seeder] Initializing database seeding...")
        db.create_all()
        
        # Load Admin Keys
        with open(app.config['ADMIN_PRIVATE_KEY_PATH'], 'rb') as f:
            admin_priv_pem = f.read()
        with open(app.config['ADMIN_PUBLIC_KEY_PATH'], 'rb') as f:
            admin_pub_pem = f.read()
            
        # 1. Create Default Admin User
        admin = User.query.filter_by(email='admin@examvault.edu').first()
        if not admin:
            admin = User(
                name='Examination Controller (Admin)',
                email='admin@examvault.edu',
                role='admin',
                department='University Examination Board',
                rsa_public_key=admin_pub_pem.decode('utf-8'),
                rsa_private_key=admin_priv_pem.decode('utf-8'),
                is_active=True
            )
            admin.set_password('Admin@123')
            db.session.add(admin)
            print(" -> Created Admin user: admin@examvault.edu (Password: Admin@123)")
        else:
            print(" -> Admin user already exists.")
            
        # 2. Create Default Faculty Users
        faculty_samples = [
            {
                'name': 'Dr. Alan Turing',
                'email': 'faculty@examvault.edu',
                'department': 'Computer Engineering',
                'password': 'Faculty@123',
                'phone': None
            },
            {
                'name': 'Prof. Claude Shannon',
                'email': 'shannon@examvault.edu',
                'department': 'Information Technology',
                'password': 'Faculty@123',
                'phone': None
            },
            {
                'name': 'Dr. Ronald Rivest',
                'email': 'rivest@examvault.edu',
                'department': 'Cybersecurity',
                'password': 'Faculty@123',
                'phone': None
            },
            {
                'name': 'Nidhi Sawant',
                'email': 'sawantnidhi677@gmail.com',
                'department': 'Computer Engineering',
                'password': '12345678',
                'phone': '8104211805'
            }
        ]
        
        for item in faculty_samples:
            fac = User.query.filter_by(email=item['email']).first()
            if not fac:
                priv_k, pub_k = generate_rsa_keypair(2048)
                fac = User(
                    name=item['name'],
                    email=item['email'],
                    phone=item.get('phone'),
                    role='faculty',
                    department=item['department'],
                    rsa_public_key=pub_k.decode('utf-8'),
                    rsa_private_key=priv_k.decode('utf-8'),
                    is_approved=True,
                    approval_status='APPROVED',
                    is_active=True
                )
                fac.set_password(item['password'])
                db.session.add(fac)
                print(f" -> Created Faculty: {item['email']} (Password: {item['password']})")
            else:
                fac.is_approved = True
                fac.approval_status = 'APPROVED'
                fac.is_active = True
                if item.get('phone'):
                    fac.phone = item['phone']
                fac.set_password(item['password'])
                
        db.session.commit()
        
        # 3. Seed Sample Question Papers with Real Cryptographic Vaulting
        now = datetime.utcnow()
        sample_papers = [
            {
                'subject': 'Cryptography & Network Security',
                'paper_code': 'CS801',
                'filename': 'CS801_Cryptography_Final.pdf',
                'exam_datetime': now - timedelta(hours=1),  # Past / Started -> ACCESSIBLE NOW!
                'duration_mins': 180
            },
            {
                'subject': 'Distributed Systems & Cloud Computing',
                'paper_code': 'IT702',
                'filename': 'IT702_Cloud_Midterm.pdf',
                'exam_datetime': now - timedelta(minutes=15),  # Started 15m ago -> ACCESSIBLE NOW!
                'duration_mins': 120
            },
            {
                'subject': 'Advanced Artificial Intelligence',
                'paper_code': 'CS803',
                'filename': 'CS803_AI_Final_Confidential.pdf',
                'exam_datetime': now + timedelta(days=2),  # Future -> TIME-LOCKED (ACCESS DENIED)
                'duration_mins': 180
            },
            {
                'subject': 'Embedded Systems & IoT Security',
                'paper_code': 'EC604',
                'filename': 'EC604_IoT_Security.pdf',
                'exam_datetime': now + timedelta(hours=6),  # Future -> TIME-LOCKED (ACCESS DENIED)
                'duration_mins': 180
            }
        ]
        
        encrypted_dir = app.config['ENCRYPTED_FILES_DIR']
        os.makedirs(encrypted_dir, exist_ok=True)
        
        for sp in sample_papers:
            existing = QuestionPaper.query.filter_by(paper_code=sp['paper_code']).first()
            if existing:
                print(f" -> Paper {sp['paper_code']} already exists. Skipping.")
                continue
                
            # Generate Real PDF
            pdf_bytes = generate_sample_pdf(sp['subject'], sp['paper_code'], sp['exam_datetime'].strftime('%Y-%m-%d %H:%M UTC'))
            
            # Step 1: SHA-256
            sha256_hash = calculate_sha256_hex(pdf_bytes)
            
            # Step 2: Digital Signature
            sig_b64 = sign_data_b64(pdf_bytes, admin_priv_pem)
            
            # Step 3: Random AES-256 Key
            aes_key = generate_aes_key()
            
            # Step 4: AES-256 Encrypt PDF
            enc_pdf = encrypt_bytes_aes(pdf_bytes, aes_key)
            
            # Step 5: RSA-OAEP Encrypt AES Key
            enc_aes_key = encrypt_with_rsa_public(aes_key, admin_pub_pem)
            enc_key_b64 = bytes_to_b64(enc_aes_key)
            
            # Step 6: Save encrypted file
            enc_filename = f"{uuid.uuid4().hex}_{sp['filename']}.enc"
            with open(os.path.join(encrypted_dir, enc_filename), 'wb') as f:
                f.write(enc_pdf)
                
            paper = QuestionPaper(
                subject=sp['subject'],
                paper_code=sp['paper_code'],
                filename=sp['filename'],
                encrypted_filename=enc_filename,
                encrypted_key=enc_key_b64,
                sha256_hash=sha256_hash,
                digital_signature=sig_b64,
                exam_datetime=sp['exam_datetime'],
                duration_mins=sp['duration_mins'],
                uploaded_by='admin@examvault.edu'
            )
            db.session.add(paper)
            print(f" -> Vaulted encrypted paper: {sp['paper_code']} - {sp['subject']}")
            
        # Initial Audit Log
        init_log = AuditLog(
            user='SYSTEM',
            role='admin',
            action='DATABASE_INITIALIZED',
            status='SUCCESS',
            details='ExamVault cryptographic engine initialized with default secure seed assets.',
            ip_address='127.0.0.1'
        )
        db.session.add(init_log)
        db.session.commit()
        
        print("\n=======================================================")
        print(" SEEDING COMPLETED SUCCESSFULLY!")
        print(" Default Accounts:")
        print("   Admin:   admin@examvault.edu   | Password: Admin@123")
        print("   Faculty: faculty@examvault.edu | Password: Faculty@123")
        print("=======================================================\n")

if __name__ == '__main__':
    seed_database()
