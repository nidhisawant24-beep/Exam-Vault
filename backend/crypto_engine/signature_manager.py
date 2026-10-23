"""
Digital Signature Module
Implements RSA PKCS#1 v1.5 with SHA-256 digital signature generation and verification.
Guarantees non-repudiation, authenticity of the examination paper author (Admin/University Controller),
and data integrity.
"""
import base64
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256

def sign_data(data: bytes, private_key_pem: bytes) -> bytes:
    """
    Sign raw data using RSA-SHA256 (PKCS#1 v1.5).
    First computes SHA-256 hash, then signs it using the signer's RSA private key.
    Returns raw binary signature.
    """
    key = RSA.import_key(private_key_pem)
    digest = SHA256.new(data)
    signature = pkcs1_15.new(key).sign(digest)
    return signature

def sign_hash_hex(sha256_hex: str, private_key_pem: bytes) -> str:
    """
    Convenience method: Sign an existing SHA-256 hex string and return base64-encoded signature.
    """
    key = RSA.import_key(private_key_pem)
    hash_bytes = bytes.fromhex(sha256_hex)
    digest = SHA256.new()
    # Populate the digest with the hash bytes or use SHA256.new(raw_data)
    # To ensure standardized PKCS1_v1.5 verification, sign directly on raw data or digest
    signature = pkcs1_15.new(key).sign(SHA256.new(bytes.fromhex(sha256_hex)))
    return base64.b64encode(signature).decode('utf-8')

def sign_data_b64(data: bytes, private_key_pem: bytes) -> str:
    """Sign data and return base64 encoded signature string."""
    sig_bytes = sign_data(data, private_key_pem)
    return base64.b64encode(sig_bytes).decode('utf-8')

def verify_signature(data: bytes, signature_bytes: bytes, public_key_pem: bytes) -> bool:
    """
    Verify RSA-SHA256 digital signature against raw data and signer's RSA public key.
    Returns True if valid, False otherwise.
    """
    try:
        key = RSA.import_key(public_key_pem)
        digest = SHA256.new(data)
        pkcs1_15.new(key).verify(digest, signature_bytes)
        return True
    except (ValueError, TypeError):
        return False

def verify_signature_b64(data: bytes, signature_b64: str, public_key_pem: bytes) -> bool:
    """
    Verify RSA-SHA256 digital signature given as base64 string against raw data.
    """
    try:
        signature_bytes = base64.b64decode(signature_b64.encode('utf-8'))
        return verify_signature(data, signature_bytes, public_key_pem)
    except Exception:
        return False
