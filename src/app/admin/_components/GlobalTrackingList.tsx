'use client';

import React, { useState, useMemo } from 'react';
import { Student, Activity } from '@/types';
import { isActiveEnrolledStudent } from '@/utils/studentFilters';
import {
  BookOpen,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  User,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Award,
  GraduationCap,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ChevronDown,
  MessageSquare,
  FileText,
  ClipboardList,
  Flame,
  Star,
  Hash,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { formatAid } from '@/utils/id';
import { formatDateWithDay } from '@/utils/dateFormat';
import LogDailyLessonModal from './LogDailyLessonModal';

interface GlobalTrackingListProps {
  activities: Activity[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onAddActivity?: (activity: Activity) => Promise<void> | void;
  onUpdateActivity: (activity: Activity) => Promise<void> | void;
  onDeleteActivity: (aid: string) => Promise<void> | void;
}

export default function GlobalTrackingList({
  activities,
  students,
  onSelectStudent,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}: GlobalTrackingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Present' | 'Absent'>('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'hw' | 'cw'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const [editingAid, setEditingAid] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Activity | null>(null);
  const [editIsHwNotGraded, setEditIsHwNotGraded] = useState<boolean>(false);
  const [editIsCwNotGraded, setEditIsCwNotGraded] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deleteConfirmAid, setDeleteConfirmAid] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const studentMap = useMemo(() => new Map(students.map(s => [s.sid, s])), [students]);
  const activeStudents = useMemo(() => students.filter(isActiveEnrolledStudent), [students]);

  // Extract unique available months for quick filtering (e.g. "2026-03")
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    activities.forEach(a => {
      if (a.date && a.date.length >= 7) {
        months.add(a.date.slice(0, 7));
      }
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [activities]);

  const handleAddActivityInternal = async (act: Activity) => {
    if (onAddActivity) {
      await onAddActivity(act);
    } else {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(act),
      });
      if (!res.ok) throw new Error('Failed to create activity record');
      window.location.reload();
    }
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return activities.filter((act) => {
      const student = studentMap.get(act.studentSid);

      // Search matching
      const matchesSearch =
        !term ||
        act.aid.toLowerCase().includes(term) ||
        act.studentSid.toLowerCase().includes(term) ||
        (act.subjectTuitioned && act.subjectTuitioned.toLowerCase().includes(term)) ||
        (act.comment && act.comment.toLowerCase().includes(term)) ||
        (student && student.name.toLowerCase().includes(term));

      // Student matching
      const matchesStudent = selectedStudentFilter === 'ALL' || act.studentSid === selectedStudentFilter;

      // Status matching
      const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;

      // Month matching
      const matchesMonth = selectedMonthFilter === 'ALL' || (act.date && act.date.startsWith(selectedMonthFilter));

      return matchesSearch && matchesStudent && matchesStatus && matchesMonth;
    });
  }, [activities, searchTerm, selectedStudentFilter, statusFilter, selectedMonthFilter, studentMap]);

  // Sort activities
  const sortedActivities = useMemo(() => {
    const copy = [...filteredActivities];
    switch (sortBy) {
      case 'oldest':
        return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'hw':
        return copy.sort((a, b) => (Number(b.hwMarks) || 0) - (Number(a.hwMarks) || 0));
      case 'cw':
        return copy.sort((a, b) => (Number(b.cwMarks) || 0) - (Number(a.cwMarks) || 0));
      case 'newest':
      default:
        return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [filteredActivities, sortBy]);

  // Statistics calculation for the aligned top cards
  const stats = useMemo(() => {
    const total = filteredActivities.length;
    const present = filteredActivities.filter(a => a.status === 'Present').length;
    const absent = filteredActivities.filter(a => a.status === 'Absent').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    const hwRecords = filteredActivities.filter(a => typeof a.hwMarks === 'number' && !isNaN(a.hwMarks));
    const avgHw = hwRecords.length > 0
      ? (hwRecords.reduce((s, a) => s + (a.hwMarks || 0), 0) / hwRecords.length).toFixed(1)
      : null;

    const cwRecords = filteredActivities.filter(a => typeof a.cwMarks === 'number' && !isNaN(a.cwMarks));
    const avgCw = cwRecords.length > 0
      ? (cwRecords.reduce((s, a) => s + (a.cwMarks || 0), 0) / cwRecords.length).toFixed(1)
      : null;

    return { total, present, absent, attendanceRate, avgHw, avgCw };
  }, [filteredActivities]);

  const hasActiveFilters = searchTerm !== '' || selectedStudentFilter !== 'ALL' || statusFilter !== 'ALL' || selectedMonthFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStudentFilter('ALL');
    setStatusFilter('ALL');
    setSelectedMonthFilter('ALL');
    setSortBy('newest');
  };

  const handleStartEdit = (act: Activity) => {
    setEditingAid(act.aid);
    setEditFormData({ ...act });
    setEditIsHwNotGraded(act.status === 'Absent' || act.hwMarks === undefined || act.hwMarks === null || isNaN(Number(act.hwMarks)));
    setEditIsCwNotGraded(act.status === 'Absent' || act.cwMarks === undefined || act.cwMarks === null || isNaN(Number(act.cwMarks)));
    setDeleteConfirmAid(null);
  };

  const handleCancelEdit = () => {
    setEditingAid(null);
    setEditFormData(null);
    setEditIsHwNotGraded(false);
    setEditIsCwNotGraded(false);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setIsSavingEdit(true);
    try {
      const isAbsent = editFormData.status === 'Absent';
      const finalHw = (isAbsent || editIsHwNotGraded) ? undefined : (editFormData.hwMarks !== undefined && !isNaN(Number(editFormData.hwMarks)) ? Number(editFormData.hwMarks) : undefined);
      const finalCw = (isAbsent || editIsCwNotGraded) ? undefined : (editFormData.cwMarks !== undefined && !isNaN(Number(editFormData.cwMarks)) ? Number(editFormData.cwMarks) : undefined);

      const payload: Activity = {
        ...editFormData,
        hwMarks: finalHw,
        cwMarks: finalCw,
      };

      await onUpdateActivity(payload);
      setEditingAid(null);
      setEditFormData(null);
      setEditIsHwNotGraded(false);
      setEditIsCwNotGraded(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update activity');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (aid: string) => {
    try {
      await onDeleteActivity(aid);
      setDeleteConfirmAid(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden" id="admin-tracking-container">
      {/* 1. Ultra-Compact Aligned KPI Metrics Bar */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2 w-full">
        {/* Total Sessions - Indigo Tint */}
        <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/50 to-blue-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 rounded-xl border border-indigo-200/90 dark:border-indigo-800/60 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-tight truncate">Lessons</span>
            <div className="p-0.5 sm:p-1 bg-indigo-100 dark:bg-indigo-950 border border-indigo-300/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-md shrink-0">
              <BookOpen className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-display font-black text-indigo-950 dark:text-indigo-200 tracking-tight leading-none font-mono">
              {stats.total}
            </span>
            <span className="text-[8px] sm:text-[9px] text-indigo-700 dark:text-indigo-400 font-bold hidden sm:inline truncate">
              {selectedStudentFilter === 'ALL' ? 'Total' : 'Filtered'}
            </span>
          </div>
        </div>

        {/* Present Sessions & Attendance Rate - Emerald Tint */}
        <div className="bg-gradient-to-br from-emerald-50/95 via-teal-50/50 to-emerald-100/40 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 rounded-xl border border-emerald-200/90 dark:border-emerald-800/60 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-tight truncate">Attend</span>
            <div className="p-0.5 sm:p-1 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300/80 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-md shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-display font-black text-emerald-950 dark:text-emerald-200 tracking-tight leading-none font-mono">
              {stats.present}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 font-mono font-bold px-1 py-0.2 rounded border border-emerald-300 dark:border-emerald-700">
              {stats.attendanceRate}%
            </span>
          </div>
        </div>

        {/* Absent Count - Rose Tint */}
        <div className="bg-gradient-to-br from-rose-50/95 via-pink-50/50 to-rose-100/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 rounded-xl border border-rose-200/90 dark:border-rose-800/60 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-rose-950 dark:text-rose-200 uppercase tracking-tight truncate">Absence</span>
            <div className="p-0.5 sm:p-1 bg-rose-100 dark:bg-rose-950 border border-rose-300/80 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-md shrink-0">
              <XCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-display font-black text-rose-950 dark:text-rose-200 tracking-tight leading-none font-mono">
              {stats.absent}
            </span>
            <span className="text-[8px] sm:text-[9px] text-rose-700 dark:text-rose-400 font-bold hidden sm:inline">
              Missed
            </span>
          </div>
        </div>

        {/* Academic Marks Average - Amber Tint */}
        <div className="bg-gradient-to-br from-amber-50/95 via-yellow-50/50 to-amber-100/40 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 rounded-xl border border-amber-200/90 dark:border-amber-800/60 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight truncate">Grading</span>
            <div className="p-0.5 sm:p-1 bg-amber-100 dark:bg-amber-950 border border-amber-300/80 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-md shrink-0">
              <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-center gap-1 font-mono">
            <span className="text-[8.5px] sm:text-[10px] font-black text-amber-950 dark:text-amber-200 bg-amber-200 dark:bg-amber-900/60 px-1 py-0.2 rounded border border-amber-300 dark:border-amber-700">
              H:{stats.avgHw ?? '—'}
            </span>
            <span className="text-[8.5px] sm:text-[10px] font-black text-sky-950 dark:text-sky-200 bg-sky-200 dark:bg-sky-900/60 px-1 py-0.2 rounded border border-sky-300 dark:border-sky-700">
              C:{stats.avgCw ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Tracking Matrix Container */}
      <div className="bg-white dark:bg-slate-900/95 rounded-2xl sm:rounded-3xl border border-indigo-100/90 dark:border-slate-800 shadow-sm overflow-hidden w-full max-w-full">
        {/* Header Ribbon */}
        <div className="p-2.5 sm:p-3.5 border-b border-indigo-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/95 via-purple-50/40 to-sky-50/50 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-xl shadow-xs border border-indigo-400/30 shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-display font-black text-indigo-950 dark:text-indigo-200 text-xs sm:text-sm tracking-tight leading-tight">
                  Daily Study Logs & Tracking
                </h2>
                <span className="text-[9.5px] bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 font-mono font-bold px-1.5 py-0.2 rounded-md shadow-2xs">
                  {filteredActivities.length}
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools: View Toggle & Log Button */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            {/* View Mode Toggle Button */}
            <div className="flex items-center p-0.5 bg-indigo-100/80 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-indigo-200 shadow-2xs border border-indigo-200 dark:border-slate-700 font-black'
                    : 'text-indigo-700 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white'
                }`}
                title="Aligned Tabular View"
              >
                <LayoutList className="w-3 h-3" />
                <span className="hidden sm:inline text-[10px]">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-900 text-indigo-950 dark:text-indigo-200 shadow-2xs border border-indigo-200 dark:border-slate-700 font-black'
                    : 'text-indigo-700 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white'
                }`}
                title="Structured Cards View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden sm:inline text-[10px]">Cards</span>
              </button>
            </div>

            {/* Log Daily Lesson Button */}
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="px-2.5 py-1 bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-lg text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 border border-white/20"
              id="btn-log-daily-lesson"
            >
              <Plus className="w-3 h-3" />
              <span className="whitespace-nowrap">Log Lesson</span>
            </button>
          </div>
        </div>

        {/* 3. Aligned Filter Toolbar with Element-wise Light Coloring */}
        <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-1.5">
          {/* Search Input Bar */}
          <div className="relative flex-1 min-w-[150px]">
            <Search className="w-3 h-3 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic, student, SID..."
              className="w-full pl-7 pr-6 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-lg text-[11px] sm:text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500 shadow-2xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Aligned Dropdown Filters */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5">
            {/* Student Filter */}
            <div className="relative col-span-2 sm:col-span-1">
              <select
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                className="w-full sm:w-auto pl-2 pr-6 py-1 bg-indigo-50/80 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-indigo-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-indigo-950 dark:text-indigo-200 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500 shadow-2xs cursor-pointer appearance-none truncate max-w-full"
              >
                <option value="ALL">All Students ({activeStudents.length})</option>
                {activeStudents.map(s => (
                  <option key={s.sid} value={s.sid}>{s.name} ({s.sid})</option>
                ))}
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-indigo-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Attendance Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto pl-2 pr-6 py-1 bg-emerald-50/80 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-emerald-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-emerald-950 dark:text-emerald-200 focus:outline-hidden focus:ring-1.5 focus:ring-emerald-500 shadow-2xs cursor-pointer appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-emerald-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Month Filter */}
            {availableMonths.length > 0 && (
              <div className="relative">
                <select
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="w-full sm:w-auto pl-2 pr-6 py-1 bg-purple-50/80 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-purple-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-purple-950 dark:text-purple-200 focus:outline-hidden focus:ring-1.5 focus:ring-purple-500 shadow-2xs cursor-pointer appearance-none"
                >
                  <option value="ALL">All Dates</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-purple-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {/* Sort Order Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto pl-2 pr-6 py-1 bg-amber-50/80 hover:bg-amber-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-amber-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-amber-950 dark:text-amber-200 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500 shadow-2xs cursor-pointer appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="hw">Highest HW</option>
                <option value="cw">Highest CW</option>
              </select>
              <ChevronDown className="w-2.5 h-2.5 text-amber-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters Chip */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="col-span-2 sm:col-span-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Reset All Filters"
              >
                <RotateCcw className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Filter Summary Badge (When filtered) */}
        {hasActiveFilters && (
          <div className="px-4 py-2 bg-indigo-50/50 dark:bg-slate-900 border-b border-indigo-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200 font-medium">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Filtered View:</span>
              {selectedStudentFilter !== 'ALL' && (
                <span className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  Student: {studentMap.get(selectedStudentFilter)?.name || selectedStudentFilter}
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  Status: {statusFilter}
                </span>
              )}
              {selectedMonthFilter !== 'ALL' && (
                <span className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  Month: {selectedMonthFilter}
                </span>
              )}
              {searchTerm && (
                <span className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  &ldquo;{searchTerm}&rdquo;
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-800 dark:text-indigo-300">
              {filteredActivities.length} of {activities.length} shown
            </span>
          </div>
        )}

        {/* 5. Data Display Area: Either Tabular (Aligned Columns) or Cards */}
        {sortedActivities.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-indigo-500 mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Lesson Tracking Records Found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No activities match the current filters. Try adjusting your search keyword or clearing the filters.'
                : 'No tuition lessons have been recorded yet. Click "Log Daily Lesson" above to get started.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* ========================================================= */
          /* PERFECTLY ALIGNED TABLE VIEW                              */
          /* ========================================================= */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-indigo-50/70 dark:bg-slate-900 border-b border-indigo-200/90 dark:border-slate-800 text-[10.5px] font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider select-none">
                  <th className="py-3 px-3.5 w-32">Date &amp; AID</th>
                  <th className="py-3 px-3.5 w-48">Student</th>
                  <th className="py-3 px-3 w-28 text-center">Status</th>
                  <th className="py-3 px-3.5 min-w-[220px]">Lesson Topic &amp; Subject</th>
                  <th className="py-3 px-3 w-36 text-center">HW &amp; CW Marks</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Remarks / Notes</th>
                  <th className="py-3 px-3.5 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {sortedActivities.map((act) => {
                  const student = studentMap.get(act.studentSid);
                  const isEditing = editingAid === act.aid;
                  const isConfirmingDelete = deleteConfirmAid === act.aid;

                  if (isEditing && editFormData) {
                    return (
                      <tr key={act.aid} className="bg-indigo-50/90 dark:bg-slate-900 border-y-2 border-indigo-500 transition-colors">
                        <td className="p-3 align-top">
                          <input
                            type="date"
                            value={editFormData.date}
                            onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-950 dark:text-indigo-200 shadow-2xs"
                          />
                          <span className="block mt-1 text-[9.5px] font-mono text-indigo-700 dark:text-indigo-300 font-bold bg-white dark:bg-slate-800 px-1 py-0.2 rounded border border-indigo-200 dark:border-slate-700 w-fit">
                            {formatAid(act.aid)}
                          </span>
                        </td>
                        <td className="p-3 align-top">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{student?.name || act.studentSid}</p>
                          <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/90 dark:bg-indigo-950 px-1 py-0.2 rounded">SID: {act.studentSid}</span>
                        </td>
                        <td className="p-3 align-top text-center">
                          <select
                            value={editFormData.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as 'Present' | 'Absent';
                              if (newStatus === 'Absent') {
                                setEditFormData({
                                  ...editFormData,
                                  status: 'Absent',
                                  hwMarks: undefined,
                                  cwMarks: undefined,
                                });
                                setEditIsHwNotGraded(true);
                                setEditIsCwNotGraded(true);
                              } else {
                                setEditFormData({
                                  ...editFormData,
                                  status: 'Present',
                                });
                              }
                            }}
                            className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                        <td className="p-3 align-top">
                          <input
                            type="text"
                            value={editFormData.subjectTuitioned || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, subjectTuitioned: e.target.value })}
                            placeholder="Subject / Topic covered"
                            className="w-full px-2.5 py-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 shadow-2xs"
                          />
                        </td>
                        <td className="p-3 align-top text-center">
                          {editFormData.status === 'Absent' ? (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono italic">
                              Absent (No Marks)
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="HW"
                                value={editFormData.hwMarks ?? ''}
                                onChange={(e) => setEditFormData({
                                  ...editFormData,
                                  hwMarks: e.target.value !== '' ? Number(e.target.value) : undefined
                                })}
                                className="w-14 px-1.5 py-1 bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 rounded-lg text-xs font-mono font-bold text-amber-950 dark:text-amber-200 text-center shadow-2xs"
                                title="Homework Marks"
                              />
                              <input
                                type="number"
                                step="0.1"
                                placeholder="CW"
                                value={editFormData.cwMarks ?? ''}
                                onChange={(e) => setEditFormData({
                                  ...editFormData,
                                  cwMarks: e.target.value !== '' ? Number(e.target.value) : undefined
                                })}
                                className="w-14 px-1.5 py-1 bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-800 rounded-lg text-xs font-mono font-bold text-sky-950 dark:text-sky-200 text-center shadow-2xs"
                                title="Classwork Marks"
                              />
                            </div>
                          )}
                        </td>
                        <td className="p-3 align-top">
                          <input
                            type="text"
                            placeholder="Teacher feedback or comment..."
                            value={editFormData.comment || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 shadow-2xs"
                          />
                        </td>
                        <td className="p-3 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
                              title="Cancel Edit"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={isSavingEdit}
                              className="p-1.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                              title="Save Changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={act.aid}
                      className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Date & AID Column */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-900 dark:text-slate-100 font-bold font-mono text-[11px]">
                            <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span>{formatDateWithDay(act.date)}</span>
                          </div>
                          <span className="inline-block text-[9.5px] font-mono font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.2 rounded shadow-2xs">
                            {formatAid(act.aid)}
                          </span>
                        </div>
                      </td>

                      {/* 2. Student Profile Column */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(act.studentSid)}
                          className="text-left group/btn cursor-pointer block leading-tight"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-black text-[10px] flex items-center justify-center shrink-0">
                              {(student?.name || act.studentSid).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-slate-100 group-hover/btn:text-indigo-700 dark:group-hover/btn:text-indigo-400 transition-colors truncate max-w-[150px]">
                                {student?.name || act.studentSid}
                              </p>
                              <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-400">
                                SID: {act.studentSid}
                              </span>
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* 3. Status Column (Strictly Centered) */}
                      <td className="py-2.5 px-3 align-middle text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${
                            act.status === 'Present'
                              ? 'bg-emerald-100/90 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100/90 dark:bg-rose-950/70 text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {act.status === 'Present' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-700 dark:text-rose-400 shrink-0" />
                          )}
                          <span>{act.status}</span>
                        </span>
                      </td>

                      {/* 4. Lesson Topic & Subject Column */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <div className="space-y-0.5">
                          {act.subjectTuitioned ? (
                            <p className="text-slate-900 dark:text-slate-100 font-semibold text-xs leading-snug line-clamp-2">
                              {act.subjectTuitioned}
                            </p>
                          ) : (
                            <p className="text-slate-400 dark:text-slate-500 italic text-xs">General Tuition Session</p>
                          )}
                        </div>
                      </td>

                      {/* 5. HW & CW Marks Column (Strictly Centered) with Element-wise Light Colors */}
                      <td className="py-2.5 px-3 align-middle text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 font-mono text-[11px]">
                          {/* Homework Score */}
                          <span
                            className={`px-1.5 py-0.5 rounded border font-bold shadow-2xs ${
                              act.hwMarks !== undefined
                                ? 'bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                            title="Homework Score"
                          >
                            HW: {act.hwMarks !== undefined ? act.hwMarks : '—'}
                          </span>

                          {/* Classwork Score */}
                          <span
                            className={`px-1.5 py-0.5 rounded border font-bold shadow-2xs ${
                              act.cwMarks !== undefined
                                ? 'bg-sky-100/90 dark:bg-sky-950/70 text-sky-950 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                            }`}
                            title="Classwork Score"
                          >
                            CW: {act.cwMarks !== undefined ? act.cwMarks : '—'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Remarks / Notes Column */}
                      <td className="py-2.5 px-3.5 align-middle">
                        {act.comment ? (
                          <div className="flex items-start gap-1.5 text-purple-950 dark:text-purple-200 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 rounded-lg p-1.5 text-xs shadow-2xs">
                            <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 italic" title={act.comment}>
                              &ldquo;{act.comment}&rdquo;
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* 7. Action Controls Column (Aligned to Right) */}
                      <td className="py-2.5 px-3.5 align-middle text-right">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(act.aid)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-bold shadow-2xs cursor-pointer active:scale-95"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmAid(null)}
                              className="px-1.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(act)}
                              className="p-1.5 text-indigo-800 dark:text-indigo-300 hover:text-indigo-950 dark:hover:text-white hover:bg-indigo-100 dark:hover:bg-indigo-900 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
                              title="Edit Lesson Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmAid(act.aid)}
                              className="p-1.5 text-rose-800 dark:text-rose-300 hover:text-rose-950 dark:hover:text-white hover:bg-rose-100 dark:hover:bg-rose-900 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 hover:border-rose-300 dark:hover:border-rose-700 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
                              title="Delete Lesson Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ========================================================= */
          /* STRUCTURED RESPONSIVE CARDS VIEW                          */
          /* ========================================================= */
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
            {sortedActivities.map((act) => {
              const student = studentMap.get(act.studentSid);
              const isEditing = editingAid === act.aid;
              const isConfirmingDelete = deleteConfirmAid === act.aid;

              if (isEditing && editFormData) {
                return (
                  <div
                    key={act.aid}
                    className="bg-white dark:bg-slate-900 border-2 border-indigo-400/90 dark:border-indigo-600 ring-4 ring-indigo-500/10 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-lg col-span-1 md:col-span-2 xl:col-span-3 transition-all"
                  >
                    {/* Detailed Edit Window Header with Light Background Coloring */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100 dark:border-slate-800 bg-indigo-50/60 dark:bg-slate-900 -mx-3.5 -mt-3.5 p-3.5 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg shadow-2xs border border-indigo-200 dark:border-indigo-800">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 font-display">
                            Editing Daily Lesson Record
                          </span>
                          <span className="ml-2 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 px-1.5 py-0.2 rounded shadow-2xs">
                            {formatAid(act.aid)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Cancel Edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form Fields Grid with Element-wise light background colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Date Field - Indigo Tint */}
                      <div className="bg-indigo-50/50 dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-indigo-950 dark:text-indigo-200 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Lesson Date</span>
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Attendance Status Field - Emerald / Rose Tint */}
                      <div className={`border rounded-xl p-2.5 ${
                        editFormData.status === 'Present'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/90 dark:border-emerald-800/60'
                          : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200/90 dark:border-rose-800/60'
                      }`}>
                        <label className="text-[10.5px] font-black uppercase tracking-wider block mb-1 flex items-center gap-1 text-slate-800 dark:text-slate-200">
                          {editFormData.status === 'Present' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          )}
                          <span>Attendance Status</span>
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'Present' | 'Absent';
                            if (newStatus === 'Absent') {
                              setEditFormData({
                                ...editFormData,
                                status: 'Absent',
                                hwMarks: undefined,
                                cwMarks: undefined,
                              });
                              setEditIsHwNotGraded(true);
                              setEditIsCwNotGraded(true);
                            } else {
                              setEditFormData({
                                ...editFormData,
                                status: 'Present',
                              });
                            }
                          }}
                          className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            editFormData.status === 'Present'
                              ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 focus:ring-2 focus:ring-emerald-500/20'
                              : 'bg-white dark:bg-slate-800 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-200 focus:ring-2 focus:ring-rose-500/20'
                          }`}
                        >
                          <option value="Present">✓ Present</option>
                          <option value="Absent">✕ Absent</option>
                        </select>
                      </div>

                      {/* Student Reference - Purple Tint */}
                      <div className="bg-purple-50/50 dark:bg-slate-900 border border-purple-200/80 dark:border-purple-900/60 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                          <span>Student (SID)</span>
                        </label>
                        <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded-xl text-xs font-bold text-purple-950 dark:text-purple-200 truncate shadow-2xs">
                          {student?.name || act.studentSid} ({act.studentSid})
                        </div>
                      </div>

                      {/* Subject & Topic Covered - Sky Tint */}
                      <div className="sm:col-span-2 md:col-span-3 bg-sky-50/50 dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-sky-950 dark:text-sky-200 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          <span>Subject &amp; Chapter / Topic Covered</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Physics – Chapter 4: Work & Energy – Practice Problems"
                          value={editFormData.subjectTuitioned || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, subjectTuitioned: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-sky-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal transition-all shadow-2xs"
                        />
                      </div>

                      {/* Homework Marks (HW) - Amber Tint */}
                      <div className="bg-amber-50/60 dark:bg-slate-900 border border-amber-200/90 dark:border-amber-900/60 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <label className="text-[10.5px] font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>Homework Marks (HW)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-amber-900 dark:text-amber-300 font-bold bg-amber-200/80 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 px-1.5 py-0.2 rounded">
                              Max: 10
                            </span>
                            <label className="bg-white/90 dark:bg-slate-950 border border-amber-300 dark:border-amber-800 hover:border-amber-400 rounded-md px-1.5 py-0.5 flex items-center gap-1 text-[10px] font-bold text-amber-950 dark:text-amber-300 shadow-2xs cursor-pointer select-none transition-all">
                              <input
                                type="checkbox"
                                checked={editIsHwNotGraded || editFormData.status === 'Absent'}
                                disabled={editFormData.status === 'Absent'}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setEditIsHwNotGraded(checked);
                                  if (checked) {
                                    setEditFormData({ ...editFormData, hwMarks: undefined });
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span>Not Graded</span>
                            </label>
                          </div>
                        </div>

                        {editFormData.status === 'Absent' || editIsHwNotGraded ? (
                          <div className="w-full bg-amber-100/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-800/80 dark:text-amber-300/80 italic shadow-2xs flex items-center justify-between select-none">
                            <span>{editFormData.status === 'Absent' ? 'Absent — No Marks' : 'Not Graded for this session'}</span>
                            <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded font-sans font-bold">Exempt</span>
                          </div>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            placeholder="e.g. 8.5"
                            value={editFormData.hwMarks ?? ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                hwMarks: e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-mono font-bold text-amber-950 dark:text-amber-200 placeholder:text-amber-400 transition-all shadow-2xs"
                          />
                        )}
                      </div>

                      {/* Classwork Marks (CW) - Teal Tint */}
                      <div className="bg-teal-50/60 dark:bg-slate-900 border border-teal-200/90 dark:border-teal-900/60 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <label className="text-[10.5px] font-black text-teal-950 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>Classwork Marks (CW)</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-teal-900 dark:text-teal-300 font-bold bg-teal-200/80 dark:bg-teal-950 border border-teal-300 dark:border-teal-800 px-1.5 py-0.2 rounded">
                              Max: 10
                            </span>
                            <label className="bg-white/90 dark:bg-slate-950 border border-teal-300 dark:border-teal-800 hover:border-teal-400 rounded-md px-1.5 py-0.5 flex items-center gap-1 text-[10px] font-bold text-teal-950 dark:text-teal-300 shadow-2xs cursor-pointer select-none transition-all">
                              <input
                                type="checkbox"
                                checked={editIsCwNotGraded || editFormData.status === 'Absent'}
                                disabled={editFormData.status === 'Absent'}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setEditIsCwNotGraded(checked);
                                  if (checked) {
                                    setEditFormData({ ...editFormData, cwMarks: undefined });
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span>Not Graded</span>
                            </label>
                          </div>
                        </div>

                        {editFormData.status === 'Absent' || editIsCwNotGraded ? (
                          <div className="w-full bg-teal-100/70 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900/60 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-teal-800/80 dark:text-teal-300/80 italic shadow-2xs flex items-center justify-between select-none">
                            <span>{editFormData.status === 'Absent' ? 'Absent — No Marks' : 'Not Graded for this session'}</span>
                            <span className="text-[9px] bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200 px-1.5 py-0.2 rounded font-sans font-bold">Exempt</span>
                          </div>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            placeholder="e.g. 9.0"
                            value={editFormData.cwMarks ?? ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                cwMarks: e.target.value === '' ? undefined : Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-teal-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-xs font-mono font-bold text-teal-950 dark:text-teal-200 placeholder:text-teal-400 transition-all shadow-2xs"
                          />
                        )}
                      </div>

                      {/* Teacher Remarks - Pink/Rose Tint */}
                      <div className="sm:col-span-2 md:col-span-1 bg-pink-50/50 dark:bg-slate-900 border border-pink-200/80 dark:border-rose-900/60 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-pink-950 dark:text-rose-200 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-pink-600 dark:text-rose-400" />
                          <span>Teacher Remarks</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Observations or remarks..."
                          value={editFormData.comment || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-pink-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder-slate-500 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        disabled={isSavingEdit}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              const isPresent = act.status === 'Present';
              const hwNum = typeof act.hwMarks === 'number' ? act.hwMarks : (act.hwMarks !== undefined && act.hwMarks !== null && act.hwMarks !== 'null' ? Number(act.hwMarks) : null);
              const cwNum = typeof act.cwMarks === 'number' ? act.cwMarks : (act.cwMarks !== undefined && act.cwMarks !== null && act.cwMarks !== 'null' ? Number(act.cwMarks) : null);
              const isHwNull = hwNum === null || isNaN(hwNum);
              const isCwNull = cwNum === null || isNaN(cwNum);

              return (
                <div
                  key={act.aid}
                  className={`group relative rounded-2xl p-4 sm:p-4.5 space-y-3.5 transition-all duration-300 flex flex-col justify-between border-2 h-full min-w-0 ${
                    isPresent
                      ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-slate-950 border-emerald-300 dark:border-emerald-800/70 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.32)] hover:border-emerald-500 dark:hover:border-emerald-500 hover:-translate-y-0.5'
                      : 'bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white dark:from-rose-950/40 dark:via-slate-900/90 dark:to-slate-950 border-rose-300 dark:border-rose-800/70 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.32)] hover:border-rose-500 dark:hover:border-rose-500 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Subtle decorative glowing corner accent */}
                  <div
                    className={`absolute -top-1 -right-1 w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-80 ${
                      isPresent ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />

                  {/* Top Row: Student Avatar & Info + Glowing Status Pill */}
                  <div className="flex items-start justify-between gap-2 relative z-10 min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(act.studentSid)}
                      className="text-left group/cardbtn min-w-0 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 border border-indigo-200 dark:border-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover/cardbtn:scale-105 transition-transform">
                          {(student?.name || act.studentSid).charAt(0).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {isPresent ? <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> : <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 group-hover/cardbtn:text-indigo-600 dark:group-hover/cardbtn:text-indigo-400 transition-colors truncate text-sm sm:text-[15px] flex items-center gap-1.5">
                          <span>{student?.name || act.studentSid}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/70 border border-indigo-300/80 dark:border-indigo-800/60 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5 text-indigo-500 dark:text-indigo-400" />
                            <span>SID: {act.studentSid}</span>
                          </span>
                        </div>
                      </div>
                    </button>

                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border shadow-xs tracking-wide transition-all ${
                          isPresent
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.35)]'
                            : 'bg-rose-500 text-white border-rose-400 shadow-[0_2px_10px_rgba(244,63,94,0.35)]'
                        }`}
                      >
                        {isPresent ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                        )}
                        <span>{act.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Lesson Topic & Metadata - Glowing Indigo Card */}
                  <div className="space-y-2 bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-white dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-indigo-200/90 dark:border-indigo-900/60 rounded-xl p-3 shadow-2xs group-hover:border-indigo-300 dark:group-hover:border-indigo-700 transition-colors relative z-10 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider min-w-0 truncate">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate">Topic Covered</span>
                      </div>
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg font-bold text-[10px] font-mono shadow-[0_2px_6px_rgba(79,70,229,0.3)] flex items-center gap-1 shrink-0">
                        <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                        <span>{formatAid(act.aid)}</span>
                      </span>
                    </div>
                    <p className="text-slate-900 dark:text-slate-100 font-extrabold text-[13px] sm:text-sm leading-snug line-clamp-2">
                      {act.subjectTuitioned || 'General Tuition Session'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-800/90 border border-indigo-200/80 dark:border-slate-700 px-2.5 py-1 rounded-lg shadow-2xs min-w-0">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="truncate">{formatDateWithDay(act.date)}</span>
                    </div>
                  </div>

                  {/* Scores & Remarks: HW & CW with vibrant glowing elements & icons */}
                  <div className="space-y-2.5 relative z-10">
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* HW Badge */}
                      <div className="bg-gradient-to-br from-amber-50 via-amber-100/50 to-white dark:from-amber-950/40 dark:via-amber-900/20 dark:to-slate-900 border-2 border-amber-300/90 dark:border-amber-700/60 rounded-xl p-2.5 shadow-[0_2px_10px_-2px_rgba(245,158,11,0.2)] hover:border-amber-400 dark:hover:border-amber-600 transition-all">
                        <div className="flex items-center justify-between text-[10px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide mb-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            HW
                          </span>
                          <span className="text-[9px] text-amber-700 dark:text-amber-400/80 font-mono">Homework</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono font-black text-amber-950 dark:text-amber-200 text-sm">
                            {isHwNull ? (
                              <span className="text-amber-800/70 dark:text-amber-400/70 font-semibold italic text-xs">null/10</span>
                            ) : (
                              <span>{hwNum}<span className="text-xs text-amber-700 dark:text-amber-400 font-medium">/10</span></span>
                            )}
                          </span>
                          {!isHwNull && (
                            <span className="text-[9.5px] font-mono font-extrabold text-amber-900 dark:text-amber-200 bg-amber-200/90 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700 px-1.5 py-0.2 rounded-md">
                              {Math.round(((hwNum as number) / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CW Badge */}
                      <div className="bg-gradient-to-br from-sky-50 via-cyan-100/50 to-white dark:from-sky-950/40 dark:via-cyan-900/20 dark:to-slate-900 border-2 border-sky-300/90 dark:border-sky-700/60 rounded-xl p-2.5 shadow-[0_2px_10px_-2px_rgba(14,165,233,0.2)] hover:border-sky-400 dark:hover:border-sky-600 transition-all">
                        <div className="flex items-center justify-between text-[10px] font-black text-sky-900 dark:text-sky-300 uppercase tracking-wide mb-1">
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                            CW
                          </span>
                          <span className="text-[9px] text-sky-700 dark:text-sky-400/80 font-mono">Classwork</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono font-black text-sky-950 dark:text-sky-200 text-sm">
                            {isCwNull ? (
                              <span className="text-sky-800/70 dark:text-sky-400/70 font-semibold italic text-xs">null/10</span>
                            ) : (
                              <span>{cwNum}<span className="text-xs text-sky-700 dark:text-sky-400 font-medium">/10</span></span>
                            )}
                          </span>
                          {!isCwNull && (
                            <span className="text-[9.5px] font-mono font-extrabold text-sky-900 dark:text-sky-200 bg-sky-200/90 dark:bg-sky-900/60 border border-sky-300 dark:border-sky-700 px-1.5 py-0.2 rounded-md">
                              {Math.round(((cwNum as number) / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Teacher's Note / Remarks with glowing purple badge */}
                    {act.comment ? (
                      <div className="text-xs text-purple-950 dark:text-purple-200 italic bg-gradient-to-r from-purple-50 via-fuchsia-50/40 to-white dark:from-purple-950/40 dark:via-purple-900/20 dark:to-slate-900 border border-purple-200/90 dark:border-purple-800/60 rounded-xl p-2.5 flex items-start gap-2 shadow-[0_2px_8px_-2px_rgba(168,85,247,0.18)]">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">&ldquo;{act.comment}&rdquo;</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 italic bg-slate-50/60 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-slate-300 dark:text-slate-600 shrink-0" />
                        <span>No remark added for this session</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer - Glowing buttons & clear affordances */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 dark:border-slate-800 gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(act.studentSid)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-white dark:hover:text-white bg-white dark:bg-slate-800/90 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 border border-indigo-300 dark:border-slate-700 hover:border-transparent px-3 py-1.5 rounded-xl transition-all duration-200 shadow-2xs hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)] cursor-pointer active:scale-95"
                    >
                      <User className="w-3 h-3" />
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(act.aid)}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-[10.5px] font-bold cursor-pointer transition-all active:scale-95 shadow-[0_2px_8px_rgba(244,63,94,0.35)]"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAid(null)}
                          className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(act)}
                          className="px-2.5 py-1.5 text-indigo-900 dark:text-indigo-200 hover:text-white dark:hover:text-white bg-indigo-100 dark:bg-indigo-950 hover:bg-indigo-600 dark:hover:bg-indigo-600 border border-indigo-300 dark:border-indigo-800 hover:border-transparent rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_10px_rgba(99,102,241,0.3)] active:scale-95 flex items-center gap-1"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="text-[11px] font-bold">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAid(act.aid)}
                          className="px-2.5 py-1.5 text-rose-900 dark:text-rose-200 hover:text-white dark:hover:text-white bg-rose-100 dark:bg-rose-950 hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-300 dark:border-rose-800 hover:border-transparent rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_10px_rgba(244,63,94,0.3)] active:scale-95 flex items-center gap-1"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="text-[11px] font-bold">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 6. Footer Count & Pagination Info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Displaying <strong className="text-slate-800 dark:text-slate-200 font-bold">{sortedActivities.length}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200 font-bold">{activities.length}</strong> total study logs
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Log Daily Lesson Modal */}
      <LogDailyLessonModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        student={selectedStudentFilter !== 'ALL' ? studentMap.get(selectedStudentFilter) : undefined}
        students={activeStudents}
        onAddActivity={handleAddActivityInternal}
      />
    </div>
  );
}

