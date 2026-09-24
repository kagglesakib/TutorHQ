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
    <div className="space-y-3 max-w-7xl w-full mx-auto px-0 sm:px-2 overflow-x-hidden">
      {/* Error notification banner if any */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 py-2.5 px-3.5 rounded-2xl text-xs font-medium text-rose-800 flex items-center justify-between gap-2 shadow-2xs">
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

