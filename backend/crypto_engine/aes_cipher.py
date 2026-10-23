"""
AES-256 Symmetric Cipher Module
Implements AES-256 in CBC mode with PKCS7 padding and cryptographically secure random IV.
Provides key generation, encryption, and decryption routines.
"""
import os
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes

BLOCK_SIZE = 16  # 128-bit block size for AES
KEY_SIZE = 32    # 256-bit key size for AES-256

def generate_aes_key() -> bytes:
    """Generate a cryptographically secure 256-bit (32 bytes) random AES key."""
    return get_random_bytes(KEY_SIZE)

def encrypt_bytes_aes(data: bytes, key: bytes) -> bytes:
    """
    Encrypt arbitrary bytes using AES-256-CBC.
    Prepends a 16-byte random IV to the ciphertext.
    Result: IV (16 bytes) + Ciphertext
    """
    if len(key) != KEY_SIZE:
        raise ValueError(f"AES-256 key must be exactly {KEY_SIZE} bytes (got {len(key)})")
    
    iv = get_random_bytes(BLOCK_SIZE)
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)
    padded_data = pad(data, BLOCK_SIZE)
    ciphertext = cipher.encrypt(padded_data)
    
    # Store IV + Ciphertext together
    return iv + ciphertext

def decrypt_bytes_aes(encrypted_data: bytes, key: bytes) -> bytes:
    """
    Decrypt bytes previously encrypted with encrypt_bytes_aes.
    Extracts the leading 16-byte IV, decrypts ciphertext, and unpads PKCS7.
    """
    if len(key) != KEY_SIZE:
        raise ValueError(f"AES-256 key must be exactly {KEY_SIZE} bytes (got {len(key)})")
    
    if len(encrypted_data) < BLOCK_SIZE:
        raise ValueError("Encrypted data is too short to contain a valid IV")
    
    iv = encrypted_data[:BLOCK_SIZE]
    ciphertext = encrypted_data[BLOCK_SIZE:]
    
    cipher = AES.new(key, AES.MODE_CBC, iv=iv)
    decrypted_padded = cipher.decrypt(ciphertext)
    
    try:
        data = unpad(decrypted_padded, BLOCK_SIZE)
        return data
    except Exception as e:
        raise ValueError(f"AES decryption failed: Invalid padding or corrupted ciphertext ({str(e)})")
