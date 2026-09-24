'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, X, ShieldAlert, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserLogItem } from '@/types';

export default function SignupNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<UserLogItem[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [assigningSidUser, setAssigningSidUser] = useState<UserLogItem | null>(null);
  const [sidInputValue, setSidInputValue] = useState('');
  const [panelMessage, setPanelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isPendingStudent = (u: UserLogItem): boolean => {
    if (u.userType === 'admin') return false;
    const sid = String(u.sid || '').trim().toUpperCase();
    if (sid === 'ADMIN' || sid === '0000000' || sid === '0') return false;
    const email = String(u.email || '').trim().toLowerCase();
    if (
      email === 'sakib1514817122@gmail.com' ||
      email === 'sakibhasan.office@gmail.com' ||
      email === 'kagglesakib@gmail.com'
    ) return false;
    const name = String(u.name || '').trim().toLowerCase();
    if (name === 'sakibul hasan' || name.includes('sakibul hasan') || name === 'admin') return false;

    const appr = String(u.approved ?? '').trim().toLowerCase();
    const isAppr = String(u.isApproved ?? '').trim().toLowerCase();

    // Explicitly revoked / rejected -> NEVER pending
    if (appr === 'no' || isAppr === 'no' || appr === 'revoked' || isAppr === 'revoked') {
      return false;
    }

    // Explicitly approved / active -> NEVER pending
    if (appr === 'yes' || isAppr === 'yes' || appr === 'approved' || isAppr === 'approved') {
      return false;
    }

    // Explicitly pending
    if (appr === 'pending' || isAppr === 'pending') {
      return true;
    }

    // If student has an assigned SID, they are considered active/approved, not pending
    if (u.sid && u.sid.trim() !== '') {
      return false;
    }

    // New student signup with no SID and no approval
    return true;
  };

  const fetchPending = async () => {
    try {
      const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.users || [];
      // STRICT FILTER: Only show users whose approval status is explicitly pending
      setPendingUsers(list.filter(isPendingStudent));
    } catch {
      // transient ignore
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    const handleSync = () => fetchPending();
    window.addEventListener('pending-registrations-updated', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('pending-registrations-updated', handleSync);
    };
  }, []);

  const handleApproveClick = (user: UserLogItem) => {
    const targetSid = (user.sid || '').trim();
    if (!targetSid) {
      setAssigningSidUser(user);
      setSidInputValue('S101');
      return;
    }
    executeApprove(user, targetSid);
  };

  const executeApprove = async (user: UserLogItem, targetSid: string) => {
    const key = user._id || user.sid || user.email;
    setLoadingKey(key);
    setPanelMessage(null);
    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user._id,
          _id: user._id,
          originalSid: user.sid,
          email: user.email,
          sid: targetSid,
          approved: 'yes',
          isApproved: 'yes',
          name: user.name,
          mobile: user.mobile,
          college: user.college,
          hscBatch: user.hscBatch,
          subject: user.subject,
          group: user.group,
          guardiansPhone: user.guardiansPhone,
          address: user.address,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || 'Failed to approve user');
      }

      setPendingUsers((prev) =>
        prev.filter((p) => (user._id ? p._id !== user._id : p.email !== user.email))
      );
      setAssigningSidUser(null);
      setPanelMessage({ type: 'success', text: `Approved ${user.name || user.email} (${targetSid})` });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pending-registrations-updated'));
      }
      await fetchPending();
    } catch (err: any) {
      console.error(err);
      setPanelMessage({ type: 'error', text: err.message || 'Failed to approve user' });
    } finally {
      setLoadingKey(null);
    }
  };

  const handleReject = async (user: UserLogItem) => {
    const key = user._id || user.sid || user.email;
    setLoadingKey(key);
    setPanelMessage(null);

    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user._id,
          _id: user._id,
          originalSid: user.sid,
          email: user.email,
          sid: user.sid || '',
          approved: 'no',
          isApproved: 'no',
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error || 'Failed to reject registration');
      }

      // Optimistic removal
      setPendingUsers((prev) =>
        prev.filter((p) => (user._id ? p._id !== user._id : p.email !== user.email))
      );
      setPanelMessage({ type: 'success', text: `Registration rejected for ${user.name || user.email}` });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pending-registrations-updated'));
      }
      await fetchPending();
    } catch (err: any) {
      console.error(err);
      setPanelMessage({ type: 'error', text: err.message || 'Failed to reject registration' });
    } finally {
      setLoadingKey(null);
    }
  };

  const count = pendingUsers.length;

  // Only show notification bell when there are pending registrations
  if (count === 0 && !isOpen) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-emerald-200 hover:text-white bg-emerald-900/80 hover:bg-emerald-800/90 rounded-xl border border-emerald-700/80 transition-all cursor-pointer relative shadow-2xs"
        title={`Pending Registrations (${count})`}
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

              {/* Status Message Banner */}
              {panelMessage && (
                <div
                  className={`px-3 py-2 text-[10px] font-bold flex items-center justify-between border-b ${
                    panelMessage.type === 'success'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80'
                      : 'bg-rose-950/90 text-rose-300 border-rose-800/80'
                  }`}
                >
                  <span className="truncate">{panelMessage.text}</span>
                  <button
                    type="button"
                    onClick={() => setPanelMessage(null)}
                    className="text-slate-400 hover:text-white p-0.5 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="max-h-72 overflow-y-auto p-2 space-y-2 no-scrollbar">
                {count > 0 ? (
                  pendingUsers.map((u) => {
                    const isBusy = loadingKey === (u._id || u.sid || u.email);
                    const isAssigningThisUser =
                      assigningSidUser &&
                      ((u._id && assigningSidUser._id === u._id) ||
                        (u.email && assigningSidUser.email === u.email));

                    return (
                      <div
                        key={u._id || u.sid || u.email}
                        className="p-2.5 bg-slate-800/90 border border-slate-700/90 rounded-xl text-xs space-y-2 hover:border-emerald-500/60 transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white truncate text-[11px]">{u.name}</p>
                            <p className="text-[9.5px] text-emerald-300 font-mono truncate">{u.email}</p>
                            <p className="text-[9px] text-slate-400 font-mono">SID: {u.sid || 'Unassigned'}</p>
                          </div>
                          <span className="text-[8px] bg-amber-950/90 text-amber-300 border border-amber-600/80 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
                            Pending
                          </span>
                        </div>

                        {/* Inline SID Assignment if student has no SID */}
                        {isAssigningThisUser ? (
                          <div className="p-2 bg-emerald-950/90 border border-emerald-600/70 rounded-lg space-y-1.5 mt-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9.5px] font-bold text-emerald-300">Assign Student ID (SID):</span>
                              <button
                                type="button"
                                onClick={() => setAssigningSidUser(null)}
                                className="text-slate-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={sidInputValue}
                                onChange={(e) => setSidInputValue(e.target.value.toUpperCase())}
                                placeholder="e.g. S101"
                                className="flex-1 bg-slate-900 border border-emerald-500/80 rounded px-2 py-1 text-xs text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                autoFocus
                              />
                              <button
                                type="button"
                                disabled={!sidInputValue.trim() || isBusy}
                                onClick={() => executeApprove(u, sidInputValue.trim().toUpperCase())}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold disabled:opacity-50 transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                {isBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Confirm'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-700/80">
                            <button
                              type="button"
                              onClick={() => handleApproveClick(u)}
                              disabled={isBusy}
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs active:scale-98 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>{u.sid ? 'Approve' : 'Assign SID & Approve'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(u)}
                              disabled={isBusy}
                              className="flex-1 py-1.5 px-2 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white rounded-lg text-[9.5px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs active:scale-98 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
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
