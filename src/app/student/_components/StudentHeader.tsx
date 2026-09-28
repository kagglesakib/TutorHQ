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
import DayNightToggle from '@/app/_components/DayNightToggle';

export default function StudentHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/student', label: 'Overview', icon: LayoutDashboard },
    { href: '/student/lessons', label: 'Lessons', icon: BookOpen },
    { href: '/student/exams', label: 'Exams', icon: ClipboardList },
    { href: '/student/payments', label: 'Payments', icon: Banknote },
    { href: '/student/profile', label: 'Profile', icon: User, isFullWidth: true },
  ];

  // Uniform base styling for all nav items, with a single distinctive highlight for the selected one
  const activeClass = 'bg-emerald-700 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-400 shadow-md font-black ring-2 ring-emerald-500/30 dark:ring-emerald-400/40';
  const inactiveClass = 'bg-emerald-200/50 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/60 hover:bg-emerald-200/90 dark:hover:bg-emerald-800/80 hover:text-emerald-950 dark:hover:text-white font-bold';

  return (
    <header className="w-full bg-emerald-100/95 dark:bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-300/90 dark:border-emerald-800/80 sticky top-0 z-50 text-emerald-950 dark:text-emerald-100 shadow-sm dark:shadow-[0_4px_25px_rgba(6,78,59,0.35)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/student" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-xs border border-emerald-400/40 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-base font-display font-black text-emerald-950 dark:text-white tracking-tight">
                Tutor<span className="text-emerald-700 dark:text-emerald-400">HQ</span>
              </span>
              <span className="text-[9px] bg-emerald-200/90 dark:bg-emerald-900/90 border border-emerald-400/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-extrabold px-1.5 py-0.2 rounded font-mono shadow-2xs">
                Student
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (All same color, selected one distinct) */}
          <nav className="hidden lg:flex items-center gap-1 ml-2 xl:ml-4 bg-emerald-200/60 dark:bg-emerald-900/50 p-1 rounded-xl border border-emerald-300/80 dark:border-emerald-800/80">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 xl:px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls: Day/Night Toggle, Logout & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Animated Sky Day/Night Pill Toggle Switch */}
          <DayNightToggle size="sm" />

          {/* Optional SID badge visible ONLY on desktop (hidden on mobile) */}
          {user?.sid && (
            <div 
              className="hidden md:flex items-center bg-emerald-200/80 dark:bg-emerald-900/90 border border-emerald-400/80 dark:border-emerald-700/80 px-2.5 py-1 rounded-xl shrink-0 shadow-2xs"
              title={`Logged in as ${user.name || 'Student'} (SID: ${user.sid})`}
            >
              <span className="text-xs text-emerald-950 dark:text-emerald-300 font-mono font-black tracking-tight whitespace-nowrap">
                SID: {user.sid}
              </span>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300/80 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-200 dark:border-rose-800/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {/* 3-Line Mobile/Tablet Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-emerald-900 bg-emerald-200/80 hover:bg-emerald-300/80 border border-emerald-400/80 dark:text-emerald-300 dark:hover:text-white dark:bg-emerald-900/80 dark:hover:bg-emerald-800 dark:border-emerald-700 rounded-xl transition-all cursor-pointer shadow-2xs shrink-0"
            aria-label="Toggle Navigation Menu"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-emerald-950 dark:text-emerald-300" />
            ) : (
              <Menu className="w-4 h-4 text-emerald-950 dark:text-emerald-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/98 dark:bg-emerald-950/98 backdrop-blur-xl px-3 py-3 space-y-2.5 shadow-md"
          >
            {/* Display student SID and Name inside mobile drawer */}
            {user && (
              <div className="pb-2 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between border-b border-emerald-300/70 dark:border-emerald-800/70">
                <span className="font-semibold truncate">Student: <strong className="text-emerald-950 dark:text-white">{user.name || 'User'}</strong></span>
                {user.sid && (
                  <span className="font-mono text-emerald-950 dark:text-emerald-300 font-bold bg-emerald-200/90 dark:bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-400/80 dark:border-emerald-700 shrink-0">
                    SID: {user.sid}
                  </span>
                )}
              </div>
            )}

            {/* Nav links (All same color, selected one distinct) */}
            <nav className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border shadow-2xs ${
                      item.isFullWidth ? 'col-span-2 sm:col-span-1 py-2.5' : ''
                    } ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
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
