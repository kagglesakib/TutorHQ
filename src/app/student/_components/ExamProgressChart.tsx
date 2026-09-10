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

      <div className="h-48 sm:h-56 w-full bg-white/70 p-2 rounded-xl border border-amber-100">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="amberScoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#78350f' }}
              tickLine={false}
              axisLine={{ stroke: '#fcd34d' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#78350f' }}
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
              axisLine={{ stroke: '#fcd34d' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                      <p className="font-bold text-amber-300">{data.topic}</p>
                      <p className="text-[10px] text-slate-300 font-mono">Date: {data.date}</p>
                      <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-4">
                        <span className="text-slate-400">Score:</span>
                        <span className="font-mono font-bold text-amber-400">
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
              dot={{ fill: '#b45309', r: 3.5, strokeWidth: 1.5, stroke: '#ffffff' }}
              activeDot={{ r: 5, stroke: '#d97706', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
