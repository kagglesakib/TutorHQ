'use client';

import React, { useState } from 'react';
import { Download, Upload, RefreshCw, Database, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface BackupRestoreProps {
  onDataRestored?: () => Promise<void> | void;
  onBackup?: () => Promise<void> | void;
  onRestore?: (jsonData: any) => Promise<{ success: boolean; message: any }>;
  loadingData?: boolean;
  studentsCount?: number;
  activitiesCount?: number;
  examsCount?: number;
  paymentsCount?: number;
}

export default function BackupRestore({
  onDataRestored,
  onBackup,
  onRestore,
  loadingData,
  studentsCount,
  activitiesCount,
  examsCount,
  paymentsCount,
}: BackupRestoreProps) {
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportBackup = async () => {
    if (onBackup) {
      setDownloading(true);
      try {
        await onBackup();
        setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err?.message || 'Error downloading backup' });
      } finally {
        setDownloading(false);
      }
      return;
    }

    setDownloading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Failed to fetch backup data');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tutorhq-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Error downloading backup' });
    } finally {
      setDownloading(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      if (onRestore) {
        const result = await onRestore(jsonData);
        if (result.success) {
          setStatusMessage({ type: 'success', text: result.message || 'Database restored successfully!' });
        } else {
          setStatusMessage({ type: 'error', text: result.message || 'Restoration failed' });
        }
        return;
      }

      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to restore backup');
      }

      setStatusMessage({ type: 'success', text: 'Database restored successfully!' });
      if (onDataRestored) await onDataRestored();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Invalid backup JSON file' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleResetToSample = async () => {
    if (!window.confirm('Are you sure you want to reset all data to initial sample records? Current data will be replaced.')) {
      return;
    }

    setResetting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      setStatusMessage({ type: 'success', text: 'Database reset to initial sample data!' });
      if (onDataRestored) await onDataRestored();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to reset database' });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-slate-100/90 rounded-3xl border border-slate-300 p-4 sm:p-6 space-y-5 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-300 pb-4">
        <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xs">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-black text-slate-900 text-lg">System Backup & Data Operations</h3>
          <p className="text-xs text-slate-500 font-medium">Export snapshot JSON, restore database, or load starter data</p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-rose-100 text-rose-900 border-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Export JSON */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs hover:border-emerald-400 transition-all">
          <div className="space-y-1.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl w-fit">
              <Download className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Export Full Backup</h4>
            <p className="text-xs text-slate-500">
              Download all students, activity tracking, exams, and payments in structured JSON format.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={downloading}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download JSON'}</span>
          </button>
        </div>

        {/* 2. Import JSON */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs hover:border-teal-400 transition-all">
          <div className="space-y-1.5">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl w-fit">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Restore from Backup</h4>
            <p className="text-xs text-slate-500">
              Upload a previously exported JSON backup file to overwrite or merge existing database records.
            </p>
          </div>
          <label className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98">
            <Upload className="w-3.5 h-3.5" />
            <span>{uploading ? 'Restoring...' : 'Upload JSON'}</span>
            <input
              type="file"
              accept=".json"
              disabled={uploading}
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {/* 3. Reset to Sample */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 flex flex-col justify-between shadow-2xs hover:border-amber-400 transition-all">
          <div className="space-y-1.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl w-fit">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Reset to Demo Data</h4>
            <p className="text-xs text-slate-500">
              Reset database with initial sample students, daily lesson tracking logs, and exam scores.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetToSample}
            disabled={resetting}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Load Sample Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
