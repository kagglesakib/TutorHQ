'use client';

import React, { useState, useMemo } from 'react';
import { Student, Exam } from '@/types';
import {
  ClipboardList,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  Award,
  Trophy,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { generateExamId, formatEid } from '@/utils/id';
import { formatDateWithDay } from '@/utils/dateFormat';

interface ExamsLedgerProps {
  student: Student;
  exams: Exam[];
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (eid: string) => void;
  onUpdateExam: (exam: Exam) => void;
}

export default function ExamsLedger({
  student,
  exams,
  onAddExam,
  onDeleteExam,
  onUpdateExam,
}: ExamsLedgerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEid, setEditingEid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'marks' | 'pct'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [newExam, setNewExam] = useState<Partial<Exam>>({
    date: new Date().toISOString().slice(0, 10),
    subjectAndTopic: student.subject ? `${student.subject} - Chapter Test` : '',
    status: 'Present',
    totalMarks: 50,
    obtainedMarks: 40,
    remarks: 'Good',
    comment: '',
  });

  const [editFormData, setEditFormData] = useState<Exam | null>(null);

  // Student specific telemetry
  const totalLogs = exams.length;
  const evaluatedExams = useMemo(
    () => exams.filter((e) => e.status !== 'Absent' && e.totalMarks > 0),
    [exams]
  );
  const presentCount = evaluatedExams.length;
  const absentCount = useMemo(() => exams.filter((e) => e.status === 'Absent').length, [exams]);

  const totalObtained = useMemo(
    () => evaluatedExams.reduce((acc, curr) => acc + (curr.obtainedMarks ?? 0), 0),
    [evaluatedExams]
  );
  const totalPossible = useMemo(
    () => evaluatedExams.reduce((acc, curr) => acc + curr.totalMarks, 0),
    [evaluatedExams]
  );
  const avgExamPct = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : null;

  const highestPct = useMemo(() => {
    if (evaluatedExams.length === 0) return null;
    const pcts = evaluatedExams.map((e) =>
      Math.round(((e.obtainedMarks ?? 0) / e.totalMarks) * 100)
    );
    return Math.max(...pcts);
  }, [evaluatedExams]);

  // Filter & sort
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        e.subjectAndTopic?.toLowerCase().includes(term) ||
        e.eid?.toLowerCase().includes(term) ||
        e.remarks?.toLowerCase().includes(term) ||
        e.comment?.toLowerCase().includes(term);

      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Present' && e.status !== 'Absent') ||
        (filterStatus === 'Absent' && e.status === 'Absent');

      return matchesSearch && matchesStatus;
    });
  }, [exams, searchTerm, filterStatus]);

  const sortedExams = useMemo(() => {
    return [...filteredExams].sort((a, b) => {
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
        const pctA =
          a.totalMarks > 0 && a.obtainedMarks !== undefined && a.obtainedMarks !== null
            ? (a.obtainedMarks / a.totalMarks) * 100
            : -1;
        const pctB =
          b.totalMarks > 0 && b.obtainedMarks !== undefined && b.obtainedMarks !== null
            ? (b.obtainedMarks / b.totalMarks) * 100
            : -1;
        comparison = pctA - pctB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredExams, sortBy, sortOrder]);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const exam: Exam = {
      eid: generateExamId(),
      studentSid: student.sid,
      date: newExam.date || new Date().toISOString().slice(0, 10),
      subjectAndTopic: newExam.subjectAndTopic?.trim() || 'General Assessment',
      status: newExam.status || 'Present',
      totalMarks: Number(newExam.totalMarks) || 50,
      obtainedMarks:
        newExam.status === 'Present' && newExam.obtainedMarks !== undefined && !isNaN(Number(newExam.obtainedMarks))
          ? Number(newExam.obtainedMarks)
          : undefined,
      remarks: newExam.remarks?.trim() || '',
      comment: newExam.comment?.trim() || '',
    };
    onAddExam(exam);
    setIsAdding(false);
    setNewExam({
      date: new Date().toISOString().slice(0, 10),
      subjectAndTopic: student.subject ? `${student.subject} - Chapter Test` : '',
      status: 'Present',
      totalMarks: 50,
      obtainedMarks: 40,
      remarks: 'Good',
      comment: '',
    });
  };

  const handleStartEdit = (exam: Exam) => {
    setEditingEid(exam.eid);
    setEditFormData({ ...exam });
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdateExam(editFormData);
      setEditingEid(null);
      setEditFormData(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn" id="student-detail-exams-ledger">
      {/* 1. Header Card (Exact Student Portal Match) */}
      <div className="bg-gradient-to-br from-indigo-100/95 via-sky-100/80 to-purple-100/90 dark:from-slate-900 dark:via-purple-950/60 dark:to-slate-950 rounded-2xl p-3.5 sm:p-4 border-2 border-indigo-200/90 dark:border-purple-800/80 shadow-md dark:shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-purple-200/40 via-indigo-200/30 to-transparent dark:from-purple-500/10 dark:via-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200/80 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 shrink-0 border border-white/40">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                  Examinations & Evaluation Scorecards
                </h3>
                <span className="text-[10px] bg-purple-200/90 dark:bg-purple-950/80 text-purple-950 dark:text-purple-200 font-mono font-black px-2 py-0.5 rounded-md border border-purple-300 dark:border-purple-800/80 shadow-2xs shrink-0">
                  {student.name}
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 dark:text-purple-300/80 font-medium">
                Chapter assessments, syllabus tests, and historical score evaluations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Average Performance Pill */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white px-3 py-1.5 rounded-xl shadow-md shadow-purple-600/20 border border-purple-400/40 shrink-0">
              <Award className="w-3.5 h-3.5 text-purple-200" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-purple-200 font-mono block leading-none">
                  Avg
                </span>
                <span className="text-xs sm:text-sm font-black font-mono leading-tight">
                  {avgExamPct !== null ? `${avgExamPct}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Log Exam button */}
            <button
              type="button"
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 hover:from-purple-800 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer border border-white/40 shrink-0"
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Cancel' : 'Log Exam'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
          <div className="bg-indigo-100/90 dark:bg-slate-950/80 p-2 rounded-xl border border-indigo-300/90 dark:border-indigo-800/80 shadow-2xs dark:shadow-[0_0_12px_rgba(99,102,241,0.15)]">
            <span className="text-[8.5px] font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
              Evaluated Tests
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-indigo-950 dark:text-white block mt-0.5">
              {presentCount} Completed
            </span>
          </div>

          <div className="bg-purple-100/90 dark:bg-slate-950/80 p-2 rounded-xl border border-purple-300/90 dark:border-purple-800/80 shadow-2xs dark:shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="text-[8.5px] font-mono font-bold text-purple-900 dark:text-purple-400 uppercase tracking-wider block">
              Student Average
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-purple-950 dark:text-purple-100 block mt-0.5">
              {avgExamPct !== null ? `${avgExamPct}%` : '—'}
            </span>
          </div>

          <div className="bg-emerald-100/90 dark:bg-slate-950/80 p-2 rounded-xl border border-emerald-300/90 dark:border-emerald-800/80 shadow-2xs dark:shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="text-[8.5px] font-mono font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider block">
              Highest Benchmark
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-950 dark:text-emerald-100 block mt-0.5">
              {highestPct !== null ? `${highestPct}%` : '—'}
            </span>
          </div>

          <div className="bg-rose-100/90 dark:bg-slate-950/80 p-2 rounded-xl border border-rose-300/90 dark:border-rose-800/80 shadow-2xs dark:shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <span className="text-[8.5px] font-mono font-bold text-rose-900 dark:text-rose-400 uppercase tracking-wider block">
              Missed / Absent
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-rose-950 dark:text-rose-100 block mt-0.5">
              {absentCount} Tests
            </span>
          </div>
        </div>
      </div>

      {/* Add Exam Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateExam}
          className="p-3.5 bg-gradient-to-r from-purple-100/90 via-indigo-100/90 to-teal-100/90 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border border-purple-300/90 dark:border-slate-800 rounded-xl space-y-3 shadow-2xs dark:shadow-[0_0_25px_rgba(168,85,247,0.2)] animate-fadeIn"
        >
          <div className="flex items-center gap-2 border-b border-purple-200/80 dark:border-slate-800 pb-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <h4 className="text-xs font-black text-purple-950 dark:text-purple-200">Record New Exam Result</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Exam Date *</label>
              <input
                type="date"
                required
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Subject & Topic *</label>
              <input
                type="text"
                required
                value={newExam.subjectAndTopic}
                onChange={(e) => setNewExam({ ...newExam, subjectAndTopic: e.target.value })}
                placeholder="e.g. Physics - Dynamics Model Test"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Attendance Status</label>
              <select
                value={newExam.status}
                onChange={(e) =>
                  setNewExam({
                    ...newExam,
                    status: e.target.value as 'Present' | 'Absent',
                  })
                }
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100"
              >
                <option value="Present" className="dark:bg-slate-900">Present</option>
                <option value="Absent" className="dark:bg-slate-900">Absent</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Total Marks *</label>
              <input
                type="number"
                required
                min={1}
                value={newExam.totalMarks ?? 50}
                onChange={(e) => setNewExam({ ...newExam, totalMarks: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Obtained Marks</label>
              <input
                type="number"
                min={0}
                value={newExam.obtainedMarks ?? ''}
                onChange={(e) =>
                  setNewExam({
                    ...newExam,
                    obtainedMarks: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                disabled={newExam.status === 'Absent'}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Remarks Tag</label>
              <input
                type="text"
                value={newExam.remarks || ''}
                onChange={(e) => setNewExam({ ...newExam, remarks: e.target.value })}
                placeholder="e.g. Excellent / Good / Needs Focus"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Feedback Comment</label>
              <input
                type="text"
                value={newExam.comment || ''}
                onChange={(e) => setNewExam({ ...newExam, comment: e.target.value })}
                placeholder="e.g. Needs revision on Chapter 4"
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 hover:from-purple-800 text-white rounded-lg text-xs font-black shadow-md dark:shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer active:scale-95 transition-all"
            >
              Save Exam Result
            </button>
          </div>
        </form>
      )}

      {/* 2. Filter & Search Toolbar (Exact Student Portal Match) */}
      <div className="bg-gradient-to-r from-purple-100/90 via-indigo-100/90 to-teal-100/90 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 border-2 border-purple-300/90 dark:border-purple-900/60 rounded-xl p-2.5 sm:p-3 shadow-2xs dark:shadow-[0_0_25px_-5px_rgba(168,85,247,0.15)] space-y-2.5 transition-all">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Topic & Subject Search */}
          <div className="relative flex items-center bg-white dark:bg-slate-950 border-2 border-purple-300/90 dark:border-slate-800 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500 shadow-2xs transition-all">
            <div className="p-1 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Search className="w-2.5 h-2.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic or syllabus..."
              className="w-full bg-transparent text-xs font-semibold text-purple-950 dark:text-white placeholder:text-purple-700/60 dark:placeholder:text-slate-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-purple-200 dark:bg-purple-950 hover:bg-purple-300 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Attendance Status Filter Pills */}
          <div className="flex items-center bg-purple-100 dark:bg-slate-950 p-0.5 rounded-lg border border-purple-300 dark:border-slate-800 shadow-2xs justify-between">
            <button
              type="button"
              onClick={() => setFilterStatus('All')}
              className={`flex-1 py-1 text-center text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'All'
                  ? 'bg-purple-700 text-white shadow-2xs dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-purple-950 dark:text-slate-400 hover:bg-purple-200/80 dark:hover:bg-slate-800'
              }`}
            >
              All ({totalLogs})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Present')}
              className={`flex-1 py-1 text-center text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'Present'
                  ? 'bg-emerald-600 text-white shadow-2xs dark:shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'text-emerald-950 dark:text-slate-400 hover:bg-emerald-200/80 dark:hover:bg-slate-800'
              }`}
            >
              Present ({presentCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Absent')}
              className={`flex-1 py-1 text-center text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                filterStatus === 'Absent'
                  ? 'bg-rose-600 text-white shadow-2xs dark:shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                  : 'text-rose-950 dark:text-slate-400 hover:bg-rose-200/80 dark:hover:bg-slate-800'
              }`}
            >
              Absent ({absentCount})
            </button>
          </div>
        </div>

        {/* Sort controls bar (Exact Student Portal Match) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-purple-200/70 dark:border-slate-800 text-xs">
          <span className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono bg-purple-200/90 dark:bg-slate-950 border border-purple-300 dark:border-slate-800 px-2 py-0.5 rounded-md shadow-2xs self-start sm:self-auto">
            Showing {sortedExams.length} of {totalLogs} exam records
          </span>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-purple-200/90 dark:bg-slate-950/90 border border-purple-300 dark:border-slate-800 p-0.5 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'cards'
                    ? 'bg-purple-700 text-white shadow-2xs dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-purple-950 dark:text-slate-400 hover:bg-purple-300/80 dark:hover:bg-slate-800'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'table'
                    ? 'bg-purple-700 text-white shadow-2xs dark:shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-purple-950 dark:text-slate-400 hover:bg-purple-300/80 dark:hover:bg-slate-800'
                }`}
                title="Table View"
              >
                <LayoutList className="w-3 h-3" />
                <span>Table</span>
              </button>
            </div>

            <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-0">
              <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 mr-0.5 font-mono shrink-0">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8 px-2 bg-purple-100 dark:bg-slate-950 hover:bg-purple-200/90 dark:hover:bg-slate-900 border border-purple-400/90 dark:border-slate-800 rounded-lg text-xs font-bold text-purple-950 dark:text-slate-200 focus:outline-hidden cursor-pointer shadow-2xs transition-colors flex-1 sm:flex-initial"
              >
                <option value="date" className="dark:bg-slate-900">Date</option>
                <option value="marks" className="dark:bg-slate-900">Marks</option>
                <option value="pct" className="dark:bg-slate-900">Percentage</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="h-8 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-500 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs dark:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all cursor-pointer active:scale-98 shrink-0"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Exam Scorecards List / Grid */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto border border-purple-200/90 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-purple-100/90 dark:bg-slate-800 border-b border-purple-200 dark:border-slate-700 text-purple-950 dark:text-purple-200 font-black text-[10.5px] uppercase tracking-wider">
                <th className="py-2.5 px-3">EID & Date</th>
                <th className="py-2.5 px-3">Topic / Syllabus</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Score & Grade</th>
                <th className="py-2.5 px-3">Remarks</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-slate-800">
              {sortedExams.length > 0 ? (
                sortedExams.map((exam, index) => {
                  const isAbsent = exam.status === 'Absent';
                  const isEditing = editingEid === exam.eid;
                  const pct =
                    !isAbsent && exam.totalMarks > 0 && exam.obtainedMarks !== undefined && exam.obtainedMarks !== null
                      ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
                      : null;

                  if (isEditing && editFormData) {
                    return (
                      <tr key={exam.eid} className="bg-purple-50/90 dark:bg-slate-800/80">
                        <td colSpan={6} className="p-3">
                          <div className="space-y-3">
                            <span className="text-xs font-black text-purple-950 dark:text-purple-200">Editing Exam: {formatEid(exam.eid)}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 block">Date</label>
                                <input
                                  type="date"
                                  value={editFormData.date}
                                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 block">Subject & Topic</label>
                                <input
                                  type="text"
                                  value={editFormData.subjectAndTopic}
                                  onChange={(e) => setEditFormData({ ...editFormData, subjectAndTopic: e.target.value })}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 block">Status</label>
                                <select
                                  value={editFormData.status}
                                  onChange={(e) =>
                                    setEditFormData({ ...editFormData, status: e.target.value as 'Present' | 'Absent' })
                                  }
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100"
                                >
                                  <option value="Present" className="dark:bg-slate-800">Present</option>
                                  <option value="Absent" className="dark:bg-slate-800">Absent</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 block">Total Marks</label>
                                <input
                                  type="number"
                                  value={editFormData.totalMarks}
                                  onChange={(e) => setEditFormData({ ...editFormData, totalMarks: Number(e.target.value) })}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 block">Obtained</label>
                                <input
                                  type="number"
                                  value={editFormData.obtainedMarks ?? ''}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      obtainedMarks: e.target.value ? Number(e.target.value) : undefined,
                                    })
                                  }
                                  disabled={editFormData.status === 'Absent'}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded text-xs font-mono font-bold text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 block">Remarks</label>
                                <input
                                  type="text"
                                  value={editFormData.remarks || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                                  className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingEid(null)}
                                className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-purple-700 text-white rounded text-xs font-bold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={exam.eid || index} className="hover:bg-purple-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-purple-950 dark:text-purple-300 text-[10px]">{formatEid(exam.eid)}</span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1 font-semibold">
                            <Calendar className="w-2.5 h-2.5" />
                            {formatDateWithDay(exam.date)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{exam.subjectAndTopic}</span>
                        {exam.comment && <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate">&ldquo;{exam.comment}&rdquo;</p>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase inline-flex items-center gap-1 ${
                            isAbsent
                              ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {isAbsent ? <XCircle className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                          {exam.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {!isAbsent ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-slate-900 dark:text-slate-100 text-xs">
                              {exam.obtainedMarks ?? 0}/{exam.totalMarks}
                            </span>
                            {pct !== null && (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 rounded font-mono">
                                {pct}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {exam.remarks ? (
                          <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/80 px-1.5 py-0.5 rounded">
                            {exam.remarks}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(exam)}
                            className="p-1 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete exam record ${formatEid(exam.eid)}?`)) {
                                onDeleteExam(exam.eid);
                              }
                            }}
                            className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-slate-800 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs font-semibold">
                    No Exam Logs Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedExams.length > 0 ? (
          sortedExams.map((exam, index) => {
            const isAbsent = exam.status === 'Absent';
            const isEditing = editingEid === exam.eid;

            // In-line Edit Form
            if (isEditing && editFormData) {
              return (
                <div
                  key={exam.eid}
                  className="border-2 border-purple-400 dark:border-purple-600/70 bg-gradient-to-r from-purple-100/90 via-indigo-100/80 to-purple-50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 rounded-xl p-3 sm:p-4 space-y-3 shadow-md dark:shadow-[0_0_25px_rgba(168,85,247,0.25)] animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-purple-300 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black font-mono text-purple-950 dark:text-purple-200">
                      Editing Exam: {formatEid(exam.eid)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Date</label>
                      <input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-purple-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Subject & Topic</label>
                      <input
                        type="text"
                        value={editFormData.subjectAndTopic}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, subjectAndTopic: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            status: e.target.value as 'Present' | 'Absent',
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      >
                        <option value="Present" className="dark:bg-slate-800">Present</option>
                        <option value="Absent" className="dark:bg-slate-800">Absent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Total Marks</label>
                      <input
                        type="number"
                        value={editFormData.totalMarks}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, totalMarks: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Obtained Marks</label>
                      <input
                        type="number"
                        value={editFormData.obtainedMarks ?? ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            obtainedMarks: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        disabled={editFormData.status === 'Absent'}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-purple-950 dark:text-purple-300 font-mono">Remarks</label>
                      <input
                        type="text"
                        value={editFormData.remarks || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-purple-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingEid(null)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            const pct =
              !isAbsent &&
              exam.totalMarks > 0 &&
              exam.obtainedMarks !== undefined &&
              exam.obtainedMarks !== null
                ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
                : null;

            let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
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
                className={`border rounded-2xl p-3.5 transition-all flex flex-col justify-between gap-3 shadow-2xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-md dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:border-purple-300 dark:hover:border-purple-500 h-full min-w-0 ${
                  isAbsent
                    ? 'bg-gradient-to-br from-rose-50/90 via-orange-50/50 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 border-rose-200 dark:border-rose-900/60'
                    : 'bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/50 dark:from-slate-900 dark:via-purple-950/30 dark:to-slate-950 border-purple-200/90 dark:border-slate-800'
                }`}
              >
                {/* Header bar: 2 Clean Rows to Guarantee Zero Overlap */}
                <div className="space-y-2 border-b border-purple-100 dark:border-purple-900/40 pb-2.5 min-w-0">
                  {/* Row 1: ID on left, Grade & Status on right */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-purple-950 dark:text-purple-300 bg-purple-100/90 dark:bg-purple-950/70 px-2.5 py-0.5 rounded-md border border-purple-300/80 dark:border-purple-800/60 shadow-2xs flex items-center gap-1 min-w-0 max-w-[210px]">
                      <ShieldCheck className="w-3 h-3 text-purple-700 dark:text-purple-400 shrink-0" />
                      <span className="truncate">{formatEid(exam.eid)}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {pct !== null && (
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs ${badgeColor}`}
                        >
                          {gradeLabel}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border shadow-2xs flex items-center gap-1 shrink-0 ${
                          isAbsent
                            ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {isAbsent ? (
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        <span>{exam.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Date on left, Actions on right */}
                  <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 min-w-0 truncate">
                      <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                      <span className="truncate">{formatDateWithDay(exam.date)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(exam)}
                        className="p-1.5 text-purple-700 dark:text-purple-300 hover:text-purple-950 dark:hover:text-white bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete exam record ${formatEid(exam.eid)}?`)) {
                            onDeleteExam(exam.eid);
                          }
                        }}
                        className="p-1.5 text-rose-700 dark:text-rose-400 hover:text-rose-950 dark:hover:text-white bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Full-width Topic & Syllabus */}
                <div className="bg-purple-50/80 dark:bg-slate-800/80 border border-purple-200/80 dark:border-slate-700 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                    <ClipboardList className="w-3 h-3 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Topic / Syllabus</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug break-words">
                    {isAbsent ? (
                      <span className="text-slate-400 dark:text-slate-500 italic font-normal">No Exam Taken (Absent)</span>
                    ) : (
                      exam.subjectAndTopic
                    )}
                  </div>
                </div>

                {/* Score & Progress Bar */}
                {!isAbsent ? (
                  <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 dark:from-purple-950 dark:via-slate-900 dark:to-purple-950 p-2.5 rounded-xl border border-purple-800/40 text-white shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[9px] font-bold text-purple-200 uppercase font-mono">Score:</span>
                        <span className="text-sm font-black font-mono text-white">
                          {exam.obtainedMarks ?? 0}
                          <span className="text-[11px] text-purple-300 font-bold"> / {exam.totalMarks}</span>
                        </span>
                      </div>
                      {pct !== null && (
                        <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-purple-950 dark:text-purple-200 border border-transparent dark:border-purple-700 shadow-2xs">
                          {pct}%
                        </span>
                      )}
                    </div>

                    {pct !== null && (
                      <div className="w-full bg-purple-950/90 rounded-full h-2 overflow-hidden p-0.5 border border-purple-700/50">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-[11px] text-rose-800 dark:text-rose-300 font-bold italic flex items-center justify-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Absent — No Marks Recorded</span>
                  </div>
                )}

                {/* Feedback & remarks */}
                {(exam.remarks || exam.comment) && (
                  <div className="space-y-1.5 pt-1 border-t border-purple-100 dark:border-purple-900/40 text-[11px]">
                    {exam.remarks && (
                      <div className="flex items-center gap-1 text-[10px] text-purple-900 dark:text-purple-300 font-bold">
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 rounded-md font-mono flex items-center gap-1 shadow-2xs">
                          <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
                          <span>Tag: {exam.remarks}</span>
                        </span>
                      </div>
                    )}
                    {exam.comment && (
                      <div className="text-[11px] text-amber-950 dark:text-amber-200 font-medium italic bg-amber-50/90 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200/90 dark:border-amber-800/80 flex items-start gap-1.5 leading-tight shadow-2xs">
                        <span className="text-amber-600 dark:text-amber-400 font-serif text-sm leading-none shrink-0">&ldquo;</span>
                        <span className="break-words flex-1">{exam.comment}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-serif text-sm leading-none shrink-0">&rdquo;</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="md:col-span-2 py-8 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-purple-300 dark:border-purple-800/60 rounded-2xl bg-gradient-to-br from-purple-100/60 via-indigo-50 to-teal-100/60 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 shadow-2xs dark:shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-2">
            <div className="p-2.5 bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-xl w-10 h-10 mx-auto flex items-center justify-center border border-purple-300 dark:border-purple-800 shadow-2xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">No Exam Logs Found</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">No evaluation entries match your filter.</p>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
