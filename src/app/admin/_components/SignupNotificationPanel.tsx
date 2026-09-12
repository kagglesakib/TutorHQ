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
      // STRICT FILTER: Only show users whose approval status is explicitly 'pending' or not yet set
      setPendingUsers(
        list.filter(
          (u: UserLogItem) =>
            u.userType !== 'admin' && (!u.isApproved || u.isApproved.toLowerCase() === 'pending')
        )
      );
    } catch {
      // transient ignore
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (user: UserLogItem) => {
    let targetSid = (user.sid || '').trim();

    // If student has no SID assigned yet, ask admin for SID
    if (!targetSid) {
      const enteredSid = window.prompt(
        `Assign a Student ID (SID) to approve ${user.name || user.email}:\n(e.g., S101, S102)`,
        'S101'
      );
      if (!enteredSid || !enteredSid.trim()) {
        return; // User canceled
      }
      targetSid = enteredSid.trim().toUpperCase();
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, sid: targetSid, isApproved: 'yes' }),
      });
      const d = await res.json();
      if (!res.ok) {
        alert(d.error || 'Failed to approve user');
      }
      await fetchPending();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (user: UserLogItem) => {
    if (!window.confirm(`Disapprove / reject registration for ${user.name || user.email}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, sid: user.sid || '', isApproved: 'no' }),
      });
      const d = await res.json();
      if (!res.ok) {
        alert(d.error || 'Failed to reject user');
      }
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
          <>
            {/* Click-outside backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent backdrop-blur-[2px] sm:backdrop-blur-none"
            />

            {/* Notification window - perfectly responsive for mobile & desktop */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="fixed left-3 right-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-88 max-w-sm mx-auto sm:mx-0 bg-slate-900/98 backdrop-blur-2xl border border-emerald-600/70 rounded-2xl shadow-2xl z-50 text-white overflow-hidden ring-1 ring-emerald-500/30"
            >
              <div className="p-3 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-b border-emerald-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1 bg-emerald-800/80 text-emerald-300 rounded-lg border border-emerald-700/80 shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black tracking-tight block truncate">Registration Approvals</span>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">{count} Pending</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                  title="Close notification window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-2 no-scrollbar">
                {count > 0 ? (
                  pendingUsers.map((u) => (
                    <div
                      key={u.sid || u.email}
                      className="p-2.5 bg-slate-800/90 border border-slate-700/90 rounded-xl text-xs space-y-2 hover:border-emerald-500/60 transition-all shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-white truncate text-[11px]">{u.name}</p>
                          <p className="text-[9.5px] text-emerald-300 font-mono truncate">{u.email}</p>
                          <p className="text-[9px] text-slate-400 font-mono">SID: {u.sid || 'N/A'}</p>
                        </div>
                        <span className="text-[8px] bg-amber-950/90 text-amber-300 border border-amber-600/80 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                          Pending
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-700/80">
                        <button
                          onClick={() => handleApprove(u)}
                          disabled={loading}
                          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs active:scale-98 disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(u)}
                          disabled={loading}
                          className="flex-1 py-1.5 px-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs active:scale-98 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" /> Reject
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

              <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center">
                <Link
                  href="/admin/approvals"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 hover:underline"
                >
                  <span>View All Requests & Accounts</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
