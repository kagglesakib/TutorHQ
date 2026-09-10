'use client';

import React from 'react';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentPaymentsView from '@/app/student/_components/StudentPaymentsView';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const { student, payments, isLoading, error } = useStudent();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-500 font-mono">Loading your tuition payment ledger...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="font-display font-black text-rose-900 text-lg">Student Record Not Found</h3>
        <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto">
          We could not locate an active student record associated with Student ID <strong>{user?.sid || 'N/A'}</strong>.
        </p>
      </div>
    );
  }

  return (
    <StudentPaymentsView
      student={student}
      payments={payments}
    />
  );
}
