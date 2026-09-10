'use client';

import React, { useState, useEffect } from 'react';
import { UserLogItem } from '@/types';
import { ShieldCheck, UserCheck, UserX, Trash2, Search, Key, Mail, Phone, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function UserLogDatasManager() {
  const [users, setUsers] = useState<UserLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.users || [];
        setUsers(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateApproval = async (sid: string, isApproved: 'yes' | 'no') => {
    setActionLoading(sid);
    try {
      await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sid, isApproved }),
      });
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (sid: string) => {
    if (!window.confirm(`Delete authentication account for student ${sid}?`)) return;
    setActionLoading(sid);
    try {
      await fetch(`/api/auth/userlogdatas?sid=${encodeURIComponent(sid)}`, {
        method: 'DELETE',
      });
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.sid && u.sid.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.mobile && u.mobile.includes(term))
    );
  });

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-300 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-slate-900 text-base">Student Accounts & Registration Approvals</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold px-2 py-0.5 rounded-full">
                {users.length} Total Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Manage student portal login credentials and access approval</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative bg-white rounded-xl border border-slate-300 p-1 flex items-center focus-within:ring-2 focus-within:ring-emerald-500 shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400 ml-1 mr-1.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search account by name, SID, email..."
            className="py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading user accounts...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const isApproved = u.isApproved === 'yes';
            const isPending = !u.isApproved || u.isApproved === 'pending';
            const isBusy = actionLoading === u.sid;

            return (
              <div
                key={u.sid || u.email}
                className="p-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all shadow-2xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-lg">
                      SID: {u.sid}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{u.name}</h4>
                    {u.userType === 'admin' && (
                      <span className="bg-purple-100 text-purple-900 border border-purple-300 px-1.5 py-0.2 rounded text-[10px] font-bold">
                        Admin
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isPending
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Approved</span>
                        </>
                      ) : isPending ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending Approval</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          <span>Rejected</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {u.email}
                    </span>
                    {u.mobile && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {u.mobile}
                      </span>
                    )}
                    {u.college && <span>🎓 {u.college}</span>}
                    {u.hscBatch && <span>📚 {u.hscBatch}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!isApproved ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateApproval(u.sid, 'yes')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleUpdateApproval(u.sid, 'no')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDeleteUser(u.sid)}
                    className="p-1.5 text-rose-700 hover:bg-rose-100 rounded-xl cursor-pointer transition-all border border-rose-200"
                    title="Delete Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center text-slate-400 space-y-1">
            <p className="text-sm font-bold text-slate-500">No user accounts found</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
