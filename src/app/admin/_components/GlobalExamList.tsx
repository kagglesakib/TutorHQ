'use client';

import React, { useState, useMemo } from 'react';
import { Student, Exam } from '@/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Trophy,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Search,
  Sparkles,
  Filter,
  ShieldCheck,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Check,
  TrendingUp,
  BarChart3,
  ClipboardList,
  User,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
} from 'lucide-react';
import { formatEid, generateExamId } from '@/utils/id';

interface GlobalExamListProps {
  exams: Exam[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onAddExam?: (exam: Exam) => Promise<void> | void;
  onUpdateExam: (exam: Exam) => Promise<void> | void;
  onDeleteExam: (eid: string) => Promise<void> | void;
}

type ChartViewMode = 'trend' | 'grades' | 'students';

export default function GlobalExamList({
  exams,
  students,
  onSelectStudent,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
}: GlobalExamListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'marks' | 'pct'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showChart, setShowChart] = useState(true);
  const [chartMode, setChartMode] = useState<ChartViewMode>('trend');

  // Edit Mode State
  const [editingEid, setEditingEid] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Exam | null>(null);

  // Quick Log Exam Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [newExamData, setNewExamData] = useState<{
    studentSid: string;
    date: string;
    subjectAndTopic: string;
    status: 'Present' | 'Absent';
    totalMarks: number;
    obtainedMarks: number | '';
    remarks: string;
    comment: string;
  }>({
    studentSid: students[0]?.sid || '',
    date: new Date().toISOString().slice(0, 10),
    subjectAndTopic: '',
    status: 'Present',
    totalMarks: 50,
    obtainedMarks: 40,
    remarks: 'Good',
    comment: '',
  });

  const studentMap = useMemo(() => new Map(students.map((s) => [s.sid, s])), [students]);
  const activeStudents = useMemo(() => students.filter((s) => s.isApproved !== 'no' && s.status !== 'revoked'), [students]);

  // Telemetry Calculations matching Student Portal
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

  // Filter exams based on search, student, month, status
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const student = studentMap.get(e.studentSid);
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        e.subjectAndTopic?.toLowerCase().includes(term) ||
        e.eid?.toLowerCase().includes(term) ||
        e.studentSid?.toLowerCase().includes(term) ||
        e.remarks?.toLowerCase().includes(term) ||
        e.comment?.toLowerCase().includes(term) ||
        (student && student.name.toLowerCase().includes(term));

      const matchesStudent = selectedStudentFilter === 'All' || e.studentSid === selectedStudentFilter;
      const matchesMonth = !filterMonth || (e.date && e.date.startsWith(filterMonth));
      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Present' && e.status !== 'Absent') ||
        (filterStatus === 'Absent' && e.status === 'Absent');

      return matchesSearch && matchesStudent && matchesMonth && matchesStatus;
    });
  }, [exams, searchTerm, selectedStudentFilter, filterMonth, filterStatus, studentMap]);

  // Sort filtered exams
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

  // Chart Data: 1. Continuous Trajectory Curve
  const trajectoryChartData = useMemo(() => {
    const list = [...evaluatedExams];
    const scopedList =
      selectedStudentFilter === 'All' ? list : list.filter((e) => e.studentSid === selectedStudentFilter);

    return scopedList
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e, index) => {
        const percentage = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
        const dateLabel = e.date ? e.date.substring(5) : `#${index + 1}`;
        const student = studentMap.get(e.studentSid);
        return {
          id: e.eid,
          name: dateLabel,
          topic: e.subjectAndTopic,
          date: e.date,
          score: percentage,
          obtained: e.obtainedMarks,
          total: e.totalMarks,
          studentName: student?.name || e.studentSid,
        };
      });
  }, [evaluatedExams, selectedStudentFilter, studentMap]);

  // Chart Data: 2. Academic Grade Distribution Bands
  const gradeDistributionData = useMemo(() => {
    const bands = [
      { band: '90-100% (A+)', count: 0, color: '#059669' }, // Emerald
      { band: '80-89% (A)', count: 0, color: '#0284c7' },   // Sky
      { band: '70-79% (B)', count: 0, color: '#4f46e5' },   // Indigo
      { band: '60-69% (C)', count: 0, color: '#7c3aed' },   // Purple
      { band: '40-59% (Pass)', count: 0, color: '#d97706' },// Amber
      { band: '<40% (Needs Work)', count: 0, color: '#e11d48' }, // Rose
    ];

    const source =
      selectedStudentFilter === 'All'
        ? evaluatedExams
        : evaluatedExams.filter((e) => e.studentSid === selectedStudentFilter);

    source.forEach((e) => {
      const pct = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
      if (pct >= 90) bands[0].count++;
      else if (pct >= 80) bands[1].count++;
      else if (pct >= 70) bands[2].count++;
      else if (pct >= 60) bands[3].count++;
      else if (pct >= 40) bands[4].count++;
      else bands[5].count++;
    });

    return bands;
  }, [evaluatedExams, selectedStudentFilter]);

  // Chart Data: 3. Cross-Student Performance Standings
  const studentComparisonData = useMemo(() => {
    const stats: Record<
      string,
      { sid: string; name: string; sumScores: number; count: number; peak: number }
    > = {};

    students.forEach((s) => {
      stats[s.sid] = { sid: s.sid, name: s.name, sumScores: 0, count: 0, peak: 0 };
    });

    evaluatedExams.forEach((e) => {
      if (!stats[e.studentSid]) {
        stats[e.studentSid] = {
          sid: e.studentSid,
          name: studentMap.get(e.studentSid)?.name || e.studentSid,
          sumScores: 0,
          count: 0,
          peak: 0,
        };
      }
      const score = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
      stats[e.studentSid].sumScores += score;
      stats[e.studentSid].count += 1;
      if (score > stats[e.studentSid].peak) {
        stats[e.studentSid].peak = score;
      }
    });

    return Object.values(stats)
      .filter((s) => s.count > 0)
      .map((s) => ({
        sid: s.sid,
        name: s.name.split(' ')[0] || s.sid,
        fullName: s.name,
        average: Math.round(s.sumScores / s.count),
        peak: s.peak,
        examCount: s.count,
      }))
      .sort((a, b) => b.average - a.average);
  }, [students, evaluatedExams, studentMap]);

  // Handlers
  const handleStartEdit = (exam: Exam) => {
    setEditingEid(exam.eid);
    setEditFormData({ ...exam });
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      await onUpdateExam(editFormData);
      setEditingEid(null);
      setEditFormData(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamData.studentSid) return;

    setIsSubmittingAdd(true);
    try {
      const examPayload: Exam = {
        eid: generateExamId(),
        studentSid: newExamData.studentSid,
        date: newExamData.date,
        subjectAndTopic: newExamData.subjectAndTopic.trim() || 'General Assessment',
        status: newExamData.status,
        totalMarks: Number(newExamData.totalMarks) || 50,
        obtainedMarks:
          newExamData.status === 'Present' && newExamData.obtainedMarks !== ''
            ? Number(newExamData.obtainedMarks)
            : undefined,
        remarks: newExamData.remarks.trim(),
        comment: newExamData.comment.trim(),
      };

      if (onAddExam) {
        await onAddExam(examPayload);
      } else {
        const res = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(examPayload),
        });
        if (!res.ok) throw new Error('Failed to create exam');
        window.location.reload();
      }

      setIsAddModalOpen(false);
      setNewExamData({
        studentSid: students[0]?.sid || '',
        date: new Date().toISOString().slice(0, 10),
        subjectAndTopic: '',
        status: 'Present',
        totalMarks: 50,
        obtainedMarks: 40,
        remarks: 'Good',
        comment: '',
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save exam record');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto animate-fadeIn" id="admin-exams-view-panel">
      {/* 1. Top Identity & Telemetry Header Card (Exact Student Portal Match) */}
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
                  Official Ledger
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 font-medium">
                Comprehensive marks ledger, syllabus assessment topics, and cross-student historical performance tracking.
              </p>
            </div>
          </div>

          {/* Action & Metric Cluster */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Average Performance Pill */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-purple-600/20 border border-purple-400/40 shrink-0">
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

            {/* Toggle Graph Button */}
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-indigo-950 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-300 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="Toggle Analytics Graph"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">{showChart ? 'Hide Graph' : 'Show Graph'}</span>
              {showChart ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Log Exam Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 hover:from-purple-800 hover:to-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer border border-white/40 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Exam</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Telemetry Cards (Exact Student Portal Match) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          {/* Evaluated Exams */}
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

      {/* 2. Iconic Level Performance Graph (Matching the purple-indigo-teal palette) */}
      {showChart && (
        <div className="bg-gradient-to-r from-purple-100/80 via-indigo-100/80 to-teal-100/70 border border-purple-300/90 rounded-2xl p-3 sm:p-4 space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-purple-950">
                  {chartMode === 'trend' && 'Exam Performance Trajectory & Benchmark Curve'}
                  {chartMode === 'grades' && 'Academic Grade Tier Distribution'}
                  {chartMode === 'students' && 'Cross-Student Assessment Standings'}
                </h3>
                <p className="text-[10px] text-purple-800 font-medium">
                  {chartMode === 'trend' && 'Score progression over historical assessments with Target 80% & Pass 40% lines'}
                  {chartMode === 'grades' && 'Assessment breakdown across standard academic score tiers'}
                  {chartMode === 'students' && 'Student average marks comparison across all graded test sessions'}
                </p>
              </div>
            </div>

            {/* Segment Tab Controls */}
            <div className="flex items-center bg-purple-100/90 p-0.5 rounded-lg border border-purple-300 shadow-2xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartMode('trend')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  chartMode === 'trend'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-purple-950 hover:bg-purple-200/80'
                }`}
              >
                <TrendingUp className="w-3 h-3" />
                <span>Trajectory</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('grades')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  chartMode === 'grades'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-purple-950 hover:bg-purple-200/80'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>Grade Bands</span>
              </button>
              <button
                type="button"
                onClick={() => setChartMode('students')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  chartMode === 'students'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'text-purple-950 hover:bg-purple-200/80'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>By Student</span>
              </button>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-56 sm:h-64 w-full bg-white/80 p-2 sm:p-3 rounded-xl border border-purple-200 shadow-2xs">
            {chartMode === 'trend' && (
              trajectoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectoryChartData} margin={{ top: 12, right: 15, left: -5, bottom: 5 }}>
                    <defs>
                      <linearGradient id="purpleIndigoScoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#4338ca', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#c7d2fe' }}
                    />
                    <YAxis
                      width={38}
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tick={{ fontSize: 10, fill: '#4338ca', fontWeight: 600 }}
                      tickFormatter={(val) => `${val}%`}
                      tickLine={false}
                      axisLine={{ stroke: '#c7d2fe' }}
                    />
                    <ReferenceLine
                      y={80}
                      stroke="#059669"
                      strokeDasharray="3 3"
                      strokeWidth={1.5}
                      label={{
                        value: 'Target 80%',
                        fill: '#047857',
                        fontSize: 9,
                        fontWeight: 'bold',
                        position: 'insideTopRight',
                      }}
                    />
                    <ReferenceLine
                      y={40}
                      stroke="#e11d48"
                      strokeDasharray="2 2"
                      strokeWidth={1.5}
                      label={{
                        value: 'Pass 40%',
                        fill: '#be123c',
                        fontSize: 9,
                        fontWeight: 'bold',
                        position: 'insideBottomRight',
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          const isPass = d.score >= 40;
                          const isDistinction = d.score >= 80;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1.5 border border-slate-700 min-w-[190px]">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                                <span className="font-bold text-indigo-300 truncate max-w-[130px]">{d.studentName}</span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black ${
                                    isDistinction
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : isPass
                                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {isDistinction ? 'Excellence' : isPass ? 'Pass' : 'Needs Work'}
                                </span>
                              </div>
                              <p className="text-[11px] text-white font-medium truncate">{d.topic}</p>
                              <p className="text-[10px] text-slate-300 font-mono">Date: {d.date}</p>
                              <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-4 font-mono">
                                <span className="text-slate-400">Score:</span>
                                <span className="font-bold text-amber-400">
                                  {d.obtained} / {d.total} ({d.score}%)
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#purpleIndigoScoreGrad)"
                      dot={{ fill: '#4338ca', r: 4, strokeWidth: 1.5, stroke: '#ffffff' }}
                      activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-purple-900/60 font-medium">
                  No evaluated exam scores recorded for this filter.
                </div>
              )
            )}

            {chartMode === 'grades' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistributionData} margin={{ top: 12, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                  <XAxis
                    dataKey="band"
                    tick={{ fontSize: 9.5, fill: '#4338ca', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#c7d2fe' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: '#4338ca', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={{ stroke: '#c7d2fe' }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f5f3ff' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg border border-slate-700 text-xs font-medium">
                            <p className="font-bold text-slate-200">{d.band}</p>
                            <p className="font-mono text-amber-400 text-sm">{d.count} Tests</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartMode === 'students' && (
              studentComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentComparisonData} margin={{ top: 12, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#4338ca', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#c7d2fe' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tick={{ fontSize: 10, fill: '#4338ca', fontWeight: 600 }}
                      tickFormatter={(val) => `${val}%`}
                      tickLine={false}
                      axisLine={{ stroke: '#c7d2fe' }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f5f3ff' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 text-xs space-y-1">
                              <p className="font-bold text-white text-xs">{d.fullName} ({d.sid})</p>
                              <div className="flex items-center gap-3 pt-0.5 font-mono text-[11px]">
                                <span className="text-emerald-400">Avg: {d.average}%</span>
                                <span className="text-amber-400">Peak: {d.peak}%</span>
                                <span className="text-slate-400">({d.examCount} tests)</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="average" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-purple-900/60 font-medium">
                  No student scores recorded yet.
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 3. Filter & Search Toolbar (Exact Student Portal Match + Student Filter) */}
      <div className="bg-gradient-to-r from-purple-100/90 via-indigo-100/90 to-teal-100/90 border border-purple-300/90 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {/* Topic & Subject Search */}
          <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500 shadow-2xs transition-all sm:col-span-1 md:col-span-1">
            <div className="p-1 bg-purple-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Search className="w-2.5 h-2.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic, student, SID..."
              className="w-full bg-transparent text-xs font-semibold text-purple-950 placeholder:text-purple-700/60 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-purple-200 hover:bg-purple-300 text-purple-900 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Student Selector */}
          <div className="relative flex items-center bg-gradient-to-r from-indigo-50 via-sky-50 to-indigo-50 border border-indigo-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 shadow-2xs transition-all min-w-0">
            <div className="p-1 bg-indigo-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <User className="w-2.5 h-2.5" />
            </div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-indigo-950 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Students ({activeStudents.length})</option>
              {activeStudents.map((s) => (
                <option key={s.sid} value={s.sid}>
                  {s.name} ({s.sid})
                </option>
              ))}
            </select>
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
                type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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

        {/* Sort controls bar (Exact Student Portal Match) */}
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
              type="button"
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

      {/* 4. Exam Scorecards List (Exact Student Portal Match + Admin Controls) */}
      {sortedExams.length > 0 ? (
        <div className="space-y-2">
          {sortedExams.map((exam, index) => {
            const student = studentMap.get(exam.studentSid);
            const isAbsent = exam.status === 'Absent';
            const isEditing = editingEid === exam.eid;

            // In-line Edit Form
            if (isEditing && editFormData) {
              return (
                <div
                  key={exam.eid}
                  className="border-2 border-purple-400 bg-gradient-to-r from-purple-100/90 via-indigo-100/80 to-purple-50 rounded-xl p-3 sm:p-4 space-y-3 shadow-md animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-purple-300 pb-2">
                    <span className="text-xs font-black font-mono text-purple-950">
                      Editing Exam Record: {formatEid(exam.eid)}
                    </span>
                    <span className="text-xs text-purple-900 font-bold">
                      Student: {student?.name || exam.studentSid}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 font-mono">Date</label>
                      <input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-purple-950 font-mono">Subject & Topic</label>
                      <input
                        type="text"
                        value={editFormData.subjectAndTopic}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, subjectAndTopic: e.target.value })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 font-mono">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            status: e.target.value as 'Present' | 'Absent',
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-900"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 font-mono">Total Marks</label>
                      <input
                        type="number"
                        value={editFormData.totalMarks}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, totalMarks: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-purple-950 font-mono">Obtained Marks</label>
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
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:bg-slate-100"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-bold text-purple-950 font-mono">Remarks / Feedback</label>
                      <input
                        type="text"
                        value={editFormData.remarks || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingEid(null)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs transition-all"
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
                {/* Header bar: ID, Student, Date on left, Grade, Attendance Status, and Actions on right */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-purple-200/70 pb-1.5">
                  {/* Identifier, Student Chip & Date */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-purple-950 bg-purple-100/90 px-1.5 py-0.5 rounded-md border border-purple-300 shadow-2xs flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5 text-purple-700 shrink-0" />
                      {formatEid(exam.eid)}
                    </span>

                    {/* Student chip linking directly to student detail in Admin */}
                    <button
                      type="button"
                      onClick={() => onSelectStudent(exam.studentSid)}
                      className="text-[10px] font-bold text-indigo-950 bg-indigo-100/90 hover:bg-indigo-200/90 px-2 py-0.5 rounded-md border border-indigo-300 shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
                      title="View Student Profile"
                    >
                      <User className="w-2.5 h-2.5 text-indigo-700 shrink-0" />
                      <span>{student?.name || exam.studentSid}</span>
                      <span className="text-[9px] font-mono text-indigo-600">({exam.studentSid})</span>
                    </button>

                    <span className="text-[10px] font-bold text-slate-800 font-mono flex items-center gap-1 bg-indigo-100/90 px-1.5 py-0.5 rounded-md border border-indigo-200 shadow-2xs shrink-0">
                      <Calendar className="w-2.5 h-2.5 text-indigo-700 shrink-0" />
                      {exam.date}
                    </span>
                  </div>

                  {/* Badges: Grade + Attendance Status paired neatly together + Action buttons */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                    {pct !== null && (
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs ${badgeColor}`}
                      >
                        {gradeLabel}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border shadow-2xs flex items-center gap-1 ${
                        isAbsent
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400'
                      }`}
                    >
                      {isAbsent ? (
                        <XCircle className="w-3 h-3 text-rose-200" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                      )}
                      {exam.status}
                    </span>

                    {/* Admin Actions: Edit & Delete */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(exam)}
                      className="p-1 bg-purple-100 hover:bg-purple-200/90 text-purple-900 border border-purple-300 rounded-md shadow-2xs transition-colors cursor-pointer"
                      title="Edit Exam"
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
                      className="p-1 bg-rose-100 hover:bg-rose-200/90 text-rose-900 border border-rose-300 rounded-md shadow-2xs transition-colors cursor-pointer"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Compact Details & Score Row (Exact Student Portal Match) */}
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
                        {isAbsent ? (
                          <span className="text-slate-500 italic font-normal">No Exam (Absent)</span>
                        ) : (
                          exam.subjectAndTopic
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* Score Box */}
                  {!isAbsent ? (
                    <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2.5 bg-gradient-to-br from-purple-700 via-indigo-700 to-indigo-800 px-2.5 py-1.5 rounded-lg border border-purple-400/40 text-white shadow-xs">
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[9px] font-bold text-purple-200 uppercase font-mono">Score:</span>
                        <span className="text-xs sm:text-sm font-black font-mono text-white">
                          {exam.obtainedMarks ?? 0}
                          <span className="text-[10px] text-purple-200 font-sans font-bold">
                            {' '}
                            / {exam.totalMarks}
                          </span>
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
                        <span className="truncate">&ldquo;{exam.comment}&rdquo;</span>
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
            <p className="text-[11px] text-slate-600 font-medium">
              No evaluation entries match your filter or search query.
            </p>
          </div>
        </div>
      )}

      {/* 5. Quick Add Exam Modal (styled in the same purple-indigo-teal aesthetic) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="p-3.5 sm:p-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between border-b border-purple-400/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight">Record Examination Evaluation</h3>
                  <p className="text-[10px] text-purple-200">Log test score, attendance status, and student marks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/20 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 sm:p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 font-mono">Student *</label>
                <select
                  required
                  value={newExamData.studentSid}
                  onChange={(e) => setNewExamData({ ...newExamData, studentSid: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                >
                  {activeStudents.map((s) => (
                    <option key={s.sid} value={s.sid}>
                      {s.name} ({s.sid})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 font-mono">Exam Date *</label>
                  <input
                    type="date"
                    required
                    value={newExamData.date}
                    onChange={(e) => setNewExamData({ ...newExamData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 font-mono">Attendance Status</label>
                  <select
                    value={newExamData.status}
                    onChange={(e) =>
                      setNewExamData({
                        ...newExamData,
                        status: e.target.value as 'Present' | 'Absent',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 font-mono">Subject & Topic / Syllabus *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics - Dynamics & Momentum Test"
                  value={newExamData.subjectAndTopic}
                  onChange={(e) => setNewExamData({ ...newExamData, subjectAndTopic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 font-mono">Total Marks *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newExamData.totalMarks}
                    onChange={(e) => setNewExamData({ ...newExamData, totalMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 font-mono">Obtained Marks</label>
                  <input
                    type="number"
                    min={0}
                    value={newExamData.obtainedMarks}
                    onChange={(e) =>
                      setNewExamData({
                        ...newExamData,
                        obtainedMarks: e.target.value !== '' ? Number(e.target.value) : '',
                      })
                    }
                    disabled={newExamData.status === 'Absent'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 font-mono">Remarks Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Excellent / Good / Needs Focus"
                    value={newExamData.remarks}
                    onChange={(e) => setNewExamData({ ...newExamData, remarks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 font-mono">Feedback Comment</label>
                  <input
                    type="text"
                    placeholder="e.g. Strong conceptual grasp"
                    value={newExamData.comment}
                    onChange={(e) => setNewExamData({ ...newExamData, comment: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-4 py-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-teal-600 hover:from-purple-800 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? 'Saving...' : 'Save Exam Scorecard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
