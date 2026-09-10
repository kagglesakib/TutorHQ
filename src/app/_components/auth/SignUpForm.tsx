'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Building, BookOpen, MapPin, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';

export interface SignupFormData {
  name: string;
  college: string;
  hscBatch: string;
  subject: string;
  group: string;
  mobile: string;
  guardiansPhone: string;
  address: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface SignUpFormProps {
  signupData: SignupFormData;
  onDataChange: (field: keyof SignupFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
  isSubmitting: boolean;
}

export function SignUpForm({
  signupData,
  onDataChange,
  onSubmit,
  onSwitchToLogin,
  isSubmitting,
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <User className="w-3 h-3 text-emerald-700" />
            <span>Full Name *</span>
          </label>
          <input
            type="text"
            required
            value={signupData.name}
            onChange={(e) => onDataChange('name', e.target.value)}
            placeholder="e.g. Shakib Al Hasan"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <Mail className="w-3 h-3 text-emerald-700" />
            <span>Email Address *</span>
          </label>
          <input
            type="email"
            required
            value={signupData.email}
            onChange={(e) => onDataChange('email', e.target.value)}
            placeholder="student@example.com"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Mobile Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-700" />
            <span>Mobile Number *</span>
          </label>
          <input
            type="tel"
            required
            value={signupData.mobile}
            onChange={(e) => onDataChange('mobile', e.target.value)}
            placeholder="017XXXXXXXX"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Guardian's Phone */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-700" />
            <span>Guardian Phone</span>
          </label>
          <input
            type="tel"
            value={signupData.guardiansPhone}
            onChange={(e) => onDataChange('guardiansPhone', e.target.value)}
            placeholder="018XXXXXXXX"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* College / Institute */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <Building className="w-3 h-3 text-emerald-700" />
            <span>College / Institute</span>
          </label>
          <input
            type="text"
            value={signupData.college}
            onChange={(e) => onDataChange('college', e.target.value)}
            placeholder="e.g. Dhaka College"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* HSC Batch */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-700" />
            <span>HSC Batch</span>
          </label>
          <input
            type="text"
            value={signupData.hscBatch}
            onChange={(e) => onDataChange('hscBatch', e.target.value)}
            placeholder="e.g. 2026 or HSC 2026"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-700" />
            <span>Subject</span>
          </label>
          <input
            type="text"
            value={signupData.subject}
            onChange={(e) => onDataChange('subject', e.target.value)}
            placeholder="e.g. Physics / Higher Math"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Group Selection */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-700" />
            <span>Group</span>
          </label>
          <select
            value={signupData.group}
            onChange={(e) => onDataChange('group', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          >
            <option value="Science">Science</option>
            <option value="Commerce">Commerce / Business</option>
            <option value="Humanities">Humanities / Arts</option>
          </select>
        </div>

        {/* Address */}
        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-700" />
            <span>Address</span>
          </label>
          <input
            type="text"
            value={signupData.address}
            onChange={(e) => onDataChange('address', e.target.value)}
            placeholder="e.g. Mirpur, Dhaka"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-700" />
            <span>Password *</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={4}
              value={signupData.password}
              onChange={(e) => onDataChange('password', e.target.value)}
              placeholder="Min 4 characters"
              className="w-full px-2.5 py-1.5 pr-8 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-emerald-950 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-700" />
            <span>Confirm Password *</span>
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={4}
            value={signupData.confirmPassword}
            onChange={(e) => onDataChange('confirmPassword', e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-2.5 py-1.5 bg-white/90 border border-emerald-300 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
      >
        <UserPlus className="w-4 h-4" />
        <span>{isSubmitting ? 'Registering...' : 'Complete Registration'}</span>
      </button>

      {/* Switch to login */}
      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Already registered? Return to sign in</span>
        </button>
      </div>
    </form>
  );
}
