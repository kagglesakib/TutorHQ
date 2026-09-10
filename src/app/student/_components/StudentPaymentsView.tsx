'use client';

import React, { useState } from 'react';
import { Student, Payment } from '@/types';
import { Banknote, Calendar, Search, DollarSign, CheckCircle2 } from 'lucide-react';
import { formatPid } from '@/utils/id';

interface StudentPaymentsViewProps {
  student: Student;
  payments: Payment[];
}

export default function StudentPaymentsView({ student, payments }: StudentPaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(
    (p) =>
      p.paymentMonth.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.comment && p.comment.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const parseAmount = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return Number(val.replace(/[^0-9.-]+/g, '')) || 0;
    return 0;
  };

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });
  const totalPaid = payments.reduce((sum, p) => sum + parseAmount(p.amount), 0);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-slate-900 text-base sm:text-lg">
                  Tuition Payments & Receipts
                </h2>
                <span className="text-[10px] bg-teal-100 text-teal-900 border border-teal-300 font-mono font-bold px-2 py-0.5 rounded-full">
                  ৳{totalPaid.toLocaleString()} Total Paid
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Monthly tuition fee receipts and payment status</p>
            </div>
          </div>

          <div className="relative bg-slate-50 hover:bg-white rounded-xl border border-slate-300 p-1 flex items-center focus-within:ring-2 focus-within:ring-teal-500 w-full sm:w-auto transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt or month..."
              className="py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-full sm:w-48 bg-transparent"
            />
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-2">
          {sortedPayments.length > 0 ? (
            sortedPayments.map((pay) => (
              <div
                key={pay.pid}
                className="p-3 bg-teal-100/50 hover:bg-teal-100/80 border border-teal-200/90 hover:border-teal-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-bold bg-teal-200/80 text-teal-950 border border-teal-300 px-2 py-0.5 rounded-lg">
                    {formatPid(pay.pid)}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 bg-white/70 border border-teal-200 px-1.5 py-0.5 rounded">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {pay.date}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-indigo-100 text-indigo-950 border border-indigo-300 px-2 py-0.5 rounded">
                    Month: {pay.paymentMonth}
                  </span>
                  {pay.comment && (
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[240px]">
                      &ldquo;{pay.comment}&rdquo;
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <span className="text-xs sm:text-sm font-mono font-extrabold bg-emerald-200/90 text-emerald-950 border border-emerald-300 px-3 py-1 rounded-xl shadow-2xs">
                    ৳{parseAmount(pay.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 space-y-1">
              <p className="text-sm font-bold text-slate-500">No payment receipts found</p>
              <p className="text-xs text-slate-400">Payment receipts will appear here once verified</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
