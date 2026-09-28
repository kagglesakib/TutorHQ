'use client';

import React, { useState } from 'react';
import { Student, Activity, Exam, Payment } from '@/types';
import { 
  Building, ShieldCheck, Download, FileText, Calendar
} from 'lucide-react';
import { generatePdfReport } from '@/utils/pdfGenerator';
import { formatBatch } from '@/utils/formatBatch';
import StudentMonthlyChart from './StudentMonthlyChart';

interface StudentDossierProps {
  student: Student;
  activities: Activity[];
  exams: Exam[];
  payments?: Payment[];
  onEditProfileClick: () => void;
  onChangePasswordClick: () => void;
}

export default function StudentDossier({
  student,
  activities,
  exams,
  payments = [],
  onEditProfileClick,
}: StudentDossierProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const currentYearNum = new Date().getFullYear();
  const YEARS = Array.from({ length: 6 }, (_, i) => String(currentYearNum - 3 + i));

  const MONTH_OPTIONS = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' },
  ];

  const [selectedYear, selectedMonth] = (() => {
    const parts = reportMonth.split('-');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return [parts[0], parts[1]];
    }
    const now = new Date();
    return [String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0')];
  })();

  const getMonthName = (mStr: string) => {
    const mObj = MONTH_OPTIONS.find(m => m.value === mStr);
    return mObj ? mObj.name : mStr;
  };

  const handleMonthSelect = (mVal: string) => {
    setReportMonth(`${selectedYear}-${mVal}`);
  };

  const handleYearSelect = (yVal: string) => {
    setReportMonth(`${yVal}-${selectedMonth}`);
  };

  const handleQuickPreset = (type: 'current' | 'previous') => {
    const d = new Date();
    if (type === 'previous') {
      d.setMonth(d.getMonth() - 1);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setReportMonth(`${y}-${m}`);
  };

  // Student's exam & activity statistics
  const studentActivities = activities.filter(a => a.studentSid === student.sid);
  const studentExams = exams.filter(e => e.studentSid === student.sid);

  const presentExams = studentExams.filter(e => e.status?.toLowerCase() === 'present');
  const presentActivities = studentActivities.filter(a => a.status?.toLowerCase() === 'present');

  const totalObtained = presentExams.reduce((acc, curr) => acc + (curr.obtainedMarks || 0), 0);
  const totalPossible = presentExams.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const avgPercentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;

  const totalSessions = studentActivities.length + studentExams.length;
  const totalPresent = presentActivities.length + presentExams.length;
  const attendancePct = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 100;

  // Generate PDF report card for student
  const handleExportPDF = () => {
    generatePdfReport(student, activities, exams, reportMonth, setIsGeneratingPdf);
    const el = document.getElementById('student-pdf-report-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-3 animate-fadeIn" id="student-dossier-panel">
      {/* Primary Dossier Hero Card - Light / Dark Responsive Design */}
      <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/80 to-emerald-50/90 dark:from-slate-900/95 dark:via-indigo-950/60 dark:to-slate-900/95 rounded-2xl p-3 sm:p-4 text-slate-900 dark:text-white shadow-md dark:shadow-[0_0_30px_rgba(99,102,241,0.12)] relative overflow-hidden border-2 border-indigo-200/90 dark:border-indigo-500/30 transition-all duration-200">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-200/40 via-teal-100/40 to-transparent dark:from-emerald-500/10 dark:via-teal-500/5 dark:to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-indigo-200/40 via-sky-100/40 to-transparent dark:from-indigo-500/15 dark:via-sky-500/5 dark:to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Avatar & Key Metadata Header */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-base sm:text-lg font-black text-white shadow-md shadow-emerald-600/25 border-2 border-white dark:border-slate-700 shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100/90 dark:bg-indigo-950/80 text-indigo-950 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-500/40 shadow-2xs">
                  SID: {student.sid}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400" />
                  Active Student
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/80 text-violet-950 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40 shadow-2xs">
                  {student.subject}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-display font-black text-slate-900 dark:text-white tracking-tight truncate">{student.name}</h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] text-sky-950 dark:text-sky-200 font-semibold bg-sky-100/90 dark:bg-slate-800/90 border border-sky-300/80 dark:border-sky-500/30 px-2 py-0.5 rounded-md shadow-2xs truncate max-w-full">
                  <Building className="w-3 h-3 text-sky-700 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{student.college || 'College N/A'}</span>
                </span>
                <span className="text-[10px] text-teal-950 dark:text-teal-200 font-semibold bg-teal-100/90 dark:bg-slate-800/90 border border-teal-300/80 dark:border-teal-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                  {student.group} Group
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-2.5 border-t border-indigo-200/70 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="bg-amber-100/85 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 p-2 rounded-xl border border-amber-300/90 dark:border-amber-500/30 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-amber-900 dark:text-amber-400 uppercase tracking-wider block">Exams Taken</span>
              <span className="text-sm sm:text-base font-black font-mono text-amber-950 dark:text-amber-200 mt-0.5 block">{presentExams.length}</span>
            </div>
            <div className="bg-emerald-100/85 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 p-2 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-wider block">Avg Exam Score</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-950 dark:text-emerald-200 mt-0.5 block">{avgPercentage}%</span>
            </div>
            <div className="bg-sky-100/85 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-950/60 p-2 rounded-xl border border-sky-300/90 dark:border-sky-500/30 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-sky-900 dark:text-sky-400 uppercase tracking-wider block">Attendance</span>
              <span className="text-sm sm:text-base font-black font-mono text-sky-950 dark:text-sky-200 mt-0.5 block">{attendancePct}%</span>
            </div>
            <div className="bg-purple-100/85 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-950/60 p-2 rounded-xl border border-purple-300/90 dark:border-purple-500/30 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-purple-900 dark:text-purple-400 uppercase tracking-wider block">HSC Batch</span>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-purple-950 dark:text-purple-200 mt-0.5 block truncate">{formatBatch(student.hscBatch, 'No Batch')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Data Graph & Analytics Chart */}
      <StudentMonthlyChart
        student={student}
        activities={activities}
        exams={exams}
        payments={payments}
        onViewProfileClick={onEditProfileClick}
      />

      {/* Academic Report Card (PDF Download Section) */}
      <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-yellow-50/90 dark:from-slate-900/95 dark:via-amber-950/30 dark:to-slate-900/95 text-slate-900 dark:text-white p-3 sm:p-4 rounded-2xl border-2 border-amber-200/90 dark:border-amber-500/30 shadow-md dark:shadow-[0_0_25px_rgba(245,158,11,0.1)] space-y-2.5 animate-fadeIn transition-all duration-200" id="student-pdf-report-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-200/80 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-xl border border-amber-300 dark:border-amber-500/40 shadow-2xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-amber-950 dark:text-amber-300 text-xs sm:text-sm">Academic Transcript & Report Card (PDF)</h3>
              <p className="text-[10px] text-amber-900/80 dark:text-slate-300 font-medium leading-relaxed">
                Generate and download monthly academic transcript with attendance and exam scores.
              </p>
            </div>
          </div>
          <div className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 rounded-lg text-[10px] font-mono font-black text-amber-950 dark:text-amber-200 self-start sm:self-center shrink-0 shadow-2xs">
            {getMonthName(selectedMonth)} {selectedYear}
          </div>
        </div>

        <div className="space-y-2 pt-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Month Select Dropdown */}
            <div className="bg-amber-100/70 dark:bg-slate-900/80 p-2 rounded-xl border border-amber-300/80 dark:border-amber-500/30">
              <label htmlFor="student-report-select-month" className="block text-[9px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" /> Evaluation Month
              </label>
              <select
                id="student-report-select-month"
                value={selectedMonth}
                onChange={(e) => handleMonthSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-amber-50/90 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/40 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-amber-950 dark:text-amber-200 cursor-pointer shadow-2xs"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    {m.name} ({m.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select Dropdown */}
            <div className="bg-teal-100/70 dark:bg-slate-900/80 p-2 rounded-xl border border-teal-300/80 dark:border-teal-500/30">
              <label htmlFor="student-report-select-year" className="block text-[9px] font-black text-teal-900 dark:text-teal-300 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-2.5 h-2.5 text-teal-700 dark:text-teal-400" /> Evaluation Year
              </label>
              <select
                id="student-report-select-year"
                value={selectedYear}
                onChange={(e) => handleYearSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-teal-50/90 dark:bg-slate-950 border border-teal-300 dark:border-teal-500/40 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-teal-950 dark:text-teal-200 cursor-pointer shadow-2xs"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presets and Download Button Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-amber-200/70 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider font-mono bg-amber-200/60 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300/60 dark:border-amber-500/40">Presets:</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('current')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  reportMonth === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-500/40'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('previous')}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-950 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900 border border-sky-300 dark:border-sky-500/40 transition-all cursor-pointer"
              >
                Last Month
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isGeneratingPdf}
              className="py-1.5 px-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 disabled:opacity-50 text-white font-black rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md border border-emerald-500"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Generating...' : `Download ${getMonthName(selectedMonth)} ${selectedYear} PDF`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
