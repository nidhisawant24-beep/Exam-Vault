"""
RSA-2048 Asymmetric Key & Cipher Management Module
Implements RSA key generation, PEM serialization/loading, and RSA-OAEP encryption/decryption.
Used in the hybrid cryptosystem to protect symmetric AES session keys.
"""
import os
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Hash import SHA256

DEFAULT_KEY_SIZE = 2048

def generate_rsa_keypair(key_size: int = DEFAULT_KEY_SIZE):
    """
    Generate a new RSA keypair (private and public).
    Returns (private_pem_bytes, public_pem_bytes).
    """
    key = RSA.generate(key_size)
    private_pem = key.export_key('PEM')
    public_pem = key.publickey().export_key('PEM')
    return private_pem, public_pem

def ensure_keypair_files(private_path: str, public_path: str, key_size: int = DEFAULT_KEY_SIZE):
    """
    Ensure RSA key files exist on disk. Generates and persists them if not present.
    """
    os.makedirs(os.path.dirname(private_path), exist_ok=True)
    os.makedirs(os.path.dirname(public_path), exist_ok=True)
    
    if not os.path.exists(private_path) or not os.path.exists(public_path):
        private_pem, public_pem = generate_rsa_keypair(key_size)
        with open(private_path, 'wb') as f:
            f.write(private_pem)
        with open(public_path, 'wb') as f:
            f.write(public_pem)
        return private_pem, public_pem
    
    with open(private_path, 'rb') as f:
        private_pem = f.read()
    with open(public_path, 'rb') as f:
        public_pem = f.read()
    return private_pem, public_pem

def encrypt_with_rsa_public(data: bytes, public_key_pem: bytes) -> bytes:
    """
    Encrypt data (e.g. 32-byte AES key) using RSA-OAEP with SHA-256 and recipient's public key.
    """
    recipient_key = RSA.import_key(public_key_pem)
    cipher_rsa = PKCS1_OAEP.new(recipient_key, hashAlgo=SHA256)
    encrypted_data = cipher_rsa.encrypt(data)
    return encrypted_data

def decrypt_with_rsa_private(encrypted_data: bytes, private_key_pem: bytes) -> bytes:
    """
    Decrypt data previously encrypted with encrypt_with_rsa_public using RSA-OAEP with SHA-256.
    """
    private_key = RSA.import_key(private_key_pem)
    cipher_rsa = PKCS1_OAEP.new(private_key, hashAlgo=SHA256)
    try:
        decrypted_data = cipher_rsa.decrypt(encrypted_data)
        return decrypted_data
    except Exception as e:
        raise ValueError(f"RSA decryption failed: {str(e)}")

def bytes_to_b64(data: bytes) -> str:
    """Helper to convert bytes to base64 string."""
    return base64.b64encode(data).decode('utf-8')

def b64_to_bytes(b64_str: str) -> bytes:
    """Helper to convert base64 string to bytes."""
    return base64.b64decode(b64_str.encode('utf-8'))
