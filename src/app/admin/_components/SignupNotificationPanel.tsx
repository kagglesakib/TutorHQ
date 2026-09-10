'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, X, ShieldAlert, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLogItem } from '@/types';

export default function SignupNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<UserLogItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.users || [];
      setPendingUsers(list.filter((u: UserLogItem) => u.isApproved !== 'yes'));
    } catch {
      // transient ignore
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (sid: string) => {
    setLoading(true);
    try {
      await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, isApproved: 'yes' }),
      });
      await fetchPending();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (sid: string) => {
    setLoading(true);
    try {
      await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, isApproved: 'no' }),
      });
      await fetchPending();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const count = pendingUsers.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-emerald-200 hover:text-white bg-emerald-900/80 hover:bg-emerald-800/90 rounded-xl border border-emerald-700/80 transition-all cursor-pointer relative shadow-2xs"
        title="Pending Registrations"
      >
        <Bell className="w-3.5 h-3.5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[8px] font-black px-1 py-0.2 rounded-full animate-pulse shadow-xs">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.96 }}
            className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-emerald-700/80 rounded-2xl shadow-2xl z-50 text-white overflow-hidden"
          >
            <div className="p-3 bg-gradient-to-r from-emerald-900 to-teal-900 border-b border-emerald-700 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-black">Registration Approvals</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 border border-emerald-700">
                {count} Pending
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
              {count > 0 ? (
                pendingUsers.map((u) => (
                  <div
                    key={u.sid || u.email}
                    className="p-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs space-y-1.5 hover:border-emerald-500/60 transition-all"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate text-[11px]">{u.name}</p>
                        <p className="text-[9px] text-emerald-300/80 font-mono truncate">{u.email}</p>
                        <p className="text-[9px] text-slate-400 font-mono">SID: {u.sid}</p>
                      </div>
                      <span className="text-[8px] bg-amber-950/80 text-amber-300 border border-amber-700 px-1 py-0.2 rounded font-mono font-bold">
                        Pending
                      </span>
                    </div>

                    <div className="flex items-center gap-1 pt-1 border-t border-slate-700/80">
                      <button
                        onClick={() => handleApprove(u.sid)}
                        disabled={loading}
                        className="flex-1 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <Check className="w-2.5 h-2.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(u.sid)}
                        disabled={loading}
                        className="flex-1 py-1 px-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                      >
                        <X className="w-2.5 h-2.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-bold text-slate-300">All caught up!</p>
                  <p className="text-[10px] text-slate-400">No pending student registration requests</p>
                </div>
              )}
            </div>

            <div className="p-2 bg-slate-950 border-t border-slate-800 text-center">
              <Link
                href="/admin/approvals"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>View All Requests & Accounts</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
