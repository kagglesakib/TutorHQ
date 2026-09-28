'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { 
  User, Building, Mail, Phone, Home, ShieldCheck, Lock, KeyRound, 
  CheckCircle2, AlertCircle, Eye, EyeOff, Save, Edit3, Clock, 
  Award, PhoneCall, Calendar, BookmarkCheck, FileText, BookOpen
} from 'lucide-react';
import { formatBatch } from '@/utils/formatBatch';
import { useAuth } from '@/context/AuthContext';

interface StudentPasswordFormProps {
  student?: Student;
  onSaveProfile?: (updatedStudent: Student) => Promise<void> | void;
}

export default function StudentPasswordForm({
  student,
  onSaveProfile,
}: StudentPasswordFormProps) {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleToggleEditProfile = () => {
    const nextState = !isEditingProfile;
    setIsEditingProfile(nextState);
    if (nextState) {
      setTimeout(() => {
        const el = document.getElementById('student-personal-profile-card');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  // Profile editable fields (initialized from student prop or auth user)
  const [college, setCollege] = useState(student?.college || '');
  const [email, setEmail] = useState(student?.email || user?.email || '');
  const [mobile, setMobile] = useState(student?.mobile || user?.phone || '');
  const [guardiansPhone, setGuardiansPhone] = useState(student?.guardiansPhone || '');
  const [address, setAddress] = useState(student?.address || '');

  // Profile feedback
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Password feedback
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // Handle saving profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setProfileErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSavingProfile(true);
    try {
      if (student && onSaveProfile) {
        const updated: Student = {
          ...student,
          college: college.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          guardiansPhone: guardiansPhone.trim(),
          address: address.trim(),
        };
        await onSaveProfile(updated);
      } else {
        const sid = student?.sid || user?.sid;
        if (sid) {
          const res = await fetch(`/api/students/${sid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...(student || {}),
              sid,
              college: college.trim(),
              email: email.trim(),
              mobile: mobile.trim(),
              guardiansPhone: guardiansPhone.trim(),
              address: address.trim(),
            }),
          });
          if (!res.ok) throw new Error('Failed to update student profile');
        }
      }

      setProfileSuccessMsg('Profile information updated successfully!');
      setIsEditingProfile(false);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSuccessMsg('');

    if (!oldPassword.trim()) {
      setPassErrorMsg('Please enter your current access password.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPassErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg('New password and password confirmation do not match.');
      return;
    }

    setIsSubmittingPass(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email || student?.email,
          sid: user?.sid || student?.sid,
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update access credentials');
      }

      setPassSuccessMsg(data.message || 'Security passcode updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassErrorMsg(err.message || 'Error updating access credentials.');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const studentName = student?.name || user?.name || 'Student';
  const studentSid = student?.sid || user?.sid || 'N/A';
  const studentBatch = student?.hscBatch;
  const studentCollege = student?.college || 'Institution Not Specified';

  return (
    <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto animate-fadeIn" id="student-security-page">
      {/* 1. Profile Hero Identity Card */}
      <div className="bg-gradient-to-br from-indigo-100/95 via-sky-100/80 to-emerald-100/90 dark:from-slate-900/95 dark:via-indigo-950/60 dark:to-slate-900/95 rounded-2xl p-3.5 sm:p-5 border-2 border-indigo-200/90 dark:border-indigo-500/30 shadow-md dark:shadow-[0_0_30px_rgba(99,102,241,0.12)] relative overflow-hidden transition-all duration-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/40 via-sky-200/30 to-transparent dark:from-teal-500/10 dark:via-sky-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-purple-200/40 via-indigo-200/30 to-transparent dark:from-indigo-500/15 dark:via-purple-500/5 dark:to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-teal-600 to-emerald-600 flex items-center justify-center text-lg sm:text-xl font-black text-white shadow-md shadow-indigo-600/30 border-2 border-white dark:border-slate-700 shrink-0">
              {studentName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-indigo-200/90 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-500/40 shadow-2xs">
                  SID: {studentSid}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200/90 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  Verified Student
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-200/90 dark:bg-purple-950/80 text-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-2xs">
                  {formatBatch(studentBatch, 'HSC')}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight truncate">
                {studentName}
              </h1>
              <p className="text-xs text-indigo-900/80 dark:text-indigo-300 font-medium flex items-center gap-1.5 truncate">
                <Building className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0" />
                <span className="truncate">{studentCollege}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleEditProfile}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-98 self-start sm:self-center ${
              isEditingProfile
                ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-indigo-500/20 dark:shadow-[0_0_15px_rgba(99,102,241,0.25)]'
            }`}
          >
            {isEditingProfile ? (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>Cancel Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Notifications */}
      {profileSuccessMsg && (
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      {profileErrorMsg && (
        <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
          <span>{profileErrorMsg}</span>
        </div>
      )}

      {/* 2. Official Academic Enrollment Section (Locked / Administration Records) */}
      <div className="bg-gradient-to-br from-teal-50/95 via-emerald-50/80 to-cyan-50/90 dark:from-slate-900/95 dark:via-teal-950/30 dark:to-slate-900/95 rounded-2xl p-3.5 sm:p-4 border-2 border-teal-200/90 dark:border-teal-500/30 shadow-md dark:shadow-[0_0_25px_rgba(20,184,166,0.1)] space-y-2.5 transition-all duration-200">
        <div className="flex items-center justify-between border-b border-teal-200/80 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-200/80 dark:bg-teal-950 text-teal-900 dark:text-teal-300 rounded-xl border border-teal-300 dark:border-teal-500/40 shadow-2xs shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-teal-950 dark:text-teal-300 text-xs sm:text-sm">Academic Enrollment Credentials</h3>
              <p className="text-[10px] text-teal-900/80 dark:text-slate-300 font-medium">Institutional registration managed and verified by administration.</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-teal-200/80 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-500/40 rounded-lg text-[9px] font-mono font-black text-teal-950 dark:text-teal-300 flex items-center gap-1 shadow-2xs">
            <Lock className="w-2.5 h-2.5 text-teal-700 dark:text-teal-400" /> Locked Fields
          </span>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* SID */}
          <div className="bg-indigo-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-indigo-300/90 dark:border-indigo-500/30 shadow-2xs transition-all">
            <span className="text-[9px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <KeyRound className="w-2.5 h-2.5 text-indigo-700 dark:text-indigo-400" /> Student ID (SID)
            </span>
            <span className="font-mono font-black text-xs sm:text-sm text-indigo-950 dark:text-white block">{studentSid}</span>
          </div>

          {/* HSC Batch */}
          <div className="bg-purple-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-purple-300/90 dark:border-purple-500/30 shadow-2xs transition-all">
            <span className="text-[9px] font-black text-purple-900 dark:text-purple-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <Calendar className="w-2.5 h-2.5 text-purple-700 dark:text-purple-400" /> HSC Batch
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-purple-950 dark:text-white block">{formatBatch(studentBatch, 'No Batch')}</span>
          </div>

          {/* Academic Group */}
          <div className="bg-emerald-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 shadow-2xs transition-all">
            <span className="text-[9px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <BookmarkCheck className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" /> Academic Group
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-emerald-950 dark:text-white block">{student?.group || 'Science'}</span>
          </div>

          {/* Tuitioned Subject */}
          <div className="bg-sky-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-sky-300/90 dark:border-sky-500/30 shadow-2xs transition-all">
            <span className="text-[9px] font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <BookOpen className="w-2.5 h-2.5 text-sky-700 dark:text-sky-400" /> Tuitioned Subject
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-sky-950 dark:text-white block">{student?.subject || 'All Subjects'}</span>
          </div>

          {/* Status */}
          <div className="bg-teal-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-teal-300/90 dark:border-teal-500/30 shadow-2xs transition-all">
            <span className="text-[9px] font-black text-teal-900 dark:text-teal-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-teal-700 dark:text-teal-400" /> Account Status
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-teal-950 dark:text-emerald-400 block">Active & Enrolled</span>
          </div>

          {/* Joined Date */}
          <div className="bg-amber-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-amber-300/90 dark:border-amber-500/30 shadow-2xs transition-all">
            <span className="text-[9px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <Clock className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" /> Registration Date
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-amber-950 dark:text-white block">
              {student?.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'Verified Record'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Personal & Contact Information Section */}
      <div id="student-personal-profile-card" className="bg-gradient-to-br from-amber-50/95 via-orange-50/80 to-yellow-50/90 dark:from-slate-900/95 dark:via-amber-950/30 dark:to-slate-900/95 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-200/90 dark:border-amber-500/30 shadow-md dark:shadow-[0_0_25px_rgba(245,158,11,0.1)] space-y-3 scroll-mt-20 transition-all duration-200">
        <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-200/80 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-xl border border-amber-300 dark:border-amber-500/40 shadow-2xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-amber-950 dark:text-amber-300 text-xs sm:text-sm">Personal & Contact Profile</h3>
              <p className="text-[10px] text-amber-900/80 dark:text-slate-300 font-medium">Keep your contact details updated for announcements and communications.</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-amber-200/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 rounded-lg text-[9px] font-mono font-black text-amber-950 dark:text-amber-300 shadow-2xs">
            {isEditingProfile ? 'Editing Mode' : 'View Mode'}
          </span>
        </div>

        {isEditingProfile ? (
          /* EDIT MODE */
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* College */}
              <div className="bg-sky-100/90 dark:bg-slate-950/70 p-3 rounded-xl border border-sky-300/90 dark:border-sky-500/30 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-sky-950 dark:text-sky-300 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Building className="w-3 h-3 text-sky-700 dark:text-sky-400" /> College / Institution</span>
                  <span className="text-[9px] text-sky-700 dark:text-sky-400 font-bold">Editable</span>
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Dhaka College / Notre Dame"
                  className="w-full px-3 py-1.5 bg-sky-50 dark:bg-slate-900 text-sky-950 dark:text-white font-bold text-xs rounded-lg border border-sky-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
                />
              </div>

              {/* Email */}
              <div className="bg-purple-100/90 dark:bg-slate-950/70 p-3 rounded-xl border border-purple-300/90 dark:border-purple-500/30 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-purple-700 dark:text-purple-400" /> Email Address</span>
                  <span className="text-[9px] text-purple-700 dark:text-purple-400 font-bold">Editable</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full px-3 py-1.5 bg-purple-50 dark:bg-slate-900 text-purple-950 dark:text-white font-bold text-xs rounded-lg border border-purple-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                />
              </div>

              {/* Student Mobile */}
              <div className="bg-emerald-100/90 dark:bg-slate-950/70 p-3 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> Student Mobile Number</span>
                  <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">Editable</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full px-3 py-1.5 bg-emerald-50 dark:bg-slate-900 text-emerald-950 dark:text-white font-mono font-bold text-xs rounded-lg border border-emerald-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              {/* Guardian's Phone */}
              <div className="bg-rose-100/90 dark:bg-slate-950/70 p-3 rounded-xl border border-rose-300/90 dark:border-rose-500/30 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-rose-950 dark:text-rose-300 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3 text-rose-700 dark:text-rose-400" /> Guardian&apos;s Phone</span>
                  <span className="text-[9px] text-rose-700 dark:text-rose-400 font-bold">Editable</span>
                </label>
                <input
                  type="tel"
                  value={guardiansPhone}
                  onChange={(e) => setGuardiansPhone(e.target.value)}
                  placeholder="e.g. 01800000000"
                  className="w-full px-3 py-1.5 bg-rose-50 dark:bg-slate-900 text-rose-950 dark:text-white font-mono font-bold text-xs rounded-lg border border-rose-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
              </div>

              {/* Residential Address */}
              <div className="bg-amber-100/90 dark:bg-slate-950/70 p-3 rounded-xl border border-amber-300/90 dark:border-amber-500/30 space-y-1 shadow-2xs sm:col-span-2">
                <label className="text-[10px] font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Home className="w-3 h-3 text-amber-700 dark:text-amber-400" /> Residential Address</span>
                  <span className="text-[9px] text-amber-700 dark:text-amber-400 font-bold">Editable</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 14, Road 5, Dhanmondi, Dhaka"
                  className="w-full px-3 py-1.5 bg-amber-50 dark:bg-slate-900 text-amber-950 dark:text-white font-bold text-xs rounded-lg border border-amber-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-950 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* VIEW MODE */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Full Name */}
            <div className="bg-indigo-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-indigo-300/90 dark:border-indigo-500/30 shadow-2xs transition-all">
              <span className="text-[9px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <User className="w-2.5 h-2.5 text-indigo-700 dark:text-indigo-400" /> Full Name
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-indigo-950 dark:text-white block">{studentName}</span>
            </div>

            {/* College */}
            <div className="bg-sky-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-sky-300/90 dark:border-sky-500/30 shadow-2xs transition-all">
              <span className="text-[9px] font-black text-sky-900 dark:text-sky-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Building className="w-2.5 h-2.5 text-sky-700 dark:text-sky-400" /> College / Institution
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-sky-950 dark:text-white block">{studentCollege}</span>
            </div>

            {/* Email Address */}
            <div className="bg-purple-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-purple-300/90 dark:border-purple-500/30 shadow-2xs transition-all">
              <span className="text-[9px] font-black text-purple-900 dark:text-purple-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Mail className="w-2.5 h-2.5 text-purple-700 dark:text-purple-400" /> Email Address
              </span>
              <span className="font-bold text-xs sm:text-sm text-purple-950 dark:text-white block truncate">{email || student?.email || 'No email registered'}</span>
            </div>

            {/* Student Mobile */}
            <div className="bg-emerald-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 shadow-2xs transition-all">
              <span className="text-[9px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Phone className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" /> Student Mobile
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-950 dark:text-white block">{mobile || student?.mobile || 'N/A'}</span>
            </div>

            {/* Guardian's Phone */}
            <div className="bg-rose-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-rose-300/90 dark:border-rose-500/30 shadow-2xs transition-all">
              <span className="text-[9px] font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <PhoneCall className="w-2.5 h-2.5 text-rose-700 dark:text-rose-400" /> Guardian&apos;s Phone
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-rose-950 dark:text-white block">{guardiansPhone || student?.guardiansPhone || 'Not specified'}</span>
            </div>

            {/* Residential Address */}
            <div className="bg-teal-100/90 dark:bg-slate-950/70 p-2.5 rounded-xl border border-teal-300/90 dark:border-teal-500/30 shadow-2xs transition-all">
              <span className="text-[9px] font-black text-teal-900 dark:text-teal-300 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Home className="w-2.5 h-2.5 text-teal-700 dark:text-teal-400" /> Residential Address
              </span>
              <span className="font-bold text-xs sm:text-sm text-teal-950 dark:text-white block truncate">{address || student?.address || 'Address not listed'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Security Passcode & Access Management Section */}
      <div className="bg-gradient-to-br from-rose-50/95 via-pink-50/80 to-purple-50/90 dark:from-slate-900/95 dark:via-rose-950/30 dark:to-slate-900/95 rounded-2xl p-3.5 sm:p-5 border-2 border-rose-200/90 dark:border-rose-500/30 shadow-md dark:shadow-[0_0_25px_rgba(244,63,94,0.1)] space-y-3.5 transition-all duration-200">
        <div className="flex items-center justify-between border-b border-rose-200/80 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-200/80 dark:bg-rose-950 text-rose-900 dark:text-rose-300 rounded-xl border border-rose-300 dark:border-rose-500/40 shadow-2xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-rose-700 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-display font-black text-rose-950 dark:text-rose-300 text-xs sm:text-sm">Account Security Passcode</h3>
              <p className="text-[10px] text-rose-900/80 dark:text-slate-300 font-medium">
                Update your security passcode to safeguard your academic portal access.
              </p>
            </div>
          </div>
          <span className="p-1.5 bg-rose-200 dark:bg-rose-950/80 text-rose-950 dark:text-rose-300 rounded-lg text-[10px] font-mono font-black border border-rose-300 dark:border-rose-500/40 flex items-center gap-1 shadow-2xs">
            <KeyRound className="w-3 h-3 text-rose-700 dark:text-rose-400" /> Credentials
          </span>
        </div>

        {/* Passcode Notifications */}
        {passSuccessMsg && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-200 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{passSuccessMsg}</span>
          </div>
        )}

        {passErrorMsg && (
          <div className="p-3 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-200 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
            <span>{passErrorMsg}</span>
          </div>
        )}

        {/* Passcode Update Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Current Password */}
            <div className="bg-rose-100/85 dark:bg-slate-950/70 p-3 rounded-xl border border-rose-300/90 dark:border-rose-500/30 space-y-1 shadow-2xs transition-all">
              <label className="text-[9px] font-black text-rose-950 dark:text-rose-300 uppercase tracking-wider block font-mono">
                Current Password <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-2.5 py-1.5 pr-8 bg-rose-50 dark:bg-slate-900 text-rose-950 dark:text-white font-bold text-xs rounded-lg border border-rose-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-white cursor-pointer"
                  title={showOldPass ? 'Hide password' : 'Show password'}
                >
                  {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="bg-amber-100/85 dark:bg-slate-950/70 p-3 rounded-xl border border-amber-300/90 dark:border-amber-500/30 space-y-1 shadow-2xs transition-all">
              <label className="text-[9px] font-black text-amber-950 dark:text-amber-300 uppercase tracking-wider block font-mono">
                New Password (min 4) <span className="text-amber-700 dark:text-amber-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-2.5 py-1.5 pr-8 bg-amber-50 dark:bg-slate-900 text-amber-950 dark:text-white font-bold text-xs rounded-lg border border-amber-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700 dark:text-amber-400 hover:text-amber-950 dark:hover:text-white cursor-pointer"
                  title={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="bg-emerald-100/85 dark:bg-slate-950/70 p-3 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 space-y-1 shadow-2xs transition-all">
              <label className="text-[9px] font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider block font-mono">
                Confirm Password <span className="text-emerald-700 dark:text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className={`w-full px-2.5 py-1.5 pr-8 bg-emerald-50 dark:bg-slate-900 text-emerald-950 dark:text-white font-bold text-xs rounded-lg border shadow-2xs focus:outline-hidden focus:ring-2 ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-400 bg-rose-50 dark:bg-rose-950/50'
                      : 'border-emerald-300 dark:border-slate-700 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white cursor-pointer"
                  title={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <p className="text-[10px] text-rose-900/70 dark:text-slate-400 font-medium">
              Keep your credentials confidential. Do not share your login passcode with anyone.
            </p>
            <button
              type="submit"
              disabled={isSubmittingPass}
              className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-700 hover:to-red-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-98 border border-rose-400/40"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmittingPass ? 'Updating Passcode...' : 'Update Security Passcode'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
