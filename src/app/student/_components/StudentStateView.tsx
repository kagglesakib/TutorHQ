'use client';

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface StudentLoadingViewProps {
  message?: string;
}

export function StudentLoadingView({ message = 'Loading student records...' }: StudentLoadingViewProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 px-4">
      <div className="p-3 bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl animate-spin border border-emerald-300/50 dark:border-emerald-500/30 shadow-xs">
        <RefreshCw className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono tracking-wide">{message}</p>
    </div>
  );
}

interface StudentErrorViewProps {
  sid?: string;
  error?: string | null;
}

export function StudentErrorView({ sid, error }: StudentErrorViewProps) {
  return (
    <div className="max-w-xl mx-auto my-10 p-6 sm:p-8 bg-rose-100/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 rounded-3xl text-center space-y-3.5 shadow-sm dark:shadow-[0_0_25px_rgba(244,63,94,0.1)] transition-all">
      <div className="w-12 h-12 rounded-2xl bg-rose-200/80 dark:bg-rose-900/60 border border-rose-300/80 dark:border-rose-700/60 flex items-center justify-center mx-auto text-rose-700 dark:text-rose-300 shadow-2xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-display font-black text-rose-950 dark:text-rose-200 text-base sm:text-lg">
        {error ? 'Unable to Load Student Data' : 'Student Record Not Found'}
      </h3>
      <p className="text-xs text-rose-800 dark:text-rose-300/80 leading-relaxed max-w-md mx-auto">
        {error ? (
          <span>{error}</span>
        ) : (
          <span>
            We could not locate an active enrolled record for Student ID{' '}
            <strong className="font-mono bg-rose-200/70 dark:bg-rose-900/80 px-1.5 py-0.5 rounded text-rose-950 dark:text-rose-100">{sid || 'N/A'}</strong>.
            Please verify your enrollment credentials with your instructor or tutor.
          </span>
        )}
      </p>
    </div>
  );
}
