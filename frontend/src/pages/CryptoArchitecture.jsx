import React from 'react';
import {
  Shield,
  Key,
  Lock,
  Hash,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  FileCheck2,
  Clock,
  Fingerprint
} from 'lucide-react';

const CryptoArchitecture = () => {
  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Page Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>Computer Engineering Microproject Cryptography Specification</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          ExamVault Hybrid Cryptographic Architecture
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Comprehensive technical blueprint demonstrating the integration of Symmetric Encryption (AES-256), Asymmetric Key Encapsulation (RSA-2048), Cryptographic Digests (SHA-256), and Digital Signatures.
        </p>
      </div>

      {/* Why Hybrid Cryptography Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-blue-400" />
          Why Hybrid Cryptography?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-blue-100/90 leading-relaxed">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white text-sm mb-1.5 text-blue-200">
              The Limitation of Pure RSA
            </h3>
            <p>
              Asymmetric RSA encryption is computationally intensive (modular exponentiation on large primes) and mathematically limited to encrypting data smaller than its modulus size (e.g., 2048 bits ≈ 256 bytes minus padding). It cannot directly encrypt heavy question paper PDFs.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white text-sm mb-1.5 text-blue-200">
              The Limitation of Pure AES
            </h3>
            <p>
              Symmetric AES-256 is blazingly fast and encrypts arbitrary file sizes efficiently, but requires sharing the secret key beforehand. If the secret key is intercepted during transmission to faculty members, the examination confidentiality is completely compromised.
            </p>
          </div>
        </div>
        <p className="text-xs text-blue-200 pt-2 font-mono">
          ✓ <strong>The Hybrid Solution:</strong> AES-256 encrypts the bulk PDF data with a single-use random session key. RSA-2048 (OAEP) encrypts the 32-byte AES session key.
        </p>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: AES-256 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            1. AES-256 Symmetric Encryption (CBC Mode)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Advanced Encryption Standard with a 256-bit key length provides \(2^{256}\) possible keys, making brute-force attacks computationally infeasible even against hypothetical quantum algorithms.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono list-disc list-inside">
            <li>Mode: Cipher Block Chaining (CBC)</li>
            <li>Block Size: 128 bits (16 bytes)</li>
            <li>Initialization Vector (IV): Cryptographically random 16 bytes</li>
            <li>Padding: PKCS#7 Standard</li>
          </ul>
        </div>

        {/* Pillar 2: RSA-2048 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            2. RSA-2048 Asymmetric Key Wrapping (OAEP)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The session key is encapsulated using Optimal Asymmetric Encryption Padding (OAEP) with SHA-256, mathematically shielding the key from chosen-ciphertext and padding oracle attacks.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono list-disc list-inside">
            <li>Key Length: 2048-bit modulus (n = p × q)</li>
            <li>Public Exponent: e = 65537 (Fermat Prime F4)</li>
            <li>Padding Scheme: PKCS#1 OAEP with MGF1</li>
            <li>Encapsulated Payload: 32-byte AES session key</li>
          </ul>
        </div>

        {/* Pillar 3: SHA-256 */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Hash className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            3. SHA-256 Cryptographic Hash Digest
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generates a fixed 256-bit hexadecimal fingerprint of the raw question paper. Due to the Avalanche Effect, altering even a single bit in the PDF completely changes the resulting hash.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono list-disc list-inside">
            <li>Digest Output: 256 bits (64 hex characters)</li>
            <li>Pre-image Resistance: Second pre-image & collision resistant</li>
            <li>Constant-time Comparison: Mitigates timing side-channels</li>
          </ul>
        </div>

        {/* Pillar 4: Digital Signatures */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            4. RSA Digital Signatures (Non-Repudiation)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The Controller of Examinations signs the SHA-256 digest with their private key. Any recipient can verify that the paper originates genuinely from the university authority.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono list-disc list-inside">
            <li>Algorithm: RSA PKCS#1 v1.5 with SHA-256</li>
            <li>Security Property: Authenticity & Non-repudiation</li>
            <li>Tamper Guard: Invalidates instantly upon any modification</li>
          </ul>
        </div>

      </div>

      {/* Access Control & Defense Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-blue-600" />
          Additional Defense-in-Depth Mechanisms
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Time-Locked Access (TBAC)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Enforces strict temporal access control. Faculty downloads and decryption endpoints are gated by server-side UTC timestamps, returning 403 Forbidden before exam start.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Key className="w-4 h-4 text-blue-500" />
              <span>Two-Factor OTP (2FA)</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Generates single-use 6-digit numeric tokens valid for 5 minutes, preventing credential stuffing and unauthorized session hijacks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              <span>Immutable Audit Trail</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              Forensic logging of all login attempts, file uploads, key unwrap actions, and tamper detection events with IP addresses and timestamps.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CryptoArchitecture;
