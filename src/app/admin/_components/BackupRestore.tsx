'use client';

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Database,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileJson,
  FileCheck2,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Users,
  BookOpen,
  ClipboardList,
  Banknote,
  ShieldCheck,
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

  const handleExportBackup = async () => {
    setDownloading(true);
    setStatusMessage(null);

    if (onBackup) {
      try {
        await onBackup();
        setStatusMessage({
          type: 'success',
          text: 'Backup snapshot downloaded successfully! Store this file safely.',
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
        text: `Full snapshot exported successfully (${fileName}).`,
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
    if (!inspectedFile) return;

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
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Current System Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl text-slate-950 shadow-md">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Full Database Backup & Disaster Recovery
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Normalized MongoDB Architecture: <code className="text-emerald-400 font-mono">admins</code>,{' '}
                <code className="text-emerald-400 font-mono">students</code>,{' '}
                <code className="text-emerald-400 font-mono">activities</code>,{' '}
                <code className="text-emerald-400 font-mono">exams</code>,{' '}
                <code className="text-emerald-400 font-mono">payments</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Schema Active
            </span>
          </div>
        </div>

        {/* Live Counts Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 pt-1">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Admins</span>
            <span className="text-xl font-black text-emerald-400">{adminsCount}</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Students</span>
            <span className="text-xl font-black text-teal-400">{studentsCount}</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Lessons</span>
            <span className="text-xl font-black text-sky-400">{activitiesCount}</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Exams</span>
            <span className="text-xl font-black text-amber-400">{examsCount}</span>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Payments</span>
            <span className="text-xl font-black text-indigo-400">{paymentsCount}</span>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex flex-col gap-2 border shadow-xs transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-bold">{statusMessage.text}</span>
          </div>

          {/* Stats breakdown badge display on success */}
          {statusMessage.stats && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="bg-white/80 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                Admins: {statusMessage.stats.admins ?? 1}
              </span>
              <span className="bg-white/80 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                Students: {statusMessage.stats.students}
              </span>
              <span className="bg-white/80 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                Lessons: {statusMessage.stats.activities}
              </span>
              <span className="bg-white/80 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                Exams: {statusMessage.stats.exams}
              </span>
              <span className="bg-white/80 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                Payments: {statusMessage.stats.payments}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. EXPORT FULL BACKUP */}
        <div className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-3xl p-5 sm:p-6 shadow-sm transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                <Download className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                JSON Snapshot
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">Export Full Backup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Creates a complete snapshot of all collections with intact authentication credentials, normalized student
              profiles, curriculum logs, test records, and fee history.
            </p>

            <ul className="text-xs text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Includes all <code className="font-mono text-slate-700">admins</code> & passwords
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Includes all student profiles & login IDs
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Preserves all ObjectId referential links
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={downloading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {downloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting Database Snapshot...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Backup Snapshot (.json)</span>
              </>
            )}
          </button>
        </div>

        {/* 2. RESTORE FULL BACKUP */}
        <div className="bg-white border border-slate-200 hover:border-teal-500/80 rounded-3xl p-5 sm:p-6 shadow-sm transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-teal-100 text-teal-700 rounded-2xl">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Safe Restore Engine
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900">Restore from Backup</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload any previous backup JSON file (normalized or legacy). The system automatically resolves string
              references, separates subjects & topics, and deduplicates records.
            </p>

            <ul className="text-xs text-slate-500 space-y-1 pt-1">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Pre-inspects file before modifying database
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Auto-converts legacy <code className="font-mono text-slate-700">users</code> format
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                Deduplicates IDs and prevents collision errors
              </li>
            </ul>
          </div>

          <label className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50">
            {restoring ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Restoring Database...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Select Backup File to Restore...</span>
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

      {/* Confirmation & Inspection Modal */}
      {showConfirmModal && inspectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Confirm Database Restoration</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review the inspected file before overwriting current data.
                </p>
              </div>
            </div>

            {/* File Details Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">File Name:</span>
                <span className="font-mono font-bold text-slate-900 truncate max-w-[220px]">
                  {inspectedFile.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">File Size:</span>
                <span className="font-mono font-bold text-slate-900">{inspectedFile.fileSizeKb} KB</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Detected Format:</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {inspectedFile.version}
                </span>
              </div>
              {inspectedFile.exportedAt && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Original Export:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(inspectedFile.exportedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Records preview */}
              <div className="border-t border-slate-200 pt-3">
                <span className="text-[11px] font-bold text-slate-600 block mb-2">Detected Records to Restore:</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Admins</span>
                    <span className="font-black text-slate-900">{inspectedFile.detectedCounts.admins}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Students</span>
                    <span className="font-black text-slate-900">{inspectedFile.detectedCounts.students}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Lessons</span>
                    <span className="font-black text-slate-900">{inspectedFile.detectedCounts.activities}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Exams</span>
                    <span className="font-black text-slate-900">{inspectedFile.detectedCounts.exams}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 block">Payments</span>
                    <span className="font-black text-slate-900">{inspectedFile.detectedCounts.payments}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Restoring will replace all current data across all 5 collections with the
                records from this snapshot.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setInspectedFile(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeRestore}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Database className="w-4 h-4" />
                <span>Confirm & Restore Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
