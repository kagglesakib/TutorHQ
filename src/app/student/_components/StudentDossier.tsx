'use client';

import React from 'react';
import Link from 'next/link';
import { Student, Activity, Exam, Payment } from '@/types';
import {
  User, GraduationCap, Building, BookOpen, Phone, Mail,
  MapPin, Edit3, Lock, Award, Calendar, Banknote,
  ClipboardList, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import { formatBatch } from '@/utils/formatBatch';

interface StudentDossierProps {
  student: Student;
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  onEditProfileClick: () => void;
  onChangePasswordClick: () => void;
}

export default function StudentDossier({
  student,
  activities,
  exams,
  payments,
  onEditProfileClick,
  onChangePasswordClick,
}: StudentDossierProps) {
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const presentActivities = activities.filter(a => a.status === 'Present').length;
  const attendanceRate = activities.length > 0 ? Math.round((presentActivities / activities.length) * 100) : 100;

  const recentActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  const recentExams = [...exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* 1. Header Profile Banner Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 border border-emerald-700/80 shadow-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-emerald-300 shadow-xs shrink-0">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                  {student.name}
                </h2>
                <span className="text-xs bg-emerald-400 text-emerald-950 font-mono font-black px-2 py-0.5 rounded-md shadow-xs">
                  SID: {student.sid}
                </span>
                <span className="text-[10px] bg-emerald-900/90 text-emerald-200 border border-emerald-700 px-2 py-0.5 rounded-md font-mono font-bold">
                  {formatBatch(student.hscBatch, 'Batch N/A')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1 flex items-center gap-2 flex-wrap">
                {student.college && <span>🎓 {student.college}</span>}
                {student.subject && <span>📚 {student.subject}</span>}
                {student.group && <span>👥 {student.group}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onEditProfileClick}
              className="px-3.5 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={onChangePasswordClick}
              className="px-3.5 py-1.5 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold text-xs rounded-xl border border-emerald-600/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Academic Stats Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Attendance & Lessons */}
        <Link
          href="/student/lessons"
          className="p-3.5 bg-gradient-to-br from-indigo-100/90 via-sky-50/80 to-indigo-100/70 border border-indigo-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">Lessons</span>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-indigo-950 mt-1">{activities.length}</p>
          <p className="text-[10px] text-indigo-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>{attendanceRate}% Attendance Rate</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>

        {/* Exams Logged */}
        <Link
          href="/student/exams"
          className="p-3.5 bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-amber-100/70 border border-amber-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">Exams Taken</span>
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-amber-950 mt-1">{exams.length}</p>
          <p className="text-[10px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>View All Scorecards</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>

        {/* Payments Made */}
        <Link
          href="/student/payments"
          className="p-3.5 bg-gradient-to-br from-teal-100/90 via-emerald-50/80 to-teal-100/70 border border-teal-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-teal-900 uppercase tracking-wider">Tuition Paid</span>
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-teal-950 mt-1 font-mono">
            ৳{totalPaid.toLocaleString()}
          </p>
          <p className="text-[10px] text-teal-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>{payments.length} Payments Recorded</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>

        {/* Academic Status */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-100/90 via-teal-50/80 to-emerald-100/70 border border-emerald-300/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">Status</span>
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-emerald-950 mt-1">Active</p>
          <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">Enrolled Student</p>
        </div>
      </div>

      {/* 3. Detailed Contact & Academic Credentials Card */}
      <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-3 shadow-2xs">
        <h3 className="font-display font-black text-slate-900 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" />
          <span>Student Dossier & Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">Mobile Phone</span>
            <p className="font-mono font-bold text-slate-800">{student.mobile || 'Not set'}</p>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">Guardian Phone</span>
            <p className="font-mono font-bold text-slate-800">{student.guardiansPhone || 'Not set'}</p>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400">Email Address</span>
            <p className="font-semibold text-slate-800 truncate">{student.email || 'Not set'}</p>
          </div>

          <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-0.5 sm:col-span-2 lg:col-span-3">
            <span className="text-[10px] font-bold text-slate-400">Residential Address</span>
            <p className="font-semibold text-slate-800">{student.address || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* 4. Recent Study Logs & Exams Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Lessons */}
        <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black text-slate-900">Recent Lesson Records</h4>
            </div>
            <Link href="/student/lessons" className="text-[10px] font-bold text-indigo-700 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act.aid} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">{act.subjectTuitioned || 'Study Session'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{act.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {act.hwMarks !== undefined && (
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                        HW: {act.hwMarks}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        act.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No lesson records yet</p>
            )}
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                <ClipboardList className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-black text-slate-900">Recent Exam Scorecards</h4>
            </div>
            <Link href="/student/exams" className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          <div className="space-y-1.5">
            {recentExams.length > 0 ? (
              recentExams.map((exam) => (
                <div key={exam.eid} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">{exam.subjectAndTopic}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{exam.date}</span>
                  </div>
                  {exam.obtainedMarks !== undefined && (
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg">
                      {exam.obtainedMarks} / {exam.totalMarks}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No exam records yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
