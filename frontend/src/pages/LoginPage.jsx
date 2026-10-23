import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Lock,
  Unlock,
  Mail,
  Phone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserPlus,
  LogIn,
  Clock,
  Building,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Sun,
  Moon,
  Check,
  FileText,
  Fingerprint,
  Layers,
  Cpu,
  Server,
  X,
  FileCheck,
  GraduationCap,
  Crown,
  Key,
  ExternalLink
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    icon: Lock,
    title: 'AES-256 Encryption',
    desc: 'Symmetric payload confidentiality & zero-leak transit',
    badge: 'AES-256-CBC',
    color: 'from-blue-500/15 via-blue-500/5 to-transparent',
    accent: 'text-blue-600 dark:text-blue-400',
    border: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    delay: '0s',
  },
  {
    icon: Fingerprint,
    title: 'SHA-256 Integrity',
    desc: 'Tamper detection & constant-time hash validation',
    badge: 'Hash Digest',
    color: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    accent: 'text-cyan-600 dark:text-cyan-400',
    border: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
    delay: '0.1s',
  },
  {
    icon: Key,
    title: 'RSA Key Exchange',
    desc: '2048-bit asymmetric key wrapping with RSA-OAEP',
    badge: 'RSA-2048',
    color: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    accent: 'text-indigo-600 dark:text-indigo-400',
    border: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    delay: '0.2s',
  },
  {
    icon: Phone,
    title: 'Two-Factor Authentication',
    desc: 'Time-limited 6-digit OTP sent via SMTP Email & SMS',
    badge: '2FA OTP',
    color: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    accent: 'text-emerald-600 dark:text-emerald-400',
    border: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    delay: '0.3s',
  },
  {
    icon: FileCheck,
    title: 'Secure Paper Vault',
    desc: 'Time-locked UTC schedule enforcement & audit logs',
    badge: 'TBAC Access',
    color: 'from-violet-500/15 via-violet-500/5 to-transparent',
    accent: 'text-violet-600 dark:text-violet-400',
    border: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
    delay: '0.4s',
  },
];

