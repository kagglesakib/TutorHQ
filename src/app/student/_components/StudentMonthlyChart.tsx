'use client';

import React, { useState, useMemo } from 'react';
import { Student, Activity, Exam, Payment } from '@/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, ReferenceLine } from 'recharts';
import { TrendingUp, Award, BookOpen, CheckCircle, Calendar, BarChart3 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface StudentMonthlyChartProps {
  student?: Student;
  activities?: Activity[];
  exams?: Exam[];
  payments?: Payment[];
  onViewProfileClick?: () => void;
}

interface MonthlyStat {
  monthKey: string;     // e.g. "2025-01"
  displayMonth: string; // e.g. "Jan 2025"
  shortMonth: string;   // e.g. "Jan"
  totalLessons: number;
  attendedLessons: number;
  attendanceRate: number; // percentage (0 - 100)
  avgHwScore: number | null;
  avgCwScore: number | null;
  examCount: number;
  avgExamPct: number | null;
  bestExamPct: number | null;
  feesPaid: number;
}

export default function StudentMonthlyChart({
  student,
  activities = [],
  exams = [],
  payments = [],
}: StudentMonthlyChartProps) {
  const [metric, setMetric] = useState<'attendance' | 'exams' | 'homework' | 'all'>('all');
  const [timeframe, setTimeframe] = useState<'6m' | '12m'>('12m');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Compute 12-month timeline statistics dynamically
  const monthlyData: MonthlyStat[] = useMemo(() => {
    const now = new Date();
    const monthCount = timeframe === '6m' ? 6 : 12;
    const months: { key: string; display: string; short: string; year: number; month: number }[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = d.getMonth() + 1;
      const key = `${year}-${String(monthNum).padStart(2, '0')}`;
      const short = d.toLocaleString('en-US', { month: 'short' });
      const display = `${short} ${year}`;
      months.push({ key, display, short, year, month: monthNum });
    }

    return months.map((m) => {
      // Filter activities for this month
      const monthActivities = activities.filter((a) => {
        if (!a.date) return false;
        return a.date.startsWith(m.key);
      });

      const totalLessons = monthActivities.length;
      const attendedLessons = monthActivities.filter((a) => a.status === 'Present').length;
      const attendanceRate = totalLessons > 0 ? Math.round((attendedLessons / totalLessons) * 100) : 0;

      // Filter activities with HW / CW marks
      const hwActivities = monthActivities.filter((a) => a.hwMarks !== undefined && a.hwMarks !== null);
      const avgHwScore = hwActivities.length > 0
        ? Number((hwActivities.reduce((acc, curr) => acc + (curr.hwMarks || 0), 0) / hwActivities.length).toFixed(1))
        : null;

      const cwActivities = monthActivities.filter((a) => a.cwMarks !== undefined && a.cwMarks !== null);
      const avgCwScore = cwActivities.length > 0
        ? Number((cwActivities.reduce((acc, curr) => acc + (curr.cwMarks || 0), 0) / cwActivities.length).toFixed(1))
        : null;

      // Filter exams for this month
      const monthExams = exams.filter((e) => {
        if (!e.date) return false;
        return e.date.startsWith(m.key);
      });

      const validExams = monthExams.filter((e) => e.status !== 'Absent' && e.totalMarks > 0);
      const examCount = monthExams.length;

      let avgExamPct: number | null = null;
      let bestExamPct: number | null = null;

      if (validExams.length > 0) {
        const percentages = validExams.map((e) => Math.round(((e.obtainedMarks ?? 0) / e.totalMarks) * 100));
        avgExamPct = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
        bestExamPct = Math.max(...percentages);
      }

      // Filter payments for this month
      const monthPayments = payments.filter((p) => {
        if (!p.date) return false;
        return p.date.startsWith(m.key);
      });
      const feesPaid = monthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

      return {
        monthKey: m.key,
        displayMonth: m.display,
        shortMonth: m.short,
        totalLessons,
        attendedLessons,
        attendanceRate,
        avgHwScore,
        avgCwScore,
        examCount,
        avgExamPct,
        bestExamPct,
        feesPaid,
      };
    });
  }, [activities, exams, payments, timeframe]);

  // Aggregate highlights across the active window
  const activeStats = useMemo(() => {
    const totalLessons = monthlyData.reduce((acc, m) => acc + m.totalLessons, 0);
    const totalAttended = monthlyData.reduce((acc, m) => acc + m.attendedLessons, 0);
    const overallAttendance = totalLessons > 0 ? Math.round((totalAttended / totalLessons) * 100) : 0;

    const monthsWithExams = monthlyData.filter((m) => m.avgExamPct !== null);
    const overallAvgExam = monthsWithExams.length > 0
      ? Math.round(monthsWithExams.reduce((acc, m) => acc + (m.avgExamPct || 0), 0) / monthsWithExams.length)
      : null;

    const totalExams = monthlyData.reduce((acc, m) => acc + m.examCount, 0);
    const totalFees = monthlyData.reduce((acc, m) => acc + m.feesPaid, 0);

    return {
      totalLessons,
      overallAttendance,
      overallAvgExam,
      totalExams,
      totalFees,
    };
  }, [monthlyData]);

  // Chart theme configurations
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#94a3b8' : '#64748b';
  const targetLineColor = isDark ? '#34d399' : '#059669';

  // Chart custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload as MonthlyStat | undefined;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700 dark:border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs space-y-2 min-w-[200px]">
          <div className="border-b border-slate-700/80 dark:border-slate-800 pb-1 flex items-center justify-between">
            <span className="font-extrabold text-indigo-300 font-mono">{dataPoint?.displayMonth || label}</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">Monthly Ledger</span>
          </div>
          
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="font-medium text-slate-300">{entry.name}:</span>
                </span>
                <span className="font-mono font-black text-white">
                  {entry.value !== null && entry.value !== undefined
                    ? `${entry.value}${entry.unit || ''}`
                    : 'N/A'}
                </span>
              </div>
            ))}
          </div>

          {dataPoint && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] space-y-0.5 text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Lessons Attended:</span>
                <span className="font-bold text-emerald-400">{dataPoint.attendedLessons} / {dataPoint.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Exams:</span>
                <span className="font-bold text-purple-300">{dataPoint.examCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fees Paid:</span>
                <span className="font-bold text-amber-300">৳{dataPoint.feesPaid}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/80 to-emerald-50/90 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-indigo-950/40 rounded-2xl p-3 sm:p-4 border-2 border-indigo-200/90 dark:border-indigo-500/30 shadow-md dark:shadow-[0_0_25px_rgba(99,102,241,0.1)] space-y-3 transition-all duration-200" id="student-monthly-chart-card">
      {/* Header bar: Title & Timeframe controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-indigo-200/80 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-teal-600 text-white rounded-xl shadow-2xs shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-black text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5">
              Monthly Academic & Attendance Analytics
              <span className="text-[9px] bg-indigo-200/90 dark:bg-indigo-950/90 text-indigo-950 dark:text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded-md border border-indigo-300 dark:border-indigo-500/40 shadow-2xs">
                Real-Time
              </span>
            </h3>
            <p className="text-[10px] text-indigo-900/80 dark:text-slate-300 font-medium">
              Track attendance trends, exam performance, and class participation across {timeframe === '6m' ? 'the past 6 months' : 'the last 12 months'}.
            </p>
          </div>
        </div>

        {/* Action Controls: Metric filter pills & Timeframe switch */}
        <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          {/* Metric Selector */}
          <div className="flex items-center bg-indigo-100/90 dark:bg-slate-950/90 p-0.5 rounded-xl border border-indigo-300/80 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => setMetric('all')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                metric === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs'
                  : 'text-indigo-950 dark:text-slate-300 hover:bg-indigo-200/70 dark:hover:bg-slate-800'
              }`}
            >
              All Trends
            </button>
            <button
              onClick={() => setMetric('attendance')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                metric === 'attendance'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xs'
                  : 'text-indigo-950 dark:text-slate-300 hover:bg-indigo-200/70 dark:hover:bg-slate-800'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setMetric('exams')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                metric === 'exams'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-950 dark:text-slate-300 hover:bg-indigo-200/70 dark:hover:bg-slate-800'
              }`}
            >
              Exams
            </button>
            <button
              onClick={() => setMetric('homework')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                metric === 'homework'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xs'
                  : 'text-indigo-950 dark:text-slate-300 hover:bg-indigo-200/70 dark:hover:bg-slate-800'
              }`}
            >
              HW / CW
            </button>
          </div>

          {/* Timeframe Toggle */}
          <div className="flex items-center bg-teal-100/90 dark:bg-slate-950/90 p-0.5 rounded-xl border border-teal-300/80 dark:border-slate-800 shadow-2xs">
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                timeframe === '6m' ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-2xs' : 'text-teal-950 dark:text-slate-300 hover:bg-teal-200/70 dark:hover:bg-slate-800'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeframe('12m')}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                timeframe === '12m' ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-2xs' : 'text-teal-950 dark:text-slate-300 hover:bg-teal-200/70 dark:hover:bg-slate-800'
              }`}
            >
              12M
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Total Lessons */}
        <div className="bg-indigo-100/90 dark:bg-indigo-950/40 p-2 sm:p-2.5 rounded-xl border border-indigo-300/90 dark:border-indigo-500/30 shadow-2xs flex items-center justify-between transition-all">
          <div>
            <span className="text-[9px] font-mono font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
              Lessons Conducted
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-indigo-950 dark:text-indigo-100">
              {activeStats.totalLessons}
            </span>
          </div>
          <div className="p-1.5 bg-indigo-200/90 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-lg shrink-0 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Overall Attendance */}
        <div className="bg-emerald-100/90 dark:bg-emerald-950/40 p-2 sm:p-2.5 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 shadow-2xs flex items-center justify-between transition-all">
          <div>
            <span className="text-[9px] font-mono font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
              Attendance Avg
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 dark:text-emerald-100">
              {activeStats.overallAttendance}%
            </span>
          </div>
          <div className="p-1.5 bg-emerald-200/90 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-lg shrink-0 shadow-2xs">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Avg Exam Score */}
        <div className="bg-purple-100/90 dark:bg-purple-950/40 p-2 sm:p-2.5 rounded-xl border border-purple-300/90 dark:border-purple-500/30 shadow-2xs flex items-center justify-between transition-all">
          <div>
            <span className="text-[9px] font-mono font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider block">
              Average Exam Mark
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-purple-950 dark:text-purple-100">
              {activeStats.overallAvgExam !== null ? `${activeStats.overallAvgExam}%` : 'N/A'}
            </span>
          </div>
          <div className="p-1.5 bg-purple-200/90 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 rounded-lg shrink-0 shadow-2xs">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Exams Evaluated */}
        <div className="bg-amber-100/90 dark:bg-amber-950/40 p-2 sm:p-2.5 rounded-xl border border-amber-300/90 dark:border-amber-500/30 shadow-2xs flex items-center justify-between transition-all">
          <div>
            <span className="text-[9px] font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              Exams Completed
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-amber-950 dark:text-amber-100">
              {activeStats.totalExams}
            </span>
          </div>
          <div className="p-1.5 bg-amber-200/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-lg shrink-0 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Responsive Recharts Container */}
      <div className="bg-gradient-to-br from-white/90 via-indigo-50/40 to-emerald-50/40 dark:from-slate-950/90 dark:via-slate-900/80 dark:to-slate-950/90 p-2 sm:p-3 rounded-xl border border-indigo-200/80 dark:border-slate-800 shadow-2xs transition-all">
        <div className="h-60 sm:h-68 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metric === 'all' || metric === 'attendance' ? (
              <AreaChart data={monthlyData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="examGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="hwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis 
                  dataKey="shortMonth" 
                  tickLine={false} 
                  stroke={axisStroke} 
                  fontSize={10} 
                  fontWeight={700} 
                />
                <YAxis 
                  width={42}
                  domain={[0, 100]} 
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tickLine={false} 
                  stroke={axisStroke} 
                  fontSize={10} 
                  fontWeight={700}
                  tickFormatter={(v) => `${v}%`}
                />
                <ReferenceLine y={80} stroke={targetLineColor} strokeDasharray="3 3" label={{ value: 'Target 80%', fill: targetLineColor, fontSize: 9, fontWeight: 'bold', position: 'insideTopRight' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={32} 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: isDark ? '#e2e8f0' : '#334155' }} 
                />
                
                {(metric === 'all' || metric === 'attendance') && (
                  <Area
                    type="monotone"
                    dataKey="attendanceRate"
                    name="Attendance Rate"
                    unit="%"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#attendanceGradient)"
                    dot={{ fill: '#10b981', r: 3.5, strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                    activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                  />
                )}

                {metric === 'all' && (
                  <Area
                    type="monotone"
                    dataKey="avgExamPct"
                    name="Avg Exam Mark"
                    unit="%"
                    stroke="#818cf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#examGradient)"
                    dot={{ fill: '#818cf8', r: 3.5, strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                    activeDot={{ r: 5, stroke: '#818cf8', strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            ) : metric === 'exams' ? (
              <BarChart data={monthlyData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="shortMonth" tickLine={false} stroke={axisStroke} fontSize={10} fontWeight={700} />
                <YAxis width={42} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickLine={false} stroke={axisStroke} fontSize={10} fontWeight={700} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={80} stroke={targetLineColor} strokeDasharray="3 3" label={{ value: 'Target 80%', fill: targetLineColor, fontSize: 9, fontWeight: 'bold', position: 'insideTopRight' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: isDark ? '#e2e8f0' : '#334155' }} />
                <Bar dataKey="avgExamPct" name="Average Exam Mark" unit="%" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bestExamPct" name="Top Exam Mark" unit="%" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              /* HW / CW Chart */
              <AreaChart data={monthlyData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="hwArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cwArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="shortMonth" tickLine={false} stroke={axisStroke} fontSize={10} fontWeight={700} />
                <YAxis width={35} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} stroke={axisStroke} fontSize={10} fontWeight={700} />
                <ReferenceLine y={8} stroke="#d97706" strokeDasharray="3 3" label={{ value: 'Pass 8/10', fill: '#d97706', fontSize: 9, fontWeight: 'bold', position: 'insideTopRight' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: isDark ? '#e2e8f0' : '#334155' }} />
                <Area type="monotone" dataKey="avgHwScore" name="Avg Homework (10)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#hwArea)" dot={{ fill: '#f59e0b', r: 3.5, strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#fff' }} />
                <Area type="monotone" dataKey="avgCwScore" name="Avg Classwork (10)" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#cwArea)" dot={{ fill: '#06b6d4', r: 3.5, strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#fff' }} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12-Month Ledger Breakdown (Scrollable or Grid) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-black uppercase text-indigo-950 dark:text-indigo-300 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-700 dark:text-indigo-400" />
            Monthly Performance Table Breakdown
          </span>
          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">
            {monthlyData.length} billing cycles evaluated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
          {monthlyData.map((m) => (
            <div
              key={m.monthKey}
              className="bg-gradient-to-br from-indigo-100/90 via-sky-100/80 to-purple-100/80 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-indigo-950/40 p-2 rounded-xl border border-indigo-200/90 dark:border-slate-800 dark:hover:border-indigo-500/40 shadow-2xs space-y-1 transition-all"
            >
              <div className="flex items-center justify-between border-b border-indigo-200/80 dark:border-slate-800 pb-0.5">
                <span className="text-[10px] font-black font-mono text-indigo-950 dark:text-white">{m.shortMonth}</span>
                <span className={`text-[8px] font-extrabold px-1 rounded ${
                  m.attendanceRate >= 80 
                    ? 'bg-emerald-200 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-500/40' 
                    : m.attendanceRate >= 50 
                    ? 'bg-amber-200 text-amber-950 dark:bg-amber-950/80 dark:text-amber-300 dark:border dark:border-amber-500/40' 
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {m.attendanceRate}% Att.
                </span>
              </div>
              <div className="text-[10px] space-y-0.5 text-slate-800 dark:text-slate-300 font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-600 dark:text-slate-400">Lessons:</span>
                  <span className="font-mono font-bold dark:text-white">{m.attendedLessons}/{m.totalLessons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-600 dark:text-slate-400">Exam:</span>
                  <span className="font-mono font-bold dark:text-white">{m.avgExamPct !== null ? `${m.avgExamPct}%` : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-slate-600 dark:text-slate-400">Paid:</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">৳{m.feesPaid}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
