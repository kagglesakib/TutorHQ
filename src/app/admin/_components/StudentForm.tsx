'use client';

import React, { useState, useEffect } from 'react';
import { Student } from '@/types';
import { User, Phone, Mail, MapPin, Building, BookOpen, Save, X, Sparkles } from 'lucide-react';

interface StudentFormProps {
  student?: Student | null;
  existingSids: string[];
  onSave: (formData: Student, originalSid?: string) => Promise<void> | void;
  onCancel: () => void;
}

export default function StudentForm({
  student,
  existingSids,
  onSave,
  onCancel,
}: StudentFormProps) {
  const isEditing = !!student;
  const [formData, setFormData] = useState<Student>({
    sid: student?.sid || '',
    name: student?.name || '',
    college: student?.college || '',
    hscBatch: student?.hscBatch || '',
    subject: student?.subject || '',
    group: student?.group || 'Science',
    mobile: student?.mobile || '',
    guardiansPhone: student?.guardiansPhone || '',
    address: student?.address || '',
    email: student?.email || '',
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sid = formData.sid.trim();
    const name = formData.name.trim();

    if (!sid || !name) {
      setError('Student ID (SID) and Student Full Name are required.');
      return;
    }

    if (!isEditing && existingSids.includes(sid)) {
      setError(`Student ID "${sid}" is already enrolled. Please use a unique SID.`);
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, student?.sid);
    } catch (err: any) {
      setError(err?.message || 'Failed to save student record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 via-indigo-50/70 to-teal-50/70 p-4 sm:p-6 rounded-3xl border border-slate-300 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-300 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-teal-600 text-white rounded-xl shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 text-base">
              {isEditing ? 'Update Student Profile' : 'Enroll New Student'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isEditing ? `Editing record for ${student.name}` : 'Fill in the student academic and contact details'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl cursor-pointer transition-all"
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
          {/* SID */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <span className="text-indigo-600 font-mono">#</span>
              <span>Student ID (SID) *</span>
            </label>
            <input
              type="text"
              required
              disabled={isEditing}
              value={formData.sid}
              onChange={(e) => setFormData({ ...formData, sid: e.target.value })}
              placeholder="e.g. S-101 or 2026001"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 shadow-2xs font-mono"
            />
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Shakib Ahmed"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* College */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>College / Institute</span>
            </label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="e.g. Dhaka Residential Model College"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* HSC Batch */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>HSC Batch</span>
            </label>
            <input
              type="text"
              value={formData.hscBatch}
              onChange={(e) => setFormData({ ...formData, hscBatch: e.target.value })}
              placeholder="e.g. 2026 or HSC 2026"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs font-mono"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Subject</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Physics & Higher Math"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Group */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Group</span>
            </label>
            <select
              value={formData.group}
              onChange={(e) => setFormData({ ...formData, group: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            >
              <option value="Science">Science</option>
              <option value="Commerce">Commerce</option>
              <option value="Humanities">Humanities</option>
            </select>
          </div>

          {/* Mobile */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Student Mobile</span>
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="017XXXXXXXX"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs font-mono"
            />
          </div>

          {/* Guardian's Phone */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Guardian Phone</span>
            </label>
            <input
              type="tel"
              value={formData.guardiansPhone}
              onChange={(e) => setFormData({ ...formData, guardiansPhone: e.target.value })}
              placeholder="018XXXXXXXX"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs font-mono"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-indigo-600" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@example.com"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Address</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. Dhanmondi 32, Dhaka"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-300">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-teal-600 to-indigo-700 hover:from-indigo-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : isEditing ? 'Update Student' : 'Enroll Student'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
