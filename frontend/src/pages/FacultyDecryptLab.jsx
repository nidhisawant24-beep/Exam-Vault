import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosClient';
import SecurePdfViewer from '../components/SecurePdfViewer';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  RefreshCw,
  Hash,
  ArrowLeft,
  Flame
} from 'lucide-react';

const FacultyDecryptLab = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [simulateTamper, setSimulateTamper] = useState(false);

  // Verification results
  const [verificationResult, setVerificationResult] = useState(null);
  const [tamperError, setTamperError] = useState('');
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  useEffect(() => {
    const fetchPaper = async () => {
      setLoading(true);
      try {
        const res = await api.get('/papers');
        const found = res.data.papers.find((p) => String(p.id) === String(id));
        if (found) {
          setPaper(found);
        } else {
          alert('Question paper not found.');
          navigate('/faculty/exams');
        }
      } catch (err) {
        console.error('Error fetching paper:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaper();
  }, [id, navigate]);

  const handleExecuteVerification = async () => {
    setVerifying(true);
    setVerificationResult(null);
    setTamperError('');

    try {
      const res = await api.post(`/papers/${id}/verify-and-decrypt`, {
        simulate_tamper: simulateTamper,
      });
      setVerificationResult(res.data);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error) {
        setTamperError(errData.error);
      } else {
        setTamperError('Verification pipeline failed. Unknown server error.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadEncrypted = async () => {
    if (!paper) return;
    try {
      const response = await api.get(`/papers/${paper.id}/download-encrypted`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${paper.paper_code}_${paper.filename}.enc`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download encrypted package.');
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Top back navigation */}
      <div>
        <Link
          to="/faculty/exams"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Question Papers</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs">
                {paper?.paper_code}
              </span>
              <span className="text-xs text-slate-500">
                Duration: {paper?.duration_mins} mins
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {paper?.subject}
            </h1>
          </div>

          <button
            onClick={handleDownloadEncrypted}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Download Encrypted .enc File</span>
          </button>
        </div>
      </div>

      {/* Tamper Simulation Toggle Switch (Microproject Feature Highlight!) */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900 dark:text-amber-200">
              Demonstration Mode: Simulate Ciphertext Tampering
            </h3>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5 max-w-xl">
              Turn this ON to inject bit corruption into the encrypted payload. This demonstrates how RSA Digital Signatures and SHA-256 immediately detect tampering.
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={simulateTamper}
            onChange={(e) => {
              setSimulateTamper(e.target.checked);
              setVerificationResult(null);
              setTamperError('');
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
          <span className="ml-3 text-xs font-bold text-amber-950 dark:text-amber-200">
            {simulateTamper ? 'CORRUPTION INJECTED' : 'NORMAL (VALID)'}
          </span>
        </label>
      </div>

      {/* Cryptographic Execution Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Cryptographic Integrity & Decryption Terminal
          </h2>
          <p className="text-xs text-slate-500">
            Executes 4-phase cryptographic validation: RSA key unwrapping, AES decryption, digital signature verification, and SHA-256 hash comparison.
          </p>
        </div>

        {/* 4 Pipeline Stages Status */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">PHASE 1</span>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">RSA-2048 OAEP</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Decrypt AES session key</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">PHASE 2</span>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">AES-256-CBC</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Decrypt PDF payload</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">PHASE 3</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">RSA Signature</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Verify author authenticity</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
            <span className="text-[10px] font-mono text-slate-400 block mb-1">PHASE 4</span>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">SHA-256 Hash</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Verify bit-level integrity</p>
          </div>

        </div>

        {/* Action Trigger Button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleExecuteVerification}
            disabled={verifying}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-3 transition ${
              simulateTamper
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            } disabled:opacity-50`}
          >
            {verifying ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running Cryptographic Engine...</span>
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5" />
                <span>{simulateTamper ? 'Execute Corrupted Decryption (Tamper Test)' : 'Decrypt & Verify Authenticity'}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* TAMPERING DETECTED ALERT BANNER */}
      {tamperError && (
        <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 text-rose-950 dark:text-rose-100 shadow-xl animate-in zoom-in-95">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-rose-700 dark:text-rose-300">
                  Tampering Detected
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 font-bold text-[10px] uppercase font-mono">
                  SECURITY ALERT
                </span>
              </div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-200 mt-1">
                {tamperError}
              </p>
              <div className="mt-3 p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 border border-rose-200 dark:border-rose-900">
                <span className="text-rose-500 font-bold block mb-1">FORENSIC AUDIT RECORD:</span>
                • Action: TAMPERING_DETECTED recorded with client IP.<br />
                • Access to decrypted examination paper BLOCKED.<br />
                • Cryptographic digest or signature did not match institutional authority.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS VERIFICATION BANNER */}
      {verificationResult?.verified && (
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xl animate-in zoom-in-95 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200">
                Cryptographic Integrity 100% Verified!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                The examination paper is authentic, signed by the Controller of Examinations, and contains zero byte alterations.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-400 block mb-0.5">RSA DIGITAL SIGNATURE:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">VALID & AUTHENTICATED</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-400 block mb-0.5">SHA-256 HASH INTEGRITY:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">EXACT MATCH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowPdfViewer(true)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
            >
              <Eye className="w-4 h-4" />
              <span>Open Secure PDF Viewer</span>
            </button>
          </div>
        </div>
      )}

      {/* Embedded Secure PDF Viewer Modal */}
      {showPdfViewer && verificationResult?.pdf_base64 && (
        <SecurePdfViewer
          pdfBase64={verificationResult.pdf_base64}
          paper={paper}
          verificationSteps={verificationResult.verification_steps}
          onClose={() => setShowPdfViewer(false)}
        />
      )}

    </div>
  );
};

export default FacultyDecryptLab;
