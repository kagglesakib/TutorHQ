'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Student, Activity, Exam, Payment } from '@/types';
import { StudentList, StudentDetail, StudentForm } from '@/app/admin/_components';
import { BookOpen, AlertTriangle, RefreshCcw, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function StudentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidParam = searchParams.get('sid');
  const addParam = searchParams.get('add');

  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentSid, setSelectedStudentSid] = useState<string | null>(sidParam);
  const [isAddingStudent, setIsAddingStudent] = useState(addParam === 'true');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStudents, resActivities, resExams, resPayments] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' }),
        fetch('/api/exams', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' })
      ]);

      if (!resStudents.ok) throw new Error('Failed to load students ledger');
      setStudents(await resStudents.json());
      if (resActivities.ok) setActivities(await resActivities.json());
      if (resExams.ok) setExams(await resExams.json());
      if (resPayments.ok) setPayments(await resPayments.json());
    } catch (err: any) {
      setError(err.message || 'Connection lost to the server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (sidParam) {
      setSelectedStudentSid(sidParam);
      setIsAddingStudent(false);
      setEditingStudent(null);
    }
  }, [sidParam]);

  const handleSaveStudent = async (formData: Student, originalSid?: string) => {
    setError(null);
    try {
      const isEdit = !!originalSid;
      if (isEdit) {
        const res = await fetch(`/api/students/${originalSid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        const resJson = await res.json();
        if (!res.ok) throw new Error(resJson.error || 'Failed to update student profile');
      } else {
        const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        const resJson = await res.json();
        if (!res.ok) throw new Error(resJson.error || 'Failed to enroll student');
        setSelectedStudentSid(formData.sid);
      }
      setIsAddingStudent(false);
      setEditingStudent(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save student profile.');
    }
  };

  const handleDeleteStudent = async (sid: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/students/${sid}`, { method: 'DELETE' });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to delete student');
      setSelectedStudentSid(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student profile.');
    }
  };

  const handleAddActivity = async (actData: Activity) => {
    const res = await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actData) });
    const resJson = await res.json();
    if (!res.ok) throw new Error(resJson.error || 'Failed to log activity');
    await fetchData();
  };

  const handleDeleteActivity = async (aid: string) => {
    const res = await fetch(`/api/activities/${aid}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete activity');
    await fetchData();
  };

  const handleUpdateActivity = async (actData: Activity) => {
    const res = await fetch(`/api/activities/${actData.aid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actData) });
    if (!res.ok) throw new Error('Failed to update activity');
    await fetchData();
  };

  const handleAddExam = async (examData: Exam) => {
    const res = await fetch('/api/exams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(examData) });
    const resJson = await res.json();
    if (!res.ok) throw new Error(resJson.error || 'Failed to log exam');
    await fetchData();
  };

  const handleDeleteExam = async (eid: string) => {
    const res = await fetch(`/api/exams/${eid}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete exam');
    await fetchData();
  };

  const handleUpdateExam = async (examData: Exam) => {
    const res = await fetch(`/api/exams/${examData.eid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(examData) });
    if (!res.ok) throw new Error('Failed to update exam');
    await fetchData();
  };

  const handleAddPayment = async (payData: Payment) => {
    const res = await fetch('/api/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payData) });
    const resJson = await res.json();
    if (!res.ok) throw new Error(resJson.error || 'Failed to log payment');
    await fetchData();
  };

  const handleDeletePayment = async (pid: string) => {
    const res = await fetch(`/api/payments/${pid}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete payment');
    await fetchData();
  };

  const handleUpdatePayment = async (payData: Payment) => {
    const res = await fetch(`/api/payments/${payData.pid}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payData) });
    if (!res.ok) throw new Error('Failed to update payment');
    await fetchData();
  };

  const currentStudent = students.find(s => s.sid === selectedStudentSid);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading student profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 bg-slate-100/60 p-3 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
      {error && (
        <div className="bg-rose-100/90 border border-rose-300/80 py-3 px-4 rounded-2xl text-xs font-semibold text-rose-800 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchData} className="underline hover:text-rose-950 font-bold flex items-center gap-1 shrink-0 bg-rose-200/90 text-rose-900 px-2.5 py-1 rounded-lg">
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Mobile Top View Switcher Header (visible on mobile when a student is selected) */}
      {selectedStudentSid && !isAddingStudent && !editingStudent && (
        <div className="lg:hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white p-3 rounded-2xl shadow-md flex items-center justify-between gap-2">
          <button
            onClick={() => setSelectedStudentSid(null)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs px-3 py-2 rounded-xl backdrop-blur-md transition-all active:scale-95"
          >
            ← Directory ({students.length})
          </button>
          <div className="text-right min-w-0">
            <p className="text-xs font-black truncate">{currentStudent?.name || 'Student Details'}</p>
            <p className="text-[10px] text-emerald-200 font-mono">SID: {selectedStudentSid}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Left Column is Student Directory, Right Column is Detail/Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Student Directory */}
        <div className={`lg:col-span-4 ${selectedStudentSid || isAddingStudent || editingStudent ? 'hidden lg:block' : 'block'}`}>
          <StudentList
            students={students}
            selectedStudentId={selectedStudentSid}
            onSelectStudent={(sid) => {
              setSelectedStudentSid(sid);
              setIsAddingStudent(false);
              setEditingStudent(null);
            }}
            onAddStudentClick={() => {
              setIsAddingStudent(true);
              setSelectedStudentSid(null);
              setEditingStudent(null);
            }}
          />
        </div>

        {/* Right Column: Dynamic Workspace */}
        <div className={`lg:col-span-8 ${!selectedStudentSid && !isAddingStudent && !editingStudent ? 'hidden lg:block' : 'block'}`}>
          <AnimatePresence mode="wait">
            {isAddingStudent ? (
              <motion.div
                key="add-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <StudentForm
                  existingSids={students.map(s => s.sid)}
                  onSave={handleSaveStudent}
                  onCancel={() => setIsAddingStudent(false)}
                />
              </motion.div>
            ) : editingStudent ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <StudentForm
                  student={editingStudent}
                  existingSids={students.map(s => s.sid)}
                  onSave={handleSaveStudent}
                  onCancel={() => setEditingStudent(null)}
                />
              </motion.div>
            ) : currentStudent ? (
              <motion.div
                key={currentStudent.sid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <StudentDetail
                  student={currentStudent}
                  activities={activities.filter(a => a.studentSid === currentStudent.sid)}
                  exams={exams.filter(e => e.studentSid === currentStudent.sid)}
                  payments={payments.filter(p => p.studentSid === currentStudent.sid)}
                  onEditStudent={(st) => setEditingStudent(st)}
                  onDeleteStudent={handleDeleteStudent}
                  onAddActivity={handleAddActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onUpdateActivity={handleUpdateActivity}
                  onAddExam={handleAddExam}
                  onDeleteExam={handleDeleteExam}
                  onUpdateExam={handleUpdateExam}
                  onAddPayment={handleAddPayment}
                  onDeletePayment={handleDeletePayment}
                  onUpdatePayment={handleUpdatePayment}
                />
              </motion.div>
            ) : (
              <motion.div
                key="select-student-prompt"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-emerald-100/70 via-teal-50/80 to-indigo-50/70 rounded-3xl p-6 sm:p-10 border border-emerald-200/90 shadow-sm text-center space-y-5"
              >
                <div className="p-4 bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-xl font-display font-black text-slate-800 tracking-tight">Student Profiles & Academic Ledger</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">Select any student from the directory to log daily progress, check exam marks, manage monthly tuition payments, or generate PDF report cards.</p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsAddingStudent(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-md shadow-emerald-200"
                  >
                    + Add New Student
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading...</p>
      </div>
    }>
      <StudentsPageInner />
    </Suspense>
  );
}
