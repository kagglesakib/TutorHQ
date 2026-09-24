'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Student, Activity, Exam, Payment } from '@/types';
import {
  Edit,
  Trash2,
  BookOpen,
  ClipboardList,
  Banknote,
  ArrowLeft,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import AdminStudentDossier from './AdminStudentDossier';
import LessonsTracker from './LessonsTracker';
import ExamsLedger from './ExamsLedger';
import PaymentsLedger from './PaymentsLedger';
import DeleteStudentModal from './DeleteStudentModal';
import { generatePdfReport } from '@/utils/pdfGenerator';
import { formatBatch } from '@/utils/formatBatch';

interface StudentDetailProps {
  student: Student;
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (sid: string) => void;
  onAddActivity: (activity: Activity) => void;
  onDeleteActivity: (aid: string) => void;
  onUpdateActivity: (activity: Activity) => void;
  onAddExam: (exam: Exam) => void;
  onDeleteExam: (eid: string) => void;
  onUpdateExam: (exam: Exam) => void;
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (pid: string) => void;
  onUpdatePayment: (payment: Payment) => void;
  onBackToList?: () => void; // for mobile views
}

export default function StudentDetail({
  student,
  activities,
  exams,
  payments,
  onEditStudent,
  onDeleteStudent,
  onAddActivity,
  onDeleteActivity,
  onUpdateActivity,
  onAddExam,
  onDeleteExam,
  onUpdateExam,
  onAddPayment,
  onDeletePayment,
  onUpdatePayment,
  onBackToList,
}: StudentDetailProps) {
  // Tab control inside detail view: "lessons", "exams", or "payments"
  const [detailTab, setDetailTab] = useState<'lessons' | 'exams' | 'payments'>('lessons');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // PDF Report Generation States
  const [reportMonth, setReportMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter student's own exams/activities/payments count for summary
  const studentExams = exams.filter((e) => e.studentSid === student.sid);
  const studentActivities = activities.filter((a) => a.studentSid === student.sid);
  const studentPayments = payments.filter((p) => p.studentSid === student.sid);

  const handleGeneratePdf = () => {
    generatePdfReport(student, activities, exams, reportMonth, setIsGeneratingPdf);
  };

  return (
    <div className="w-full space-y-3 sm:space-y-4" id={`student-detail-${student.sid}`}>
      {/* 1. Student Dossier Header & Parameters Banner */}
      <AdminStudentDossier
        student={student}
        studentExams={studentExams}
        studentActivities={studentActivities}
        reportMonth={reportMonth}
        setReportMonth={setReportMonth}
        isGeneratingPdf={isGeneratingPdf}
        onGeneratePdf={handleGeneratePdf}
        onEditProfile={() => onEditStudent(student)}
      />

      {/* Revoked Status Warning Banner */}
      {(student.isApproved === 'no' || student.status === 'revoked') && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-start gap-2.5 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Student Account Access Revoked</p>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              This student&apos;s records are currently hidden from active tracking and examination ledgers across the admin portal. You can restore access at any time from the Approvals manager.
            </p>
            <Link
              href="/admin/approvals"
              className="inline-flex items-center gap-1 text-[11px] font-black text-rose-700 hover:text-rose-950 underline mt-0.5"
            >
              <span>Go to Approvals Manager</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Tabs */}
      <div className="w-full bg-slate-200/90 p-1 rounded-2xl border border-slate-300/80 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5 w-full">
          <button
            type="button"
            onClick={() => setDetailTab('lessons')}
            className={`w-full min-w-0 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-black select-none overflow-hidden ${
              detailTab === 'lessons'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm ring-1 ring-indigo-500/60'
                : 'bg-indigo-100/75 text-indigo-950 hover:bg-indigo-100 border border-indigo-200/90'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate min-w-0">
              <span className="hidden min-[480px]:inline">Daily </span>Lessons
            </span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                detailTab === 'lessons'
                  ? 'bg-indigo-800 text-indigo-100'
                  : 'bg-indigo-200/90 text-indigo-950'
              }`}
            >
              {studentActivities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDetailTab('exams')}
            className={`w-full min-w-0 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-black select-none overflow-hidden ${
              detailTab === 'exams'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm ring-1 ring-amber-500/60'
                : 'bg-amber-100/75 text-amber-950 hover:bg-amber-100 border border-amber-200/90'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate min-w-0">Exams</span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                detailTab === 'exams'
                  ? 'bg-amber-800 text-amber-100'
                  : 'bg-amber-200/90 text-amber-950'
              }`}
            >
              {studentExams.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDetailTab('payments')}
            className={`w-full min-w-0 py-2 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer font-black select-none overflow-hidden ${
              detailTab === 'payments'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-500/60'
                : 'bg-emerald-100/75 text-emerald-950 hover:bg-emerald-100 border border-emerald-200/90'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate min-w-0">Payments</span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                detailTab === 'payments'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-emerald-200/90 text-emerald-950'
              }`}
            >
              {studentPayments.length}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Tab Workspace Content */}
      <div className="w-full min-w-0">
        {detailTab === 'lessons' && (
          <LessonsTracker
            student={student}
            activities={activities}
            onAddActivity={onAddActivity}
            onDeleteActivity={onDeleteActivity}
            onUpdateActivity={onUpdateActivity}
          />
        )}

        {detailTab === 'exams' && (
          <ExamsLedger
            student={student}
            exams={exams}
            onAddExam={onAddExam}
            onDeleteExam={onDeleteExam}
            onUpdateExam={onUpdateExam}
          />
        )}

        {detailTab === 'payments' && (
          <PaymentsLedger
            student={student}
            payments={payments}
            onAddPayment={onAddPayment}
            onDeletePayment={onDeletePayment}
            onUpdatePayment={onUpdatePayment}
          />
        )}
      </div>

      {/* Delete Student Detailed Confirmation Window */}
      <DeleteStudentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={(sid) => onDeleteStudent(sid)}
        student={student}
        activitiesCount={studentActivities.length}
        examsCount={studentExams.length}
        paymentsCount={studentPayments.length}
      />
    </div>
  );
}
