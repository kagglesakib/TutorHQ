'use client';

import React, { useState } from 'react';
import { StudentProvider, useStudent } from '@/context/StudentContext';
import StudentHeader from './StudentHeader';
import StudentMobileDock from './StudentMobileDock';
import StudentDossier from './StudentDossier';
import StudentProfileForm from './StudentProfileForm';
import StudentLessonsView from './StudentLessonsView';
import StudentExamsView from './StudentExamsView';
import StudentPaymentsView from './StudentPaymentsView';
import StudentPasswordForm from './StudentPasswordForm';
import { RefreshCw, AlertTriangle, LayoutDashboard, BookOpen, ClipboardList, Banknote, User } from 'lucide-react';

function StudentPortalContent() {
  const { student, activities, exams, payments, isLoading, error, handleSaveProfile } = useStudent();
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'exams' | 'payments' | 'profile'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-500 font-mono">Loading your academic dossier...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-display font-black text-rose-900 text-lg">Student Record Not Found</h3>
        <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
          We could not locate an active student record for your account. Please contact the administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation Pill Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-200/80 p-1 rounded-2xl border border-slate-300 w-fit max-w-full">
        <button
          type="button"
          onClick={() => { setActiveTab('overview'); setIsEditingProfile(false); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('lessons'); setIsEditingProfile(false); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'lessons'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lessons & Study ({activities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('exams'); setIsEditingProfile(false); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'exams'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Exams ({exams.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('payments'); setIsEditingProfile(false); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Payments ({payments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('profile'); setIsEditingProfile(false); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Profile & Security</span>
        </button>
      </div>

      {/* Main View Area */}
      {activeTab === 'overview' && (
        isEditingProfile ? (
          <StudentProfileForm
            student={student}
            onSave={async (updated) => {
              await handleSaveProfile(updated);
              setIsEditingProfile(false);
            }}
            onCancel={() => setIsEditingProfile(false)}
          />
        ) : (
          <StudentDossier
            student={student}
            activities={activities}
            exams={exams}
            payments={payments}
            onEditProfileClick={() => setIsEditingProfile(true)}
            onChangePasswordClick={() => setActiveTab('profile')}
          />
        )
      )}

      {activeTab === 'lessons' && (
        <StudentLessonsView student={student} activities={activities} />
      )}

      {activeTab === 'exams' && (
        <StudentExamsView student={student} exams={exams} />
      )}

      {activeTab === 'payments' && (
        <StudentPaymentsView student={student} payments={payments} />
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <StudentProfileForm
            student={student}
            onSave={handleSaveProfile}
            onCancel={() => setActiveTab('overview')}
          />
          <StudentPasswordForm
            student={student}
            onSaveProfile={handleSaveProfile}
          />
        </div>
      )}
    </div>
  );
}

export default function StudentPortalView() {
  return (
    <StudentProvider>
      <div className="space-y-4 pb-20 sm:pb-8">
        <StudentPortalContent />
        <StudentMobileDock />
      </div>
    </StudentProvider>
  );
}
