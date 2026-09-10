'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Student, Activity, Exam, Payment } from '@/types';
import {
  Users, BookOpen, ClipboardList, Banknote, Plus, ArrowRight,
  TrendingUp, Calendar, GraduationCap, CheckCircle2, Search,
  Award, ShieldCheck, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import StudentList from './StudentList';
import StudentForm from './StudentForm';
import { formatBatch } from '@/utils/formatBatch';

interface AdminPortalProps {
  students: Student[];
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  onRefreshData: () => Promise<void> | void;
  onSelectStudent: (sid: string) => void;
  onSaveStudent: (formData: Student, originalSid?: string) => Promise<void> | void;
  onDeleteStudent: (sid: string) => Promise<void> | void;
  onAddActivity: (actData: Activity) => Promise<void> | void;
  onAddExam: (examData: Exam) => Promise<void> | void;
  onAddPayment: (payData: Payment) => Promise<void> | void;
}

export default function AdminPortal({
  students,
  activities,
  exams,
  payments,
  onRefreshData,
  onSelectStudent,
  onSaveStudent,
  onDeleteStudent,
  onAddActivity,
  onAddExam,
  onAddPayment,
}: AdminPortalProps) {
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const uniqueBatches = Array.from(new Set(students.map(s => s.hscBatch).filter(Boolean)));
  const recentActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const recentExams = [...exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 1. Top Metrics Matrix Cards (Light Aesthetic Pastel Theme) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Students */}
        <Link
          href="/admin/students"
          className="p-3.5 bg-gradient-to-br from-emerald-100/90 via-teal-50/80 to-emerald-100/70 border border-emerald-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">Students</span>
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-emerald-950 mt-1">{students.length}</p>
          <p className="text-[10px] text-emerald-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>{uniqueBatches.length} Active Batches</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>

        {/* Daily Lessons */}
        <Link
          href="/admin/tracking"
          className="p-3.5 bg-gradient-to-br from-indigo-100/90 via-sky-50/80 to-indigo-100/70 border border-indigo-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">Lessons Logged</span>
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-indigo-950 mt-1">{activities.length}</p>
          <p className="text-[10px] text-indigo-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>Daily Attendance & CW</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>

        {/* Exams Logged */}
        <Link
          href="/admin/exams"
          className="p-3.5 bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-amber-100/70 border border-amber-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">Exams Ledger</span>
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-amber-950 mt-1">{exams.length}</p>
          <p className="text-[10px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>Tests & Scorecards</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>

        {/* Total Tuition Received */}
        <Link
          href="/admin/payments"
          className="p-3.5 bg-gradient-to-br from-teal-100/90 via-emerald-50/80 to-teal-100/70 border border-teal-300/80 rounded-2xl shadow-2xs hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-teal-900 uppercase tracking-wider">Tuition Ledger</span>
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-2xs group-hover:scale-105 transition-transform">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-teal-950 mt-1 font-mono">
            ৳{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[10px] text-teal-800 font-semibold mt-0.5 flex items-center gap-1">
            <span>{payments.length} Payments Recorded</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </p>
        </Link>
      </div>

      {/* 2. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Student Directory */}
        <div className="lg:col-span-5 h-[580px]">
          <StudentList
            students={students}
            selectedStudentId={null}
            onSelectStudent={onSelectStudent}
            onAddStudentClick={() => setIsAddingStudent(true)}
          />
        </div>

        {/* Right Column: Dynamic Form or Recent Overview Highlights */}
        <div className="lg:col-span-7 space-y-4">
          {isAddingStudent ? (
            <StudentForm
              existingSids={students.map(s => s.sid)}
              onSave={async (data) => {
                await onSaveStudent(data);
                setIsAddingStudent(false);
              }}
              onCancel={() => setIsAddingStudent(false)}
            />
          ) : (
            <div className="space-y-4">
              {/* Quick Action Shortcuts Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-100 via-teal-100 to-indigo-100 border border-emerald-300 rounded-3xl shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-sm sm:text-base">
                      Quick Student Enrollment
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      Add a new student profile and initiate their study tracker
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingStudent(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll</span>
                </button>
              </div>

              {/* Recent Lessons Activity Panel */}
              <div className="p-4 bg-slate-100/90 border border-slate-300 rounded-3xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900">Recent Lesson Records</h4>
                  </div>
                  <Link
                    href="/admin/tracking"
                    className="text-[10px] font-bold text-indigo-700 hover:underline flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                <div className="space-y-1.5">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => {
                      const student = students.find(s => s.sid === act.studentSid);
                      return (
                        <div
                          key={act.aid}
                          onClick={() => onSelectStudent(act.studentSid)}
                          className="p-2 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 px-1.5 py-0.2 rounded">
                              {act.studentSid}
                            </span>
                            <span className="font-bold text-slate-800 truncate text-[11px]">
                              {student?.name || act.studentSid}
                            </span>
                            {act.subjectTuitioned && (
                              <span className="text-[10px] text-slate-500 font-medium truncate hidden sm:inline">
                                • {act.subjectTuitioned}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] text-slate-500 font-mono">{act.date}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                act.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {act.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">No recent lesson records</p>
                  )}
                </div>
              </div>

              {/* Recent Exams Panel */}
              <div className="p-4 bg-slate-100/90 border border-slate-300 rounded-3xl shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-600 text-white rounded-lg">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900">Recent Exam Scorecards</h4>
                  </div>
                  <Link
                    href="/admin/exams"
                    className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>

                <div className="space-y-1.5">
                  {recentExams.length > 0 ? (
                    recentExams.map((exam) => {
                      const student = students.find(s => s.sid === exam.studentSid);
                      return (
                        <div
                          key={exam.eid}
                          onClick={() => onSelectStudent(exam.studentSid)}
                          className="p-2 bg-white border border-slate-200 hover:border-amber-300 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                              {exam.studentSid}
                            </span>
                            <span className="font-bold text-slate-800 truncate text-[11px]">
                              {student?.name || exam.studentSid}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate hidden sm:inline">
                              • {exam.subjectAndTopic}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {exam.obtainedMarks !== undefined && (
                              <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded">
                                {exam.obtainedMarks}/{exam.totalMarks}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-500 font-mono">{exam.date}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">No recent exam records</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
