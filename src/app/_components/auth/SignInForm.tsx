'use client';

import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';

interface SignInFormProps {
  loginIdentifier: string;
  loginPassword: string;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToSignup: () => void;
  isSubmitting: boolean;
}

export function SignInForm({
  loginIdentifier,
  loginPassword,
  onIdentifierChange,
  onPasswordChange,
  onSubmit,
  onSwitchToSignup,
  isSubmitting,
}: SignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      {/* Identifier Input (SID or Email) */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
          <User className="w-3.5 h-3.5 text-emerald-700" />
          <span>Student ID (SID) or Email</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={loginIdentifier}
            onChange={(e) => onIdentifierChange(e.target.value)}
            placeholder="e.g. S-101 or student@example.com"
            className="w-full px-3 py-2 bg-white/90 border border-emerald-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>Password</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={loginPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter your account password"
            className="w-full px-3 py-2 pr-9 bg-white/90 border border-emerald-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white shadow-2xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
      >
        <LogIn className="w-4 h-4" />
        <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
      </button>

      {/* Switch mode */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Need a new student account? Register here</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
}
