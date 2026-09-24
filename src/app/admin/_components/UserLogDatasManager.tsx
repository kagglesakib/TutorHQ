'use client';

import React, { useState, useEffect } from 'react';
import { UserLogItem } from '@/types';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Search,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Edit3,
  X,
  Check,
  GraduationCap,
  BookOpen,
  MapPin,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Hash,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
  Building2,
  Calendar,
} from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'approved' | 'revoked';

export default function UserLogDatasManager() {
  const [users, setUsers] = useState<UserLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [suggestedNextSid, setSuggestedNextSid] = useState('S101');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal for assigning SID & Approving pending registration
  const [approvingUser, setApprovingUser] = useState<UserLogItem | null>(null);
  const [assignedSidInput, setAssignedSidInput] = useState('');

  // Modal for editing user account
  const [editingUser, setEditingUser] = useState<UserLogItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    sid: '',
    email: '',
    mobile: '',
    guardiansPhone: '',
    college: '',
    hscBatch: '',
    subject: '',
    group: '',
    address: '',
    userType: 'student',
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchUsers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list: UserLogItem[] = Array.isArray(data) ? data : data.users || [];
        setUsers(list);
        if (data.suggestedNextSid) {
          setSuggestedNextSid(data.suggestedNextSid);
        }
      } else {
        const d = await res.json();
        setToast({ type: 'error', message: d.error || 'Failed to fetch user accounts' });
      }
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', message: err.message || 'Error connecting to database' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleSync = () => fetchUsers();
    window.addEventListener('pending-registrations-updated', handleSync);
    return () => {
      window.removeEventListener('pending-registrations-updated', handleSync);
    };
  }, []);

  // Approval status updater: supports 'yes', 'no' (revoked), or 'pending'
  const handleUpdateApproval = async (
    user: UserLogItem,
    isApproved: 'yes' | 'no' | 'pending',
    customSid?: string
  ) => {
    const key = user._id || user.sid || user.email;
    setActionLoading(key);

    try {
      const targetSid = customSid !== undefined ? customSid : user.sid;

      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user._id,
          _id: user._id,
          originalSid: user.sid,
          email: user.email,
          sid: targetSid,
          approved: isApproved,
          isApproved,
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update approval status');
      }

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => {
          if (
            (user._id && u._id === user._id) ||
            (user.email && u.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
            (user.sid && u.sid && u.sid.toUpperCase() === user.sid.toUpperCase())
          ) {
            return {
              ...u,
              approved: isApproved,
              isApproved,
              sid: targetSid || u.sid,
            };
          }
          return u;
        })
      );

      setToast({
        type: 'success',
        message:
          isApproved === 'no'
            ? `Access revoked for ${user.name || user.email}. Login disabled.`
            : isApproved === 'yes'
            ? `Account approved for ${user.name || user.email}. (SID: ${targetSid || user.sid})`
            : `Account set to pending review for ${user.name || user.email}.`,
      });

      // Background re-sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pending-registrations-updated'));
      }
      await fetchUsers();
    } catch (err: any) {
      console.error(err);
      setToast({
        type: 'error',
        message: err.message || 'Error updating approval status',
      });
    } finally {
      setActionLoading(null);
      setApprovingUser(null);
    }
  };

  // Open modal if SID is missing when approving, otherwise approve immediately
  const initiateApprove = (user: UserLogItem) => {
    if (!user.sid || user.sid.trim() === '') {
      setApprovingUser(user);
      setAssignedSidInput(suggestedNextSid);
    } else {
      handleUpdateApproval(user, 'yes');
    }
  };

  // Delete user
  const handleDeleteUser = async (user: UserLogItem) => {
    const identifier = user.name ? `${user.name} (${user.email || user.sid})` : user.email || user.sid;
    if (!window.confirm(`Delete authentication account for ${identifier}? This permanently removes portal credentials.`)) {
      return;
    }

    const key = user._id || user.sid || user.email;
    setActionLoading(key);

    try {
      const params = new URLSearchParams();
      if (user._id) params.set('id', user._id);
      if (user.email) params.set('email', user.email);
      if (user.sid) params.set('sid', user.sid);

      const res = await fetch(`/api/auth/userlogdatas?${params.toString()}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      setUsers((prev) => prev.filter((u) => (user._id ? u._id !== user._id : (u.email !== user.email && (!user.sid || u.sid !== user.sid)))));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pending-registrations-updated'));
      }
      setToast({
        type: 'success',
        message: `Account for ${user.name || user.email} was removed.`,
      });
    } catch (err: any) {
      console.error(err);
      setToast({
        type: 'error',
        message: err.message || 'Failed to delete account',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Open Edit Dialog
  const openEditModal = (user: UserLogItem) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || '',
      sid: user.sid || '',
      email: user.email || '',
      mobile: user.mobile || '',
      guardiansPhone: user.guardiansPhone || '',
      college: user.college || '',
      hscBatch: user.hscBatch || '',
      subject: user.subject || '',
      group: user.group || '',
      address: user.address || '',
      userType: user.userType || 'student',
    });
  };

  // Save edited account info
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const key = editingUser.sid || editingUser.email;
    setActionLoading(key);

    try {
      const res = await fetch('/api/auth/userlogdatas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          sid: editFormData.sid,
          name: editFormData.name,
          password: editingUser.password,
          mobile: editFormData.mobile,
          guardiansPhone: editFormData.guardiansPhone,
          college: editFormData.college,
          hscBatch: editFormData.hscBatch,
          subject: editFormData.subject,
          group: editFormData.group,
          address: editFormData.address,
          userType: editFormData.userType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update account details');
      }

      setToast({
        type: 'success',
        message: `Account details for ${editFormData.name || editingUser.email} updated.`,
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.message || 'Error updating account details',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Metrics calculation
  const getApprovalStatus = (u: UserLogItem): 'yes' | 'no' | 'pending' => {
    const raw = (u.approved ?? u.isApproved) as any;
    if (raw === 'yes' || raw === 'approved' || raw === true) return 'yes';
    if (raw === 'no' || raw === 'disapproved' || raw === 'rejected' || raw === false) return 'no';
    return 'pending';
  };

  // Helper to identify admin
  const isAdminAccount = (u: UserLogItem) => {
    if (u.userType === 'admin') return true;
    const sid = String(u.sid || '').trim().toUpperCase();
    if (sid === 'ADMIN' || sid === '0000000' || sid === '0') return true;
    const email = String(u.email || '').trim().toLowerCase();
    if (
      email === 'sakib1514817122@gmail.com' ||
      email === 'sakibhasan.office@gmail.com' ||
      email === 'kagglesakib@gmail.com'
    ) return true;
    const name = String(u.name || '').trim().toLowerCase();
    if (name === 'sakibul hasan' || name.includes('sakibul hasan') || name === 'admin') return true;
    return false;
  };

  // Strictly filter out admin accounts so they are not shown as students in approvals matrix
  const studentUsers = users.filter((u) => !isAdminAccount(u));

  const totalCount = studentUsers.length;
  const pendingCount = studentUsers.filter((u) => getApprovalStatus(u) === 'pending').length;
  const approvedCount = studentUsers.filter((u) => getApprovalStatus(u) === 'yes').length;
  const revokedCount = studentUsers.filter((u) => getApprovalStatus(u) === 'no').length;

  // Filter accounts
  const filteredUsers = studentUsers.filter((u) => {
    const status = getApprovalStatus(u);
    const isAppr = status === 'yes';
    const isPend = status === 'pending';
    const isRevk = status === 'no';

    if (activeTab === 'pending' && !isPend) return false;
    if (activeTab === 'approved' && !isAppr) return false;
    if (activeTab === 'revoked' && !isRevk) return false;

    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.sid && u.sid.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.mobile && u.mobile.includes(term)) ||
      (u.guardiansPhone && u.guardiansPhone.includes(term)) ||
      (u.college && u.college.toLowerCase().includes(term)) ||
      (u.hscBatch && u.hscBatch.toLowerCase().includes(term)) ||
      (u.subject && u.subject.toLowerCase().includes(term)) ||
      (u.group && u.group.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4 w-full">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-sm transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
              : 'bg-rose-50 text-rose-950 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1.5 hover:bg-slate-200/60 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. COMPACT RESPONSIVE KPI METRICS RIBBON                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Metric 1: Total Registered */}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer shadow-2xs ${
            activeTab === 'all'
              ? 'bg-indigo-100/90 border-indigo-400 ring-2 ring-indigo-400/30'
              : 'bg-indigo-50/70 border-indigo-200/80 hover:bg-indigo-100/60'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-950 truncate">Total Registered</span>
            <div className="p-1 rounded-lg bg-indigo-200/80 text-indigo-800 shrink-0">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-indigo-950 font-mono">{totalCount}</span>
            <span className="text-[10px] font-bold text-indigo-700">Accounts</span>
          </div>
        </button>

        {/* Metric 2: Pending Approvals */}
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer shadow-2xs relative ${
            activeTab === 'pending'
              ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-amber-50/70 border-amber-200/80 hover:bg-amber-100/60'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 truncate">Pending Review</span>
            <div className="p-1 rounded-lg bg-amber-200/80 text-amber-800 shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-amber-950 font-mono">{pendingCount}</span>
            {pendingCount > 0 ? (
              <span className="text-[9px] font-extrabold text-white bg-amber-600 px-1.5 py-0.2 rounded-md animate-pulse">
                Action Req
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-700">All Set</span>
            )}
          </div>
        </button>

        {/* Metric 3: Active & Approved */}
        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer shadow-2xs ${
            activeTab === 'approved'
              ? 'bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-400/30'
              : 'bg-emerald-50/70 border-emerald-200/80 hover:bg-emerald-100/60'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-950 truncate">Active Approved</span>
            <div className="p-1 rounded-lg bg-emerald-200/80 text-emerald-800 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-emerald-950 font-mono">{approvedCount}</span>
            <span className="text-[10px] font-bold text-emerald-700">Active</span>
          </div>
        </button>

        {/* Metric 4: Revoked / Disapproved */}
        <button
          type="button"
          onClick={() => setActiveTab('revoked')}
          className={`p-2.5 sm:p-3 rounded-xl border transition-all text-left cursor-pointer shadow-2xs ${
            activeTab === 'revoked'
              ? 'bg-rose-100/90 border-rose-400 ring-2 ring-rose-400/30'
              : 'bg-rose-50/70 border-rose-200/80 hover:bg-rose-100/60'
          }`}
        >
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-950 truncate">Revoked</span>
            <div className="p-1 rounded-lg bg-rose-200/80 text-rose-800 shrink-0">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-black text-rose-950 font-mono">{revokedCount}</span>
            <span className="text-[10px] font-bold text-rose-700">Blocked</span>
          </div>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. COMPACT CONTROLS & FILTER TOOLBAR                      */}
      {/* ========================================================= */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-2.5 sm:p-3 space-y-2.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Search Box */}
          <div className="relative flex-1 bg-slate-50/90 rounded-xl border border-slate-300/90 px-2.5 py-1 flex items-center focus-within:ring-2 focus-within:ring-teal-500 focus-within:bg-white shadow-2xs">
            <Search className="w-3.5 h-3.5 text-teal-700 mr-2 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, SID, email, mobile, batch, college..."
              className="py-0.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden w-full font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-400 cursor-pointer mr-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 active:scale-95"
            title="Sync user accounts from server"
          >
            <RefreshCw className={`w-3 h-3 text-teal-700 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* Filter Tabs - Compact Inline Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {/* 1. All Accounts */}
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-mono font-black ${
                activeTab === 'all' ? 'bg-slate-800 text-slate-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalCount}
            </span>
          </button>

          {/* 2. Pending Approvals */}
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300'
            }`}
          >
            <Clock className={`w-3 h-3 shrink-0 ${activeTab === 'pending' ? 'text-white' : 'text-amber-600'}`} />
            <span>Pending</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-mono font-black ${
                activeTab === 'pending'
                  ? 'bg-amber-700 text-amber-100'
                  : 'bg-amber-200/90 text-amber-950'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          {/* 3. Approved */}
          <button
            type="button"
            onClick={() => setActiveTab('approved')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
              activeTab === 'approved'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300'
            }`}
          >
            <CheckCircle2 className={`w-3 h-3 shrink-0 ${activeTab === 'approved' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Approved</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-mono font-black ${
                activeTab === 'approved'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-emerald-200/90 text-emerald-950'
              }`}
            >
              {approvedCount}
            </span>
          </button>

          {/* 4. Revoked */}
          <button
            type="button"
            onClick={() => setActiveTab('revoked')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
              activeTab === 'revoked'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-950 border border-rose-300'
            }`}
          >
            <XCircle className={`w-3 h-3 shrink-0 ${activeTab === 'revoked' ? 'text-white' : 'text-rose-600'}`} />
            <span>Revoked</span>
            <span
              className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-mono font-black ${
                activeTab === 'revoked'
                  ? 'bg-rose-800 text-rose-100'
                  : 'bg-rose-200/90 text-rose-950'
              }`}
            >
              {revokedCount}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. COMPACT STUDENT CARDS GRID                             */}
      {/* ========================================================= */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-500 space-y-2 bg-white rounded-2xl border border-slate-200">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-800">Loading student accounts...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredUsers.map((u) => {
              const status = getApprovalStatus(u);
              const isApproved = status === 'yes';
              const isRevoked = status === 'no';
              const isPending = status === 'pending';

              const userKey = u._id || u.sid || u.email;
              const isBusy = actionLoading === userKey;

              return (
                <div
                  key={u._id || userKey}
                  className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all duration-200 border ${
                    isPending
                      ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/20 to-white border-amber-300 shadow-[0_2px_12px_-2px_rgba(245,158,11,0.18)] hover:border-amber-400'
                      : isRevoked
                      ? 'bg-gradient-to-br from-rose-50/80 via-red-50/20 to-white border-rose-300 shadow-[0_2px_12px_-2px_rgba(244,63,94,0.16)] hover:border-rose-400'
                      : 'bg-gradient-to-br from-emerald-50/80 via-teal-50/20 to-white border-emerald-300 shadow-[0_2px_12px_-2px_rgba(16,185,129,0.16)] hover:border-emerald-400'
                  }`}
                >
                  {/* Card Top: Student Profile & Status */}
                  <div className="space-y-2 relative z-10">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Compact Avatar */}
                        <div className="relative shrink-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-2xs border ${
                              isPending
                                ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300/80'
                                : isRevoked
                                ? 'bg-gradient-to-br from-rose-500 to-red-600 border-rose-300/80'
                                : 'bg-gradient-to-br from-teal-500 to-emerald-600 border-teal-300/80'
                            }`}
                          >
                            {(u.name || u.email || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white flex items-center justify-center ${
                              isPending ? 'bg-amber-500' : isRevoked ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          >
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h4
                            className="font-extrabold text-slate-900 group-hover:text-teal-950 transition-colors text-xs sm:text-sm leading-snug truncate"
                            title={u.name || 'Unnamed'}
                          >
                            {u.name || 'Unnamed Student'}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {u.sid ? (
                              <span className="text-[9.5px] font-mono font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded shadow-2xs flex items-center gap-0.5">
                                <Hash className="w-2.5 h-2.5 text-indigo-200" />
                                <span>{u.sid}</span>
                              </span>
                            ) : (
                              <span className="text-[9.5px] font-mono font-bold bg-amber-500 text-white px-1.5 py-0.2 rounded shadow-2xs flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-100" />
                                <span>No SID</span>
                              </span>
                            )}
                            {u.hscBatch && (
                              <span className="text-[9.5px] font-mono font-bold bg-purple-100 text-purple-900 border border-purple-200 px-1.5 py-0.2 rounded">
                                HSC {u.hscBatch}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compact Status Badge */}
                      <div className="shrink-0">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                            <span>Approved</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs animate-pulse">
                            <Clock className="w-3 h-3 text-white shrink-0" />
                            <span>Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-2xs">
                            <XCircle className="w-3 h-3 text-white shrink-0" />
                            <span>Revoked</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Compact Details List */}
                    <div className="space-y-1.5 text-xs pt-1">
                      {/* Email Address */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-sky-50/70 border border-sky-200/80 text-sky-950">
                        <Mail className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="font-mono text-[10.5px] truncate select-all font-semibold" title={u.email}>
                          {u.email}
                        </span>
                      </div>

                      {/* Mobile & Guardian Phones */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-emerald-950">
                          <Smartphone className="w-3 h-3 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[8.5px] text-emerald-800 font-extrabold uppercase tracking-wider block">
                              Mobile
                            </span>
                            <span className="font-mono text-[10.5px] font-bold truncate block">
                              {u.mobile || '—'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-teal-50/70 border border-teal-200/80 text-teal-950">
                          <Phone className="w-3 h-3 text-teal-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[8.5px] text-teal-800 font-extrabold uppercase tracking-wider block">
                              Guardian
                            </span>
                            <span className="font-mono text-[10.5px] font-bold truncate block">
                              {u.guardiansPhone || '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Institution & Subject */}
                      {(u.college || u.subject) && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50/60 border border-purple-200/80 text-purple-950">
                          <Building2 className="w-3 h-3 text-purple-600 shrink-0" />
                          <span className="truncate text-[10.5px] font-semibold" title={`${u.college || ''} ${u.subject || ''}`}>
                            {u.college || 'College unlisted'} {u.subject ? `• ${u.subject}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-1.5 relative z-10">
                    {/* Primary Approval / Revocation Button */}
                    <div className="flex-1 min-w-[120px]">
                      {!isApproved ? (
                        isPending ? (
                          <div className="flex items-center gap-1 w-full">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => initiateApprove(u)}
                              className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-2xs active:scale-95 whitespace-nowrap"
                            >
                              {isBusy ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              <span>{u.sid ? 'Approve' : 'Assign & Approve'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUpdateApproval(u, 'no')}
                              className="py-1.5 px-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-0.5 cursor-pointer disabled:opacity-50 transition-all shadow-2xs active:scale-95 shrink-0"
                              title="Reject registration"
                            >
                              {isBusy ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <UserX className="w-3 h-3" />
                              )}
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => initiateApprove(u)}
                            className="w-full py-1.5 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-2xs active:scale-95"
                          >
                            {isBusy ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <UserCheck className="w-3 h-3" />
                            )}
                            <span>{u.sid ? 'Approve' : 'Assign SID & Approve'}</span>
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateApproval(u, 'no')}
                          className="w-full py-1.5 px-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 transition-all shadow-2xs active:scale-95"
                          title="Revoke portal access for this student"
                        >
                          {isBusy ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          <span>Revoke Access</span>
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions (Reset, Edit, Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Reset to Pending (if already approved or revoked) */}
                      {!isPending && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateApproval(u, 'pending')}
                          className="p-1.5 text-amber-900 bg-amber-100 hover:bg-amber-600 hover:text-white border border-amber-300 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
                          title="Reset status back to Pending review"
                        >
                          <Clock className="w-3 h-3" />
                        </button>
                      )}

                      {/* Edit Account */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => openEditModal(u)}
                        className="p-1.5 text-indigo-900 bg-indigo-100 hover:bg-indigo-600 hover:text-white border border-indigo-300 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
                        title="Edit Account Information"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>

                      {/* Delete Account */}
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-rose-900 bg-rose-100 hover:bg-rose-600 hover:text-white border border-rose-300 rounded-lg cursor-pointer transition-all shadow-2xs active:scale-95"
                        title="Permanently Delete Account"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 space-y-2.5 bg-white rounded-3xl border border-slate-200 p-6">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No student accounts found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? 'No registered accounts matched your search terms.'
                : 'There are currently no accounts in this status filter.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-teal-700 underline cursor-pointer hover:text-teal-800"
              >
                Clear search query
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MODAL: ASSIGN SID & APPROVE STUDENT REGISTRATION       */}
      {/* ========================================================= */}
      {approvingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-300">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">Assign SID & Approve</h3>
                  <p className="text-xs text-slate-500 font-medium">Allocate Student ID to activate account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovingUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Summary with Light Colors */}
            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">{approvingUser.name}</p>
                <p className="text-slate-600 font-mono text-[11px]">{approvingUser.email}</p>
                {approvingUser.mobile && (
                  <p className="font-mono text-slate-700 font-bold">📱 {approvingUser.mobile}</p>
                )}
                {approvingUser.college && (
                  <p className="text-purple-900 font-medium">🎓 {approvingUser.college}</p>
                )}
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2">
                <label className="block text-xs font-black text-emerald-950 uppercase tracking-wider">
                  Assign Student ID (SID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={assignedSidInput}
                  onChange={(e) => setAssignedSidInput(e.target.value.toUpperCase())}
                  placeholder="e.g. S101, S102..."
                  className="w-full px-3.5 py-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                />

                {/* Quick-pick suggested SID button */}
                <div className="flex items-center justify-between gap-2 text-[11px] pt-1">
                  <span className="text-emerald-800 font-medium">Suggested Next ID:</span>
                  <button
                    type="button"
                    onClick={() => setAssignedSidInput(suggestedNextSid)}
                    className="font-mono font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-300 cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>Use {suggestedNextSid}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setApprovingUser(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateApproval(approvingUser, 'yes', assignedSidInput)}
                disabled={!assignedSidInput.trim() || actionLoading !== null}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs active:scale-95"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Confirm & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: EDIT ACCOUNT CREDENTIALS & DETAILS              */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-2xl border border-indigo-300">
                  <Edit3 className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-base">Edit Account Information</h3>
                  <p className="text-xs text-slate-500 font-medium">Update student profile or SID details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                {/* Student ID */}
                <div className="bg-indigo-50/70 p-2.5 rounded-2xl border border-indigo-200">
                  <label className="block font-bold text-indigo-950 mb-1">Student ID (SID)</label>
                  <input
                    type="text"
                    value={editFormData.sid}
                    onChange={(e) => setEditFormData({ ...editFormData, sid: e.target.value.toUpperCase() })}
                    placeholder="e.g. S101"
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl font-mono font-bold text-indigo-950 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                {/* Email Address (Readonly) */}
                <div className="bg-sky-50/70 p-2.5 rounded-2xl border border-sky-200">
                  <label className="block font-bold text-sky-950 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={editFormData.email}
                    className="w-full px-3 py-2 border border-sky-200 bg-white/70 text-sky-950 font-mono text-[11px] rounded-xl cursor-not-allowed shadow-2xs"
                  />
                </div>

                {/* Mobile Phone */}
                <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200">
                  <label className="block font-bold text-emerald-950 mb-1">Student Mobile</label>
                  <input
                    type="text"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  />
                </div>

                {/* Guardian Phone */}
                <div className="bg-teal-50/70 p-2.5 rounded-2xl border border-teal-200">
                  <label className="block font-bold text-teal-950 mb-1">Guardian&apos;s Phone</label>
                  <input
                    type="text"
                    value={editFormData.guardiansPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, guardiansPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                {/* College / Institution */}
                <div className="bg-purple-50/70 p-2.5 rounded-2xl border border-purple-200">
                  <label className="block font-bold text-purple-950 mb-1">College / Institution</label>
                  <input
                    type="text"
                    value={editFormData.college}
                    onChange={(e) => setEditFormData({ ...editFormData, college: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  />
                </div>

                {/* HSC Batch */}
                <div className="bg-indigo-50/70 p-2.5 rounded-2xl border border-indigo-200">
                  <label className="block font-bold text-indigo-950 mb-1">HSC Batch</label>
                  <input
                    type="text"
                    value={editFormData.hscBatch}
                    onChange={(e) => setEditFormData({ ...editFormData, hscBatch: e.target.value })}
                    placeholder="e.g. 2026"
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Residential Address */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-800 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs active:scale-95"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
