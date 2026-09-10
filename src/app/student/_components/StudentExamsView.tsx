'use client';

import React, { useState } from 'react';
import { Student, Exam } from '@/types';
import { ClipboardList, Award, Calendar, Search, ArrowLeft, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { formatEid } from '@/utils/id';

interface StudentExamsViewProps {
  student: Student;
  exams: Exam[];
}

export default function StudentExamsView({ student, exams }: StudentExamsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = exams.filter(
    (e) =>
      e.subjectAndTopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.eid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.remarks && e.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedExams = [...filteredExams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Statistics
  const attendedExams = exams.filter(e => e.status === 'Present' && e.obtainedMarks !== undefined);
  const averagePercentage = attendedExams.length > 0
    ? Math.round(
        attendedExams.reduce((sum, e) => sum + ((e.obtainedMarks || 0) / (e.totalMarks || 1)) * 100, 0) /
          attendedExams.length
      )
    : 0;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-slate-900 text-base sm:text-lg">
                  Examination Scorecards
                </h2>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold px-2 py-0.5 rounded-full">
                  {exams.length} Tests Taken
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Academic performance and assessment reports</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold block leading-tight">Average Score</span>
                <span className="text-xs font-mono font-black text-amber-900">{averagePercentage}%</span>
              </div>
            </div>

            <div className="relative bg-white rounded-xl border border-slate-300 p-1 flex items-center focus-within:ring-2 focus-within:ring-amber-500">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topic or test..."
                className="py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-2">
          {sortedExams.length > 0 ? (
            sortedExams.map((exam) => {
              const percentage =
                exam.obtainedMarks !== undefined && exam.totalMarks > 0
                  ? Math.round((exam.obtainedMarks / exam.totalMarks) * 100)
                  : null;

              return (
                <div
                  key={exam.eid}
                  className="p-3 bg-white border border-slate-200 hover:border-amber-300 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg">
                      {formatEid(exam.eid)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-100 px-1.5 py-0.2 rounded">
                      <Calendar className="w-3 h-3" />
                      {exam.date}
                    </span>
                    <span className="font-bold text-slate-900 text-xs truncate max-w-[240px]">
                      {exam.subjectAndTopic}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        exam.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {exam.status}
                    </span>
                    {exam.remarks && (
                      <span className="bg-sky-100 text-sky-900 border border-sky-300 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                        {exam.remarks}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {exam.obtainedMarks !== undefined ? (
                      <div className="text-right">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg font-mono font-bold text-xs block">
                          {exam.obtainedMarks} / {exam.totalMarks}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{percentage}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-italic">Marks Pending</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-slate-400 space-y-1">
              <p className="text-sm font-bold text-slate-500">No examination records found</p>
              <p className="text-xs text-slate-400">Scorecards will appear here once tests are graded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
