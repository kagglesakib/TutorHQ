'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { 
  User, Building, Mail, Phone, Home, ShieldCheck, Lock, KeyRound, 
  CheckCircle2, AlertCircle, Eye, EyeOff, Save, Edit3, Clock, 
  Sparkles, Award, PhoneCall, Calendar, BookmarkCheck, FileText, BookOpen
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
        // Fallback direct API call
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
      <div className="bg-gradient-to-br from-indigo-100/95 via-sky-100/80 to-emerald-100/90 rounded-2xl p-3.5 sm:p-5 border-2 border-indigo-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/40 via-sky-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-purple-200/40 via-indigo-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-teal-600 to-emerald-600 flex items-center justify-center text-lg sm:text-xl font-black text-white shadow-md shadow-indigo-600/30 border-2 border-white shrink-0">
              {studentName.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-indigo-200/90 text-indigo-950 border border-indigo-300 shadow-2xs">
                  SID: {studentSid}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-200/90 text-emerald-950 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Verified Student
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-200/90 text-purple-950 border border-purple-300 shadow-2xs">
                  {formatBatch(studentBatch, 'HSC')}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-display font-black text-slate-900 tracking-tight truncate">
                {studentName}
              </h1>
              <p className="text-xs text-indigo-900/80 font-medium flex items-center gap-1.5 truncate">
                <Building className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span className="truncate">{studentCollege}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-98 self-start sm:self-center ${
              isEditingProfile
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                : 'bg-gradient-to-r from-indigo-600 via-teal-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white shadow-indigo-500/20'
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
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{profileSuccessMsg}</span>
        </div>
      )}

      {profileErrorMsg && (
        <div className="p-3 bg-rose-100 border border-rose-300 text-rose-950 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{profileErrorMsg}</span>
        </div>
      )}

      {/* 2. Official Academic Enrollment Section (Locked / Administration Records) */}
      <div className="bg-gradient-to-br from-teal-50/95 via-emerald-50/80 to-cyan-50/90 rounded-2xl p-3.5 sm:p-4 border-2 border-teal-200/90 shadow-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-teal-200/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-200/80 text-teal-900 rounded-xl border border-teal-300 shadow-2xs shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-teal-950 text-xs sm:text-sm">Academic Enrollment Credentials</h3>
              <p className="text-[10px] text-teal-900/80 font-medium">Institutional registration managed and verified by administration.</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-teal-200/80 border border-teal-300 rounded-lg text-[9px] font-mono font-black text-teal-950 flex items-center gap-1 shadow-2xs">
            <Lock className="w-2.5 h-2.5 text-teal-700" /> Locked Fields
          </span>
        </div>

        {/* 6 Distinct Light Pastel Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* SID */}
          <div className="bg-indigo-100/90 p-2.5 rounded-xl border border-indigo-300/90 shadow-2xs">
            <span className="text-[9px] font-black text-indigo-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <KeyRound className="w-2.5 h-2.5 text-indigo-700" /> Student ID (SID)
            </span>
            <span className="font-mono font-black text-xs sm:text-sm text-indigo-950 block">{studentSid}</span>
          </div>

          {/* HSC Batch */}
          <div className="bg-purple-100/90 p-2.5 rounded-xl border border-purple-300/90 shadow-2xs">
            <span className="text-[9px] font-black text-purple-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <Calendar className="w-2.5 h-2.5 text-purple-700" /> HSC Batch
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-purple-950 block">{formatBatch(studentBatch, 'No Batch')}</span>
          </div>

          {/* Academic Group */}
          <div className="bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300/90 shadow-2xs">
            <span className="text-[9px] font-black text-emerald-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <BookmarkCheck className="w-2.5 h-2.5 text-emerald-700" /> Academic Group
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-emerald-950 block">{student?.group || 'Science'}</span>
          </div>

          {/* Tuitioned Subject */}
          <div className="bg-sky-100/90 p-2.5 rounded-xl border border-sky-300/90 shadow-2xs">
            <span className="text-[9px] font-black text-sky-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <BookOpen className="w-2.5 h-2.5 text-sky-700" /> Tuitioned Subject
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-sky-950 block">{student?.subject || 'All Subjects'}</span>
          </div>

          {/* Status */}
          <div className="bg-teal-100/90 p-2.5 rounded-xl border border-teal-300/90 shadow-2xs">
            <span className="text-[9px] font-black text-teal-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-teal-700" /> Account Status
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-teal-950 block">Active & Enrolled</span>
          </div>

          {/* Joined Date */}
          <div className="bg-amber-100/90 p-2.5 rounded-xl border border-amber-300/90 shadow-2xs">
            <span className="text-[9px] font-black text-amber-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
              <Clock className="w-2.5 h-2.5 text-amber-700" /> Registration Date
            </span>
            <span className="font-mono font-bold text-xs sm:text-sm text-amber-950 block">
              {student?.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : 'Verified Record'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Personal & Contact Information Section */}
      <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/80 to-yellow-50/90 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-200/90 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-200/80 text-amber-900 rounded-xl border border-amber-300 shadow-2xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-amber-950 text-xs sm:text-sm">Personal & Contact Profile</h3>
              <p className="text-[10px] text-amber-900/80 font-medium">Keep your contact details updated for announcements and communications.</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-amber-200/80 border border-amber-300 rounded-lg text-[9px] font-mono font-black text-amber-950 shadow-2xs">
            {isEditingProfile ? 'Editing Mode' : 'View Mode'}
          </span>
        </div>

        {isEditingProfile ? (
          /* EDIT MODE */
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* College */}
              <div className="bg-sky-100/90 p-3 rounded-xl border border-sky-300/90 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-sky-950 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Building className="w-3 h-3 text-sky-700" /> College / Institution</span>
                  <span className="text-[9px] text-sky-700 font-bold">Editable</span>
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Dhaka College / Notre Dame"
                  className="w-full px-3 py-1.5 bg-sky-50 text-sky-950 font-bold text-xs rounded-lg border border-sky-300 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
                />
              </div>

              {/* Email */}
              <div className="bg-purple-100/90 p-3 rounded-xl border border-purple-300/90 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-purple-950 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-purple-700" /> Email Address</span>
                  <span className="text-[9px] text-purple-700 font-bold">Editable</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  className="w-full px-3 py-1.5 bg-purple-50 text-purple-950 font-bold text-xs rounded-lg border border-purple-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                />
              </div>

              {/* Student Mobile */}
              <div className="bg-emerald-100/90 p-3 rounded-xl border border-emerald-300/90 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-emerald-700" /> Student Mobile Number</span>
                  <span className="text-[9px] text-emerald-700 font-bold">Editable</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 01700000000"
                  className="w-full px-3 py-1.5 bg-emerald-50 text-emerald-950 font-mono font-bold text-xs rounded-lg border border-emerald-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />
              </div>

              {/* Guardian's Phone */}
              <div className="bg-rose-100/90 p-3 rounded-xl border border-rose-300/90 space-y-1 shadow-2xs">
                <label className="text-[10px] font-black text-rose-950 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3 text-rose-700" /> Guardian&apos;s Phone</span>
                  <span className="text-[9px] text-rose-700 font-bold">Editable</span>
                </label>
                <input
                  type="tel"
                  value={guardiansPhone}
                  onChange={(e) => setGuardiansPhone(e.target.value)}
                  placeholder="e.g. 01800000000"
                  className="w-full px-3 py-1.5 bg-rose-50 text-rose-950 font-mono font-bold text-xs rounded-lg border border-rose-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
              </div>

              {/* Residential Address */}
              <div className="bg-amber-100/90 p-3 rounded-xl border border-amber-300/90 space-y-1 shadow-2xs sm:col-span-2">
                <label className="text-[10px] font-black text-amber-950 uppercase tracking-wider block flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1"><Home className="w-3 h-3 text-amber-700" /> Residential Address</span>
                  <span className="text-[9px] text-amber-700 font-bold">Editable</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 14, Road 5, Dhanmondi, Dhaka"
                  className="w-full px-3 py-1.5 bg-amber-50 text-amber-950 font-bold text-xs rounded-lg border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
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
            <div className="bg-indigo-100/90 p-2.5 rounded-xl border border-indigo-300/90 shadow-2xs">
              <span className="text-[9px] font-black text-indigo-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <User className="w-2.5 h-2.5 text-indigo-700" /> Full Name
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-indigo-950 block">{studentName}</span>
            </div>

            {/* College */}
            <div className="bg-sky-100/90 p-2.5 rounded-xl border border-sky-300/90 shadow-2xs">
              <span className="text-[9px] font-black text-sky-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Building className="w-2.5 h-2.5 text-sky-700" /> College / Institution
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-sky-950 block">{studentCollege}</span>
            </div>

            {/* Email Address */}
            <div className="bg-purple-100/90 p-2.5 rounded-xl border border-purple-300/90 shadow-2xs">
              <span className="text-[9px] font-black text-purple-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Mail className="w-2.5 h-2.5 text-purple-700" /> Email Address
              </span>
              <span className="font-bold text-xs sm:text-sm text-purple-950 block truncate">{email || student?.email || 'No email registered'}</span>
            </div>

            {/* Student Mobile */}
            <div className="bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300/90 shadow-2xs">
              <span className="text-[9px] font-black text-emerald-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Phone className="w-2.5 h-2.5 text-emerald-700" /> Student Mobile
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-950 block">{mobile || student?.mobile || 'N/A'}</span>
            </div>

            {/* Guardian's Phone */}
            <div className="bg-rose-100/90 p-2.5 rounded-xl border border-rose-300/90 shadow-2xs">
              <span className="text-[9px] font-black text-rose-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <PhoneCall className="w-2.5 h-2.5 text-rose-700" /> Guardian&apos;s Phone
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-rose-950 block">{guardiansPhone || student?.guardiansPhone || 'Not specified'}</span>
            </div>

            {/* Residential Address */}
            <div className="bg-teal-100/90 p-2.5 rounded-xl border border-teal-300/90 shadow-2xs">
              <span className="text-[9px] font-black text-teal-900 uppercase tracking-wider block font-mono flex items-center gap-1 mb-0.5">
                <Home className="w-2.5 h-2.5 text-teal-700" /> Residential Address
              </span>
              <span className="font-bold text-xs sm:text-sm text-teal-950 block truncate">{address || student?.address || 'Address not listed'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Security Passcode & Access Management Section */}
      <div className="bg-gradient-to-br from-rose-50/95 via-pink-50/80 to-purple-50/90 rounded-2xl p-3.5 sm:p-5 border-2 border-rose-200/90 shadow-md space-y-3.5">
        <div className="flex items-center justify-between border-b border-rose-200/80 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-200/80 text-rose-900 rounded-xl border border-rose-300 shadow-2xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="font-display font-black text-rose-950 text-xs sm:text-sm">Account Security Passcode</h3>
              <p className="text-[10px] text-rose-900/80 font-medium">
                Update your security passcode to safeguard your academic portal access.
              </p>
            </div>
          </div>
          <span className="p-1.5 bg-rose-200 text-rose-950 rounded-lg text-[10px] font-mono font-black border border-rose-300 flex items-center gap-1 shadow-2xs">
            <KeyRound className="w-3 h-3 text-rose-700" /> Credentials
          </span>
        </div>

        {/* Passcode Notifications */}
        {passSuccessMsg && (
          <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{passSuccessMsg}</span>
          </div>
        )}

        {passErrorMsg && (
          <div className="p-3 bg-rose-100 border border-rose-300 text-rose-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{passErrorMsg}</span>
          </div>
        )}

        {/* Passcode Update Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Current Password */}
            <div className="bg-rose-100/85 p-3 rounded-xl border border-rose-300/90 space-y-1 shadow-2xs">
              <label className="text-[9px] font-black text-rose-950 uppercase tracking-wider block font-mono">
                Current Password <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-2.5 py-1.5 pr-8 bg-rose-50 text-rose-950 font-bold text-xs rounded-lg border border-rose-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-700 hover:text-rose-950 cursor-pointer"
                  title={showOldPass ? 'Hide password' : 'Show password'}
                >
                  {showOldPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="bg-amber-100/85 p-3 rounded-xl border border-amber-300/90 space-y-1 shadow-2xs">
              <label className="text-[9px] font-black text-amber-950 uppercase tracking-wider block font-mono">
                New Password (min 4) <span className="text-amber-700">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-2.5 py-1.5 pr-8 bg-amber-50 text-amber-950 font-bold text-xs rounded-lg border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700 hover:text-amber-950 cursor-pointer"
                  title={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="bg-emerald-100/85 p-3 rounded-xl border border-emerald-300/90 space-y-1 shadow-2xs">
              <label className="text-[9px] font-black text-emerald-950 uppercase tracking-wider block font-mono">
                Confirm Password <span className="text-emerald-700">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className={`w-full px-2.5 py-1.5 pr-8 bg-emerald-50 text-emerald-950 font-bold text-xs rounded-lg border shadow-2xs focus:outline-hidden focus:ring-2 ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-rose-400 focus:ring-rose-400 bg-rose-50'
                      : 'border-emerald-300 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  title={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <p className="text-[10px] text-rose-900/70 font-medium">
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
