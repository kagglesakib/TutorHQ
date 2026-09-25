'use client';

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Users,
  BookOpen,
  ClipboardList,
  Banknote,
  Lock,
  Flame,
  AlertOctagon,
  Sparkles,
  ArrowDownCircle,
  ArrowUpCircle,
  FileCheck2,
  FileWarning,
  ServerCrash,
  Radio,
  KeyRound,
  History,
  FileJson,
} from 'lucide-react';

interface BackupRestoreProps {
  onDataRestored?: () => Promise<void> | void;
  onBackup?: () => Promise<void> | void;
  onRestore?: (jsonData: any) => Promise<{ success: boolean; message: any; stats?: any }>;
  loadingData?: boolean;
  studentsCount?: number;
  activitiesCount?: number;
  examsCount?: number;
  paymentsCount?: number;
  adminsCount?: number;
}

interface FileInspection {
  fileName: string;
  fileSizeKb: number;
  version?: string;
  exportedAt?: string;
  detectedCounts: {
    admins: number;
    students: number;
    activities: number;
    exams: number;
    payments: number;
  };
  isLegacy: boolean;
  jsonData: any;
}

export default function BackupRestore({
  onDataRestored,
  onBackup,
  onRestore,
  loadingData,
  studentsCount = 0,
  activitiesCount = 0,
  examsCount = 0,
  paymentsCount = 0,
  adminsCount = 1,
}: BackupRestoreProps) {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
    stats?: any;
  } | null>(null);

  // File inspection before destructive restore
  const [inspectedFile, setInspectedFile] = useState<FileInspection | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [acknowledgedRisk, setAcknowledgedRisk] = useState(false);

  const handleExportBackup = async () => {
    setDownloading(true);
    setStatusMessage(null);

    if (onBackup) {
      try {
        await onBackup();
        setStatusMessage({
          type: 'success',
          text: 'Full database snapshot exported and downloaded successfully! Store this file safely.',
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Error downloading backup file.',
        });
      } finally {
        setDownloading(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/backup?download=1', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch backup snapshot from server');

      const blob = await res.blob();
      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `tutorhq-backup-${dateStr}.json`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      setStatusMessage({
        type: 'success',
        text: `Full snapshot exported successfully (${fileName}). Keep it safe!`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to download backup JSON snapshot.',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setAcknowledgedRisk(false);
    try {
      const text = await file.text();
      let jsonData: any;
      try {
        jsonData = JSON.parse(text);
      } catch {
        throw new Error('The selected file is not a valid JSON document.');
      }

      const root = jsonData.data || jsonData.backup || jsonData.collections || jsonData;

      const rawAdmins = Array.isArray(root.admins) ? root.admins : [];
      const rawStudents = Array.isArray(root.students) ? root.students : [];
      const rawUsers = Array.isArray(root.users)
        ? root.users
        : Array.isArray(root.userlogdatas)
        ? root.userlogdatas
        : [];
      const rawActivities = Array.isArray(root.activities) ? root.activities : [];
      const rawExams = Array.isArray(root.exams) ? root.exams : [];
      const rawPayments = Array.isArray(root.payments) ? root.payments : [];

      const isLegacy = rawUsers.length > 0 && rawStudents.length === 0;
      const totalStudentsCount = rawStudents.length > 0 ? rawStudents.length : rawUsers.length;
      const totalAdminsCount =
        rawAdmins.length > 0 ? rawAdmins.length : rawUsers.filter((u: any) => u.userType === 'admin').length || 1;

      setInspectedFile({
        fileName: file.name,
        fileSizeKb: Math.max(1, Math.round(file.size / 1024)),
        version: root._backupMetadata?.version || (isLegacy ? 'Legacy Backup Format' : 'Normalized 3.0'),
        exportedAt: root._backupMetadata?.exportedAt || root.exportedAt,
        detectedCounts: {
          admins: totalAdminsCount,
          students: totalStudentsCount,
          activities: rawActivities.length,
          exams: rawExams.length,
          payments: rawPayments.length,
        },
        isLegacy,
        jsonData,
      });

      setShowConfirmModal(true);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Invalid or unreadable backup JSON file.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const executeRestore = async () => {
    if (!inspectedFile || !acknowledgedRisk) return;

    setRestoring(true);
    setStatusMessage(null);
    setShowConfirmModal(false);

    try {
      if (onRestore) {
        const result = await onRestore(inspectedFile.jsonData);
        if (result.success) {
          setStatusMessage({
            type: 'success',
            text: result.message || 'Database restored successfully!',
            stats: result.stats || inspectedFile.detectedCounts,
          });
          if (onDataRestored) await onDataRestored();
        } else {
          setStatusMessage({
            type: 'error',
            text: result.message || 'Database restoration failed.',
          });
        }
        return;
      }

      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectedFile.jsonData),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || resJson.message || 'Failed to restore backup snapshot.');
      }

      setStatusMessage({
        type: 'success',
        text: resJson.message || 'Database restored successfully!',
        stats: resJson.stats || inspectedFile.detectedCounts,
      });

      if (onDataRestored) await onDataRestored();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Restoration failed. Current records remain unchanged.',
      });
    } finally {
      setRestoring(false);
      setInspectedFile(null);
      setAcknowledgedRisk(false);
    }
  };

  return (
    <div className="space-y-3.5 max-w-7xl mx-auto w-full">
      {/* ========================================================= */}
      {/* 1. AESTHETIC GRADIENT BANNER & LIVE SYSTEM COUNTERS       */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800/90 rounded-2xl p-3 sm:p-4 text-white shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 rounded-xl text-slate-950 shadow-sm shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-black tracking-tight text-white font-display">
                  Disaster Recovery &amp; Vault Snapshots
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shrink-0 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Active 3.0 Engine
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate mt-0.5">
                Atomic snapshot orchestration across all 5 operational MongoDB collections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            <span className="px-2 py-0.5 rounded-lg text-[9.5px] font-mono font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
              5 Primary Collections
            </span>
          </div>
        </div>

        {/* Live Counts Breakdown Matrix */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {/* Admins */}
          <div className="bg-gradient-to-br from-purple-950/70 to-slate-900/90 border border-purple-800/50 rounded-xl p-1.5 sm:p-2.5 text-center">
            <span className="text-[8px] sm:text-[9.5px] uppercase font-bold tracking-wider text-purple-300 block mb-0.5 font-mono">
              Admins
            </span>
            <span className="text-sm sm:text-lg font-black text-purple-200 font-mono">{adminsCount}</span>
          </div>

          {/* Students */}
          <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900/90 border border-emerald-800/50 rounded-xl p-1.5 sm:p-2.5 text-center">
            <span className="text-[8px] sm:text-[9.5px] uppercase font-bold tracking-wider text-emerald-300 block mb-0.5 font-mono">
              Students
            </span>
            <span className="text-sm sm:text-lg font-black text-emerald-200 font-mono">{studentsCount}</span>
          </div>

          {/* Lessons */}
          <div className="bg-gradient-to-br from-sky-950/70 to-slate-900/90 border border-sky-800/50 rounded-xl p-1.5 sm:p-2.5 text-center">
            <span className="text-[8px] sm:text-[9.5px] uppercase font-bold tracking-wider text-sky-300 block mb-0.5 font-mono">
              Lessons
            </span>
            <span className="text-sm sm:text-lg font-black text-sky-200 font-mono">{activitiesCount}</span>
          </div>

          {/* Exams */}
          <div className="bg-gradient-to-br from-amber-950/70 to-slate-900/90 border border-amber-800/50 rounded-xl p-1.5 sm:p-2.5 text-center">
            <span className="text-[8px] sm:text-[9.5px] uppercase font-bold tracking-wider text-amber-300 block mb-0.5 font-mono">
              Exams
            </span>
            <span className="text-sm sm:text-lg font-black text-amber-200 font-mono">{examsCount}</span>
          </div>

          {/* Payments */}
          <div className="bg-gradient-to-br from-teal-950/70 to-slate-900/90 border border-teal-800/50 rounded-xl p-1.5 sm:p-2.5 text-center">
            <span className="text-[8px] sm:text-[9.5px] uppercase font-bold tracking-wider text-teal-300 block mb-0.5 font-mono">
              Payments
            </span>
            <span className="text-sm sm:text-lg font-black text-teal-200 font-mono">{paymentsCount}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CRITICAL DISASTER RECOVERY & SAFETY WARNING MATRIX     */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-rose-950/90 via-amber-950/80 to-rose-950/90 border-2 border-rose-600/70 rounded-2xl p-3 sm:p-4 text-white shadow-md space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-600 text-white rounded-lg shadow-xs shrink-0 animate-pulse">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-rose-200 font-mono flex items-center gap-1.5">
              <span>Critical Security &amp; Disaster Protocols</span>
              <span className="text-[9px] bg-rose-900 border border-rose-500 text-rose-100 px-1.5 py-0.2 rounded font-bold">
                Read Before Restoring
              </span>
            </h3>
          </div>
        </div>

        {/* 4 Warning Callout Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[10.5px]">
          {/* Warning 1: Overwrite */}
          <div className="p-2 rounded-xl bg-black/40 border border-rose-500/40 space-y-1">
            <div className="flex items-center gap-1 text-rose-300 font-bold">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Destructive Overwrite</span>
            </div>
            <p className="text-rose-100/90 leading-tight">
              Restoring completely replaces live database state. Unsaved student logs since snapshot creation will be permanently erased.
            </p>
          </div>

          {/* Warning 2: Vault Credentials */}
          <div className="p-2 rounded-xl bg-black/40 border border-amber-500/40 space-y-1">
            <div className="flex items-center gap-1 text-amber-300 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Credentials Inside Snapshot</span>
            </div>
            <p className="text-amber-100/90 leading-tight">
              Backups contain encrypted administrator keys and student PIN identifiers. Keep exported JSONs in private offline vaults only.
            </p>
          </div>

          {/* Warning 3: Temporal Rollback */}
          <div className="p-2 rounded-xl bg-black/40 border border-orange-500/40 space-y-1">
            <div className="flex items-center gap-1 text-orange-300 font-bold">
              <FileWarning className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Temporal Rollback Risk</span>
            </div>
            <p className="text-orange-100/90 leading-tight">
              Restoring old files reverts exam scores, attendance ledgers, and payment receipts back to that point in time.
            </p>
          </div>

          {/* Warning 4: Pre-Flight Rule */}
          <div className="p-2 rounded-xl bg-black/40 border border-emerald-500/40 space-y-1">
            <div className="flex items-center gap-1 text-emerald-300 font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Pre-Flight Backup Rule</span>
            </div>
            <p className="text-emerald-100/90 leading-tight">
              Always generate a fresh snapshot before performing a restore so you can immediately revert if needed.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. NOTIFICATIONS & ALERTS STATUS                          */}
      {/* ========================================================= */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex flex-col gap-1.5 border shadow-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-100 border-emerald-600'
              : statusMessage.type === 'warning'
              ? 'bg-amber-950/90 text-amber-100 border-amber-600'
              : 'bg-rose-950/90 text-rose-100 border-rose-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold">{statusMessage.text}</span>
          </div>

          {/* Stats breakdown badge display on success */}
          {statusMessage.stats && (
            <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px]">
              <span className="bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                Admins: {statusMessage.stats.admins ?? 1}
              </span>
              <span className="bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                Students: {statusMessage.stats.students}
              </span>
              <span className="bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                Lessons: {statusMessage.stats.activities}
              </span>
              <span className="bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                Exams: {statusMessage.stats.exams}
              </span>
              <span className="bg-emerald-900/80 border border-emerald-500/60 text-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                Payments: {statusMessage.stats.payments}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MAIN ACTION CARDS (EXPORT vs RESTORE)                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* 1. EXPORT FULL BACKUP (Emerald Glow Aesthetic) */}
        <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all flex flex-col justify-between space-y-3 min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-xl shadow-xs">
                <Download className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                Safe JSON Snapshot
              </span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 font-display">
                Export Full Database Snapshot
              </h3>
              <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                Generates an encrypted, normalized backup payload of all 5 database collections with preserved authentication and referential keys.
              </p>
            </div>

            <div className="p-2 bg-emerald-100/60 border border-emerald-300/80 rounded-xl space-y-1 text-[10px] text-emerald-950 font-medium">
              <div className="flex items-center gap-1 font-bold text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Included Snapshot Data:</span>
              </div>
              <ul className="space-y-0.5 pl-3 list-disc text-[9.5px]">
                <li><code className="font-mono font-bold">admins</code> records with hashed credentials</li>
                <li><code className="font-mono font-bold">students</code> profiles with HSC batches and status</li>
                <li><code className="font-mono font-bold">activities</code> daily lesson and homework scores</li>
                <li><code className="font-mono font-bold">exams</code> &amp; <code className="font-mono font-bold">payments</code> transaction history</li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={downloading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Snapshot Payload...</span>
              </>
            ) : (
              <>
                <ArrowDownCircle className="w-4 h-4" />
                <span>Download Snapshot (.json)</span>
              </>
            )}
          </button>
        </div>

        {/* 2. RESTORE FULL BACKUP (Rose/Amber Caution Aesthetic) */}
        <div className="bg-gradient-to-br from-white via-rose-50/20 to-amber-50/30 border-2 border-rose-300 hover:border-rose-500 rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all flex flex-col justify-between space-y-3 min-w-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-gradient-to-tr from-rose-500 to-amber-600 text-white rounded-xl shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-black text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-rose-600" /> Caution: Overwrite
              </span>
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 font-display">
                Restore from Backup Snapshot
              </h3>
              <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                Upload any previous backup snapshot. Engine parses format, auto-converts legacy schemas, validates records, and requests explicit confirmation.
              </p>
            </div>

            <div className="p-2 bg-rose-100/60 border border-rose-300/80 rounded-xl space-y-1 text-[10px] text-rose-950 font-medium">
              <div className="flex items-center gap-1 font-bold text-rose-900">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />
                <span>Pre-Restore Safety Checklist:</span>
              </div>
              <ul className="space-y-0.5 pl-3 list-disc text-[9.5px]">
                <li>File is inspected and validated before write operations</li>
                <li>Auto-converts legacy monolithic schemas seamlessly</li>
                <li>Deduplicates student IDs and ensures collection sync</li>
                <li>Requires 2-step confirmation acknowledgment</li>
              </ul>
            </div>
          </div>

          <label className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-98 text-white text-xs font-black rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50">
            {restoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validating &amp; Restoring Database...</span>
              </>
            ) : (
              <>
                <ArrowUpCircle className="w-4 h-4" />
                <span>Select Snapshot File to Restore...</span>
              </>
            )}
            <input
              type="file"
              accept=".json"
              disabled={restoring}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. PRE-FLIGHT INSPECTION & OVERWRITE CONFIRMATION MODAL    */}
      {/* ========================================================= */}
      {showConfirmModal && inspectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border-2 border-rose-500 space-y-3.5">
            {/* Modal Header */}
            <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
              <div className="p-2 bg-gradient-to-tr from-rose-600 to-amber-500 text-white rounded-xl shadow-xs shrink-0 animate-bounce">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 font-display">
                  Destructive Database Restoration
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Review the inspected file details before replacing current live records.
                </p>
              </div>
            </div>

            {/* File Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">File Name:</span>
                <span className="font-mono font-bold text-slate-900 truncate max-w-[200px]">
                  {inspectedFile.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">File Size:</span>
                <span className="font-mono font-bold text-slate-900">{inspectedFile.fileSizeKb} KB</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-semibold">Detected Schema:</span>
                <span className="font-mono font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded border border-teal-300">
                  {inspectedFile.version}
                </span>
              </div>
              {inspectedFile.exportedAt && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">Snapshot Timestamp:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(inspectedFile.exportedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Records preview */}
              <div className="border-t border-slate-200 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 font-mono">
                  Records To Be Restored:
                </span>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  <div className="bg-white p-1.5 rounded-lg border border-purple-200 shadow-2xs">
                    <span className="text-[9px] text-purple-700 font-bold block">Admins</span>
                    <span className="font-black text-purple-900 font-mono">{inspectedFile.detectedCounts.admins}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <span className="text-[9px] text-emerald-700 font-bold block">Students</span>
                    <span className="font-black text-emerald-900 font-mono">{inspectedFile.detectedCounts.students}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-sky-200 shadow-2xs">
                    <span className="text-[9px] text-sky-700 font-bold block">Lessons</span>
                    <span className="font-black text-sky-900 font-mono">{inspectedFile.detectedCounts.activities}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="text-[9px] text-amber-700 font-bold block">Exams</span>
                    <span className="font-black text-amber-900 font-mono">{inspectedFile.detectedCounts.exams}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-teal-200 shadow-2xs">
                    <span className="text-[9px] text-teal-700 font-bold block">Payments</span>
                    <span className="font-black text-teal-900 font-mono">{inspectedFile.detectedCounts.payments}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Red Warning Banner */}
            <div className="p-2.5 bg-rose-50 border-2 border-rose-300 rounded-xl flex items-start gap-2 text-[10.5px] text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="leading-tight">
                <strong>Permanent Database Overwrite:</strong> Restoring this snapshot will immediately replace all current records across all 5 collections. Any changes made after this backup was taken will be lost.
              </p>
            </div>

            {/* Mandatory Checkbox Acknowledgment */}
            <label className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-300 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedRisk}
                onChange={(e) => setAcknowledgedRisk(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-300 cursor-pointer"
              />
              <span className="text-[10.5px] font-bold text-amber-950 select-none">
                I understand that this will overwrite existing database records with the snapshot data.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setInspectedFile(null);
                  setAcknowledgedRisk(false);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRestore}
                disabled={!acknowledgedRisk}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-98 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Confirm &amp; Overwrite Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
