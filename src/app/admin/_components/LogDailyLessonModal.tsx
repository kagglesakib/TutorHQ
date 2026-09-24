'use client';

import React, { useState, useEffect } from 'react';
import { Student, Activity } from '@/types';
import { Sparkles, X, CheckCircle2, XCircle, Award, GraduationCap, Calendar, User } from 'lucide-react';
import { generateActivityId } from '@/utils/id';

interface LogDailyLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  students?: Student[];
  onAddActivity: (activity: Activity) => Promise<void> | void;
}

export default function LogDailyLessonModal({
  isOpen,
  onClose,
  student,
  students = [],
  onAddActivity,
}: LogDailyLessonModalProps) {
  // Selected student SID
  const [selectedSid, setSelectedSid] = useState<string>(student?.sid || (students[0]?.sid || ''));

  // Form states matching user UI design
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const [subjectTopic, setSubjectTopic] = useState<string>('');
  
  // Homework state & checkbox system
  const [hwMarks, setHwMarks] = useState<string>('8.50');
  const [isHwNotGraded, setIsHwNotGraded] = useState<boolean>(false);

  // Classwork state & checkbox system
  const [cwMarks, setCwMarks] = useState<string>('9.00');
  const [isCwNotGraded, setIsCwNotGraded] = useState<boolean>(false);

  // Remarks state
  const [comment, setComment] = useState<string>('');

  // Loading / Submit state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync selected student when props change
  useEffect(() => {
    if (student?.sid) {
      setSelectedSid(student.sid);
      if (student.subject) {
        setSubjectTopic(prev => prev || `${student.subject} – Topic Name`);
      }
    } else if (students.length > 0 && !selectedSid) {
      setSelectedSid(students[0].sid);
    }
  }, [student, students]);

  if (!isOpen) return null;

  const currentStudent = student || students.find(s => s.sid === selectedSid) || {
    sid: selectedSid || '2701244',
    name: 'Samiul Marjan Rafi',
    subject: 'Physics',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent.sid) return;

    setIsSubmitting(true);
    try {
      const act: Activity = {
        aid: generateActivityId(),
        studentSid: currentStudent.sid,
        date: date || new Date().toISOString().slice(0, 10),
        status: status,
        subjectTuitioned: subjectTopic.trim() || currentStudent.subject || 'General Study',
        hwMarks: isHwNotGraded ? undefined : (hwMarks !== '' ? Number(hwMarks) : undefined),
        cwMarks: isCwNotGraded ? undefined : (cwMarks !== '' ? Number(cwMarks) : undefined),
        comment: comment.trim(),
      };

      await onAddActivity(act);
      onClose();
      // Reset form
      setSubjectTopic('');
      setComment('');
      setHwMarks('8.50');
      setCwMarks('9.00');
      setIsHwNotGraded(false);
      setIsCwNotGraded(false);
    } catch (err) {
      console.error('Failed to log daily lesson:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-3 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Card matching visual design - compact padding */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white p-3 sm:p-3.5 border-b border-purple-800/40 relative shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Sparkle Icon Container */}
              <div className="p-1.5 bg-indigo-900/80 border border-purple-500/40 text-amber-400 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 space-y-0">
                <h2 className="font-display font-black text-white text-xs sm:text-sm tracking-tight leading-tight">
                  Log New Daily Lesson Record
                </h2>
                <div className="flex items-center gap-1.5 text-[10.5px] text-purple-200/90 font-medium flex-wrap">
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">
                    Student: <strong className="text-white font-bold">{currentStudent.name}</strong>
                  </span>
                  <span className="text-purple-400">•</span>
                  <span className="bg-purple-900/90 text-purple-200 border border-purple-700/80 font-mono font-bold text-[9px] px-1.5 py-0.2 rounded shadow-2xs shrink-0">
                    SID: {currentStudent.sid}
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-purple-900/50 hover:bg-purple-800/80 text-purple-200 hover:text-white rounded-lg border border-purple-700/50 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Optional Student Selector if multiple students are provided */}
          {!student && students.length > 1 && (
            <div className="mt-2 pt-1.5 border-t border-purple-800/50 flex items-center gap-1.5">
              <User className="w-3 h-3 text-purple-300 shrink-0" />
              <label htmlFor="select-student" className="text-[9.5px] font-bold text-purple-200 font-mono shrink-0">Student:</label>
              <select
                id="select-student"
                value={selectedSid}
                onChange={(e) => setSelectedSid(e.target.value)}
                className="bg-purple-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded border border-purple-700 focus:outline-hidden w-full"
              >
                {students.map(s => (
                  <option key={s.sid} value={s.sid}>{s.name} (SID: {s.sid})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Form Body - Tight & Compact */}
        <form onSubmit={handleSubmit} className="p-2.5 sm:p-3 space-y-2 overflow-y-auto flex-1 text-xs">
          
          {/* Date Selector Header Row */}
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1 text-[10.5px] font-mono font-black text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>LESSON DATE:</span>
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded-lg text-[11px] font-mono font-black text-slate-900 focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>

          {/* Section 1: ATTENDANCE STATUS */}
          <div className={`border-2 rounded-2xl p-2.5 space-y-1.5 shadow-2xs transition-colors ${
            status === 'Present'
              ? 'bg-emerald-50/80 border-emerald-200/90'
              : 'bg-rose-50/80 border-rose-200/90'
          }`}>
            <label className={`block text-[10px] font-mono font-black tracking-wider uppercase ${
              status === 'Present' ? 'text-emerald-950' : 'text-rose-950'
            }`}>
              ATTENDANCE STATUS
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Present Button */}
              <button
                type="button"
                onClick={() => {
                  setStatus('Present');
                  setIsHwNotGraded(false);
                  setIsCwNotGraded(false);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'Present'
                    ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500 active:scale-98'
                    : 'bg-white text-emerald-900 border border-emerald-200/90 hover:bg-emerald-100/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Present</span>
              </button>

              {/* Absent Button */}
              <button
                type="button"
                onClick={() => {
                  setStatus('Absent');
                  if (!subjectTopic || subjectTopic.includes('Topic Name')) {
                    setSubjectTopic('Absent — No Lesson Conducted');
                  }
                  setIsHwNotGraded(true);
                  setIsCwNotGraded(true);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'Absent'
                    ? 'bg-rose-600 text-white shadow-xs border border-rose-500 active:scale-98'
                    : 'bg-white text-rose-800 border border-rose-200/90 hover:bg-rose-100/60'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Absent</span>
              </button>
            </div>
          </div>

          {/* Section 2: SUBJECT & LESSON TOPIC */}
          <div className="bg-purple-50/80 border-2 border-purple-200/90 rounded-2xl p-2.5 space-y-1.5 shadow-2xs">
            <label htmlFor="subject-topic-input" className="block text-[10px] font-mono font-black tracking-wider text-purple-950 uppercase">
              SUBJECT & LESSON TOPIC
            </label>
            <input
              id="subject-topic-input"
              type="text"
              required={status === 'Present'}
              value={subjectTopic}
              onChange={(e) => setSubjectTopic(e.target.value)}
              placeholder="e.g. Physics – Circular Motion & Gravitationa"
              className="w-full bg-white border border-purple-200/90 focus:border-purple-600 focus:ring-1 focus:ring-purple-200 focus:outline-hidden rounded-xl px-3 py-1.5 text-xs text-purple-950 font-semibold placeholder:text-slate-400 shadow-2xs transition-all"
            />
          </div>

          {/* Section 3: HOMEWORK MARKS (with Checkbox System) */}
          <div className="bg-amber-50/80 border-2 border-amber-200/90 rounded-2xl p-2.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <label htmlFor="hw-marks-input" className="text-[10px] font-mono font-black tracking-wider text-amber-950 uppercase flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>HOMEWORK MARKS</span>
              </label>

              {/* Checkbox System */}
              <label className="bg-white/90 border border-amber-300 hover:border-amber-400 rounded-lg px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-bold text-amber-950 shadow-2xs cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={isHwNotGraded}
                  onChange={(e) => setIsHwNotGraded(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                />
                <span className="text-[10px] font-bold text-amber-950">Not Graded</span>
              </label>
            </div>

            {isHwNotGraded ? (
              <div className="w-full bg-amber-100/70 border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-800/80 italic shadow-2xs flex items-center justify-between select-none">
                <span>Not Graded for this session</span>
                <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-sans font-bold">Exempt</span>
              </div>
            ) : (
              <input
                id="hw-marks-input"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={hwMarks}
                onChange={(e) => setHwMarks(e.target.value)}
                placeholder="e.g. 8.50"
                className="w-full bg-white border border-amber-200/90 focus:border-amber-600 focus:ring-1 focus:ring-amber-200 focus:outline-hidden rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
              />
            )}
          </div>

          {/* Section 4: CLASSWORK MARKS (with Checkbox System) */}
          <div className="bg-indigo-50/80 border-2 border-indigo-200/90 rounded-2xl p-2.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <label htmlFor="cw-marks-input" className="text-[10px] font-mono font-black tracking-wider text-indigo-950 uppercase flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span>CLASSWORK MARKS</span>
              </label>

              {/* Checkbox System */}
              <label className="bg-white/90 border border-indigo-300 hover:border-indigo-400 rounded-lg px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-bold text-indigo-950 shadow-2xs cursor-pointer select-none transition-all">
                <input
                  type="checkbox"
                  checked={isCwNotGraded}
                  onChange={(e) => setIsCwNotGraded(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <span className="text-[10px] font-bold text-indigo-950">Not Graded</span>
              </label>
            </div>

            {isCwNotGraded ? (
              <div className="w-full bg-indigo-100/70 border border-indigo-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-indigo-800/80 italic shadow-2xs flex items-center justify-between select-none">
                <span>Not Graded for this session</span>
                <span className="text-[9px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-sans font-bold">Exempt</span>
              </div>
            ) : (
              <input
                id="cw-marks-input"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={cwMarks}
                onChange={(e) => setCwMarks(e.target.value)}
                placeholder="e.g. 9.00"
                className="w-full bg-white border border-indigo-200/90 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-200 focus:outline-hidden rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all"
              />
            )}
          </div>

          {/* Section 5: REMARKS & FEEDBACK NOTES */}
          <div className="bg-teal-50/80 border-2 border-teal-200/90 rounded-2xl p-2.5 space-y-1.5 shadow-2xs">
            <label htmlFor="remarks-textarea" className="block text-[10px] font-mono font-black tracking-wider text-teal-950 uppercase">
              REMARKS & FEEDBACK NOTES
            </label>
            <textarea
              id="remarks-textarea"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add lesson remarks, key concepts covered, student comprehension levels, or reason for absence..."
              className="w-full bg-white border border-teal-200/90 focus:border-teal-600 focus:ring-1 focus:ring-teal-200 focus:outline-hidden rounded-xl p-2.5 text-xs text-teal-950 font-medium placeholder:text-slate-400 shadow-2xs resize-none transition-all h-16 sm:h-20"
            />
          </div>

          {/* Glowing Gradient Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-500 hover:from-purple-800 hover:to-amber-600 text-white font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 border border-white/20 disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              <span>{isSubmitting ? 'Logging Entry...' : 'Log Activity Entry'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );

}
