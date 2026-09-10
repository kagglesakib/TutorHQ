'use client';

import React, { useState } from 'react';
import { Student, Activity } from '@/types';
import { BookOpen, Calendar, Search, CheckCircle2, Clock } from 'lucide-react';
import { formatAid } from '@/utils/id';

interface StudentLessonsViewProps {
  student: Student;
  activities: Activity[];
}

export default function StudentLessonsView({ student, activities }: StudentLessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivities = activities.filter(
    (a) =>
      (a.subjectTuitioned && a.subjectTuitioned.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.aid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.comment && a.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedActivities = [...filteredActivities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const presentCount = activities.filter(a => a.status === 'Present').length;
  const attendancePercentage = activities.length > 0 ? Math.round((presentCount / activities.length) * 100) : 100;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-slate-900 text-base sm:text-lg">
                  Daily Study Logs & Attendance
                </h2>
                <span className="text-[10px] bg-indigo-100 text-indigo-900 border border-indigo-300 font-mono font-bold px-2 py-0.5 rounded-full">
                  {activities.length} Logs
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Attendance history, homework marks, and classwork reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold block leading-tight">Attendance</span>
                <span className="text-xs font-mono font-black text-indigo-900">{attendancePercentage}%</span>
              </div>
            </div>

            <div className="relative bg-white rounded-xl border border-slate-300 p-1 flex items-center focus-within:ring-2 focus-within:ring-indigo-500">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topic or log..."
                className="py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-2">
          {sortedActivities.length > 0 ? (
            sortedActivities.map((act) => (
              <div
                key={act.aid}
                className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-lg">
                    {formatAid(act.aid)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-100 px-1.5 py-0.2 rounded">
                    <Calendar className="w-3 h-3" />
                    {act.date}
                  </span>
                  <span className="font-bold text-slate-900 text-xs truncate max-w-[240px]">
                    {act.subjectTuitioned || 'Study Session'}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      act.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {act.status}
                  </span>
                  {act.comment && (
                    <span className="text-[10px] text-slate-500 italic truncate max-w-[160px]">
                      &ldquo;{act.comment}&rdquo;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {act.hwMarks !== undefined && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg font-mono font-bold text-[11px]">
                      HW: {act.hwMarks}/10
                    </span>
                  )}
                  {act.cwMarks !== undefined && (
                    <span className="bg-sky-100 text-sky-900 border border-sky-300 px-2 py-0.5 rounded-lg font-mono font-bold text-[11px]">
                      CW: {act.cwMarks}/10
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 space-y-1">
              <p className="text-sm font-bold text-slate-500">No lesson logs found</p>
              <p className="text-xs text-slate-400">Class activity logs will appear here once recorded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
