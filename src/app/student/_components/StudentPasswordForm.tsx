'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { Lock, Eye, EyeOff, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface StudentPasswordFormProps {
  student: Student;
  onSaveProfile?: (updated: Student) => Promise<void> | void;
}

export default function StudentPasswordForm({ student, onSaveProfile }: StudentPasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sid: student.sid,
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update password');
      }

      setMessage({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error updating password' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-6 space-y-4 shadow-sm max-w-xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-300 pb-3">
        <div className="p-2.5 bg-emerald-700 text-white rounded-2xl shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-black text-slate-900 text-base">Account Security & Password</h3>
          <p className="text-xs text-slate-500 font-medium">Change your student portal login password</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-rose-100 text-rose-900 border-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-3.5">
        {/* Current Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Current Password *</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>New Password *</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={4}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 4 characters"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Confirm New Password *</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={4}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Updating Password...' : 'Change Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
