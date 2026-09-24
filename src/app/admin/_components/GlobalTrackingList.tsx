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
    setDeleteConfirmAid(null);
  };

  const handleCancelEdit = () => {
    setEditingAid(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData) return;
    setIsSavingEdit(true);
    try {
      await onUpdateActivity(editFormData);
      setEditingAid(null);
      setEditFormData(null);
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
        <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/50 to-blue-50/60 rounded-xl border border-indigo-200/90 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-indigo-950 uppercase tracking-tight truncate">Lessons</span>
            <div className="p-0.5 sm:p-1 bg-indigo-100 border border-indigo-300/80 text-indigo-700 rounded-md shrink-0">
              <BookOpen className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-display font-black text-indigo-950 tracking-tight leading-none font-mono">
              {stats.total}
            </span>
            <span className="text-[8px] sm:text-[9px] text-indigo-700 font-bold hidden sm:inline truncate">
              {selectedStudentFilter === 'ALL' ? 'Total' : 'Filtered'}
            </span>
          </div>
        </div>

        {/* Present Sessions & Attendance Rate - Emerald Tint */}
        <div className="bg-gradient-to-br from-emerald-50/95 via-teal-50/50 to-emerald-100/40 rounded-xl border border-emerald-200/90 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-emerald-950 uppercase tracking-tight truncate">Attend</span>
            <div className="p-0.5 sm:p-1 bg-emerald-100 border border-emerald-300/80 text-emerald-700 rounded-md shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-display font-black text-emerald-950 tracking-tight leading-none font-mono">
              {stats.present}
            </span>
            <span className="text-[7.5px] sm:text-[8.5px] bg-emerald-200 text-emerald-950 font-mono font-bold px-1 py-0.2 rounded border border-emerald-300">
              {stats.attendanceRate}%
            </span>
          </div>
        </div>

        {/* Absent Count - Rose Tint */}
        <div className="bg-gradient-to-br from-rose-50/95 via-pink-50/50 to-rose-100/40 rounded-xl border border-rose-200/90 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-rose-950 uppercase tracking-tight truncate">Absence</span>
            <div className="p-0.5 sm:p-1 bg-rose-100 border border-rose-300/80 text-rose-700 rounded-md shrink-0">
              <XCircle className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-baseline gap-1">
            <span className="text-sm sm:text-lg font-display font-black text-rose-950 tracking-tight leading-none font-mono">
              {stats.absent}
            </span>
            <span className="text-[8px] sm:text-[9px] text-rose-700 font-bold hidden sm:inline">
              Missed
            </span>
          </div>
        </div>

        {/* Academic Marks Average - Amber Tint */}
        <div className="bg-gradient-to-br from-amber-50/95 via-yellow-50/50 to-amber-100/40 rounded-xl border border-amber-200/90 p-1.5 sm:p-2.5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[8.5px] sm:text-[10px] font-black text-amber-950 uppercase tracking-tight truncate">Grading</span>
            <div className="p-0.5 sm:p-1 bg-amber-100 border border-amber-300/80 text-amber-700 rounded-md shrink-0">
              <Award className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 flex items-center gap-1 font-mono">
            <span className="text-[8.5px] sm:text-[10px] font-black text-amber-950 bg-amber-200 px-1 py-0.2 rounded border border-amber-300">
              H:{stats.avgHw ?? '—'}
            </span>
            <span className="text-[8.5px] sm:text-[10px] font-black text-sky-950 bg-sky-200 px-1 py-0.2 rounded border border-sky-300">
              C:{stats.avgCw ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Tracking Matrix Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-indigo-100/90 shadow-sm overflow-hidden w-full max-w-full">
        {/* Header Ribbon */}
        <div className="p-2.5 sm:p-3.5 border-b border-indigo-100 bg-gradient-to-r from-indigo-50/95 via-purple-50/40 to-sky-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-xl shadow-xs border border-indigo-400/30 shrink-0">
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="font-display font-black text-indigo-950 text-xs sm:text-sm tracking-tight leading-tight">
                  Daily Study Logs & Tracking
                </h2>
                <span className="text-[9.5px] bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono font-bold px-1.5 py-0.2 rounded-md shadow-2xs">
                  {filteredActivities.length}
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools: View Toggle & Log Button */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            {/* View Mode Toggle Button */}
            <div className="flex items-center p-0.5 bg-indigo-100/80 border border-indigo-200 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-950 shadow-2xs border border-indigo-200 font-black'
                    : 'text-indigo-700 hover:text-indigo-950'
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
                    ? 'bg-white text-indigo-950 shadow-2xs border border-indigo-200 font-black'
                    : 'text-indigo-700 hover:text-indigo-950'
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
        <div className="p-2 sm:p-3 bg-slate-50/80 border-b border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-1.5">
          {/* Search Input Bar */}
          <div className="relative flex-1 min-w-[150px]">
            <Search className="w-3 h-3 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic, student, SID..."
              className="w-full pl-7 pr-6 py-1 bg-white border border-indigo-200 rounded-lg text-[11px] sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500 shadow-2xs font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
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
                className="w-full sm:w-auto pl-2 pr-6 py-1 bg-indigo-50/80 hover:bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-950 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500 shadow-2xs cursor-pointer appearance-none truncate max-w-full"
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
                className="w-full sm:w-auto pl-2 pr-6 py-1 bg-emerald-50/80 hover:bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-950 focus:outline-hidden focus:ring-1.5 focus:ring-emerald-500 shadow-2xs cursor-pointer appearance-none"
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
                  className="w-full sm:w-auto pl-2 pr-6 py-1 bg-purple-50/80 hover:bg-purple-50 border border-purple-200 rounded-lg text-[11px] font-bold text-purple-950 focus:outline-hidden focus:ring-1.5 focus:ring-purple-500 shadow-2xs cursor-pointer appearance-none"
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
                className="w-full sm:w-auto pl-2 pr-6 py-1 bg-amber-50/80 hover:bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-bold text-amber-950 focus:outline-hidden focus:ring-1.5 focus:ring-indigo-500 shadow-2xs cursor-pointer appearance-none"
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
                className="col-span-2 sm:col-span-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Reset All Filters"
              >
                <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Filter Summary Badge (When filtered) */}
        {hasActiveFilters && (
          <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 font-medium">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Filtered View:</span>
              {selectedStudentFilter !== 'ALL' && (
                <span className="bg-white border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  Student: {studentMap.get(selectedStudentFilter)?.name || selectedStudentFilter}
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="bg-white border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  Status: {statusFilter}
                </span>
              )}
              {selectedMonthFilter !== 'ALL' && (
                <span className="bg-white border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  Month: {selectedMonthFilter}
                </span>
              )}
              {searchTerm && (
                <span className="bg-white border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-[10.5px]">
                  &ldquo;{searchTerm}&rdquo;
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-800">
              {filteredActivities.length} of {activities.length} shown
            </span>
          </div>
        )}

        {/* 5. Data Display Area: Either Tabular (Aligned Columns) or Cards */}
        {sortedActivities.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-500 mx-auto flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Lesson Tracking Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                <tr className="bg-indigo-50/70 border-b border-indigo-200/90 text-[10.5px] font-black text-indigo-950 uppercase tracking-wider select-none">
                  <th className="py-3 px-3.5 w-32">Date &amp; AID</th>
                  <th className="py-3 px-3.5 w-48">Student</th>
                  <th className="py-3 px-3 w-28 text-center">Status</th>
                  <th className="py-3 px-3.5 min-w-[220px]">Lesson Topic &amp; Subject</th>
                  <th className="py-3 px-3 w-36 text-center">HW &amp; CW Marks</th>
                  <th className="py-3 px-3.5 min-w-[170px]">Remarks / Notes</th>
                  <th className="py-3 px-3.5 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedActivities.map((act) => {
                  const student = studentMap.get(act.studentSid);
                  const isEditing = editingAid === act.aid;
                  const isConfirmingDelete = deleteConfirmAid === act.aid;

                  if (isEditing && editFormData) {
                    return (
                      <tr key={act.aid} className="bg-indigo-50/90 border-y-2 border-indigo-500 transition-colors">
                        <td className="p-3 align-top">
                          <input
                            type="date"
                            value={editFormData.date}
                            onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-mono font-bold text-indigo-950 shadow-2xs"
                          />
                          <span className="block mt-1 text-[9.5px] font-mono text-indigo-700 font-bold bg-white px-1 py-0.2 rounded border border-indigo-200 w-fit">
                            {formatAid(act.aid)}
                          </span>
                        </td>
                        <td className="p-3 align-top">
                          <p className="font-bold text-slate-900">{student?.name || act.studentSid}</p>
                          <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-100/90 px-1 py-0.2 rounded">SID: {act.studentSid}</span>
                        </td>
                        <td className="p-3 align-top text-center">
                          <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="px-2 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-900 shadow-2xs"
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
                            className="w-full px-2.5 py-1 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-slate-900 shadow-2xs"
                          />
                        </td>
                        <td className="p-3 align-top text-center">
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
                              className="w-14 px-1.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-mono font-bold text-amber-950 text-center shadow-2xs"
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
                              className="w-14 px-1.5 py-1 bg-sky-50 border border-sky-300 rounded-lg text-xs font-mono font-bold text-sky-950 text-center shadow-2xs"
                              title="Classwork Marks"
                            />
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <input
                            type="text"
                            placeholder="Teacher feedback or comment..."
                            value={editFormData.comment || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-indigo-300 rounded-lg text-xs text-slate-800 shadow-2xs"
                          />
                        </td>
                        <td className="p-3 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-all cursor-pointer"
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
                      className="hover:bg-indigo-50/40 transition-colors group"
                    >
                      {/* 1. Date & AID Column */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-900 font-bold font-mono text-[11.5px]">
                            <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{act.date}</span>
                          </div>
                          <span className="inline-block text-[9.5px] font-mono font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded shadow-2xs">
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
                            <div className="w-6 h-6 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-800 font-black text-[10px] flex items-center justify-center shrink-0">
                              {(student?.name || act.studentSid).charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 group-hover/btn:text-indigo-700 transition-colors truncate max-w-[150px]">
                                {student?.name || act.studentSid}
                              </p>
                              <span className="text-[10px] font-mono font-bold text-indigo-700">
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
                              ? 'bg-emerald-100/90 text-emerald-950 border-emerald-300'
                              : 'bg-rose-100/90 text-rose-950 border-rose-300'
                          }`}
                        >
                          {act.status === 'Present' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-700 shrink-0" />
                          )}
                          <span>{act.status}</span>
                        </span>
                      </td>

                      {/* 4. Lesson Topic & Subject Column */}
                      <td className="py-2.5 px-3.5 align-middle">
                        <div className="space-y-0.5">
                          {act.subjectTuitioned ? (
                            <p className="text-slate-900 font-semibold text-xs leading-snug line-clamp-2">
                              {act.subjectTuitioned}
                            </p>
                          ) : (
                            <p className="text-slate-400 italic text-xs">General Tuition Session</p>
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
                                ? 'bg-amber-100/90 text-amber-950 border-amber-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                            title="Homework Score"
                          >
                            HW: {act.hwMarks !== undefined ? act.hwMarks : '—'}
                          </span>

                          {/* Classwork Score */}
                          <span
                            className={`px-1.5 py-0.5 rounded border font-bold shadow-2xs ${
                              act.cwMarks !== undefined
                                ? 'bg-sky-100/90 text-sky-950 border-sky-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
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
                          <div className="flex items-start gap-1.5 text-purple-950 bg-purple-50/60 border border-purple-200/80 rounded-lg p-1.5 text-xs shadow-2xs">
                            <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 italic" title={act.comment}>
                              &ldquo;{act.comment}&rdquo;
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
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
                              className="px-1.5 py-1 bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(act)}
                              className="p-1.5 text-indigo-800 hover:text-indigo-950 hover:bg-indigo-100 bg-indigo-50 border border-indigo-200 hover:border-indigo-300 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
                              title="Edit Lesson Record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmAid(act.aid)}
                              className="p-1.5 text-rose-800 hover:text-rose-950 hover:bg-rose-100 bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
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
                    className="bg-white border-2 border-indigo-400/90 ring-4 ring-indigo-500/10 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-lg col-span-1 md:col-span-2 xl:col-span-3 transition-all"
                  >
                    {/* Detailed Edit Window Header with Light Background Coloring */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100 bg-indigo-50/60 -mx-3.5 -mt-3.5 p-3.5 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shadow-2xs border border-indigo-200">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-indigo-950 font-display">
                            Editing Daily Lesson Record
                          </span>
                          <span className="ml-2 text-[10px] font-mono font-bold bg-white text-indigo-800 border border-indigo-300 px-1.5 py-0.2 rounded shadow-2xs">
                            {formatAid(act.aid)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Cancel Edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Form Fields Grid with Element-wise light background colors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {/* Date Field - Indigo Tint */}
                      <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-indigo-950 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          <span>Lesson Date</span>
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-indigo-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Attendance Status Field - Emerald / Rose Tint */}
                      <div className={`border rounded-xl p-2.5 ${
                        editFormData.status === 'Present'
                          ? 'bg-emerald-50/60 border-emerald-200/90'
                          : 'bg-rose-50/60 border-rose-200/90'
                      }`}>
                        <label className="text-[10.5px] font-black uppercase tracking-wider block mb-1 flex items-center gap-1 text-slate-800">
                          {editFormData.status === 'Present' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <span>Attendance Status</span>
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          className={`w-full px-3 py-1.5 border rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            editFormData.status === 'Present'
                              ? 'bg-white border-emerald-300 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20'
                              : 'bg-white border-rose-300 text-rose-950 focus:ring-2 focus:ring-rose-500/20'
                          }`}
                        >
                          <option value="Present">✓ Present</option>
                          <option value="Absent">✕ Absent</option>
                        </select>
                      </div>

                      {/* Student Reference - Purple Tint */}
                      <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-purple-950 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-purple-600" />
                          <span>Student (SID)</span>
                        </label>
                        <div className="px-3 py-1.5 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-950 truncate shadow-2xs">
                          {student?.name || act.studentSid} ({act.studentSid})
                        </div>
                      </div>

                      {/* Subject & Topic Covered - Sky Tint */}
                      <div className="sm:col-span-2 md:col-span-3 bg-sky-50/50 border border-sky-200/80 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-sky-950 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-sky-600" />
                          <span>Subject &amp; Chapter / Topic Covered</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Physics – Chapter 4: Work & Energy – Practice Problems"
                          value={editFormData.subjectTuitioned || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, subjectTuitioned: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-sky-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all shadow-2xs"
                        />
                      </div>

                      {/* Homework Marks (HW) - Amber Tint */}
                      <div className="bg-amber-50/60 border border-amber-200/90 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                          <span>Homework Marks (HW)</span>
                          <span className="text-[9px] font-mono text-amber-900 font-bold bg-amber-200/80 border border-amber-300 px-1.5 py-0.2 rounded">
                            Max: 10
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 8.5"
                          value={editFormData.hwMarks ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              hwMarks: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-mono font-bold text-amber-950 placeholder:text-amber-400 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Classwork Marks (CW) - Teal Tint */}
                      <div className="bg-teal-50/60 border border-teal-200/90 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-teal-950 uppercase tracking-wider block mb-1 flex items-center justify-between">
                          <span>Classwork Marks (CW)</span>
                          <span className="text-[9px] font-mono text-teal-900 font-bold bg-teal-200/80 border border-teal-300 px-1.5 py-0.2 rounded">
                            Max: 10
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 9.0"
                          value={editFormData.cwMarks ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              cwMarks: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white border border-teal-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-xs font-mono font-bold text-teal-950 placeholder:text-teal-400 transition-all shadow-2xs"
                        />
                      </div>

                      {/* Teacher Remarks - Pink/Rose Tint */}
                      <div className="sm:col-span-2 md:col-span-1 bg-pink-50/50 border border-pink-200/80 rounded-xl p-2.5">
                        <label className="text-[10.5px] font-black text-pink-950 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-pink-600" />
                          <span>Teacher Remarks</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Observations or remarks..."
                          value={editFormData.comment || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white border border-pink-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                  className={`group relative rounded-2xl p-4 sm:p-4.5 space-y-3.5 transition-all duration-300 flex flex-col justify-between border-2 ${
                    isPresent
                      ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-300 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.32)] hover:border-emerald-500 hover:-translate-y-0.5'
                      : 'bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white border-rose-300 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.32)] hover:border-rose-500 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Subtle decorative glowing corner accent */}
                  <div
                    className={`absolute -top-1 -right-1 w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-80 ${
                      isPresent ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />

                  {/* Top Row: Student Avatar & Info + Glowing Status Pill */}
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(act.studentSid)}
                      className="text-left group/cardbtn min-w-0 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 border border-indigo-200 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(99,102,241,0.35)] group-hover/cardbtn:scale-105 transition-transform">
                          {(student?.name || act.studentSid).charAt(0).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {isPresent ? <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> : <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 group-hover/cardbtn:text-indigo-600 transition-colors truncate text-sm sm:text-[15px] flex items-center gap-1.5">
                          <span>{student?.name || act.studentSid}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/90 border border-indigo-300/80 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5 text-indigo-500" />
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
                  <div className="space-y-2 bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-white border border-indigo-200/90 rounded-xl p-3 shadow-2xs group-hover:border-indigo-300 transition-colors relative z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-indigo-700 uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Topic Covered</span>
                    </div>
                    <p className="text-slate-900 font-extrabold text-[13px] sm:text-sm leading-snug break-words">
                      {act.subjectTuitioned || 'General Tuition Session'}
                    </p>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-600 font-mono flex-wrap pt-0.5">
                      <span className="flex items-center gap-1.5 font-bold text-slate-800 bg-white/95 border border-indigo-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                        <Calendar className="w-3 h-3 text-indigo-600" />
                        {act.date}
                      </span>
                      <span className="text-indigo-300">•</span>
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg font-bold shadow-[0_2px_6px_rgba(79,70,229,0.3)] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {formatAid(act.aid)}
                      </span>
                    </div>
                  </div>

                  {/* Scores & Remarks: HW & CW with vibrant glowing elements & icons */}
                  <div className="space-y-2.5 relative z-10">
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* HW Badge */}
                      <div className="bg-gradient-to-br from-amber-50 via-amber-100/50 to-white border-2 border-amber-300/90 rounded-xl p-2.5 shadow-[0_2px_10px_-2px_rgba(245,158,11,0.2)] hover:border-amber-400 transition-all">
                        <div className="flex items-center justify-between text-[10px] font-black text-amber-900 uppercase tracking-wide mb-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600" />
                            HW
                          </span>
                          <span className="text-[9px] text-amber-700 font-mono">Homework</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono font-black text-amber-950 text-sm">
                            {isHwNull ? (
                              <span className="text-amber-800/70 font-semibold italic text-xs">null/10</span>
                            ) : (
                              <span>{hwNum}<span className="text-xs text-amber-700 font-medium">/10</span></span>
                            )}
                          </span>
                          {!isHwNull && (
                            <span className="text-[9.5px] font-mono font-extrabold text-amber-900 bg-amber-200/90 border border-amber-300 px-1.5 py-0.2 rounded-md">
                              {Math.round(((hwNum as number) / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CW Badge */}
                      <div className="bg-gradient-to-br from-sky-50 via-cyan-100/50 to-white border-2 border-sky-300/90 rounded-xl p-2.5 shadow-[0_2px_10px_-2px_rgba(14,165,233,0.2)] hover:border-sky-400 transition-all">
                        <div className="flex items-center justify-between text-[10px] font-black text-sky-900 uppercase tracking-wide mb-1">
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3 text-sky-600" />
                            CW
                          </span>
                          <span className="text-[9px] text-sky-700 font-mono">Classwork</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="font-mono font-black text-sky-950 text-sm">
                            {isCwNull ? (
                              <span className="text-sky-800/70 font-semibold italic text-xs">null/10</span>
                            ) : (
                              <span>{cwNum}<span className="text-xs text-sky-700 font-medium">/10</span></span>
                            )}
                          </span>
                          {!isCwNull && (
                            <span className="text-[9.5px] font-mono font-extrabold text-sky-900 bg-sky-200/90 border border-sky-300 px-1.5 py-0.2 rounded-md">
                              {Math.round(((cwNum as number) / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Teacher's Note / Remarks with glowing purple badge */}
                    {act.comment ? (
                      <div className="text-xs text-purple-950 italic bg-gradient-to-r from-purple-50 via-fuchsia-50/40 to-white border border-purple-200/90 rounded-xl p-2.5 flex items-start gap-2 shadow-[0_2px_8px_-2px_rgba(168,85,247,0.18)]">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">&ldquo;{act.comment}&rdquo;</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic bg-slate-50/60 border border-dashed border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-slate-300 shrink-0" />
                        <span>No remark added for this session</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer - Glowing buttons & clear affordances */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(act.studentSid)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-white bg-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 border border-indigo-300 hover:border-transparent px-3 py-1.5 rounded-xl transition-all duration-200 shadow-2xs hover:shadow-[0_4px_12px_rgba(99,102,241,0.3)] cursor-pointer active:scale-95"
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
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(act)}
                          className="px-2.5 py-1.5 text-indigo-900 hover:text-white bg-indigo-100 hover:bg-indigo-600 border border-indigo-300 hover:border-transparent rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_10px_rgba(99,102,241,0.3)] active:scale-95 flex items-center gap-1"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="text-[11px] font-bold">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmAid(act.aid)}
                          className="px-2.5 py-1.5 text-rose-900 hover:text-white bg-rose-100 hover:bg-rose-600 border border-rose-300 hover:border-transparent rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_10px_rgba(244,63,94,0.3)] active:scale-95 flex items-center gap-1"
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
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Displaying <strong className="text-slate-800 font-bold">{sortedActivities.length}</strong> of{' '}
            <strong className="text-slate-800 font-bold">{activities.length}</strong> total study logs
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
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

