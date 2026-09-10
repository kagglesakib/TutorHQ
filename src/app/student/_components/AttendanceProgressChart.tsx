'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Activity } from '@/types';
import { BarChart3, CheckCircle2 } from 'lucide-react';

interface AttendanceProgressChartProps {
  activities: Activity[];
}

export default function AttendanceProgressChart({ activities }: AttendanceProgressChartProps) {
  const monthlyDataMap: Record<string, { month: string; present: number; absent: number; total: number; hwSum: number; hwCount: number }> = {};

  activities.forEach((act) => {
    if (!act.date) return;
    const monthKey = act.date.substring(0, 7); // YYYY-MM
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = {
        month: monthKey,
        present: 0,
        absent: 0,
        total: 0,
        hwSum: 0,
        hwCount: 0,
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

  const chartData = Object.keys(monthlyDataMap)
    .sort()
    .map((mKey) => {
      const item = monthlyDataMap[mKey];
      const rate = item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
      const hwAvg = item.hwCount > 0 ? Math.round((item.hwSum / (item.hwCount * 10)) * 100) : 0;
      return {
        month: item.month,
        attendanceRate: rate,
        presentCount: item.present,
        totalClasses: item.total,
        hwAvgScore: hwAvg,
      };
    });

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-indigo-950">
              Monthly Attendance & Task Execution
            </h4>
            <p className="text-[10px] text-indigo-800 font-medium">
              Attendance consistency and homework performance per month
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[10px] bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono font-bold px-2 py-0.5 rounded-md">
            {chartData.length} Active Months
          </span>
        </div>
      </div>

      <div className="h-48 sm:h-56 w-full bg-white/70 p-2 rounded-xl border border-indigo-100">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: '#3730a3' }}
              tickLine={false}
              axisLine={{ stroke: '#c7d2fe' }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#3730a3' }}
              tickFormatter={(val) => `${val}%`}
              tickLine={false}
              axisLine={{ stroke: '#c7d2fe' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1 border border-slate-700">
                      <p className="font-bold text-indigo-300">Month: {data.month}</p>
                      <div className="pt-1 border-t border-slate-700 space-y-0.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Attendance:</span>
                          <span className="font-mono font-bold text-emerald-400">{data.attendanceRate}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-slate-400">Classes:</span>
                          <span className="font-mono text-slate-200">{data.presentCount} / {data.totalClasses}</span>
                        </div>
                        {data.hwAvgScore > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-400">HW Score:</span>
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
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
            <Bar
              dataKey="attendanceRate"
              name="Attendance %"
              fill="#4f46e5"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="hwAvgScore"
              name="HW Avg %"
              fill="#059669"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
