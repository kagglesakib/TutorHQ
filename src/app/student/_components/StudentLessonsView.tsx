'use client';

import React, { useState, useMemo } from 'react';
import { Student, Activity } from '@/types';
import { 
  BookOpen, Calendar, Clock, CheckCircle2, XCircle, Search, 
  Award, GraduationCap, ShieldCheck, Sparkles, Filter 
} from 'lucide-react';
import { formatAid } from '@/utils/id';

interface StudentLessonsViewProps {
  student?: Student;
  activities?: Activity[];
}

export default function StudentLessonsView({
  student,
  activities = [],
}: StudentLessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'topic' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter activities
  const studentActivities = useMemo(() => {
    return activities.filter((act) => {
      // Text search
      const matchesSearch =
        !searchTerm ||
        act.subjectTuitioned?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.aid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date or Month filters
      const matchesDate = !filterDate || act.date === filterDate;
      const matchesMonth = !filterMonth || (act.date && act.date.startsWith(filterMonth));

      return matchesSearch && matchesDate && matchesMonth;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'topic') {
        comparison = (a.subjectTuitioned || '').localeCompare(b.subjectTuitioned || '');
      } else if (sortBy === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [activities, searchTerm, filterDate, filterMonth, sortBy, sortOrder]);

  // Telemetry Aggregates
  const totalLogs = activities.length;
  const presentCount = activities.filter((a) => a.status === 'Present').length;
  const absentCount = activities.filter((a) => a.status === 'Absent').length;
  const attendanceRate = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 100;

  // Average HW & CW score calculations
  const activitiesWithHw = activities.filter((a) => a.hwMarks !== undefined && a.hwMarks !== null);
  const avgHw = activitiesWithHw.length > 0
    ? Number((activitiesWithHw.reduce((acc, curr) => acc + (curr.hwMarks || 0), 0) / activitiesWithHw.length).toFixed(1))
    : null;

  const activitiesWithCw = activities.filter((a) => a.cwMarks !== undefined && a.cwMarks !== null);
  const avgCw = activitiesWithCw.length > 0
    ? Number((activitiesWithCw.reduce((acc, curr) => acc + (curr.cwMarks || 0), 0) / activitiesWithCw.length).toFixed(1))
    : null;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto animate-fadeIn" id="student-lessons-view-panel">
      {/* Top Identity & Telemetry Header Card */}
      <div className="bg-gradient-to-br from-emerald-100/95 via-teal-100/80 to-indigo-100/90 rounded-2xl p-3.5 sm:p-5 border-2 border-emerald-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/40 via-emerald-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-200/40 via-teal-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-md shadow-emerald-600/20 shrink-0 border border-white/40">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-slate-900 text-base sm:text-lg tracking-tight">
                  Academic Curriculum & Lesson Logs
                </h1>
                <span className="text-[10px] bg-emerald-200/90 text-emerald-950 font-mono font-black px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs shrink-0">
                  Study Timeline
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 font-medium">
                Comprehensive activity timeline, homework assessments, and daily attendance breakdown.
              </p>
            </div>
          </div>

          {/* Attendance Overall Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-400/40 shrink-0">
            <div className="p-1 bg-white/20 rounded-md shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-emerald-100 font-mono block leading-none">
                Attendance Rate
              </span>
              <span className="text-sm sm:text-base font-black font-mono leading-tight">
                {attendanceRate}%
              </span>
            </div>
          </div>
        </div>

        {/* 5 Distinct Telemetry Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
          {/* Total Lessons */}
          <div className="bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-emerald-900 uppercase tracking-wider block">
              Total Lessons
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 block mt-0.5">
              {totalLogs} Sessions
            </span>
          </div>

          {/* Present */}
          <div className="bg-teal-100/90 p-2.5 rounded-xl border border-teal-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-teal-900 uppercase tracking-wider block">
              Attended
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-teal-950 block mt-0.5">
              {presentCount} Days
            </span>
          </div>

          {/* Absent */}
          <div className="bg-rose-100/90 p-2.5 rounded-xl border border-rose-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-rose-900 uppercase tracking-wider block">
              Absences
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-rose-950 block mt-0.5">
              {absentCount} Days
            </span>
          </div>

          {/* Avg Homework */}
          <div className="bg-amber-100/90 p-2.5 rounded-xl border border-amber-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-amber-900 uppercase tracking-wider block">
              Avg Homework
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-amber-950 block mt-0.5">
              {avgHw !== null ? `${avgHw}/10` : '—'}
            </span>
          </div>

          {/* Avg Classwork */}
          <div className="bg-indigo-100/90 p-2.5 rounded-xl border border-indigo-300/90 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[9px] font-mono font-bold text-indigo-900 uppercase tracking-wider block">
              Avg Classwork
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-indigo-950 block mt-0.5">
              {avgCw !== null ? `${avgCw}/10` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar with Colored Background Surfaces */}
      <div className="bg-gradient-to-r from-emerald-200/80 via-teal-100/90 to-indigo-100/90 border border-emerald-300/90 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Text Search */}
          <div className="relative flex items-center bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:border-teal-500 shadow-2xs transition-all">
            <div className="p-1 bg-teal-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Search className="w-2.5 h-2.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topic or remarks..."
              className="w-full bg-transparent text-xs font-semibold text-teal-950 placeholder:text-teal-700/60 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-teal-200 hover:bg-teal-300 text-teal-900 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative flex items-center bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 border border-sky-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-sky-500/40 focus-within:border-sky-500 shadow-2xs transition-all min-w-0">
            <div className="p-1 bg-sky-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Calendar className="w-2.5 h-2.5" />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setFilterMonth('');
              }}
              className="w-full bg-transparent text-xs font-semibold text-sky-950 focus:outline-hidden cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="ml-1 text-[10px] font-black bg-sky-200 hover:bg-sky-300 text-sky-900 px-1.5 py-0.5 rounded cursor-pointer shrink-0 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div className="relative flex items-center bg-gradient-to-r from-purple-50 via-violet-50 to-purple-50 border border-purple-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-purple-500/40 focus-within:border-purple-500 shadow-2xs transition-all min-w-0">
            <div className="p-1 bg-purple-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Clock className="w-2.5 h-2.5" />
            </div>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setFilterDate('');
              }}
              className="w-full bg-transparent text-xs font-semibold text-purple-950 focus:outline-hidden cursor-pointer"
            />
            {filterMonth && (
              <button
                onClick={() => setFilterMonth('')}
                className="ml-1 text-[10px] font-black bg-purple-200 hover:bg-purple-300 text-purple-900 px-1.5 py-0.5 rounded cursor-pointer shrink-0 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Sort & Status summary bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-emerald-300/70 text-xs">
          <span className="text-[11px] font-bold text-emerald-950 font-mono bg-emerald-200/90 border border-emerald-300 px-2.5 py-0.5 rounded-lg shadow-2xs self-start sm:self-auto">
            Showing {studentActivities.length} of {totalLogs} records
          </span>
          <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-1 flex-1 sm:flex-initial min-w-0">
              <label className="text-[11px] font-bold text-emerald-950 mr-0.5 font-mono shrink-0">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8 px-2.5 bg-emerald-100 hover:bg-emerald-200/90 border border-emerald-400/90 rounded-lg text-xs font-bold text-emerald-950 focus:outline-hidden cursor-pointer shadow-2xs transition-colors flex-1 sm:flex-initial"
              >
                <option value="date">Date</option>
                <option value="topic">Topic</option>
                <option value="status">Status</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="h-8 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border border-emerald-500 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-98 shrink-0"
            >
              {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Activity Timeline List with Maximum Element Background Color */}
      {studentActivities.length > 0 ? (
        <div className="space-y-2.5">
          {studentActivities.map((act, index) => {
            const isAbsent = act.status === 'Absent';
            const hasHw = act.hwMarks !== undefined && act.hwMarks !== null;
            const hasCw = act.cwMarks !== undefined && act.cwMarks !== null;

            return (
              <div 
                key={act.aid ? `${act.aid}-${index}` : `act-${index}`}
                className={`border-2 rounded-xl p-3 sm:p-3.5 transition-all shadow-2xs hover:shadow-xs space-y-2.5 ${
                  isAbsent 
                    ? 'bg-gradient-to-r from-rose-100/70 via-orange-50/80 to-rose-50 border-rose-300' 
                    : 'bg-gradient-to-r from-teal-50 via-emerald-50/90 to-indigo-50 border-teal-200 hover:border-teal-400'
                }`}
              >
                {/* Top Header Bar: Date, AID, Attendance Badge */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-200/70">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold font-mono text-indigo-950 bg-indigo-100/90 border border-indigo-300 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      {act.date}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-teal-950 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-teal-700 shrink-0" />
                      {formatAid(act.aid)}
                    </span>
                  </div>

                  <span className={`px-3 py-1 rounded-md text-xs font-black border flex items-center gap-1.5 shrink-0 shadow-xs ${
                    isAbsent 
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-400' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400'
                  }`}>
                    {isAbsent ? <XCircle className="w-3.5 h-3.5 text-rose-200" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />}
                    {act.status}
                  </span>
                </div>

                {/* Lesson Details & Scores */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                  {/* Topic Box with Colored Background */}
                  <div className="flex-1 min-w-0 bg-gradient-to-r from-indigo-100/90 via-purple-100/60 to-teal-100/80 border border-indigo-200/90 p-2.5 rounded-xl shadow-2xs flex items-start gap-2.5">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg shrink-0 shadow-2xs mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-indigo-900 uppercase tracking-wider font-mono block">
                        Curriculum Topic
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug break-words">
                        {isAbsent ? (
                          <span className="text-slate-500 italic font-medium">Session conducted in student absence</span>
                        ) : (
                          act.subjectTuitioned || 'General Session'
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* Evaluation Scores (HW & CW) with distinct colored badges */}
                  {!isAbsent ? (
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      <div className="bg-gradient-to-br from-amber-200/90 via-amber-100 to-orange-100 border border-amber-300 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-amber-950 font-mono flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-700" /> HW:
                        </span>
                        <span className="text-xs font-black font-mono text-amber-950 bg-amber-300/80 px-1.5 py-0.5 rounded-md shadow-2xs">
                          {hasHw ? act.hwMarks!.toFixed(1) : '—'}
                        </span>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-200/90 via-indigo-100 to-purple-100 border border-indigo-300 px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-indigo-950 font-mono flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-indigo-700" /> CW:
                        </span>
                        <span className="text-xs font-black font-mono text-indigo-950 bg-indigo-300/80 px-1.5 py-0.5 rounded-md shadow-2xs">
                          {hasCw ? act.cwMarks!.toFixed(1) : '—'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 bg-gradient-to-r from-rose-200/90 to-red-100 border border-rose-300 rounded-xl text-xs text-rose-950 font-black italic shadow-2xs shrink-0">
                      No Marks (Absent)
                    </div>
                  )}
                </div>

                {/* Teacher Remarks (if any) with warm colored background */}
                {act.comment && (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <div className="bg-gradient-to-r from-amber-100 via-yellow-100/80 to-amber-50 border border-amber-300/90 text-amber-950 text-xs px-3 py-2 rounded-xl shadow-2xs flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span className="italic leading-relaxed font-semibold">"{act.comment}"</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-slate-500 border-2 border-dashed border-emerald-300 rounded-2xl bg-gradient-to-br from-emerald-100/60 via-teal-50 to-indigo-100/60 shadow-2xs space-y-2">
          <div className="p-3 bg-emerald-200 text-emerald-800 rounded-xl w-11 h-11 mx-auto flex items-center justify-center border border-emerald-300 shadow-2xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-extrabold text-slate-900">No Lesson Logs Found</p>
            <p className="text-[11px] text-slate-600 font-medium">No activity entries match your current search or filter parameters.</p>
          </div>
        </div>
      )}
    </div>
  );
}
