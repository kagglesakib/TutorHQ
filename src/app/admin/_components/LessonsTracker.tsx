'use client';

import React, { useState } from 'react';
import { Student, Activity } from '@/types';
import { BookOpen, Plus, Trash2, Edit2, Check, X, Calendar, Award } from 'lucide-react';
import { generateActivityId, formatAid } from '@/utils/id';

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
    <div className="bg-slate-100/95 rounded-2xl border border-slate-300 p-2 sm:p-3 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-300/90 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-2xs shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">Daily Study & Lesson Logs</h3>
            <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate">Record attendance, topics covered, and marks</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">{isAdding ? 'Cancel' : 'Log Lesson'}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreateActivity} className="p-3 bg-indigo-100/90 border border-indigo-300 rounded-2xl space-y-2.5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-indigo-950">Date *</label>
              <input
                type="date"
                required
                value={newActivity.date}
                onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                className="w-full px-2.5 py-1 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-indigo-950">Attendance Status</label>
              <select
                value={newActivity.status}
                onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value })}
                className="w-full px-2.5 py-1 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-indigo-950">Topic / Subject</label>
              <input
                type="text"
                value={newActivity.subjectTuitioned}
                onChange={(e) => setNewActivity({ ...newActivity, subjectTuitioned: e.target.value })}
                placeholder="e.g. Vectors & Kinetics"
                className="w-full px-2.5 py-1 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950 placeholder-indigo-600/70"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-indigo-950">HW Marks (out of 10)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newActivity.hwMarks ?? ''}
                onChange={(e) => setNewActivity({ ...newActivity, hwMarks: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-2.5 py-1 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-indigo-950">CW Marks (out of 10)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newActivity.cwMarks ?? ''}
                onChange={(e) => setNewActivity({ ...newActivity, cwMarks: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-2.5 py-1 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-indigo-950">Notes / Remarks</label>
              <input
                type="text"
                value={newActivity.comment}
                onChange={(e) => setNewActivity({ ...newActivity, comment: e.target.value })}
                placeholder="Optional notes..."
                className="w-full px-2.5 py-1 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-950 placeholder-indigo-600/70"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Save Lesson Entry
            </button>
          </div>
        </form>
      )}

      {/* Activity List */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((act) => {
            const isEditingThis = editingAid === act.aid;

            if (isEditingThis && editFormData) {
              return (
                <div key={act.aid} className="p-2.5 bg-indigo-100/90 border border-indigo-300 rounded-xl space-y-2 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded text-xs font-medium text-indigo-950"
                    />
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded text-xs font-medium text-indigo-950"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <input
                      type="text"
                      value={editFormData.subjectTuitioned || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, subjectTuitioned: e.target.value })}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded text-xs font-medium text-indigo-950"
                    />
                    <input
                      type="number"
                      placeholder="HW"
                      value={editFormData.hwMarks ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, hwMarks: Number(e.target.value) })}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded text-xs font-medium text-indigo-950"
                    />
                    <input
                      type="number"
                      placeholder="CW"
                      value={editFormData.cwMarks ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cwMarks: Number(e.target.value) })}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded text-xs font-medium text-indigo-950"
                    />
                    <input
                      type="text"
                      placeholder="Comment"
                      value={editFormData.comment || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-300 rounded text-xs font-medium text-indigo-950"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingAid(null)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={act.aid}
                className="p-2.5 bg-indigo-100/50 hover:bg-indigo-100/80 border border-indigo-200/90 hover:border-indigo-400 rounded-xl flex items-center justify-between gap-2 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-black bg-indigo-200 text-indigo-950 border border-indigo-400 px-1.5 py-0.5 rounded shadow-2xs">
                    {formatAid(act.aid)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-800 bg-slate-200/80 border border-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-slate-600" />
                    {act.date}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      act.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-rose-100 text-rose-950 border-rose-300'
                    }`}
                  >
                    {act.status}
                  </span>
                  {act.subjectTuitioned && (
                    <span className="font-bold text-blue-950 bg-blue-100/90 border border-blue-300 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[180px]">
                      {act.subjectTuitioned}
                    </span>
                  )}
                  {(act.hwMarks !== undefined || act.cwMarks !== undefined) && (
                    <div className="flex items-center gap-1 text-[10px]">
                      {act.hwMarks !== undefined && (
                        <span className="bg-amber-100 text-amber-950 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          HW: {act.hwMarks}
                        </span>
                      )}
                      {act.cwMarks !== undefined && (
                        <span className="bg-sky-100 text-sky-950 border border-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">
                          CW: {act.cwMarks}
                        </span>
                      )}
                    </div>
                  )}
                  {act.comment && (
                    <span className="text-[10px] text-teal-950 bg-teal-100/90 border border-teal-300 px-1.5 py-0.5 rounded italic truncate max-w-[150px]">
                      &ldquo;{act.comment}&rdquo;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(act)}
                    className="p-1.5 bg-indigo-200/80 hover:bg-indigo-300 text-indigo-950 border border-indigo-300 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteActivity(act.aid)}
                    className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-indigo-900/60 space-y-1">
            <p className="text-xs font-bold text-indigo-950">No lesson activities logged yet</p>
            <p className="text-[10px] text-indigo-800/80">Click &ldquo;Log Lesson&rdquo; to add daily attendance and marks</p>
          </div>
        )}
      </div>
    </div>
  );
}
