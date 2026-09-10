'use client';

import React from 'react';
import { GraduationCap, ShieldCheck, BookOpen, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthHeroBannerProps {
  authMode: 'login' | 'signup';
  onToggleAuthMode: () => void;
}

export function AuthHeroBanner({ authMode, onToggleAuthMode }: AuthHeroBannerProps) {
  return (
    <div className="md:col-span-5 bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 border border-emerald-700/80 shadow-xl flex flex-col justify-between relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-12 -top-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-4 relative z-10">
        <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20 text-white w-fit shadow-xs">
          <GraduationCap className="w-7 h-7 text-emerald-300" />
        </div>

        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Student & Academic Portal
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight mt-2">
            Elevate Your Learning Journey
          </h2>
          <p className="text-xs text-emerald-100/80 mt-1.5 leading-relaxed">
            Centralized hub for tracking student attendance, homework marks, exam scorecards, and tuition receipts in real time.
          </p>
        </div>

        {/* Feature List */}
        <div className="space-y-2 pt-2 border-t border-emerald-800/80">
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Instant access to daily study logs & marks</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Download verified PDF academic report cards</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted student ledger & payment verification</span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-emerald-800/80 relative z-10 flex flex-col gap-2">
        <p className="text-[11px] text-emerald-200">
          {authMode === 'login' ? "Don't have an account yet?" : 'Already have a registered account?'}
        </p>
        <button
          type="button"
          onClick={onToggleAuthMode}
          className="w-full py-2 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
        >
          <span>{authMode === 'login' ? 'Create Student Account' : 'Sign In to Account'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
