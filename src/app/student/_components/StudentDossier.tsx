'use client';

import React, { useState } from 'react';
import { Student, Activity, Exam, Payment } from '@/types';
import { 
  User, Mail, Building, GraduationCap, BookOpen, Layers, 
  Phone, Home, ShieldCheck, Download, Sparkles, FileText, ChevronRight, Award, PhoneCall, Lock, Calendar
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
  onChangePasswordClick
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
    <div className="space-y-2.5 sm:space-y-3 animate-fadeIn" id="student-dossier-panel">
      {/* Primary Dossier Hero Card - Vibrant Pastel Light Scheme */}
      <div className="bg-gradient-to-br from-indigo-50/95 via-sky-50/80 to-emerald-50/90 rounded-2xl p-3 sm:p-4 text-slate-900 shadow-md relative overflow-hidden border-2 border-indigo-200/90">
        {/* Subtle Decorative Ambient Background Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-200/40 via-teal-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-indigo-200/40 via-sky-100/40 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Avatar & Key Metadata Header */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-base sm:text-lg font-black text-white shadow-md shadow-emerald-600/25 border-2 border-white shrink-0">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100/90 text-indigo-950 border border-indigo-300 shadow-2xs">
                  SID: {student.sid}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                  Active Student
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-950 border border-violet-300 shadow-2xs">
                  {student.subject}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-display font-black text-slate-900 tracking-tight truncate">{student.name}</h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] text-sky-950 font-semibold bg-sky-100/90 border border-sky-300/80 px-2 py-0.5 rounded-md shadow-2xs truncate max-w-full">
                  <Building className="w-3 h-3 text-sky-700 shrink-0" />
                  <span className="truncate">{student.college || 'College N/A'}</span>
                </span>
                <span className="text-[10px] text-teal-950 font-semibold bg-teal-100/90 border border-teal-300/80 px-2 py-0.5 rounded-md shadow-2xs">
                  {student.group} Group
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar - Maximum Element-Wise Distinct Light Color Blocks */}
          <div className="pt-2.5 border-t border-indigo-200/70 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div className="bg-amber-100/85 hover:bg-amber-100 p-2 rounded-xl border border-amber-300/90 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-amber-900 uppercase tracking-wider block">Exams Taken</span>
              <span className="text-sm sm:text-base font-black font-mono text-amber-950 mt-0.5 block">{presentExams.length}</span>
            </div>
            <div className="bg-emerald-100/85 hover:bg-emerald-100 p-2 rounded-xl border border-emerald-300/90 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-emerald-900 uppercase tracking-wider block">Avg Exam Score</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-950 mt-0.5 block">{avgPercentage}%</span>
            </div>
            <div className="bg-sky-100/85 hover:bg-sky-100 p-2 rounded-xl border border-sky-300/90 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-sky-900 uppercase tracking-wider block">Attendance</span>
              <span className="text-sm sm:text-base font-black font-mono text-sky-950 mt-0.5 block">{attendancePct}%</span>
            </div>
            <div className="bg-purple-100/85 hover:bg-purple-100 p-2 rounded-xl border border-purple-300/90 shadow-2xs transition-all">
              <span className="text-[8px] sm:text-[9px] font-black text-purple-900 uppercase tracking-wider block">HSC Batch</span>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-purple-950 mt-0.5 block truncate">{formatBatch(student.hscBatch, 'No Batch')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Data Graph & Analytics Chart (Replaces old static profile fields list) */}
      <StudentMonthlyChart
        student={student}
        activities={activities}
        exams={exams}
        payments={payments}
        onViewProfileClick={onEditProfileClick}
      />

      {/* Academic Report Card (PDF Download Section - Warm Pastel Amber/Yellow Scheme) */}
      <div className="bg-gradient-to-br from-amber-50/95 via-orange-50/70 to-yellow-50/90 text-slate-900 p-3 sm:p-4 rounded-2xl border-2 border-amber-200/90 shadow-md space-y-2.5 animate-fadeIn" id="student-pdf-report-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-200/80 text-amber-900 rounded-xl border border-amber-300 shadow-2xs shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-amber-950 text-xs sm:text-sm">Academic Transcript & Report Card (PDF)</h3>
              <p className="text-[10px] text-amber-900/80 font-medium leading-relaxed">
                Generate and download monthly academic transcript with attendance and exam scores.
              </p>
            </div>
          </div>
          <div className="px-2 py-0.5 bg-amber-100 border border-amber-300 rounded-lg text-[10px] font-mono font-black text-amber-950 self-start sm:self-center shrink-0 shadow-2xs">
            {getMonthName(selectedMonth)} {selectedYear}
          </div>
        </div>

        <div className="space-y-2 pt-0.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Month Select Dropdown with Light Amber Background */}
            <div className="bg-amber-100/70 p-2 rounded-xl border border-amber-300/80">
              <label htmlFor="student-report-select-month" className="block text-[9px] font-black text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-2.5 h-2.5 text-amber-700" /> Evaluation Month
              </label>
              <select
                id="student-report-select-month"
                value={selectedMonth}
                onChange={(e) => handleMonthSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-amber-50/90 border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-amber-950 cursor-pointer shadow-2xs"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-amber-50 text-amber-950">
                    {m.name} ({m.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Select Dropdown with Light Teal/Amber Background */}
            <div className="bg-teal-100/70 p-2 rounded-xl border border-teal-300/80">
              <label htmlFor="student-report-select-year" className="block text-[9px] font-black text-teal-900 uppercase tracking-wider mb-1 flex items-center gap-1 font-mono">
                <Calendar className="w-2.5 h-2.5 text-teal-700" /> Evaluation Year
              </label>
              <select
                id="student-report-select-year"
                value={selectedYear}
                onChange={(e) => handleYearSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-teal-50/90 border border-teal-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-teal-950 cursor-pointer shadow-2xs"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-teal-50 text-teal-950">
                    Year {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presets and Download Button Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-amber-200/70">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black text-amber-900 uppercase tracking-wider font-mono bg-amber-200/60 px-1.5 py-0.5 rounded border border-amber-300/60">Presets:</span>
              <button
                type="button"
                onClick={() => handleQuickPreset('current')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  reportMonth === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-100 text-emerald-950 hover:bg-emerald-200 border border-emerald-300'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('previous')}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-100 text-sky-950 hover:bg-sky-200 border border-sky-300 transition-all cursor-pointer"
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
