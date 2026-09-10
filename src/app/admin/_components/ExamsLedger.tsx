'use client';

import React, { useState } from 'react';
import { Student, Exam } from '@/types';
import { ClipboardList, Plus, Trash2, Edit2, Check, X, Calendar, Award } from 'lucide-react';
import { generateExamId, formatEid } from '@/utils/id';

interface ExamsLedgerProps {
  student: Student;
  exams: Exam[];
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (eid: string) => void;
  onUpdateExam: (exam: Exam) => void;
}

export default function ExamsLedger({
  student,
  exams,
  onAddExam,
  onDeleteExam,
  onUpdateExam,
}: ExamsLedgerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEid, setEditingEid] = useState<string | null>(null);

  const [newExam, setNewExam] = useState<Partial<Exam>>({
    date: new Date().toISOString().slice(0, 10),
    subjectAndTopic: student.subject ? `${student.subject} - Chapter Test` : '',
    status: 'Present',
    totalMarks: 50,
    obtainedMarks: 40,
    remarks: 'Good',
    comment: '',
  });

  const [editFormData, setEditFormData] = useState<Exam | null>(null);

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    const exam: Exam = {
      eid: generateExamId(),
      studentSid: student.sid,
      date: newExam.date || new Date().toISOString().slice(0, 10),
      subjectAndTopic: newExam.subjectAndTopic || 'Monthly Assessment',
      status: newExam.status || 'Present',
      totalMarks: Number(newExam.totalMarks) || 50,
      obtainedMarks: newExam.obtainedMarks !== undefined ? Number(newExam.obtainedMarks) : undefined,
      remarks: newExam.remarks || '',
      comment: newExam.comment || '',
    };
    onAddExam(exam);
    setIsAdding(false);
    setNewExam({
      date: new Date().toISOString().slice(0, 10),
      subjectAndTopic: student.subject ? `${student.subject} - Chapter Test` : '',
      status: 'Present',
      totalMarks: 50,
      obtainedMarks: 40,
      remarks: 'Good',
      comment: '',
    });
  };

  const handleStartEdit = (exam: Exam) => {
    setEditingEid(exam.eid);
    setEditFormData({ ...exam });
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdateExam(editFormData);
      setEditingEid(null);
      setEditFormData(null);
    }
  };

  const sortedExams = [...exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-slate-100/95 rounded-2xl border border-slate-300 p-2 sm:p-3 space-y-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-slate-300/90 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-amber-600 text-white rounded-lg shadow-2xs shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">Exams & Assessment Scorecards</h3>
            <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate">Record chapter tests, model tests, and marks</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">{isAdding ? 'Cancel' : 'Log Exam'}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreateExam} className="p-3 bg-amber-100/90 border border-amber-300 rounded-2xl space-y-2.5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-amber-950">Exam Date *</label>
              <input
                type="date"
                required
                value={newExam.date}
                onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-950">Subject & Topic *</label>
              <input
                type="text"
                required
                value={newExam.subjectAndTopic}
                onChange={(e) => setNewExam({ ...newExam, subjectAndTopic: e.target.value })}
                placeholder="e.g. Physics - Dynamics Model Test"
                className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 placeholder-amber-600/70"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-950">Status</label>
              <select
                value={newExam.status}
                onChange={(e) => setNewExam({ ...newExam, status: e.target.value })}
                className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-950">Total Marks *</label>
              <input
                type="number"
                required
                min={1}
                value={newExam.totalMarks ?? 50}
                onChange={(e) => setNewExam({ ...newExam, totalMarks: Number(e.target.value) })}
                className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-950">Obtained Marks</label>
              <input
                type="number"
                min={0}
                value={newExam.obtainedMarks ?? ''}
                onChange={(e) => setNewExam({ ...newExam, obtainedMarks: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-950">Remarks / Grade</label>
              <input
                type="text"
                value={newExam.remarks}
                onChange={(e) => setNewExam({ ...newExam, remarks: e.target.value })}
                placeholder="e.g. Excellent / A+"
                className="w-full px-2.5 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-950 placeholder-amber-600/70"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Save Exam Result
            </button>
          </div>
        </form>
      )}

      {/* Exam List */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {sortedExams.length > 0 ? (
          sortedExams.map((exam) => {
            const isEditingThis = editingEid === exam.eid;

            if (isEditingThis && editFormData) {
              return (
                <div key={exam.eid} className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl space-y-2 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                    <input
                      type="text"
                      value={editFormData.subjectAndTopic}
                      onChange={(e) => setEditFormData({ ...editFormData, subjectAndTopic: e.target.value })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Total Marks"
                      value={editFormData.totalMarks}
                      onChange={(e) => setEditFormData({ ...editFormData, totalMarks: Number(e.target.value) })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                    <input
                      type="number"
                      placeholder="Obtained Marks"
                      value={editFormData.obtainedMarks ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, obtainedMarks: Number(e.target.value) })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                    <input
                      type="text"
                      placeholder="Remarks"
                      value={editFormData.remarks || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingEid(null)}
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

            const percentage = exam.obtainedMarks !== undefined && exam.totalMarks > 0
              ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
              : null;

            return (
              <div
                key={exam.eid}
                className="p-2.5 bg-amber-100/50 hover:bg-amber-100/80 border border-amber-200/90 hover:border-amber-400 rounded-xl flex items-center justify-between gap-2 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-black bg-amber-200 text-amber-950 border border-amber-400 px-1.5 py-0.5 rounded shadow-2xs">
                    {formatEid(exam.eid)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-800 bg-slate-200/80 border border-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-slate-600" />
                    {exam.date}
                  </span>
                  <span className="font-bold text-orange-950 bg-orange-100/90 border border-orange-300 px-1.5 py-0.5 rounded text-[11px] truncate max-w-[200px]">
                    {exam.subjectAndTopic}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      exam.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-rose-100 text-rose-950 border-rose-300'
                    }`}
                  >
                    {exam.status}
                  </span>
                  {exam.obtainedMarks !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="bg-yellow-200 text-yellow-950 border border-yellow-400 px-1.5 py-0.5 rounded font-mono font-black text-[10px] shadow-2xs">
                        {exam.obtainedMarks} / {exam.totalMarks} ({percentage}%)
                      </span>
                    </div>
                  )}
                  {exam.remarks && (
                    <span className="bg-sky-100 text-sky-950 border border-sky-300 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                      {exam.remarks}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(exam)}
                    className="p-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 border border-amber-300 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteExam(exam.eid)}
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
          <div className="p-6 text-center text-amber-900/60 space-y-1">
            <p className="text-xs font-bold text-amber-950">No exam records logged yet</p>
            <p className="text-[10px] text-amber-800/80">Click &ldquo;Log Exam&rdquo; to add test marks and scorecards</p>
          </div>
        )}
      </div>
    </div>
  );
}
