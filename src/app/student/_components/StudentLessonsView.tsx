'use client';

import React, { useState, useMemo } from 'react';
import { Student, Activity } from '@/types';
import { 
  BookOpen, Calendar, Clock, CheckCircle2, XCircle, Search, 
  Award, GraduationCap, ShieldCheck, Sparkles, Filter, ArrowUpDown,
  LayoutGrid, List, Flame, Zap, ShieldAlert, Trophy, Layers,
  FileText, Check
} from 'lucide-react';
import { formatAid } from '@/utils/id';

// Helper to format date with Day name (e.g. "Mon, 28 Sep 2026")
function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return 'Not recorded';
  try {
    const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    let d: Date;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

interface StudentLessonsViewProps {
  student?: Student;
  activities?: Activity[];
}

export default function StudentLessonsView({
  student,
  activities = [],
}: StudentLessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'hw' | 'cw' | 'topic'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Filter activities
  const studentActivities = useMemo(() => {
    return activities.filter((act) => {
      // Text search
      const matchesSearch =
        !searchTerm ||
        act.subjectTuitioned?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.aid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date or Month filters
      const matchesDate = !filterDate || act.date === filterDate;
      const matchesMonth = !filterMonth || (act.date && act.date.startsWith(filterMonth));

      // Status filter
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Present' && act.status !== 'Absent') ||
        (filterStatus === 'Absent' && act.status === 'Absent');

      return matchesSearch && matchesDate && matchesMonth && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'hw') {
        const hwA = a.hwMarks ?? -1;
        const hwB = b.hwMarks ?? -1;
        comparison = hwA - hwB;
      } else if (sortBy === 'cw') {
        const cwA = a.cwMarks ?? -1;
        const cwB = b.cwMarks ?? -1;
        comparison = cwA - cwB;
      } else if (sortBy === 'topic') {
        comparison = (a.subjectTuitioned || '').localeCompare(b.subjectTuitioned || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [activities, searchTerm, filterDate, filterMonth, filterStatus, sortBy, sortOrder]);

  // Telemetry Aggregates
  const totalLogs = activities.length;
  const presentCount = activities.filter((a) => a.status === 'Present').length;
  const absentCount = activities.filter((a) => a.status === 'Absent').length;
  const attendanceRate = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 100;

  // Average HW & CW score calculations
  const activitiesWithHw = activities.filter((a) => a.hwMarks !== undefined && a.hwMarks !== null);
  const avgHw = activitiesWithHw.length > 0
    ? Number((activitiesWithHw.reduce((acc, curr) => acc + (curr.hwMarks || 0), 0) / activitiesWithHw.length).toFixed(1))
    : null;

  const activitiesWithCw = activities.filter((a) => a.cwMarks !== undefined && a.cwMarks !== null);
  const avgCw = activitiesWithCw.length > 0
    ? Number((activitiesWithCw.reduce((acc, curr) => acc + (curr.cwMarks || 0), 0) / activitiesWithCw.length).toFixed(1))
    : null;

  return (
    <div className="space-y-3.5 sm:space-y-4.5 max-w-6xl mx-auto w-full min-w-0 animate-fadeIn" id="student-lessons-view-panel">
      
      {/* 1. TOP HERO TELEMETRY COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-50/95 via-teal-50/80 to-cyan-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 border-2 border-emerald-200/90 dark:border-emerald-500/35 p-3.5 sm:p-5 shadow-md dark:shadow-[0_0_35px_rgba(16,185,129,0.18)] transition-all duration-200">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-200/40 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-200/40 dark:bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-44 h-44 bg-cyan-200/30 dark:bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-500/25 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative p-2.5 sm:p-3 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white rounded-2xl shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.5)] shrink-0 border border-emerald-300/40">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-950 animate-ping" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-xl tracking-tight flex items-center gap-1.5">
                  Curriculum &amp; Daily Lessons <span className="text-emerald-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">Activity Hub</span>
                </h1>
                <span className="text-[9.5px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-400/40 shrink-0 shadow-2xs dark:shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  Study Timeline
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 font-medium truncate sm:whitespace-normal">
                Comprehensive lesson timeline, homework evaluations, and daily attendance logs.
              </p>
            </div>
          </div>

          {/* Attendance Overall Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-3.5 py-1.5 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-300/40 shrink-0">
            <div className="p-1 bg-white/20 rounded-md shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-[8.5px] uppercase tracking-wider text-emerald-100 dark:text-emerald-200 font-mono block leading-none font-bold">
                Attendance Rate
              </span>
              <span className="text-sm sm:text-base font-black font-mono leading-tight">
                {attendanceRate}%
              </span>
            </div>
          </div>
        </div>

        {/* 5 Summary Telemetry Badges with Light & Dark Responsive Styling */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
          {/* Total Lessons */}
          <div className="bg-emerald-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all">
            <span className="text-[9px] font-mono font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
              Total Lessons
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 dark:text-white block mt-0.5">
              {totalLogs} Sessions
            </span>
          </div>

          {/* Present */}
          <div className="bg-teal-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-teal-300/90 dark:border-teal-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(20,184,166,0.1)] transition-all">
            <span className="text-[9px] font-mono font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider block">
              Attended
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-teal-950 dark:text-teal-200 block mt-0.5">
              {presentCount} Days
            </span>
          </div>

          {/* Absent */}
          <div className="bg-rose-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-rose-300/90 dark:border-rose-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(244,63,94,0.1)] transition-all">
            <span className="text-[9px] font-mono font-bold text-rose-900 dark:text-rose-300 uppercase tracking-wider block">
              Absences
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-rose-950 dark:text-rose-300 block mt-0.5">
              {absentCount} Days
            </span>
          </div>

          {/* Avg Homework */}
          <div className="bg-amber-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-amber-300/90 dark:border-amber-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(245,158,11,0.1)] transition-all">
            <span className="text-[9px] font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              Avg Homework
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-amber-950 dark:text-amber-200 block mt-0.5">
              {avgHw !== null ? `${avgHw}/10` : '—'}
            </span>
          </div>

          {/* Avg Classwork */}
          <div className="bg-indigo-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-indigo-300/90 dark:border-indigo-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(99,102,241,0.1)] col-span-2 sm:col-span-1 transition-all">
            <span className="text-[9px] font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
              Avg Classwork
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-indigo-950 dark:text-indigo-200 block mt-0.5">
              {avgCw !== null ? `${avgCw}/10` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER, SEARCH & VIEW-MODE CONTROLS BAR */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3.5 shadow-sm space-y-2.5 backdrop-blur-xl transition-all duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          
          {/* Topic & Remarks Search */}
          <div className="sm:col-span-5 relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-400 shadow-2xs dark:shadow-inner transition-all">
            <div className="p-1 bg-emerald-600 text-white rounded-md shrink-0 mr-2 shadow-xs">
              <Search className="w-3 h-3" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic or teacher remarks..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div className="sm:col-span-3 relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-400 shadow-2xs dark:shadow-inner transition-all min-w-0">
            <div className="p-1 bg-teal-600 text-white rounded-md shrink-0 mr-2 shadow-xs">
              <Calendar className="w-3 h-3" />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate('');
              }}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            />
            {filterMonth && (
              <button
                type="button"
                onClick={() => setFilterMonth('')}
                className="ml-1 text-[10px] font-black bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded cursor-pointer shrink-0 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Attendance Status Filter Pills */}
          <div className="sm:col-span-4 flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner justify-between min-w-0">
            <button
              type="button"
              onClick={() => setFilterStatus('All')}
              className={`flex-1 py-1 px-1 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer truncate ${
                filterStatus === 'All'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({totalLogs})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Present')}
              className={`flex-1 py-1 px-1 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer truncate ${
                filterStatus === 'Present'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Absent')}
              className={`flex-1 py-1 px-1 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer truncate ${
                filterStatus === 'Absent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Absent ({absentCount})
            </button>
          </div>

        </div>

        {/* Sort & View Mode Switcher Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          
          {/* Counter info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
              Showing {studentActivities.length} of {totalLogs} lesson sessions
            </span>
            {filterMonth && (
              <span className="text-[9.5px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md">
                Month: {filterMonth}
              </span>
            )}
          </div>

          {/* Sort Controls & View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="date">Date</option>
                <option value="hw">Homework</option>
                <option value="cw">Classwork</option>
                <option value="topic">Topic</option>
              </select>

              {/* Asc/Desc Button */}
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] uppercase font-black">{sortOrder}</span>
              </button>
            </div>

            {/* View Mode Toggle: Cards vs List */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline text-[10px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Compact List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline text-[10px]">List</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 3. LESSON LOGS DISPLAY */}
      {studentActivities.length > 0 ? (
        viewMode === 'cards' ? (
          /* ========================================================================= */
          /* LIGHT & DARK RESPONSIVE CARDS                                             */
          /* ========================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
            {studentActivities.map((act, index) => {
              const isAbsent = act.status === 'Absent';
              const hasHw = act.hwMarks !== undefined && act.hwMarks !== null;
              const hasCw = act.cwMarks !== undefined && act.cwMarks !== null;

              // Compute average activity score for tier calculation (out of 10)
              const scoreList = [
                hasHw ? act.hwMarks! : null,
                hasCw ? act.cwMarks! : null
              ].filter((s): s is number => s !== null);

              const avgScore = scoreList.length > 0
                ? scoreList.reduce((a, b) => a + b, 0) / scoreList.length
                : null;

              // Light & Dark theme class configurations
              let cardBg = 'from-teal-50/95 via-emerald-50/70 to-sky-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/80 text-slate-900 dark:text-white';
              let cardBorder = 'border-teal-200/90 dark:border-teal-500/35 hover:border-teal-400/80';
              let cardGlow = 'shadow-md dark:shadow-[0_0_25px_rgba(20,184,166,0.12)] hover:shadow-lg dark:hover:shadow-[0_0_30px_rgba(20,184,166,0.25)]';
              let ambientOrb = 'bg-teal-200/40 dark:bg-teal-500/15';
              let iconBadgeBg = 'from-teal-600 to-emerald-600 border-teal-300 dark:border-teal-400/50 shadow-md dark:shadow-[0_0_12px_rgba(20,184,166,0.4)]';
              let gradeBadge = 'bg-teal-100 dark:bg-teal-500/20 text-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-400/40';
              let gradeLabel = 'Good (B)';
              let gradeIcon = Award;
              let topAccent = 'bg-gradient-to-r from-teal-500 to-emerald-500';

              if (isAbsent) {
                cardBg = 'from-rose-50/90 via-pink-50/70 to-slate-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/80 text-slate-900 dark:text-white';
                cardBorder = 'border-rose-200/90 dark:border-rose-500/30 hover:border-rose-400/80';
                cardGlow = 'shadow-md dark:shadow-[0_0_20px_rgba(244,63,94,0.1)]';
                ambientOrb = 'bg-rose-200/40 dark:bg-rose-500/15';
                iconBadgeBg = 'from-rose-600 to-red-700 border-rose-300 dark:border-rose-400/40 shadow-md dark:shadow-[0_0_12px_rgba(244,63,94,0.35)]';
                gradeBadge = 'bg-rose-100 dark:bg-rose-500/20 text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-400/40';
                gradeLabel = 'Absent';
                gradeIcon = XCircle;
                topAccent = 'bg-gradient-to-r from-rose-500 to-red-600';
              } else if (avgScore !== null) {
                if (avgScore >= 8) {
                  // Mastery Tier: Neon Emerald & Cyan (>= 8/10)
                  cardBg = 'from-emerald-50/95 via-teal-50/70 to-cyan-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/80 text-slate-900 dark:text-white';
                  cardBorder = 'border-emerald-200/90 dark:border-emerald-500/40 hover:border-emerald-400/80';
                  cardGlow = 'shadow-md dark:shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(16,185,129,0.3)]';
                  ambientOrb = 'bg-emerald-200/40 dark:bg-emerald-500/20';
                  iconBadgeBg = 'from-emerald-500 via-teal-500 to-cyan-500 border-emerald-300 dark:border-emerald-300/60 shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                  gradeBadge = 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-400/50 shadow-2xs dark:shadow-[0_0_10px_rgba(16,185,129,0.3)]';
                  gradeLabel = 'A+ (Mastery)';
                  gradeIcon = Trophy;
                  topAccent = 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400';
                } else if (avgScore >= 6) {
                  // Proficient Tier: Cyber Indigo & Purple (>= 6/10)
                  cardBg = 'from-indigo-50/95 via-purple-50/70 to-sky-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/80 text-slate-900 dark:text-white';
                  cardBorder = 'border-indigo-200/90 dark:border-indigo-500/40 hover:border-indigo-400/80';
                  cardGlow = 'shadow-md dark:shadow-[0_0_25px_rgba(99,102,241,0.15)] hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]';
                  ambientOrb = 'bg-indigo-200/40 dark:bg-indigo-500/20';
                  iconBadgeBg = 'from-indigo-500 via-violet-500 to-purple-600 border-indigo-300 dark:border-indigo-300/50 shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.5)]';
                  gradeBadge = 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-400/50 shadow-2xs dark:shadow-[0_0_10px_rgba(99,102,241,0.3)]';
                  gradeLabel = 'B (Proficient)';
                  gradeIcon = Award;
                  topAccent = 'bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400';
                } else if (avgScore >= 4) {
                  // Satisfactory Tier: Sunset Amber & Gold (>= 4/10)
                  cardBg = 'from-amber-50/95 via-orange-50/70 to-yellow-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/80 text-slate-900 dark:text-white';
                  cardBorder = 'border-amber-200/90 dark:border-amber-500/40 hover:border-amber-400/80';
                  cardGlow = 'shadow-md dark:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]';
                  ambientOrb = 'bg-amber-200/40 dark:bg-amber-500/20';
                  iconBadgeBg = 'from-amber-500 via-orange-500 to-yellow-500 border-amber-300 dark:border-amber-300/50 shadow-md dark:shadow-[0_0_15px_rgba(245,158,11,0.5)]';
                  gradeBadge = 'bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-400/50 shadow-2xs dark:shadow-[0_0_10px_rgba(245,158,11,0.3)]';
                  gradeLabel = 'C (Satisfactory)';
                  gradeIcon = Flame;
                  topAccent = 'bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400';
                } else {
                  // Low Tier: Crimson Rose (< 4/10)
                  cardBg = 'from-rose-50/95 via-red-50/70 to-pink-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/80 text-slate-900 dark:text-white';
                  cardBorder = 'border-rose-200/90 dark:border-rose-500/40 hover:border-rose-400/80';
                  cardGlow = 'shadow-md dark:shadow-[0_0_25px_rgba(244,63,94,0.15)] hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(244,63,94,0.3)]';
                  ambientOrb = 'bg-rose-200/40 dark:bg-rose-500/20';
                  iconBadgeBg = 'from-rose-600 to-red-600 border-rose-300 dark:border-rose-300/50 shadow-md dark:shadow-[0_0_15px_rgba(244,63,94,0.5)]';
                  gradeBadge = 'bg-rose-100 dark:bg-rose-500/20 text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-400/50 shadow-2xs dark:shadow-[0_0_10px_rgba(244,63,94,0.3)]';
                  gradeLabel = 'Needs Attention';
                  gradeIcon = ShieldAlert;
                  topAccent = 'bg-gradient-to-r from-rose-500 to-red-500';
                }
              } else {
                gradeLabel = 'Completed';
                gradeIcon = CheckCircle2;
              }

              const GradeIcon = gradeIcon;

              return (
                <div
                  key={act.aid ? `${act.aid}-${index}` : `lesson-card-${index}`}
                  className={`group relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-b ${cardBg} ${cardBorder} ${cardGlow} backdrop-blur-xl overflow-hidden`}
                >
                  {/* Ambient Glow Backlight in Card Corner */}
                  <div className={`absolute -top-12 -right-12 w-36 h-36 ${ambientOrb} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
                  
                  {/* Top Glowing Micro-Accent Bar */}
                  <div className={`absolute top-0 left-5 right-5 h-1 rounded-b-full ${topAccent}`} />

                  {/* Section 1: Header Chips (ID, Date, Status, Grade) */}
                  <div className="space-y-3 pt-1 relative z-10">
                    
                    {/* Top Chips Row */}
                    <div className="flex items-center justify-between gap-1.5">
                      {/* AID Badge */}
                      <span className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {formatAid(act.aid)}
                      </span>

                      {/* Date Badge */}
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 shrink-0 shadow-2xs">
                        <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        {formatDisplayDate(act.date)}
                      </span>
                    </div>

                    {/* Status & Grade Badges Row */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-2xs flex items-center gap-1.5 shrink-0 ${
                        isAbsent 
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-500/40' 
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAbsent ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                        {isAbsent ? 'Absent' : 'Attended'}
                      </span>

                      <span className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${gradeBadge}`}>
                        <GradeIcon className="w-3 h-3" />
                        <span>{gradeLabel}</span>
                      </span>
                    </div>

                    {/* Topic & Syllabus Assessed Banner */}
                    <div className="bg-white/90 dark:bg-slate-950/85 rounded-2xl p-3 border border-slate-200 dark:border-slate-800/90 flex items-start gap-3 shadow-2xs dark:shadow-inner group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
                      <div className={`p-2 bg-gradient-to-tr ${iconBadgeBg} text-white rounded-xl shrink-0 mt-0.5 border`}>
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono block">
                          Lesson Curriculum
                        </span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 mt-0.5">
                          {isAbsent ? (
                            <span className="text-slate-500 italic font-normal">Session conducted in student absence</span>
                          ) : (
                            act.subjectTuitioned || 'General Academic Session'
                          )}
                        </h3>
                      </div>
                    </div>

                    {/* Performance Score Meter Hub (Homework & Classwork) */}
                    {!isAbsent ? (
                      <div className="bg-slate-50/90 dark:bg-slate-950/90 text-slate-900 dark:text-white p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs dark:shadow-inner space-y-2.5 relative overflow-hidden">
                        
                        <div className="grid grid-cols-2 gap-2 relative z-10">
                          
                          {/* Homework Score Box */}
                          <div className="bg-amber-100/70 dark:bg-slate-900/90 p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                            <div className="flex items-center justify-between">
                              <span className="text-[8.5px] font-mono uppercase text-amber-900 dark:text-amber-400 font-bold tracking-wider flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" /> HW Marks
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400">/ 10</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-lg sm:text-xl font-black font-mono text-amber-950 dark:text-white leading-none">
                                {hasHw ? act.hwMarks!.toFixed(1) : '—'}
                              </span>
                            </div>
                            {/* Mini Fill Bar */}
                            {hasHw && (
                              <div className="w-full bg-amber-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1.5 p-px">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                  style={{ width: `${Math.min(100, Math.max(0, (act.hwMarks! / 10) * 100))}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Classwork Score Box */}
                          <div className="bg-indigo-100/70 dark:bg-slate-900/90 p-2.5 rounded-xl border border-indigo-300/80 dark:border-indigo-500/30 shadow-2xs dark:shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                            <div className="flex items-center justify-between">
                              <span className="text-[8.5px] font-mono uppercase text-indigo-900 dark:text-indigo-400 font-bold tracking-wider flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> CW Marks
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-500 dark:text-slate-400">/ 10</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-lg sm:text-xl font-black font-mono text-indigo-950 dark:text-white leading-none">
                                {hasCw ? act.cwMarks!.toFixed(1) : '—'}
                              </span>
                            </div>
                            {/* Mini Fill Bar */}
                            {hasCw && (
                              <div className="w-full bg-indigo-200/80 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1.5 p-px">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  style={{ width: `${Math.min(100, Math.max(0, (act.cwMarks! / 10) * 100))}%` }}
                                />
                              </div>
                            )}
                          </div>

                        </div>

                      </div>
                    ) : (
                      <div className="p-3.5 bg-rose-100/70 dark:bg-rose-950/60 border border-rose-300/80 dark:border-rose-500/30 rounded-2xl text-center space-y-1">
                        <span className="text-xs font-black text-rose-950 dark:text-rose-300 block">
                          No Marks (Absent)
                        </span>
                        <p className="text-[10px] text-rose-800 dark:text-rose-300/80 font-medium">
                          The student was recorded absent during this lesson session.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Section 2: Remarks & Teacher Feedback */}
                  {act.comment ? (
                    <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-slate-800/80 space-y-2 text-xs relative z-10">
                      <p className="text-[11px] text-amber-950 dark:text-amber-200/90 font-medium italic bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-500/30 p-2 rounded-xl flex items-start gap-1.5 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-3">"{act.comment}"</span>
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-500 font-mono text-right relative z-10">
                      Verified Curriculum Session
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* COMPACT LIST VIEW                                                         */
          /* ========================================================================= */
          <div className="space-y-2">
            {studentActivities.map((act, index) => {
              const isAbsent = act.status === 'Absent';
              const hasHw = act.hwMarks !== undefined && act.hwMarks !== null;
              const hasCw = act.cwMarks !== undefined && act.cwMarks !== null;

              return (
                <div 
                  key={act.aid ? `${act.aid}-${index}` : `lesson-list-${index}`}
                  className={`border-2 rounded-2xl p-2.5 sm:p-3 transition-all space-y-2 backdrop-blur-xl shadow-xs ${
                    isAbsent 
                      ? 'bg-rose-50/80 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/70 border-rose-200 dark:border-rose-500/30 text-slate-900 dark:text-white' 
                      : 'bg-white/95 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/70 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/40 text-slate-900 dark:text-white'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        {formatAid(act.aid)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        {formatDisplayDate(act.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border flex items-center gap-1 ${
                        isAbsent 
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-500/40' 
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                      }`}>
                        {isAbsent ? <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                        {act.status}
                      </span>
                    </div>
                  </div>

                  {/* Content row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950/90 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <div className="p-1 bg-emerald-600 text-white rounded-md shrink-0 shadow-xs">
                        <BookOpen className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono block">
                          Lesson Topic
                        </span>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {isAbsent ? <span className="text-slate-400 italic font-normal">Session conducted (Absent)</span> : act.subjectTuitioned}
                        </h4>
                      </div>
                    </div>

                    {!isAbsent ? (
                      <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                        <div className="bg-amber-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-300/80 dark:border-amber-500/30 text-amber-950 dark:text-white flex items-center gap-1.5 shadow-2xs">
                          <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">HW:</span>
                          <span className="text-xs font-black font-mono text-amber-950 dark:text-amber-300">{hasHw ? act.hwMarks!.toFixed(1) : '—'}</span>
                        </div>

                        <div className="bg-indigo-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-indigo-300/80 dark:border-indigo-500/30 text-indigo-950 dark:text-white flex items-center gap-1.5 shadow-2xs">
                          <GraduationCap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">CW:</span>
                          <span className="text-xs font-black font-mono text-indigo-950 dark:text-indigo-300">{hasCw ? act.cwMarks!.toFixed(1) : '—'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full md:w-auto px-2.5 py-1.5 bg-rose-100/70 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/30 rounded-xl text-[10px] text-rose-950 dark:text-rose-300 font-black italic shrink-0 text-center md:text-left">
                        Absent (No Marks)
                      </div>
                    )}
                  </div>

                  {/* Feedback row */}
                  {act.comment && (
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <p className="text-[11px] text-amber-950 dark:text-amber-200/90 font-medium italic bg-amber-100/70 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-500/30 inline-flex items-center gap-1.5 flex-1 min-w-[140px]">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate">"{act.comment}"</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/70 dark:bg-slate-950/70 p-6 space-y-2 backdrop-blur-xl">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-emerald-300 dark:border-emerald-500/40 shadow-xs dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 dark:text-white">No Lesson Logs Found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              No activity entries match your current search, status, or monthly filter criteria.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
