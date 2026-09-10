'use client';

import React, { useState } from 'react';
import { Clock, Mail, ShieldCheck, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';

interface PendingApprovalCardProps {
  user: any;
}

export function PendingApprovalCard({ user }: PendingApprovalCardProps) {
  const { checkSession, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/80 rounded-2xl p-4 sm:p-6 shadow-xl border-2 border-emerald-300/90 text-center space-y-4 relative overflow-hidden backdrop-blur-xs text-xs"
      >
        <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shadow-2xs">
          <Clock className="w-6 h-6 animate-pulse text-emerald-700" />
        </div>

        <div className="space-y-1">
          <span className="px-2 py-0.5 bg-emerald-200/90 text-emerald-950 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-300 font-mono">
            Status: Pending Approval
          </span>
          <h2 className="text-lg font-bold font-display text-emerald-950">Registration Under Review</h2>
          <p className="text-[11px] text-emerald-900/80 font-medium leading-relaxed">
            Welcome, <span className="font-bold text-emerald-950">{user?.name}</span>! Your student registration has been submitted and is awaiting administrator verification and Student ID (SID) assignment.
          </p>
        </div>

        <div className="bg-emerald-100/80 p-3 rounded-xl border border-emerald-300/80 text-left space-y-1.5 text-xs shadow-2xs">
          <div className="text-emerald-950 font-black uppercase tracking-wider text-[9px] font-mono">
            Account Details:
          </div>
          <div className="text-emerald-950 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-emerald-700" /> Email:
            </span>
            <span className="text-emerald-800 font-bold">{user?.email}</span>
          </div>
          <div className="text-emerald-950 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-700" /> SID Assignment:
            </span>
            <span className="text-amber-800 font-bold">Pending Review</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await checkSession();
              setIsRefreshing(false);
            }}
            className="w-full sm:w-auto flex-1 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            onClick={() => logout()}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-200/80 hover:bg-emerald-300/90 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default PendingApprovalCard;
