'use client';

import React, { useState, useEffect } from 'react';
import { Student, Exam } from '@/types';
import {
  Trophy,
  X,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  GraduationCap,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { generateExamId } from '@/utils/id';

interface RecordExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  students?: Student[];
  onAddExam: (exam: Exam) => Promise<void> | void;
}

export default function RecordExamModal({
  isOpen,
  onClose,
  student,
  students = [],
  onAddExam,
}: RecordExamModalProps) {
  const [selectedSid, setSelectedSid] = useState<string>(student?.sid || (students[0]?.sid || ''));
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [subjectAndTopic, setSubjectAndTopic] = useState<string>('');
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [obtainedMarks, setObtainedMarks] = useState<number | ''>(40);
  const [remarks, setRemarks] = useState<string>('Good');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state whenever modal opens or student prop changes
  useEffect(() => {
    if (student?.sid) {
      setSelectedSid(student.sid);
      if (!subjectAndTopic && student.subject) {
        setSubjectAndTopic(`${student.subject} - `);
      }
    } else if (students.length > 0 && !selectedSid) {
      setSelectedSid(students[0].sid);
    }
  }, [student, students, isOpen]);

  if (!isOpen) return null;

  const currentStudent = student || students.find((s) => s.sid === selectedSid) || {
    sid: selectedSid || '000000',
    name: 'Student',
    subject: '',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sidToUse = student?.sid || selectedSid;
    if (!sidToUse) return;

    setIsSubmitting(true);
    try {
      const examPayload: Exam = {
        eid: generateExamId(),
        studentSid: sidToUse,
        date: date || new Date().toISOString().slice(0, 10),
        subjectAndTopic: subjectAndTopic.trim() || 'General Assessment',
        status,
        totalMarks: Number(totalMarks) || 50,
        obtainedMarks:
          status === 'Present' && obtainedMarks !== '' && !isNaN(Number(obtainedMarks))
            ? Number(obtainedMarks)
            : undefined,
        remarks: remarks.trim(),
        comment: comment.trim(),
      };

      await onAddExam(examPayload);
      onClose();
      // Reset form to defaults
      setDate(new Date().toISOString().slice(0, 10));
      setStatus('Present');
      setSubjectAndTopic(student?.subject ? `${student.subject} - ` : '');
      setTotalMarks(50);
      setObtainedMarks(40);
      setRemarks('Good');
      setComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-4 pt-14 sm:pt-16 pb-4 bg-slate-950/75 backdrop-blur-xs overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(147,51,234,0.25)] overflow-hidden border border-purple-200 dark:border-purple-900/60 m-auto flex flex-col max-h-[calc(100vh-5rem)]">
        {/* Header matching Global Exam Modal visual design */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white p-3 sm:p-3.5 border-b border-purple-800/40 relative shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-indigo-900/80 border border-purple-500/40 text-amber-400 rounded-xl shadow-xs dark:shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0 space-y-0">
                <h3 className="font-display font-black text-white text-xs sm:text-sm tracking-tight leading-tight">
                  Record Examination Evaluation
                </h3>
                <p className="text-[10px] text-purple-200/90 font-medium truncate">
                  Log test score, attendance status &amp; student marks
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-purple-900/50 hover:bg-purple-800/80 text-purple-200 hover:text-white rounded-lg border border-purple-700/50 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body - Tight & Compact */}
        <form onSubmit={handleSubmit} className="p-2.5 sm:p-3 space-y-2 overflow-y-auto flex-1 text-xs">
          {/* Exam Date Row */}
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1 text-[10.5px] font-mono font-black text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>EXAM DATE:</span>
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-[11px] font-mono font-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Student Profile Card (Fixed student name if viewing from profile) */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border-2 border-indigo-200/90 dark:border-indigo-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
            <label className="text-[10px] font-mono font-black tracking-wider text-indigo-950 dark:text-indigo-300 uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0" />
              <span>STUDENT PROFILE</span>
            </label>
            {student ? (
              <div className="w-full bg-white dark:bg-slate-950 border border-indigo-200/90 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-black">{student.name}</span>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700/60 shrink-0">
                  SID: {student.sid}
                </span>
              </div>
            ) : (
              <select
                required
                value={selectedSid}
                onChange={(e) => setSelectedSid(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-indigo-200/90 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
              >
                {students.map((s) => (
                  <option key={s.sid} value={s.sid} className="dark:bg-slate-900">
                    {s.name} (SID: {s.sid})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Attendance Status - Colorful 2-Button Toggle */}
          <div
            className={`border-2 rounded-xl p-2 space-y-1 shadow-2xs transition-colors ${
              status === 'Present'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/90 dark:border-emerald-800/60'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/90 dark:border-rose-800/60'
            }`}
          >
            <label
              className={`block text-[10px] font-mono font-black tracking-wider uppercase ${
                status === 'Present'
                  ? 'text-emerald-950 dark:text-emerald-300'
                  : 'text-rose-950 dark:text-rose-300'
              }`}
            >
              ATTENDANCE STATUS
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Present')}
                className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'Present'
                    ? 'bg-emerald-600 text-white shadow-xs dark:shadow-[0_0_12px_rgba(160,185,129,0.4)] border border-emerald-500 active:scale-98'
                    : 'bg-white dark:bg-slate-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200/90 dark:border-slate-800 hover:bg-emerald-100/60 dark:hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Present</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatus('Absent');
                  setObtainedMarks('');
                }}
                className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'Absent'
                    ? 'bg-rose-600 text-white shadow-xs dark:shadow-[0_0_12px_rgba(244,63,94,0.4)] border border-rose-500 active:scale-98'
                    : 'bg-white dark:bg-slate-950 text-rose-800 dark:text-rose-300 border border-rose-200/90 dark:border-slate-800 hover:bg-rose-100/60 dark:hover:bg-slate-800'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Absent</span>
              </button>
            </div>
          </div>

          {/* Subject & Topic / Syllabus Card - Colorful Purple */}
          <div className="bg-purple-50/80 dark:bg-purple-950/30 border-2 border-purple-200/90 dark:border-purple-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
            <label className="text-[10px] font-mono font-black tracking-wider text-purple-950 dark:text-purple-300 uppercase flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 shrink-0" />
              <span>SUBJECT &amp; TOPIC / SYLLABUS</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Physics – Dynamics &amp; Momentum Test"
              value={subjectAndTopic}
              onChange={(e) => setSubjectAndTopic(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-purple-200/90 dark:border-slate-800 focus:border-purple-600 dark:focus:border-purple-400 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs text-purple-950 dark:text-purple-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
            />
          </div>

          {/* Marks Row: Total Marks (Amber) & Obtained Marks (Sky with Live Score Badge) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Total Marks */}
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-200/90 dark:border-amber-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
              <label className="text-[10px] font-mono font-black tracking-wider text-amber-950 dark:text-amber-300 uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>TOTAL MARKS</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                placeholder="e.g. 50"
                className="w-full bg-white dark:bg-slate-950 border border-amber-200/90 dark:border-slate-800 focus:border-amber-600 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-200 dark:focus:ring-amber-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
              />
            </div>

            {/* Obtained Marks */}
            <div className="bg-sky-50/80 dark:bg-sky-950/30 border-2 border-sky-200/90 dark:border-sky-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between gap-1">
                <label className="text-[10px] font-mono font-black tracking-wider text-sky-950 dark:text-sky-300 uppercase flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                  <span>OBTAINED</span>
                </label>
                {status === 'Present' && typeof obtainedMarks === 'number' && totalMarks > 0 && (
                  <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-sky-200/90 dark:bg-sky-900 text-sky-900 dark:text-sky-200">
                    {Math.round((obtainedMarks / totalMarks) * 100)}%
                  </span>
                )}
              </div>
              {status === 'Absent' ? (
                <div className="w-full bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-rose-800 dark:text-rose-300 italic shadow-2xs text-center select-none">
                  Absent — Exempt
                </div>
              ) : (
                <input
                  type="number"
                  min={0}
                  max={totalMarks}
                  step="0.1"
                  placeholder="e.g. 40"
                  value={obtainedMarks}
                  onChange={(e) =>
                    setObtainedMarks(e.target.value !== '' ? Number(e.target.value) : '')
                  }
                  className="w-full bg-white dark:bg-slate-950 border border-sky-200/90 dark:border-slate-800 focus:border-sky-600 dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
                />
              )}
            </div>
          </div>

          {/* Remarks Tag & Quick Chips - Colorful Teal */}
          <div className="bg-teal-50/80 dark:bg-teal-950/30 border-2 border-teal-200/90 dark:border-teal-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-black tracking-wider text-teal-950 dark:text-teal-300 uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                <span>REMARKS TAG</span>
              </label>
              <div className="flex items-center gap-1">
                {['Excellent', 'Good', 'Needs Focus'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRemarks(tag)}
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold cursor-pointer transition-all ${
                      remarks === tag
                        ? 'bg-teal-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="e.g. Excellent / Good / Needs Focus"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-teal-200/90 dark:border-slate-800 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-200 dark:focus:ring-teal-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs text-teal-950 dark:text-teal-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
            />
          </div>

          {/* Feedback Comment - Colorful Fuchsia/Pink */}
          <div className="bg-fuchsia-50/80 dark:bg-fuchsia-950/30 border-2 border-fuchsia-200/90 dark:border-fuchsia-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
            <label className="text-[10px] font-mono font-black tracking-wider text-fuchsia-950 dark:text-fuchsia-300 uppercase flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-fuchsia-700 dark:text-fuchsia-400 shrink-0" />
              <span>FEEDBACK / OBSERVATION COMMENT</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Strong conceptual grasp, finished early"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-fuchsia-200/90 dark:border-slate-800 focus:border-fuchsia-600 dark:focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-200 dark:focus:ring-fuchsia-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs text-fuchsia-950 dark:text-fuchsia-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
            />
          </div>

          {/* Glowing Gradient Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-500 hover:from-purple-800 hover:to-amber-600 text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 border border-white/20 disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              <span>{isSubmitting ? 'Saving Scorecard...' : 'Save Exam Scorecard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
