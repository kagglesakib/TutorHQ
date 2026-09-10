import React, { useState } from 'react';
import { Student, Activity, Exam, Payment } from '@/types';
import {
  Edit, Trash2, BookOpen, ClipboardList, Banknote, ArrowLeft
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
  const studentExams = exams.filter(e => e.studentSid === student.sid);
  const studentActivitiesCount = activities.filter(a => a.studentSid === student.sid).length;
  const studentPaymentsCount = payments.filter(p => p.studentSid === student.sid).length;

  const handleGeneratePdf = () => {
    generatePdfReport(student, activities, exams, reportMonth, setIsGeneratingPdf);
  };

  return (
    <div className="space-y-3" id={`student-detail-${student.sid}`}>
      {/* Upper header section */}
      <div className="bg-gradient-to-r from-slate-100 via-indigo-50/60 to-teal-50/60 text-slate-800 p-3 sm:p-4 rounded-2xl border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-1.5 bg-slate-200/80 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 rounded-xl lg:hidden transition-all shrink-0 font-extrabold text-[11px] flex items-center gap-1 border border-slate-300"
              title="Back to Student Directory"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Roster</span>
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black text-indigo-800 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-lg uppercase tracking-wider font-mono">
                ID : {student.sid}
              </span>
              <h2 className="text-base sm:text-lg font-display font-black text-slate-900 tracking-tight truncate">{student.name}</h2>
            </div>
            <p className="text-[11px] text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-sky-800 font-bold bg-sky-100 border border-sky-300 px-1.5 py-0.2 rounded text-[10px]">{student.college || 'No college specified'}</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-mono text-[10px] font-bold">{formatBatch(student.hscBatch, 'No batch specified')}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 w-full sm:w-auto justify-end pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-300">
          <button
            onClick={() => onEditStudent(student)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Edit Student Details"
          >
            <Edit className="w-3 h-3 text-indigo-700" />
            Edit Profile
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <Trash2 className="w-3 h-3 text-rose-700" />
            Delete
          </button>
        </div>
      </div>

      {/* Grid: Details Metadata Panel (Left) & Activity Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Profile Card & Parameters (col-span-4) */}
        <AdminStudentDossier
          student={student}
          studentExams={studentExams}
          studentActivities={activities.filter(a => a.studentSid === student.sid)}
          reportMonth={reportMonth}
          setReportMonth={setReportMonth}
          isGeneratingPdf={isGeneratingPdf}
          onGeneratePdf={handleGeneratePdf}
          onEditProfile={() => onEditStudent(student)}
        />

        {/* Dynamic Detail Workspace (col-span-8) */}
        <div className="lg:col-span-8 space-y-3 min-w-0">
          {/* Sub-navigation tab selectors with Element-Wise Vibrant Aesthetic Background Colors */}
          <div className="grid grid-cols-3 bg-slate-200/90 p-1 rounded-xl border border-slate-300 gap-1 shadow-2xs">
            <button
              onClick={() => setDetailTab('lessons')}
              className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer font-black ${detailTab === 'lessons'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                : 'bg-indigo-100/80 text-indigo-900 hover:bg-indigo-200/90 border border-indigo-200'
                }`}
            >
              <BookOpen className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Lessons</span>
              <span className={`text-[8.5px] sm:text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 ${detailTab === 'lessons' ? 'bg-indigo-800 text-indigo-100' : 'bg-indigo-200 text-indigo-900'}`}>
                {activities.filter(a => a.studentSid === student.sid).length}
              </span>
            </button>
            <button
              onClick={() => setDetailTab('exams')}
              className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer font-black ${detailTab === 'exams'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm'
                : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200/90 border border-amber-200'
                }`}
            >
              <ClipboardList className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Exams</span>
              <span className={`text-[8.5px] sm:text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 ${detailTab === 'exams' ? 'bg-amber-800 text-amber-100' : 'bg-amber-200 text-amber-900'}`}>
                {exams.filter(e => e.studentSid === student.sid).length}
              </span>
            </button>
            <button
              onClick={() => setDetailTab('payments')}
              className={`py-1.5 px-1 sm:px-2 rounded-lg text-[10.5px] sm:text-xs flex items-center justify-center gap-1 transition-all cursor-pointer font-black ${detailTab === 'payments'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200/90 border border-emerald-200'
                }`}
            >
              <Banknote className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Payments</span>
              <span className={`text-[8.5px] sm:text-[9px] px-1 py-0.2 rounded font-mono font-bold shrink-0 ${detailTab === 'payments' ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-200 text-emerald-900'}`}>
                {payments.filter(p => p.studentSid === student.sid).length}
              </span>
            </button>
          </div>

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
      </div>

      {/* Delete Student Detailed Confirmation Window */}
      <DeleteStudentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirmDelete={(sid) => onDeleteStudent(sid)}
        student={student}
        activitiesCount={studentActivitiesCount}
        examsCount={studentExams.length}
        paymentsCount={studentPaymentsCount}
      />
    </div>
  );
}
