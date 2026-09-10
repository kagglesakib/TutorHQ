'use client';

import React, { useState } from 'react';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentProfileForm from '@/app/student/_components/StudentProfileForm';
import StudentPasswordForm from '@/app/student/_components/StudentPasswordForm';
import { StudentLoadingView, StudentErrorView } from '@/app/student/_components/StudentStateView';
import { User, Edit3, Phone, Mail, MapPin, School, Shield } from 'lucide-react';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { student, isLoading, error, handleSaveProfile } = useStudent();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <StudentLoadingView message="Loading profile details..." />;
  }

  if (error || !student) {
    return <StudentErrorView sid={user?.sid} error={error} />;
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {isEditing ? (
        <StudentProfileForm
          student={student}
          onSave={async (updated) => {
            await handleSaveProfile(updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-slate-900 text-base">{student.name}</h3>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md">
                    SID: {student.sid}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Personal contact info and academic enrollment</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <School className="w-3 h-3 text-emerald-600" />
                <span>College / Institution</span>
              </span>
              <p className="font-semibold text-slate-900">{student.college || 'Not set'}</p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>Mobile Phone</span>
              </span>
              <p className="font-mono font-bold text-slate-900">{student.mobile || 'Not set'}</p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Guardian Phone</span>
              </span>
              <p className="font-mono font-bold text-slate-900">{student.guardiansPhone || 'Not set'}</p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-0.5 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-600" />
                <span>Email Address</span>
              </span>
              <p className="font-semibold text-slate-900 truncate">{student.email || 'Not set'}</p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-0.5 sm:col-span-2 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Address</span>
              </span>
              <p className="font-semibold text-slate-900">{student.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Password and Security */}
      <StudentPasswordForm student={student} />
    </div>
  );
}
