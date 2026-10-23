import React from 'react';
import { FileText, Hash, ShieldCheck, Key, Lock, Database, ArrowRight } from 'lucide-react';

const CryptoVisualizer = ({ activeStep = 0, statusMessage = '' }) => {
  const steps = [
    {
      id: 1,
      title: 'SHA-256 Digest',
      desc: 'Calculates 256-bit hash fingerprint of raw PDF bytes',
      icon: Hash,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Digital Signature',
      desc: 'Signs file digest with Admin RSA-2048 Private Key (Non-repudiation)',
      icon: ShieldCheck,
      color: 'indigo'
    },
    {
      id: 3,
      title: 'AES-256 Encryption',
      desc: 'Generates random 256-bit symmetric session key to encrypt PDF',
      icon: Lock,
      color: 'emerald'
    },
    {
      id: 4,
      title: 'RSA Key Encapsulation',
      desc: 'Encrypts AES key using RSA-OAEP Public Key',
      icon: Key,
      color: 'amber'
    },
    {
      id: 5,
      title: 'Vault Storage',
      desc: 'Atomically commits ciphertext, encrypted key & audit metadata',
      icon: Database,
      color: 'purple'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-400" />
            Hybrid Cryptographic Pipeline Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            End-to-End Symmetric (AES-256) & Asymmetric (RSA-2048) Security Flow
          </p>
        </div>
        {statusMessage && (
          <span className="text-xs font-mono px-3 py-1 bg-blue-950/80 border border-blue-800 text-blue-300 rounded-full animate-pulse">
            {statusMessage}
          </span>
        )}
      </div>

      {/* Steps Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isDone = activeStep > s.id;
          const isCurrent = activeStep === s.id;
          const isPending = activeStep < s.id;

          let borderClass = 'border-slate-800 bg-slate-950/40 text-slate-500';
          let iconBg = 'bg-slate-800 text-slate-400';

          if (isDone) {
            borderClass = 'border-emerald-500/40 bg-emerald-950/20 text-slate-200';
            iconBg = 'bg-emerald-600 text-white';
          } else if (isCurrent) {
            borderClass = 'border-blue-500 bg-blue-950/30 text-white ring-2 ring-blue-500/20';
            iconBg = 'bg-blue-600 text-white animate-bounce';
          }

          return (
            <div
              key={s.id}
              className={`relative p-4 rounded-xl border transition-all duration-300 ${borderClass}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${iconBg}`}>
                  {isDone ? '✓' : s.id}
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
                  Step 0{s.id}
                </span>
              </div>
              <h4 className="text-sm font-semibold mb-1 text-slate-100">{s.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoVisualizer;
