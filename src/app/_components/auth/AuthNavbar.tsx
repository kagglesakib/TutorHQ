'use client';

import React from 'react';
import { GraduationCap, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

interface AuthNavbarProps {
  authMode: 'login' | 'signup';
  onSelectAuthMode: (mode: 'login' | 'signup') => void;
}

export function AuthNavbar({ authMode, onSelectAuthMode }: AuthNavbarProps) {
  return (
    <header className="w-full bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-800/80 sticky top-0 z-50 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-xl shadow-xs border border-emerald-400/40">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-display font-black text-white tracking-tight">
              Tutor<span className="text-emerald-400">HQ</span>
            </span>
            <span className="text-[9px] bg-emerald-900/90 border border-emerald-700 text-emerald-200 font-extrabold px-1.5 py-0.2 rounded font-mono">
              Academic Portal
            </span>
          </div>
        </div>

        {/* Action Controls Switcher */}
        <div className="flex items-center gap-1.5 bg-emerald-900/80 p-0.5 rounded-xl border border-emerald-700/80">
          <button
            type="button"
            onClick={() => onSelectAuthMode('login')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              authMode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectAuthMode('signup')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>
      </div>
    </header>
  );
}
