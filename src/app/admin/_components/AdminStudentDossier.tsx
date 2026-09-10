'use client';

import React from 'react';
import { Student, Exam, Activity } from '@/types';
import {
  Phone, Calendar, Layers, Hash, BookOpen, MapPin, Trophy, FileText, Download, Mail, Edit3, Key
} from 'lucide-react';
import { formatBatch } from '@/utils/formatBatch';

interface AdminStudentDossierProps {
  student: Student;
  studentExams: Exam[];
  studentActivities?: Activity[];
  reportMonth: string;
  setReportMonth: (month: string) => void;
  isGeneratingPdf: boolean;
  onGeneratePdf: () => void;
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

export default function AdminStudentDossier({
  student,
  studentExams,
  studentActivities = [],
  reportMonth,
  setReportMonth,
  isGeneratingPdf,
  onGeneratePdf,
  onEditProfile,
  onChangePassword,
}: AdminStudentDossierProps) {
  const currentYearNum = new Date().getFullYear();
  const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYearNum - 2 + i));

  const MONTH_OPTIONS = [
    { value: '01', name: 'Jan' },
    { value: '02', name: 'Feb' },
    { value: '03', name: 'Mar' },
    { value: '04', name: 'Apr' },
    { value: '05', name: 'May' },
    { value: '06', name: 'Jun' },
    { value: '07', name: 'Jul' },
    { value: '08', name: 'Aug' },
    { value: '09', name: 'Sep' },
    { value: '10', name: 'Oct' },
    { value: '11', name: 'Nov' },
    { value: '12', name: 'Dec' },
  ];

  const [selectedYear, selectedMonth] = (() => {
    const parts = (reportMonth || '').split('-');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return [parts[0], parts[1]];
    }
    const now = new Date();
    return [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0')];
  })();

  const handleMonthSelect = (mVal: string) => {
    setReportMonth(`${selectedYear}-${mVal}`);
  };

  const handleYearSelect = (yVal: string) => {
    setReportMonth(`${yVal}-${selectedMonth}`);
  };

  return (
    <div className="lg:col-span-4 space-y-2.5">
      {/* Student Profile Metadata Card */}
      <div className="bg-slate-200/70 p-3 rounded-2xl border border-slate-300 shadow-xs space-y-2 text-slate-800" id="profile-meta-card">
        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
          <h3 className="font-display font-black text-slate-800 text-xs tracking-tight">Student Dossier</h3>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-black text-indigo-800 bg-indigo-100 border border-indigo-300 px-1.5 py-0.2 rounded font-mono">
              ID: {student.sid}
            </span>
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Edit Student Profile"
              >
                <Edit3 className="w-2.5 h-2.5" />
                Edit
              </button>
            )}
            {onChangePassword && (
              <button
                onClick={onChangePassword}
                className="px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] font-bold flex items-center gap-0.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                title="Change Password"
              >
                <Key className="w-2.5 h-2.5" />
                Pwd
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-[11px]">
          {/* Email Address */}
          <div className="p-1.5 bg-violet-100/90 rounded-xl border border-violet-300 flex items-center gap-2">
            <div className="p-1 bg-violet-600 text-white rounded shrink-0 shadow-2xs">
              <Mail className="w-3 h-3" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-violet-700 block font-bold text-[9px] uppercase tracking-wider">Email</span>
              <span className="font-bold text-violet-950 text-[10px] truncate block" title={student.email || 'No email'}>
                {student.email || 'Not specified'}
              </span>
            </div>
          </div>

          {/* College */}
          <div className="p-1.5 bg-sky-100/90 rounded-xl border border-sky-300 flex items-center gap-2">
            <div className="p-1 bg-sky-600 text-white rounded shrink-0 shadow-2xs">
              <Layers className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-sky-700 block font-bold text-[9px] uppercase tracking-wider">College</span>
              <span className="font-bold text-sky-950 text-[10px] truncate block">{student.college || 'N/A'}</span>
            </div>
          </div>

          {/* HSC Batch */}
          <div className="p-1.5 bg-emerald-100/90 rounded-xl border border-emerald-300 flex items-center gap-2">
            <div className="p-1 bg-emerald-600 text-white rounded shrink-0 shadow-2xs">
              <Calendar className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-emerald-700 block font-bold text-[9px] uppercase tracking-wider">HSC Batch</span>
              <span className="font-bold text-emerald-950 text-[10px] font-mono truncate block">{formatBatch(student.hscBatch)}</span>
            </div>
          </div>

          {/* Group */}
          <div className="p-1.5 bg-purple-100/90 rounded-xl border border-purple-300 flex items-center gap-2">
            <div className="p-1 bg-purple-600 text-white rounded shrink-0 shadow-2xs">
              <Hash className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-purple-700 block font-bold text-[9px] uppercase tracking-wider">Group</span>
              <span className="font-bold text-purple-950 text-[10px] truncate block">{student.group || 'N/A'}</span>
            </div>
          </div>

          {/* Subject */}
          <div className="p-1.5 bg-amber-100/90 rounded-xl border border-amber-300 flex items-center gap-2">
            <div className="p-1 bg-amber-600 text-white rounded shrink-0 shadow-2xs">
              <BookOpen className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-amber-700 block font-bold text-[9px] uppercase tracking-wider">Subject</span>
              <span className="font-bold text-amber-950 text-[10px] truncate block">{student.subject || 'N/A'}</span>
            </div>
          </div>

          {/* Mobile */}
          <div className="p-1.5 bg-teal-100/90 rounded-xl border border-teal-300 flex items-center gap-2">
            <div className="p-1 bg-teal-600 text-white rounded shrink-0 shadow-2xs">
              <Phone className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-teal-700 block font-bold text-[9px] uppercase tracking-wider">Mobile</span>
              <span className="font-bold text-teal-950 text-[10px] font-mono truncate block">{student.mobile || 'N/A'}</span>
            </div>
          </div>

          {/* Guardians Phone */}
          {student.guardiansPhone && (
            <div className="p-1.5 bg-rose-100/90 rounded-xl border border-rose-300 flex items-center gap-2">
              <div className="p-1 bg-rose-600 text-white rounded shrink-0 shadow-2xs">
                <Phone className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <span className="text-rose-700 block font-bold text-[9px] uppercase tracking-wider">Guardian Phone</span>
                <span className="font-bold text-rose-950 text-[10px] font-mono truncate block">{student.guardiansPhone}</span>
              </div>
            </div>
          )}

          {/* Address */}
          {student.address && (
            <div className="p-1.5 bg-indigo-100/90 rounded-xl border border-indigo-300 flex items-start gap-2">
              <div className="p-1 bg-indigo-600 text-white rounded shrink-0 mt-0.5 shadow-2xs">
                <MapPin className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <span className="text-indigo-700 block font-bold text-[9px] uppercase tracking-wider">Address</span>
                <span className="text-indigo-950 text-[10px] leading-tight break-words font-medium">{student.address}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Smart Exam Stats */}
      {studentExams.length > 0 && (
        <div className="bg-amber-50/90 p-2.5 rounded-2xl border border-amber-300/90 shadow-xs space-y-2 text-slate-800" id="smart-exam-stats">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-amber-600 rounded text-white shadow-2xs">
              <Trophy className="w-3 h-3" />
            </div>
            <h3 className="font-display font-black text-amber-950 text-xs">Exam Summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-2 bg-amber-100/90 rounded-xl border border-amber-300">
              <span className="text-[9px] text-amber-800 block font-bold uppercase">Avg Score</span>
              <span className="text-sm font-display font-black text-amber-950">
                {(() => {
                  const presentExams = studentExams.filter(e => e.status === 'Present');
                  if (presentExams.length === 0) return 'N/A';
                  const avgPct = presentExams.reduce((acc, curr) => {
                    const pct = curr.totalMarks > 0 ? (curr.obtainedMarks || 0) / curr.totalMarks : 0;
                    return acc + pct;
                  }, 0) / presentExams.length;
                  return `${Math.round(avgPct * 100)}%`;
                })()}
              </span>
            </div>

            <div className="p-2 bg-indigo-100/90 rounded-xl border border-indigo-300">
              <span className="text-[9px] text-indigo-800 block font-bold uppercase">Attendance</span>
              <span className="text-sm font-display font-black text-indigo-950">
                {(() => {
                  const total = studentExams.length + studentActivities.length;
                  const presentExams = studentExams.filter(e => e.status?.toLowerCase() === 'present').length;
                  const presentActs = studentActivities.filter(a => a.status?.toLowerCase() === 'present').length;
                  const present = presentExams + presentActs;
                  return total > 0 ? `${Math.round((present / total) * 100)}%` : '100%';
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Report Generator Box */}
      <div className="bg-emerald-50/90 p-2.5 rounded-2xl border border-emerald-300/90 shadow-xs space-y-2 text-slate-800" id="report-generator-box">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-emerald-600 rounded text-white shadow-2xs">
            <FileText className="w-3 h-3" />
          </div>
          <h3 className="font-display font-black text-emerald-950 text-xs">PDF Report Card</h3>
        </div>

        {/* Year Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {YEARS.map(y => (
            <button
              key={y}
              onClick={() => handleYearSelect(y)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                selectedYear === y ? 'bg-emerald-600 text-white font-black shadow-xs' : 'bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Month Chips Grid */}
        <div className="grid grid-cols-4 gap-1">
          {MONTH_OPTIONS.map(m => (
            <button
              key={m.value}
              onClick={() => handleMonthSelect(m.value)}
              className={`py-1 rounded text-[9px] font-mono font-bold text-center transition-all cursor-pointer ${
                selectedMonth === m.value ? 'bg-indigo-600 text-white font-black shadow-xs' : 'bg-indigo-100/80 text-indigo-900 hover:bg-indigo-200 border border-indigo-200'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        <button
          onClick={onGeneratePdf}
          disabled={isGeneratingPdf}
          className="w-full py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-black flex items-center justify-center gap-1 shadow-xs border border-emerald-500/40 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
        >
          <Download className="w-3 h-3" />
          <span>{isGeneratingPdf ? 'Generating...' : `Generate (${selectedYear}-${selectedMonth}) PDF`}</span>
        </button>
      </div>
    </div>
  );
}
