'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Activity, Exam, Payment } from '@/types';
import AdminPortal from '@/app/admin/_components/AdminPortal';
import { AlertTriangle, RefreshCcw, RefreshCw } from 'lucide-react';

export default function AdminPortalPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    const safeFetch = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    try {
      const [stuData, actData, exmData, payData] = await Promise.all([
        safeFetch('/api/students'),
        safeFetch('/api/activities'),
        safeFetch('/api/exams'),
        safeFetch('/api/payments'),
      ]);

      setStudents(stuData);
      setActivities(actData);
      setExams(exmData);
      setPayments(payData);
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to database server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveStudent = async (formData: Student, originalSid?: string) => {
    try {
      const isEdit = !!originalSid;
      if (isEdit) {
        const res = await fetch(`/api/students/${originalSid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to update student profile');
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Failed to create student');
      }
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to save student');
    }
  };

  const handleDeleteStudent = async (sid: string) => {
    try {
      const res = await fetch(`/api/students/${sid}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
  };

  const handleAddActivity = async (actData: Activity) => {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actData),
    });
    if (!res.ok) throw new Error('Failed to add activity');
    await fetchData();
  };

  const handleAddExam = async (examData: Exam) => {
    const res = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    });
    if (!res.ok) throw new Error('Failed to add exam');
    await fetchData();
  };

  const handleAddPayment = async (payData: Payment) => {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payData),
    });
    if (!res.ok) throw new Error('Failed to add payment');
    await fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 font-mono font-bold">Loading Admin Portal & Ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-7xl w-full mx-auto px-0 sm:px-2 overflow-x-hidden">
      {error && (
        <div className="bg-rose-950/80 border border-rose-800 py-2 px-3 rounded-xl text-xs font-medium text-rose-200 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchData} className="underline hover:text-white font-bold ml-1 flex items-center gap-1">
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Primary Admin Portal with Student List Section & Analytics */}
      <AdminPortal
        students={students}
        activities={activities}
        exams={exams}
        payments={payments}
        onRefreshData={fetchData}
        onSelectStudent={(sid) => router.push(`/admin/students?sid=${sid}`)}
        onSaveStudent={handleSaveStudent}
        onDeleteStudent={handleDeleteStudent}
        onAddActivity={handleAddActivity}
        onAddExam={handleAddExam}
        onAddPayment={handleAddPayment}
      />
    </div>
  );
}
