'use client';

import React, { useState } from 'react';
import { Student } from '@/types';
import { Search, Plus, BookOpen, GraduationCap, UserPlus, Phone, Sparkles, Mail, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { formatBatch } from '@/utils/formatBatch';

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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ACTIVE');

  const uniqueBatches = Array.from(new Set(students.map(s => s.hscBatch).filter(Boolean))).sort();
  const revokedCount = students.filter(s => s.isApproved === 'no' || s.status === 'revoked').length;
  const activeCount = students.length - revokedCount;

  // Filter students based on search term, batch & status
  const filteredStudents = students.filter(student => {
    const isRevoked = student.isApproved === 'no' || student.status === 'revoked';
    if (statusFilter === 'ACTIVE' && isRevoked) return false;
    if (statusFilter === 'REVOKED' && !isRevoked) return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(term) ||
      student.sid.toLowerCase().includes(term) ||
      (student.college && student.college.toLowerCase().includes(term)) ||
      (student.subject && student.subject.toLowerCase().includes(term)) ||
      (student.hscBatch && student.hscBatch.toLowerCase().includes(term)) ||
      (student.mobile && student.mobile.includes(term)) ||
      (student.email && student.email.toLowerCase().includes(term));

    const matchesBatch = batchFilter === 'ALL' || student.hscBatch === batchFilter;
    return matchesSearch && matchesBatch;
  });

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
              {filteredStudents.length}/{students.length}
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

        {/* Status Filter Chips (Active / All / Revoked) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-700 text-white font-black shadow-xs'
                : 'bg-emerald-100/90 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-700 text-white font-black shadow-xs'
                : 'bg-slate-200/90 text-slate-700 hover:bg-slate-300 border border-slate-300'
            }`}
          >
            All ({students.length})
          </button>
          {revokedCount > 0 && (
            <button
              onClick={() => setStatusFilter('REVOKED')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'REVOKED'
                  ? 'bg-rose-700 text-white font-black shadow-xs'
                  : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
              }`}
            >
              Revoked ({revokedCount})
            </button>
          )}
        </div>

        {/* Batch Filter Chips */}
        {uniqueBatches.length > 0 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 border-t border-slate-200/60">
            <button
              onClick={() => setBatchFilter('ALL')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                batchFilter === 'ALL'
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'bg-slate-200/90 text-slate-700 hover:bg-slate-300 border border-slate-300'
              }`}
            >
              All Batches
            </button>
            {uniqueBatches.map(batch => (
              <button
                key={batch}
                onClick={() => setBatchFilter(batch)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  batchFilter === batch
                    ? 'bg-indigo-600 text-white font-black shadow-xs'
                    : 'bg-indigo-100/90 text-indigo-800 border border-indigo-300/80 hover:bg-indigo-200'
                }`}
              >
                {formatBatch(batch, 'HSC')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Cards List */}
      <div className="flex-grow overflow-y-auto p-2 space-y-1.5">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, index) => {
            const isSelected = student.sid === selectedStudentId;
            const uniqueKey = student.sid ? `${student.sid}-${index}` : `student-${index}`;
            const isStudentRevoked = student.isApproved === 'no' || student.status === 'revoked';
            const isStudentPending = student.isApproved === 'pending';

            return (
              <div
                key={uniqueKey}
                onClick={() => onSelectStudent(student.sid)}
                className={`p-2 rounded-xl cursor-pointer text-left transition-all border relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-100/95 via-sky-100/90 to-indigo-100/90 border-indigo-400 shadow-xs text-indigo-950 ring-1 ring-indigo-400'
                    : isStudentRevoked
                    ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70 hover:border-rose-300 text-slate-800 shadow-2xs'
                    : 'bg-slate-50/90 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 shadow-2xs'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r" />
                )}

                <div className="space-y-1 pl-1">
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] font-black text-indigo-800 bg-indigo-100 border border-indigo-300 px-1.5 py-0.2 rounded font-mono shrink-0">
                        {student.sid}
                      </span>
                      <h4 className="font-sans font-bold text-slate-900 text-xs leading-tight truncate">
                        {student.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isStudentRevoked && (
                        <span className="text-[8.5px] font-black text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded font-mono">
                          Revoked
                        </span>
                      )}
                      {isStudentPending && (
                        <span className="text-[8.5px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-mono">
                          Pending
                        </span>
                      )}
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded font-mono">
                        {formatBatch(student.hscBatch, 'N/A')}
                      </span>
                    </div>
                  </div>

                  {/* College, Subject, Group Tags with Rich Elementwise Coloring */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {student.college && (
                      <span className="bg-sky-100 text-sky-800 border border-sky-300 px-1.5 py-0.2 rounded truncate max-w-[130px] font-medium">
                        🎓 {student.college}
                      </span>
                    )}
                    {student.subject && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.2 rounded font-medium">
                        📚 {student.subject}
                      </span>
                    )}
                    {student.group && (
                      <span className="bg-purple-100 text-purple-800 border border-purple-300 px-1.5 py-0.2 rounded font-medium">
                        👥 {student.group}
                      </span>
                    )}
                  </div>

                  {/* Phone & Email Row with Elementwise Backgrounds */}
                  {(student.mobile || student.email) && (
                    <div className="flex items-center justify-between gap-1 pt-0.5 text-[9px] border-t border-slate-200 font-mono">
                      {student.mobile ? (
                        <span className="text-teal-800 bg-teal-100 border border-teal-300 px-1 py-0.2 rounded">
                          📞 {student.mobile}
                        </span>
                      ) : <span />}
                      {student.email && (
                        <span className="text-violet-800 bg-violet-100 border border-violet-300 px-1 py-0.2 rounded truncate max-w-[120px]">
                          ✉️ {student.email}
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
