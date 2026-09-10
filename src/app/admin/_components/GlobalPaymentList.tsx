'use client';

import React, { useState } from 'react';
import { Student, Payment } from '@/types';
import { Banknote, Search, Trash2, Edit2, Check, X, Calendar, User, DollarSign } from 'lucide-react';
import { formatPid } from '@/utils/id';

interface GlobalPaymentListProps {
  payments: Payment[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onUpdatePayment: (payment: Payment) => Promise<void> | void;
  onDeletePayment: (pid: string) => Promise<void> | void;
}

export default function GlobalPaymentList({
  payments,
  students,
  onSelectStudent,
  onUpdatePayment,
  onDeletePayment,
}: GlobalPaymentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [editingPid, setEditingPid] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Payment | null>(null);

  const studentMap = new Map(students.map(s => [s.sid, s]));

  const filteredPayments = payments.filter((pay) => {
    const term = searchTerm.toLowerCase();
    const student = studentMap.get(pay.studentSid);
    const matchesSearch =
      pay.pid.toLowerCase().includes(term) ||
      pay.studentSid.toLowerCase().includes(term) ||
      pay.paymentMonth.toLowerCase().includes(term) ||
      (pay.comment && pay.comment.toLowerCase().includes(term)) ||
      (student && student.name.toLowerCase().includes(term));

    const matchesFilter = selectedStudentFilter === 'ALL' || pay.studentSid === selectedStudentFilter;
    return matchesSearch && matchesFilter;
  });

  const handleStartEdit = (pay: Payment) => {
    setEditingPid(pay.pid);
    setEditFormData({ ...pay });
  };

  const handleSaveEdit = async () => {
    if (editFormData) {
      await onUpdatePayment(editFormData);
      setEditingPid(null);
      setEditFormData(null);
    }
  };

  const sortedPayments = [...filteredPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalAmount = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-300/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600 text-white rounded-xl shadow-2xs">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-teal-950 text-base">Tuition Fees & Payments Ledger</h3>
              <span className="text-[10px] bg-teal-200/90 text-teal-950 border border-teal-400 font-mono font-bold px-2 py-0.5 rounded-full">
                Total: ৳{totalAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-teal-800/80 font-medium">Cross-student financial collections and receipts</p>
          </div>
        </div>

        {/* Search & Student Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative bg-teal-100/80 rounded-xl border border-teal-300/90 p-1 flex items-center focus-within:ring-2 focus-within:ring-teal-500 shadow-2xs">
            <Search className="w-3.5 h-3.5 text-teal-700 ml-1 mr-1.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt, student, month..."
              className="py-0.5 text-xs text-teal-950 placeholder-teal-600/70 focus:outline-hidden w-40 sm:w-56 font-medium bg-transparent"
            />
          </div>

          <select
            value={selectedStudentFilter}
            onChange={(e) => setSelectedStudentFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-teal-100/90 border border-teal-300 rounded-xl text-xs font-bold text-teal-950 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Students ({students.length})</option>
            {students.map(s => (
              <option key={s.sid} value={s.sid}>{s.name} ({s.sid})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Payments Items */}
      <div className="space-y-2">
        {sortedPayments.length > 0 ? (
          sortedPayments.map((pay) => {
            const student = studentMap.get(pay.studentSid);
            const isEditing = editingPid === pay.pid;

            if (isEditing && editFormData) {
              return (
                <div key={pay.pid} className="p-3 bg-teal-100/90 border border-teal-400 rounded-2xl space-y-2 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="px-2 py-1 bg-teal-50 border border-teal-300 rounded text-xs font-medium text-teal-950"
                    />
                    <input
                      type="month"
                      value={editFormData.paymentMonth}
                      onChange={(e) => setEditFormData({ ...editFormData, paymentMonth: e.target.value })}
                      className="px-2 py-1 bg-teal-50 border border-teal-300 rounded text-xs font-mono font-medium text-teal-950"
                    />
                    <input
                      type="number"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: Number(e.target.value) })}
                      className="px-2 py-1 bg-teal-50 border border-teal-300 rounded text-xs font-mono font-medium text-teal-950"
                    />
                    <input
                      type="text"
                      value={editFormData.comment || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                      className="px-2 py-1 bg-teal-50 border border-teal-300 rounded text-xs font-medium text-teal-950"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingPid(null)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={pay.pid}
                className="p-2.5 sm:p-3 bg-teal-100/50 hover:bg-teal-100/80 border border-teal-200/90 hover:border-teal-400 rounded-2xl flex items-center justify-between gap-2.5 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {/* PID Badge */}
                  <span className="text-[9.5px] font-mono font-black bg-teal-200 text-teal-950 border border-teal-400 px-2 py-0.5 rounded-lg shadow-2xs">
                    {formatPid(pay.pid)}
                  </span>

                  {/* Student Badge Button */}
                  <button
                    onClick={() => onSelectStudent(pay.studentSid)}
                    className="font-black text-indigo-950 bg-indigo-100/90 hover:bg-indigo-200/90 border border-indigo-300 px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs transition-all shadow-2xs"
                  >
                    <User className="w-3 h-3 text-indigo-700" />
                    <span>{student?.name || pay.studentSid}</span>
                    <span className="text-[9.5px] font-mono font-bold text-indigo-700">({pay.studentSid})</span>
                  </button>

                  {/* Date Badge */}
                  <span className="text-[9.5px] text-slate-800 font-mono font-semibold flex items-center gap-1 bg-slate-200/80 border border-slate-300 px-1.5 py-0.5 rounded-md">
                    <Calendar className="w-3 h-3 text-slate-600" />
                    {pay.date}
                  </span>

                  {/* Month Badge */}
                  <span className="text-[10px] font-mono font-bold bg-cyan-100/90 text-cyan-950 border border-cyan-300 px-2 py-0.5 rounded-md">
                    Month: {pay.paymentMonth}
                  </span>

                  {/* Amount Badge */}
                  <span className="text-xs font-mono font-black bg-emerald-200/90 text-emerald-950 border border-emerald-400 px-2.5 py-0.5 rounded-md shadow-2xs">
                    ৳{(Number(pay.amount) || 0).toLocaleString()}
                  </span>

                  {/* Comment Badge */}
                  {pay.comment && (
                    <span className="text-[10.5px] text-amber-950 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md font-medium truncate max-w-[200px]">
                      {pay.comment}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(pay)}
                    className="p-1.5 bg-teal-200/80 hover:bg-teal-300 text-teal-950 border border-teal-300 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePayment(pay.pid)}
                    className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 rounded-lg cursor-pointer transition-all shadow-2xs"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-teal-900/60 space-y-1">
            <p className="text-sm font-bold text-teal-900">No payment records found</p>
            <p className="text-xs text-teal-800/70">Try changing the search keyword or student filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
