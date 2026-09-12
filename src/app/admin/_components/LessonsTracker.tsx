'use client';

import React, { useState } from 'react';
import { Student, Activity } from '@/types';
import { BookOpen, Plus, Trash2, Edit2, Check, X, Calendar, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
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

  // New activity form state
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    date: new Date().toISOString().slice(0, 10),
    status: 'Present',
    subjectTuitioned: student.subject || '',
    hwMarks: 10,
    cwMarks: 10,
    comment: '',
  });

  // Edit activity state
  const [editFormData, setEditFormData] = useState<Activity | null>(null);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const act: Activity = {
      aid: generateActivityId(),
      studentSid: student.sid,
      date: newActivity.date || new Date().toISOString().slice(0, 10),
      status: newActivity.status || 'Present',
      subjectTuitioned: newActivity.subjectTuitioned || student.subject || 'General Study',
      hwMarks: newActivity.hwMarks !== undefined ? Number(newActivity.hwMarks) : undefined,
      cwMarks: newActivity.cwMarks !== undefined ? Number(newActivity.cwMarks) : undefined,
      comment: newActivity.comment || '',
    };
    onAddActivity(act);
    setIsAdding(false);
    setNewActivity({
      date: new Date().toISOString().slice(0, 10),
      status: 'Present',
      subjectTuitioned: student.subject || '',
      hwMarks: 10,
      cwMarks: 10,
      comment: '',
    });
  };

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

  // Sort activities newest first
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-slate-100/95 rounded-2xl border border-slate-300 p-3 sm:p-4 space-y-3 shadow-2xs">
      {/* Header Bar - Perfectly responsive alignment without text clipping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-300/90 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs shrink-0">
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
                Daily Study &amp; Lesson Logs
              </h3>
              <span className="text-[9.5px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-full">
                {activities.length} {activities.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate mt-0.5">
              Record attendance, topics covered, and marks
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="self-start sm:self-auto px-3.5 py-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20 shrink-0 active:scale-95 border border-white/20"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">Log Lesson Record</span>
        </button>
      </div>

      {/* Log Daily Lesson Record Modal */}
      <LogDailyLessonModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        student={student}
        onAddActivity={onAddActivity}
      />

      {/* Activity List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto no-scrollbar pr-0.5">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((act) => {
            const isEditingThis = editingAid === act.aid;

            if (isEditingThis && editFormData) {
              return (
                <div
                  key={act.aid}
                  className="bg-white border-2 border-indigo-400/90 ring-4 ring-indigo-500/10 rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-lg transition-all animate-in fade-in duration-150"
                >
                  {/* Detailed Edit Window Header */}
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

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Date Field */}
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

                    {/* Attendance Status Field */}
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

                    {/* Subject & Topic Covered (Full Width) */}
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all"
                      />
                    </div>

                    {/* Homework Marks (HW) */}
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
                        className="w-full px-3 py-2 bg-amber-50/50 border border-amber-300 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-xs font-mono font-bold text-amber-950 placeholder:text-amber-400 transition-all"
                      />
                    </div>

                    {/* Classwork Marks (CW) */}
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
                        className="w-full px-3 py-2 bg-sky-50/50 border border-sky-300 focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-xs font-mono font-bold text-sky-950 placeholder:text-sky-400 transition-all"
                      />
                    </div>

                    {/* Teacher Remarks & Notes (Full Width) */}
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all"
                      />
                    </div>
                  </div>

                  {/* Actions Footer */}
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

            return (
              <div
                key={act.aid}
                className="p-2.5 sm:p-3 bg-white hover:bg-indigo-50/40 border border-slate-200/90 hover:border-indigo-300 rounded-xl flex items-center justify-between gap-2 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-black bg-indigo-50 text-indigo-900 border border-indigo-200 px-1.5 py-0.5 rounded shadow-2xs">
                    {formatAid(act.aid)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                    <Calendar className="w-2.5 h-2.5 text-slate-500" />
                    {act.date}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      act.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}
                  >
                    {act.status}
                  </span>
                  {act.subjectTuitioned && (
                    <span className="font-bold text-slate-900 bg-slate-100/90 border border-slate-200 px-2 py-0.5 rounded text-[11px] truncate max-w-[200px] sm:max-w-[260px]">
                      {act.subjectTuitioned}
                    </span>
                  )}
                  {(act.hwMarks !== undefined || act.cwMarks !== undefined) && (
                    <div className="flex items-center gap-1 text-[10px]">
                      {act.hwMarks !== undefined && (
                        <span className="bg-amber-50 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          HW: {act.hwMarks}
                        </span>
                      )}
                      {act.cwMarks !== undefined && (
                        <span className="bg-sky-50 text-sky-950 border border-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          CW: {act.cwMarks}
                        </span>
                      )}
                    </div>
                  )}
                  {act.comment && (
                    <span className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded italic truncate max-w-[160px] sm:max-w-[220px]">
                      &ldquo;{act.comment}&rdquo;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(act)}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteActivity(act.aid)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-slate-500 space-y-1 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-xs font-bold text-slate-800">No lesson activities logged yet</p>
            <p className="text-[10px] text-slate-500">Click &ldquo;Log Lesson Record&rdquo; to add daily attendance and marks</p>
          </div>
        )}
      </div>
    </div>
  );
}
