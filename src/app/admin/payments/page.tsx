'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Student, Payment } from '@/types';
import { GlobalPaymentList } from '@/app/admin/_components';
import { AlertTriangle, RefreshCcw, RefreshCw } from 'lucide-react';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStudents, resPayments] = await Promise.all([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' })
      ]);
      if (!resStudents.ok || !resPayments.ok) throw new Error('Failed to load payments data');
      setStudents(await resStudents.json());
      setPayments(await resPayments.json());
    } catch (err: any) {
      setError(err.message || 'Connection lost to the server database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading payments ledger...</p>
      </div>
    );
  }

  const handleAddPayment = async (newPay: Payment) => {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPay),
    });
    if (!res.ok) throw new Error('Failed to record payment transaction');
    const created = await res.json();
    setPayments(prev => [created || newPay, ...prev]);
  };

  const handleUpdatePayment = async (updated: Payment) => {
    const res = await fetch(`/api/payments/${updated.pid}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error('Failed to update payment transaction');
    setPayments(prev => prev.map(p => p.pid === updated.pid ? updated : p));
  };

  const handleDeletePayment = async (pid: string) => {
    const res = await fetch(`/api/payments/${pid}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete payment transaction');
    setPayments(prev => prev.filter(p => p.pid !== pid));
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-50 border border-rose-100 py-3 px-4 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="underline hover:text-rose-900 font-bold ml-1 flex items-center gap-1">
            <RefreshCcw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}
      <GlobalPaymentList
        payments={payments}
        students={students}
        onSelectStudent={(sid) => router.push(`/admin/students?sid=${sid}`)}
        onAddPayment={handleAddPayment}
        onUpdatePayment={handleUpdatePayment}
        onDeletePayment={handleDeletePayment}
      />
    </div>
  );
}
