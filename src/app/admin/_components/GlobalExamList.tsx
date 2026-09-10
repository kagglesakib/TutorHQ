'use client';

import React, { useState } from 'react';
import { Student, Exam } from '@/types';
import { ClipboardList, Search, Trash2, Edit2, Check, X, Calendar, User, Filter } from 'lucide-react';
import { formatEid } from '@/utils/id';

interface GlobalExamListProps {
  exams: Exam[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onUpdateExam: (exam: Exam) => Promise<void> | void;
  onDeleteExam: (eid: string) => Promise<void> | void;
}

export default function GlobalExamList({
  exams,
  students,
  onSelectStudent,
  onUpdateExam,
  onDeleteExam,
}: GlobalExamListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [editingEid, setEditingEid] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Exam | null>(null);

  const studentMap = new Map(students.map(s => [s.sid, s]));

  const filteredExams = exams.filter((exam) => {
    const term = searchTerm.toLowerCase();
    const student = studentMap.get(exam.studentSid);
    const matchesSearch =
      exam.eid.toLowerCase().includes(term) ||
      exam.studentSid.toLowerCase().includes(term) ||
      exam.subjectAndTopic.toLowerCase().includes(term) ||
      (student && student.name.toLowerCase().includes(term));

    const matchesFilter = selectedStudentFilter === 'ALL' || exam.studentSid === selectedStudentFilter;
    return matchesSearch && matchesFilter;
  });

  const handleStartEdit = (exam: Exam) => {
    setEditingEid(exam.eid);
    setEditFormData({ ...exam });
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      await onUpdateExam(editFormData);
      setEditingEid(null);
      setEditFormData(null);
    }
  };

  const sortedExams = [...filteredExams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-300/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-600 text-white rounded-xl shadow-2xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-amber-950 text-base">All Exam Records & Scorecards</h3>
              <span className="text-[10px] bg-amber-200/90 text-amber-950 border border-amber-400 font-mono font-bold px-2 py-0.5 rounded-full">
                {filteredExams.length} Total
              </span>
            </div>
            <p className="text-xs text-amber-800/80 font-medium">Cross-student comprehensive examination database</p>
          </div>
        </div>

        {/* Search & Student Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative bg-amber-100/80 rounded-xl border border-amber-300/90 p-1 flex items-center focus-within:ring-2 focus-within:ring-amber-500 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-amber-700 ml-1 mr-1.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exam, student, SID..."
              className="py-0.5 text-xs text-amber-950 placeholder-amber-600/70 focus:outline-hidden w-40 sm:w-56 font-medium bg-transparent"
            />
          </div>

          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-amber-100/90 border border-amber-300 rounded-xl text-xs font-bold text-amber-950 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Students ({students.length})</option>
            {students.map(s => (
              <option key={s.sid} value={s.sid}>{s.name} ({s.sid})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exam Items */}
      <div className="space-y-2">
        {sortedExams.length > 0 ? (
          sortedExams.map((exam) => {
            const student = studentMap.get(exam.studentSid);
            const isEditing = editingEid === exam.eid;

            if (isEditing && editFormData) {
              return (
                <div key={exam.eid} className="p-3 bg-amber-100/90 border border-amber-400 rounded-2xl space-y-2 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
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
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950 sm:col-span-2"
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
                      placeholder="Total"
                      value={editFormData.totalMarks}
                      onChange={(e) => setEditFormData({ ...editFormData, totalMarks: Number(e.target.value) })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                    <input
                      type="number"
                      placeholder="Obtained"
                      value={editFormData.obtainedMarks ?? ''}
                      onChange={(e) => setEditFormData({ ...editFormData, obtainedMarks: Number(e.target.value) })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950"
                    />
                    <input
                      type="text"
                      placeholder="Remarks"
                      value={editFormData.remarks || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                      className="px-2 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-medium text-amber-950 sm:col-span-2"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingEid(null)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
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
                className="p-2.5 sm:p-3 bg-amber-100/50 hover:bg-amber-100/80 border border-amber-200/90 hover:border-amber-400 rounded-2xl flex items-center justify-between gap-2.5 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {/* EID Badge */}
                  <span className="text-[9.5px] font-mono font-black bg-amber-200 text-amber-950 border border-amber-400 px-2 py-0.5 rounded-lg shadow-2xs">
                    {formatEid(exam.eid)}
                  </span>

                  {/* Student Badge Button */}
                  <button
                    onClick={() => onSelectStudent(exam.studentSid)}
                    className="font-black text-indigo-950 bg-indigo-100/90 hover:bg-indigo-200/90 border border-indigo-300 px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs transition-all shadow-2xs"
                  >
                    <User className="w-3 h-3 text-indigo-700" />
                    <span>{student?.name || exam.studentSid}</span>
                    <span className="text-[9.5px] font-mono font-bold text-indigo-700">({exam.studentSid})</span>
                  </button>

                  {/* Subject and Topic Badge */}
                  <span className="text-[11px] font-bold text-orange-950 bg-orange-100/90 border border-orange-300 px-2 py-0.5 rounded-lg truncate max-w-[220px]">
                    {exam.subjectAndTopic}
                  </span>

                  {/* Date Badge */}
                  <span className="text-[9.5px] text-slate-800 font-mono font-semibold flex items-center gap-1 bg-slate-200/80 border border-slate-300 px-1.5 py-0.5 rounded-md">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    {exam.date}
                  </span>

                  {/* Attendance Status Badge */}
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md border ${
                      exam.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-rose-100 text-rose-950 border-rose-300'
                    }`}
                  >
                    {exam.status}
                  </span>

                  {/* Marks / Score Badge */}
                  {exam.obtainedMarks !== undefined && (
                    <span className="bg-yellow-200 text-yellow-950 border border-yellow-400 px-2 py-0.5 rounded-lg font-mono font-black text-[10.5px] shadow-2xs">
                      {exam.obtainedMarks} / {exam.totalMarks} ({percentage}%)
                    </span>
                  )}

                  {/* Remarks Badge */}
                  {exam.remarks && (
                    <span className="bg-sky-100 text-sky-950 border border-sky-300 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                      {exam.remarks}
                    </span>
                  )}
                </div>

                {/* Actions */}
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
          <div className="p-10 text-center text-amber-900/60 space-y-1">
            <p className="text-sm font-bold text-amber-900">No exam records found</p>
            <p className="text-xs text-amber-800/70">Try changing the search keyword or student filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
