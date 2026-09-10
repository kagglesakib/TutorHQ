'use client';

import React, { useState } from 'react';
import {
  GraduationCap, CheckCircle2, AlertCircle, UserCheck, Lock,
  EyeOff, Eye, Loader2, ArrowRight, UserPlus, ShieldCheck, User,
  LogOut, Eraser, Clock, RefreshCw, BookOpen, Award, Sparkles, 
  Phone, Mail, Building, Calendar, Layers, PhoneCall, KeyRound,
  Check, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup States
  const [signupData, setSignupData] = useState({
    name: '',
    college: '',
    hscBatch: '',
    subject: '',
    group: 'Science',
    mobile: '',
    guardiansPhone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const scrollToFormSection = () => {
    const el = document.getElementById('auth-form-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSelectAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
    setTimeout(() => {
      scrollToFormSection();
    }, 40);
  };

  const handleClearFields = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setSignupData({
      name: '',
      college: '',
      hscBatch: '',
      subject: '',
      group: 'Science',
      mobile: '',
      guardiansPhone: '',
      address: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError(null);
    setSuccessMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your Student ID (SID) or Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginIdentifier.trim(), loginPassword.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const cleanErrorMessage = (msg: string | null | undefined): string => {
    if (!msg) return 'An unexpected error occurred.';
    const lower = msg.toLowerCase();
    if (
      lower.includes('unexpected token') ||
      lower.includes('is not valid json') ||
      lower.includes('<html>') ||
      lower.includes('<!doctype') ||
      lower.includes('syntaxerror') ||
      lower.includes('failed to parse')
    ) {
      return 'Unable to process request due to a temporary server issue. Please try again later.';
    }
    return msg;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signupData.name.trim() || !signupData.mobile.trim() || !signupData.email.trim() || !signupData.password) {
      setError('Full Name, Mobile Number, Email Address, and Password are required.');
      return;
    }

    if (signupData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match. Please verify password confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setIsSubmitting(false);
        setError('Server temporarily unavailable or returning invalid response. Please try again later.');
        return;
      }

      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setError(cleanErrorMessage(data.error || 'Registration failed. Please check your information and try again.'));
        return;
      }

      setSuccessMsg(`Account created for ${signupData.name}! Your student registration is pending admin approval.`);
      setLoginIdentifier(signupData.email);
      setLoginPassword(signupData.password);
      setAuthMode('login');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(cleanErrorMessage(err?.message || 'Signup request failed. Please try again later.'));
    }
  };

  const passwordsMatch = Boolean(signupData.password && signupData.confirmPassword && signupData.password === signupData.confirmPassword);
  const passwordsMismatch = Boolean(signupData.confirmPassword && signupData.password !== signupData.confirmPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 flex flex-col justify-between -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 font-sans text-xs">
      
      {/* ========================================================= */}
      {/* COMPACT TOP FIXED NAVBAR */}
      {/* ========================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/70 shadow-md px-3 sm:px-6 py-2 flex items-center justify-between gap-2 transition-all">
        {/* Logo & Portal Name */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm sm:text-base font-black font-display text-white tracking-tight whitespace-nowrap">
              Tutor<span className="text-emerald-400">HQ</span>
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-900/90 text-emerald-300 border border-emerald-700/80 rounded text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 hidden min-[440px]:inline-block">
              Academic Ledger
            </span>
          </div>
        </div>

        {/* Interactive Mode Toggle */}
        <div className="flex items-center shrink-0">
          <div className="bg-emerald-900/90 p-0.5 rounded-xl border border-emerald-700/80 flex items-center gap-0.5 shadow-inner shrink-0">
            <button
              type="button"
              data-auth-mode="login"
              onClick={() => handleSelectAuthMode('login')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 leading-none ${
                authMode === 'login'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Login</span>
            </button>

            <button
              type="button"
              data-auth-mode="signup"
              onClick={() => handleSelectAuthMode('signup')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 leading-none ${
                authMode === 'signup'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 shadow-xs font-black'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Sign Up</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MAIN CONTAINER (COMPACT TIGHT PADDING & SPACING) */}
      {/* ========================================================= */}
      <div className="flex-grow pt-16 sm:pt-20 pb-6 px-3 sm:px-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          
          {/* LEFT DECORATIVE SIDEBAR (COMPACT TIGHT) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl border border-emerald-800/60 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-3.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-900/70 backdrop-blur-md rounded-full border border-emerald-600/40 text-[10px] text-emerald-300 font-bold">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Verified Academic Portal</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-display font-black text-white leading-tight">
                  Student & Admin Portal
                </h2>
                <p className="text-[11px] text-emerald-200/80 leading-relaxed font-sans">
                  Real-time exam results, lecture logs, attendance analytics, and official ledger.
                </p>
              </div>

              {/* Interactive Quick Features */}
              <div className="space-y-2 pt-1">
                <div className="group flex items-start gap-2.5 p-2 rounded-xl bg-emerald-900/35 hover:bg-emerald-900/55 border border-emerald-600/30 transition-all cursor-default shadow-2xs">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-emerald-100 flex items-center gap-1">
                      Academic Analytics
                      <span className="text-[9px] text-emerald-400 font-mono">Live</span>
                    </h4>
                    <p className="text-[10px] text-emerald-300/80 leading-tight">Exam marks, rank scores, and subject progress tracking.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-2.5 p-2 rounded-xl bg-teal-900/35 hover:bg-teal-900/55 border border-teal-600/30 transition-all cursor-default shadow-2xs">
                  <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-teal-100 flex items-center gap-1">
                      Study Logs & Ledger
                      <span className="text-[9px] text-teal-400 font-mono">Daily</span>
                    </h4>
                    <p className="text-[10px] text-teal-300/80 leading-tight">Curriculum coverage, homework assignments & fee receipts.</p>
                  </div>
                </div>

                <div className="group flex items-start gap-2.5 p-2 rounded-xl bg-cyan-900/35 hover:bg-cyan-900/55 border border-cyan-600/30 transition-all cursor-default shadow-2xs">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-cyan-100">Verified Credentials</h4>
                    <p className="text-[10px] text-cyan-300/80 leading-tight">Secured unique SID authentication for students & admins.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tip / Quick Action */}
            <div className="pt-3 mt-3 border-t border-emerald-800/50 relative z-10 flex items-center justify-between text-[10px] text-emerald-300 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>256-bit Encrypted</span>
              </span>
              <button
                type="button"
                onClick={() => handleSelectAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-emerald-400 hover:text-white underline cursor-pointer transition-colors flex items-center gap-0.5"
              >
                <span>Switch to {authMode === 'login' ? 'Sign Up' : 'Sign In'}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          </motion.div>

          {/* RIGHT FORM CONTAINER (COMPACT TIGHT FORM) */}
          <motion.div
            id="auth-form-card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-7 bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/80 rounded-2xl p-3.5 sm:p-5 border-2 border-emerald-300/90 shadow-xl flex flex-col justify-between backdrop-blur-xs scroll-mt-20"
          >
            <div className="space-y-3">
              
              {/* Compact Form Header */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200/90 pb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-black font-display text-emerald-950 flex items-center gap-1.5">
                      {authMode === 'login' ? (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span>Portal Sign In</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-emerald-700" />
                          <span>Student Registration</span>
                        </>
                      )}
                    </h3>
                    <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 border border-emerald-300 rounded text-[9px] font-mono font-bold uppercase">
                      {authMode === 'login' ? 'Access' : 'New User'}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800/80 font-medium truncate">
                    {authMode === 'login'
                      ? 'Enter your SID or registered email with password.'
                      : 'Complete your academic profile to register for student access.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearFields}
                  className="px-2 py-1 bg-emerald-200/80 hover:bg-emerald-300 text-emerald-950 border border-emerald-400/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                  title="Clear all form inputs"
                >
                  <Eraser className="w-3 h-3 text-emerald-800" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>

              {/* Alert Boxes */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-start gap-2 shadow-2xs border ${
                    error.toLowerCase().includes('pending')
                      ? 'bg-amber-100/95 border-amber-300/90 text-amber-950'
                      : 'bg-rose-100/95 border-rose-300 text-rose-950'
                  }`}
                >
                  {error.toLowerCase().includes('pending') ? (
                    <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-snug">{cleanErrorMessage(error)}</div>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-200/90 border border-emerald-400 text-emerald-950 p-2.5 rounded-xl text-[11px] font-semibold flex items-start gap-2 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{successMsg}</div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* LOGIN FORM (COMPACT TIGHT) */}
              {/* ======================================================= */}
              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-2.5 pt-0.5">
                  
                  {/* Field 1: Identifier */}
                  <div className="bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-300/90 space-y-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-700" />
                        Student ID (SID) or Email
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold">Required</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. S101, 2701244, or student@gmail.com"
                        className="w-full px-2.5 py-1.5 bg-emerald-50/95 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 placeholder:text-emerald-700/50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Field 2: Password */}
                  <div className="bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-300/90 space-y-1 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500/30 transition-all">
                    <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-700" />
                        Passcode / Password
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold">Confidential</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-2.5 pr-8 py-1.5 bg-emerald-50/95 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 placeholder:text-emerald-700/50 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 text-emerald-700 hover:text-emerald-950 transition-colors p-0.5 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Helper Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-emerald-900 font-medium pt-0.5">
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <HelpCircle className="w-2.5 h-2.5" /> Tip:
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-200/80 rounded border border-emerald-300 font-mono">
                      Students sign in with SID or Email
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-98 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-emerald-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Credentials...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Sign In To Portal</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-emerald-950 font-medium px-1">
                      <span>Don&apos;t have an account?</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAuthMode('signup')}
                        className="font-black text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Sign Up Here &rarr;</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* ======================================================= */
                /* SIGN UP FORM (COMPACT TIGHT 2-COLUMN WITH ICONS) */
                /* ======================================================= */
                <form onSubmit={handleSignupSubmit} className="space-y-2 pt-0.5 max-h-[58vh] overflow-y-auto pr-1">
                  
                  {/* 1. Personal Info */}
                  <div className="bg-emerald-100/80 p-2.5 rounded-xl border border-emerald-300/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-emerald-200/80 pb-1">
                      <span className="text-[10px] font-black text-emerald-950 uppercase tracking-wider font-mono flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-700" />
                        1. Personal Details
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold">* Required</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
                          <User className="w-2.5 h-2.5 text-emerald-700" /> Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          placeholder="e.g. Tanvir Ahmed"
                          className="w-full px-2 py-1 bg-emerald-50/95 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
                          <Building className="w-2.5 h-2.5 text-emerald-700" /> College / Institution
                        </label>
                        <input
                          type="text"
                          value={signupData.college}
                          onChange={(e) => setSignupData({ ...signupData, college: e.target.value })}
                          placeholder="e.g. Notre Dame College"
                          className="w-full px-2 py-1 bg-emerald-50/95 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Academic Details */}
                  <div className="bg-teal-100/80 p-2.5 rounded-xl border border-teal-300/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-teal-200/80 pb-1">
                      <span className="text-[10px] font-black text-teal-950 uppercase tracking-wider font-mono flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-teal-700" />
                        2. Academic Placement
                      </span>
                      <span className="text-[9px] text-teal-700 font-bold">HSC & Focus</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-teal-950 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-teal-700" /> HSC Batch
                        </label>
                        <input
                          type="text"
                          value={signupData.hscBatch}
                          onChange={(e) => setSignupData({ ...signupData, hscBatch: e.target.value })}
                          placeholder="e.g. 2026"
                          className="w-full px-2 py-1 bg-teal-50/95 border border-teal-300 rounded-lg text-xs font-bold text-teal-950 focus:bg-white focus:border-teal-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-teal-950 flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5 text-teal-700" /> Subject
                        </label>
                        <input
                          type="text"
                          value={signupData.subject}
                          onChange={(e) => setSignupData({ ...signupData, subject: e.target.value })}
                          placeholder="e.g. Physics"
                          className="w-full px-2 py-1 bg-teal-50/95 border border-teal-300 rounded-lg text-xs font-bold text-teal-950 focus:bg-white focus:border-teal-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-0.5 col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-bold text-teal-950 flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5 text-teal-700" /> Group
                        </label>
                        <select
                          value={signupData.group}
                          onChange={(e) => setSignupData({ ...signupData, group: e.target.value })}
                          className="w-full px-2 py-1 bg-teal-50/95 border border-teal-300 rounded-lg text-xs font-bold text-teal-950 focus:bg-white focus:border-teal-600 focus:outline-hidden transition-all shadow-2xs"
                        >
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 3. Contact Details */}
                  <div className="bg-sky-100/80 p-2.5 rounded-xl border border-sky-300/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-sky-200/80 pb-1">
                      <span className="text-[10px] font-black text-sky-950 uppercase tracking-wider font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-sky-700" />
                        3. Contact Information
                      </span>
                      <span className="text-[9px] text-sky-700 font-bold">Communications</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-sky-950 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-sky-700" /> Student Mobile *
                        </label>
                        <input
                          type="tel"
                          required
                          value={signupData.mobile}
                          onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
                          placeholder="01700000000"
                          className="w-full px-2 py-1 bg-sky-50/95 border border-sky-300 rounded-lg text-xs font-bold font-mono text-sky-950 focus:bg-white focus:border-sky-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-sky-950 flex items-center gap-1">
                          <PhoneCall className="w-2.5 h-2.5 text-sky-700" /> Guardian Mobile
                        </label>
                        <input
                          type="tel"
                          value={signupData.guardiansPhone}
                          onChange={(e) => setSignupData({ ...signupData, guardiansPhone: e.target.value })}
                          placeholder="01800000000"
                          className="w-full px-2 py-1 bg-sky-50/95 border border-sky-300 rounded-lg text-xs font-bold font-mono text-sky-950 focus:bg-white focus:border-sky-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>

                      <div className="space-y-0.5 sm:col-span-2">
                        <label className="text-[10px] font-bold text-sky-950 flex items-center gap-1">
                          <Mail className="w-2.5 h-2.5 text-sky-700" /> Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          placeholder="student@gmail.com"
                          className="w-full px-2 py-1 bg-sky-50/95 border border-sky-300 rounded-lg text-xs font-bold text-sky-950 focus:bg-white focus:border-sky-600 focus:outline-hidden transition-all shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Passcode & Security */}
                  <div className="bg-amber-100/80 p-2.5 rounded-xl border border-amber-300/90 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-1">
                      <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider font-mono flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-amber-700" />
                        4. Account Security
                      </span>
                      {passwordsMatch && (
                        <span className="text-[9px] font-bold text-emerald-800 flex items-center gap-0.5 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                          <Check className="w-2.5 h-2.5 text-emerald-700" /> Match
                        </span>
                      )}
                      {passwordsMismatch && (
                        <span className="text-[9px] font-bold text-rose-800 flex items-center gap-0.5 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                          <AlertCircle className="w-2.5 h-2.5 text-rose-700" /> Mismatch
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-amber-950 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5 text-amber-700" /> Password (min 4) *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showSignupPassword ? 'text' : 'password'}
                            required
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-2 pr-7 py-1 bg-amber-50/95 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 focus:bg-white focus:border-amber-600 focus:outline-hidden transition-all shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="absolute right-1.5 text-amber-800 hover:text-amber-950 p-0.5 cursor-pointer"
                            title={showSignupPassword ? 'Hide' : 'Show'}
                          >
                            {showSignupPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[10px] font-bold text-amber-950 flex items-center gap-1">
                          <KeyRound className="w-2.5 h-2.5 text-amber-700" /> Confirm Password *
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className={`w-full pl-2 pr-7 py-1 bg-amber-50/95 rounded-lg text-xs font-bold text-amber-950 focus:bg-white focus:outline-hidden transition-all shadow-2xs border ${
                              passwordsMismatch ? 'border-rose-400 bg-rose-50' : 'border-amber-300 focus:border-amber-600'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-1.5 text-amber-800 hover:text-amber-950 p-0.5 cursor-pointer"
                            title={showConfirmPassword ? 'Hide' : 'Show'}
                          >
                            {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-1.5 space-y-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-98 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-emerald-500"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting Registration...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Submit Registration</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-emerald-950 font-medium px-1">
                      <span>Already registered?</span>
                      <button
                        type="button"
                        onClick={() => handleSelectAuthMode('login')}
                        className="font-black text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Sign In Here &rarr;</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Micro Footer */}
            <div className="pt-2 mt-3 border-t border-emerald-200/90 flex items-center justify-between text-[10px] text-emerald-900/90 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-700" /> Academic Management
              </span>
              <span className="flex items-center gap-1 text-emerald-950 font-semibold px-2 py-0.5 rounded-md bg-emerald-200/80 border border-emerald-300 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-800" />
                <span>Encrypted Portal</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function PendingApprovalCard({ user }: { user: any }) {
  const { checkSession, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/80 rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-emerald-300/90 text-center space-y-4 relative overflow-hidden backdrop-blur-xs text-xs"
      >
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-2xs">
          <Clock className="w-6 h-6 animate-pulse text-emerald-700" />
        </div>

        <div className="space-y-1">
          <span className="px-2 py-0.5 bg-emerald-200/90 text-emerald-950 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-300 font-mono">
            Status: Pending Approval
          </span>
          <h2 className="text-lg font-bold font-display text-emerald-950">Registration Under Review</h2>
          <p className="text-[11px] text-emerald-900/80 font-medium leading-relaxed">
            Welcome, <span className="font-bold text-emerald-950">{user?.name}</span>! Your student registration has been submitted and is awaiting administrator verification and Student ID (SID) assignment.
          </p>
        </div>

        <div className="bg-emerald-100/80 p-3 rounded-xl border border-emerald-300/80 text-left space-y-1.5 text-xs shadow-2xs">
          <div className="text-emerald-950 font-black uppercase tracking-wider text-[9px] font-mono">
            Account Details:
          </div>
          <div className="text-emerald-950 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-emerald-700" /> Email:</span>
            <span className="text-emerald-800 font-bold">{user?.email}</span>
          </div>
          <div className="text-emerald-950 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-700" /> SID Assignment:</span>
            <span className="text-amber-800 font-bold">Pending Review</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await checkSession();
              setIsRefreshing(false);
            }}
            className="w-full sm:w-auto flex-1 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-200/80 hover:bg-emerald-300/90 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginForm;
