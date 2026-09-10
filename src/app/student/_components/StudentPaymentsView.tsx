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

  const sortedPayments = [...filteredPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-600 text-white rounded-xl shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
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

          <div className="relative bg-white rounded-xl border border-slate-300 p-1 flex items-center focus-within:ring-2 focus-within:ring-teal-500">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt or month..."
              className="py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-36 sm:w-48"
            />
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-2">
          {sortedPayments.length > 0 ? (
            sortedPayments.map((pay) => (
              <div
                key={pay.pid}
                className="p-3 bg-white border border-slate-200 hover:border-teal-300 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all shadow-2xs"
              >
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-lg">
                    {formatPid(pay.pid)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 bg-slate-100 px-1.5 py-0.2 rounded">
                    <Calendar className="w-3 h-3" />
                    {pay.date}
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded">
                    Month: {pay.paymentMonth}
                  </span>
                  {pay.comment && (
                    <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
                      {pay.comment}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-xl">
                    ৳{(Number(pay.amount) || 0).toLocaleString()}
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
