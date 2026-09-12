'use client';

import React, { useState } from 'react';
import { Student, Payment } from '@/types';
import { Banknote, Plus, Trash2, Edit2, Check, X, Calendar } from 'lucide-react';
import { generatePaymentId, formatPid } from '@/utils/id';

interface PaymentsLedgerProps {
  student: Student;
  payments: Payment[];
  onAddPayment: (payment: Payment) => void;
  onDeletePayment: (pid: string) => void;
  onUpdatePayment: (payment: Payment) => void;
}

export default function PaymentsLedger({
  student,
  payments,
  onAddPayment,
  onDeletePayment,
  onUpdatePayment,
}: PaymentsLedgerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingPid, setEditingPid] = useState<string | null>(null);

  const getCurrentMonthStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    date: new Date().toISOString().slice(0, 10),
    amount: 3000,
    paymentMonth: getCurrentMonthStr(),
    comment: 'Tuition Fee',
  });

  const [editFormData, setEditFormData] = useState<Payment | null>(null);

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const pay: Payment = {
      pid: generatePaymentId(),
      studentSid: student.sid,
      date: newPayment.date || new Date().toISOString().slice(0, 10),
      amount: Number(newPayment.amount) || 0,
      paymentMonth: newPayment.paymentMonth || getCurrentMonthStr(),
      comment: newPayment.comment || '',
    };
    onAddPayment(pay);
    setIsAdding(false);
    setNewPayment({
      date: new Date().toISOString().slice(0, 10),
      amount: 3000,
      paymentMonth: getCurrentMonthStr(),
      comment: 'Tuition Fee',
    });
  };

  const handleStartEdit = (pay: Payment) => {
    setEditingPid(pay.pid);
    setEditFormData({ ...pay });
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdatePayment(editFormData);
      setEditingPid(null);
      setEditFormData(null);
    }
  };

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="bg-slate-100/95 rounded-2xl border border-slate-300 p-2 sm:p-3 space-y-2.5 shadow-2xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-300/90 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-2xs shrink-0">
            <Banknote className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight whitespace-nowrap">
                Tuition Payments Ledger
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold whitespace-nowrap">
                Total: ৳{totalReceived.toLocaleString()}
              </span>
            </div>
            <p className="text-[9.5px] sm:text-[10px] text-slate-500 font-medium truncate">
              Record monthly fee payments and receipts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span className="whitespace-nowrap">{isAdding ? 'Cancel' : 'Log Payment'}</span>
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleCreatePayment} className="p-3 bg-emerald-100/90 border border-emerald-300 rounded-2xl space-y-2.5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-0.5">Payment Date *</label>
              <input
                type="date"
                required
                value={newPayment.date}
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                className="w-full px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-0.5">For Month (YYYY-MM) *</label>
              <input
                type="month"
                required
                value={newPayment.paymentMonth}
                onChange={(e) => setNewPayment({ ...newPayment, paymentMonth: e.target.value })}
                className="w-full px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-0.5">Amount (৳ Taka) *</label>
              <input
                type="number"
                required
                min={1}
                value={newPayment.amount ?? ''}
                onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                className="w-full px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-0.5">Remarks / Method</label>
              <input
                type="text"
                value={newPayment.comment}
                onChange={(e) => setNewPayment({ ...newPayment, comment: e.target.value })}
                placeholder="e.g. bKash / Cash / Tuition fee"
                className="w-full px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950 placeholder-emerald-700/60"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-0.5">
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Save Payment Record
            </button>
          </div>
        </form>
      )}

      {/* Payment List */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto pr-0.5">
        {sortedPayments.length > 0 ? (
          sortedPayments.map((pay) => {
            const isEditingThis = editingPid === pay.pid;

            if (isEditingThis && editFormData) {
              return (
                <div key={pay.pid} className="p-2.5 bg-emerald-100/90 border border-emerald-400 rounded-xl space-y-2 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[9px] font-bold text-emerald-950 block mb-0.5">Date</label>
                      <input
                        type="date"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs font-medium text-emerald-950"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-emerald-950 block mb-0.5">Month</label>
                      <input
                        type="month"
                        value={editFormData.paymentMonth}
                        onChange={(e) => setEditFormData({ ...editFormData, paymentMonth: e.target.value })}
                        className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs font-mono font-medium text-emerald-950"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-emerald-950 block mb-0.5">Amount (৳)</label>
                      <input
                        type="number"
                        value={editFormData.amount}
                        onChange={(e) => setEditFormData({ ...editFormData, amount: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs font-mono font-bold text-emerald-950"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-emerald-950 block mb-0.5">Remarks</label>
                      <input
                        type="text"
                        value={editFormData.comment || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                        className="w-full px-2 py-1 bg-emerald-50 border border-emerald-300 rounded text-xs font-medium text-emerald-950"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setEditingPid(null)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={pay.pid}
                className="p-2 sm:p-2.5 bg-emerald-100/50 hover:bg-emerald-100/80 border border-emerald-200/90 hover:border-emerald-400 rounded-xl flex items-center justify-between gap-2 text-xs transition-all shadow-2xs"
              >
                {/* Left Side: Metadata & Amount */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Top Badge Row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9.5px] font-mono font-black bg-emerald-200 text-emerald-950 border border-emerald-400 px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                      {formatPid(pay.pid)}
                    </span>
                    <span className="text-[9.5px] font-semibold text-slate-800 bg-slate-200/80 border border-slate-300 px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                      <Calendar className="w-2.5 h-2.5 text-slate-600" />
                      {pay.date}
                    </span>
                    <span className="text-[9.5px] font-mono font-bold bg-teal-200/90 text-teal-950 border border-teal-300 px-1.5 py-0.5 rounded shrink-0">
                      Month: {pay.paymentMonth}
                    </span>
                  </div>

                  {/* Bottom Amount & Remark Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-emerald-950 bg-emerald-200/90 border border-emerald-400 px-2 py-0.5 rounded-lg text-xs font-mono shadow-2xs shrink-0">
                      ৳{(Number(pay.amount) || 0).toLocaleString()}
                    </span>
                    {pay.comment ? (
                      <span className="text-[10.5px] sm:text-xs text-emerald-950 font-medium truncate max-w-[220px] sm:max-w-md">
                        {pay.comment}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-800/70 italic">Paid In Full</span>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 shrink-0 pl-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(pay)}
                    className="p-1.5 bg-emerald-200/80 hover:bg-emerald-300 text-emerald-950 border border-emerald-300 rounded-lg cursor-pointer transition-all shadow-2xs"
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
          <div className="p-6 text-center text-emerald-900/60 space-y-1">
            <p className="text-xs font-bold text-emerald-950">No payment records logged yet</p>
            <p className="text-[10px] text-emerald-800/80">Click &ldquo;Log Payment&rdquo; to add monthly tuition fees</p>
          </div>
        )}
      </div>
    </div>
  );
}
