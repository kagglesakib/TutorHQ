'use client';

import React, { useState, useMemo } from 'react';
import { Student, Payment } from '@/types';
import { 
  Banknote, Calendar, Search, DollarSign, CheckCircle2, 
  CreditCard, ShieldCheck, Printer, ArrowUpDown, Filter, Sparkles,
  LayoutGrid, List, Wallet, Receipt, ArrowUpRight, Clock,
  Check, X, FileText, BadgeCheck, Zap, Layers, ChevronRight
} from 'lucide-react';
import { formatPid } from '@/utils/id';

// Helper to format date with Day name (e.g. "Mon, 28 Sep 2026")
function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return 'Recorded';
  try {
    const parts = dateStr.includes('-') ? dateStr.split('-') : dateStr.split('/');
    let d: Date;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(parseInt(parts[2], 10), parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
      }
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

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
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'month'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
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

  // Extract unique payment methods
  const availableMethods = useMemo(() => {
    const methods = new Set<string>();
    payments.forEach(p => {
      if (p.method && p.method.trim()) {
        methods.add(p.method.trim());
      }
    });
    return Array.from(methods);
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
      const matchesMethod = filterMethod === 'all' || p.method?.toLowerCase() === filterMethod.toLowerCase();

      return matchesSearch && matchesYear && matchesMethod;
    });
  }, [payments, searchTerm, filterYear, filterMethod]);

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
    <div className="space-y-3.5 sm:space-y-4.5 max-w-6xl mx-auto w-full min-w-0 animate-fadeIn" id="student-payments-view-root">
      
      {/* 1. TOP HERO TELEMETRY COMMAND BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-50/95 via-emerald-50/80 to-cyan-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 border-2 border-teal-200/90 dark:border-teal-500/35 p-3.5 sm:p-5 shadow-md dark:shadow-[0_0_35px_rgba(20,184,166,0.18)] transition-all duration-200">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-200/40 dark:bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-200/40 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-44 h-44 bg-cyan-200/30 dark:bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-200/80 dark:border-teal-500/25 pb-3 sm:pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative p-2.5 sm:p-3 bg-gradient-to-tr from-teal-600 via-emerald-600 to-cyan-500 text-white rounded-2xl shadow-md dark:shadow-[0_0_20px_rgba(20,184,166,0.5)] shrink-0 border border-teal-300/40">
              <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-950 animate-ping" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-xl tracking-tight flex items-center gap-1.5">
                  Tuition Payment Ledger <span className="text-teal-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">&amp; Receipts</span>
                </h1>
                <span className="text-[9.5px] bg-teal-100 dark:bg-teal-500/20 text-teal-950 dark:text-teal-300 font-mono font-bold px-2 py-0.5 rounded-full border border-teal-300 dark:border-teal-400/40 shrink-0 shadow-2xs dark:shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                  Verified Invoices
                </span>
              </div>
              <p className="text-xs text-teal-900/80 dark:text-teal-200/80 font-medium truncate sm:whitespace-normal">
                Official billing statement, verifiable digital vouchers, and historical payment installments.
              </p>
            </div>
          </div>

          {/* Aggregate Paid Pill */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-3.5 py-1.5 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-300/40 shrink-0">
            <div className="p-1 bg-white/20 rounded-md shrink-0">
              <CreditCard className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-[8.5px] uppercase tracking-wider text-emerald-100 dark:text-emerald-200 font-mono block leading-none font-bold">
                Total Cumulative Paid
              </span>
              <span className="text-sm sm:text-base font-black font-mono leading-tight">
                ৳{totalPaid.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Summary Telemetry Badges */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="bg-teal-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-teal-300/90 dark:border-teal-500/30 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider block">
              Total Receipts
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-teal-950 dark:text-white block mt-0.5">
              {totalReceipts} Invoices
            </span>
          </div>

          <div className="bg-emerald-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-emerald-300/90 dark:border-emerald-500/30 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
              Avg Installment
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 dark:text-emerald-200 block mt-0.5">
              ৳{averagePayment.toLocaleString()}
            </span>
          </div>

          <div className="bg-cyan-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-cyan-300/90 dark:border-cyan-500/30 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-cyan-900 dark:text-cyan-300 uppercase tracking-wider block">
              Status Verified
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-cyan-950 dark:text-cyan-200 block mt-0.5">
              100% Cleared
            </span>
          </div>

          <div className="bg-amber-100/80 dark:bg-slate-950/80 p-2.5 rounded-xl border border-amber-300/90 dark:border-amber-500/30 shadow-2xs">
            <span className="text-[9px] font-mono font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
              Payment Methods
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-amber-950 dark:text-amber-200 block mt-0.5 truncate">
              {availableMethods.length > 0 ? availableMethods.join(', ') : 'Cash/Online'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3.5 shadow-sm space-y-2.5 backdrop-blur-xl transition-all duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          
          {/* Search Box */}
          <div className="sm:col-span-6 relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9 focus-within:ring-2 focus-within:ring-teal-500/40 focus-within:border-teal-400 shadow-2xs dark:shadow-inner transition-all">
            <div className="p-1 bg-teal-600 text-white rounded-md shrink-0 mr-2 shadow-xs">
              <Search className="w-3 h-3" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice PID, month or note..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Year Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Billing Years</option>
              {availableYears.map(y => (
                <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Year {y}</option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div className="sm:col-span-3 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-xl px-2.5 h-9">
            <Wallet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Payment Methods</option>
              {availableMethods.map(m => (
                <option key={m} value={m} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{m}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
              Showing {sortedPayments.length} of {totalReceipts} payment receipts
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 font-mono">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="month">Month</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <ArrowUpDown className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span className="text-[10px] uppercase font-black">{sortOrder}</span>
              </button>
            </div>

            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline text-[10px]">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden min-[420px]:inline text-[10px]">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC PAYMENT DATA CARDS */}
      {sortedPayments.length > 0 ? (
        viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
            {sortedPayments.map((payment, index) => {
              const formattedAmount = Number(payment.amount) || 0;
              const displayPid = formatPid(payment.pid);

              return (
                <div
                  key={payment.pid ? `${payment.pid}-${index}` : `pymt-card-${index}`}
                  className="group relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 border-2 border-teal-200/90 dark:border-teal-500/35 hover:border-teal-400/80 shadow-md dark:shadow-[0_0_25px_rgba(20,184,166,0.12)] hover:shadow-lg dark:hover:shadow-[0_0_35px_rgba(20,184,166,0.25)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 bg-gradient-to-br from-teal-50/95 via-emerald-50/70 to-cyan-50/90 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/80 text-slate-900 dark:text-white backdrop-blur-xl overflow-hidden"
                >
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-200/40 dark:bg-teal-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                  <div className="absolute top-0 left-5 right-5 h-1 rounded-b-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400" />

                  <div className="space-y-3 pt-1 relative z-10">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-2xs flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        {displayPid}
                      </span>

                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        {formatDisplayDate(payment.date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-2xs flex items-center gap-1.5 shrink-0 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Verified Paid
                      </span>

                      <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-500/40 bg-teal-100 dark:bg-teal-950/70 text-teal-950 dark:text-teal-300 flex items-center gap-1 shrink-0 shadow-2xs">
                        <Wallet className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{payment.method || 'Cash Payment'}</span>
                      </span>
                    </div>

                    <div className="bg-white/90 dark:bg-slate-950/85 rounded-2xl p-3 border border-slate-200 dark:border-slate-800/90 flex items-start gap-3 shadow-2xs dark:shadow-inner">
                      <div className="p-2 bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-500 text-white rounded-xl shrink-0 mt-0.5 border border-teal-300/40 shadow-xs">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8.5px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono block">
                          Billing Month
                        </span>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug truncate mt-0.5">
                          {payment.paymentMonth || 'Tuition Fee Installment'}
                        </h3>
                      </div>
                    </div>

                    <div className="bg-slate-50/90 dark:bg-slate-950/90 text-slate-900 dark:text-white p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs dark:shadow-inner space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <span className="text-[8.5px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-bold tracking-wider">
                            Amount Settled
                          </span>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 leading-none tracking-tight">
                              ৳{formattedAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveReceipt(payment)}
                          className="px-3 py-1.5 bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/80 dark:hover:bg-teal-800 text-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-600/50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer shrink-0"
                          title="View & Print Official Voucher"
                        >
                          <Printer className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                          <span>Voucher</span>
                        </button>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden p-px border border-slate-300 dark:border-slate-800">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 w-full shadow-2xs" />
                      </div>
                    </div>

                  </div>

                  {payment.comment ? (
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 text-xs relative z-10">
                      <p className="text-[11px] text-amber-950 dark:text-amber-200/90 font-medium italic bg-amber-100/80 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-500/30 p-2 rounded-xl flex items-start gap-1.5 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-3">"{payment.comment}"</span>
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2.5 mt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 font-mono text-right relative z-10 flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-500" />
                      <span>Official Authenticated Receipt</span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPayments.map((payment, index) => {
              const formattedAmount = Number(payment.amount) || 0;
              const displayPid = formatPid(payment.pid);

              return (
                <div 
                  key={payment.pid ? `${payment.pid}-${index}` : `pymt-list-${index}`}
                  className="bg-white/95 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-teal-950/70 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-500/40 rounded-2xl p-2.5 sm:p-3 transition-all space-y-2 backdrop-blur-xl shadow-xs text-slate-900 dark:text-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        {displayPid}
                      </span>
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                        <Calendar className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                        {formatDisplayDate(payment.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-emerald-300 dark:border-emerald-500/40 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        Paid
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold uppercase border border-teal-300 dark:border-teal-500/40 bg-teal-100 dark:bg-teal-950/70 text-teal-950 dark:text-teal-300">
                        {payment.method || 'Cash'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950/90 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <div className="p-1 bg-teal-600 text-white rounded-md shrink-0 shadow-xs">
                        <Calendar className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono block">
                          Billing Month
                        </span>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                          {payment.paymentMonth}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                      <div className="bg-emerald-50 dark:bg-slate-950 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/30 text-emerald-950 dark:text-white flex items-center gap-1.5 shadow-2xs">
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Amount:</span>
                        <span className="text-sm font-black font-mono text-emerald-700 dark:text-emerald-300">৳{formattedAmount.toLocaleString()}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveReceipt(payment)}
                        className="p-1.5 bg-teal-100 hover:bg-teal-200 dark:bg-teal-900/80 dark:hover:bg-teal-800 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-600/50 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                        title="View Official Voucher"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {payment.comment && (
                    <div className="pt-1 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <p className="text-[11px] text-amber-950 dark:text-amber-200/90 font-medium italic bg-amber-100/70 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-500/30 inline-flex items-center gap-1.5 flex-1 min-w-[140px]">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="truncate">"{payment.comment}"</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/70 dark:bg-slate-950/70 p-6 space-y-2 backdrop-blur-xl">
          <div className="p-3 bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center border border-teal-300 dark:border-teal-500/40 shadow-xs">
            <Banknote className="w-6 h-6" />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">No Payment Records Found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
            No transactions match your current search query or year/method filters.
          </p>
        </div>
      )}

      {/* Print / View Modal for Single Receipt */}
      {activeReceipt && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 border-2 border-teal-200 dark:border-teal-500/40 shadow-xl dark:shadow-[0_0_40px_rgba(20,184,166,0.25)] space-y-4 text-slate-900 dark:text-white relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-teal-600 to-emerald-600 text-white rounded-xl shadow-xs border border-teal-400/40">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 dark:text-white text-sm">Official Tuition Voucher</h3>
                  <p className="text-[10px] text-teal-700 dark:text-teal-300 font-mono">Invoice #{formatPid(activeReceipt.pid)}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-bold p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Student Name:</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{student?.name || 'Verified Student'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Student ID (SID):</span>
                <span className="font-bold text-teal-700 dark:text-teal-300">{student?.sid || activeReceipt.studentSid}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Billing Month:</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{activeReceipt.paymentMonth}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Transaction Date:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{activeReceipt.date}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <span className="text-slate-600 dark:text-slate-400 font-sans">Payment Method:</span>
                <span className="font-semibold text-teal-700 dark:text-teal-300 font-sans">{activeReceipt.method || 'Cash Payment'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm">
                <span className="font-extrabold text-slate-900 dark:text-white font-sans">Total Amount Settled:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg">
                  ৳{(Number(activeReceipt.amount) || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all border border-teal-400/40"
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
