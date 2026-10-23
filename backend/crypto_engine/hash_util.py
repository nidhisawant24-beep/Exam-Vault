"""
Cryptographic Hashing Utility Module
Implements SHA-256 hashing for file integrity verification and digital fingerprinting.
"""
import hashlib
import hmac

def calculate_sha256_hex(data: bytes) -> str:
    """Calculate the SHA-256 hash of bytes and return lowercase hexadecimal string."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()

def calculate_sha256_bytes(data: bytes) -> bytes:
    """Calculate the SHA-256 hash of bytes and return raw 32 bytes."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.digest()

def verify_sha256_integrity(data: bytes, expected_hash_hex: str) -> bool:
    """
    Verify whether the SHA-256 hash of data matches the expected hash using constant-time comparison
    to avoid timing attacks.
    """
    actual_hash_hex = calculate_sha256_hex(data)
    return hmac.compare_digest(actual_hash_hex.lower(), expected_hash_hex.lower())