const PROFILES = [
  {
    id: 'admin',
    name: 'Controller of Examinations',
    role: 'Administrator',
    desc: 'Master vault governance, paper approval & direct bypass',
    email: 'admin@examvault.edu',
    password: 'Admin@123',
    icon: Crown,
    badgeText: 'Direct Login (No OTP)',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    cardBorder: 'hover:border-amber-500/50 dark:hover:border-amber-500/40',
    avatarBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    id: 'faculty',
    name: 'Dr. Alan Turing',
    role: 'Chief Examiner (Faculty)',
    desc: 'Subject question paper access, time-locked decryption lab',
    email: 'faculty@examvault.edu',
    password: 'Faculty@123',
    icon: GraduationCap,
    badgeText: '2FA OTP Required',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    cardBorder: 'hover:border-blue-500/50 dark:hover:border-blue-500/40',
    avatarBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    id: 'shannon',
    name: 'Prof. Claude Shannon',
    role: 'Senior Examiner (Faculty)',
    desc: 'Information Theory Dept, verification audit & signatures',
    email: 'shannon@examvault.edu',
    password: 'Faculty@123',
    icon: Shield,
    badgeText: '2FA OTP Required',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    cardBorder: 'hover:border-indigo-500/50 dark:hover:border-indigo-500/40',
    avatarBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
];

// Interactive Cybersecurity Vector Illustration
const CryptoVaultIllustration = () => (
  <div className="relative w-full max-w-xl mx-auto py-2 my-2 select-none">
    <div className="relative rounded-3xl p-6 bg-gradient-to-b from-white/60 via-slate-50/40 to-white/20 dark:from-slate-900/60 dark:via-slate-900/30 dark:to-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-xl overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/15 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* High-tech vector diagram */}
      <svg viewBox="0 0 540 260" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gridGrad" x1="0" y1="0" x2="540" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#06B6D4" stopOpacity="0.25" />
            <stop offset="1" stopColor="#4F46E5" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="230" y1="60" x2="310" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="0.5" stopColor="#2563EB" />
            <stop offset="1" stopColor="#1D4ED8" />
          </linearGradient>

          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic connection circuit paths */}
        <path d="M 60 70 C 140 70, 190 120, 240 130" stroke="url(#gridGrad)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M 60 190 C 140 190, 190 140, 240 130" stroke="url(#gridGrad)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M 480 70 C 400 70, 350 120, 300 130" stroke="url(#gridGrad)" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M 480 190 C 400 190, 350 140, 300 130" stroke="url(#gridGrad)" strokeWidth="2" strokeDasharray="4 4" />

        {/* Central Outer Holographic Ring */}
        <circle cx="270" cy="130" r="68" stroke="#38BDF8" strokeOpacity="0.2" strokeWidth="2" />
        <circle cx="270" cy="130" r="54" stroke="#2563EB" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="8 6" className="animate-spin" style={{ animationDuration: '24s', transformOrigin: '270px 130px' }} />
        <circle cx="270" cy="130" r="42" fill="#2563EB" fillOpacity="0.08" />

        {/* Holographic 3D Shield in Center */}
        <g filter="url(#glowEffect)">
          <path
            d="M 270 94 L 302 108 V 134 C 302 154 288 168 270 174 C 252 168 238 154 238 134 V 108 Z"
            fill="url(#shieldGrad)"
          />
        </g>
        {/* Shield Highlights */}
        <path
          d="M 270 98 L 298 111 V 133 C 298 150 286 162 270 168 C 254 162 242 150 242 133 V 111 Z"
          stroke="#93C5FD"
          strokeWidth="1.5"
          fill="none"
          strokeOpacity="0.7"
        />

        {/* Lock symbol inside shield */}
        <rect x="262" y="129" width="16" height="15" rx="3" fill="#FFFFFF" />
        <path d="M 265 129 V 123 C 265 120.2 267.2 118 270 118 C 272.8 118 275 120.2 275 123 V 129" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="270" cy="136" r="1.5" fill="#1E40AF" />

        {/* Node 1 (Left Top): Raw Question Paper PDF */}
        <g className="animate-float-slow">
          <rect x="25" y="45" width="80" height="52" rx="10" fill="#FFFFFF" className="dark:fill-slate-800" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M 40 58 H 68 M 40 66 H 82 M 40 74 H 74" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <rect x="74" y="52" width="24" height="13" rx="3" fill="#EF4444" fillOpacity="0.12" />
          <text x="86" y="62" fontSize="7" fontWeight="bold" fill="#EF4444" textAnchor="middle">PDF</text>
          <text x="65" y="112" fontSize="9" fontWeight="600" fill="#64748B" textAnchor="middle">Raw Paper</text>
        </g>

        {/* Node 2 (Left Bottom): AES-256 Cipher Enclosure */}
        <g className="animate-float-reverse">
          <rect x="25" y="165" width="86" height="52" rx="10" fill="#FFFFFF" className="dark:fill-slate-800" stroke="#2563EB" strokeWidth="1.5" />
          <circle cx="48" cy="191" r="12" fill="#2563EB" fillOpacity="0.1" />
          <path d="M 45 191 L 51 191 M 48 186 L 48 196" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
          <text x="80" y="188" fontSize="8" fontWeight="bold" fill="#2563EB">AES-256</text>
          <text x="80" y="198" fontSize="7" fill="#64748B">CBC + IV</text>
          <text x="68" y="232" fontSize="9" fontWeight="600" fill="#64748B" textAnchor="middle">Encrypted Session</text>
        </g>

        {/* Node 3 (Right Top): RSA-2048 Asymmetric Key */}
        <g className="animate-float-reverse">
          <rect x="425" y="45" width="86" height="52" rx="10" fill="#FFFFFF" className="dark:fill-slate-800" stroke="#4F46E5" strokeWidth="1.5" />
          <circle cx="448" cy="71" r="12" fill="#4F46E5" fillOpacity="0.1" />
          <path d="M 445 71 L 452 71 M 450 68 V 74" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" />
          <text x="478" y="68" fontSize="8" fontWeight="bold" fill="#4F46E5">RSA-2048</text>
          <text x="478" y="78" fontSize="7" fill="#64748B">OAEP Wrapped</text>
          <text x="468" y="112" fontSize="9" fontWeight="600" fill="#64748B" textAnchor="middle">Keypair Security</text>
        </g>

        {/* Node 4 (Right Bottom): SHA-256 Digital Signature */}
        <g className="animate-float-slow">
          <rect x="425" y="165" width="86" height="52" rx="10" fill="#FFFFFF" className="dark:fill-slate-800" stroke="#06B6D4" strokeWidth="1.5" />
          <circle cx="448" cy="191" r="12" fill="#06B6D4" fillOpacity="0.1" />
          <path d="M 444 191 L 447 194 L 453 188" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="478" y="188" fontSize="8" fontWeight="bold" fill="#0891B2">SHA-256</text>
          <text x="478" y="198" fontSize="7" fill="#64748B">Signed Digest</text>
          <text x="468" y="232" fontSize="9" fontWeight="600" fill="#64748B" textAnchor="middle">Non-Repudiation</text>
        </g>

        {/* Animated Packets Moving to Center */}
        <circle cx="180" cy="108" r="3.5" fill="#2563EB">
          <animate attributeName="cx" values="100;240;100" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;1;0.2" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="360" cy="108" r="3.5" fill="#06B6D4">
          <animate attributeName="cx" values="440;300;440" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;1;0.2" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Live Badge Footer */}
      <div className="mt-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Cryptographic Engine Active</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">FIPS 140-2 / PKCS#1 v1.5</span>
      </div>
    </div>
  </div>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginInit, loginVerifyOtp, registerUser, resendOtp, darkMode, toggleDarkMode } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [activeProfile, setActiveProfile] = useState(null);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Engineering');
  const [regRole, setRegRole] = useState('faculty');
  const [regSuccess, setRegSuccess] = useState('');

  // Modals & feedback
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Dynamic Password Strength Meter
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500 text-rose-500' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500 text-amber-500' };
    if (score === 4) return { score: 3, label: 'Strong', color: 'bg-blue-500 text-blue-500' };
    return { score: 4, label: 'Military-Grade', color: 'bg-emerald-500 text-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(password || regPassword);

  // Quick Profile Selector
  const handleSelectProfile = (profile) => {
    setActiveTab('login');
    setStep(1);
    setActiveProfile(profile.id);
    setIdentifier(profile.email);
    setPassword(profile.password);
    setError('');
  };

  // Step 1: Submit Credentials
  const handleLoginStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginInit(identifier, password);
      // For Admin: OTP verification is completely bypassed!
      if (data.require_otp === false || data.role === 'admin') {
        navigate('/admin/dashboard');
        return;
      }
      setRole(data.role);
      setLoginMessage(data.message || 'Verification code dispatched to your registered Gmail and mobile phone.');
      setResendCooldown(30);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError('');
    try {
      const res = await resendOtp(identifier);
      setLoginMessage(res.message || 'A fresh OTP code has been dispatched.');
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleLoginStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginVerifyOtp(identifier, otp);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/faculty/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Self-Registration Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegSuccess('');
    setLoading(true);

    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        department: regDepartment,
        role: regRole,
      });

      setRegSuccess(res.message);
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminIdent = identifier.toLowerCase().includes('admin');

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#080D1A] text-slate-900 dark:text-slate-100 relative overflow-hidden font-sans selection:bg-blue-600/20">
      
      {/* Background blueprint grid & subtle ambient lighting */}
      <div className="absolute inset-0 bg-grid-blueprint pointer-events-none opacity-80" />
      <div className="absolute -top-36 -left-36 w-[550px] h-[550px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-36 w-[550px] h-[550px] bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Header Bar */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">ExamVault</span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">v2.4</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Secure Question Paper Distribution System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Security status badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>End-to-End Encrypted</span>
          </div>

          {/* Theme switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* ==================================================== */}
        {/* LEFT SIDE: HERO LANDING & CRYPTO ARCHITECTURE        */}
        {/* ==================================================== */}
        <section className="w-full lg:w-[54%] flex flex-col justify-center space-y-6">
          
          {/* Academic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-medium backdrop-blur-md shadow-sm w-fit">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Computer Engineering Cryptography Microproject</span>
          </div>

          {/* Main Hero Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
              Protecting Every{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Examination.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              Secure Question Paper Distribution using <strong className="text-slate-900 dark:text-white font-semibold">Hybrid Cryptography</strong>, Digital Signatures, and Multi-Level Role-Based Access Control.
            </p>
          </div>

          {/* Abstract Vector Illustration */}
          <CryptoVaultIllustration />

          {/* Animated Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {FEATURE_CARDS.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 ${card.border}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${card.accent}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{card.title}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Trust Footnote */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AES-256 Symmetric Payload
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> RSA-2048 OAEP Wrapped
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SHA-256 Digest Verification
            </span>
          </div>
        </section>

        {/* ==================================================== */}
        {/* RIGHT SIDE: FLOATING GLASS LOGIN PANEL               */}
        {/* ==================================================== */}
        <section className="w-full lg:w-[46%] flex flex-col items-center">
          
          <div className="w-full max-w-md rounded-3xl p-7 sm:p-9 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.12)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-300">
            
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

            {/* Panel Header */}
            <div className="text-center pb-5 mb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600/10 via-indigo-600/10 to-cyan-500/10 text-blue-600 dark:text-cyan-400 mb-3 border border-blue-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">ExamVault Portal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorized Academic & Examination Personnel
              </p>

              {/* End-to-End Encrypted Pill */}
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span>End-to-End Cryptographically Secured</span>
              </div>
            </div>

            {/* Tab Switcher: Sign In vs Self-Register */}
            <div className="flex p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(''); setRegSuccess(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Self-Register</span>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Registration Success Banner */}
            {regSuccess && (
              <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Registration Request Submitted</span>
                </div>
                <p className="text-[11px] leading-relaxed">{regSuccess}</p>
                <button
                  onClick={() => { setActiveTab('login'); setRegSuccess(''); }}
                  className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline hover:no-underline"
                >
                  Return to Sign In ➔
                </button>
              </div>
            )}

            {/* ================================================ */}
            {/* TAB 1: SIGN IN (STEP 1: CREDENTIALS)             */}
            {/* ================================================ */}
            {activeTab === 'login' && step === 1 && (
              <form onSubmit={handleLoginStep1} className="space-y-4">
                
                {/* Floating Identifier Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Institutional Email or Mobile Phone
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 transition-colors">
                      {identifier.includes('@') ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setActiveProfile(null); }}
                      placeholder="e.g. admin@examvault.edu or 8104211805"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(37,99,235,0.18)] transition-all"
                    />
                  </div>
                </div>

                {/* Floating Password Input with Visibility Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Master Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-cyan-400 absolute left-3.5 top-3.5 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-cyan-500 focus:bg-white dark:focus:bg-slate-900 focus:shadow-[0_0_20px_rgba(37,99,235,0.18)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Password Entropy</span>
                        <span className="font-bold">{pwdStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        <div className={`rounded-full ${pwdStrength.score >= 1 ? pwdStrength.color.split(' ')[0] : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`rounded-full ${pwdStrength.score >= 2 ? pwdStrength.color.split(' ')[0] : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`rounded-full ${pwdStrength.score >= 3 ? pwdStrength.color.split(' ')[0] : 'bg-slate-200 dark:bg-slate-700'}`} />
                        <div className={`rounded-full ${pwdStrength.score >= 4 ? pwdStrength.color.split(' ')[0] : 'bg-slate-200 dark:bg-slate-700'}`} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <span>Remember this station</span>
                  </label>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> 2hr JWT Session
                  </span>
                </div>

                {/* Main CTA Button with Shimmer Sweep */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative group w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-xl shadow-blue-600/30 overflow-hidden transition-all duration-300 hover:shadow-blue-600/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {/* Moving light sweep shimmer */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{isAdminIdent ? 'Sign In to Admin Vault' : 'Secure Login (Proceed to 2FA)'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>

                {/* Quick Profile Cards (Demonstration Profiles) */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Quick Profile Selector:
                    </span>
                    <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-semibold">1-Click Auto-Fill</span>
                  </div>

                  <div className="space-y-2">
                    {PROFILES.map((p) => {
                      const IconComp = p.icon;
                      const isSelected = activeProfile === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProfile(p)}
                          className={`w-full p-2.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-cyan-500 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 ' + p.cardBorder
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${p.avatarBg}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.desc}</p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-medium ${p.badgeColor}`}>
                            {p.id === 'admin' ? '⚡ Direct' : '📱 2FA'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </form>
            )}

            {/* ================================================ */}
            {/* TAB 1: SIGN IN (STEP 2: OTP VERIFICATION)        */}
            {/* ================================================ */}
            {activeTab === 'login' && step === 2 && (
              <form onSubmit={handleLoginStep2} className="space-y-4">
                
                {/* Security Verification Notice */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Security Verification Code Dispatched</span>
                  </div>
                  <p className="text-[12px] text-blue-800 dark:text-blue-300/90 leading-relaxed">
                    {loginMessage}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-blue-600" /> Check Gmail Inbox / Spam
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" /> Check Mobile SMS
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xl font-mono font-bold tracking-[0.35em] text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-cyan-500"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Valid for 5 minutes
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendLoading || resendCooldown > 0}
                      className="text-blue-600 dark:text-cyan-400 font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {resendLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify OTP & Unlock Vault</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition text-center"
                >
                  ← Back to Credentials
                </button>
              </form>
            )}

            {/* ================================================ */}
            {/* TAB 2: SELF-REGISTRATION (WITH ADMIN APPROVAL)   */}
            {/* ================================================ */}
            {activeTab === 'register' && !regSuccess && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                
                {/* Approval Policy Notice */}
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
                  <Shield className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Institutional Security Policy:</strong> All self-registered academic accounts require explicit cryptographic authorization and verification by the <strong>Examination Controller (Admin)</strong> before login is granted.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Barbara Liskov"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="liskov@university.edu"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Mobile Phone (for OTP)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Master Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {regPassword && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Password Strength: <strong className={pwdStrength.color.split(' ')[1]}>{pwdStrength.label}</strong></span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Department
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Computer Engineering">Computer Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Telecom">Electronics & Telecom</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Cyber Security">Cyber Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                      Academic Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="faculty">Faculty / Examiner</option>
                      <option value="admin">Admin / Assistant Controller</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Submit for Admin Approval</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Institutional Key Recovery Protocol</h3>
                <p className="text-xs text-slate-500">Zero-Knowledge Cryptographic Policy</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                In compliance with University Examination Security Guidelines, ExamVault utilizes <strong>RSA-2048 Asymmetric Keypairs</strong>. Private keys are never stored in plaintext and cannot be recovered via automated public email links.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-800 dark:text-slate-200 font-semibold">Contact Official Key Authority:</div>
                <div className="text-blue-600 dark:text-cyan-400">controller@examvault.edu</div>
                <div className="text-slate-500">Security Desk: +91 (022) 2800-EXAM (Ext. 4088)</div>
              </div>
              <p className="text-[11px] text-slate-400">
                Once identity verification is completed, the Examination Controller will re-issue your RSA cryptographic keypair in the Admin portal.
              </p>
            </div>

            <div className="mt-5">
              <button
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
              >
                Acknowledge Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Status Footer */}
      <footer className="relative z-10 w-full text-center py-6 border-t border-slate-200/50 dark:border-slate-800/50 text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
        <span>© 2026 ExamVault Cryptographic Security System</span>
        <span className="hidden sm:inline">•</span>
        <span>Department of Computer Engineering</span>
        <span className="hidden sm:inline">•</span>
        <span>FIPS 140-2 Compliant Architecture</span>
      </footer>

    </div>
  );
};

export default LoginPage;
