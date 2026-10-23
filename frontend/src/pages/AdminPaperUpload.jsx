import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import CryptoVisualizer from '../components/CryptoVisualizer';
import {
  UploadCloud,
  FileText,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Hash,
  KeyRound
} from 'lucide-react';

const AdminPaperUpload = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [paperCode, setPaperCode] = useState('');
  const [examDatetime, setExamDatetime] = useState('');
  const [durationMins, setDurationMins] = useState(180);
  const [targetFacultyId, setTargetFacultyId] = useState('');
  const [file, setFile] = useState(null);
  const [facultyList, setFacultyList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [cryptoStep, setCryptoStep] = useState(0);
  const [cryptoStatus, setCryptoStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch faculty list for target assignment
    const loadFaculty = async () => {
      try {
        const res = await api.get('/admin/faculty');
        setFacultyList(res.data.faculty || []);
      } catch (err) {
        console.error('Error fetching faculty roster:', err);
      }
    };
    loadFaculty();

    // Default exam datetime to tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setExamDatetime(tomorrow.toISOString().slice(0, 16));
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only valid PDF (.pdf) documents are permitted.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an examination PDF paper to encrypt.');
      return;
    }

    setError('');
    setLoading(true);
    setCryptoStep(1);
    setCryptoStatus('Calculating SHA-256 Digest...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('paper_code', paperCode);
    formData.append('exam_datetime', new Date(examDatetime).toISOString());
    formData.append('duration_mins', durationMins);
    if (targetFacultyId) {
      formData.append('target_faculty_id', targetFacultyId);
    }

    try {
      // Simulate real visual feedback steps for educational clarity
      setTimeout(() => {
        setCryptoStep(2);
        setCryptoStatus('Signing SHA-256 Hash with Admin RSA Private Key...');
      }, 400);

      setTimeout(() => {
        setCryptoStep(3);
        setCryptoStatus('Generating AES-256 Key & Encrypting Document...');
      }, 800);

      setTimeout(() => {
        setCryptoStep(4);
        setCryptoStatus('Wrapping AES Key with RSA-2048 OAEP Public Key...');
      }, 1200);

      const res = await api.post('/papers/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCryptoStep(5);
      setCryptoStatus('Secure Vault Package Committed!');
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload and encrypt question paper.');
      setCryptoStep(0);
      setCryptoStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload & Encrypt Question Paper
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Applies Hybrid Cryptography (AES-256 + RSA-2048 + SHA-256) and stores time-locked artifact in the vault.
        </p>
      </div>

      {/* Cryptographic Pipeline Status Visualizer */}
      <CryptoVisualizer activeStep={cryptoStep} statusMessage={cryptoStatus} />

      {/* Success Modal / Banner */}
      {result && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-lg text-emerald-950 dark:text-emerald-200">
                Question Paper Encrypted & Vaulted Successfully!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Paper Code: <span className="font-mono font-bold">{result.paper.paper_code}</span> • Subject: {result.paper.subject}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">SHA-256 INTEGRITY DIGEST:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold break-all">
                {result.crypto_details?.sha256_hash}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">DIGITAL SIGNATURE ALGORITHM:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {result.crypto_details?.signature_algorithm}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">SYMMETRIC ENCRYPTION:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                AES-256-CBC (256-bit Session Key)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">TIME-LOCKED SCHEDULE:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {new Date(result.paper.exam_datetime).toUTCString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => navigate('/admin/papers')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
            >
              View Vaulted Papers Catalog
            </button>
            <button
              onClick={() => {
                setResult(null);
                setSubject('');
                setPaperCode('');
                setFile(null);
                setCryptoStep(0);
                setCryptoStatus('');
              }}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-xs font-medium transition"
            >
              Upload Another Paper
            </button>
          </div>
        </div>
      )}

      {/* Upload Form Card */}
      {!result && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Paper Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Course / Paper Code *
              </label>
              <input
                type="text"
                required
                value={paperCode}
                onChange={(e) => setPaperCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS801 or IT702"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Subject Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Subject Title *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Cryptography & Network Security"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Exam Date & Time Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Exam Start Date & Time (Time-Lock Target) *
              </label>
              <input
                type="datetime-local"
                required
                value={examDatetime}
                onChange={(e) => setExamDatetime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Faculty cannot download or decrypt this paper before this exact timestamp.
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Exam Duration (Minutes)
              </label>
              <input
                type="number"
                min="30"
                max="360"
                value={durationMins}
                onChange={(e) => setDurationMins(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Assigned Faculty */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Target Designated Faculty (Optional)
              </label>
              <select
                value={targetFacultyId}
                onChange={(e) => setTargetFacultyId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">All Verified Faculty Members (Open Access)</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.email}) — {f.department}
                  </option>
                ))}
              </select>
            </div>

            {/* PDF File Drag and Drop */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Question Paper Document (PDF Format Only) *
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 sm:p-8 text-center hover:border-blue-500 transition cursor-pointer relative bg-slate-50 dark:bg-slate-800/50">
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB • Ready for AES-256 Encryption</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Click to choose or drag & drop question paper PDF here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Maximum file size: 32 MB • PDF format verified</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 flex items-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Cryptographic Pipeline...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Encrypt & Vault Question Paper</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};

export default AdminPaperUpload;
