'use client';

import React, { useState, useMemo } from 'react';
import { Student, Payment } from '@/types';
import {
  Banknote,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
  Search,
  ArrowUpDown,
  LayoutGrid,
  LayoutList,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Receipt,
  Sparkles,
  Coins,
  MessageSquare
} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'month'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  // Telemetry
  const telemetry = useMemo(() => {
    const totalCount = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const avgAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;
    
    // Unique months paid
    const uniqueMonths = Array.from(new Set(payments.map((p) => p.paymentMonth).filter(Boolean)));
    
    // Latest payment
    const sortedByDate = [...payments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestPayment = sortedByDate[0] || null;

    return {
      totalCount,
      totalAmount,
      avgAmount,
      uniqueMonthsCount: uniqueMonths.length,
      latestPayment,
    };
  }, [payments]);

  // Filter and Sort
  const filteredAndSortedPayments = useMemo(() => {
    let list = [...payments];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          formatPid(p.pid).toLowerCase().includes(q) ||
          p.paymentMonth?.toLowerCase().includes(q) ||
          p.date?.toLowerCase().includes(q) ||
          p.comment?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (sortBy === 'month') {
        comparison = (a.paymentMonth || '').localeCompare(b.paymentMonth || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [payments, searchTerm, sortBy, sortOrder]);

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

  return (
    <div className="space-y-3.5">
      {/* 1. Header & Summary Stats */}
      <div className="bg-gradient-to-r from-emerald-100/90 via-teal-100/80 to-emerald-100/90 border border-emerald-300/90 rounded-2xl p-3 sm:p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-300/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-2xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-emerald-950 tracking-tight">
                  Tuition Payments & Ledger
                </h3>
                <span className="text-[10px] font-black font-mono bg-emerald-200 text-emerald-950 border border-emerald-400 px-2 py-0.5 rounded-md shadow-2xs">
                  {student.name} ({student.sid})
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/90 font-medium">
                Track monthly fees, payment receipts, and financial records
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
              isAdding
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAdding ? 'Cancel' : 'Log New Payment'}</span>
          </button>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-800 uppercase font-mono">Total Paid</p>
              <p className="text-base font-black text-emerald-950 font-mono truncate">
                ৳{telemetry.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-teal-800 uppercase font-mono">Transactions</p>
              <p className="text-base font-black text-slate-900 font-mono">
                {telemetry.totalCount} <span className="text-xs font-normal text-slate-500">records</span>
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-800 uppercase font-mono">Avg / Payment</p>
              <p className="text-base font-black text-emerald-950 font-mono truncate">
                ৳{telemetry.avgAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2.5 shadow-2xs">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-teal-800 uppercase font-mono">Months Billed</p>
              <p className="text-base font-black text-slate-900 font-mono">
                {telemetry.uniqueMonthsCount} <span className="text-xs font-normal text-slate-500">months</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Form */}
      {isAdding && (
        <form
          onSubmit={handleCreatePayment}
          className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-100/95 via-teal-100/90 to-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-3 shadow-md animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
            <span className="text-xs font-black font-mono text-emerald-950 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              Log Tuition Payment Entry
            </span>
            <span className="text-[10px] text-emerald-800 font-medium font-mono">
              Auto-assigning PID
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={newPayment.date}
                onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-950 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-1">
                For Month (YYYY-MM) *
              </label>
              <input
                type="month"
                required
                value={newPayment.paymentMonth}
                onChange={(e) => setNewPayment({ ...newPayment, paymentMonth: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-950 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-1">
                Amount (৳ Taka) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={newPayment.amount ?? ''}
                onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-black text-emerald-950 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-950 block mb-1">
                Payment Method / Remarks
              </label>
              <input
                type="text"
                value={newPayment.comment}
                onChange={(e) => setNewPayment({ ...newPayment, comment: e.target.value })}
                placeholder="e.g. bKash / Cash / Monthly Tuition"
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-medium text-emerald-950 placeholder-emerald-700/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save Payment Record
            </button>
          </div>
        </form>
      )}

      {/* 2. Search & Toolbar Controls */}
      <div className="bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-emerald-100/90 border border-emerald-300/90 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Search input */}
          <div className="relative flex items-center bg-emerald-50 border border-emerald-300/90 rounded-lg px-2.5 h-8.5 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500 shadow-2xs transition-all flex-1">
            <div className="p-1 bg-emerald-700 text-white rounded-md shrink-0 mr-2 shadow-2xs">
              <Search className="w-2.5 h-2.5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by PID, month (YYYY-MM), date, or remark..."
              className="w-full bg-transparent text-xs font-semibold text-emerald-950 placeholder:text-emerald-700/60 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="ml-1 text-[10px] font-black bg-emerald-200 hover:bg-emerald-300 text-emerald-900 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode & Sort Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-emerald-200/90 border border-emerald-300 p-0.5 rounded-lg shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'cards'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-950 hover:bg-emerald-300/80'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded-md text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
                  viewMode === 'table'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-emerald-950 hover:bg-emerald-300/80'
                }`}
                title="Table View"
              >
                <LayoutList className="w-3 h-3" />
                <span>Table</span>
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1">
              <label className="text-[10px] font-bold text-emerald-950 font-mono shrink-0">Sort:</label>
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

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="h-8 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-600 rounded-lg text-xs font-black flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95 shrink-0"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200/70">
          <span className="text-[10px] font-bold text-emerald-950 font-mono bg-emerald-200/90 border border-emerald-300 px-2 py-0.5 rounded-md shadow-2xs">
            Showing {filteredAndSortedPayments.length} of {payments.length} payment records
          </span>
          {searchTerm && (
            <span className="text-[10px] text-emerald-800 font-medium italic">
              Filtered by &ldquo;{searchTerm}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* 3. Payments Cards or Table View */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto border border-emerald-200/90 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-100/90 border-b border-emerald-200 text-emerald-950 font-black text-[10.5px] uppercase tracking-wider">
                <th className="py-2.5 px-3">PID & Date</th>
                <th className="py-2.5 px-3">Billed Month</th>
                <th className="py-2.5 px-3">Amount (৳)</th>
                <th className="py-2.5 px-3">Method / Remarks</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {filteredAndSortedPayments.length > 0 ? (
                filteredAndSortedPayments.map((pay) => {
                  const isEditingThis = editingPid === pay.pid;

                  if (isEditingThis && editFormData) {
                    return (
                      <tr key={pay.pid} className="bg-emerald-50/90">
                        <td colSpan={5} className="p-3">
                          <div className="space-y-3">
                            <span className="text-xs font-black text-emerald-950 font-mono">
                              Editing Payment: {formatPid(pay.pid)}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-emerald-950 block">Date</label>
                                <input
                                  type="date"
                                  value={editFormData.date}
                                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                  className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-emerald-950 block">Month</label>
                                <input
                                  type="month"
                                  value={editFormData.paymentMonth}
                                  onChange={(e) => setEditFormData({ ...editFormData, paymentMonth: e.target.value })}
                                  className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-emerald-950 block">Amount (৳)</label>
                                <input
                                  type="number"
                                  value={editFormData.amount}
                                  onChange={(e) => setEditFormData({ ...editFormData, amount: Number(e.target.value) })}
                                  className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-emerald-950 block">Remarks</label>
                                <input
                                  type="text"
                                  value={editFormData.comment || ''}
                                  onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                                  className="w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPid(null)}
                                className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEdit}
                                className="px-3 py-1 bg-emerald-700 text-white rounded text-xs font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={pay.pid} className="hover:bg-emerald-50/50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-black text-emerald-950 text-[10px]">
                            {formatPid(pay.pid)}
                          </span>
                          <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {pay.date}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-teal-100 text-teal-900 border border-teal-200">
                          {pay.paymentMonth}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-black text-emerald-950 text-xs bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                          ৳{(Number(pay.amount) || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px]">
                        {pay.comment ? (
                          <span className="text-xs font-medium text-slate-800 truncate block">
                            {pay.comment}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-800/70 italic">Paid in Full</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(pay)}
                            className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete payment record ${formatPid(pay.pid)}?`)) {
                                onDeletePayment(pay.pid);
                              }
                            }}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs font-semibold">
                    No Payment Logs Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAndSortedPayments.length > 0 ? (
            filteredAndSortedPayments.map((pay) => {
              const isEditingThis = editingPid === pay.pid;

              if (isEditingThis && editFormData) {
                return (
                  <div
                    key={pay.pid}
                    className="md:col-span-2 border-2 border-emerald-400 bg-gradient-to-r from-emerald-100/95 via-teal-100/90 to-emerald-50 rounded-2xl p-3 sm:p-4 space-y-3 shadow-md animate-fadeIn"
                  >
                    <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                      <span className="text-xs font-black font-mono text-emerald-950">
                        Editing Payment: {formatPid(pay.pid)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-emerald-950 block mb-1">Date</label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-medium text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-950 block mb-1">Month</label>
                        <input
                          type="month"
                          value={editFormData.paymentMonth}
                          onChange={(e) => setEditFormData({ ...editFormData, paymentMonth: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-950 block mb-1">Amount (৳)</label>
                        <input
                          type="number"
                          value={editFormData.amount}
                          onChange={(e) => setEditFormData({ ...editFormData, amount: Number(e.target.value) })}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-emerald-950 block mb-1">Remarks</label>
                        <input
                          type="text"
                          value={editFormData.comment || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, comment: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-medium text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingPid(null)}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={pay.pid}
                  className="group relative rounded-2xl p-4 space-y-3.5 transition-all duration-300 flex flex-col justify-between border-2 bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-300 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.18)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.32)] hover:border-emerald-500 hover:-translate-y-0.5"
                >
                  {/* Subtle glowing corner */}
                  <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full blur-xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-80 bg-emerald-400" />

                  {/* Card Header: 2 Clean Rows to Guarantee Zero Overlap */}
                  <div className="space-y-2 border-b border-teal-100/80 pb-2.5 relative z-10">
                    {/* Row 1: PID on left, Status on right */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-white bg-teal-600 px-2.5 py-0.5 rounded-lg shadow-[0_2px_6px_rgba(13,148,136,0.3)] flex items-center gap-1 shrink-0 max-w-[210px]">
                        <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                        <span className="truncate">{formatPid(pay.pid)}</span>
                      </span>

                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border shadow-xs tracking-wide flex items-center gap-1 bg-emerald-500 text-white border-emerald-400 shadow-[0_2px_8px_rgba(16,185,129,0.35)] shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0 drop-shadow-xs" />
                        <span>Paid</span>
                      </span>
                    </div>

                    {/* Row 2: Date on left, Actions on right */}
                    <div className="flex items-center justify-between gap-2 min-w-0 pt-0.5">
                      <span className="text-[10px] font-bold text-slate-700 font-mono flex items-center gap-1.5 bg-white border border-teal-200/80 px-2 py-0.5 rounded-md shadow-2xs shrink-0">
                        <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{pay.date}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(pay)}
                          className="p-1.5 text-teal-700 hover:text-white bg-teal-100 hover:bg-teal-600 border border-teal-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_8px_rgba(13,148,136,0.3)] active:scale-95"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete payment record ${formatPid(pay.pid)}?`)) {
                              onDeletePayment(pay.pid);
                            }
                          }}
                          className="p-1.5 text-rose-700 hover:text-white bg-rose-100 hover:bg-rose-600 border border-rose-300 rounded-lg cursor-pointer transition-all shadow-2xs hover:shadow-[0_2px_8px_rgba(244,63,94,0.3)] active:scale-95"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Main: Amount & Billed Month */}
                  <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-xl p-3.5 shadow-[0_4px_16px_-2px_rgba(5,150,105,0.4)] flex items-center justify-between border border-emerald-400/30 relative overflow-hidden group-hover:shadow-[0_6px_20px_-2px_rgba(5,150,105,0.5)] transition-all z-10">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                        <Banknote className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Amount Received</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1 mt-0.5">
                        <span>৳{(Number(pay.amount) || 0).toLocaleString()}</span>
                        <span className="text-xs text-emerald-200 font-semibold font-sans">BDT</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9.5px] font-bold uppercase text-emerald-200 block font-mono">
                        Billed Month
                      </span>
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black font-mono text-white border border-white/40 shadow-2xs">
                        <Coins className="w-3 h-3 text-emerald-200" />
                        {pay.paymentMonth || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Card Remarks & Method */}
                  <div className="space-y-2 relative z-10">
                    {pay.comment ? (
                      <div className="text-xs text-purple-950 italic bg-gradient-to-r from-purple-50 via-fuchsia-50/40 to-white border border-purple-200/90 rounded-xl p-2.5 flex items-start gap-2 shadow-[0_2px_8px_-2px_rgba(168,85,247,0.18)]">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span className="font-medium line-clamp-2">&ldquo;{pay.comment}&rdquo;</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-teal-800 italic bg-teal-50/60 border border-dashed border-teal-200 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>Payment verified & logged</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 py-8 text-center text-slate-500 border-2 border-dashed border-emerald-300 rounded-2xl bg-gradient-to-br from-emerald-100/60 via-teal-50 to-emerald-100/60 shadow-2xs space-y-2">
              <div className="p-2.5 bg-emerald-200 text-emerald-800 rounded-xl w-10 h-10 mx-auto flex items-center justify-center border border-emerald-300 shadow-2xs">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-slate-900">No Payment Records Found</p>
                <p className="text-[11px] text-slate-600 font-medium">
                  No payment entries match your current search or filter.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
