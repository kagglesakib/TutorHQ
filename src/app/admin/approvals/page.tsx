'use client';

import React from 'react';
import Link from 'next/link';
import { UserLogDatasManager } from '@/app/admin/_components';
import {
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  CreditCard,
} from 'lucide-react';

export default function AdminApprovalsPage() {
  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {/* Top Header & Breadcrumb Ribbon - Fully Responsive on Mobile */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-teal-200/80 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 font-medium flex-wrap">
          <Link
            href="/admin"
            className="hover:text-slate-900 transition-colors flex items-center gap-1 font-bold text-slate-700 bg-slate-100/80 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-teal-900 font-black bg-teal-50 border border-teal-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Student Accounts & Approvals</span>
          </span>
        </div>

        {/* Quick Cross-Navigation with Light Colors */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap self-stretch sm:self-auto justify-start sm:justify-end">
          <Link
            href="/admin/students"
            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Students</span>
          </Link>
          <Link
            href="/admin/tracking"
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Daily Log</span>
          </Link>
          <Link
            href="/admin/exams"
            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span>Exams</span>
          </Link>
          <Link
            href="/admin/payments"
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Payments</span>
          </Link>
        </div>
      </div>

      {/* Main Content Component */}
      <UserLogDatasManager />
    </div>
  );
}
