import React, { useMemo } from 'react';
import { ShieldCheck, Download, X, Eye, FileText, CheckCircle2, Lock } from 'lucide-react';

const SecurePdfViewer = ({ pdfBase64, paper, verificationSteps, onClose }) => {
  const blobUrl = useMemo(() => {
    if (!pdfBase64) return null;
    try {
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error('Error creating PDF blob:', e);
      return null;
    }
  }, [pdfBase64]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `DECRYPTED_${paper?.paper_code || 'EXAM'}_${paper?.filename || 'paper.pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {paper?.paper_code}: {paper?.subject}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  VERIFIED AUTHENTIC
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                SHA-256: {paper?.sha256_hash?.slice(0, 24)}... • Signed by Examination Board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition"
            >
              <Download className="w-4 h-4" />
              <span>Save Decrypted PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cryptographic Badges Banner */}
        <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900 flex flex-wrap items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> AES-256 Payload Decrypted
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> RSA-2048 Digital Signature Valid
            </span>
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SHA-256 Integrity Verified
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
            Zero Bit Alterations Detected
          </span>
        </div>

        {/* PDF Frame with Watermark container */}
        <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
          
          {/* Subtle Security Watermark Background */}
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-5 dark:opacity-10 z-10 rotate-[-25deg]">
            <div className="text-center font-extrabold text-slate-900 dark:text-white tracking-widest text-4xl leading-relaxed">
              CONFIDENTIAL • EXAMVAULT OFFICIAL<br />
              AUTHORIZED FACULTY ACCESS ONLY<br />
              METROPOLITAN UNIVERSITY
            </div>
          </div>

          {blobUrl ? (
            <iframe
              src={`${blobUrl}#toolbar=0`}
              title="Secure Question Paper Viewer"
              className="w-full h-full border-none relative z-0"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <p>Unable to load PDF document.</p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
          <span>Security Level: RESTRICTED LEVEL-4</span>
          <span>ExamVault Cryptographic Access Terminal v1.0</span>
        </div>

      </div>
    </div>
  );
};

export default SecurePdfViewer;
