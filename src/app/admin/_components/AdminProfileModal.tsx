'use client';

import React, { useState } from 'react';
import { 
  User, ShieldCheck, KeyRound, Lock, Eye, EyeOff, CheckCircle2, 
  AlertTriangle, X, ShieldAlert, Sparkles, Mail, Fingerprint, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminProfileModal({ isOpen, onClose }: AdminProfileModalProps) {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleResetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oldPassword) {
      setErrorMsg('Please enter your current (old) password.');
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
      setErrorMsg('New password and confirmation do not match.');
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

      setSuccessMsg(data.message || 'Admin password successfully updated!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-4 relative my-auto overflow-hidden"
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-sm shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-display font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
                <span>Administrator Profile</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono font-bold px-1.5 py-0.2 rounded-full shrink-0">
                  Master
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                System Credentials &amp; Password Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Admin Identity Data Card */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-2xl p-3 sm:p-3.5 text-white border border-emerald-800/80 shadow-inner space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-300 font-black text-xs font-mono">
                  HQ
                </div>
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-white truncate">
                  {user?.name || 'Engr. Sakibul Hasan'}
                </h4>
                <p className="text-[10px] text-emerald-300 font-mono font-medium flex items-center gap-1 truncate">
                  <Mail className="w-2.5 h-2.5 shrink-0" />
                  <span>{user?.email || 'sakib1514817122@gmail.com'}</span>
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold bg-emerald-900/90 text-emerald-200 border border-emerald-700 shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Superuser
            </span>
          </div>

          {/* Quick System Metrics Badges */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800 text-[10px] text-center font-mono">
            <div className="bg-black/40 border border-emerald-800/40 rounded-lg p-1">
              <span className="text-[8px] text-slate-400 block uppercase">Role</span>
              <span className="font-black text-emerald-300">ADMIN</span>
            </div>
            <div className="bg-black/40 border border-emerald-800/40 rounded-lg p-1">
              <span className="text-[8px] text-slate-400 block uppercase">Access</span>
              <span className="font-black text-teal-300">Full Root</span>
            </div>
            <div className="bg-black/40 border border-emerald-800/40 rounded-lg p-1">
              <span className="text-[8px] text-slate-400 block uppercase">Schema</span>
              <span className="font-black text-cyan-300">v3.0 Norm</span>
            </div>
          </div>
        </div>

        {/* 2. Change Password Form (Using Old Password) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 font-display">
                Change Password
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Authenticate with your current password to set a new key
              </p>
            </div>
          </div>

          {/* Status Notifications */}
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-[11px] font-bold text-rose-800 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-[11px] font-bold text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Old / Current Password */}
            <div className="space-y-1">
              <label className="text-[10.5px] font-bold text-slate-700 flex items-center justify-between">
                <span>Current (Old) Password:</span>
                <span className="text-[9px] text-slate-400 font-normal">Required for verification</span>
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showOld ? 'Hide password' : 'Show password'}
                >
                  {showOld ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  New Password:
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 4 characters..."
                    required
                    minLength={4}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showNew ? 'Hide password' : 'Show password'}
                  >
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Confirm New Password:
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password..."
                    required
                    minLength={4}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Lock className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
