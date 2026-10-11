'use client';

import React, { useState, useEffect } from 'react';
import { Student, Payment } from '@/types';
import {
  Banknote,
  X,
  Calendar,
  User,
  Check,
  CreditCard,
  Coins,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { generatePaymentId } from '@/utils/id';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student;
  students?: Student[];
  onAddPayment?: (payment: Payment) => Promise<void> | void;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  student,
  students = [],
  onAddPayment,
}: RecordPaymentModalProps) {
  const getCurrentMonthStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [selectedSid, setSelectedSid] = useState<string>(student?.sid || (students[0]?.sid || ''));
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [paymentMonth, setPaymentMonth] = useState<string>(getCurrentMonthStr());
  const [amount, setAmount] = useState<number | ''>(3000);
  const [comment, setComment] = useState<string>('Tuition Fee');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync state whenever modal opens or student prop changes
  useEffect(() => {
    if (student?.sid) {
      setSelectedSid(student.sid);
    } else if (students.length > 0 && !selectedSid) {
      setSelectedSid(students[0].sid);
    }
  }, [student, students, isOpen]);

  if (!isOpen) return null;

  const currentStudent = student || students.find((s) => s.sid === selectedSid) || {
    sid: selectedSid || '000000',
    name: 'Student',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sidToUse = student?.sid || selectedSid;
    if (!sidToUse) return;

    setIsSubmitting(true);
    try {
      const paymentPayload: Payment = {
        pid: generatePaymentId(),
        studentSid: sidToUse,
        date: date || new Date().toISOString().slice(0, 10),
        paymentMonth: paymentMonth || getCurrentMonthStr(),
        amount: Number(amount) || 0,
        comment: comment.trim() || 'Tuition Fee',
      };

      if (onAddPayment) {
        await onAddPayment(paymentPayload);
      } else {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(paymentPayload),
        });
        if (!res.ok) throw new Error('Failed to record payment');
        window.location.reload();
      }
      onClose();
      // Reset form to defaults
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMonth(getCurrentMonthStr());
      setAmount(3000);
      setComment('Tuition Fee');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-4 pt-14 sm:pt-16 pb-4 bg-slate-950/75 backdrop-blur-xs overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-150">
      <div className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(16,185,129,0.25)] overflow-hidden border border-emerald-200 dark:border-emerald-800/80 m-auto flex flex-col max-h-[calc(100vh-5rem)]">
        {/* Header Card matching Global Payment Modal visual design */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 text-white p-3 sm:p-3.5 border-b border-emerald-800/40 relative shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 rounded-xl shadow-xs dark:shadow-[0_0_12px_rgba(16,185,129,0.4)] shrink-0 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0 space-y-0">
                <h3 className="font-display font-black text-white text-xs sm:text-sm tracking-tight leading-tight">
                  Record Tuition Payment
                </h3>
                <p className="text-[10px] text-emerald-200/90 font-medium truncate">
                  Log student fee receipt with monthly billing
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-emerald-900/50 hover:bg-emerald-800/80 text-emerald-200 hover:text-white rounded-lg border border-emerald-700/50 transition-all cursor-pointer shrink-0 active:scale-95"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body - Tight & Compact */}
        <form onSubmit={handleSubmit} className="p-2.5 sm:p-3 space-y-2 overflow-y-auto flex-1 text-xs">
          {/* Student Profile Card (Fixed student name if visited from his profile) */}
          <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border-2 border-indigo-200/90 dark:border-indigo-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
            <label className="text-[10px] font-mono font-black tracking-wider text-indigo-950 dark:text-indigo-300 uppercase flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0" />
              <span>{student ? 'STUDENT PROFILE' : 'SELECT STUDENT PROFILE'}</span>
            </label>
            {student ? (
              <div className="w-full bg-white dark:bg-slate-950 border border-indigo-200/90 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate font-black">{student.name}</span>
                </div>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shrink-0">
                  SID: {student.sid}
                </span>
              </div>
            ) : (
              <select
                required
                value={selectedSid}
                onChange={(e) => setSelectedSid(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-indigo-200/90 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
              >
                <option value="" className="dark:bg-slate-900">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.sid} value={s.sid} className="dark:bg-slate-900">
                    {s.name} (SID: {s.sid})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Receipt Date & Billing Month Row (Sky & Teal Cards) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Receipt Date */}
            <div className="bg-sky-50/80 dark:bg-sky-950/30 border-2 border-sky-200/90 dark:border-sky-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
              <label className="text-[10px] font-mono font-black tracking-wider text-sky-950 dark:text-sky-300 uppercase flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                <span>RECEIPT DATE</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-sky-200/90 dark:border-slate-800 focus:border-sky-600 dark:focus:border-sky-400 focus:ring-1 focus:ring-sky-200 dark:focus:ring-sky-900 focus:outline-hidden rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
              />
            </div>

            {/* Billing Month */}
            <div className="bg-teal-50/80 dark:bg-teal-950/30 border-2 border-teal-200/90 dark:border-teal-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
              <label className="text-[10px] font-mono font-black tracking-wider text-teal-950 dark:text-teal-300 uppercase flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                <span>BILLING MONTH</span>
              </label>
              <input
                type="month"
                required
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-teal-200/90 dark:border-slate-800 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-1 focus:ring-teal-200 dark:focus:ring-teal-900 focus:outline-hidden rounded-xl px-2 py-1 text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Tuition Amount (৳) - Colorful Emerald Card with Quick Chips */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-emerald-200/90 dark:border-emerald-800/60 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <label className="text-[10px] font-mono font-black tracking-wider text-emerald-950 dark:text-emerald-300 uppercase flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>TUITION AMOUNT (৳)</span>
              </label>
              <div className="flex items-center gap-1">
                {[2000, 3000, 4000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold cursor-pointer transition-all ${
                      amount === amt
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black font-mono text-emerald-700 dark:text-emerald-400">
                ৳
              </span>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="3000"
                className="w-full bg-white dark:bg-slate-950 border border-emerald-200/90 dark:border-slate-800 focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 dark:focus:ring-emerald-900 focus:outline-hidden rounded-xl pl-7 pr-3 py-1.5 text-xs font-mono font-black text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
              />
            </div>
          </div>

          {/* Payment Method / Remarks - Colorful Amber Card with Quick Chips */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border-2 border-amber-200/90 dark:border-amber-900/60 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <label className="text-[10px] font-mono font-black tracking-wider text-amber-950 dark:text-amber-300 uppercase flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>PAYMENT METHOD / REMARKS</span>
              </label>
              <div className="flex items-center gap-1">
                {['Cash', 'bKash', 'Nagad', 'Tuition Fee'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setComment(method)}
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold cursor-pointer transition-all ${
                      comment === method
                        ? 'bg-amber-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Cash, bKash TrxID #..."
              className="w-full bg-white dark:bg-slate-950 border border-amber-200/90 dark:border-slate-800 focus:border-amber-600 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-200 dark:focus:ring-amber-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs text-amber-950 dark:text-amber-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
            />
          </div>

          {/* Glowing Gradient Submit Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm py-2 px-3 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 border border-white/20 disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5 text-white shrink-0" />
              <span>{isSubmitting ? 'Saving Receipt...' : 'Record Receipt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
