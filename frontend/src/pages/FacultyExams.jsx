import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import CountdownTimer from '../components/CountdownTimer';
import {
  BookOpenCheck,
  Lock,
  ShieldCheck,
  Search,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Hash,
  Download
} from 'lucide-react';

const FacultyExams = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deniedModal, setDeniedModal] = useState(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/papers');
      setPapers(res.data.papers || []);
    } catch (err) {
      console.error('Error fetching papers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleAttemptAccess = (paper) => {
    if (!paper.is_accessible) {
      setDeniedModal(paper);
    } else {
      navigate(`/faculty/decrypt/${paper.id}`);
    }
  };

  const filteredPapers = papers.filter(
    (p) =>
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.paper_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Examination Papers Vault
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access confidential question papers protected by time-locks and hybrid cryptographic signatures.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam code or subject..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Grid of Examination Cards */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Retrieving assigned exams from vault...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="p-16 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <BookOpenCheck className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-60" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">No question papers listed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPapers.map((paper) => {
            const isAccessible = paper.is_accessible;

            return (
              <div
                key={paper.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                  isAccessible
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/60'
                    : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  
                  {/* Top bar with paper code and countdown / status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono font-extrabold text-xs">
                      {paper.paper_code}
                    </span>
                    <CountdownTimer
                      examDate={paper.exam_datetime}
                      onExamStarted={fetchPapers}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {paper.subject}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                    Duration: {paper.duration_mins} Minutes • Controller: {paper.uploaded_by}
                  </p>

                  {/* Scheduled time info */}
                  <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 text-xs font-mono space-y-1 mb-5">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>SCHEDULED START:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Date(paper.exam_datetime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>DIGITAL FINGERPRINT:</span>
                      <span className="truncate max-w-[160px] text-emerald-600 dark:text-emerald-400">
                        {paper.sha256_hash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>

                  {/* Access Status Banner */}
                  {!isAccessible && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 mb-4">
                      <Lock className="w-4 h-4 shrink-0 text-rose-600" />
                      <span className="font-semibold">
                        Access Denied. Exam has not started.
                      </span>
                    </div>
                  )}

                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleAttemptAccess(paper)}
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                      isAccessible
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/50 cursor-pointer'
                    }`}
                  >
                    {isAccessible ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Enter Cryptographic Decryption Vault</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Locked • Access Denied. Exam has not started.</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Access Denied Time-Lock Modal */}
      {deniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Access Denied
            </h3>
            <p className="text-rose-600 dark:text-rose-400 font-semibold text-sm mb-4">
              "Access Denied. Exam has not started."
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-mono space-y-2 text-left mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">COURSE:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{deniedModal.paper_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SCHEDULED TIME:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(deniedModal.exam_datetime).toUTCString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">POLICY:</span>
                <span className="text-rose-500 font-bold">TIME-BASED ACCESS CONTROL (TBAC)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              This incident has been logged into the forensic audit trail for security tracking. The decryption key will become available automatically when the exam start time arrives.
            </p>

            <button
              onClick={() => setDeniedModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FacultyExams;
