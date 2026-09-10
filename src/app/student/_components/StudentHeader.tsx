'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap, LayoutDashboard, BookOpen, ClipboardList,
  Banknote, User, LogOut, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/student', label: 'Overview', icon: LayoutDashboard },
    { href: '/student/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/student/exams', label: 'Exams', icon: ClipboardList },
    { href: '/student/payments', label: 'Payments', icon: Banknote },
    { href: '/student/profile', label: 'Profile', icon: User },
  ];

  return (
    <header className="w-full bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-800/80 sticky top-0 z-50 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/student" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-xl shadow-xs border border-emerald-400/40 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-display font-black text-white tracking-tight">
                Tutor<span className="text-emerald-400">HQ</span>
              </span>
              <span className="text-[9px] bg-emerald-900/90 border border-emerald-700 text-emerald-200 font-extrabold px-1.5 py-0.2 rounded font-mono">
                Student
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 bg-emerald-900/60 p-1 rounded-xl border border-emerald-800/80">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info, Logout & 3-Line Menu Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user && (
            <div className="flex flex-col text-right max-w-[120px] sm:max-w-[160px]">
              <span className="text-xs font-bold text-white leading-tight truncate">
                {user.name}
              </span>
              <span className="text-[9px] text-emerald-300 font-mono font-bold">
                SID: {user.sid}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={logout}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white rounded-xl text-xs font-bold border border-rose-800/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* 3-Line Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-emerald-200 hover:text-white bg-emerald-900/80 hover:bg-emerald-800 rounded-xl border border-emerald-700/80 transition-all cursor-pointer shadow-2xs shrink-0"
            aria-label="Toggle Navigation Menu"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-emerald-300" />
            ) : (
              <Menu className="w-4 h-4 text-emerald-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-emerald-800/80 bg-emerald-950 px-3 py-2.5 space-y-2"
          >
            {user && (
              <div className="p-2 bg-emerald-900/50 rounded-xl border border-emerald-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{user.name}</span>
                  <span className="text-[10px] text-emerald-300 font-mono font-bold">Student ID: {user.sid}</span>
                </div>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md font-bold">
                  Enrolled
                </span>
              </div>
            )}
            <nav className="grid grid-cols-2 gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/50 shadow-xs'
                        : 'bg-emerald-900/60 text-emerald-200 border-emerald-800/60 hover:bg-emerald-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
