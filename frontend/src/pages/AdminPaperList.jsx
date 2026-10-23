import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import CountdownTimer from '../components/CountdownTimer';
import SecurePdfViewer from '../components/SecurePdfViewer';
import {
  FileKey,
  Search,
  Download,
  Trash2,
  Eye,
  ShieldCheck,
  Hash,
  KeyRound,
  Calendar,
  Clock,
  AlertCircle,
  X,
  BookOpenCheck,
  RefreshCw,
  Info,
  Lock
} from 'lucide-react';

const AdminPaperList = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Decryption & Secure PDF Viewer state
  const [viewingPdf, setViewingPdf] = useState(null);
  const [decryptingId, setDecryptingId] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/papers');
      setPapers(res.data.papers || []);
    } catch (err) {
      setError('Failed to load vaulted question papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDecryptAndView = async (paper) => {
    setDecryptingId(paper.id);
    try {
      const res = await api.post(`/papers/${paper.id}/verify-and-decrypt`, {
        simulate_tamper: false
      });
      if (res.data.verified) {
        setViewingPdf({
          paper: paper,
          pdf_base64: res.data.pdf_base64,
          verification_steps: res.data.verification_steps
        });
      } else {
        alert(res.data.error || 'Decryption failed.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to decrypt question paper.');
    } finally {
      setDecryptingId(null);
    }
  };

  const handleDelete = async (paperId) => {
    try {
      await api.delete(`/papers/${paperId}`);
      setDeleteConfirm(null);
      fetchPapers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete question paper.');
    }
  };

  const handleDownloadEncrypted = async (paper) => {
    try {
      const response = await api.get(`/papers/${paper.id}/download-encrypted`, {
        responseType: 'blob'
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

  const filteredPapers = papers.filter(
    (p) =>
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.paper_code.toLowerCase().includes(search.toLowerCase()) ||
      p.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Vaulted Question Papers
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse encrypted question papers, inspect cryptographic keys, or decrypt and preview readable PDFs.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject or code..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Educational Clarification Banner */}
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
        <div className="space-y-1">
          <p>
            <strong>How Question Paper Access Works:</strong>
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-blue-800 dark:text-blue-300">
            <li>
              Click <strong className="text-emerald-600 dark:text-emerald-400">"Decrypt & View"</strong> to run the full RSA-OAEP + AES-256 decryption pipeline and open the clean, readable question paper with university watermarks.
            </li>
            <li>
              The <strong>Download icon</strong> downloads the raw <strong>AES-256 ciphertext (.enc)</strong> file (unreadable random text on disk), demonstrating bit-level encryption to evaluators.
            </li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Querying cryptographic vault database...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileKey className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-60" />
            <p className="text-sm font-semibold">No question papers found.</p>
            <p className="text-xs text-slate-400 mt-1">Upload an examination PDF to vault it.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Paper Code & Subject</th>
                  <th className="px-6 py-4">Time-Lock Target (Exam Time)</th>
                  <th className="px-6 py-4">Cryptographic Signatures</th>
                  <th className="px-6 py-4">Encrypted Payload</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    
                    {/* Paper info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {paper.paper_code}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {paper.subject}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {paper.filename} • {paper.duration_mins} mins
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Schedule / Countdown */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <CountdownTimer examDate={paper.exam_datetime} />
                        <p className="text-[11px] text-slate-500 font-mono">
                          {new Date(paper.exam_datetime).toLocaleString()}
                        </p>
                      </div>
                    </td>

                    {/* Cryptography details */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <Hash className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate max-w-[140px]" title={paper.sha256_hash}>
                            {paper.sha256_hash.slice(0, 16)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>RSA-2048 Signed</span>
                        </div>
                      </div>
                    </td>

                    {/* Encrypted file name */}
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                      <span className="truncate max-w-[140px] block" title={paper.encrypted_filename}>
                        {paper.encrypted_filename}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* 1. DECRYPT & VIEW READABLE PDF (ADMIN QUICK ACCESS) */}
                        <button
                          onClick={() => handleDecryptAndView(paper)}
                          disabled={decryptingId === paper.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                          title="Decrypt with RSA-2048 and Open Readable PDF"
                        >
                          {decryptingId === paper.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <BookOpenCheck className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">Decrypt & View</span>
                        </button>

                        {/* 2. Inspect Crypto Metadata */}
                        <button
                          onClick={() => setSelectedPaper(paper)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                          title="Inspect Cryptographic Blueprint (Keys & Hashes)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* 3. Download Raw Encrypted Ciphertext */}
                        <button
                          onClick={() => handleDownloadEncrypted(paper)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                          title="Download Raw Encrypted Ciphertext (.enc) for Backup"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* 4. Delete Paper */}
                        <button
                          onClick={() => setDeleteConfirm(paper.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300 transition"
                          title="Delete Paper from Vault"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Secure Decrypted PDF Viewer Modal */}
      {viewingPdf && (
        <SecurePdfViewer
          pdfBase64={viewingPdf.pdf_base64}
          paper={viewingPdf.paper}
          verificationSteps={viewingPdf.verification_steps}
          onClose={() => setViewingPdf(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Delete Question Paper?
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              This action will permanently purge the encrypted binary file and cryptographic signature records from the vault.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/30 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Inspector Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedPaper(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileKey className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Cryptographic Blueprint Inspector
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedPaper.paper_code}: {selectedPaper.subject}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block mb-1 font-bold">1. ORIGINAL SHA-256 HASH FINGERPRINT:</span>
                <span className="text-emerald-600 dark:text-emerald-400 break-all select-all font-semibold">
                  {selectedPaper.sha256_hash}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block mb-1 font-bold">2. RSA-2048 WRAPPED AES KEY (BASE64):</span>
                <span className="text-blue-600 dark:text-blue-400 break-all select-all text-[11px] block max-h-24 overflow-y-auto">
                  {selectedPaper.encrypted_key}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block mb-1 font-bold">3. RSA DIGITAL SIGNATURE (BASE64):</span>
                <span className="text-purple-600 dark:text-purple-400 break-all select-all text-[11px] block max-h-24 overflow-y-auto">
                  {selectedPaper.digital_signature}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1 font-bold">CIPHER SUITE:</span>
                  <span className="text-slate-800 dark:text-slate-200">AES-256-CBC + PKCS7</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1 font-bold">ASYMMETRIC ALGO:</span>
                  <span className="text-slate-800 dark:text-slate-200">RSA-2048 OAEP (SHA-256)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedPaper(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPaperList;
