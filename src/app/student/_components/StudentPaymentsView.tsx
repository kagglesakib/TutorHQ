'use client';

import React, { useState, useMemo } from 'react';
import { Student, Payment } from '@/types';
import { 
  Banknote, Calendar, Search, DollarSign, CheckCircle2, 
  CreditCard, ShieldCheck, Printer, ArrowUpDown, Filter, Sparkles 
} from 'lucide-react';
import { formatPid } from '@/utils/id';

interface StudentPaymentsViewProps {
  student?: Student;
  payments?: Payment[];
}

export default function StudentPaymentsView({
  student,
  payments = [],
}: StudentPaymentsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'month'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  // Extract unique years from payment records
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    payments.forEach(p => {
      if (p.date) {
        const y = p.date.split('-')[0];
        if (y && !isNaN(Number(y))) years.add(y);
      }
    });
    return Array.from(years).sort().reverse();
  }, [payments]);

  // Filter & Search logic
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || (
        p.paymentMonth?.toLowerCase().includes(q) ||
        p.pid?.toLowerCase().includes(q) ||
        p.method?.toLowerCase().includes(q) ||
        p.comment?.toLowerCase().includes(q)
      );

      const matchesYear = filterYear === 'all' || (p.date && p.date.startsWith(filterYear));

      return matchesSearch && matchesYear;
    });
  }, [payments, searchTerm, filterYear]);

  // Sort logic
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'amount') {
        const amtA = Number(a.amount) || 0;
        const amtB = Number(b.amount) || 0;
        comparison = amtA - amtB;
      } else if (sortBy === 'month') {
        comparison = (a.paymentMonth || '').localeCompare(b.paymentMonth || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPayments, sortBy, sortOrder]);

  // Telemetry Aggregations
  const totalPaid = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const totalReceipts = payments.length;
  const averagePayment = totalReceipts > 0 ? Math.round(totalPaid / totalReceipts) : 0;

  return (
    <div className="space-y-3 sm:space-y-4 max-w-6xl mx-auto animate-fadeIn" id="student-payments-view-root">
      {/* Top Identity & Telemetry Dashboard Card */}
      <div className="bg-gradient-to-br from-emerald-100/95 via-teal-100/80 to-cyan-100/90 rounded-2xl p-3.5 sm:p-5 border-2 border-emerald-200/90 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/40 via-emerald-200/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-sky-200/40 via-teal-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl shadow-md shadow-emerald-600/20 shrink-0 border border-white/40">
              <Banknote className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-slate-900 text-base sm:text-lg tracking-tight">
                  Tuition Payment Ledger
                </h1>
                <span className="text-[10px] bg-emerald-200/90 text-emerald-950 font-mono font-black px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs shrink-0">
                  Verified Invoices
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 font-medium">
                Official billing statement, receipt transcripts, and historical installment records.
              </p>
            </div>
          </div>

          {/* Aggregate Paid Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-600/20 border border-emerald-400/40 shrink-0">
            <div className="p-1 bg-white/20 rounded-md shrink-0">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-emerald-100 font-mono block leading-none">
                Total Paid
              </span>
              <span className="text-sm sm:text-base font-black font-mono leading-tight">
                ৳{totalPaid.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Telemetry Metrics Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          {/* Total Paid */}
          <div className="bg-emerald-100/90 p-2.5 rounded-xl border border-emerald-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-emerald-900 uppercase tracking-wider block">
              Total Paid
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 block mt-0.5">
              ৳{totalPaid.toLocaleString()}
            </span>
          </div>

          {/* Verified Receipts */}
          <div className="bg-teal-100/90 p-2.5 rounded-xl border border-teal-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-teal-900 uppercase tracking-wider block">
              Verified Receipts
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-teal-950 block mt-0.5">
              {totalReceipts} Entries
            </span>
          </div>

          {/* Average Installment */}
          <div className="bg-sky-100/90 p-2.5 rounded-xl border border-sky-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-sky-900 uppercase tracking-wider block">
              Average Installment
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-sky-950 block mt-0.5">
              ৳{averagePayment.toLocaleString()}
            </span>
          </div>

          {/* Financial Standing */}
          <div className="bg-indigo-100/90 p-2.5 rounded-xl border border-indigo-300/90 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-indigo-900 uppercase tracking-wider block">
              Financial Standing
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-indigo-950 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              In Good Standing
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-sky-100/90 border border-emerald-300/90 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Search Input */}
          <div className="relative flex items-center bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-300/90 rounded-lg px-2.5 h-8.5 w-full sm:w-80 focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:border-teal-500 shadow-2xs transition-all">
            <div className="p-1 bg-teal-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Search className="w-2.5 h-2.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt ID, month, notes..."
              className="w-full bg-transparent text-xs font-semibold text-teal-950 placeholder:text-teal-700/60 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-teal-200 hover:bg-teal-300 text-teal-900 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Toolbar Controls: Year Filter & Sort Options */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Year Dropdown */}
            {availableYears.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-teal-950 hidden sm:inline">Year:</span>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="h-8 px-2 bg-teal-100 hover:bg-teal-200/90 border border-teal-400/90 rounded-lg text-xs font-bold text-teal-950 focus:outline-hidden cursor-pointer shadow-2xs transition-colors"
                >
                  <option value="all">All Years</option>
                  {availableYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sort Field */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-bold text-teal-950 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8 px-2 bg-emerald-100 hover:bg-emerald-200/90 border border-emerald-400/90 rounded-lg text-xs font-bold text-emerald-950 focus:outline-hidden cursor-pointer shadow-2xs transition-colors"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="month">Month</option>
              </select>
            </div>

            {/* Sort Direction Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="h-8 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border border-emerald-500 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-98"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </div>

        {/* Results Counter Sub-bar */}
        <div className="flex items-center justify-between border-t border-emerald-200/70 pt-2 text-xs">
          <span className="text-[10px] font-bold text-emerald-950 font-mono bg-emerald-200/90 border border-emerald-300 px-2 py-0.5 rounded-md shadow-2xs">
            Showing {sortedPayments.length} of {payments.length} receipts
          </span>
          {filterYear !== 'all' && (
            <span className="text-[10px] font-bold text-teal-900 bg-teal-100 px-2 py-0.5 rounded-md border border-teal-300">
              Filter: {filterYear}
            </span>
          )}
        </div>
      </div>

      {/* Receipts Ledger List */}
      {sortedPayments.length > 0 ? (
        <div className="space-y-2">
          {sortedPayments.map((payment, index) => {
            const formattedAmount = Number(payment.amount) || 0;
            const displayPid = formatPid(payment.pid);

            return (
              <div
                key={payment.pid ? `${payment.pid}-${index}` : `pymt-${index}`}
                className="bg-gradient-to-r from-teal-50 via-emerald-50/90 to-cyan-50 border-2 border-teal-200 hover:border-teal-400 rounded-xl p-3 sm:p-3.5 transition-all shadow-2xs hover:shadow-xs space-y-2.5"
              >
                {/* Header Row: PID, Date, and Amount */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-teal-200/70">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-teal-950 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      {displayPid}
                    </span>
                    <span className="text-xs font-bold font-mono text-indigo-950 bg-indigo-100/90 border border-indigo-300 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-2xs">
                      <Calendar className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                      {payment.date || 'Date not recorded'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-950 border border-emerald-400/80 px-2 py-0.5 rounded-md shadow-2xs">
                      Verified Paid
                    </span>
                  </div>

                  {/* Payment Amount Display */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white px-3 py-1 rounded-lg shadow-2xs border border-emerald-400/40">
                      <span className="text-[10px] font-mono text-emerald-100 uppercase">Paid:</span>
                      <span className="font-mono font-black text-sm sm:text-base">
                        ৳{formattedAmount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveReceipt(payment)}
                      className="p-1.5 bg-teal-200 hover:bg-teal-300 text-teal-950 border border-teal-300 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="View & Print Official Receipt"
                    >
                      <Printer className="w-4 h-4 text-teal-800" />
                    </button>
                  </div>
                </div>

                {/* Details Row: Month and Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-gradient-to-r from-emerald-100/90 via-teal-100/60 to-emerald-50 border border-emerald-200/90 p-2 rounded-lg shadow-2xs flex items-center gap-2">
                    <div className="p-1 bg-emerald-600 text-white rounded shrink-0 shadow-2xs">
                      <Calendar className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-bold text-emerald-900 uppercase tracking-wider font-mono block">
                        Billing Month
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {payment.paymentMonth}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-sky-100/90 via-indigo-100/60 to-sky-50 border border-sky-200/90 p-2 rounded-lg shadow-2xs flex items-center gap-2">
                    <div className="p-1 bg-sky-600 text-white rounded shrink-0 shadow-2xs">
                      <CreditCard className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8px] font-bold text-sky-900 uppercase tracking-wider font-mono block">
                        Payment Method
                      </span>
                      <span className="font-bold text-slate-900 text-xs truncate block">
                        {payment.method || 'Direct Cash / Hand Payment'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Note / Remarks */}
                {payment.comment && (
                  <div className="bg-gradient-to-r from-amber-100 via-yellow-100/80 to-amber-50 border border-amber-300/90 text-amber-950 text-xs px-2.5 py-1.5 rounded-lg shadow-2xs flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] font-bold text-amber-900 uppercase tracking-wider font-mono block">
                        Transaction Note
                      </span>
                      <p className="italic font-medium text-[11px] leading-relaxed break-words">
                        "{payment.comment}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 text-center text-slate-500 border-2 border-dashed border-teal-300 rounded-2xl bg-gradient-to-br from-teal-100/60 via-emerald-50 to-cyan-100/60 shadow-2xs space-y-2.5">
          <div className="p-3 bg-teal-200 text-teal-800 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-teal-300 shadow-2xs">
            <Banknote className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-extrabold text-slate-900">No Payment Records Found</p>
            <p className="text-xs text-slate-600 font-medium">
              No transactions match your current search query or year filter.
            </p>
          </div>
        </div>
      )}

      {/* Print / View Modal for Single Receipt */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-sm">Official Tuition Voucher</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Invoice #{formatPid(activeReceipt.pid)}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900">{student?.name || 'Verified Student'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                <span className="text-slate-500 font-medium">Student ID (SID):</span>
                <span className="font-mono font-bold text-slate-900">{student?.sid || activeReceipt.studentSid}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                <span className="text-slate-500 font-medium">Payment Month:</span>
                <span className="font-bold text-emerald-950">{activeReceipt.paymentMonth}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                <span className="text-slate-500 font-medium">Transaction Date:</span>
                <span className="font-mono font-bold text-slate-900">{activeReceipt.date}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                <span className="text-slate-500 font-medium">Payment Method:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.method || 'Cash Payment'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="font-extrabold text-slate-900">Total Amount Paid:</span>
                <span className="font-mono font-black text-emerald-700 text-base">
                  ৳{(Number(activeReceipt.amount) || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
