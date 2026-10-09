'use client';

import React, { useState, useMemo } from 'react';
import { Student, Payment } from '@/types';
import { isActiveEnrolledStudent } from '@/utils/studentFilters';
import {
  Banknote,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  User,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  LayoutList,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Hash,
  Coins
} from 'lucide-react';
import { formatPid, generatePaymentId } from '@/utils/id';
import { formatDateWithDay, formatBillingMonth, getBillingMonthParts } from '@/utils/dateFormat';

interface GlobalPaymentListProps {
  payments: Payment[];
  students: Student[];
  onSelectStudent: (sid: string) => void;
  onAddPayment?: (payment: Payment) => Promise<void> | void;
  onUpdatePayment: (payment: Payment) => Promise<void> | void;
  onDeletePayment: (pid: string) => Promise<void> | void;
}

export default function GlobalPaymentList({
  payments,
  students,
  onSelectStudent,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
}: GlobalPaymentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('ALL');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'month'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Edit State
  const [editingPid, setEditingPid] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Payment | null>(null);
  const [deleteConfirmPid, setDeleteConfirmPid] = useState<string | null>(null);

  // Add Payment Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const getCurrentMonthStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  const [newPaymentData, setNewPaymentData] = useState<{
    studentSid: string;
    date: string;
    paymentMonth: string;
    amount: number | '';
    comment: string;
  }>({
    studentSid: students[0]?.sid || '',
    date: new Date().toISOString().slice(0, 10),
    paymentMonth: getCurrentMonthStr(),
    amount: 3000,
    comment: 'Tuition Fee',
  });

  const studentMap = useMemo(() => new Map(students.map((s) => [s.sid, s])), [students]);
  const activeStudents = useMemo(() => students.filter(isActiveEnrolledStudent), [students]);

  // Unique months available
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    payments.forEach((p) => {
      if (p.paymentMonth) months.add(p.paymentMonth);
      else if (p.date && p.date.length >= 7) months.add(p.date.slice(0, 7));
    });
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return payments.filter((pay) => {
      const student = studentMap.get(pay.studentSid);
      const matchesSearch =
        !term ||
        pay.pid.toLowerCase().includes(term) ||
        pay.studentSid.toLowerCase().includes(term) ||
        (pay.paymentMonth && pay.paymentMonth.toLowerCase().includes(term)) ||
        (pay.comment && pay.comment.toLowerCase().includes(term)) ||
        (student && student.name.toLowerCase().includes(term));

      const matchesStudent =
        selectedStudentFilter === 'ALL' || pay.studentSid === selectedStudentFilter;

      const matchesMonth =
        selectedMonthFilter === 'ALL' ||
        pay.paymentMonth === selectedMonthFilter ||
        (pay.date && pay.date.startsWith(selectedMonthFilter));

      return matchesSearch && matchesStudent && matchesMonth;
    });
  }, [payments, searchTerm, selectedStudentFilter, selectedMonthFilter, studentMap]);

  // Sorted payments
  const sortedPayments = useMemo(() => {
    return [...filteredPayments].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'amount') {
        comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (sortBy === 'month') {
        comparison = (a.paymentMonth || '').localeCompare(b.paymentMonth || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPayments, sortBy, sortOrder]);

  // KPI Calculations
  const totalAmount = useMemo(
    () => filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    [filteredPayments]
  );
  const uniquePayingStudents = useMemo(
    () => new Set(filteredPayments.map((p) => p.studentSid)).size,
    [filteredPayments]
  );
  const avgPayment = useMemo(
    () => (filteredPayments.length > 0 ? Math.round(totalAmount / filteredPayments.length) : 0),
    [filteredPayments, totalAmount]
  );

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

  const handleCreatePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaymentData.studentSid) {
      alert('Please select a student');
      return;
    }
    setIsSubmittingAdd(true);
    try {
      const newRecord: Payment = {
        pid: generatePaymentId(),
        studentSid: newPaymentData.studentSid,
        date: newPaymentData.date || new Date().toISOString().slice(0, 10),
        paymentMonth: newPaymentData.paymentMonth || getCurrentMonthStr(),
        amount: Number(newPaymentData.amount) || 0,
        comment: newPaymentData.comment || 'Tuition Fee',
      };
      if (onAddPayment) {
        await onAddPayment(newRecord);
      } else {
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRecord),
        });
        if (!res.ok) throw new Error('Failed to record payment');
        window.location.reload();
      }
      setIsAddModalOpen(false);
      setNewPaymentData({
        studentSid: students[0]?.sid || '',
        date: new Date().toISOString().slice(0, 10),
        paymentMonth: getCurrentMonthStr(),
        amount: 3000,
        comment: 'Tuition Fee',
      });
    } catch (err: any) {
      alert(err.message || 'Error recording payment');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  return (
    <div className="bg-slate-100/90 dark:bg-slate-900/90 rounded-3xl border border-slate-300 dark:border-slate-800 p-3 sm:p-5 space-y-4 shadow-sm">
      {/* 1. Summary Metrics Matrix (Card View Header Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Collected */}
        <div className="p-3.5 bg-gradient-to-br from-emerald-100/90 via-teal-50/80 to-emerald-100/70 dark:from-emerald-950/80 dark:via-slate-900/90 dark:to-emerald-950/60 border border-emerald-300/90 dark:border-emerald-800/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
              Total Collections
            </span>
            <div className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-2xs">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-emerald-950 dark:text-emerald-300 mt-1 font-mono">
            ৳{totalAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold mt-0.5">
            {filteredPayments.length} transactions recorded
          </p>
        </div>

        {/* Transactions Count */}
        <div className="p-3.5 bg-gradient-to-br from-teal-100/90 via-cyan-50/80 to-teal-100/70 dark:from-teal-950/80 dark:via-slate-900/90 dark:to-teal-950/60 border border-teal-300/90 dark:border-teal-800/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-teal-900 dark:text-teal-200 uppercase tracking-wider">
              Total Receipts
            </span>
            <div className="p-1.5 bg-teal-600 text-white rounded-xl shadow-2xs">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-teal-950 dark:text-teal-300 mt-1">
            {filteredPayments.length}
          </p>
          <p className="text-[10px] text-teal-800 dark:text-teal-400 font-semibold mt-0.5">
            Matching current filters
          </p>
        </div>

        {/* Unique Paying Students */}
        <div className="p-3.5 bg-gradient-to-br from-indigo-100/90 via-sky-50/80 to-indigo-100/70 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-indigo-950/60 border border-indigo-300/90 dark:border-indigo-800/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
              Paying Students
            </span>
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-indigo-950 dark:text-indigo-300 mt-1">
            {uniquePayingStudents}
          </p>
          <p className="text-[10px] text-indigo-800 dark:text-indigo-400 font-semibold mt-0.5">
            Out of {students.length} total students
          </p>
        </div>

        {/* Average Transaction */}
        <div className="p-3.5 bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-amber-100/70 dark:from-amber-950/80 dark:via-slate-900/90 dark:to-amber-950/60 border border-amber-300/90 dark:border-amber-800/80 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
              Avg. Receipt
            </span>
            <div className="p-1.5 bg-amber-600 text-white rounded-xl shadow-2xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-display font-black text-amber-950 dark:text-amber-300 mt-1 font-mono">
            ৳{avgPayment.toLocaleString()}
          </p>
          <p className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold mt-0.5">
            Per receipt average
          </p>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search receipt PID, student name, SID, month, remarks..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800/90 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons: Add Payment & View Mode */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {/* Quick Add Payment Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-teal-600/30 cursor-pointer transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>

        {/* Second Filter Row: Student Filter, Month Filter, Sort By */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Student Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Student:</span>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="ALL">All Students ({students.length})</option>
              {students.map((s) => (
                <option key={s.sid} value={s.sid}>
                  {s.name} ({s.sid})
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Month:</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="ALL">All Months ({availableMonths.length})</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatBillingMonth(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="amount">Amount (৳)</option>
              <option value="month">Month</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY PAYMENTS DISPLAY: CARD VIEW (OR TABLE VIEW) */}
      {sortedPayments.length > 0 ? (
        viewMode === 'cards' ? (
          /* ========================================================= */
          /* BEAUTIFUL RESPONSIVE PAYMENT CARDS GRID                   */
          /* ========================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 items-stretch">
            {sortedPayments.map((pay) => {
              const student = studentMap.get(pay.studentSid);
              const isEditing = editingPid === pay.pid;
              const isConfirmingDelete = deleteConfirmPid === pay.pid;
              const monthParts = getBillingMonthParts(pay.paymentMonth);

              if (isEditing && editFormData) {
                return (
                  <div
                    key={pay.pid}
                    className="bg-white dark:bg-slate-900 border-2 border-teal-400 dark:border-teal-600 ring-4 ring-teal-500/10 rounded-2xl p-3.5 space-y-3 shadow-lg col-span-1 md:col-span-2 xl:col-span-3 transition-all"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-teal-100 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/40 -mx-3.5 -mt-3.5 p-3 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-teal-600 text-white rounded-lg shadow-2xs">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-teal-950 dark:text-teal-200">
                            Editing Tuition Payment Record
                          </span>
                          <span className="ml-2 text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 px-1.5 py-0.2 rounded shadow-2xs">
                            {formatPid(pay.pid)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPid(null)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-black text-teal-950 dark:text-teal-300 uppercase tracking-wider block mb-1">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, date: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-teal-950 dark:text-teal-300 uppercase tracking-wider block mb-1">
                          Billing Month
                        </label>
                        <input
                          type="month"
                          value={editFormData.paymentMonth}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, paymentMonth: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-teal-950 dark:text-teal-300 uppercase tracking-wider block mb-1">
                          Amount (৳)
                        </label>
                        <input
                          type="number"
                          value={editFormData.amount}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, amount: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-teal-950 dark:text-teal-300 uppercase tracking-wider block mb-1">
                          Remarks / Method
                        </label>
                        <input
                          type="text"
                          value={editFormData.comment || ''}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, comment: e.target.value })
                          }
                          placeholder="e.g. bKash / Cash / Tuition Fee"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingPid(null)}
                        className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={pay.pid}
                  className="group relative rounded-2xl p-4 sm:p-4.5 space-y-3.5 transition-all duration-300 flex flex-col justify-between border-2 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-slate-950 border-emerald-300 dark:border-emerald-800/70 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.32)] hover:border-emerald-500 dark:hover:border-emerald-500 hover:-translate-y-0.5 h-full min-w-0"
                >
                  {/* Decorative ambient glowing corner accent */}
                  <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-80 bg-emerald-400" />

                  {/* Top Row: Student Profile & Glowing Status Pill */}
                  <div className="flex items-start justify-between gap-2 relative z-10 min-w-0">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(pay.studentSid)}
                      className="text-left group/cardbtn min-w-0 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 border border-teal-200 dark:border-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(16,185,129,0.35)] group-hover/cardbtn:scale-105 transition-transform">
                          {(student?.name || pay.studentSid).charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 dark:text-slate-100 group-hover/cardbtn:text-teal-700 dark:group-hover/cardbtn:text-teal-300 transition-colors truncate text-sm sm:text-[15px] flex items-center gap-1.5">
                          <span>{student?.name || pay.studentSid}</span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300 bg-teal-100/90 dark:bg-teal-950/70 border border-teal-300/80 dark:border-teal-800/60 px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
                            <Hash className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                            <span>SID: {pay.studentSid}</span>
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Glowing Status Pill */}
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border shadow-xs tracking-wide bg-emerald-500 text-white border-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.35)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                        <span>Paid</span>
                      </span>
                    </div>
                  </div>

                  {/* Middle: Voucher Metadata - Glowing Teal Card with Responsive Date & Voucher Header */}
                  <div className="space-y-2 bg-gradient-to-br from-teal-50/90 via-emerald-50/60 to-white dark:from-slate-900 dark:via-teal-950/40 dark:to-slate-900 border border-teal-200/90 dark:border-teal-900/60 rounded-xl p-3 shadow-2xs group-hover:border-teal-300 dark:group-hover:border-teal-700 transition-colors relative z-10 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 min-w-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold text-teal-800 dark:text-teal-300 uppercase tracking-wider min-w-0 truncate">
                        <Receipt className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">Voucher {formatPid(pay.pid)}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-900 dark:text-teal-200 bg-teal-100/90 dark:bg-teal-950/70 border border-teal-300/80 dark:border-teal-800/60 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                        <Coins className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{monthParts ? monthParts.code : pay.paymentMonth}</span>
                      </span>
                    </div>

                    {/* Date with Day Name - Clean, non-wrapping responsive card row */}
                    <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold text-slate-800 dark:text-slate-200 bg-white/95 dark:bg-slate-800/90 border border-teal-200/80 dark:border-slate-700 px-2.5 py-1 rounded-lg shadow-2xs min-w-0 truncate">
                        <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{formatDateWithDay(pay.date)}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-900/60 px-2 py-0.5 rounded-md shrink-0">
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Prominent Glowing Amount Box with Currency and Stacked Billed Month */}
                  <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-xl p-3.5 shadow-[0_4px_16px_-2px_rgba(5,150,105,0.4)] flex items-center justify-between gap-3 border border-emerald-400/30 relative overflow-hidden group-hover:shadow-[0_6px_20px_-2px_rgba(5,150,105,0.5)] transition-all z-10 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100 truncate">
                        <Banknote className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                        <span>Tuition Fee</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-0.5 flex items-baseline gap-1">
                        <span>৳{(Number(pay.amount) || 0).toLocaleString()}</span>
                        <span className="text-[10.5px] text-emerald-200 font-semibold font-sans">BDT</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] font-bold uppercase text-emerald-200 block font-mono">
                        Billing Month
                      </span>
                      <div className="mt-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-right border border-white/40 shadow-2xs">
                        <div className="text-xs font-black font-mono text-white leading-tight">
                          {monthParts ? `${monthParts.monthName} ${monthParts.year}` : pay.paymentMonth}
                        </div>
                        <div className="text-[10px] font-bold font-mono text-emerald-100 leading-tight">
                          {monthParts ? `(${monthParts.code})` : ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remarks / Comment Card */}
                  <div className="space-y-2.5 relative z-10 min-w-0">
                    {pay.comment ? (
                      <div className="text-xs text-purple-950 dark:text-purple-200 italic bg-gradient-to-r from-purple-50 via-fuchsia-50/40 to-white dark:from-purple-950/40 dark:via-purple-900/20 dark:to-slate-900 border border-purple-200/90 dark:border-purple-800/60 rounded-xl p-2.5 flex items-start gap-2 shadow-[0_2px_8px_-2px_rgba(168,85,247,0.18)] min-w-0">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">&ldquo;{pay.comment}&rdquo;</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-teal-800 dark:text-teal-300 italic bg-teal-50/60 dark:bg-teal-950/30 border border-dashed border-teal-200 dark:border-teal-900/60 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">Tuition fee paid in full • Cash / MFS</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer - Glowing buttons & clear affordances */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 dark:border-slate-800 gap-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => onSelectStudent(pay.studentSid)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:text-white dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-gradient-to-r hover:from-teal-600 hover:to-emerald-600 border border-teal-300 dark:border-slate-700 hover:border-transparent px-3 py-1.5 rounded-xl transition-all duration-200 shadow-2xs hover:shadow-[0_4px_12px_rgba(13,148,136,0.3)] cursor-pointer active:scale-95"
                    >
                      <User className="w-3 h-3" />
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            onDeletePayment(pay.pid);
                            setDeleteConfirmPid(null);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-xl text-[10.5px] font-bold cursor-pointer transition-all active:scale-95 shadow-[0_2px_8px_rgba(244,63,94,0.35)]"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmPid(null)}
                          className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[10.5px] font-bold cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pay)}
                          className="px-2.5 py-1.5 text-teal-900 dark:text-teal-200 hover:text-white dark:hover:text-white bg-teal-100 dark:bg-teal-950/70 hover:bg-teal-600 dark:hover:bg-teal-600 border border-teal-300 dark:border-teal-800/80 hover:border-transparent rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_10px_rgba(13,148,136,0.3)] active:scale-95 flex items-center gap-1"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="text-[11px] font-bold">Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmPid(pay.pid)}
                          className="px-2.5 py-1.5 text-rose-900 dark:text-rose-200 hover:text-white dark:hover:text-white bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-300 dark:border-rose-800/80 hover:border-transparent rounded-xl cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_10px_rgba(244,63,94,0.3)] active:scale-95 flex items-center gap-1"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="text-[11px] font-bold">Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* TABLE VIEW OPTION                                         */
          /* ========================================================= */
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-2xs">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Receipt / Date</th>
                  <th className="py-2.5 px-3">Student Profile</th>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Amount (৳)</th>
                  <th className="py-2.5 px-3">Remarks / Method</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedPayments.map((pay) => {
                  const student = studentMap.get(pay.studentSid);
                  return (
                    <tr key={pay.pid} className="hover:bg-teal-50/50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-teal-900 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 border border-teal-300 dark:border-teal-800 px-1.5 py-0.2 rounded text-[10px]">
                            {formatPid(pay.pid)}
                          </span>
                          <div className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold">
                            {formatDateWithDay(pay.date)}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => onSelectStudent(pay.studentSid)}
                          className="text-left font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-800 dark:hover:text-indigo-400"
                        >
                          <div className="text-xs">{student?.name || pay.studentSid}</div>
                          <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400">
                            SID: {pay.studentSid}
                          </div>
                        </button>
                      </td>
                      <td className="py-2.5 px-3">
                        {(() => {
                          const mParts = getBillingMonthParts(pay.paymentMonth);
                          return (
                            <div className="space-y-0.5 font-mono">
                              <div className="text-xs font-bold text-teal-950 dark:text-teal-200">
                                {mParts ? `${mParts.monthName} ${mParts.year}` : pay.paymentMonth}
                              </div>
                              <div className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                                {mParts ? `(${mParts.code})` : ''}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-black text-xs text-emerald-950 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-lg shadow-2xs">
                          ৳{(Number(pay.amount) || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 italic text-[11px]">
                        {pay.comment || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(pay)}
                            className="p-1.5 text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePayment(pay.pid)}
                            className="p-1.5 text-rose-800 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="p-10 text-center text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white/60 dark:bg-slate-900/60 space-y-2">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-xl w-10 h-10 mx-auto flex items-center justify-center border border-teal-300 dark:border-teal-800">
            <Banknote className="w-5 h-5" />
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">No Payment Records Found</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Try adjusting your search criteria or record a new tuition payment.
          </p>
        </div>
      )}

      {/* 4. Quick Add Payment Modal (colorful, compact, offset down from top navbar) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-2.5 sm:p-4 pt-14 sm:pt-16 pb-4 bg-slate-950/75 backdrop-blur-xs overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden animate-in fade-in duration-150">
          <div className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-[0_0_40px_rgba(16,185,129,0.25)] overflow-hidden border border-emerald-200 dark:border-emerald-800/80 m-auto flex flex-col max-h-[calc(100vh-5rem)]">
            
            {/* Header Card - matching visual design with compact padding */}
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 bg-emerald-900/50 hover:bg-emerald-800/80 text-emerald-200 hover:text-white rounded-lg border border-emerald-700/50 transition-all cursor-pointer shrink-0 active:scale-95"
                  aria-label="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body - Tight & Compact */}
            <form onSubmit={handleCreatePaymentSubmit} className="p-2.5 sm:p-3 space-y-2 overflow-y-auto flex-1 text-xs">
              
              {/* Student Selector Card - Colorful Indigo/Purple */}
              <div className="bg-indigo-50/80 dark:bg-indigo-950/30 border-2 border-indigo-200/90 dark:border-indigo-900/60 rounded-xl p-2.5 space-y-1 shadow-2xs">
                <label className="text-[10px] font-mono font-black tracking-wider text-indigo-950 dark:text-indigo-300 uppercase flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400 shrink-0" />
                  <span>SELECT STUDENT PROFILE</span>
                </label>
                <select
                  value={newPaymentData.studentSid}
                  onChange={(e) =>
                    setNewPaymentData({ ...newPaymentData, studentSid: e.target.value })
                  }
                  required
                  className="w-full bg-white dark:bg-slate-950 border border-indigo-200/90 dark:border-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 dark:focus:ring-indigo-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 shadow-2xs transition-all"
                >
                  <option value="" className="dark:bg-slate-900">-- Choose Student --</option>
                  {activeStudents.map((s) => (
                    <option key={s.sid} value={s.sid} className="dark:bg-slate-900">
                      {s.name} (SID: {s.sid})
                    </option>
                  ))}
                </select>
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
                    value={newPaymentData.date}
                    onChange={(e) =>
                      setNewPaymentData({ ...newPaymentData, date: e.target.value })
                    }
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
                    value={newPaymentData.paymentMonth}
                    onChange={(e) =>
                      setNewPaymentData({ ...newPaymentData, paymentMonth: e.target.value })
                    }
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
                        onClick={() => setNewPaymentData({ ...newPaymentData, amount: amt })}
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold cursor-pointer transition-all ${
                          newPaymentData.amount === amt
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
                    value={newPaymentData.amount}
                    onChange={(e) =>
                      setNewPaymentData({
                        ...newPaymentData,
                        amount: e.target.value ? Number(e.target.value) : '',
                      })
                    }
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
                        onClick={() => setNewPaymentData({ ...newPaymentData, comment: method })}
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold cursor-pointer transition-all ${
                          newPaymentData.comment === method
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
                  value={newPaymentData.comment}
                  onChange={(e) =>
                    setNewPaymentData({ ...newPaymentData, comment: e.target.value })
                  }
                  placeholder="e.g. Cash, bKash TrxID #..."
                  className="w-full bg-white dark:bg-slate-950 border border-amber-200/90 dark:border-slate-800 focus:border-amber-600 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-200 dark:focus:ring-amber-900 focus:outline-hidden rounded-xl px-2.5 py-1.5 text-xs text-amber-950 dark:text-amber-100 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-2xs transition-all"
                />
              </div>

              {/* Glowing Gradient Submit Button */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm py-2 px-3 rounded-xl shadow-md dark:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 border border-white/20 disabled:opacity-60"
                >
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>{isSubmittingAdd ? 'Saving Receipt...' : 'Record Receipt'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
