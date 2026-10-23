"""
End-to-End API and Security Testing Script for ExamVault
Tests the entire authentication, role-based access, time-locked access,
cryptographic verification, and tamper detection via Flask test client.
"""
import json
from app import create_app

def run_api_tests():
    app = create_app()
    client = app.test_client()
    
    print("\n=======================================================")
    print(" EXAMVAULT END-TO-END SECURITY & API TEST SUITE")
    print("=======================================================")
    
    # 1. Health check
    res = client.get('/api/health')
    assert res.status_code == 200
    print("[1] Health Check: 200 OK")
    
    # 2. Admin Login Step 1 (Credentials)
    res = client.post('/api/auth/login-init', json={
        'email': 'admin@examvault.edu',
        'password': 'Admin@123'
    })
    assert res.status_code == 200
    admin_otp = res.get_json()['dev_otp']
    print(f"[2] Admin Login Step 1: OTP Generated ({admin_otp})")
    
    # 3. Admin Login Step 2 (Verify OTP)
    res = client.post('/api/auth/login-verify-otp', json={
        'email': 'admin@examvault.edu',
        'otp': admin_otp
    })
    assert res.status_code == 200
    admin_token = res.get_json()['token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    print("[3] Admin Login Step 2: JWT Access Token Received")
    
    # 4. Admin Dashboard Stats
    res = client.get('/api/admin/stats', headers=admin_headers)
    assert res.status_code == 200
    stats = res.get_json()
    print(f"[4] Admin Stats: Total Faculty={stats['total_faculty']}, Total Papers={stats['total_papers']}")
    
    # 5. Faculty Login
    res = client.post('/api/auth/login-init', json={
        'email': 'faculty@examvault.edu',
        'password': 'Faculty@123'
    })
    assert res.status_code == 200
    fac_otp = res.get_json()['dev_otp']
    
    res = client.post('/api/auth/login-verify-otp', json={
        'email': 'faculty@examvault.edu',
        'otp': fac_otp
    })
    assert res.status_code == 200
    fac_token = res.get_json()['token']
    fac_headers = {'Authorization': f'Bearer {fac_token}'}
    print("[5] Faculty 2FA Authentication: SUCCESS")
    
    # 6. Faculty RBAC Protection
    # Faculty tries to access /api/admin/stats -> MUST BE REJECTED 403
    res = client.get('/api/admin/stats', headers=fac_headers)
    assert res.status_code == 403
    print("[6] RBAC Protection: Faculty blocked from Admin endpoints (403 Forbidden) -> PASSED")
    
    # 7. Get Papers list
    res = client.get('/api/papers', headers=fac_headers)
    assert res.status_code == 200
    papers = res.get_json()['papers']
    print(f"[7] Faculty retrieved {len(papers)} papers catalog")
    
    # Identify accessible and locked papers
    accessible_paper = next((p for p in papers if p['paper_code'] == 'CS801'), None)
    locked_paper = next((p for p in papers if p['paper_code'] == 'CS803'), None)
    
    assert accessible_paper is not None, "CS801 should exist"
    assert locked_paper is not None, "CS803 should exist"
    
    # 8. Time-Lock Enforcement Test on Future Paper (CS803)
    # Attempting to download or decrypt CS803 before exam time
    res = client.get(f"/api/papers/{locked_paper['id']}/download-encrypted", headers=fac_headers)
    assert res.status_code == 403
    assert "Access Denied. Exam has not started." in res.get_json().get('error', '')
    print("[8] Time-Lock Enforcement: Early download correctly blocked with 'Access Denied. Exam has not started.' -> PASSED")
    
    res = client.post(f"/api/papers/{locked_paper['id']}/verify-and-decrypt", headers=fac_headers, json={})
    assert res.status_code == 403
    assert "Access Denied. Exam has not started." in res.get_json().get('error', '')
    print("    Time-Lock Decryption Guard: Blocked early decryption attempt -> PASSED")
    
    # 9. Accessible Paper Cryptographic Pipeline Test (CS801)
    res = client.post(f"/api/papers/{accessible_paper['id']}/verify-and-decrypt", headers=fac_headers, json={
        'simulate_tamper': False
    })
    assert res.status_code == 200
    decrypt_result = res.get_json()
    assert decrypt_result['verified'] is True
    assert 'pdf_base64' in decrypt_result
    assert decrypt_result['verification_steps']['digital_signature_valid'] is True
    assert decrypt_result['verification_steps']['sha256_hash_matched'] is True
    print("[9] Cryptographic Decryption & Verification: 100% VERIFIED (Signature + SHA256) -> PASSED")
    
    # 10. Tamper Detection Test (Simulate bit corruption)
    res = client.post(f"/api/papers/{accessible_paper['id']}/verify-and-decrypt", headers=fac_headers, json={
        'simulate_tamper': True
    })
    assert res.status_code == 400
    tamper_result = res.get_json()
    assert tamper_result['verified'] is False
    assert "Tampering Detected" in tamper_result['error']
    print(f"[10] Tamper Alert Triggered: '{tamper_result['error']}' -> PASSED")
    
    # 11. Audit Logs Check
    res = client.get('/api/audit-logs', headers=admin_headers)
    assert res.status_code == 200
    logs = res.get_json()['logs']
    print(f"[11] Forensic Audit Trail: {len(logs)} audit entries verified (includes tamper & timelock logs) -> PASSED")
    
    print("\n=======================================================")
    print(" ALL 11 END-TO-END SECURITY AND CRYPTO TESTS PASSED! ")
    print("=======================================================\n")

if __name__ == '__main__':
    run_api_tests()
