'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { User, Phone, Mail, Building, BookOpen, MapPin, Save, X } from 'lucide-react';

interface StudentProfileFormProps {
  student: Student;
  onSave: (updated: Student) => Promise<void> | void;
  onCancel: () => void;
}

export default function StudentProfileForm({
  student,
  onSave,
  onCancel,
}: StudentProfileFormProps) {
  const [formData, setFormData] = useState<Student>({ ...student });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-6 space-y-4 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-300 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base">Edit Student Profile</h3>
            <p className="text-xs text-slate-500 font-medium">Update contact info and college details</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* College */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">College / Institute</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Mobile */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Mobile Phone</label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Guardian Phone */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Guardian Phone</label>
            <input
              type="tel"
              value={formData.guardiansPhone}
              onChange={(e) => setFormData({ ...formData, guardiansPhone: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Email */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Address */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-bold text-slate-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
