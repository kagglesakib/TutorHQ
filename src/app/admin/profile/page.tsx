'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, ShieldCheck, KeyRound, Lock, Eye, EyeOff, CheckCircle2, 
  AlertTriangle, ShieldAlert, Sparkles, Mail, Fingerprint, Calendar,
  Database, ArrowLeft, RefreshCw, Shield, Server, Check, Copy, Activity,
  LockKeyhole, CheckCircle, Zap, Cpu, Flame, ChevronRight, Layers,
  Terminal, ShieldCheck as ShieldIcon, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

export default function AdminProfilePage() {
  const { user } = useAuth();
  
  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // System stats state
  const [stats, setStats] = useState({
    students: 0,
    exams: 0,
    lessons: 0,
    payments: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [resStudents, resExams, resActivities, resPayments] = await Promise.all([
          fetch('/api/students', { cache: 'no-store' }),
          fetch('/api/exams', { cache: 'no-store' }),
          fetch('/api/activities', { cache: 'no-store' }),
          fetch('/api/payments', { cache: 'no-store' }),
        ]);

        const students = resStudents.ok ? await resStudents.json() : [];
        const exams = resExams.ok ? await resExams.json() : [];
        const activities = resActivities.ok ? await resActivities.json() : [];
        const payments = resPayments.ok ? await resPayments.json() : [];

        setStats({
          students: Array.isArray(students) ? students.length : 0,
          exams: Array.isArray(exams) ? exams.length : 0,
          lessons: Array.isArray(activities) ? activities.length : 0,
          payments: Array.isArray(payments) ? payments.length : 0,
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700', text: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 4) return { score: 2, label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' };
    return { score: 3, label: 'Rock Solid', color: 'bg-orange-500', text: 'text-orange-400' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPassword) {
      setErrorMsg('Current (old) password is required.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setErrorMsg('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
          sid: user?.sid || 'ADMIN',
          email: user?.email || 'sakib1514817122@gmail.com',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to update password.');
      }

      setSuccessMsg(data.message || 'Admin password updated successfully! Keep your new password secure.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const adminName = user?.name || 'Engr. Sakibul Hasan';
  const adminEmail = user?.email || 'sakib1514817122@gmail.com';
  const adminSid = user?.sid || 'ADMIN';

  return (
    <div className="space-y-3 sm:space-y-4 pb-12 max-w-7xl mx-auto px-2.5 sm:px-4 pt-2.5 sm:pt-3.5 w-full min-w-0 overflow-hidden">
      
      {/* 1. TOP AESTHETIC ORANGE GLOW COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 border border-orange-500/40 p-3 sm:p-4.5 shadow-[0_0_35px_rgba(249,115,22,0.18)]">
        {/* Ambient Warm Sunset Backlight Gradients */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          
          {/* Left Title & Glowing Status Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Link
              href="/admin"
              className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 shadow-inner"
              title="Back to Overview Portal"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
            </Link>

            <div className="relative p-2.5 bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-500 text-white rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.5)] shrink-0 border border-orange-300/50">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-slate-950 animate-ping" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-display font-black text-white tracking-tight flex items-center gap-1.5">
                  Admin Profile <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400">&amp; Security Hub</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-400/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                  <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                  ROOT MASTER
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-orange-200/80 font-medium truncate mt-0.5">
                Master Credentials, Security Management &amp; System Authentication
              </p>
            </div>
          </div>

          {/* Right Action Hub Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <Link
              href="/admin"
              className="flex-1 sm:flex-none px-3 py-1.5 sm:py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Overview</span>
            </Link>

            <Link
              href="/admin/backup"
              className="flex-1 sm:flex-none px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-orange-950 via-amber-950 to-slate-900 hover:from-orange-900 hover:to-amber-900 text-orange-200 hover:text-white text-xs font-black rounded-xl border border-orange-500/50 hover:border-orange-400/70 shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Database className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>Database Backup</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. MAIN 2-COLUMN ADAPTIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 w-full min-w-0">
        
        {/* LEFT COLUMN: Glowing Amber/Orange Admin ID & System Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-3 sm:space-y-4 w-full min-w-0">
          
          {/* Holographic Amber/Orange Master Admin ID Card */}
          <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-orange-500/35 shadow-[0_0_25px_rgba(249,115,22,0.1)] overflow-hidden relative backdrop-blur-xl">
            
            {/* Header Identity Glow Zone */}
            <div className="bg-gradient-to-br from-slate-950 via-orange-950/90 to-slate-950 p-4 sm:p-4.5 border-b border-orange-500/30 relative">
              <div className="flex items-center justify-between gap-2.5">
                
                <div className="flex items-center gap-3 min-w-0">
                  {/* Glowing Amber Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(249,115,22,0.5)] flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-orange-400 font-black text-sm font-mono tracking-wider">
                        HQ
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-slate-950 rounded-full">
                      <span className="block w-3 h-3 bg-orange-400 rounded-full border-2 border-slate-950 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight">
                      {adminName}
                    </h2>
                    <p className="text-[11px] text-orange-300 font-mono font-medium flex items-center gap-1.5 truncate mt-0.5">
                      <Mail className="w-3 h-3 text-orange-400 shrink-0" />
                      <span>{adminEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-black bg-orange-500/20 text-orange-300 border border-orange-400/40 flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> ACTIVE
                  </span>
                  <span className="text-[9px] font-mono text-orange-400/70">Node #01</span>
                </div>
              </div>
            </div>

            {/* Profile Detail Fields Matrix */}
            <div className="p-3.5 sm:p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 font-display">
                  <Fingerprint className="w-3.5 h-3.5 text-orange-400" />
                  Credentials &amp; Authentication
                </span>
                <span className="text-[9px] text-amber-400 font-mono">256-BIT SSL</span>
              </div>

              {/* Full Name Box with Copy */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-950/85 rounded-xl border border-slate-800 hover:border-orange-500/40 transition-colors group">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Administrator Name</span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">{adminName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(adminName, 'name')}
                  className="p-1.5 text-slate-400 hover:text-orange-300 hover:bg-orange-950/60 rounded-lg border border-transparent hover:border-orange-800/80 transition-all cursor-pointer shrink-0"
                  title="Copy Name"
                >
                  {copiedField === 'name' ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-orange-400 font-bold">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Email Box with Copy */}
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-950/85 rounded-xl border border-slate-800 hover:border-orange-500/40 transition-colors group">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] text-slate-400 block font-medium">Master Login Email</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-orange-300 truncate block">{adminEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(adminEmail, 'email')}
                  className="p-1.5 text-slate-400 hover:text-orange-300 hover:bg-orange-950/60 rounded-lg border border-transparent hover:border-orange-800/80 transition-all cursor-pointer shrink-0"
                  title="Copy Email"
                >
                  {copiedField === 'email' ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-orange-400 font-bold">
                      <Check className="w-3.5 h-3.5" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Account Identifier & Role Matrix */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 sm:p-3 bg-slate-950/85 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">System Account ID</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-orange-400 tracking-wider">{adminSid}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-950/85 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Access Tier</span>
                  <span className="text-xs sm:text-sm font-mono font-black text-amber-300">Root Superuser</span>
                </div>
              </div>

              {/* Database Schema Engine Indicator */}
              <div className="p-3 bg-gradient-to-r from-orange-950/90 via-slate-950 to-amber-950/90 rounded-xl border border-orange-500/40 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-orange-900/80 text-orange-300 rounded-lg border border-orange-700/60 shrink-0">
                    <Database className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-orange-300/80 block font-medium">Active Database Engine</span>
                    <span className="text-xs font-black text-white truncate block">MongoDB Atlas 3.0 Norm</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-black bg-orange-500/20 text-orange-300 border border-orange-400/40 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.2)]">
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Quick Managed Assets Metrics (Glowing Orange Radar Hub) */}
          <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-800 p-3.5 sm:p-4 shadow-sm space-y-3 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white font-display flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-orange-400" />
                Live Managed Scope
              </span>
              <span className="text-[10px] font-mono text-orange-400 bg-orange-950/90 px-2 py-0.5 rounded-full border border-orange-800/80 shadow-[0_0_8px_rgba(249,115,22,0.15)]">
                ● Synchronized
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              
              {/* Students Metric Card */}
              <div className="p-2.5 bg-gradient-to-b from-slate-950 to-orange-950/50 rounded-xl border border-orange-500/35 shadow-[0_0_12px_rgba(249,115,22,0.1)] group hover:scale-[1.02] transition-transform">
                <span className="text-[9px] text-orange-400 uppercase font-bold block font-mono tracking-wider">Students</span>
                <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                  {loadingStats ? '...' : stats.students}
                </span>
              </div>

              {/* Lessons Metric Card */}
              <div className="p-2.5 bg-gradient-to-b from-slate-950 to-amber-950/50 rounded-xl border border-amber-500/35 shadow-[0_0_12px_rgba(245,158,11,0.1)] group hover:scale-[1.02] transition-transform">
                <span className="text-[9px] text-amber-400 uppercase font-bold block font-mono tracking-wider">Lessons</span>
                <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                  {loadingStats ? '...' : stats.lessons}
                </span>
              </div>

              {/* Exams Metric Card */}
              <div className="p-2.5 bg-gradient-to-b from-slate-950 to-yellow-950/50 rounded-xl border border-yellow-500/35 shadow-[0_0_12px_rgba(234,179,8,0.1)] group hover:scale-[1.02] transition-transform">
                <span className="text-[9px] text-yellow-400 uppercase font-bold block font-mono tracking-wider">Exams</span>
                <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                  {loadingStats ? '...' : stats.exams}
                </span>
              </div>

              {/* Payments Metric Card */}
              <div className="p-2.5 bg-gradient-to-b from-slate-950 to-red-950/50 rounded-xl border border-red-500/35 shadow-[0_0_12px_rgba(239,68,68,0.1)] group hover:scale-[1.02] transition-transform">
                <span className="text-[9px] text-red-400 uppercase font-bold block font-mono tracking-wider">Payments</span>
                <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                  {loadingStats ? '...' : stats.payments}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Change Password & Security Protocols (7 cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4 w-full min-w-0">
          
          {/* Change Password Card (Glowing Sunset Orange/Amber Theme) */}
          <div className="bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.15)] overflow-hidden backdrop-blur-xl">
            
            {/* Header with Glowing Orange Banner */}
            <div className="p-3.5 sm:p-4.5 border-b border-orange-500/30 bg-gradient-to-r from-slate-950 via-orange-950/85 to-slate-950 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-600 text-white rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.5)] border border-orange-400/50 shrink-0">
                  <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-white font-display flex items-center gap-1.5">
                    <span>Change System Password</span>
                  </h3>
                  <p className="text-[11px] text-orange-200/80 font-medium truncate">
                    Authenticate with current password to set a new access key
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-xl text-[9.5px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-400/40 shrink-0 flex items-center gap-1 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                <LockKeyhole className="w-3 h-3 text-orange-400" />
                VERIFIED AUTH
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Alert Status Banners */}
              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-200 animate-in fade-in shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-orange-950/80 border border-orange-500/60 rounded-xl flex items-center gap-2.5 text-xs font-bold text-orange-200 animate-in fade-in shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                
                {/* 1. Old / Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Current (Old) Password</span>
                      <span className="text-orange-400">*</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal font-mono">Verification Check</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter your current password..."
                      required
                      className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden transition-all font-mono shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5"
                      title={showOld ? 'Hide password' : 'Show password'}
                    >
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. New Password & Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                        <span>New Password</span>
                        <span className="text-orange-400">*</span>
                      </label>
                      {newPassword && (
                        <span className={`text-[9.5px] font-mono font-bold ${strength.text}`}>
                          {strength.label}
                        </span>
                      )}
                    </div>
                    
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 4 characters..."
                        required
                        minLength={4}
                        className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden transition-all font-mono shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5"
                        title={showNew ? 'Hide password' : 'Show password'}
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Mini strength bar with warm amber/orange gradient */}
                    {newPassword && (
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full ${strength.color} transition-all duration-300`} 
                          style={{ width: strength.score === 1 ? '33%' : strength.score === 2 ? '66%' : '100%' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <span>Confirm New Password</span>
                      <span className="text-orange-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password..."
                        required
                        minLength={4}
                        className="w-full bg-slate-950/90 border border-slate-700 hover:border-slate-600 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden transition-all font-mono shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer transition-colors p-0.5"
                        title={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Password Match Status Indicator */}
                {newPassword && confirmPassword && (
                  <div className={`p-2.5 rounded-xl text-[11px] font-bold flex items-center gap-2 ${
                    newPassword === confirmPassword 
                      ? 'bg-orange-950/80 text-orange-300 border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.15)]' 
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                        <span>Passwords match securely. Ready to apply.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>New password and confirmation do not match yet.</span>
                      </>
                    )}
                  </div>
                )}

                {/* Action Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 border border-slate-700/60 transition-colors cursor-pointer text-center"
                  >
                    Clear Form
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-amber-500 hover:to-orange-400 active:scale-95 text-white text-xs font-black rounded-xl shadow-[0_0_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border border-orange-300/40"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-100" />
                        <span>Verifying &amp; Saving...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-orange-100" />
                        <span>Update Admin Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>

          {/* Cyber Security Protocols & Standards Banner (Aesthetic Orange Theme) */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white rounded-2xl sm:rounded-3xl p-4 border border-orange-500/30 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <h4 className="text-xs sm:text-sm font-black text-white font-display">
                  Root Security Standards
                </h4>
              </div>
              <span className="text-[9.5px] font-mono text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded-md border border-orange-800/80 shadow-[0_0_8px_rgba(249,115,22,0.15)]">
                AES-GCM Protocol
              </span>
            </div>

            <p className="text-[11px] text-orange-200/80 leading-relaxed">
              Your administrative credentials provide unrestricted access to student profiles, exams, and financial databases. Changing your password immediately syncs with active database authentication tokens.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10.5px]">
              <div className="p-2 bg-slate-950/85 border border-slate-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-slate-300 font-medium">Strict Old Password Verification</span>
              </div>
              <div className="p-2 bg-slate-950/85 border border-slate-800 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span className="text-slate-300 font-medium">Encrypted In-Flight Requests</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
