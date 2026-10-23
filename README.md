# ExamVault – Secure Question Paper Distribution & Access System Using Hybrid Cryptography

**ExamVault** is an enterprise-grade academic security platform designed for universities to securely store, distribute, and access confidential examination question papers using a **Hybrid Cryptography Architecture** (AES-256 + RSA-2048 + SHA-256 + Digital Signatures), Role-Based Access Control (RBAC), Multi-Factor OTP verification, and Time-Locked Access Controls.

Developed as a **Computer Engineering Cryptography Microproject**.

---

## 🔐 Cryptographic Architecture Overview

```
                               +-----------------------------------+
                               |        EXAMVAULT ARCHITECTURE     |
                               +-----------------------------------+

     ADMIN WORKFLOW (Upload & Encrypt)
     ==================================
     [Original PDF]
           │
           ├───> SHA-256 Hashing ─────────> [Original SHA-256 Hash]
           │                                         │
           │                                  Admin RSA Private Key
           │                                         ▼
           │                                [Digital Signature]
           ▼
     Generate Random AES-256 Key (32 bytes)
           │
           ├───> AES-256-CBC Encrypt ─────> [Encrypted PDF File]
           │
     Institution / Faculty RSA Public Key
           ▼
     RSA-OAEP Encrypt AES Key ────────────> [Encrypted AES Key]
           │
           ▼
     STORE IN VAULT / DATABASE:
     (Encrypted File, Encrypted Key, SHA-256 Hash, Digital Signature, Exam Date & Time)


     FACULTY WORKFLOW (Time-Locked Access & Decrypt)
     ================================================
     Faculty Login -> OTP Verified -> Select Exam Paper
           │
     Check `current_time >= exam_datetime`:
           ├── NO  ──> [ACCESS DENIED: "Access Denied. Exam has not started."]
           └── YES ──> Proceed to Cryptographic Pipeline
           │
     1. RSA-OAEP Decrypt [Encrypted AES Key] with Faculty/Admin Private Key -> [Plain AES Key]
     2. AES-256 Decrypt [Encrypted PDF] using [Plain AES Key] -> [Decrypted PDF in Memory]
     3. Verify Digital Signature against Admin RSA Public Key & Hash -> [Signature Valid/Invalid]
     4. Calculate SHA-256 Hash of Decrypted PDF & compare with stored Hash -> [Integrity Check]
           │
           ├── MISMATCH ──> [ALERT: "Tampering Detected! Cryptographic hash mismatch."]
           └── MATCH    ──> [VERIFIED: Launch Secure PDF Viewer with Security Watermark]
```

### 1. Symmetric File Encryption (AES-256-CBC)
- Generates a single-use cryptographically random 256-bit (32 bytes) key using OS entropy (`Crypto.Random.get_random_bytes`).
- Encrypts large PDF files in Cipher Block Chaining (CBC) mode with PKCS#7 padding and a unique 16-byte random Initialization Vector (IV).

### 2. Asymmetric Key Encapsulation (RSA-2048 OAEP)
- Protects the 32-byte AES symmetric key from interception by encrypting it with the recipient's RSA-2048 public key using Optimal Asymmetric Encryption Padding (OAEP) with SHA-256.

### 3. Bit-Level File Integrity (SHA-256)
- Computes a 256-bit hash fingerprint of the original PDF. The **Avalanche Effect** ensures that altering even a single byte produces a completely different hash digest.

