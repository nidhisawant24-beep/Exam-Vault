import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  UploadCloud,
  FileKey,
  Users,
  ScrollText,
  KeyRound,
  BookOpenCheck,
  ShieldCheck,
  Sparkles,
  Lock
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminNav = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Admin Overview' },
    { to: '/admin/upload', icon: UploadCloud, label: 'Upload & Encrypt Paper' },
    { to: '/admin/papers', icon: FileKey, label: 'Vaulted Papers' },
    { to: '/admin/faculty', icon: Users, label: 'Faculty Management' },
    { to: '/admin/audit-logs', icon: ScrollText, label: 'Forensic Audit Trail' },
    { to: '/crypto-architecture', icon: ShieldCheck, label: 'Crypto Architecture' },
  ];

  const facultyNav = [
    { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Faculty Overview' },
    { to: '/faculty/exams', icon: BookOpenCheck, label: 'Examination Vault' },
    { to: '/crypto-architecture', icon: ShieldCheck, label: 'Crypto Architecture' },
  ];

  const navItems = isAdmin ? adminNav : facultyNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-40 h-full lg:h-[calc(100vh-61px)] w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Administrative Controls' : 'Faculty Access Suite'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Cryptographic Security Status Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-200">Vault Defense Status</span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="flex justify-between">
              <span>CIPHER:</span>
              <span className="text-emerald-400 font-bold">AES-256-CBC</span>
            </div>
            <div className="flex justify-between">
              <span>KEY WRAP:</span>
              <span className="text-blue-400 font-bold">RSA-2048 OAEP</span>
            </div>
            <div className="flex justify-between">
              <span>INTEGRITY:</span>
              <span className="text-purple-400 font-bold">SHA-256</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
