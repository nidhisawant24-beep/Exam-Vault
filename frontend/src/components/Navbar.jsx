import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Moon, Sun, LogOut, Clock, User, CheckCircle2 } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [time, setTime] = useState(new Date().toUTCString().slice(17, 25) + ' UTC');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">ExamVault</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  AES-256 • RSA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Secure Question Paper Distribution System
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: System clock, user badge & actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Real-time forensic time lock clock */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Server Time: {time}</span>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User badge */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:border-l border-slate-200 dark:border-slate-800">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {user.role} ({user.department || 'Examination Board'})
                  </span>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 ml-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                title="Secure Session Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;