### 4. Non-Repudiation & Authenticity (Digital Signatures)
- The Controller of Examinations signs the hash digest using their RSA-2048 private key (PKCS#1 v1.5). Anyone can verify that the paper genuinely originated from the authorized examination controller.

### 5. Time-Based Access Control (TBAC)
- Strict server-side UTC timestamp checks reject download or decryption requests before the scheduled examination start time, returning:
  `"Access Denied. Exam has not started."`

### 6. Interactive Tamper Detection Demonstration
- The Faculty Decryption Lab includes a **"Simulate Tampering"** switch that deliberately flips ciphertext bits before decryption. The system immediately halts and displays:
  `"Tampering Detected"`

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, React Router v7, Axios, Recharts, Lucide React
- **Backend**: Python 3.14 Flask REST API, Flask-SQLAlchemy (SQLite), Flask-JWT-Extended, Flask-Cors, Flask-Mail
- **Cryptography Suite**: `pycryptodome`, `cryptography`, `hashlib`, `hmac`
- **PDF Generation**: `reportlab`

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Python 3.10+ installed
- Node.js v18+ and npm installed

### One-Click Startup (Windows)
Double-click:
```bat
start_all.bat
```
This automatically starts both the Flask backend on port `5000` and the React frontend on port `5173`.

---

### Manual Startup

#### 1. Backend Setup
```bash
cd backend
# Activate virtual environment
venv\Scripts\activate

# Install dependencies (already installed)
pip install -r requirements.txt

# Seed database with sample accounts and encrypted exam papers
python seed_data.py

# Start Flask server
python app.py
```
Backend runs at: `http://127.0.0.1:5000`

#### 2. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🔑 Default Seeded Credentials

| Role | Email | Password | OTP Mode |
|---|---|---|---|
| **Admin (Controller)** | `admin@examvault.edu` | `Admin@123` | Displayed on screen & logged in terminal |
| **Faculty (Dr. Alan Turing)** | `faculty@examvault.edu` | `Faculty@123` | Displayed on screen & logged in terminal |
| **Faculty (Dr. Claude Shannon)**| `shannon@examvault.edu` | `Faculty@123` | Displayed on screen & logged in terminal |
| **Faculty (Dr. Ronald Rivest)** | `rivest@examvault.edu` | `Faculty@123` | Displayed on screen & logged in terminal |

*Note: In development mode, the OTP code is displayed right inside the login assistant banner and logged to the server terminal for effortless evaluation.*

---

## 🧪 Demonstration & Viva Walkthrough Guide

### Step 1: Admin Workflow
1. Navigate to `http://localhost:5173/login`.
2. Click **"👑 Controller (Admin)"** to auto-fill credentials.
3. Submit and click the auto-fill OTP code to complete 2FA login.
4. **Admin Dashboard**: Inspect live statistics cards, curriculum subject pie charts, and monthly upload histograms.
5. **Upload & Encrypt Paper**: Go to "Upload & Encrypt Paper", select a PDF, enter Course Code (e.g., `CS901`), and observe the 5-phase cryptographic animation in real time.
6. **Vaulted Papers**: Click "Vaulted Papers" and click the **Eye icon** on any paper to inspect its raw SHA-256 fingerprint, RSA-wrapped AES key, and digital signature.
7. **Audit Trail**: Open "Forensic Audit Trail" to see real-time immutable security logs and click **"Export Forensic CSV Report"**.

### Step 2: Faculty Time-Lock Enforcement & Decryption Lab
1. Log out from Admin and log in as Faculty (`faculty@examvault.edu` / `Faculty@123`).
2. Go to **"Examination Vault"**.
3. **Time-Lock Demonstration**:
   - Locate paper **CS803 (Advanced Artificial Intelligence)** scheduled for the future.
   - Notice the live countdown clock and the warning banner: `"Access Denied. Exam has not started."`
   - Click it to see the security block dialog.
4. **Valid Decryption Demonstration**:
   - Locate paper **CS801 (Cryptography & Network Security)** which is currently active.
   - Click **"Enter Cryptographic Decryption Vault"**.
   - Click **"Decrypt & Verify Authenticity"**.
   - Watch the 4 validation stages pass: RSA Key Recovery ➔ AES Decryption ➔ Digital Signature Check ➔ SHA-256 Match.
   - Click **"Open Secure PDF Viewer"** to inspect the decrypted question paper with university watermarks!
5. **Tampering Detection Demonstration (Viva Highlight)**:
   - In the Decryption Lab, toggle the **"Demonstration Mode: Simulate Ciphertext Tampering"** switch **ON**.
   - Click **"Execute Corrupted Decryption (Tamper Test)"**.
   - Observe the immediate red alert: **"Tampering Detected: Digital signature verification failed! The paper author cannot be authenticated."**
   - Verify that decrypted access is strictly blocked and the tamper incident is logged in the audit trail.

---

## 📁 Project Directory Structure

```
ExamVault/
├── backend/
│   ├── crypto_engine/          # Cryptographic Algorithms
│   │   ├── aes_cipher.py       # AES-256-CBC Symmetric Cipher & PKCS7
│   │   ├── rsa_manager.py      # RSA-2048 Keypairs & OAEP Padding
│   │   ├── hash_util.py        # SHA-256 Hasher & Constant-Time Compare
│   │   └── signature_manager.py# RSA Digital Signatures (PKCS#1 v1.5)
│   ├── database/               # Database Models & ORM
│   │   ├── db.py               # SQLAlchemy Instance
│   │   ├── models.py           # User, QuestionPaper, AuditLog Models
│   │   └── examvault.db        # SQLite Database File
│   ├── routes/                 # Flask REST API Blueprints
│   │   ├── auth_routes.py      # 2FA Login & JWT Management
│   │   ├── paper_routes.py     # Upload, Encrypt, Decrypt & Tamper Check
│   │   ├── admin_routes.py     # Metrics & Faculty CRUD
│   │   └── audit_routes.py     # Audit Queries & CSV Export
│   ├── services/               # Infrastructure Services
│   │   ├── otp_service.py      # OTP Generator & Flask-Mail Delivery
│   │   └── audit_service.py    # Forensic Event Logger
│   ├── keys/                   # RSA PEM Keys Directory
│   ├── encrypted_files/        # Stored AES-256 Encrypted Question Papers (.enc)
│   ├── logs/                   # Disk Audit Trail (audit.log)
│   ├── config.py               # Configuration & Security Settings
│   ├── app.py                  # Flask Application Entrypoint
│   ├── seed_data.py            # Database & PDF Seeding Script
│   ├── test_crypto.py          # Cryptography Unit Tests
│   ├── test_api.py             # End-to-End API Security Test Suite
│   └── requirements.txt        # Python Dependencies
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios Client with JWT Interceptors
│   │   ├── context/            # AuthContext (2FA, Role, Session Timeout)
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── Navbar.jsx      # Top Header with UTC Clock & Dark Mode
│   │   │   ├── Sidebar.jsx     # Navigation Sidebar & Security Status
│   │   │   ├── ProtectedRoute.jsx # RBAC Route Guard
│   │   │   ├── CountdownTimer.jsx # Live Time-Lock Countdown
│   │   │   ├── CryptoVisualizer.jsx # 5-Stage Animated Pipeline
│   │   │   └── SecurePdfViewer.jsx  # Watermarked In-Browser PDF Preview
│   │   ├── pages/              # View Pages
│   │   │   ├── LoginPage.jsx   # Two-Stage Login & OTP Screen
│   │   │   ├── AdminDashboard.jsx # Admin Charts & Metrics
│   │   │   ├── AdminPaperUpload.jsx # Upload & Crypto Pipeline
│   │   │   ├── AdminPaperList.jsx # Vaulted Papers & Fingerprint Viewer
│   │   │   ├── AdminFacultyManager.jsx # Faculty Roster Management
│   │   │   ├── AdminAuditLogs.jsx # Audit Trail & CSV Export
│   │   │   ├── FacultyDashboard.jsx # Faculty Overview & Schedule
│   │   │   ├── FacultyExams.jsx # Exam Catalog & Time-Lock Enforcement
│   │   │   ├── FacultyDecryptLab.jsx # Decryption & Tamper Test Lab
│   │   │   └── CryptoArchitecture.jsx # Technical Explainer for Viva
│   │   ├── App.jsx             # React Router Configuration
│   │   ├── main.jsx            # React Root
│   │   └── index.css           # Tailwind CSS Theme & Styling
│   ├── package.json            # Node Dependencies
│   └── vite.config.js          # Vite Configuration & Backend Proxy
├── run_backend.bat             # Windows Backend Launcher
├── run_frontend.bat            # Windows Frontend Launcher
├── start_all.bat               # Windows Combined Server Launcher
└── README.md                   # Complete Documentation
```
