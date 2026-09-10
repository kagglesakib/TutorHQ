'use client';

import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface StudentLoadingViewProps {
  message?: string;
}

export function StudentLoadingView({ message = 'Loading student records...' }: StudentLoadingViewProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 px-4">
      <div className="p-3 bg-emerald-500/15 text-emerald-600 rounded-2xl animate-spin border border-emerald-300/50 shadow-xs">
        <RefreshCw className="w-6 h-6" />
      </div>
      <p className="text-xs font-bold text-slate-600 font-mono tracking-wide">{message}</p>
    </div>
  );
}

interface StudentErrorViewProps {
  sid?: string;
  error?: string | null;
}

export function StudentErrorView({ sid, error }: StudentErrorViewProps) {
  return (
    <div className="max-w-xl mx-auto my-10 p-6 sm:p-8 bg-rose-100/70 border border-rose-300 rounded-3xl text-center space-y-3.5 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-rose-200/80 border border-rose-300/80 flex items-center justify-center mx-auto text-rose-700 shadow-2xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="font-display font-black text-rose-950 text-base sm:text-lg">
        {error ? 'Unable to Load Student Data' : 'Student Record Not Found'}
      </h3>
      <p className="text-xs text-rose-800 leading-relaxed max-w-md mx-auto">
        {error ? (
          <span>{error}</span>
        ) : (
          <span>
            We could not locate an active enrolled record for Student ID{' '}
            <strong className="font-mono bg-rose-200/70 px-1.5 py-0.5 rounded text-rose-950">{sid || 'N/A'}</strong>.
            Please verify your enrollment credentials with your instructor or tutor.
          </span>
        )}
      </p>
    </div>
  );
}
