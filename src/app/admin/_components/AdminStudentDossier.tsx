'use client';

import React, { useState } from 'react';
import { Student, Exam, Activity } from '@/types';
import {
  Phone,
  Layers,
  Hash,
  BookOpen,
  MapPin,
  Trophy,
  FileText,
  Download,
  Mail,
  Edit3,
  Key,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  CheckCircle2,
  Building2,
  GraduationCap,
  Users,
  ShieldAlert,
  Activity as ActivityIcon,
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Stats Calculations
  const presentExams = studentExams.filter((e) => e.status === 'Present');
  const avgExamPct =
    presentExams.length > 0
      ? Math.round(
          (presentExams.reduce((acc, curr) => {
            const pct = curr.totalMarks > 0 ? (curr.obtainedMarks || 0) / curr.totalMarks : 0;
            return acc + pct;
          }, 0) /
            presentExams.length) *
            100
        )
      : null;

  const totalSessions = studentExams.length + studentActivities.length;
  const presentSessions =
    studentExams.filter((e) => e.status?.toLowerCase() === 'present').length +
    studentActivities.filter((a) => a.status?.toLowerCase() === 'present').length;
  const attendanceRate =
    totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  const isRevoked = student.isApproved === 'no' || student.status === 'revoked';

  return (
    <div className="w-full space-y-3.5" id="admin-student-dossier-wrapper">
      {/* Decorative, Colorful, Glowing, Realigned Banner Card */}
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 border-2 border-indigo-200/90 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/40 backdrop-blur-xl shadow-[0_10px_35px_-4px_rgba(79,70,229,0.15)] transition-all duration-300 hover:shadow-[0_16px_45px_-4px_rgba(79,70,229,0.20)]">
        {/* Ambient Multi-Colored Glowing Orbs */}
        <div className="absolute -top-14 -left-14 w-48 h-48 bg-gradient-to-br from-cyan-400/25 via-sky-400/20 to-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-14 -right-14 w-52 h-52 bg-gradient-to-bl from-purple-500/25 via-fuchsia-500/15 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 left-1/3 w-44 h-44 bg-gradient-to-tr from-amber-400/20 via-orange-400/15 to-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:18px_18px] opacity-[0.035] pointer-events-none" />

        {/* Card Content Stack */}
        <div className="relative z-10 space-y-3.5">
          {/* 1. Header Row: Avatar, Student Name, Status, and Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100/80">
            {/* Identity Group */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Glowing Avatar */}
              <div className="relative shrink-0">
                <div className="p-0.5 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-[14px] bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-inner relative overflow-hidden">
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white/20 blur-xs pointer-events-none" />
                    <span className="relative z-10 tracking-tight">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Beacon */}
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    isRevoked ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  title={isRevoked ? 'Access Revoked' : 'Active Student'}
                >
                  {!isRevoked && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </div>

              {/* Name & Primary Badges */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                    {student.name}
                  </h2>

                  {/* Student ID Badge */}
                  <span className="text-[10px] sm:text-[10.5px] font-black font-mono bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white px-2.5 py-0.5 rounded-lg shadow-[0_2px_8px_rgba(79,70,229,0.3)] border border-indigo-400/40 flex items-center gap-1 shrink-0">
                    <Hash className="w-3 h-3 text-indigo-200" />
                    <span>ID: {student.sid}</span>
                  </span>

                  {/* Active / Revoked Badge */}
                  {isRevoked ? (
                    <span className="text-[10px] font-extrabold bg-gradient-to-r from-rose-500/15 to-pink-500/15 text-rose-800 border border-rose-400/60 px-2 py-0.5 rounded-lg shadow-[0_0_10px_rgba(244,63,94,0.15)] flex items-center gap-1 shrink-0">
                      <ShieldAlert className="w-3 h-3 text-rose-600" />
                      <span>Revoked</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-800 border border-emerald-400/60 px-2 py-0.5 rounded-lg shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons Cluster */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-end sm:self-center">
              {onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_5px_18px_rgba(99,102,241,0.45)] border border-white/20 active:scale-95 shrink-0"
                  title="Edit Student Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="font-bold">Edit</span>
                </button>
              )}

              {onChangePassword && (
                <button
                  type="button"
                  onClick={onChangePassword}
                  className="px-3 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_12px_rgba(245,158,11,0.3)] hover:shadow-[0_5px_18px_rgba(245,158,11,0.45)] border border-white/20 active:scale-95 shrink-0"
                  title="Change Password"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span className="font-bold">Pass</span>
                </button>
              )}

              {/* Full Dossier Toggle Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_3px_14px_rgba(15,23,42,0.25)] hover:shadow-[0_5px_20px_rgba(15,23,42,0.35)] border active:scale-95 shrink-0 ${
                  isExpanded
                    ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white border-indigo-400/50 shadow-[0_4px_16px_rgba(79,70,229,0.35)]'
                    : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:from-slate-800 hover:to-indigo-900 border-indigo-400/30'
                }`}
                title={isExpanded ? 'Hide Full Dossier' : 'Show Full Dossier & PDF Report Card'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
                <span className="whitespace-nowrap font-extrabold">
                  {isExpanded ? 'Hide Dossier' : 'Full Dossier & PDF'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-indigo-200 shrink-0 transition-transform" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-200 shrink-0 transition-transform" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Middle Row: Dedicated Academic Badges Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
            {/* College Badge */}
            <span className="bg-white/95 text-sky-950 border border-sky-300/90 px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-[0_2px_6px_rgba(14,165,233,0.1)] max-w-full truncate">
              <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{student.college || 'Institution N/A'}</span>
            </span>

            {/* HSC Batch Badge */}
            <span className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border border-emerald-300/90 px-2.5 py-1 rounded-xl font-mono font-black text-xs flex items-center gap-1.5 shadow-[0_2px_6px_rgba(16,185,129,0.12)] shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{formatBatch(student.hscBatch)}</span>
            </span>

            {/* Subject Badge */}
            {student.subject && (
              <span className="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-950 border border-purple-300/90 px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-[0_2px_6px_rgba(147,51,234,0.12)] shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>{student.subject}</span>
              </span>
            )}

            {/* Group Badge */}
            {student.group && (
              <span className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950 border border-amber-300/90 px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-[0_2px_6px_rgba(245,158,11,0.1)] shrink-0">
                <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{student.group}</span>
              </span>
            )}
          </div>

          {/* 3. Bottom Row: Responsive Glowing Stat Pods Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
            {/* Attendance Pod */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-50/90 via-sky-50/70 to-blue-50/90 border-2 border-cyan-400/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(6,182,212,0.18)] flex items-center gap-2.5">
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-cyan-400/30 rounded-full blur-md pointer-events-none" />
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_2px_8px_rgba(6,182,212,0.35)] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black font-mono uppercase tracking-wider text-cyan-800 block leading-tight">
                  ATTENDANCE
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-900 leading-tight block">
                  {attendanceRate}%
                </span>
              </div>
            </div>

            {/* Average Exam Pod */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-50/90 via-yellow-50/70 to-orange-50/90 border-2 border-amber-400/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(245,158,11,0.18)] flex items-center gap-2.5">
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400/30 rounded-full blur-md pointer-events-none" />
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.35)] shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black font-mono uppercase tracking-wider text-amber-800 block leading-tight">
                  AVG EXAM
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-900 leading-tight block">
                  {avgExamPct !== null ? `${avgExamPct}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Total Sessions / Exams Pod (spans 2 on mobile if odd, or 1 on sm+) */}
            <div className="col-span-2 sm:col-span-1 relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-violet-50/90 border-2 border-indigo-300/80 rounded-2xl p-2.5 sm:p-3 shadow-[0_4px_16px_rgba(99,102,241,0.15)] flex items-center gap-2.5">
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-indigo-400/25 rounded-full blur-md pointer-events-none" />
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)] shrink-0">
                <ActivityIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black font-mono uppercase tracking-wider text-indigo-800 block leading-tight">
                  LOGGED ENTRIES
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-900 leading-tight block">
                  {totalSessions} <span className="text-xs font-bold text-slate-500 font-sans">records</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Dossier Details & PDF Generator (with Matching Glowing Theme) */}
      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 animate-fadeIn">
          {/* Detailed Academic Profile & Contact Pod (7 cols) */}
          <div className="lg:col-span-7 relative overflow-hidden bg-white/95 p-4 sm:p-5 rounded-3xl border-2 border-indigo-200/90 shadow-[0_8px_30px_-6px_rgba(79,70,229,0.14)] space-y-3.5">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-indigo-100/90 pb-2.5 relative z-10">
              <h3 className="font-display font-black text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shadow-2xs">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Student Academic Profile &amp; Contact</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                Verified Dossier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs relative z-10">
              {/* Email */}
              <div className="p-2.5 bg-gradient-to-r from-violet-50/90 to-purple-50/90 rounded-2xl border border-violet-200/90 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-xl shrink-0 shadow-2xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-violet-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                    Email Address
                  </span>
                  <span
                    className="font-bold text-violet-950 text-xs truncate block"
                    title={student.email || 'Not specified'}
                  >
                    {student.email || 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="p-2.5 bg-gradient-to-r from-teal-50/90 to-emerald-50/90 rounded-2xl border border-teal-200/90 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-xl shrink-0 shadow-2xs">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-teal-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                    Student Mobile
                  </span>
                  <span className="font-bold text-teal-950 text-xs font-mono truncate block">
                    {student.mobile || 'N/A'}
                  </span>
                </div>
              </div>

              {/* College */}
              <div className="p-2.5 bg-gradient-to-r from-sky-50/90 to-blue-50/90 rounded-2xl border border-sky-200/90 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-gradient-to-br from-sky-600 to-blue-600 text-white rounded-xl shrink-0 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sky-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                    Institution / College
                  </span>
                  <span className="font-bold text-sky-950 text-xs truncate block">
                    {student.college || 'N/A'}
                  </span>
                </div>
              </div>

              {/* HSC Batch */}
              <div className="p-2.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/90 rounded-2xl border border-emerald-200/90 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-xl shrink-0 shadow-2xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-emerald-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                    HSC Batch
                  </span>
                  <span className="font-black text-emerald-950 text-xs font-mono truncate block">
                    {formatBatch(student.hscBatch)}
                  </span>
                </div>
              </div>

              {/* Group */}
              <div className="p-2.5 bg-gradient-to-r from-purple-50/90 to-indigo-50/90 rounded-2xl border border-purple-200/90 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl shrink-0 shadow-2xs">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-purple-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                    Academic Group
                  </span>
                  <span className="font-bold text-purple-950 text-xs truncate block">
                    {student.group || 'Science / General'}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="p-2.5 bg-gradient-to-r from-amber-50/90 to-orange-50/90 rounded-2xl border border-amber-200/90 flex items-center gap-2.5 shadow-2xs">
                <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-600 text-white rounded-xl shrink-0 shadow-2xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-amber-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                    Enrolled Subject
                  </span>
                  <span className="font-bold text-amber-950 text-xs truncate block">
                    {student.subject || 'All Core Subjects'}
                  </span>
                </div>
              </div>

              {/* Guardian Phone */}
              {student.guardiansPhone && (
                <div className="p-2.5 bg-gradient-to-r from-rose-50/90 to-pink-50/90 rounded-2xl border border-rose-200/90 flex items-center gap-2.5 shadow-2xs">
                  <div className="p-2 bg-gradient-to-br from-rose-600 to-pink-600 text-white rounded-xl shrink-0 shadow-2xs">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-rose-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                      Guardian Phone
                    </span>
                    <span className="font-bold text-rose-950 text-xs font-mono truncate block">
                      {student.guardiansPhone}
                    </span>
                  </div>
                </div>
              )}

              {/* Address */}
              {student.address && (
                <div className="p-2.5 bg-gradient-to-r from-indigo-50/90 to-sky-50/90 rounded-2xl border border-indigo-200/90 flex items-start gap-2.5 sm:col-span-2 shadow-2xs">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-indigo-700 block font-black text-[9px] uppercase tracking-wider font-mono">
                      Residential Address
                    </span>
                    <span className="text-indigo-950 text-xs leading-relaxed font-semibold break-words">
                      {student.address}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PDF Report Card Generator Pod (5 cols) */}
          <div className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/95 p-4 sm:p-5 rounded-3xl border-2 border-emerald-300 shadow-[0_8px_30px_-6px_rgba(16,185,129,0.18)] flex flex-col justify-between space-y-3.5">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-400/25 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2.5 border-b border-emerald-200/90 pb-2.5">
                <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-[0_2px_8px_rgba(16,185,129,0.4)] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-emerald-950 text-xs sm:text-sm">
                    Monthly PDF Report Card
                  </h3>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Generate transcript &amp; attendance scorecard
                  </p>
                </div>
              </div>

              {/* Year Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-emerald-950 uppercase font-mono block tracking-wide">
                  SELECT YEAR:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleYearSelect(y)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedYear === y
                          ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-black shadow-[0_2px_8px_rgba(16,185,129,0.35)]'
                          : 'bg-white text-emerald-950 hover:bg-emerald-100 border border-emerald-300/80 shadow-2xs'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-emerald-950 uppercase font-mono block tracking-wide">
                  SELECT MONTH:
                </span>
                <div className="grid grid-cols-6 gap-1">
                  {MONTH_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleMonthSelect(m.value)}
                      className={`py-1.5 rounded-xl text-[10px] font-mono font-bold text-center transition-all cursor-pointer ${
                        selectedMonth === m.value
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-[0_2px_8px_rgba(79,70,229,0.35)]'
                          : 'bg-white text-slate-700 hover:bg-emerald-100 border border-emerald-200/90 shadow-2xs'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Glowing Download PDF CTA */}
            <button
              type="button"
              onClick={onGeneratePdf}
              disabled={isGeneratingPdf}
              className="relative z-10 w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.5)] border border-emerald-400/40 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 drop-shadow-xs" />
              <span>
                {isGeneratingPdf
                  ? 'Generating PDF Card...'
                  : `Export ${selectedYear}-${selectedMonth} Report Card`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
