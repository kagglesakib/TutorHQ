'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Student, Activity, Exam, Payment } from '@/types';
import {
  Users,
  BookOpen,
  ClipboardList,
  Banknote,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  RefreshCw,
  GraduationCap,
  Percent,
  Layers,
  Zap,
  Target,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import { formatBatch } from '@/utils/formatBatch';
import {
  isActiveEnrolledStudent,
  isAdminStudent,
  isPendingStudent,
  isRevokedOrRejectedStudent,
} from '@/utils/studentFilters';

interface AdminPortalProps {
  students: Student[];
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  onRefreshData: () => Promise<void> | void;
  onSelectStudent: (sid: string) => void;
  onSaveStudent?: (formData: Student, originalSid?: string) => Promise<void> | void;
  onDeleteStudent?: (sid: string) => Promise<void> | void;
  onAddActivity?: (actData: Activity) => Promise<void> | void;
  onAddExam?: (examData: Exam) => Promise<void> | void;
  onAddPayment?: (payData: Payment) => Promise<void> | void;
}

// Chart Palette Colors
const COLORS = {
  emerald: '#059669',
  teal: '#0d9488',
  indigo: '#4f46e5',
  purple: '#7c3aed',
  amber: '#d97706',
  orange: '#ea580c',
  rose: '#e11d48',
  sky: '#0284c7',
  slate: '#64748b',
};

const PIE_PALETTE = [
  '#4f46e5',
  '#059669',
  '#d97706',
  '#7c3aed',
  '#0284c7',
  '#e11d48',
  '#0d9488',
  '#f59e0b',
];

export default function AdminPortal({
  students,
  activities,
  exams,
  payments,
  onRefreshData,
  onSelectStudent,
}: AdminPortalProps) {
  // Mounting state to prevent Recharts SSR hydration calculation errors
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '90d' | '6m'>('all');
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  const batchDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(e.target as Node)) {
        setIsBatchDropdownOpen(false);
      }
    };
    if (isBatchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBatchDropdownOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper to parse numeric year for batch sorting (newest/active cohorts first)
  const parseBatchYear = (batch: string): number => {
    const digits = batch.replace(/\D/g, '');
    if (!digits) return 0;
    const num = parseInt(digits, 10);
    return num < 100 ? 2000 + num : num;
  };

  // Strictly filter active enrolled students (excludes Admins, Pending approvals, and Revoked/Rejected accounts)
  const activeStudents = useMemo(() => {
    return students.filter(isActiveEnrolledStudent);
  }, [students]);

  // Distinct HSC Batches sorted chronologically descending
  const uniqueBatches = useMemo(() => {
    const set = new Set<string>();
    activeStudents.forEach((s) => {
      if (s.hscBatch && s.hscBatch.trim()) {
        set.add(s.hscBatch.trim());
      }
    });
    return Array.from(set).sort((a, b) => {
      const yearA = parseBatchYear(a);
      const yearB = parseBatchYear(b);
      if (yearA !== yearB) return yearB - yearA; // Newest cohorts first
      return a.localeCompare(b);
    });
  }, [activeStudents]);

  // Student counts per batch
  const batchStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeStudents.forEach((s) => {
      const b = s.hscBatch?.trim();
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    return counts;
  }, [activeStudents]);

  // Dropdown search filtered batches
  const filteredDropdownBatches = useMemo(() => {
    if (!batchSearchTerm.trim()) return uniqueBatches;
    const term = batchSearchTerm.toLowerCase();
    return uniqueBatches.filter(
      (b) => b.toLowerCase().includes(term) || formatBatch(b).toLowerCase().includes(term)
    );
  }, [uniqueBatches, batchSearchTerm]);

  // Date filtering logic
  const cutoffDate = useMemo(() => {
    if (timeRange === 'all') return null;
    const date = new Date();
    if (timeRange === '30d') date.setDate(date.getDate() - 30);
    if (timeRange === '90d') date.setDate(date.getDate() - 90);
    if (timeRange === '6m') date.setMonth(date.getMonth() - 6);
    return date;
  }, [timeRange]);

  // Filtered Students (derived from active enrolled students)
  const filteredStudents = useMemo(() => {
    return activeStudents.filter((s) => {
      if (selectedBatch === 'all') return true;
      if (s.hscBatch === selectedBatch) return true;
      if (formatBatch(s.hscBatch) === formatBatch(selectedBatch)) return true;
      return false;
    });
  }, [activeStudents, selectedBatch]);

  const filteredStudentSids = useMemo(() => {
    return new Set(filteredStudents.map((s) => s.sid));
  }, [filteredStudents]);

  // Filtered Activities (Lessons)
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (!filteredStudentSids.has(a.studentSid)) return false;
      if (cutoffDate && a.date) {
        const d = new Date(a.date);
        if (d < cutoffDate) return false;
      }
      return true;
    });
  }, [activities, filteredStudentSids, cutoffDate]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      if (!filteredStudentSids.has(e.studentSid)) return false;
      if (cutoffDate && e.date) {
        const d = new Date(e.date);
        if (d < cutoffDate) return false;
      }
      return true;
    });
  }, [exams, filteredStudentSids, cutoffDate]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (!filteredStudentSids.has(p.studentSid)) return false;
      if (cutoffDate && p.date) {
        const d = new Date(p.date);
        if (d < cutoffDate) return false;
      }
      return true;
    });
  }, [payments, filteredStudentSids, cutoffDate]);

  // ----------------------------------------------------
  // 1. HIGH-LEVEL KPI METRICS
  // ----------------------------------------------------
  const totalRevenue = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPayments]);

  const avgPayment = useMemo(() => {
    if (filteredPayments.length === 0) return 0;
    return Math.round(totalRevenue / filteredPayments.length);
  }, [totalRevenue, filteredPayments]);

  const examStats = useMemo(() => {
    const presentExams = filteredExams.filter(
      (e) => e.status !== 'Absent' && e.obtainedMarks !== undefined && e.totalMarks > 0
    );
    if (presentExams.length === 0) {
      return { avgScorePct: 0, highestScorePct: 0, totalEvaluated: 0, absentCount: filteredExams.length };
    }
    const percentages = presentExams.map((e) => ((e.obtainedMarks || 0) / e.totalMarks) * 100);
    const avgScorePct = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
    const highestScorePct = Math.round(Math.max(...percentages));
    const absentCount = filteredExams.filter((e) => e.status === 'Absent').length;
    return { avgScorePct, highestScorePct, totalEvaluated: presentExams.length, absentCount };
  }, [filteredExams]);

  const lessonStats = useMemo(() => {
    if (filteredActivities.length === 0) {
      return { attendanceRate: 0, totalLessons: 0, avgHwMarks: 0, avgCwMarks: 0 };
    }
    const presentActivities = filteredActivities.filter((a) => a.status === 'Present');
    const attendanceRate = Math.round((presentActivities.length / filteredActivities.length) * 100);

    const hwValid = presentActivities.filter((a) => a.hwMarks !== undefined && a.hwMarks !== null);
    const avgHwMarks = hwValid.length
      ? Number((hwValid.reduce((sum, a) => sum + (a.hwMarks || 0), 0) / hwValid.length).toFixed(1))
      : 0;

    const cwValid = presentActivities.filter((a) => a.cwMarks !== undefined && a.cwMarks !== null);
    const avgCwMarks = cwValid.length
      ? Number((cwValid.reduce((sum, a) => sum + (a.cwMarks || 0), 0) / cwValid.length).toFixed(1))
      : 0;

    return {
      attendanceRate,
      totalLessons: filteredActivities.length,
      avgHwMarks,
      avgCwMarks,
    };
  }, [filteredActivities]);

  // ----------------------------------------------------
  // 2. CHART DATA 1: MONTHLY REVENUE & PAYMENT VOLUME
  // ----------------------------------------------------
  const monthlyRevenueChartData = useMemo(() => {
    const monthMap: { [month: string]: { month: string; revenue: number; count: number } } = {};

    filteredPayments.forEach((p) => {
      const month = p.paymentMonth || (p.date ? p.date.substring(0, 7) : 'Unknown');
      if (!monthMap[month]) {
        monthMap[month] = { month, revenue: 0, count: 0 };
      }
      monthMap[month].revenue += Number(p.amount) || 0;
      monthMap[month].count += 1;
    });

    return Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredPayments]);

  // ----------------------------------------------------
  // 3. CHART DATA 2: REVENUE DISTRIBUTION BY BATCH
  // ----------------------------------------------------
  const revenueByBatchChartData = useMemo(() => {
    const batchMap: { [batch: string]: number } = {};
    const studentBatchMap = new Map<string, string>();
    students.forEach((s) => studentBatchMap.set(s.sid, s.hscBatch || 'Unassigned'));

    filteredPayments.forEach((p) => {
      const batch = studentBatchMap.get(p.studentSid) || 'Unassigned';
      batchMap[batch] = (batchMap[batch] || 0) + (Number(p.amount) || 0);
    });

    return Object.entries(batchMap).map(([batch, amount]) => ({
      name: formatBatch(batch, 'General'),
      value: amount,
    }));
  }, [filteredPayments, students]);

  // ----------------------------------------------------
  // 4. CHART DATA 3: EXAM SCORE TRAJECTORY OVER TIME
  // ----------------------------------------------------
  const examTrajectoryChartData = useMemo(() => {
    // Group exams by date or chronological session
    const dateMap: { [date: string]: { date: string; avgPct: number; count: number; totalPct: number } } = {};

    filteredExams.forEach((e) => {
      if (e.status !== 'Absent' && e.obtainedMarks !== undefined && e.totalMarks > 0 && e.date) {
        const pct = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
        if (!dateMap[e.date]) {
          dateMap[e.date] = { date: e.date, avgPct: 0, count: 0, totalPct: 0 };
        }
        dateMap[e.date].count += 1;
        dateMap[e.date].totalPct += pct;
      }
    });

    return Object.values(dateMap)
      .map((item) => ({
        date: item.date,
        avgScore: Math.round(item.totalPct / item.count),
        examCount: item.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredExams]);

  // ----------------------------------------------------
  // 5. CHART DATA 4: EXAM MARKS GRADE DISTRIBUTION
  // ----------------------------------------------------
  const examGradeDistributionData = useMemo(() => {
    const grades = {
      'A+ (80%+)': 0,
      'A (70-79%)': 0,
      'B (60-69%)': 0,
      'C (50-59%)': 0,
      'Needs Focus (<50%)': 0,
      'Absent': 0,
    };

    filteredExams.forEach((e) => {
      if (e.status === 'Absent') {
        grades['Absent'] += 1;
      } else if (e.obtainedMarks !== undefined && e.totalMarks > 0) {
        const pct = ((e.obtainedMarks || 0) / e.totalMarks) * 100;
        if (pct >= 80) grades['A+ (80%+)'] += 1;
        else if (pct >= 70) grades['A (70-79%)'] += 1;
        else if (pct >= 60) grades['B (60-69%)'] += 1;
        else if (pct >= 50) grades['C (50-59%)'] += 1;
        else grades['Needs Focus (<50%)'] += 1;
      }
    });

    return Object.entries(grades).map(([grade, count]) => ({
      grade,
      count,
    }));
  }, [filteredExams]);

  // ----------------------------------------------------
  // 6. CHART DATA 5: HOMEWORK (HW) VS CLASSWORK (CW) TRENDS
  // ----------------------------------------------------
  const hwCwTrendsChartData = useMemo(() => {
    const dateMap: {
      [date: string]: {
        date: string;
        hwTotal: number;
        hwCount: number;
        cwTotal: number;
        cwCount: number;
      };
    } = {};

    filteredActivities.forEach((a) => {
      if (a.date && a.status === 'Present') {
        if (!dateMap[a.date]) {
          dateMap[a.date] = { date: a.date, hwTotal: 0, hwCount: 0, cwTotal: 0, cwCount: 0 };
        }
        if (a.hwMarks !== undefined && a.hwMarks !== null) {
          dateMap[a.date].hwTotal += a.hwMarks;
          dateMap[a.date].hwCount += 1;
        }
        if (a.cwMarks !== undefined && a.cwMarks !== null) {
          dateMap[a.date].cwTotal += a.cwMarks;
          dateMap[a.date].cwCount += 1;
        }
      }
    });

    return Object.values(dateMap)
      .map((item) => ({
        date: item.date,
        avgHw: item.hwCount > 0 ? Number((item.hwTotal / item.hwCount).toFixed(1)) : 0,
        avgCw: item.cwCount > 0 ? Number((item.cwTotal / item.cwCount).toFixed(1)) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredActivities]);

  // ----------------------------------------------------
  // 7. CHART DATA 6: BATCH COMPARISON MATRIX
  // ----------------------------------------------------
  const batchComparisonData = useMemo(() => {
    const batchMap: {
      [batch: string]: {
        batchName: string;
        studentCount: number;
        examTotalPct: number;
        examCount: number;
        activityPresentCount: number;
        activityTotalCount: number;
        hwTotal: number;
        hwCount: number;
      };
    } = {};

    // Group students
    students.forEach((s) => {
      const b = s.hscBatch || 'General';
      if (!batchMap[b]) {
        batchMap[b] = {
          batchName: formatBatch(b, 'General'),
          studentCount: 0,
          examTotalPct: 0,
          examCount: 0,
          activityPresentCount: 0,
          activityTotalCount: 0,
          hwTotal: 0,
          hwCount: 0,
        };
      }
      batchMap[b].studentCount += 1;
    });

    // Exams by student
    const studentToBatch = new Map<string, string>();
    students.forEach((s) => studentToBatch.set(s.sid, s.hscBatch || 'General'));

    exams.forEach((e) => {
      const b = studentToBatch.get(e.studentSid) || 'General';
      if (batchMap[b] && e.status !== 'Absent' && e.obtainedMarks !== undefined && e.totalMarks > 0) {
        batchMap[b].examTotalPct += ((e.obtainedMarks || 0) / e.totalMarks) * 100;
        batchMap[b].examCount += 1;
      }
    });

    // Activities by student
    activities.forEach((a) => {
      const b = studentToBatch.get(a.studentSid) || 'General';
      if (batchMap[b]) {
        batchMap[b].activityTotalCount += 1;
        if (a.status === 'Present') {
          batchMap[b].activityPresentCount += 1;
          if (a.hwMarks !== undefined && a.hwMarks !== null) {
            batchMap[b].hwTotal += a.hwMarks * 10; // scale to 100
            batchMap[b].hwCount += 1;
          }
        }
      }
    });

    return Object.values(batchMap).map((item) => ({
      name: item.batchName,
      students: item.studentCount,
      examAvgPct: item.examCount ? Math.round(item.examTotalPct / item.examCount) : 0,
      attendanceRatePct: item.activityTotalCount
        ? Math.round((item.activityPresentCount / item.activityTotalCount) * 100)
        : 0,
      hwMasteryPct: item.hwCount ? Math.round(item.hwTotal / item.hwCount) : 0,
    }));
  }, [students, exams, activities]);

  // ----------------------------------------------------
  // 8. TOP STUDENT ACADEMIC LEADERBOARD
  // ----------------------------------------------------
  const topStudentsLeaderboard = useMemo(() => {
    return filteredStudents
      .map((student) => {
        const studentExams = exams.filter(
          (e) => e.studentSid === student.sid && e.status !== 'Absent' && e.obtainedMarks !== undefined && e.totalMarks > 0
        );
        const studentActs = activities.filter((a) => a.studentSid === student.sid);
        const presentActs = studentActs.filter((a) => a.status === 'Present');

        const examPct = studentExams.length
          ? Math.round(
              studentExams.reduce((sum, e) => sum + ((e.obtainedMarks || 0) / e.totalMarks) * 100, 0) /
                studentExams.length
            )
          : null;

        const attendancePct = studentActs.length
          ? Math.round((presentActs.length / studentActs.length) * 100)
          : null;

        const hwActs = presentActs.filter((a) => a.hwMarks !== undefined && a.hwMarks !== null);
        const hwAvg = hwActs.length
          ? Number((hwActs.reduce((sum, a) => sum + (a.hwMarks || 0), 0) / hwActs.length).toFixed(1))
          : null;

        // Composite Index
        const compositeScore =
          (examPct !== null ? examPct * 0.6 : 50) +
          (attendancePct !== null ? attendancePct * 0.2 : 50) +
          (hwAvg !== null ? hwAvg * 10 * 0.2 : 50);

        return {
          ...student,
          examAvg: examPct,
          examCount: studentExams.length,
          attendanceRate: attendancePct,
          hwAvg,
          compositeScore: Math.round(compositeScore),
        };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 6);
  }, [filteredStudents, exams, activities]);

  return (
    <div className="space-y-4 pb-10">
      {/* 1. Header & Dynamic Filters Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-emerald-400 text-white rounded-xl shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-display font-black tracking-tight text-white">
                Academic &amp; Financial Analytics Hub
              </h1>
            </div>
            <p className="text-xs text-slate-300 font-medium max-w-2xl">
              Comprehensive operational intelligence: Track student academic performance, tuition cashflow, examination scorecards, and continuous learning metrics.
            </p>
          </div>

          {/* Quick Nav Shortcut Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/admin/students"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Students</span>
            </Link>
            <Link
              href="/admin/tracking"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lessons</span>
            </Link>
            <Link
              href="/admin/exams"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
              <span>Exams</span>
            </Link>
            <Link
              href="/admin/payments"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Banknote className="w-3.5 h-3.5 text-teal-400" />
              <span>Payments</span>
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="Refresh Analytics Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Filter Controls Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Left: Batch Selector & Quick Chips */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <span className="text-[11px] font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1 shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              Batch:
            </span>

            {/* "All Batches" Quick Pill */}
            <button
              type="button"
              onClick={() => {
                setSelectedBatch('all');
                setIsBatchDropdownOpen(false);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                selectedBatch === 'all'
                  ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              All Batches ({activeStudents.length})
            </button>

            {/* Dropdown Selector for Any Number of Batches */}
            <div className="relative shrink-0" ref={batchDropdownRef}>
              <button
                type="button"
                onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedBatch !== 'all'
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/60 shadow-xs'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border-slate-700'
                }`}
                title="Select Academic Batch"
              >
                <Filter className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="max-w-[140px] truncate">
                  {selectedBatch === 'all' ? `Select Batch (${uniqueBatches.length})` : formatBatch(selectedBatch)}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-400 ${isBatchDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover Dropdown Panel */}
              {isBatchDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-64 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-50 p-2 space-y-1.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {/* Search bar when batches > 4 */}
                  {uniqueBatches.length > 4 && (
                    <div className="relative mb-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search batch (e.g. 2028)..."
                        value={batchSearchTerm}
                        onChange={(e) => setBatchSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="max-h-56 overflow-y-auto no-scrollbar space-y-1 pr-0.5">
                    {/* All Batches Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBatch('all');
                        setIsBatchDropdownOpen(false);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                        selectedBatch === 'all'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-semibold">All Batches</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/25 font-bold">
                        {activeStudents.length} students
                      </span>
                    </button>

                    {filteredDropdownBatches.length > 0 ? (
                      filteredDropdownBatches.map((b) => {
                        const count = batchStudentCounts[b] || 0;
                        const isSelected = selectedBatch === b;
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              setSelectedBatch(b);
                              setIsBatchDropdownOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <span className="font-semibold truncate">{formatBatch(b, 'HSC')}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold shrink-0 ${
                                isSelected ? 'bg-black/25 text-white' : 'bg-slate-800 text-indigo-300 border border-slate-700'
                              }`}
                            >
                              {count} {count === 1 ? 'student' : 'students'}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-3 text-center text-slate-500 text-[11px]">No matching batches found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Horizontal Scrollable Strip of Batch Chips (Never wraps to row 2!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5 min-w-0">
              {uniqueBatches.map((b) => {
                const isSelected = selectedBatch === b;
                const count = batchStudentCounts[b] || 0;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBatch(b)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span>{formatBatch(b, 'HSC')}</span>
                    <span className={`text-[10px] font-mono px-1 py-0.2 rounded-md font-bold ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-slate-700/80 text-slate-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Clear Filter Button if a batch is selected */}
            {selectedBatch !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedBatch('all')}
                className="p-1 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg shrink-0 transition-colors cursor-pointer"
                title="Reset batch filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Timeline Selector */}
          <div className="flex items-center gap-1.5 shrink-0 self-start md:self-auto bg-slate-800/90 p-0.5 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold px-2">Timeline:</span>
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: '30d', label: '30 Days' },
                { id: '90d', label: '90 Days' },
                { id: '6m', label: '6 Months' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === t.id
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Executive Metric Matrix Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Students */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-100/95 via-teal-50/80 to-emerald-100/80 border border-emerald-300/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider font-mono">
              Enrolled Students
            </span>
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-emerald-950 mt-1">
            {filteredStudents.length}
          </p>
          <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold mt-1 pt-1 border-t border-emerald-200/80">
            <span>{uniqueBatches.length} Active Batches</span>
            <span className="font-mono bg-emerald-200/80 px-1.5 py-0.2 rounded text-emerald-950">
              100% Verified
            </span>
          </div>
        </div>

        {/* Exam Score Index */}
        <div className="p-3.5 bg-gradient-to-br from-amber-100/95 via-orange-50/80 to-amber-100/80 border border-amber-300/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider font-mono">
              Exam Score Index
            </span>
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-2xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-2xl sm:text-3xl font-display font-black text-amber-950">
              {examStats.avgScorePct > 0 ? `${examStats.avgScorePct}%` : 'N/A'}
            </p>
            <span className="text-xs font-bold text-amber-800">avg</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-800 font-semibold mt-1 pt-1 border-t border-amber-200/80">
            <span>Peak: {examStats.highestScorePct}%</span>
            <span className="font-mono bg-amber-200/80 px-1.5 py-0.2 rounded text-amber-950">
              {examStats.totalEvaluated} Tests Logged
            </span>
          </div>
        </div>

        {/* Tuition Revenue Received */}
        <div className="p-3.5 bg-gradient-to-br from-teal-100/95 via-emerald-50/80 to-teal-100/80 border border-teal-300/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-teal-900 uppercase tracking-wider font-mono">
              Tuition Collected
            </span>
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-2xs">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-display font-black text-teal-950 mt-1 font-mono">
            ৳{totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center justify-between text-[10px] text-teal-800 font-semibold mt-1 pt-1 border-t border-teal-200/80">
            <span>{filteredPayments.length} Transactions</span>
            <span className="font-mono bg-teal-200/80 px-1.5 py-0.2 rounded text-teal-950">
              Avg ৳{avgPayment.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Daily Lesson Attendance & Homework */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-100/95 via-sky-50/80 to-indigo-100/80 border border-indigo-300/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider font-mono">
              Attendance &amp; HW
            </span>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-2xl sm:text-3xl font-display font-black text-indigo-950">
              {lessonStats.attendanceRate}%
            </p>
            <span className="text-xs font-bold text-indigo-800">present</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-indigo-800 font-semibold mt-1 pt-1 border-t border-indigo-200/80">
            <span>HW: {lessonStats.avgHwMarks}/10</span>
            <span className="font-mono bg-indigo-200/80 px-1.5 py-0.2 rounded text-indigo-950">
              {lessonStats.totalLessons} Sessions
            </span>
          </div>
        </div>
      </div>

      {/* 3. ROW 1 CHARTS: Financial Revenue & Monthly Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Monthly Revenue Bar + Line Composed Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                  Monthly Tuition Collections &amp; Inflow Trajectory
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Monthly fee collection amount (৳) and transaction frequency
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              Total ৳{totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="h-[280px] w-full">
            {isMounted && monthlyRevenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyRevenueChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `৳${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'Revenue') return [`৳${Number(value).toLocaleString()}`, 'Total Tuition'];
                      return [value, 'Transactions'];
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    name="Revenue"
                    fill="url(#revenueGrad)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={45}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    name="Transactions"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                <Banknote className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold">No payment history recorded for this filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Share by HSC Batch Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm">
                  Revenue by Batch
                </h3>
                <p className="text-[11px] text-slate-500">Distribution of tuition fee receipts</p>
              </div>
            </div>
          </div>

          <div className="h-[220px] w-full">
            {isMounted && revenueByBatchChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByBatchChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {revenueByBatchChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any) => [`৳${Number(value).toLocaleString()}`, 'Tuition Paid']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-xs">No batch revenue data</p>
              </div>
            )}
          </div>

          {/* Legend Badges */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
            {revenueByBatchChartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-50 border border-slate-200/60">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length] }}
                />
                <span className="font-bold text-slate-700 truncate">{item.name}</span>
                <span className="font-mono text-slate-900 font-black ml-auto">
                  ৳{item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ROW 2 CHARTS: Examination Analytics & Scorecard Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Exam Score Trajectory (Area Chart with Benchmarks) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                <LineChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                  Chronological Examination Score Trends (%)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Average score percentage progression across test dates with 80% distinction line
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Distinction (80%)
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pass (50%)
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {isMounted && examTrajectoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={examTrajectoryChartData}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="examScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    label={{ value: 'Distinction 80%', fill: '#059669', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#ea580c"
                    strokeDasharray="4 4"
                    label={{ value: 'Pass 50%', fill: '#ea580c', fontSize: 10, position: 'insideBottomRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(value: any) => [`${value}%`, 'Average Score']}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    name="Average Score"
                    stroke="#d97706"
                    strokeWidth={3}
                    fill="url(#examScoreGrad)"
                    dot={{ fill: '#d97706', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                <ClipboardList className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold">No exam scores logged in selected interval</p>
              </div>
            )}
          </div>
        </div>

        {/* Grade Tier Distribution (Bar Chart) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                  Score Grade Distribution
                </h3>
                <p className="text-xs text-slate-500 font-medium">Evaluation breakdown by grade band</p>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            {isMounted && examGradeDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={examGradeDistributionData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="grade"
                    tick={{ fontSize: 9.5, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any) => [val, 'Exam Attempts']}
                  />
                  <Bar dataKey="count" name="Exams" radius={[6, 6, 0, 0]}>
                    {examGradeDistributionData.map((entry, index) => {
                      let color = '#7c3aed';
                      if (entry.grade.includes('A+')) color = '#059669';
                      else if (entry.grade.includes('A (')) color = '#0284c7';
                      else if (entry.grade.includes('B (')) color = '#4f46e5';
                      else if (entry.grade.includes('C (')) color = '#d97706';
                      else if (entry.grade.includes('Needs')) color = '#ea580c';
                      else if (entry.grade.includes('Absent')) color = '#e11d48';

                      return <Cell key={`grade-cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-xs">No grade metrics available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. ROW 3 CHARTS: Daily Lessons, Homework (HW) vs Classwork (CW) & Batch Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Homework (HW) vs Classwork (CW) Mastery Trends */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                  Homework (HW) vs. Classwork (CW) Trends
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Average daily performance scores logged out of 10
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-amber-700 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                HW: {lessonStats.avgHwMarks}/10
              </span>
              <span className="flex items-center gap-1 text-sky-700 font-mono">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                CW: {lessonStats.avgCwMarks}/10
              </span>
            </div>
          </div>

          <div className="h-[270px] w-full">
            {isMounted && hwCwTrendsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hwCwTrendsChartData}
                  margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10.5, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}/10`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(val: any, name: any) => [
                      `${val} / 10`,
                      name === 'avgHw' ? 'Homework Avg' : 'Classwork Avg',
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgHw"
                    name="Homework (HW)"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 3.5 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgCw"
                    name="Classwork (CW)"
                    stroke="#0284c7"
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', r: 3.5 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                <BookOpen className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-bold">No continuous lesson logs found</p>
              </div>
            )}
          </div>
        </div>

        {/* Batch-by-Batch Multi-Metric Comparison */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                  Batch Academic Benchmark Matrix
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Comparative Exam Score %, Attendance Rate %, and HW Mastery %
                </p>
              </div>
            </div>
          </div>

          <div className="h-[270px] w-full">
            {isMounted && batchComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={batchComparisonData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                    formatter={(v: any) => [`${v}%`]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="examAvgPct"
                    name="Exam Score %"
                    fill="#7c3aed"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="attendanceRatePct"
                    name="Attendance %"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="hwMasteryPct"
                    name="HW Mastery %"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-xs">No multi-batch data to compare</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. ROW 4: Academic Leaderboard & Insights Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Top Academic Performers Leaderboard */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-xs">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                  Top Academic Performers (Overall Index)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Ranked by combined exam score %, attendance consistency, and homework completion
                </p>
              </div>
            </div>
            <Link
              href="/admin/students"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage All Students</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {topStudentsLeaderboard.length > 0 ? (
              topStudentsLeaderboard.map((student, idx) => (
                <div
                  key={student.sid}
                  onClick={() => onSelectStudent(student.sid)}
                  className="p-2.5 sm:p-3 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-2xs ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-orange-300 text-orange-950'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.2 rounded">
                          {student.sid}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                          {formatBatch(student.hscBatch, 'N/A')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        🎓 {student.college || 'College N/A'} • 📚 {student.subject || 'General'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-right">
                    <div className="hidden sm:block">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">Exams</span>
                      <span className="text-xs font-black font-mono text-slate-800">
                        {student.examAvg !== null ? `${student.examAvg}%` : '—'}
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">Attendance</span>
                      <span className="text-xs font-black font-mono text-slate-800">
                        {student.attendanceRate !== null ? `${student.attendanceRate}%` : '—'}
                      </span>
                    </div>

                    <div className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-2xs flex flex-col items-center justify-center">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-indigo-200 hidden sm:block">
                        Index
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono leading-none">
                        {student.compositeScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No student performance metrics</p>
            )}
          </div>
        </div>

        {/* Actionable Insights & Operations Hub */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-4 sm:p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-xs">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="font-display font-black text-white text-base">
                Operational Insights
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-indigo-100">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px] font-black text-amber-300">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    Overall Academic Health
                  </span>
                  <span>{examStats.avgScorePct >= 70 ? 'Optimal' : 'Attention'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Average exam score is currently at <strong className="text-white">{examStats.avgScorePct}%</strong> with a lesson attendance rate of <strong className="text-white">{lessonStats.attendanceRate}%</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px] font-black text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5" />
                    Cashflow Stability
                  </span>
                  <span>৳{totalRevenue.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Total of <strong className="text-white">{filteredPayments.length}</strong> tuition receipts recorded across <strong className="text-white">{uniqueBatches.length}</strong> active student batches.
                </p>
              </div>

              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/10 space-y-1 backdrop-blur-xs">
                <div className="flex items-center justify-between text-[11px] font-black text-sky-300">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Continuous HW Completion
                  </span>
                  <span>{lessonStats.avgHwMarks}/10</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Homework average across {lessonStats.totalLessons} recorded classroom sessions is <strong className="text-white">{lessonStats.avgHwMarks}</strong> out of 10.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-800/80">
            <Link
              href="/admin/students"
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <span>Enroll &amp; Manage Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
