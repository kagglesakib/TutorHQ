'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Exam } from '@/types';
import { TrendingUp, Trophy, Calendar, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ExamProgressChartProps {
  exams: Exam[];
}

export default function ExamProgressChart({ exams }: ExamProgressChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const attendedExams = [...exams]
    .filter((e) => e.status !== 'Absent' && e.obtainedMarks !== undefined && e.totalMarks > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (attendedExams.length === 0) {
    return null;
  }

  const chartData = attendedExams.map((e, index) => {
    const percentage = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
    const dateLabel = e.date ? e.date.substring(5) : `#${index + 1}`;
    return {
      name: dateLabel,
      topic: e.topic || e.subjectAndTopic || e.subject || 'Assessment',
      date: e.date,
      score: percentage,
      obtained: e.obtainedMarks,
      total: e.totalMarks,
    };
  });

  const avgScore = Math.round(
    chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length
  );
  const highestScore = Math.max(...chartData.map((d) => d.score));

  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/80 to-purple-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-2 border-indigo-200/90 dark:border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-md dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl relative overflow-hidden transition-all duration-200">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-64 h-32 bg-indigo-200/40 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200/80 dark:border-slate-800/90 pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-md dark:shadow-[0_0_15px_rgba(99,102,241,0.3)] shrink-0 border border-indigo-300 dark:border-indigo-400/30">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Score Progression Analytics <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
            </h4>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
              Continuous academic performance trajectory across evaluated examination milestones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-[10.5px] bg-white dark:bg-slate-900/90 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-mono font-bold px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Avg: <strong className="text-indigo-950 dark:text-white">{avgScore}%</strong>
          </span>
          <span className="text-[10.5px] bg-white dark:bg-slate-900/90 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-mono font-bold px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
            <Trophy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Peak: <strong className="text-emerald-950 dark:text-emerald-200">{highestScore}%</strong>
          </span>
        </div>
      </div>

      <div className="h-56 sm:h-64 w-full bg-white/90 dark:bg-slate-950/80 p-2 sm:p-3 rounded-2xl border border-indigo-200/80 dark:border-slate-800/80 relative z-10 shadow-2xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 15, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="cyberIndigoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: axisColor, fontWeight: 600 }}
              tickLine={false}
              stroke={axisColor}
            />
            <YAxis
              width={42}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fontSize: 10, fill: axisColor, fontWeight: 600 }}
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
              stroke={axisColor}
            />
            <ReferenceLine 
              y={80} 
              stroke="#10b981" 
              strokeDasharray="4 4" 
              label={{ value: 'Mastery (80%)', fill: isDark ? '#34d399' : '#059669', fontSize: 9, fontWeight: 700, position: 'insideTopRight' }} 
            />
            <ReferenceLine 
              y={50} 
              stroke="#64748b" 
              strokeDasharray="2 2" 
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isDistinction = data.score >= 80;
                  const isPass = data.score >= 50;
                  return (
                    <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1.5 border border-slate-700 backdrop-blur-xl min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                        <span className="font-extrabold text-cyan-300 truncate max-w-[130px]">{data.topic}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-black border uppercase tracking-wider ${
                          isDistinction 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-xs' 
                            : isPass 
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40' 
                            : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                        }`}>
                          {isDistinction ? 'Mastery (A+)' : isPass ? 'Proficient' : 'Needs Review'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Exam Date: <span className="text-slate-200">{data.date}</span>
                      </p>
                      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-4 font-mono">
                        <span className="text-slate-400 text-[10.5px]">Mark Result:</span>
                        <span className="font-extrabold text-indigo-300 text-xs">
                          {data.obtained} / {data.total} ({data.score}%)
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
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#cyberIndigoGrad)"
              dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: isDark ? '#c7d2fe' : '#ffffff' }}
              activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
