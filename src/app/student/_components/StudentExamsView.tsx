'use client';

import React, { useState, useMemo } from 'react';
import { Student, Exam } from '@/types';
import { 
  Trophy, Award, Calendar, CheckCircle2, XCircle, Search, 
  Sparkles, Filter, ShieldCheck, ArrowUpDown, ChevronDown, 
  Check, Clock, TrendingUp, HelpCircle, BarChart3, ClipboardList
} from 'lucide-react';
import { formatEid } from '@/utils/id';

interface StudentExamsViewProps {
  student?: Student;
  exams?: Exam[];
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

  // Filter exams for this specific student if prop is provided, otherwise assume already scoped
  const studentExams = useMemo(() => {
    return exams.filter((e) => {
      // Search term filter
      const matchesSearch =
        !searchTerm ||
        e.subjectAndTopic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.eid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      // Month filter
      const matchesMonth = !filterMonth || (e.date && e.date.startsWith(filterMonth));

      // Status filter
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

  // Global performance telemetry calculations
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
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto animate-fadeIn" id="student-exams-view-panel">
      {/* Top Identity & Telemetry Header Card */}
      <div className="bg-gradient-to-br from-indigo-100/95 via-sky-100/80 to-purple-100/90 rounded-2xl p-3.5 sm:p-5 border-2 border-indigo-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-200/40 via-indigo-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-200/40 via-teal-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200/80 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-600/20 shrink-0 border border-white/40">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-slate-900 text-base sm:text-lg tracking-tight">
                  Academic Examinations & Evaluation Scorecards
                </h1>
                <span className="text-[10px] bg-purple-200/90 text-purple-950 font-mono font-black px-2 py-0.5 rounded-md border border-purple-300 shadow-2xs shrink-0">
                  Official Record
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 font-medium">
                Comprehensive marks ledger, syllabus assessment topics, and historical performance tracking.
              </p>
            </div>
          </div>

          {/* Average Performance Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-purple-600/20 border border-purple-400/40 shrink-0">
            <div className="p-1 bg-white/20 rounded-md shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-purple-100 font-mono block leading-none">
                Exam Average
              </span>
              <span className="text-sm sm:text-base font-black font-mono leading-tight">
                {avgExamPct !== null ? `${avgExamPct}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Telemetry Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          {/* Total Evaluated */}
          <div className="bg-indigo-100/90 p-2.5 rounded-xl border border-indigo-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-indigo-900 uppercase tracking-wider block">
              Evaluated Exams
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-indigo-950 block mt-0.5">
              {presentCount} Completed
            </span>
          </div>

          {/* Average Score */}
          <div className="bg-purple-100/90 p-2.5 rounded-xl border border-purple-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-purple-900 uppercase tracking-wider block">
              Cumulative Average
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-purple-950 block mt-0.5">
              {avgExamPct !== null ? `${avgExamPct}%` : '—'}
            </span>
          </div>

          {/* Top Score */}
          <div className="bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-emerald-900 uppercase tracking-wider block">
              Highest Benchmark
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 block mt-0.5">
              {highestPct !== null ? `${highestPct}%` : '—'}
            </span>
          </div>

          {/* Missed / Absent */}
          <div className="bg-rose-100/90 p-2.5 rounded-xl border border-rose-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-rose-900 uppercase tracking-wider block">
              Missed / Absent
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-rose-950 block mt-0.5">
              {absentCount} Tests
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-gradient-to-r from-purple-100/90 via-indigo-100/90 to-teal-100/90 border border-purple-300/90 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Topic & Subject Search */}
          <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500 shadow-2xs transition-all">
            <div className="p-1 bg-purple-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Search className="w-2.5 h-2.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic or syllabus..."
              className="w-full bg-transparent text-xs font-semibold text-purple-950 placeholder:text-purple-700/60 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-purple-200 hover:bg-purple-300 text-purple-900 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border border-indigo-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 shadow-2xs transition-all min-w-0">
            <div className="p-1 bg-indigo-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Calendar className="w-2.5 h-2.5" />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-indigo-950 focus:outline-hidden cursor-pointer"
            />
            {filterMonth && (
              <button
                onClick={() => setFilterMonth('')}
                className="ml-1 text-[10px] font-black bg-indigo-200 hover:bg-indigo-300 text-indigo-900 px-1.5 py-0.5 rounded cursor-pointer shrink-0 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Attendance Status Filter Pills */}
          <div className="flex items-center bg-purple-100 p-0.5 rounded-lg border border-purple-300 shadow-2xs justify-between">
            <button
              onClick={() => setFilterStatus('All')}
              className={`flex-1 py-1 text-center text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'All'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-purple-950 hover:bg-purple-200/80'
              }`}
            >
              All ({totalLogs})
            </button>
            <button
              onClick={() => setFilterStatus('Present')}
              className={`flex-1 py-1 text-center text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'Present'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-950 hover:bg-emerald-200/80'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              onClick={() => setFilterStatus('Absent')}
              className={`flex-1 py-1 text-center text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'Absent'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-950 hover:bg-rose-200/80'
              }`}
            >
              Absent ({absentCount})
            </button>
          </div>
        </div>

        {/* Sort controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-purple-200/70 text-xs">
          <span className="text-[10px] font-bold text-purple-950 font-mono bg-purple-200/90 border border-purple-300 px-2 py-0.5 rounded-md shadow-2xs self-start sm:self-auto">
            Showing {sortedExams.length} of {totalLogs} exam records
          </span>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-0">
              <label className="text-[10px] font-bold text-purple-950 mr-0.5 font-mono shrink-0">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8 px-2 bg-purple-100 hover:bg-purple-200/90 border border-purple-400/90 rounded-lg text-xs font-bold text-purple-950 focus:outline-hidden cursor-pointer shadow-2xs transition-colors flex-1 sm:flex-initial"
              >
                <option value="date">Date</option>
                <option value="marks">Marks</option>
                <option value="pct">Percentage</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="h-8 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-500 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-98 shrink-0"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exam Scorecards List */}
      {sortedExams.length > 0 ? (
        <div className="space-y-2">
          {sortedExams.map((exam, index) => {
            const isAbsent = exam.status === 'Absent';
            const pct = !isAbsent && exam.totalMarks > 0 && exam.obtainedMarks !== undefined && exam.obtainedMarks !== null
              ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
              : null;

            let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';
            let barColor = 'from-slate-400 to-slate-500';
            let gradeLabel = 'Not Graded';

            if (pct !== null) {
              if (pct >= 80) {
                badgeColor = 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs';
                barColor = 'from-emerald-500 to-teal-400';
                gradeLabel = 'A+ (Excellent)';
              } else if (pct >= 60) {
                badgeColor = 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs';
                barColor = 'from-indigo-500 to-purple-400';
                gradeLabel = 'B (Good)';
              } else if (pct >= 40) {
                badgeColor = 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xs';
                barColor = 'from-amber-500 to-orange-400';
                gradeLabel = 'C (Average)';
              } else {
                badgeColor = 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-2xs';
                barColor = 'from-rose-500 to-red-400';
                gradeLabel = 'Needs Work';
              }
            }

            return (
              <div 
                key={exam.eid ? `${exam.eid}-${index}` : `exam-${index}`}
                className={`border rounded-xl p-2.5 sm:p-3 transition-all space-y-2 shadow-2xs hover:shadow-xs ${
                  isAbsent 
                    ? 'bg-gradient-to-r from-rose-100/70 via-orange-50/80 to-rose-50 border-rose-300' 
                    : 'bg-gradient-to-r from-purple-50 via-indigo-50/90 to-teal-50 border-purple-200 hover:border-purple-300'
                }`}
              >
                {/* Header bar: ID & Date on left, Grade & Attendance Status paired together on right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-purple-200/70 pb-1.5">
                  {/* Identifier & Date */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-purple-950 bg-purple-100/90 px-1.5 py-0.5 rounded-md border border-purple-300 shadow-2xs flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5 text-purple-700 shrink-0" />
                      {formatEid(exam.eid)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 font-mono flex items-center gap-1 bg-indigo-100/90 px-1.5 py-0.5 rounded-md border border-indigo-200 shadow-2xs shrink-0">
                      <Calendar className="w-2.5 h-2.5 text-indigo-700 shrink-0" />
                      {exam.date}
                    </span>
                  </div>

                  {/* Badges: Grade + Attendance Status paired neatly together */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                    {pct !== null && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs ${badgeColor}`}>
                        {gradeLabel}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border shadow-2xs flex items-center gap-1 ${
                      isAbsent 
                        ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400' 
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400'
                    }`}>
                      {isAbsent ? <XCircle className="w-3 h-3 text-rose-200" /> : <CheckCircle2 className="w-3 h-3 text-emerald-200" />}
                      {exam.status}
                    </span>
                  </div>
                </div>

                {/* Compact Details & Score Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
                  {/* Topic & Syllabus */}
                  <div className="flex-1 min-w-0 bg-gradient-to-r from-indigo-100/90 via-purple-100/60 to-teal-100/80 border border-indigo-200/90 px-2.5 py-1.5 rounded-lg shadow-2xs flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded shrink-0 shadow-2xs">
                      <ClipboardList className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-bold text-indigo-900 uppercase tracking-wider font-mono block">
                        Topic / Syllabus
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug truncate sm:whitespace-normal">
                        {isAbsent ? <span className="text-slate-500 italic font-normal">No Exam (Absent)</span> : exam.subjectAndTopic}
                      </h4>
                    </div>
                  </div>

                  {/* Score Box - Full width on mobile with balanced distribution, compact on desktop */}
                  {!isAbsent ? (
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-800 px-2.5 py-1.5 rounded-lg border border-purple-400/40 text-white shadow-xs">
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-bold text-purple-200 uppercase font-mono">Score:</span>
                        <span className="text-xs sm:text-sm font-black font-mono text-white">
                          {exam.obtainedMarks ?? 0}
                          <span className="text-[10px] text-purple-200 font-sans font-bold"> / {exam.totalMarks}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-1 md:flex-initial justify-end">
                        {pct !== null && (
                          <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-white text-purple-950 shadow-2xs shrink-0">
                            {pct}%
                          </span>
                        )}

                        {pct !== null && (
                          <div className="w-24 sm:w-20 bg-purple-950/70 rounded-full h-1.5 overflow-hidden p-px border border-purple-400/40 shrink-0">
                            <div 
                              className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`} 
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-auto px-2.5 py-1.5 bg-gradient-to-r from-rose-200/90 to-red-100 border border-rose-300 rounded-lg text-[10px] text-rose-950 font-black italic shadow-2xs shrink-0 text-center md:text-left">
                      Absent (No Marks)
                    </div>
                  )}
                </div>

                {/* Feedback & remarks - Compact inline flow */}
                {(exam.remarks || exam.comment) && (
                  <div className="pt-1 border-t border-purple-200/60 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {exam.remarks && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-950 rounded-md text-[10px] font-bold border border-purple-300 shadow-2xs font-mono shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-purple-700 mr-1 shrink-0" />
                        Tag: {exam.remarks}
                      </span>
                    )}
                    {exam.comment && (
                      <p className="text-[11px] text-amber-950 font-semibold italic bg-gradient-to-r from-amber-50 to-amber-100/60 px-2 py-0.5 rounded-md border border-amber-200/90 inline-flex items-center gap-1.5 shadow-2xs flex-1 min-w-[140px]">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span className="truncate">"{exam.comment}"</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-slate-500 border-2 border-dashed border-purple-300 rounded-2xl bg-gradient-to-br from-purple-100/60 via-indigo-50 to-teal-100/60 shadow-2xs space-y-2">
          <div className="p-2.5 bg-purple-200 text-purple-800 rounded-xl w-10 h-10 mx-auto flex items-center justify-center border border-purple-300 shadow-2xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">No Exam Logs Found</p>
            <p className="text-[11px] text-slate-600 font-medium">No evaluation entries match your filter or search query.</p>
          </div>
        </div>
      )}
    </div>
  );
}
