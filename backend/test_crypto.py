"""
Automated Cryptographic Engine Verification Test
Tests:
1. AES-256 encryption and decryption of binary payload.
2. RSA-2048 keypair generation and OAEP encryption/decryption of AES key.
3. SHA-256 hashing and integrity verification.
4. RSA Digital Signature creation and verification.
5. Bit-level tampering detection.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from crypto_engine import (
    generate_aes_key,
    encrypt_bytes_aes,
    decrypt_bytes_aes,
    generate_rsa_keypair,
    encrypt_with_rsa_public,
    decrypt_with_rsa_private,
    calculate_sha256_hex,
    verify_sha256_integrity,
    sign_data,
    verify_signature,
    bytes_to_b64,
    b64_to_bytes
)

def run_tests():
    print("==================================================")
    print(" EXAMVAULT CRYPTOGRAPHY SUITE VERIFICATION")
    print("==================================================")
    
    # Sample question paper content
    original_paper_bytes = b"%PDF-1.4 Mock University Examination Paper Content: CS801 Cryptography Q1: Explain AES and RSA."
    print(f"\n[1] Original Data: {len(original_paper_bytes)} bytes")
    
    # 1. SHA-256 Hash
    sha256_hex = calculate_sha256_hex(original_paper_bytes)
    print(f"[2] SHA-256 Hash: {sha256_hex}")
    assert verify_sha256_integrity(original_paper_bytes, sha256_hex) is True
    print("    -> SHA-256 Verification: PASSED")
    
    # 2. RSA Key generation
    priv_pem, pub_pem = generate_rsa_keypair(2048)
    print(f"[3] RSA-2048 Keypair generated (Private: {len(priv_pem)} bytes, Public: {len(pub_pem)} bytes)")
    
    # 3. Digital Signature
    signature = sign_data(original_paper_bytes, priv_pem)
    print(f"[4] Digital Signature created: {len(signature)} bytes")
    sig_valid = verify_signature(original_paper_bytes, signature, pub_pem)
    assert sig_valid is True
    print("    -> Digital Signature Verification: PASSED")
    
    # 4. AES-256 Encryption
    aes_key = generate_aes_key()
    print(f"[5] AES-256 Key generated: {len(aes_key)} bytes ({len(aes_key)*8} bits)")
    encrypted_pdf = encrypt_bytes_aes(original_paper_bytes, aes_key)
    print(f"    -> Encrypted PDF Size: {len(encrypted_pdf)} bytes")
    
    # 5. Hybrid RSA Encryption of AES Key
    encrypted_aes_key = encrypt_with_rsa_public(aes_key, pub_pem)
    print(f"[6] AES Key encrypted with RSA-OAEP: {len(encrypted_aes_key)} bytes")
    
    # 6. Decryption pipeline
    # a. Decrypt AES key with RSA Private Key
    recovered_aes_key = decrypt_with_rsa_private(encrypted_aes_key, priv_pem)
    assert recovered_aes_key == aes_key
    print("[7] Recovered AES Key via RSA: MATCHED")
    
    # b. Decrypt PDF with recovered AES Key
    recovered_pdf = decrypt_bytes_aes(encrypted_pdf, recovered_aes_key)
    assert recovered_pdf == original_paper_bytes
    print("[8] Recovered PDF via AES-256: MATCHED")
    
    # c. Verify integrity of recovered PDF
    assert verify_sha256_integrity(recovered_pdf, sha256_hex) is True
    print("[9] Integrity Hash of Recovered PDF: VERIFIED")
    
    # 7. Tampering Test
    print("\n[10] Testing Tamper Detection...")
    tampered_pdf = bytearray(encrypted_pdf)
    tampered_pdf[25] ^= 0xFF  # Flip bits in ciphertext
    tampered_pdf = bytes(tampered_pdf)
    
    tamper_detected = False
    try:
        decrypted_tampered = decrypt_bytes_aes(tampered_pdf, recovered_aes_key)
        # If decryption somehow succeeded (unlikely with padding), hash MUST fail
        if not verify_sha256_integrity(decrypted_tampered, sha256_hex):
            tamper_detected = True
    except Exception:
        # Expected: Padding or block error
        tamper_detected = True
    
    assert tamper_detected is True
    print("     -> Tamper Test: Successfully detected corruption! [PASSED]")
    
    print("\n==================================================")
    print(" ALL 5 CRYPTOGRAPHIC INTEGRITY TESTS PASSED! ")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
