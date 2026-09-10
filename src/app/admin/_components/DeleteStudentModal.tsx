'use client';

import React from 'react';
import { Student } from '@/types';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (sid: string) => void;
  student: Student;
  activitiesCount: number;
  examsCount: number;
  paymentsCount: number;
}

export default function DeleteStudentModal({
  isOpen,
  onClose,
  onConfirmDelete,
  student,
  activitiesCount,
  examsCount,
  paymentsCount,
}: DeleteStudentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl border border-rose-200 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-display text-slate-900">Delete Student Profile?</h3>
              <p className="text-xs text-rose-600 font-semibold font-mono">SID: {student.sid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-900">
          <p>
            Are you sure you want to permanently delete <strong>{student.name}</strong> from the database?
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
            <div className="p-1.5 bg-white/80 rounded-lg text-center border border-rose-200">
              <span className="block font-bold text-slate-700">Lessons</span>
              <span className="font-black text-rose-700">{activitiesCount}</span>
            </div>
            <div className="p-1.5 bg-white/80 rounded-lg text-center border border-rose-200">
              <span className="block font-bold text-slate-700">Exams</span>
              <span className="font-black text-rose-700">{examsCount}</span>
            </div>
            <div className="p-1.5 bg-white/80 rounded-lg text-center border border-rose-200">
              <span className="block font-bold text-slate-700">Payments</span>
              <span className="font-black text-rose-700">{paymentsCount}</span>
            </div>
          </div>
          <p className="text-[10px] text-rose-700 font-bold">
            ⚠️ This action is irreversible. All linked lessons, exams, and payment records will be removed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(student.sid);
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
