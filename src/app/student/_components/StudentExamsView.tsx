'use client';

import React, { useState, useMemo } from 'react';
import { Student, Exam } from '@/types';
import { 
  Trophy, Award, Calendar, CheckCircle2, XCircle, Search, 
  Sparkles, Filter, ShieldCheck, ArrowUpDown, ChevronDown, 
  BarChart3, LayoutGrid, List, BookOpen, Flame, FileText,
  Target, AlertOctagon, ShieldAlert, CheckCircle, Sparkle,
  Layers, CheckCheck, TrendingUp, HelpCircle
} from 'lucide-react';
import { formatEid } from '@/utils/id';
import ExamProgressChart from './ExamProgressChart';

interface StudentExamsViewProps {
  student?: Student;
  exams?: Exam[];
}

// Format date with day name (e.g. "Sun, 09 Aug 2026")
function formatExamDateWithDay(dateStr?: string): string {
  if (!dateStr) return 'Date N/A';
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
    if (!isNaN(d.getTime())) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {}
  return dateStr;
}

export default function StudentExamsView({
  student,
  exams = [],
}: StudentExamsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'marks' | 'pct'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showChart, setShowChart] = useState(false);

  // Filter exams
  const studentExams = useMemo(() => {
    return exams.filter((e) => {
      const matchesSearch =
        !searchTerm ||
        e.subjectAndTopic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.eid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth = !filterMonth || (e.date && e.date.startsWith(filterMonth));

      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Present' && e.status !== 'Absent') ||
        (filterStatus === 'Absent' && e.status === 'Absent');

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [exams, searchTerm, filterMonth, filterStatus]);

  // Sort exams
  const sortedExams = useMemo(() => {
    return [...studentExams].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'marks') {
        const marksA = a.obtainedMarks ?? -1;
        const marksB = b.obtainedMarks ?? -1;
        comparison = marksA - marksB;
      } else if (sortBy === 'pct') {
        const pctA = a.totalMarks > 0 && a.obtainedMarks !== undefined && a.obtainedMarks !== null
          ? (a.obtainedMarks / a.totalMarks) * 100
          : -1;
        const pctB = b.totalMarks > 0 && b.obtainedMarks !== undefined && b.obtainedMarks !== null
          ? (b.obtainedMarks / b.totalMarks) * 100
          : -1;
        comparison = pctA - pctB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [studentExams, sortBy, sortOrder]);

  // Telemetry statistics
  const totalLogs = exams.length;
  const evaluatedExams = exams.filter((e) => e.status !== 'Absent' && e.totalMarks > 0);
  const presentCount = evaluatedExams.length;
  const absentCount = exams.filter((e) => e.status === 'Absent').length;

  const totalObtained = evaluatedExams.reduce((acc, curr) => acc + (curr.obtainedMarks ?? 0), 0);
  const totalPossible = evaluatedExams.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const avgExamPct = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : null;

  const highestPct = useMemo(() => {
    if (evaluatedExams.length === 0) return null;
    const pcts = evaluatedExams.map((e) => Math.round(((e.obtainedMarks ?? 0) / e.totalMarks) * 100));
    return Math.max(...pcts);
  }, [evaluatedExams]);

  return (
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto w-full min-w-0 animate-fadeIn pb-8" id="student-exams-view-panel">
      
      {/* 1. TOP COMMAND BANNER WITH COLORFUL ACCENTS */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-50/95 via-purple-50/85 to-pink-50/90 dark:from-slate-950 dark:via-indigo-950/70 dark:to-purple-950/80 border-2 border-indigo-200/90 dark:border-indigo-500/40 text-slate-900 dark:text-white p-4 sm:p-5 shadow-lg dark:shadow-[0_0_35px_rgba(99,102,241,0.2)] transition-all duration-200">
        
        {/* Ambient Backlight Orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-300/30 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300/30 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-200/80 dark:border-indigo-500/30 pb-3.5 sm:pb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 sm:p-3 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl shadow-md dark:shadow-[0_0_20px_rgba(99,102,241,0.5)] shrink-0 border border-indigo-300/40">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight">
                  Academic Exams &amp; Scorecards
                </h1>
                <span className="text-[9.5px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs shrink-0">
                  Verified Records
                </span>
              </div>
              <p className="text-xs text-indigo-950/80 dark:text-indigo-200/80 font-medium truncate sm:whitespace-normal">
                Curriculum evaluation scorecards, assessment achievements, and overall performance trajectory.
              </p>
            </div>
          </div>

          {/* Action & Toggle Controls */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 border ${
                showChart
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-white/90 dark:bg-slate-900/90 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-950 dark:text-indigo-200 border-indigo-200 dark:border-indigo-700/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
              <span>{showChart ? 'Hide Analytics' : 'View Performance Trend'}</span>
            </button>
          </div>
        </div>

        {/* 5 Summary Telemetry Badges with Vivid Elementwise Coloring */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3">
          
          {/* Total Tests */}
          <div className="bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-indigo-500/20 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-indigo-300/80 dark:border-indigo-500/40 shadow-xs">
            <span className="text-[9px] font-mono font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider block">
              Total Tests
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-indigo-950 dark:text-white block mt-0.5">
              {totalLogs} Records
            </span>
          </div>

          {/* Attended Tests */}
          <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/20 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-emerald-300/80 dark:border-emerald-500/40 shadow-xs">
            <span className="text-[9px] font-mono font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
              Attended Tests
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 dark:text-emerald-300 block mt-0.5">
              {presentCount} Completed
            </span>
          </div>

          {/* Absences */}
          <div className="bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-rose-500/20 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-rose-300/80 dark:border-rose-500/40 shadow-xs">
            <span className="text-[9px] font-mono font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider block">
              Absences
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-rose-950 dark:text-rose-300 block mt-0.5">
              {absentCount} Missed
            </span>
          </div>

          {/* Avg Accuracy */}
          <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/20 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-amber-300/80 dark:border-amber-500/40 shadow-xs">
            <span className="text-[9px] font-mono font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
              Avg Accuracy
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-amber-950 dark:text-amber-300 block mt-0.5">
              {avgExamPct !== null ? `${avgExamPct}%` : 'N/A'}
            </span>
          </div>

          {/* Best Score */}
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-500/15 via-fuchsia-500/10 to-purple-500/20 dark:bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-purple-300/80 dark:border-purple-500/40 shadow-xs">
            <span className="text-[9px] font-mono font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block">
              Best Score
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-purple-950 dark:text-purple-300 block mt-0.5">
              {highestPct !== null ? `${highestPct}%` : 'N/A'}
            </span>
          </div>

        </div>

      </div>

      {/* Progress Chart Modal/Panel */}
      {showChart && (
        <div className="animate-fadeIn">
          <ExamProgressChart exams={exams} />
        </div>
      )}

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-2 border-indigo-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md backdrop-blur-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative flex items-center bg-indigo-50/50 dark:bg-slate-950 border border-indigo-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-400 shadow-2xs transition-all">
            <div className="p-1 bg-indigo-600 text-white rounded-md shrink-0 mr-2 shadow-xs">
              <Search className="w-3 h-3" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exam EID, topic, subject or remark..."
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
          <div className="sm:col-span-3 flex items-center gap-1.5 bg-purple-50/50 dark:bg-slate-950 border border-purple-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9">
            <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5 bg-emerald-50/50 dark:bg-slate-950 border border-emerald-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'All' | 'Present' | 'Absent')}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Attendance</option>
              <option value="Present" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Present (Evaluated)</option>
              <option value="Absent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Absent (Missed)</option>
            </select>
          </div>

        </div>

        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-indigo-950 dark:text-indigo-200 font-mono bg-indigo-100/80 dark:bg-slate-950 border border-indigo-200 dark:border-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
              Showing {sortedExams.length} of {totalLogs} exam scorecards
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'marks' | 'pct')}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="date" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Exam Date</option>
                <option value="marks" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Obtained Marks</option>
                <option value="pct" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Accuracy (%)</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <ArrowUpDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[10px] uppercase font-black">{sortOrder}</span>
              </button>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline text-[10px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline text-[10px]">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ULTRA-COLORFUL ELEMENTWISE BACKGROUND COLORED EXAM CARDS */}
      {sortedExams.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sortedExams.map((exam, index) => {
              const isAbsent = exam.status === 'Absent';
              const pct = exam.totalMarks > 0 && exam.obtainedMarks !== undefined && exam.obtainedMarks !== null
                ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
                : null;

              // Rich, Vibrant Theme Configuration per Tier
              let cardBg = 'from-emerald-500/15 via-teal-400/10 to-cyan-500/15 dark:from-slate-950 dark:via-emerald-950/80 dark:to-cyan-950/80 border-emerald-400 dark:border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.3)]';
              let topNeonBar = 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400';
              let tierIcon = Trophy;
              let tierName = 'Mastery (A+)';
              let tierBadge = 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
              let topicBg = 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-cyan-950/90 border-emerald-300/90 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-100';
              let topicIconBg = 'from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]';
              let statMarksBg = 'bg-emerald-500/15 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-100';
              let statTotalBg = 'bg-cyan-500/15 dark:bg-cyan-950/90 border-cyan-300 dark:border-cyan-500/40 text-cyan-950 dark:text-cyan-100';
              let statAccuracyBg = 'bg-gradient-to-br from-teal-500/20 to-emerald-500/20 dark:from-teal-950/90 dark:to-emerald-950/90 border-teal-300 dark:border-teal-500/50 text-teal-950 dark:text-teal-100';
              let barGradient = 'from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';

              if (isAbsent) {
                cardBg = 'from-rose-500/15 via-pink-400/10 to-red-500/15 dark:from-slate-950 dark:via-rose-950/80 dark:to-red-950/80 border-rose-400 dark:border-rose-500/50 shadow-[0_10px_30px_rgba(244,63,94,0.15)] hover:shadow-[0_15px_40px_rgba(244,63,94,0.3)]';
                topNeonBar = 'bg-gradient-to-r from-rose-500 via-pink-400 to-red-500';
                tierIcon = XCircle;
                tierName = 'Absent (Missed)';
                tierBadge = 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
                topicBg = 'bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-red-500/20 dark:from-rose-950/90 dark:via-pink-950/70 dark:to-red-950/90 border-rose-300/90 dark:border-rose-500/40 text-rose-950 dark:text-rose-100';
                topicIconBg = 'from-rose-600 via-pink-600 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]';
                statMarksBg = 'bg-rose-500/15 dark:bg-rose-950/90 border-rose-300 dark:border-rose-500/40 text-rose-950 dark:text-rose-100';
                statTotalBg = 'bg-pink-500/15 dark:bg-pink-950/90 border-pink-300 dark:border-pink-500/40 text-pink-950 dark:text-pink-100';
                statAccuracyBg = 'bg-gradient-to-br from-rose-500/20 to-red-500/20 dark:from-rose-950/90 dark:to-red-950/90 border-rose-300 dark:border-rose-500/50 text-rose-950 dark:text-rose-100';
                barGradient = 'from-rose-500 to-red-600';
              } else if (pct !== null) {
                if (pct >= 80) {
                  // A+ Mastery Tier
                  cardBg = 'from-emerald-500/20 via-teal-400/15 to-cyan-500/20 dark:from-slate-950 dark:via-emerald-950/90 dark:to-cyan-950/90 border-emerald-400 dark:border-emerald-400/60 shadow-[0_10px_35px_rgba(16,185,129,0.2)] hover:shadow-[0_15px_45px_rgba(16,185,129,0.35)]';
                  topNeonBar = 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400';
                  tierIcon = Trophy;
                  tierName = 'Mastery (A+)';
                  tierBadge = 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                  topicBg = 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-cyan-950/90 border-emerald-300/90 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-100';
                  topicIconBg = 'from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]';
                  statMarksBg = 'bg-emerald-500/20 dark:bg-emerald-950/90 border-emerald-400 dark:border-emerald-500/50 text-emerald-950 dark:text-emerald-100';
                  statTotalBg = 'bg-cyan-500/20 dark:bg-cyan-950/90 border-cyan-400 dark:border-cyan-500/50 text-cyan-950 dark:text-cyan-100';
                  statAccuracyBg = 'bg-gradient-to-br from-teal-500/25 to-emerald-500/25 dark:from-teal-950/90 dark:to-emerald-950/90 border-teal-400 dark:border-teal-500/60 text-teal-950 dark:text-teal-100';
                  barGradient = 'from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]';
                } else if (pct >= 60) {
                  // B Proficient Tier
                  cardBg = 'from-indigo-500/20 via-violet-400/15 to-purple-500/20 dark:from-slate-950 dark:via-indigo-950/90 dark:to-purple-950/90 border-indigo-400 dark:border-indigo-400/60 shadow-[0_10px_35px_rgba(99,102,241,0.2)] hover:shadow-[0_15px_45px_rgba(99,102,241,0.35)]';
                  topNeonBar = 'bg-gradient-to-r from-indigo-400 via-violet-300 to-purple-400';
                  tierIcon = Award;
                  tierName = 'Proficient (B)';
                  tierBadge = 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]';
                  topicBg = 'bg-gradient-to-r from-indigo-500/20 via-violet-500/15 to-purple-500/20 dark:from-indigo-950/90 dark:via-violet-950/70 dark:to-purple-950/90 border-indigo-300/90 dark:border-indigo-500/40 text-indigo-950 dark:text-indigo-100';
                  topicIconBg = 'from-indigo-600 via-violet-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]';
                  statMarksBg = 'bg-indigo-500/20 dark:bg-indigo-950/90 border-indigo-400 dark:border-indigo-500/50 text-indigo-950 dark:text-indigo-100';
                  statTotalBg = 'bg-violet-500/20 dark:bg-violet-950/90 border-violet-400 dark:border-violet-500/50 text-violet-950 dark:text-violet-100';
                  statAccuracyBg = 'bg-gradient-to-br from-purple-500/25 to-indigo-500/25 dark:from-purple-950/90 dark:to-indigo-950/90 border-purple-400 dark:border-purple-500/60 text-purple-950 dark:text-purple-100';
                  barGradient = 'from-indigo-400 via-violet-300 to-purple-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]';
                } else if (pct >= 40) {
                  // C Satisfactory Tier
                  cardBg = 'from-amber-500/20 via-orange-400/15 to-yellow-500/20 dark:from-slate-950 dark:via-amber-950/90 dark:to-orange-950/90 border-amber-400 dark:border-amber-400/60 shadow-[0_10px_35px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_45px_rgba(245,158,11,0.35)]';
                  topNeonBar = 'bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400';
                  tierIcon = Flame;
                  tierName = 'Satisfactory (C)';
                  tierBadge = 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
                  topicBg = 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 dark:from-amber-950/90 dark:via-orange-950/70 dark:to-yellow-950/90 border-amber-300/90 dark:border-amber-500/40 text-amber-950 dark:text-amber-100';
                  topicIconBg = 'from-amber-600 via-orange-600 to-yellow-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]';
                  statMarksBg = 'bg-amber-500/20 dark:bg-amber-950/90 border-amber-400 dark:border-amber-500/50 text-amber-950 dark:text-amber-100';
                  statTotalBg = 'bg-orange-500/20 dark:bg-orange-950/90 border-orange-400 dark:border-orange-500/50 text-orange-950 dark:text-orange-100';
                  statAccuracyBg = 'bg-gradient-to-br from-amber-500/25 to-yellow-500/25 dark:from-amber-950/90 dark:to-yellow-950/90 border-amber-400 dark:border-amber-500/60 text-amber-950 dark:text-amber-100';
                  barGradient = 'from-amber-400 via-orange-300 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
                } else {
                  // Needs Work
                  cardBg = 'from-rose-500/20 via-pink-400/15 to-red-500/20 dark:from-slate-950 dark:via-rose-950/90 dark:to-red-950/90 border-rose-400 dark:border-rose-400/60 shadow-[0_10px_35px_rgba(244,63,94,0.2)] hover:shadow-[0_15px_45px_rgba(244,63,94,0.35)]';
                  topNeonBar = 'bg-gradient-to-r from-rose-400 via-pink-400 to-red-500';
                  tierIcon = ShieldAlert;
                  tierName = 'Needs Attention';
                  tierBadge = 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]';
                  topicBg = 'bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-red-500/20 dark:from-rose-950/90 dark:via-pink-950/70 dark:to-red-950/90 border-rose-300/90 dark:border-rose-500/40 text-rose-950 dark:text-rose-100';
                  topicIconBg = 'from-rose-600 via-pink-600 to-red-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]';
                  statMarksBg = 'bg-rose-500/20 dark:bg-rose-950/90 border-rose-400 dark:border-rose-500/50 text-rose-950 dark:text-rose-100';
                  statTotalBg = 'bg-red-500/20 dark:bg-red-950/90 border-red-400 dark:border-red-500/50 text-red-950 dark:text-red-100';
                  statAccuracyBg = 'bg-gradient-to-br from-rose-500/25 to-pink-500/25 dark:from-rose-950/90 dark:to-pink-950/90 border-rose-400 dark:border-rose-500/60 text-rose-950 dark:text-rose-100';
                  barGradient = 'from-rose-400 via-pink-400 to-red-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
                }
              }

              const TierIcon = tierIcon;
              const displayTopic = exam.topic || exam.subjectAndTopic || exam.subject || 'Curriculum Assessment';
              const formattedDate = formatExamDateWithDay(exam.date);

              return (
                <div
                  key={exam.eid ? `${exam.eid}-${index}` : `exam-card-${index}`}
                  className={`group relative rounded-3xl p-4 sm:p-5 border-2 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-br ${cardBg} backdrop-blur-xl overflow-hidden`}
                >
                  {/* Top Glowing Micro-Accent Bar */}
                  <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full ${topNeonBar}`} />

                  {/* Top Ambient Glow Orb */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/20 dark:bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />

                  {/* Main Card Content */}
                  <div className="space-y-3.5 relative z-10">
                    
                    {/* ELEMENT 1: TOP CHIPS ROW (EID + DATE + STATUS TIER) */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      
                      {/* EID Pill with rich gradient box */}
                      <span className="text-[10px] font-mono font-black text-white bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-indigo-900 dark:to-purple-900 px-2.5 py-1 rounded-xl border border-indigo-400/40 shadow-xs flex items-center gap-1.5 shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        {formatEid(exam.eid)}
                      </span>

                      {/* Tier Performance Badge */}
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${tierBadge}`}>
                        <TierIcon className="w-3.5 h-3.5" />
                        <span>{tierName}</span>
                      </span>
                    </div>

                    {/* ELEMENT 2: DATE CONTAINER WITH DAY NAME */}
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 text-xs font-mono shadow-2xs">
                      <div className="p-1 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-md shrink-0">
                        <Calendar className="w-3 h-3 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] uppercase font-bold text-slate-500 dark:text-slate-400 block leading-tight">
                          Evaluation Date
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs block leading-tight truncate">
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* ELEMENT 3: TOPIC / CURRICULUM HIGHLIGHT CONTAINER */}
                    <div className={`p-3 rounded-2xl border ${topicBg} space-y-1.5 shadow-2xs`}>
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 bg-gradient-to-tr ${topicIconBg} rounded-xl shrink-0 border border-white/30`}>
                          <BookOpen className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-wider opacity-85">
                          Syllabus &amp; Exam Topic
                        </span>
                      </div>
                      <h3 className="font-display font-black text-sm sm:text-base leading-snug line-clamp-2 mt-0.5">
                        {isAbsent ? (
                          <span className="opacity-75 italic font-medium">Missed Examination (Absent)</span>
                        ) : (
                          displayTopic
                        )}
                      </h3>
                    </div>

                    {/* ELEMENT 4: MULTI-COLORED SCOREBOARD (ELEMENTWISE STAT BOXES) */}
                    {!isAbsent ? (
                      <div className="space-y-2 pt-0.5">
                        
                        {/* 3 Distinct Element-Wise Stat Boxes */}
                        <div className="grid grid-cols-3 gap-2">
                          
                          {/* Box 1: Obtained Marks */}
                          <div className={`p-2 sm:p-2.5 rounded-xl border ${statMarksBg} text-center shadow-xs flex flex-col justify-between`}>
                            <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider block opacity-85">
                              Obtained
                            </span>
                            <div className="text-base sm:text-xl font-black font-mono leading-tight mt-1">
                              {exam.obtainedMarks ?? 0}
                            </div>
                            <span className="text-[8px] font-mono opacity-70 block">Marks</span>
                          </div>

                          {/* Box 2: Total Marks */}
                          <div className={`p-2 sm:p-2.5 rounded-xl border ${statTotalBg} text-center shadow-xs flex flex-col justify-between`}>
                            <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider block opacity-85">
                              Full Marks
                            </span>
                            <div className="text-base sm:text-xl font-black font-mono leading-tight mt-1">
                              {exam.totalMarks}
                            </div>
                            <span className="text-[8px] font-mono opacity-70 block">Max</span>
                          </div>

                          {/* Box 3: Accuracy (%) */}
                          <div className={`p-2 sm:p-2.5 rounded-xl border ${statAccuracyBg} text-center shadow-xs flex flex-col justify-between`}>
                            <span className="text-[8px] sm:text-[9px] font-mono font-black uppercase tracking-wider block opacity-85">
                              Accuracy
                            </span>
                            <div className="text-base sm:text-xl font-black font-mono leading-tight mt-1">
                              {pct !== null ? `${pct}%` : '—'}
                            </div>
                            <span className="text-[8px] font-mono opacity-70 block">Score</span>
                          </div>

                        </div>

                        {/* Glowing Progress Accuracy Bar */}
                        {pct !== null && (
                          <div className="space-y-1 bg-white/70 dark:bg-slate-950/80 p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                              <span className="text-slate-600 dark:text-slate-400">Mastery Gauge</span>
                              <span className="text-slate-900 dark:text-white">{pct}% Benchmark</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-300/80 dark:border-slate-800">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      /* Absent Alert Container */
                      <div className="p-3 bg-gradient-to-r from-rose-500/20 to-red-500/20 dark:from-rose-950/80 dark:to-red-950/80 border-2 border-rose-300 dark:border-rose-500/40 rounded-2xl text-center space-y-1 shadow-xs">
                        <span className="text-xs font-black text-rose-950 dark:text-rose-200 block">
                          No Score Recorded (Absent)
                        </span>
                        <p className="text-[10px] text-rose-800 dark:text-rose-300 font-medium">
                          Student was absent during this academic evaluation session.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* ELEMENT 5: TEACHER REMARK & AUTHENTICATED CALLOUT */}
                  {(exam.remarks || exam.comment) ? (
                    <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-slate-800/90 relative z-10">
                      <div className="p-2.5 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-yellow-500/20 dark:from-amber-950/80 dark:via-orange-950/60 dark:to-yellow-950/70 border border-amber-300 dark:border-amber-500/50 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="font-medium italic line-clamp-2">
                          "{exam.remarks || exam.comment}"
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2.5 mt-2.5 border-t border-slate-200/80 dark:border-slate-800/90 text-[10px] font-mono text-slate-500 dark:text-slate-400 text-right relative z-10 flex items-center justify-end gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      <span>Verified Academic Evaluation</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          /* List View with rich elementwise styles */
          <div className="space-y-2.5">
            {sortedExams.map((exam, index) => {
              const isAbsent = exam.status === 'Absent';
              const pct = exam.totalMarks > 0 && exam.obtainedMarks !== undefined && exam.obtainedMarks !== null
                ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
                : null;
              const formattedDate = formatExamDateWithDay(exam.date);

              return (
                <div
                  key={exam.eid ? `${exam.eid}-${index}` : `exam-list-${index}`}
                  className={`border-2 rounded-2xl p-3 sm:p-3.5 transition-all space-y-2 backdrop-blur-xl shadow-xs ${
                    isAbsent 
                      ? 'bg-rose-50/80 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-rose-950/70 border-rose-200 dark:border-rose-500/30 text-slate-900 dark:text-white' 
                      : 'bg-white/95 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/70 border-indigo-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-white shrink-0" />
                        {formatEid(exam.eid)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        {formattedDate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border flex items-center gap-1 ${
                        isAbsent 
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-500/40' 
                          : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                      }`}>
                        {isAbsent ? <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                        {isAbsent ? 'Absent' : 'Evaluated'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                        {exam.topic || exam.subject || 'Examination Assessment'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      {!isAbsent ? (
                        <div className="bg-indigo-50 dark:bg-slate-950 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-500/30 text-indigo-950 dark:text-white flex items-center gap-2 shadow-2xs font-mono">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {exam.obtainedMarks ?? 0} / {exam.totalMarks}
                          </span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            ({pct !== null ? `${pct}%` : ''})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                          Absent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-indigo-200 dark:border-slate-800 rounded-3xl bg-white/80 dark:bg-slate-900/80 p-6 space-y-3">
          <div className="p-3.5 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-2xl w-14 h-14 mx-auto flex items-center justify-center shadow-md">
            <Trophy className="w-7 h-7" />
          </div>
          <p className="text-base font-black text-slate-900 dark:text-white">No Examination Scorecards Found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
            No scorecards matched your search or monthly filter criteria.
          </p>
        </div>
      )}

    </div>
  );
}
