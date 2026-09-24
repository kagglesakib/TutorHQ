'use client';

import React, { useState } from 'react';
import {
  GraduationCap, CheckCircle2, AlertCircle, UserCheck, Lock,
  EyeOff, Eye, Loader2, ArrowRight, UserPlus, ShieldCheck, User,
  Eraser, Clock, RefreshCw, BookOpen, Award, Sparkles, 
  Phone, Mail, Building, Calendar, Layers, PhoneCall, KeyRound,
  Check, LogOut, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

type AuthRole = 'student' | 'admin';
type AuthMode = 'login' | 'signup';

export function LoginForm() {
  const { login } = useAuth();

  // Role: 'student' vs 'admin'
  const [activeRole, setActiveRole] = useState<AuthRole>('student');
  // Mode: 'login' vs 'signup'
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Student Login State
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin Login State
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Student Signup State
  const [studentSignupData, setStudentSignupData] = useState({
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

  // Admin Signup State
  const [adminSignupData, setAdminSignupData] = useState({
    name: '',
    email: '',
    phone: '',
    adminSecret: 'ADMIN2026',
    password: '',
    confirmPassword: '',
  });

  // Password Visibility Toggles
  const [showStudentLoginPass, setShowStudentLoginPass] = useState(false);
  const [showAdminLoginPass, setShowAdminLoginPass] = useState(false);
  const [showStudentSignupPass, setShowStudentSignupPass] = useState(false);
  const [showStudentConfirmPass, setShowStudentConfirmPass] = useState(false);
  const [showAdminSignupPass, setShowAdminSignupPass] = useState(false);
  const [showAdminConfirmPass, setShowAdminConfirmPass] = useState(false);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cleanErrorMessage = (msg: string | null | undefined): string => {
    if (!msg) return 'An unexpected error occurred.';
    const lower = msg.toLowerCase();
    if (
      lower.includes('unexpected token') ||
      lower.includes('is not valid json') ||
      lower.includes('<html>') ||
      lower.includes('<!doctype') ||
      lower.includes('syntaxerror')
    ) {
      return 'Unable to process request due to a temporary server issue. Please try again.';
    }
    return msg;
  };

  const handleSwitchRole = (role: AuthRole) => {
    setActiveRole(role);
    setError(null);
    setSuccessMsg(null);
  };

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
  };

  // ----------------------------------------------------
  // STUDENT LOGIN SUBMIT
  // ----------------------------------------------------
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!studentIdentifier.trim() || !studentPassword.trim()) {
      setError('Please enter your Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(studentIdentifier.trim(), studentPassword.trim(), 'student');
    setIsSubmitting(false);

    if (!result.success) {
      setError(cleanErrorMessage(result.error || 'Student authentication failed.'));
    }
  };

  // ----------------------------------------------------
  // ADMIN LOGIN SUBMIT
  // ----------------------------------------------------
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!adminIdentifier.trim() || !adminPassword.trim()) {
      setError('Please enter your Administrator Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(adminIdentifier.trim(), adminPassword.trim(), 'admin');
    setIsSubmitting(false);

    if (!result.success) {
      setError(cleanErrorMessage(result.error || 'Administrator authentication failed.'));
    }
  };

  // ----------------------------------------------------
  // STUDENT SIGNUP SUBMIT
  // ----------------------------------------------------
  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!studentSignupData.name.trim() || !studentSignupData.mobile.trim() || !studentSignupData.email.trim() || !studentSignupData.password) {
      setError('Full Name, Mobile Number, Email Address, and Password are required.');
      return;
    }

    if (studentSignupData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (studentSignupData.password !== studentSignupData.confirmPassword) {
      setError('Passwords do not match. Please verify password confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          ...studentSignupData,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setError(cleanErrorMessage(data.error || 'Student registration failed.'));
        return;
      }

      setSuccessMsg(`Student registration submitted for ${studentSignupData.name}! Your account is pending admin approval.`);
      setStudentIdentifier(studentSignupData.email);
      setStudentPassword(studentSignupData.password);
      setAuthMode('login');
      setActiveRole('student');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(cleanErrorMessage(err?.message || 'Registration request failed.'));
    }
  };

  // ----------------------------------------------------
  // ADMIN SIGNUP SUBMIT
  // ----------------------------------------------------
  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!adminSignupData.name.trim() || !adminSignupData.email.trim() || !adminSignupData.password) {
      setError('Full Name, Email Address, and Password are required for admin registration.');
      return;
    }

    if (adminSignupData.password.length < 4) {
      setError('Admin password must be at least 4 characters long.');
      return;
    }

    if (adminSignupData.password !== adminSignupData.confirmPassword) {
      setError('Passwords do not match. Please verify password confirmation.');
      return;
    }

    if (!adminSignupData.adminSecret.trim()) {
      setError('Admin Security Key is required to create an administrator profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'admin',
          ...adminSignupData,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setError(cleanErrorMessage(data.error || 'Admin registration failed.'));
        return;
      }

      setSuccessMsg(`Administrator account registered for ${adminSignupData.name}! You can now sign in.`);
      setAdminIdentifier(adminSignupData.email);
      setAdminPassword(adminSignupData.password);
      setAuthMode('login');
      setActiveRole('admin');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(cleanErrorMessage(err?.message || 'Admin registration failed.'));
    }
  };

  const isStudent = activeRole === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-100 flex flex-col justify-between -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 font-sans text-xs">
      
      {/* ========================================================= */}
      {/* TOP HEADER NAVBAR WITH ROLE TOGGLE */}
      {/* ========================================================= */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 transition-all">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            {isStudent ? <GraduationCap className="w-4.5 h-4.5" /> : <ShieldCheck className="w-4.5 h-4.5" />}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm sm:text-base font-black font-display text-white tracking-tight whitespace-nowrap">
              Tutor<span className="text-emerald-400">HQ</span>
            </span>
            <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[9px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 hidden min-[440px]:inline-block">
              {isStudent ? 'Student Portal' : 'Admin Control'}
            </span>
          </div>
        </div>

        {/* Primary Role Switcher */}
        <div className="flex items-center gap-1.5">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchRole('student')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                isStudent
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('admin')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                !isStudent
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================= */}
      {/* MAIN AUTHENTICATION CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-grow pt-16 sm:pt-20 pb-8 px-3 sm:px-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          
          {/* ======================================================= */}
          {/* LEFT CONTEXT CARD (ROLE-THEMED) */}
          {/* ======================================================= */}
          <motion.div
            key={`left-${activeRole}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:col-span-5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xl border relative overflow-hidden text-white ${
              isStudent
                ? 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border-emerald-800/60'
                : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-indigo-800/60'
            }`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
              isStudent ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
            }`} />
            
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold backdrop-blur-md bg-slate-900/60 border-slate-700">
                {isStudent ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-300">Student Academic Ledger</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3 h-3 text-indigo-400" />
                    <span className="text-indigo-300">Administrative Governance</span>
                  </>
                )}
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-display font-black leading-tight text-white">
                  {isStudent ? 'Student Access Portal' : 'Faculty & Admin Console'}
                </h2>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isStudent
                    ? 'Track your daily lecture logs, upcoming exam schedules, rank results, and verified tuition payment receipts.'
                    : 'Manage enrolled student rosters, publish lesson activities, record exam evaluations, and track tuition collection.'}
                </p>
              </div>

              {/* Quick Feature Highlights */}
              <div className="space-y-2 pt-2">
                {isStudent ? (
                  <>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-900/30 border border-emerald-700/30">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-emerald-100">Live Exam Analytics</h4>
                        <p className="text-[10px] text-emerald-300/80">Monitor test scores, grading remarks, and class ranking.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-teal-900/30 border border-teal-700/30">
                      <BookOpen className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-teal-100">Daily Study Records</h4>
                        <p className="text-[10px] text-teal-300/80">Review covered topics, syllabus milestones, and homework tasks.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-indigo-900/30 border border-indigo-700/30">
                      <UserCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-indigo-100">Student Enrollment Control</h4>
                        <p className="text-[10px] text-indigo-300/80">Approve registrations, assign SIDs, and manage access.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/40 border border-slate-700/40">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-slate-100">Ledger & Financial Audits</h4>
                        <p className="text-[10px] text-slate-300/80">Record tuition dues, log payments, and export database backups.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Switch Helper */}
            <div className="pt-4 mt-4 border-t border-slate-800 relative z-10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">
                {isStudent ? 'Are you an admin?' : 'Are you a student?'}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchRole(isStudent ? 'admin' : 'student')}
                className="font-bold underline cursor-pointer hover:text-white transition-colors flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
              >
                <span>Switch to {isStudent ? 'Admin' : 'Student'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* ======================================================= */}
          {/* RIGHT FORM CONTAINER (CARD WITH LOGIN / SIGNUP) */}
          {/* ======================================================= */}
          <div
            id="auth-form-card"
            className={`md:col-span-7 rounded-2xl p-4 sm:p-6 border-2 shadow-xl flex flex-col justify-between backdrop-blur-xs transition-colors ${
              isStudent
                ? 'bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/70 border-emerald-300/90'
                : 'bg-gradient-to-br from-indigo-50/95 via-slate-50/90 to-indigo-100/70 border-indigo-300/90'
            }`}
          >
            <div className="space-y-4">
              {/* Header with Sub-tabs (Sign In vs Sign Up) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3 border-slate-300/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                      isStudent ? 'bg-emerald-200 text-emerald-900 border border-emerald-300' : 'bg-indigo-200 text-indigo-900 border border-indigo-300'
                    }`}>
                      {isStudent ? 'Student Account' : 'Admin Account'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black font-display text-slate-900">
                      {isStudent
                        ? (authMode === 'login' ? 'Student Sign In' : 'Student Registration')
                        : (authMode === 'login' ? 'Administrator Sign In' : 'Administrator Sign Up')}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {isStudent
                      ? (authMode === 'login' ? 'Sign in with your Email' : 'Submit your academic details for admission')
                      : (authMode === 'login' ? 'Sign in with your Email & password' : 'Create a new authorized administrator profile')}
                  </p>
                </div>

                {/* Sub-mode Segmented Buttons */}
                <div className="inline-flex p-0.5 rounded-xl bg-slate-200/80 border border-slate-300 shadow-inner self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      authMode === 'login'
                        ? (isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      authMode === 'signup'
                        ? (isStudent ? 'bg-emerald-600 text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl flex items-start gap-2 text-xs shadow-xs"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{error}</div>
                </motion.div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-start gap-2 text-xs shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{successMsg}</div>
                </motion.div>
              )}

              {/* ===================================================== */}
              {/* 1. STUDENT LOGIN FORM */}
              {/* ===================================================== */}
              {isStudent && authMode === 'login' && (
                <form onSubmit={handleStudentLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Students Email</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={studentIdentifier}
                      onChange={(e) => setStudentIdentifier(e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Student Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowStudentLoginPass(!showStudentLoginPass)}
                        className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer flex items-center gap-1"
                      >
                        {showStudentLoginPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showStudentLoginPass ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showStudentLoginPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Student Access...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Sign In to Student Portal</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudentIdentifier('');
                        setStudentPassword('');
                        setError(null);
                      }}
                      className="p-2.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-xs"
                      title="Clear Inputs"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('signup')}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Don&apos;t have an account? Submit Student Registration &rarr;
                    </button>
                  </div>
                </form>
              )}

              {/* ===================================================== */}
              {/* 2. STUDENT SIGNUP FORM */}
              {/* ===================================================== */}
              {isStudent && authMode === 'signup' && (
                <form onSubmit={handleStudentSignup} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-700" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={studentSignupData.name}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <Building className="w-3 h-3 text-emerald-700" /> College / School
                      </label>
                      <input
                        type="text"
                        value={studentSignupData.college}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, college: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-700" /> HSC Batch
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2025 / 2026"
                        value={studentSignupData.hscBatch}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, hscBatch: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-700" /> Group
                      </label>
                      <select
                        value={studentSignupData.group}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, group: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      >
                        <option value="Science">Science</option>
                        <option value="Commerce">Commerce</option>
                        <option value="Arts">Arts</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-700" /> Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Math, Physics"
                        value={studentSignupData.subject}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, subject: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-700" /> Student Mobile *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 01700000000"
                        value={studentSignupData.mobile}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, mobile: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-emerald-700" /> Guardian&apos;s Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 01800000000"
                        value={studentSignupData.guardiansPhone}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, guardiansPhone: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-700" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@example.com"
                      value={studentSignupData.email}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, email: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-700" /> Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowStudentSignupPass(!showStudentSignupPass)}
                          className="text-[9px] text-emerald-800 font-bold"
                        >
                          {showStudentSignupPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showStudentSignupPass ? 'text' : 'password'}
                        required
                        placeholder="At least 4 characters"
                        value={studentSignupData.password}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, password: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 focus:border-emerald-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Confirm Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowStudentConfirmPass(!showStudentConfirmPass)}
                          className="text-[9px] text-emerald-800 font-bold"
                        >
                          {showStudentConfirmPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showStudentConfirmPass ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={studentSignupData.confirmPassword}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, confirmPassword: e.target.value })}
                        className={`w-full px-2.5 py-1.5 bg-white/90 border rounded-lg text-xs font-semibold text-slate-900 outline-none ${
                          studentSignupData.confirmPassword && studentSignupData.password !== studentSignupData.confirmPassword
                            ? 'border-rose-400 focus:border-rose-600'
                            : 'border-emerald-300 focus:border-emerald-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Submitting Registration...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Submit Student Registration</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Already registered? Sign in with Student ID &rarr;
                    </button>
                  </div>
                </form>
              )}

              {/* ===================================================== */}
              {/* 3. ADMIN LOGIN FORM */}
              {/* ===================================================== */}
              {!isStudent && authMode === 'login' && (
                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Administrator Email</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 border border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Administrator Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAdminLoginPass(!showAdminLoginPass)}
                        className="text-[10px] text-indigo-800 hover:text-indigo-950 font-bold cursor-pointer flex items-center gap-1"
                      >
                        {showAdminLoginPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showAdminLoginPass ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <input
                      type={showAdminLoginPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white/90 border border-indigo-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Admin Credentials...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Sign In to Admin Workspace</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdminIdentifier('');
                        setAdminPassword('');
                        setError(null);
                      }}
                      className="p-2.5 bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl transition-all cursor-pointer shadow-xs"
                      title="Clear Inputs"
                    >
                      <Eraser className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('signup')}
                      className="text-[11px] font-bold text-indigo-800 hover:text-indigo-950 underline cursor-pointer"
                    >
                      Need a new Administrator profile? Register here &rarr;
                    </button>
                  </div>
                </form>
              )}

              {/* ===================================================== */}
              {/* 4. ADMIN SIGNUP FORM */}
              {/* ===================================================== */}
              {!isStudent && authMode === 'signup' && (
                <form onSubmit={handleAdminSignup} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-indigo-700" /> Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={adminSignupData.name}
                        onChange={(e) => setAdminSignupData({ ...adminSignupData, name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white/90 border border-indigo-300 focus:border-indigo-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-indigo-700" /> Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={adminSignupData.phone}
                        onChange={(e) => setAdminSignupData({ ...adminSignupData, phone: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white/90 border border-indigo-300 focus:border-indigo-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-700" /> Official Administrator Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={adminSignupData.email}
                      onChange={(e) => setAdminSignupData({ ...adminSignupData, email: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white/90 border border-indigo-300 focus:border-indigo-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-indigo-700" /> Admin Security Passcode *
                      </label>
                      <span className="text-[9px] text-indigo-700 font-mono font-bold">Default: ADMIN2026</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={adminSignupData.adminSecret}
                      onChange={(e) => setAdminSignupData({ ...adminSignupData, adminSecret: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white/90 border border-indigo-300 focus:border-indigo-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-indigo-700" /> Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAdminSignupPass(!showAdminSignupPass)}
                          className="text-[9px] text-indigo-800 font-bold"
                        >
                          {showAdminSignupPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showAdminSignupPass ? 'text' : 'password'}
                        required
                        placeholder="At least 4 characters"
                        value={adminSignupData.password}
                        onChange={(e) => setAdminSignupData({ ...adminSignupData, password: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white/90 border border-indigo-300 focus:border-indigo-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-indigo-700" /> Confirm Password *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAdminConfirmPass(!showAdminConfirmPass)}
                          className="text-[9px] text-indigo-800 font-bold"
                        >
                          {showAdminConfirmPass ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <input
                        type={showAdminConfirmPass ? 'text' : 'password'}
                        required
                        placeholder="Re-enter password"
                        value={adminSignupData.confirmPassword}
                        onChange={(e) => setAdminSignupData({ ...adminSignupData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white/90 border border-indigo-300 focus:border-indigo-600 rounded-lg text-xs font-semibold text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating Administrator Account...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Create Administrator Account</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-[11px] font-bold text-indigo-800 hover:text-indigo-950 underline cursor-pointer"
                    >
                      Already have an Admin account? Sign In &rarr;
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Micro Footer */}
            <div className="pt-3 mt-4 border-t border-slate-300/80 flex items-center justify-between text-[10px] text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className={`w-3 h-3 ${isStudent ? 'text-emerald-700' : 'text-indigo-700'}`} />
                <span>Academic Record Management</span>
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 border border-slate-300 text-slate-800 font-bold shadow-2xs">
                <ShieldCheck className={`w-3 h-3 ${isStudent ? 'text-emerald-700' : 'text-indigo-700'}`} />
                <span>Protected Sessions</span>
              </span>
            </div>
          </div>
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
