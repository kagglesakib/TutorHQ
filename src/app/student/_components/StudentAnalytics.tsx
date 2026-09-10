'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { Exam, Activity } from '@/types';

interface StudentAnalyticsProps {
  exams: Exam[];
  activities: Activity[];
}

export default function StudentAnalytics({ exams, activities }: StudentAnalyticsProps) {
  const [chartMode, setChartMode] = useState<'exams' | 'attendance'>('exams');

  // 1. Process Exam Progression Data
  const sortedExams = [...exams]
    .filter((e) => e.status === 'Present' && e.obtainedMarks !== undefined && e.totalMarks > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const examChartData = sortedExams.map((e, index) => {
    const percentage = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
    // Short label for X axis
    const dateLabel = e.date ? e.date.substring(5) : `#${index + 1}`;
    const topicLabel = e.subjectAndTopic.length > 18
      ? `${e.subjectAndTopic.slice(0, 18)}...`
      : e.subjectAndTopic;

    return {
      name: `${dateLabel} (${topicLabel})`,
      shortName: dateLabel,
      topic: e.subjectAndTopic,
      date: e.date,
      score: percentage,
      obtained: e.obtainedMarks,
      total: e.totalMarks,
    };
  });

  // Calculate average exam score & best score
  const avgScore = examChartData.length > 0
    ? Math.round(examChartData.reduce((acc, curr) => acc + curr.score, 0) / examChartData.length)
    : 0;
  const bestScore = examChartData.length > 0
    ? Math.max(...examChartData.map((d) => d.score))
    : 0;

  // 2. Process Monthly Attendance & Lesson Activity Data
  const monthlyDataMap: Record<string, { month: string; present: number; absent: number; total: number; hwAvg: number; hwCount: number; hwSum: number }> = {};

  activities.forEach((act) => {
    if (!act.date) return;
    const monthKey = act.date.substring(0, 7); // YYYY-MM
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = {
        month: monthKey,
        present: 0,
        absent: 0,
        total: 0,
        hwAvg: 0,
        hwCount: 0,
        hwSum: 0,
      };
    }
    monthlyDataMap[monthKey].total += 1;
    if (act.status?.toLowerCase() === 'present') {
      monthlyDataMap[monthKey].present += 1;
    } else {
      monthlyDataMap[monthKey].absent += 1;
    }

    if (act.hwMarks !== undefined && act.hwMarks !== null && !isNaN(Number(act.hwMarks))) {
      monthlyDataMap[monthKey].hwSum += Number(act.hwMarks);
      monthlyDataMap[monthKey].hwCount += 1;
    }
  });

  const attendanceChartData = Object.keys(monthlyDataMap)
    .sort()
    .map((mKey) => {
      const item = monthlyDataMap[mKey];
      const rate = item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
      const hwAvg = item.hwCount > 0 ? Math.round((item.hwSum / (item.hwCount * 10)) * 100) : null;
      return {
        month: item.month,
        attendanceRate: rate,
        presentCount: item.present,
        absentCount: item.absent,
        totalClasses: item.total,
        hwAvgScore: hwAvg ?? 0,
      };
    });

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-indigo-600 to-teal-600 text-white rounded-xl shadow-xs shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-black text-slate-900 text-base">
                Performance Analytics & Progress Charts
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full">
                Interactive Graph
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Visual tracking for test marks, score trajectory, and attendance rates</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl border border-slate-300 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('exams')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'exams'
                ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Exams Graph</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('attendance')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'attendance'
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Attendance Graph</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      {chartMode === 'exams' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Average Score</span>
              <span className="text-base sm:text-lg font-mono font-black text-amber-950">{avgScore}%</span>
            </div>
            <div className="p-2 bg-amber-200/80 text-amber-900 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Peak Score</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-950">{bestScore}%</span>
            </div>
            <div className="p-2 bg-emerald-200/80 text-emerald-900 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">Tests Assessed</span>
              <span className="text-base sm:text-lg font-mono font-black text-sky-950">{examChartData.length} Tests</span>
            </div>
            <div className="p-2 bg-sky-200/80 text-sky-900 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-base sm:text-lg font-mono font-black text-indigo-950">{activities.length}</span>
            </div>
            <div className="p-2 bg-indigo-200/80 text-indigo-900 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Months</span>
              <span className="text-base sm:text-lg font-mono font-black text-emerald-950">{attendanceChartData.length}</span>
            </div>
            <div className="p-2 bg-emerald-200/80 text-emerald-900 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Avg Attendance</span>
              <span className="text-base sm:text-lg font-mono font-black text-teal-950">
                {attendanceChartData.length > 0
                  ? Math.round(attendanceChartData.reduce((acc, c) => acc + c.attendanceRate, 0) / attendanceChartData.length)
                  : 100}%
              </span>
            </div>
            <div className="p-2 bg-teal-200/80 text-teal-900 rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Responsive Graph Container */}
      <div className="bg-white/80 p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {chartMode === 'exams' ? (
          examChartData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={examChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                            <p className="font-bold text-amber-300">{data.topic}</p>
                            <p className="text-[10px] text-slate-300 font-mono">Date: {data.date}</p>
                            <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-4">
                              <span className="text-slate-400">Score:</span>
                              <span className="font-mono font-bold text-amber-400">{data.obtained} / {data.total} ({data.score}%)</span>
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
                    stroke="#d97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#scoreGradient)"
                    dot={{ fill: '#b45309', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <Award className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">No graded exam data available for graph</p>
              <p className="text-[11px] text-slate-400">Once exam marks are recorded, your score progression curve will plot automatically</p>
            </div>
          )
        ) : (
          attendanceChartData.length > 0 ? (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                            <p className="font-bold text-indigo-300">Month: {data.month}</p>
                            <div className="pt-1 border-t border-slate-700 space-y-0.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Attendance:</span>
                                <span className="font-mono font-bold text-emerald-400">{data.attendanceRate}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400">Classes:</span>
                                <span className="font-mono text-slate-200">{data.presentCount} present / {data.totalClasses}</span>
                              </div>
                              {data.hwAvgScore > 0 && (
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-slate-400">Avg HW Marks:</span>
                                  <span className="font-mono font-bold text-amber-400">{data.hwAvgScore}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar
                    dataKey="attendanceRate"
                    name="Attendance %"
                    fill="#4f46e5"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="hwAvgScore"
                    name="HW Avg %"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <BarChart3 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-500">No session attendance data recorded yet</p>
              <p className="text-[11px] text-slate-400">Monthly attendance rates will display here as classes are conducted</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
