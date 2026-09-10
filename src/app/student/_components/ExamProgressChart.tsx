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
import { TrendingUp, Award, Calendar } from 'lucide-react';

interface ExamProgressChartProps {
  exams: Exam[];
}

export default function ExamProgressChart({ exams }: ExamProgressChartProps) {
  const attendedExams = [...exams]
    .filter((e) => e.status === 'Present' && e.obtainedMarks !== undefined && e.totalMarks > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (attendedExams.length === 0) {
    return null;
  }

  const chartData = attendedExams.map((e, index) => {
    const percentage = Math.round(((e.obtainedMarks || 0) / e.totalMarks) * 100);
    const dateLabel = e.date ? e.date.substring(5) : `#${index + 1}`;
    return {
      name: dateLabel,
      topic: e.subjectAndTopic,
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

  return (
    <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-600 text-white rounded-lg shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-950">
              Exam Performance Trajectory
            </h4>
            <p className="text-[10px] text-amber-800 font-medium">
              Continuous score progression over recent assessments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold px-2 py-0.5 rounded-md">
            Avg: {avgScore}%
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold px-2 py-0.5 rounded-md">
            Peak: {highestScore}%
          </span>
        </div>
      </div>

      <div className="h-52 sm:h-60 w-full bg-white/70 p-2 rounded-xl border border-amber-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 15, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="amberScoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#78350f', fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: '#fcd34d' }}
            />
            <YAxis
              width={42}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fontSize: 10, fill: '#78350f', fontWeight: 600 }}
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
              axisLine={{ stroke: '#fcd34d' }}
            />
            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target 80%', fill: '#047857', fontSize: 9, fontWeight: 'bold', position: 'insideTopRight' }} />
            <ReferenceLine y={40} stroke="#f43f5e" strokeDasharray="2 2" label={{ value: 'Pass 40%', fill: '#be123c', fontSize: 9, fontWeight: 'bold', position: 'insideBottomRight' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isPass = data.score >= 40;
                  const isDistinction = data.score >= 80;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1.5 border border-slate-700 min-w-[180px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1">
                        <span className="font-bold text-amber-300">{data.topic}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black ${
                          isDistinction ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : isPass ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isDistinction ? 'Excellence' : isPass ? 'Pass' : 'Needs Work'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono">Exam Date: {data.date}</p>
                      <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-4 font-mono">
                        <span className="text-slate-400">Obtained:</span>
                        <span className="font-bold text-amber-400">
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
              stroke="#d97706"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#amberScoreGrad)"
              dot={{ fill: '#b45309', r: 4, strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 6, stroke: '#d97706', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
