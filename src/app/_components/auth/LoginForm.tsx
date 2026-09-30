'use client';

import React, { useState } from 'react';
import {
  GraduationCap, CheckCircle2, AlertCircle, Lock,
  EyeOff, Eye, Loader2, ArrowRight, ShieldCheck, User,
  Clock, RefreshCw, BookOpen, Sparkles, 
  Phone, Mail, Building, Calendar, Layers, PhoneCall, KeyRound,
  LogOut, MessageSquare, Linkedin, Facebook, ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import DayNightToggle from '@/app/_components/DayNightToggle';

type AuthRole = 'student' | 'admin';
type AuthMode = 'login' | 'signup';

export function LoginForm() {
  const { login } = useAuth();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Role: 'student' vs 'admin'
  const [activeRole, setActiveRole] = useState<AuthRole>('student');
  // Mode: 'login' vs 'signup'
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [rememberMe, setRememberMe] = useState(true);

  // Student Login State
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
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

    if (!studentEmail.trim() || !studentPassword.trim()) {
      setError('Please enter your registered student email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(studentEmail.trim(), studentPassword.trim(), 'student');
    setIsSubmitting(false);

    if (!result.success) {
      setError(cleanErrorMessage(result.error || 'Student authentication failed. Please check credentials.'));
    }
  };

  // ----------------------------------------------------
  // ADMIN LOGIN SUBMIT
  // ----------------------------------------------------
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError('Please enter your Administrator Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(adminEmail.trim(), adminPassword.trim(), 'admin');
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
      setStudentEmail(studentSignupData.email);
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
      setAdminEmail(adminSignupData.email);
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
    <div className="relative min-h-screen w-full flex flex-col justify-between font-sans text-xs select-none transition-colors duration-500">
      
      {/* ========================================================================= */}
      {/* 1. DUAL-THEME SCENIC VECTOR ART ENVIRONMENT                               */}
      {/* ========================================================================= */}
      
      {/* Sky Canvas Gradient */}
      <div 
        className="absolute inset-0 transition-colors duration-700 bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 dark:from-[#0a0518] dark:via-[#1c0d38] dark:to-[#38145a]"
      />

      {/* --- DAY MODE SCENIC ELEMENTS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 dark:opacity-0 opacity-100">
        <div className="absolute top-6 sm:top-8 left-[10%] sm:left-[15%] w-36 sm:w-48 h-36 sm:h-48 bg-amber-300/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-12 sm:top-16 right-[15%] sm:right-[20%] w-48 sm:w-64 h-48 sm:h-64 bg-sky-200/50 rounded-full blur-3xl" />
        
        {/* Floating Clouds */}
        <svg className="absolute top-8 sm:top-12 left-[5%] sm:left-[8%] w-24 sm:w-32 h-12 sm:h-16 text-white/80 filter drop-shadow-sm animate-pulse" viewBox="0 0 100 50" fill="currentColor">
          <path d="M 20,40 A 15,15 0 0,1 35,20 A 22,22 0 0,1 70,18 A 16,16 0 0,1 85,35 A 12,12 0 0,1 78,45 Z" />
        </svg>
        <svg className="absolute top-16 sm:top-20 right-[8%] sm:right-[12%] w-28 sm:w-40 h-14 sm:h-20 text-white/70 filter drop-shadow-sm" viewBox="0 0 100 50" fill="currentColor">
          <path d="M 15,38 A 12,12 0 0,1 30,22 A 20,20 0 0,1 65,20 A 15,15 0 0,1 88,32 A 10,10 0 0,1 80,45 Z" />
        </svg>

        {/* Soaring Birds */}
        <svg className="absolute top-16 sm:top-24 left-[48%] sm:left-[52%] w-4 sm:w-5 h-2.5 sm:h-3 text-sky-800/40" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2,8 Q8,2 12,8 Q16,2 22,8" />
        </svg>
        <svg className="absolute top-14 sm:top-20 left-[53%] sm:left-[56%] w-3.5 sm:w-4 h-2 text-sky-800/40" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2,8 Q8,2 12,8 Q16,2 22,8" />
        </svg>
      </div>

      {/* --- DARK MODE SCENIC ELEMENTS --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 opacity-0 dark:opacity-100">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-purple-600/20 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none animate-pulse" />
        <div className="absolute top-8 left-6 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-16 right-6 w-48 sm:w-72 h-48 sm:h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Star Dots */}
        <div className="absolute top-8 left-[12%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_#fff]" />
        <div className="absolute top-14 left-[28%] w-1 h-1 bg-purple-200 rounded-full opacity-70" />
        <div className="absolute top-20 left-[45%] w-2 h-2 bg-white rounded-full shadow-[0_0_7px_#fff] animate-pulse" />
        <div className="absolute top-10 left-[62%] w-1 h-1 bg-white rounded-full opacity-80" />
        <div className="absolute top-24 left-[78%] w-1.5 h-1.5 bg-pink-200 rounded-full opacity-90" />
        <div className="absolute top-36 left-[88%] w-1 h-1 bg-white rounded-full opacity-70" />
        <div className="absolute top-32 left-[8%] w-1 h-1 bg-indigo-200 rounded-full opacity-80" />
        <div className="absolute top-44 left-[22%] w-2 h-2 bg-white rounded-full shadow-[0_0_6px_#fff] animate-pulse" />
        <div className="absolute top-48 left-[55%] w-1.5 h-1.5 bg-purple-100 rounded-full opacity-90" />
        <div className="absolute top-40 left-[70%] w-1 h-1 bg-white rounded-full opacity-75" />

        {/* 4-Point Stars */}
        <svg className="absolute top-12 left-[18%] w-3.5 sm:w-4 h-3.5 sm:h-4 text-white opacity-85 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
        </svg>
        <svg className="absolute top-28 right-[24%] w-3 sm:w-3.5 h-3 sm:h-3.5 text-purple-200 opacity-90 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L12 24L10 15L1 12L10 9Z" />
        </svg>
      </div>

      {/* Layer 1: Distant Mountains */}
      <svg
        className="absolute bottom-16 sm:bottom-24 left-0 right-0 w-full h-36 sm:h-64 object-cover pointer-events-none transition-colors duration-700 opacity-55"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          className="fill-teal-700 dark:fill-[#4c2275] transition-colors duration-700"
          d="M0,160L48,176C96,192,192,224,288,208C384,192,480,128,576,122.7C672,117,768,171,864,192C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Layer 2: Midground Mountain Peaks */}
      <svg
        className="absolute bottom-8 sm:bottom-12 left-0 right-0 w-full h-32 sm:h-56 object-cover pointer-events-none transition-colors duration-700 opacity-75"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          className="fill-emerald-800 dark:fill-[#311352] transition-colors duration-700"
          d="M0,224L60,208C120,192,240,160,360,170.7C480,181,600,235,720,229.3C840,224,960,160,1080,149.3C1200,139,1320,181,1380,202.7L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>

      {/* Layer 3: Foreground Pine Forest */}
      <div className="absolute -bottom-2 left-0 right-0 w-full h-24 sm:h-48 pointer-events-none opacity-95">
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path
            className="fill-emerald-950 dark:fill-[#150826] transition-colors duration-700"
            d="M0,200 L0,120 L25,100 L40,130 L65,70 L90,130 L115,90 L135,120 L160,60 L185,120 L210,80 L235,130 L260,50 L285,120 L310,90 L335,130 L360,40 L385,120 L410,70 L435,130 L460,90 L485,120 L510,60 L535,130 L560,80 L585,120 L610,30 L635,120 L660,70 L685,130 L710,90 L735,120 L760,50 L785,120 L810,80 L835,130 L860,60 L885,120 L910,90 L935,130 L960,40 L985,120 L1010,70 L1035,130 L1060,90 L1085,120 L1110,50 L1135,120 L1160,80 L1185,130 L1210,60 L1235,120 L1260,90 L1285,130 L1310,40 L1335,120 L1360,70 L1385,130 L1410,90 L1440,110 L1440,200 Z"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP FLOATING GLASS HEADER BAR                                         */}
      {/* ========================================================================= */}
      <nav className="relative z-50 max-w-5xl mx-auto w-full px-2.5 sm:px-6 pt-2.5 sm:pt-5 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* TutorHQ Brand Capsule */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/75 dark:bg-black/30 backdrop-blur-xl border border-white/60 dark:border-white/20 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md shrink-0">
          <div className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-2xs shrink-0">
            {isStudent ? <GraduationCap className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> : <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5" />}
          </div>
          <span className="text-xs sm:text-sm font-display font-black text-slate-900 dark:text-white tracking-tight">
            Tutor<span className="text-emerald-600 dark:text-purple-300">HQ</span>
          </span>
          <span className="text-[8px] sm:text-[8.5px] bg-emerald-100 dark:bg-white/20 text-emerald-900 dark:text-purple-100 font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
            {isStudent ? 'Student' : 'Admin'}
          </span>
        </div>

        {/* Day/Night Capsule Toggle & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <DayNightToggle size="sm" className="shadow-md border-white/40" />

          {/* Role Pill Switch */}
          <div className="flex items-center p-0.5 rounded-full bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-white/60 dark:border-white/20 shadow-md">
            <button
              type="button"
              onClick={() => handleSwitchRole('student')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                isStudent
                  ? 'bg-emerald-600 dark:bg-white text-white dark:text-slate-950 shadow-xs scale-102'
                  : 'text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchRole('admin')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                !isStudent
                  ? 'bg-emerald-600 dark:bg-white text-white dark:text-slate-950 shadow-xs scale-102'
                  : 'text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. CENTERPIECE FROSTED GLASS CARD (RESPONSIVE VIEW)                       */}
      {/* ========================================================================= */}
      <div className="relative z-40 flex-grow flex items-center justify-center px-2.5 sm:px-4 py-4 sm:py-8">
        <motion.div
          key={`${activeRole}-${authMode}`}
          initial={{ opacity: 0, scale: 0.97, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`w-full ${
            authMode === 'signup' && isStudent ? 'max-w-xl' : 'max-w-md'
          } rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/90 dark:border-white/15 shadow-[0_15px_45px_rgba(0,0,0,0.2)] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-500`}
        >
          {/* Ambient Glowing Orbs */}
          <div className="absolute -top-16 -right-16 w-32 sm:w-36 h-32 sm:h-36 bg-emerald-400/25 dark:bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 sm:w-36 h-32 sm:h-36 bg-sky-400/25 dark:bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-3.5 sm:space-y-4">
            
            {/* Header / Title */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-white/10 text-emerald-900 dark:text-purple-200 border border-emerald-300 dark:border-white/20 text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider mb-0.5">
                {isStudent ? <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-purple-300" /> : <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-purple-300" />}
                <span>{isStudent ? 'Student Gateway' : 'Faculty Access'}</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black tracking-tight text-slate-900 dark:text-white">
                {authMode === 'login' ? 'Welcome Back' : 'Create Profile'}
              </h1>
              <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-purple-200/80 font-medium">
                {isStudent 
                  ? (authMode === 'login' ? 'Enter your registered email address and password' : 'Enter your academic details to submit registration') 
                  : (authMode === 'login' ? 'Enter master administrator credentials' : 'Register a verified administrator profile')}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 sm:p-3 bg-rose-50 dark:bg-rose-500/25 border border-rose-300 dark:border-rose-400/40 text-rose-800 dark:text-rose-100 rounded-xl sm:rounded-2xl flex items-start gap-2 text-xs backdrop-blur-md shadow-xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-300 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-snug">{error}</div>
              </motion.div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-500/25 border border-emerald-300 dark:border-emerald-400/40 text-emerald-800 dark:text-emerald-100 rounded-xl sm:rounded-2xl flex items-start gap-2 text-xs backdrop-blur-md shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-snug">{successMsg}</div>
              </motion.div>
            )}

            {/* =================================================================== */}
            {/* 1. STUDENT LOGIN FORM WITH HEADINGS                                 */}
            {/* =================================================================== */}
            {isStudent && authMode === 'login' && (
              <form onSubmit={handleStudentLogin} className="space-y-3 sm:space-y-3.5">
                {/* Field 1: Student Email */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Student Email Address</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@email.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full bg-white dark:bg-white/10 hover:bg-white focus:bg-white dark:hover:bg-white/15 dark:focus:bg-white/20 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2.5 px-3.5 sm:px-4 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden transition-all duration-200 shadow-2xs"
                    />
                    <div className="absolute right-3.5 text-slate-400 dark:text-white/70 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Field 2: Password */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Password</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showStudentLoginPass ? 'text' : 'password'}
                      required
                      placeholder="Enter your security password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="w-full bg-white dark:bg-white/10 hover:bg-white focus:bg-white dark:hover:bg-white/15 dark:focus:bg-white/20 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2.5 px-3.5 sm:px-4 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden transition-all duration-200 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentLoginPass(!showStudentLoginPass)}
                      className="absolute right-3.5 text-slate-400 dark:text-white/70 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title={showStudentLoginPass ? 'Hide Password' : 'Show Password'}
                    >
                      {showStudentLoginPass ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Help Row */}
                <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-600 dark:text-white/80 px-1 pt-0.5">
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm bg-white dark:bg-white/20 border-slate-300 dark:border-white/40 text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Please contact your instructor or administrator with your registered email to reset your passcode.')}
                    className="hover:underline cursor-pointer hover:text-emerald-700 dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Pill Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white dark:text-slate-950" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Login as Student</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Bottom Toggle Prompt */}
                <div className="text-center pt-1.5 text-xs text-slate-600 dark:text-white/80">
                  <span>New Student? </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="font-black text-emerald-700 dark:text-white underline hover:text-emerald-800 dark:hover:text-purple-200 cursor-pointer transition-colors"
                  >
                    Register Account
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* 2. STUDENT REGISTRATION FORM WITH HEADINGS                          */}
            {/* =================================================================== */}
            {isStudent && authMode === 'signup' && (
              <form onSubmit={handleStudentSignup} className="space-y-2.5 sm:space-y-3">
                {/* Row 1: Full Name & College */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <User className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sakibul Hasan"
                      value={studentSignupData.name}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, name: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>College / School</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Notre Dame College"
                      value={studentSignupData.college}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, college: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>
                </div>

                {/* Row 2: HSC Batch, Group, Subject */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>HSC Batch</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HSC 2026"
                      value={studentSignupData.hscBatch}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, hscBatch: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Academic Group</span>
                    </label>
                    <select
                      value={studentSignupData.group}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, group: e.target.value })}
                      className="w-full bg-white dark:bg-purple-950 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white outline-hidden cursor-pointer"
                    >
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>

                  <div className="space-y-1 xs:col-span-2 sm:col-span-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Enrolled Subject</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ICT / Physics"
                      value={studentSignupData.subject}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, subject: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>
                </div>

                {/* Row 3: Student Mobile & Guardian Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Student Mobile Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01712345678"
                      value={studentSignupData.mobile}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, mobile: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Guardian's Mobile</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 01812345678"
                      value={studentSignupData.guardiansPhone}
                      onChange={(e) => setStudentSignupData({ ...studentSignupData, guardiansPhone: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>
                </div>

                {/* Row 4: Email Address */}
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Email Address (Login Identifier) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={studentSignupData.email}
                    onChange={(e) => setStudentSignupData({ ...studentSignupData, email: e.target.value })}
                    className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                  />
                </div>

                {/* Row 5: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Create Password *</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showStudentSignupPass ? 'text' : 'password'}
                        required
                        placeholder="Min. 4 characters"
                        value={studentSignupData.password}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, password: e.target.value })}
                        className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 pr-9 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentSignupPass(!showStudentSignupPass)}
                        className="absolute right-2.5 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title={showStudentSignupPass ? 'Hide' : 'Show'}
                      >
                        {showStudentSignupPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Confirm Password *</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showStudentConfirmPass ? 'text' : 'password'}
                        required
                        placeholder="Re-type password"
                        value={studentSignupData.confirmPassword}
                        onChange={(e) => setStudentSignupData({ ...studentSignupData, confirmPassword: e.target.value })}
                        className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 pr-9 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentConfirmPass(!showStudentConfirmPass)}
                        className="absolute right-2.5 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title={showStudentConfirmPass ? 'Hide' : 'Show'}
                      >
                        {showStudentConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-1.5 py-2.5 sm:py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white dark:text-slate-950" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <span>Submit Student Registration</span>
                  )}
                </button>

                <div className="text-center pt-1 text-xs text-slate-600 dark:text-white/80">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="font-black text-emerald-700 dark:text-white underline hover:text-emerald-800 dark:hover:text-purple-200 cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* 3. ADMIN LOGIN FORM WITH HEADINGS                                   */}
            {/* =================================================================== */}
            {!isStudent && authMode === 'login' && (
              <form onSubmit={handleAdminLogin} className="space-y-3 sm:space-y-3.5">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Administrator Email Address</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      placeholder="admin@tutorhq.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-white dark:bg-white/10 hover:bg-white focus:bg-white dark:hover:bg-white/15 dark:focus:bg-white/20 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2.5 px-3.5 sm:px-4 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden transition-all duration-200 shadow-2xs"
                    />
                    <div className="absolute right-3.5 text-slate-400 dark:text-white/70 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Administrator Security Password</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showAdminLoginPass ? 'text' : 'password'}
                      required
                      placeholder="Enter administrator password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-white dark:bg-white/10 hover:bg-white focus:bg-white dark:hover:bg-white/15 dark:focus:bg-white/20 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2.5 px-3.5 sm:px-4 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden transition-all duration-200 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminLoginPass(!showAdminLoginPass)}
                      className="absolute right-3.5 text-slate-400 dark:text-white/70 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                      title={showAdminLoginPass ? 'Hide Password' : 'Show Password'}
                    >
                      {showAdminLoginPass ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-600 dark:text-white/80 px-1 pt-0.5">
                  <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:text-slate-950 dark:hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm bg-white dark:bg-white/20 border-slate-300 dark:border-white/40 text-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Faculty Admin: Master credentials managed via server environment configuration.')}
                    className="hover:underline cursor-pointer hover:text-emerald-700 dark:hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white dark:text-slate-950" />
                      <span>Authenticating Faculty...</span>
                    </>
                  ) : (
                    <>
                      <span>Login as Admin</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-1.5 text-xs text-slate-600 dark:text-white/80">
                  <span>New administrator? </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('signup')}
                    className="font-black text-emerald-700 dark:text-white underline hover:text-emerald-800 dark:hover:text-purple-200 cursor-pointer transition-colors"
                  >
                    Register Faculty Profile
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* 4. ADMIN REGISTRATION FORM WITH HEADINGS                            */}
            {/* =================================================================== */}
            {!isStudent && authMode === 'signup' && (
              <form onSubmit={handleAdminSignup} className="space-y-2.5 sm:space-y-3">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <User className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Full Administrator Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Sakibul Hasan"
                    value={adminSignupData.name}
                    onChange={(e) => setAdminSignupData({ ...adminSignupData, name: e.target.value })}
                    className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Admin Email *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      value={adminSignupData.email}
                      onChange={(e) => setAdminSignupData({ ...adminSignupData, email: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Contact Phone</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 01712345678"
                      value={adminSignupData.phone}
                      onChange={(e) => setAdminSignupData({ ...adminSignupData, phone: e.target.value })}
                      className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                    <span>Master Security Secret Key *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter system master security key"
                    value={adminSignupData.adminSecret}
                    onChange={(e) => setAdminSignupData({ ...adminSignupData, adminSecret: e.target.value })}
                    className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Password *</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showAdminSignupPass ? 'text' : 'password'}
                        required
                        placeholder="Min. 4 characters"
                        value={adminSignupData.password}
                        onChange={(e) => setAdminSignupData({ ...adminSignupData, password: e.target.value })}
                        className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 pr-9 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminSignupPass(!showAdminSignupPass)}
                        className="absolute right-2.5 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title={showAdminSignupPass ? 'Hide' : 'Show'}
                      >
                        {showAdminSignupPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-slate-700 dark:text-purple-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" />
                      <span>Confirm Password *</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showAdminConfirmPass ? 'text' : 'password'}
                        required
                        placeholder="Re-type password"
                        value={adminSignupData.confirmPassword}
                        onChange={(e) => setAdminSignupData({ ...adminSignupData, confirmPassword: e.target.value })}
                        className="w-full bg-white dark:bg-white/10 border border-slate-300 dark:border-white/30 focus:border-emerald-500 dark:focus:border-white rounded-xl py-2 px-3 pr-9 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/60 outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminConfirmPass(!showAdminConfirmPass)}
                        className="absolute right-2.5 text-slate-400 dark:text-white/60 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title={showAdminConfirmPass ? 'Hide' : 'Show'}
                      >
                        {showAdminConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-1.5 py-2.5 sm:py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white dark:text-slate-950" />
                      <span>Creating Admin Profile...</span>
                    </>
                  ) : (
                    <span>Create Administrator Account</span>
                  )}
                </button>

                <div className="text-center pt-1 text-xs text-slate-600 dark:text-white/80">
                  <span>Already have an Admin account? </span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('login')}
                    className="font-black text-emerald-700 dark:text-white underline hover:text-emerald-800 dark:hover:text-purple-200 cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </form>
            )}

          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FULL PORTAL FOOTER IN LOGIN PAGE                                      */}
      {/* ========================================================================= */}
      <footer className="relative z-40 max-w-5xl mx-auto w-full px-2.5 sm:px-6 pb-4 sm:pb-6 pt-2 font-sans text-[11px]">
        <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-white/75 dark:border-white/20 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-lg text-slate-800 dark:text-slate-200 space-y-2.5">
          
          {/* Top Row: Brand Info + Contacts + Socials */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
            
            {/* Brand & Purpose Box */}
            <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black font-display text-slate-900 dark:text-white tracking-tight">
                    Academic Portal
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                    Official Ledger
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 bg-teal-100 dark:bg-teal-950/60 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800/60 rounded">
                    <ShieldCheck className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Verified</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-purple-200/80 leading-tight">
                  Academic tracking, daily study logs, exam results &amp; payments.
                </p>
              </div>
            </div>

            {/* Direct Contact */}
            <div className="md:col-span-4 grid grid-cols-2 gap-1.5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/8801516518418"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-white/15 text-slate-900 dark:text-white transition-all text-[10px] group shadow-2xs truncate"
                title="WhatsApp: 01516518418"
              >
                <div className="p-1 rounded-md bg-emerald-600 text-white shrink-0">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[8px] text-slate-500 dark:text-purple-300 font-bold uppercase">WhatsApp</span>
                  <span className="font-bold text-slate-900 dark:text-white text-[10px] truncate">01516518418</span>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:sakibhasan.office@gmail.com"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-white/15 text-slate-900 dark:text-white transition-all text-[10px] group shadow-2xs truncate"
                title="Email: sakibhasan.office@gmail.com"
              >
                <div className="p-1 rounded-md bg-sky-600 text-white shrink-0">
                  <Mail className="w-3 h-3" />
                </div>
                <div className="flex flex-col min-w-0 leading-tight">
                  <span className="text-[8px] text-slate-500 dark:text-purple-300 font-bold uppercase">Email</span>
                  <span className="font-bold text-slate-900 dark:text-white text-[10px] truncate">sakibhasan</span>
                </div>
              </a>
            </div>

            {/* Social Profiles */}
            <div className="md:col-span-3 grid grid-cols-2 gap-1.5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/Sakib.2004043/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-white/15 text-slate-900 dark:text-white transition-all text-[10px] font-semibold shadow-2xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                    <Facebook className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-[10px] truncate">Facebook</span>
                </div>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400 dark:text-purple-300 shrink-0" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/sakibul-hasan-ab9526318"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-white/10 border border-slate-200 dark:border-white/15 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-white/15 text-slate-900 dark:text-white transition-all text-[10px] font-semibold shadow-2xs"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0">
                    <Linkedin className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-[10px] truncate">LinkedIn</span>
                </div>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400 dark:text-purple-300 shrink-0" />
              </a>
            </div>

          </div>

          {/* Bottom Sub-bar */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9.5px] sm:text-[10px] text-slate-600 dark:text-purple-200/80 font-medium">
            <p>© {new Date().getFullYear()} TutorHQ Academic Management Portal. All rights reserved.</p>
            <p className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Built for Academic Excellence</span>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

export function PendingApprovalCard({ user }: { user: any }) {
  const { checkSession, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-4 sm:py-6 px-2.5 sm:px-3 relative z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/90 dark:bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-slate-200 dark:border-white/25 text-slate-900 dark:text-white text-center space-y-3.5 sm:space-y-4 relative overflow-hidden"
      >
        <div className="w-12 sm:w-14 h-12 sm:h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-white/20 text-amber-700 dark:text-white border border-amber-300 dark:border-white/30 flex items-center justify-center shadow-md">
          <Clock className="w-6 sm:w-7 h-6 sm:h-7 animate-pulse text-amber-600 dark:text-purple-200" />
        </div>

        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-white/20 text-amber-900 dark:text-white text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider rounded-full border border-amber-300 dark:border-white/30 font-mono">
            Status: Pending Approval
          </span>
          <h2 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white pt-1.5">Registration Under Review</h2>
          <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-white/80 font-medium leading-relaxed">
            Welcome, <span className="font-black text-slate-900 dark:text-white">{user?.name}</span>! Your student registration has been submitted and is awaiting administrator verification and Student ID (SID) assignment.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-white/10 backdrop-blur-md p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-white/20 text-left space-y-2 text-xs">
          <div className="text-slate-500 dark:text-purple-200 font-black uppercase tracking-wider text-[9px] font-mono">
            Account Details:
          </div>
          <div className="text-slate-800 dark:text-white font-semibold flex items-center justify-between text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" /> Email:</span>
            <span className="text-slate-900 dark:text-purple-100 font-bold truncate ml-2">{user?.email}</span>
          </div>
          <div className="text-slate-800 dark:text-white font-semibold flex items-center justify-between text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-purple-300 shrink-0" /> SID Assignment:</span>
            <span className="text-amber-800 dark:text-amber-200 font-black bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-400/40 text-[10px]">Pending Review</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1.5">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await checkSession();
              setIsRefreshing(false);
            }}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-200 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/30 text-slate-800 dark:text-white border border-slate-300 dark:border-white/30 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
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
