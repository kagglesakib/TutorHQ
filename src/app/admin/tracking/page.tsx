'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Student, Activity } from '@/types';
import { GlobalTrackingList } from '@/app/admin/_components';
import {
  AlertTriangle,
  RefreshCcw,
  RefreshCw,
  ChevronRight,
  BookOpen,
  Users,
  Award,
  CreditCard,
  ArrowLeft,
  CalendarCheck
} from 'lucide-react';

export default function AdminTrackingPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [resStudents, resActivities] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' })
      ]);
      if (!resStudents.ok || !resActivities.ok) throw new Error('Failed to load tracking data');
      setStudents(await resStudents.json());
      setActivities(await resActivities.json());
    } catch (err: any) {
      setError(err.message || 'Connection lost to the server database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddActivity = async (act: Activity) => {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(act),
    });
    if (!res.ok) throw new Error('Failed to create activity record');
    const created = await res.json();
    setActivities(prev => [created || act, ...prev]);
  };

  const handleUpdateActivity = async (updated: Activity) => {
    const res = await fetch(`/api/activities/${updated.aid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update activity log');
    setActivities(prev => prev.map(a => a.aid === updated.aid ? updated : a));
  };

  const handleDeleteActivity = async (aid: string) => {
    const res = await fetch(`/api/activities/${aid}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete activity log');
    setActivities(prev => prev.filter(a => a.aid !== aid));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-2xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800">Loading Daily Study Logs & Tracking...</p>
          <p className="text-xs text-slate-500 font-medium">Synchronizing student records and attendance ledger</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl w-full mx-auto overflow-x-hidden">
      {/* Top Header & Breadcrumb Ribbon with Light Background Coloring */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/50 to-purple-50/70 rounded-2xl border border-indigo-200/90 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-600 font-medium flex-wrap">
          <Link
            href="/admin"
            className="hover:text-indigo-900 transition-colors flex items-center gap-1 font-bold text-slate-700 bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-2xs active:scale-95 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Admin</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
          <span className="text-indigo-900 font-bold bg-indigo-100/90 border border-indigo-300 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs text-xs">
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Daily Tracking Ledger</span>
          </span>
        </div>

        {/* Quick Cross-Navigation & Live Refresh */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
            <Link
              href="/admin/students"
              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/90 rounded-xl font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="inline">Students</span>
            </Link>
            <Link
              href="/admin/exams"
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/90 rounded-xl font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
            >
              <Award className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="inline">Exams</span>
            </Link>
            <Link
              href="/admin/payments"
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/90 rounded-xl font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="inline">Payments</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-white' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Error notification banner if any */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 py-3 px-4 rounded-2xl text-xs font-medium text-rose-800 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchData(true)}
            className="underline hover:text-rose-950 font-bold ml-1 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Main Global Tracking List */}
      <GlobalTrackingList
        activities={activities}
        students={students}
        onSelectStudent={(sid) => router.push(`/admin/students?sid=${sid}`)}
        onAddActivity={handleAddActivity}
        onUpdateActivity={handleUpdateActivity}
        onDeleteActivity={handleDeleteActivity}
      />
    </div>
  );
}

