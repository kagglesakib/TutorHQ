'use client';

import React, { useState, useEffect } from 'react';
import { BackupRestore } from '@/app/admin/_components';
import { AlertTriangle, RefreshCcw, RefreshCw, ShieldAlert, Database, Flame, Lock } from 'lucide-react';

export default function AdminBackupPage() {
  const [counts, setCounts] = useState({ admins: 1, students: 0, activities: 0, exams: 0, payments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resUsers, resStudents, resActivities, resExams, resPayments] = await Promise.all([
        fetch('/api/auth/userlogdatas', { cache: 'no-store' }),
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' }),
        fetch('/api/exams', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' }),
      ]);

      const usersData = resUsers.ok ? await resUsers.json() : {};
      const allUsers = Array.isArray(usersData) ? usersData : usersData.users || [];
      const adminAccounts = allUsers.filter((u: any) => u.userType === 'admin');

      const students = resStudents.ok ? await resStudents.json() : [];
      const activities = resActivities.ok ? await resActivities.json() : [];
      const exams = resExams.ok ? await resExams.json() : [];
      const payments = resPayments.ok ? await resPayments.json() : [];

      setCounts({
        admins: Math.max(1, adminAccounts.length),
        students: Array.isArray(students) ? students.length : 0,
        activities: Array.isArray(activities) ? activities.length : 0,
        exams: Array.isArray(exams) ? exams.length : 0,
        payments: Array.isArray(payments) ? payments.length : 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load data counts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleBackupData = async () => {
    const res = await fetch('/api/backup?download=1', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to generate and download backup snapshot');

    const blob = await res.blob();
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `tutorhq-backup-${dateStr}.json`;

    const url = window.URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = fileName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    window.URL.revokeObjectURL(url);
    downloadAnchor.remove();
  };

  const handleRestoreData = async (jsonData: any) => {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || resJson.message || 'Failed to restore database backup');
      }
      await fetchCounts();
      return { success: true, message: resJson.message, stats: resJson.stats };
    } catch (err: any) {
      return { success: false, message: err.message || 'Restoration failed.' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="p-3 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 rounded-2xl text-white shadow-lg animate-pulse">
          <Database className="w-7 h-7" />
        </div>
        <p className="text-xs text-slate-500 font-mono font-bold flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          Loading Disaster Recovery &amp; Record Counts...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 max-w-7xl w-full mx-auto px-0 sm:px-2 overflow-x-hidden">
      {error && (
        <div className="bg-rose-950/90 border border-rose-800 py-2.5 px-3 rounded-2xl text-xs font-medium text-rose-200 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchCounts}
            className="px-2 py-0.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      <BackupRestore
        onBackup={handleBackupData}
        onRestore={handleRestoreData}
        onDataRestored={fetchCounts}
        loadingData={loading}
        adminsCount={counts.admins}
        studentsCount={counts.students}
        activitiesCount={counts.activities}
        examsCount={counts.exams}
        paymentsCount={counts.payments}
      />
    </div>
  );
}
