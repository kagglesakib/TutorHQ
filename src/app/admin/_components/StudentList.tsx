'use client';

import React, { useState, useMemo } from 'react';
import { Student } from '@/types';
import {
  Search,
  Plus,
  BookOpen,
  GraduationCap,
  UserPlus,
  Phone,
  Sparkles,
  Mail,
  Filter,
  Building2,
  Hash,
  XCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatBatch } from '@/utils/formatBatch';
import {
  isAdminStudent,
  isPendingStudent,
  isRevokedOrRejectedStudent,
  isActiveEnrolledStudent,
} from '@/utils/studentFilters';

interface StudentListProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (sid: string) => void;
  onAddStudentClick: () => void;
}

export default function StudentList({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddStudentClick,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'PENDING' | 'REVOKED' | 'ALL'>('ACTIVE');

  // Strictly filter out any admin accounts from student directory
  const actualStudents = useMemo(() => students.filter(s => !isAdminStudent(s)), [students]);

  const activeStudents = useMemo(() => actualStudents.filter(isActiveEnrolledStudent), [actualStudents]);
  const pendingStudents = useMemo(() => actualStudents.filter(isPendingStudent), [actualStudents]);
  const revokedStudents = useMemo(() => actualStudents.filter(isRevokedOrRejectedStudent), [actualStudents]);

  // Helper to parse numeric year for batch sorting (newest first)
  const parseBatchYear = (batch: string): number => {
    const digits = batch.replace(/\D/g, '');
    if (!digits) return 0;
    const num = parseInt(digits, 10);
    return num < 100 ? 2000 + num : num;
  };

  // Batches derived according to selected status filter
  const targetBatchPool = useMemo(() => {
    if (statusFilter === 'ACTIVE') return activeStudents;
    if (statusFilter === 'PENDING') return pendingStudents;
    if (statusFilter === 'REVOKED') return revokedStudents;
    return actualStudents;
  }, [statusFilter, activeStudents, pendingStudents, revokedStudents, actualStudents]);

  const uniqueBatches = useMemo(() => {
    return Array.from(
      new Set(targetBatchPool.map(s => s.hscBatch?.trim()).filter(Boolean) as string[])
    ).sort((a, b) => {
      const yearA = parseBatchYear(a);
      const yearB = parseBatchYear(b);
      if (yearA !== yearB) return yearB - yearA;
      return a.localeCompare(b);
    });
  }, [targetBatchPool]);

  const batchCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    targetBatchPool.forEach((s) => {
      const b = s.hscBatch?.trim();
      if (b) {
        counts[b] = (counts[b] || 0) + 1;
      }
    });
    return counts;
  }, [targetBatchPool]);

  // Filter students based on search term, batch & status
  const filteredStudents = useMemo(() => {
    return actualStudents.filter(student => {
      if (statusFilter === 'ACTIVE' && !isActiveEnrolledStudent(student)) return false;
      if (statusFilter === 'PENDING' && !isPendingStudent(student)) return false;
      if (statusFilter === 'REVOKED' && !isRevokedOrRejectedStudent(student)) return false;

      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        student.name.toLowerCase().includes(term) ||
        student.sid.toLowerCase().includes(term) ||
        (student.college && student.college.toLowerCase().includes(term)) ||
        (student.subject && student.subject.toLowerCase().includes(term)) ||
        (student.hscBatch && student.hscBatch.toLowerCase().includes(term)) ||
        (student.mobile && student.mobile.includes(term)) ||
        (student.email && student.email.toLowerCase().includes(term));

      const matchesBatch =
        batchFilter === 'ALL' ||
        student.hscBatch === batchFilter ||
        formatBatch(student.hscBatch) === formatBatch(batchFilter);

      return matchesSearch && matchesBatch;
    });
  }, [actualStudents, statusFilter, searchTerm, batchFilter]);

  return (
    <div className="bg-slate-200/70 rounded-2xl border border-slate-300/80 shadow-sm h-full flex flex-col overflow-hidden" id="student-list-container">
      {/* Search & Batch Filters Header */}
      <div className="p-2.5 sm:p-3 border-b border-slate-300 space-y-2 shrink-0 bg-slate-100/90 text-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-black text-slate-800 text-xs sm:text-sm tracking-tight flex items-center gap-1">
              Student Directory
            </h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-300">
              {filteredStudents.length}/{actualStudents.length}
            </span>
          </div>

          <button
            onClick={onAddStudentClick}
            className="px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-[10px] font-black flex items-center gap-1 shadow-xs border border-emerald-500/40 cursor-pointer transition-all active:scale-95"
            title="Add New Student"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow bg-slate-50/90 rounded-lg border border-slate-300 p-0.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-400 transition-all flex items-center">
          <div className="p-1 bg-emerald-600 text-white rounded-md shrink-0 ml-0.5 mr-1.5">
            <Search className="w-2.5 h-2.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, SID, batch, college, phone..."
            className="w-full py-0.5 pr-6 bg-transparent text-[11px] font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-1 px-1.5 py-0.2 bg-rose-200 text-rose-800 text-[9px] font-bold rounded cursor-pointer hover:bg-rose-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter Chips (Active / Pending / Revoked / All) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white font-black shadow-xs'
                : 'bg-emerald-100/90 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            Active ({activeStudents.length})
          </button>
          {pendingStudents.length > 0 && (
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white font-black shadow-xs'
                  : 'bg-amber-100/90 text-amber-800 border border-amber-300 hover:bg-amber-200'
              }`}
            >
              Pending ({pendingStudents.length})
            </button>
          )}
          {revokedStudents.length > 0 && (
            <button
              onClick={() => setStatusFilter('REVOKED')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'REVOKED'
                  ? 'bg-rose-700 text-white font-black shadow-xs'
                  : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
              }`}
            >
              Revoked ({revokedStudents.length})
            </button>
          )}
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-700 text-white font-black shadow-xs'
                : 'bg-slate-200/90 text-slate-700 hover:bg-slate-300 border border-slate-300'
            }`}
          >
            All ({actualStudents.length})
          </button>
        </div>

        {/* Batch Filter Controls */}
        {uniqueBatches.length > 0 && (
          <div className="pt-1 border-t border-slate-200/80">
            {uniqueBatches.length > 3 ? (
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                  <GraduationCap className="w-3 h-3 text-indigo-600" />
                  Batch:
                </span>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 outline-hidden focus:border-indigo-500 cursor-pointer shadow-2xs"
                >
                  <option value="ALL">All Batches ({targetBatchPool.length})</option>
                  {uniqueBatches.map((batch) => (
                    <option key={batch} value={batch}>
                      {formatBatch(batch, 'HSC')} ({batchCounts[batch] || 0} students)
                    </option>
                  ))}
                </select>
                {batchFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setBatchFilter('ALL')}
                    className="px-1.5 py-1 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-colors cursor-pointer shrink-0"
                    title="Reset to All"
                  >
                    Reset
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap w-full">
                <button
                  type="button"
                  onClick={() => setBatchFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    batchFilter === 'ALL'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'bg-slate-200/90 text-slate-700 hover:bg-slate-300 border border-slate-300'
                  }`}
                >
                  All ({actualStudents.length})
                </button>
                {uniqueBatches.map((batch) => (
                  <button
                    key={batch}
                    type="button"
                    onClick={() => setBatchFilter(batch)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      batchFilter === batch
                        ? 'bg-indigo-600 text-white font-black shadow-xs'
                        : 'bg-indigo-100/90 text-indigo-800 border border-indigo-300/80 hover:bg-indigo-200'
                    }`}
                  >
                    <span>{formatBatch(batch, 'HSC')}</span>
                    <span className="opacity-75 text-[8px] font-mono">({batchCounts[batch] || 0})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Cards List */}
      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => {
            const isSelected = student.sid === selectedStudentId;
            const uniqueKey = student.sid ? `${student.sid}-${index}` : `student-${index}`;
            const isStudentRevoked = isRevokedOrRejectedStudent(student);
            const isStudentPending = isPendingStudent(student);

            return (
              <div
                key={uniqueKey}
                onClick={() => onSelectStudent(student.sid)}
                className={`group relative p-2.5 sm:p-3 rounded-2xl cursor-pointer text-left transition-all duration-300 border-2 overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-50/95 via-sky-50/80 to-teal-50/90 border-indigo-500 shadow-[0_4px_22px_-2px_rgba(99,102,241,0.32)] ring-2 ring-indigo-400/50 scale-[1.01]'
                    : isStudentRevoked
                    ? 'bg-gradient-to-br from-rose-50/90 via-red-50/30 to-white border-rose-300 shadow-[0_2px_12px_-2px_rgba(244,63,94,0.15)] hover:shadow-[0_6px_22px_-2px_rgba(244,63,94,0.3)] hover:border-rose-500 hover:-translate-y-0.5'
                    : isStudentPending
                    ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-white border-amber-300 shadow-[0_2px_12px_-2px_rgba(245,158,11,0.15)] hover:shadow-[0_6px_22px_-2px_rgba(245,158,11,0.3)] hover:border-amber-500 hover:-translate-y-0.5'
                    : 'bg-gradient-to-br from-white via-slate-50/95 to-indigo-50/30 border-slate-300/90 hover:border-indigo-400 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-2px_rgba(99,102,241,0.22)] hover:-translate-y-0.5'
                }`}
              >
                {/* Ambient glowing corner aura */}
                <div
                  className={`absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none transition-opacity duration-300 ${
                    isSelected
                      ? 'bg-indigo-400 opacity-60'
                      : isStudentRevoked
                      ? 'bg-rose-400 opacity-25 group-hover:opacity-70'
                      : isStudentPending
                      ? 'bg-amber-400 opacity-25 group-hover:opacity-70'
                      : 'bg-indigo-400 opacity-20 group-hover:opacity-60'
                  }`}
                />

                {/* Selected Glowing Indicator Bar */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 via-sky-500 to-teal-500 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                )}

                <div className="space-y-2 relative z-10 pl-0.5">
                  {/* Top Row: Avatar + Name + SID + Batch */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Radiant Avatar with status pulse dot */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md transition-transform group-hover:scale-105 border ${
                            isSelected
                              ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-600 border-indigo-300/80 shadow-[0_4px_12px_rgba(99,102,241,0.4)]'
                              : isStudentRevoked
                              ? 'bg-gradient-to-br from-rose-500 via-red-500 to-rose-600 border-rose-300/80 shadow-[0_4px_12px_rgba(244,63,94,0.35)]'
                              : isStudentPending
                              ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-amber-300/80 shadow-[0_4px_12px_rgba(245,158,11,0.35)]'
                              : 'bg-gradient-to-br from-teal-500 via-emerald-500 to-indigo-600 border-teal-300/80 shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                          }`}
                        >
                          {(student.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white flex items-center justify-center ${
                            isStudentRevoked ? 'bg-rose-500' : isStudentPending ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-sans font-extrabold text-slate-900 group-hover:text-indigo-950 transition-colors text-xs sm:text-sm leading-tight truncate">
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9.5px] font-mono font-black text-white bg-gradient-to-r from-indigo-600 to-blue-600 px-1.5 py-0.2 rounded-md shadow-[0_2px_6px_rgba(79,70,229,0.25)] flex items-center gap-0.5">
                            <Hash className="w-2.5 h-2.5 text-indigo-200" />
                            {student.sid}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Batch & Status Badges */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[9.5px] font-mono font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 rounded-md shadow-[0_2px_8px_rgba(16,185,129,0.3)] flex items-center gap-1">
                        <GraduationCap className="w-2.5 h-2.5 text-emerald-100" />
                        {formatBatch(student.hscBatch, 'N/A')}
                      </span>
                      {isStudentRevoked && (
                        <span className="text-[8.5px] font-black text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded-md font-mono flex items-center gap-0.5">
                          <XCircle className="w-2.5 h-2.5 text-rose-600" />
                          Revoked
                        </span>
                      )}
                      {isStudentPending && (
                        <span className="text-[8.5px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md font-mono flex items-center gap-0.5 animate-pulse">
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* College, Subject, Group Tags with Rich Glowing Colors */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {student.college && (
                      <span className="bg-gradient-to-r from-sky-50 to-blue-50 text-sky-900 border border-sky-300/90 px-2 py-0.5 rounded-lg truncate max-w-[150px] font-bold flex items-center gap-1 shadow-[0_2px_6px_rgba(14,165,233,0.12)]">
                        <Building2 className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                        <span className="truncate">{student.college}</span>
                      </span>
                    )}
                    {student.subject && (
                      <span className="bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-300/90 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 shadow-[0_2px_6px_rgba(245,158,11,0.12)]">
                        <BookOpen className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                        <span>{student.subject}</span>
                      </span>
                    )}
                    {student.group && (
                      <span className="bg-gradient-to-r from-purple-50 to-violet-50 text-purple-900 border border-purple-300/90 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 shadow-[0_2px_6px_rgba(147,51,234,0.12)]">
                        <Users className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                        <span>{student.group}</span>
                      </span>
                    )}
                  </div>

                  {/* Phone & Email Row with Glowing Badges */}
                  {(student.mobile || student.email) && (
                    <div className="flex items-center justify-between gap-1.5 pt-1.5 mt-0.5 text-[9.5px] border-t border-slate-200/80 font-mono">
                      {student.mobile ? (
                        <span className="text-teal-900 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-300/90 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold shadow-[0_2px_6px_rgba(20,184,166,0.12)]">
                          <Phone className="w-2.5 h-2.5 text-teal-600" />
                          <span>{student.mobile}</span>
                        </span>
                      ) : <span />}
                      {student.email && (
                        <span className="text-violet-900 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-300/90 px-2 py-0.5 rounded-lg truncate max-w-[130px] flex items-center gap-1 font-bold shadow-[0_2px_6px_rgba(139,92,246,0.12)]" title={student.email}>
                          <Mail className="w-2.5 h-2.5 text-violet-600 shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 px-2 text-center text-slate-500 space-y-1">
            <p className="text-xs font-bold text-slate-600">No students found</p>
            <p className="text-[10px] text-slate-500">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
