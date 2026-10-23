import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import {
  BookOpenCheck,
  CalendarClock,
  ShieldCheck,
  Lock,
  ArrowRight,
  FileKey,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await api.get('/papers');
        setPapers(res.data.papers || []);
      } catch (err) {
        console.error('Failed to load papers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const accessibleCount = papers.filter((p) => p.is_accessible).length;
  const upcomingCount = papers.filter((p) => !p.is_accessible).length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-semibold">
              Authorized Faculty Terminal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Faculty Member'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
            Department: {user?.department || 'Computer Engineering'} • Cryptographic Role: FACULTY
          </p>
        </div>

        <Link
          to="/faculty/exams"
          className="px-6 py-3 rounded-2xl bg-white text-blue-900 font-bold text-sm shadow-lg hover:bg-blue-50 transition flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <BookOpenCheck className="w-5 h-5 text-blue-600" />
          <span>Access Examination Vault</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Accessible Papers (Active)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {accessibleCount}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Exam start time reached • Decryption unlocked
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Time-Locked Exams
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
            {upcomingCount}
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Strictly time-locked until scheduled start time
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              PKI Keypair Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
            RSA-2048 Ready
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Certified for hybrid AES key unwrapping
          </p>
        </div>

      </div>

      {/* Active Examination Schedule Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upcoming & Active Examination Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Live countdown clocks and cryptographic verification status
            </p>
          </div>
          <Link
            to="/faculty/exams"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Papers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading scheduled exams...
          </div>
        ) : papers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No examination papers currently assigned to your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {papers.slice(0, 4).map((paper) => (
              <div
                key={paper.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {paper.paper_code}
                    </span>
                    <CountdownTimer examDate={paper.exam_datetime} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                    {paper.subject}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mb-4">
                    Exam Date: {new Date(paper.exam_datetime).toUTCString()}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  {paper.is_accessible ? (
                    <Link
                      to={`/faculty/decrypt/${paper.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify & Decrypt Paper</span>
                    </Link>
                  ) : (
                    <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      <span>Access Denied. Exam has not started.</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default FacultyDashboard;
