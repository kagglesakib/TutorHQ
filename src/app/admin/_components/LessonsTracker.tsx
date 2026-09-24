'use client';

import React, { useState, useMemo } from 'react';
import { Student, Activity } from '@/types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Search,
  LayoutGrid,
  LayoutList,
  Award,
  Sparkles,
  ArrowUpDown,
  ClipboardList,
  FileText
} from 'lucide-react';
import { generateActivityId, formatAid } from '@/utils/id';
import LogDailyLessonModal from './LogDailyLessonModal';

interface LessonsTrackerProps {
  student: Student;
  activities: Activity[];
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (aid: string) => void;
  onUpdateActivity: (activity: Activity) => void;
}

export default function LessonsTracker({
  student,
  activities,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
}: LessonsTrackerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAid, setEditingAid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'hw' | 'cw'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Edit activity state
  const [editFormData, setEditFormData] = useState<Activity | null>(null);

  // Telemetry Calculations
  const totalLogs = activities.length;
  const presentCount = useMemo(() => activities.filter((a) => a.status === 'Present').length, [activities]);
  const absentCount = useMemo(() => activities.filter((a) => a.status === 'Absent').length, [activities]);
  const attendanceRate = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 0;

  const hwActivities = useMemo(() => activities.filter((a) => typeof a.hwMarks === 'number' && !isNaN(a.hwMarks)), [activities]);
  const avgHw = hwActivities.length > 0 ? (hwActivities.reduce((acc, curr) => acc + (curr.hwMarks || 0), 0) / hwActivities.length).toFixed(1) : null;

  const cwActivities = useMemo(() => activities.filter((a) => typeof a.cwMarks === 'number' && !isNaN(a.cwMarks)), [activities]);
  const avgCw = cwActivities.length > 0 ? (cwActivities.reduce((acc, curr) => acc + (curr.cwMarks || 0), 0) / cwActivities.length).toFixed(1) : null;

  // Filter & Search
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        act.aid?.toLowerCase().includes(term) ||
        act.subjectTuitioned?.toLowerCase().includes(term) ||
        act.comment?.toLowerCase().includes(term) ||
        act.date?.includes(term);

      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Present' && act.status === 'Present') ||
        (filterStatus === 'Absent' && act.status === 'Absent');

      return matchesSearch && matchesStatus;
    });
  }, [activities, searchTerm, filterStatus]);

  // Sort
  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'hw') {
        const hwA = a.hwMarks ?? -1;
        const hwB = b.hwMarks ?? -1;
        comparison = hwA - hwB;
      } else if (sortBy === 'cw') {
        const cwA = a.cwMarks ?? -1;
        const cwB = b.cwMarks ?? -1;
        comparison = cwA - cwB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredActivities, sortBy, sortOrder]);

  const handleStartEdit = (act: Activity) => {
    setEditingAid(act.aid);
    setEditFormData({ ...act });
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdateActivity(editFormData);
      setEditingAid(null);
      setEditFormData(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 animate-fadeIn" id="student-detail-lessons-tracker">
      {/* 1. Header Card with Telemetry */}
      <div className="bg-gradient-to-br from-indigo-100/95 via-sky-100/80 to-purple-100/90 rounded-2xl p-3.5 sm:p-4 border-2 border-indigo-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-indigo-200/40 via-purple-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-200/80 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white rounded-xl shadow-md shadow-indigo-600/20 shrink-0 border border-white/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-slate-900 text-sm sm:text-base tracking-tight">
                  Daily Study &amp; Lesson Logs
                </h3>
                <span className="text-[10px] bg-indigo-200/90 text-indigo-950 font-mono font-black px-2 py-0.5 rounded-md border border-indigo-300 shadow-2xs shrink-0">
                  {student.name}
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 font-medium">
                Attendance records, topics taught, homework &amp; classwork marks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Attendance Rate Pill */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white px-3 py-1.5 rounded-xl shadow-md shadow-indigo-600/20 border border-indigo-400/40 shrink-0">
              <Award className="w-3.5 h-3.5 text-indigo-200" />
              <div>
                <span className="text-[8px] uppercase tracking-wider text-indigo-200 font-mono block leading-none">
                  Attendance
                </span>
                <span className="text-xs sm:text-sm font-black font-mono leading-tight">
                  {attendanceRate}%
                </span>
              </div>
            </div>

            {/* Log Lesson button */}
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer border border-white/40 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Log Lesson</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
          <div className="bg-indigo-100/90 p-2 rounded-xl border border-indigo-300/90 shadow-2xs">
            <span className="text-[8.5px] font-mono font-bold text-indigo-900 uppercase tracking-wider block">
              Total Lessons
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-indigo-950 block mt-0.5">
              {totalLogs} Classes
            </span>
          </div>

          <div className="bg-emerald-100/90 p-2 rounded-xl border border-emerald-300/90 shadow-2xs">
            <span className="text-[8.5px] font-mono font-bold text-emerald-900 uppercase tracking-wider block">
              Present
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-950 block mt-0.5">
              {presentCount} Days ({attendanceRate}%)
            </span>
          </div>

          <div className="bg-amber-100/90 p-2 rounded-xl border border-amber-300/90 shadow-2xs">
            <span className="text-[8.5px] font-mono font-bold text-amber-900 uppercase tracking-wider block">
              Avg Homework
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-amber-950 block mt-0.5">
              {avgHw !== null ? `${avgHw} / 10` : '—'}
            </span>
          </div>

          <div className="bg-sky-100/90 p-2 rounded-xl border border-sky-300/90 shadow-2xs">
            <span className="text-[8.5px] font-mono font-bold text-sky-900 uppercase tracking-wider block">
              Avg Classwork
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-sky-950 block mt-0.5">
              {avgCw !== null ? `${avgCw} / 10` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Log Daily Lesson Record Modal */}
      <LogDailyLessonModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        student={student}
        onAddActivity={onAddActivity}
      />

      {/* 2. Search, Filter & View Mode Controls */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-emerald-50/80 p-3 sm:p-3.5 rounded-2xl border-2 border-indigo-200/90 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.14)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 transition-all">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <div className="relative flex items-center bg-white border-2 border-indigo-200/90 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-500/20 rounded-xl px-2.5 py-1.5 shadow-2xs transition-all">
            <div className="p-1 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg shrink-0 mr-2 shadow-2xs">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search topic, lesson ID, remarks, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-slate-900 placeholder:text-indigo-900/40 focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md cursor-pointer transition-colors shadow-2xs shrink-0 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter, Sort & View Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end w-full md:w-auto min-w-0">
          {/* Status Filter Segment */}
          <div className="flex items-center bg-white/95 p-1 rounded-xl border border-indigo-200/90 shadow-2xs gap-1 flex-1 sm:flex-initial max-w-full overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterStatus('All')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 ${
                filterStatus === 'All'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-[0_2px_8px_rgba(79,70,229,0.35)]'
                  : 'text-indigo-900/80 hover:text-indigo-950 hover:bg-indigo-50/80'
              }`}
            >
              <Sparkles className={`w-3 h-3 shrink-0 ${filterStatus === 'All' ? 'text-amber-300' : 'text-indigo-500'}`} />
              <span>All</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                  filterStatus === 'All' ? 'bg-indigo-800/80 text-white' : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {activities.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('Present')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 ${
                filterStatus === 'Present'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50/80'
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 shrink-0 ${filterStatus === 'Present' ? 'text-emerald-200' : 'text-emerald-500'}`} />
              <span>Present</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                  filterStatus === 'Present' ? 'bg-emerald-700/80 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activities.filter((a) => a.status !== 'Absent').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('Absent')}
              className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 rounded-lg text-[10px] sm:text-[10.5px] font-black transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shrink-0 ${
                filterStatus === 'Absent'
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_2px_8px_rgba(244,63,94,0.35)]'
                  : 'text-rose-800 hover:text-rose-950 hover:bg-rose-50/80'
              }`}
            >
              <XCircle className={`w-3 h-3 shrink-0 ${filterStatus === 'Absent' ? 'text-rose-200' : 'text-rose-500'}`} />
              <span>Absent</span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                  filterStatus === 'Absent' ? 'bg-rose-700/80 text-white' : 'bg-rose-100 text-rose-800'
                }`}
              >
                {activities.filter((a) => a.status === 'Absent').length}
              </span>
            </button>
          </div>

          {/* Group Sort + View Switcher to ensure no overflow */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-xl border border-indigo-200/90 shadow-2xs shrink-0">
              <div className="p-1 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-md shadow-2xs">
                <ArrowUpDown className="w-3 h-3" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-[11px] font-extrabold text-slate-800 focus:outline-none cursor-pointer tracking-wide"
              >
                <option value="date">Date</option>
                <option value="hw">HW Score</option>
                <option value="cw">CW Score</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="text-[10px] font-mono font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-2 py-0.5 rounded-md cursor-pointer transition-all shadow-2xs active:scale-95 flex items-center gap-1 shrink-0"
                title="Toggle Sort Direction"
              >
                <span>{sortOrder.toUpperCase()}</span>
                <span className="text-[10px] font-black">{sortOrder === 'asc' ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* View Mode Switcher (Cards / Table) */}
            <div className="flex bg-white/95 p-1 rounded-xl border border-indigo-200/90 shadow-2xs gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-[0_2px_8px_rgba(79,70,229,0.35)]'
                    : 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/80'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-[0_2px_8px_rgba(79,70,229,0.35)]'
                    : 'text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50/80'
                }`}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lessons Content: Card View (Default) or Table View */}
      {viewMode === 'cards' ? (
        /* CARD VIEW GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto no-scrollbar pr-0.5">
          {sortedActivities.length > 0 ? (
            sortedActivities.map((act) => {
              const isEditingThis = editingAid === act.aid;
              const isAbsent = act.status === 'Absent';

              if (isEditingThis && editFormData) {
                return (
                  <div
                    key={act.aid}
                    className="sm:col-span-2 bg-white border-2 border-indigo-400/90 ring-4 ring-indigo-500/10 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-lg transition-all animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-indigo-950 font-display">
                            Editing Lesson Record
                          </span>
                          <span className="ml-2 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                            {formatAid(act.aid)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAid(null)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Cancel Edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-indigo-600" />
                          <span>Lesson Date</span>
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          {editFormData.status === 'Present' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <span>Attendance Status</span>
                        </label>
                        <select
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-xl text-xs font-bold transition-all ${
                            editFormData.status === 'Present'
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 focus:ring-2 focus:ring-emerald-500/20'
                              : 'bg-rose-50/80 border-rose-300 text-rose-950 focus:ring-2 focus:ring-rose-500/20'
                          }`}
                        >
                          <option value="Present">✓ Present</option>
                          <option value="Absent">✕ Absent</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-indigo-600" />
                          <span>Subject &amp; Chapter / Topic Covered</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Chemistry – Environmental Chemistry – Revision"
                          value={editFormData.subjectTuitioned || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, subjectTuitioned: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-amber-900 uppercase tracking-wider block mb-1 flex items-center justify-between">
                          <span>Homework Marks (HW)</span>
                          <span className="text-[9px] font-mono text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded">
                            Max: 10
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 8.5"
                          value={editFormData.hwMarks ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              hwMarks: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-mono font-bold text-amber-950 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-black text-sky-900 uppercase tracking-wider block mb-1 flex items-center justify-between">
                          <span>Classwork Marks (CW)</span>
                          <span className="text-[9px] font-mono text-sky-700 font-bold bg-sky-100 px-1.5 py-0.2 rounded">
                            Max: 10
                          </span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 9.0"
                          value={editFormData.cwMarks ?? ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              cwMarks: e.target.value === '' ? undefined : Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-sky-50/50 border border-sky-300 focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-xs font-mono font-bold text-sky-950 transition-all"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10.5px] font-black text-slate-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-indigo-600" />
                          <span>Teacher Remarks &amp; Observations</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Attentive, finished class practice on time."
                          value={editFormData.comment || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-semibold text-slate-900 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setEditingAid(null)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                );
              }

              const isPresent = !isAbsent;
              const hwNum = typeof act.hwMarks === 'number' ? act.hwMarks : (act.hwMarks !== undefined && act.hwMarks !== null && act.hwMarks !== 'null' ? Number(act.hwMarks) : null);
              const cwNum = typeof act.cwMarks === 'number' ? act.cwMarks : (act.cwMarks !== undefined && act.cwMarks !== null && act.cwMarks !== 'null' ? Number(act.cwMarks) : null);
              const isHwNull = hwNum === null || isNaN(hwNum);
              const isCwNull = cwNum === null || isNaN(cwNum);

              return (
                <div
                  key={act.aid}
                  className={`group relative rounded-2xl p-3.5 sm:p-4 transition-all duration-300 flex flex-col justify-between gap-3.5 border-2 min-w-0 overflow-hidden ${
                    isPresent
                      ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-300 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.32)] hover:border-emerald-500 hover:-translate-y-0.5'
                      : 'bg-gradient-to-br from-rose-50/90 via-pink-50/40 to-white border-rose-300 shadow-[0_4px_20px_-4px_rgba(244,63,94,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(244,63,94,0.32)] hover:border-rose-500 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Subtle glowing corner */}
                  <div
                    className={`absolute -top-1 -right-1 w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-80 ${
                      isPresent ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  />

                  {/* Card Header: 2 Clean Rows to Guarantee Zero Overlap & Strict Margin Containment */}
                  <div className="space-y-2 border-b border-indigo-100/80 pb-2.5 relative z-10 min-w-0">
                    {/* Row 1: ID on left, Attendance Status on right */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-white bg-indigo-600 px-2.5 py-0.5 rounded-lg shadow-[0_2px_6px_rgba(79,70,229,0.3)] flex items-center gap-1.5 min-w-0 max-w-[130px] sm:max-w-[170px]">
                        <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="truncate">{formatAid(act.aid)}</span>
                      </span>

                      <span
                        className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-xs tracking-wide flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                          isAbsent
                            ? 'bg-rose-500 text-white border-rose-400 shadow-[0_2px_8px_rgba(244,63,94,0.35)]'
                            : 'bg-emerald-500 text-white border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
                        }`}
                      >
                        {isAbsent ? (
                          <XCircle className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                        )}
                        <span>{act.status}</span>
                      </span>
                    </div>

                    {/* Row 2: Date on left, Edit & Delete actions on right */}
                    <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
                      <span className="text-[10px] font-bold text-slate-700 font-mono flex items-center gap-1.5 bg-white border border-indigo-200/80 px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                        <Calendar className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span>{act.date}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(act)}
                          className="p-1.5 text-indigo-700 hover:text-white bg-indigo-100 hover:bg-indigo-600 border border-indigo-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_8px_rgba(99,102,241,0.3)] active:scale-95"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteActivity(act.aid)}
                          className="p-1.5 text-rose-700 hover:text-white bg-rose-100 hover:bg-rose-600 border border-rose-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_8px_rgba(244,63,94,0.3)] active:scale-95"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Topic Covered Section */}
                  <div className="bg-gradient-to-br from-indigo-50/90 via-sky-50/60 to-white border border-indigo-200/90 rounded-xl p-3 space-y-1.5 relative z-10 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-extrabold text-indigo-700 uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Topic &amp; Study Coverage</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-extrabold text-slate-900 leading-snug break-words">
                      {isAbsent ? (
                        <span className="text-slate-400 italic font-normal">No Lesson Conducted (Absent)</span>
                      ) : (
                        act.subjectTuitioned || 'General Study Session'
                      )}
                    </div>
                  </div>

                  {/* Marks Badges Section */}
                  {!isAbsent ? (
                    <div className="grid grid-cols-2 gap-2.5 relative z-10">
                      {/* Homework */}
                      <div className="bg-gradient-to-br from-amber-50 via-amber-100/50 to-white border-2 border-amber-300/90 rounded-xl p-2.5 shadow-[0_2px_10px_-2px_rgba(245,158,11,0.2)] hover:border-amber-400 transition-all">
                        <div className="flex items-center justify-between text-[10px] font-black text-amber-900 uppercase tracking-wide mb-1">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-600" />
                            HW
                          </span>
                          <span className="text-[8.5px] text-amber-700 font-mono">Homework</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-mono font-black text-amber-950">
                            {isHwNull ? (
                              <span className="text-slate-400 font-bold text-xs not-italic">N/A</span>
                            ) : (
                              <span>{hwNum}<span className="text-xs text-amber-700 font-medium">/10</span></span>
                            )}
                          </span>
                          {!isHwNull && (
                            <span className="text-[9px] font-mono font-extrabold text-amber-900 bg-amber-200/90 border border-amber-300 px-1.5 py-0.2 rounded-md">
                              {Math.round(((hwNum as number) / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Classwork */}
                      <div className="bg-gradient-to-br from-sky-50 via-cyan-100/50 to-white border-2 border-sky-300/90 rounded-xl p-2.5 shadow-[0_2px_10px_-2px_rgba(14,165,233,0.2)] hover:border-sky-400 transition-all">
                        <div className="flex items-center justify-between text-[10px] font-black text-sky-900 uppercase tracking-wide mb-1">
                          <span className="flex items-center gap-1">
                            <ClipboardList className="w-3 h-3 text-sky-600" />
                            CW
                          </span>
                          <span className="text-[8.5px] text-sky-700 font-mono">Classwork</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-mono font-black text-sky-950">
                            {isCwNull ? (
                              <span className="text-slate-400 font-bold text-xs not-italic">N/A</span>
                            ) : (
                              <span>{cwNum}<span className="text-xs text-sky-700 font-medium">/10</span></span>
                            )}
                          </span>
                          {!isCwNull && (
                            <span className="text-[9px] font-mono font-extrabold text-sky-900 bg-sky-200/90 border border-sky-300 px-1.5 py-0.2 rounded-md">
                              {Math.round(((cwNum as number) / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-bold italic flex items-center justify-center gap-1.5 relative z-10">
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Absent — No Marks Logged</span>
                    </div>
                  )}

                  {/* Remarks / Comments Section */}
                  {act.comment && (
                    <div className="text-xs text-purple-950 italic bg-gradient-to-r from-purple-50 via-fuchsia-50/40 to-white border border-purple-200/90 rounded-xl p-2.5 flex items-start gap-2 shadow-[0_2px_8px_-2px_rgba(168,85,247,0.18)] relative z-10">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-2">&ldquo;{act.comment}&rdquo;</span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 py-8 text-center text-slate-500 border-2 border-dashed border-indigo-300 rounded-2xl bg-gradient-to-br from-indigo-100/60 via-purple-50 to-teal-100/60 shadow-2xs space-y-2">
              <div className="p-2.5 bg-indigo-200 text-indigo-800 rounded-xl w-10 h-10 mx-auto flex items-center justify-center border border-indigo-300 shadow-2xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-slate-900">No Lesson Records Found</p>
                <p className="text-[11px] text-slate-600 font-medium">No lesson entries match your filter or search.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW (ALTERNATIVE) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-mono text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">ID</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Topic Covered</th>
                  <th className="p-2.5 text-center">HW (10)</th>
                  <th className="p-2.5 text-center">CW (10)</th>
                  <th className="p-2.5">Teacher Remarks</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {sortedActivities.length > 0 ? (
                  sortedActivities.map((act) => (
                    <tr key={act.aid} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="p-2.5 font-mono text-indigo-900 font-bold">{formatAid(act.aid)}</td>
                      <td className="p-2.5 font-mono text-slate-600 whitespace-nowrap">{act.date}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            act.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">{act.subjectTuitioned || '—'}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-amber-900">
                        {act.hwMarks !== undefined ? act.hwMarks : '—'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-sky-900">
                        {act.cwMarks !== undefined ? act.cwMarks : '—'}
                      </td>
                      <td className="p-2.5 text-slate-600 italic truncate max-w-xs">{act.comment || '—'}</td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(act)}
                            className="p-1 text-indigo-700 hover:bg-indigo-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteActivity(act.aid)}
                            className="p-1 text-rose-700 hover:bg-rose-100 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No lesson entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

