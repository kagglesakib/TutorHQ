'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList, 
  Banknote, Database, User, UserCheck, LogOut, ShieldCheck, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import SignupNotificationPanel from './SignupNotificationPanel';
import DayNightToggle from '@/app/_components/DayNightToggle';

export default function AdminHeader() {
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll for pending registration approvals count
  useEffect(() => {
    const fetchPendingCount = () => {
      try {
        const stored = localStorage.getItem('tutorhq_pending_users');
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            setPendingCount(list.length);
            return;
          }
        }
        setPendingCount(0);
      } catch {
        setPendingCount(0);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 4000);
    const handleSync = () => fetchPendingCount();
    window.addEventListener('pending-registrations-updated', handleSync);
    return () => {
      clearInterval(interval);
      window.removeEventListener('pending-registrations-updated', handleSync);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Portal', desc: 'Overview', href: '/admin', icon: LayoutDashboard },
    { id: 'students', label: 'Students', desc: 'Directory', href: '/admin/students', icon: Users },
    { id: 'tracking', label: 'Daily Log', desc: 'Lessons', href: '/admin/tracking', icon: BookOpen },
    { id: 'exams', label: 'Exams', desc: 'Marks', href: '/admin/exams', icon: ClipboardList },
    { id: 'payments', label: 'Payments', desc: 'Ledger', href: '/admin/payments', icon: Banknote },
    { id: 'approvals', label: 'Approvals', desc: 'Requests', href: '/admin/approvals', icon: ShieldCheck, count: pendingCount },
    { id: 'backup', label: 'Backup', desc: 'Restore', href: '/admin/backup', icon: Database },
    { id: 'profile', label: 'Profile', desc: 'Admin & Pass', href: '/admin/profile', icon: UserCheck }
  ];

  const checkIsActive = (href?: string) => {
    if (!href || !pathname) return false;
    if (href === '/admin') return pathname === '/admin' || pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Uniform base styling for all nav items, with a single distinctive highlight for the selected one
  const activeClass = 'bg-emerald-700 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-400 shadow-md font-black ring-2 ring-emerald-500/30 dark:ring-emerald-400/40';
  const inactiveClass = 'bg-emerald-200/50 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 border-emerald-300/80 dark:border-emerald-700/60 hover:bg-emerald-200/90 dark:hover:bg-emerald-800/80 hover:text-emerald-950 dark:hover:text-white font-bold';

  return (
    <>
      <header className="bg-emerald-100/95 dark:bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-300/90 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100 sticky top-0 z-[100] shrink-0 shadow-sm dark:shadow-[0_4px_25px_rgba(6,78,59,0.35)] relative transition-colors duration-200" id="admin-dashboard-header">
        {/* Top Gradient Accent Line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link 
            href="/admin" 
            className="flex items-center gap-2 group shrink-0" 
            title="TutorHQ Admin Portal"
          >
            <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-xs border border-emerald-400/40 group-hover:scale-105 transition-all">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-display font-black text-emerald-950 dark:text-white tracking-tight flex items-center">
                Tutor<span className="text-emerald-700 dark:text-emerald-400">HQ</span>
              </h1>
              <span className="text-[9px] bg-emerald-200/90 dark:bg-emerald-900/90 border border-emerald-400/80 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-extrabold px-1.5 py-0.2 rounded font-mono shadow-2xs">
                Admin
              </span>
              <span className="hidden md:inline-flex text-[9px] text-emerald-800 dark:text-teal-300/80 font-bold uppercase tracking-wider font-mono">
                Command Matrix
              </span>
            </div>
          </Link>

          {/* Right Header Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Admin Profile Page Link */}
            <Link
              href="/admin/profile"
              className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 flex items-center gap-1 ${
                pathname === '/admin/profile'
                  ? 'bg-emerald-700 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-400 font-black'
                  : 'text-emerald-950 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white bg-emerald-200/80 dark:bg-emerald-900/80 hover:bg-emerald-300/80 dark:hover:bg-emerald-800/90 border-emerald-300/80 dark:border-emerald-700/80'
              }`}
              title="Admin Profile & Password Settings"
            >
              <User className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-300" />
              <span className="hidden min-[480px]:inline text-[10px] font-bold">Profile</span>
            </Link>

            {/* Light / Dark Mode Animated Day/Night Toggle */}
            {mounted && (
              <DayNightToggle size="sm" />
            )}

            {/* Pending Signup Approvals Notification Bell */}
            {mounted && <SignupNotificationPanel />}

            {/* Sign Out Button */}
            {mounted && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => logout()}
                className="px-2 sm:px-2.5 py-1.5 sm:py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300/80 dark:bg-rose-950/80 dark:hover:bg-rose-900 dark:text-rose-200 dark:border-rose-800/80 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 active:scale-95"
                title="Sign Out Admin Account"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-rose-800 dark:text-rose-300" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            )}

            {/* 3-Line Hamburger Menu Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsNavOpen(!isNavOpen)}
              className={`p-1.5 text-emerald-900 hover:text-emerald-950 rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center ${
                isNavOpen 
                  ? 'bg-emerald-300/90 border-emerald-400 text-emerald-950 dark:bg-emerald-800/90 dark:border-emerald-500/80 dark:text-emerald-200' 
                  : 'bg-emerald-200/80 border-emerald-300/80 dark:bg-emerald-900/80 dark:border-emerald-700/80 dark:text-emerald-300 dark:hover:bg-emerald-800'
              }`}
              title={isNavOpen ? 'Hide Navigation Matrix' : 'Show Navigation Matrix'}
              aria-label="Toggle Menu"
              id="admin-hamburger-menu-button"
            >
              {isNavOpen ? (
                <X className="w-4 h-4 text-emerald-950 dark:text-emerald-300 transition-transform duration-200" />
              ) : (
                <Menu className="w-4 h-4 text-emerald-950 dark:text-emerald-300 transition-transform duration-200" />
              )}
            </motion.button>
          </div>
        </div>

        {/* UNIFIED MATRIX NAVIGATION BAR */}
        <AnimatePresence>
          {isNavOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="border-t border-emerald-300/80 dark:border-emerald-800/80 bg-emerald-50/98 dark:bg-emerald-950/98 shadow-inner overflow-hidden" 
              id="admin-matrix-nav"
            >
              <div className="max-w-7xl mx-auto px-1.5 sm:px-3 py-2">
                <nav className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 w-full items-center">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = checkIsActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`min-h-[36px] sm:min-h-[40px] p-1.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border group relative active:scale-95 shadow-2xs ${
                          isActive ? activeClass : inactiveClass
                        }`}
                        title={`${item.label} - ${item.desc}`}
                      >
                        {/* Matrix Icon & Notification Badge */}
                        <div className="relative flex items-center justify-center">
                          <div className={`p-1 rounded-md shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                            isActive ? 'bg-white/25 text-white dark:text-slate-950' : 'bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-300'
                          }`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          {item.count !== undefined && item.count > 0 && (
                            <span className="absolute -top-1 -right-2 text-[7.5px] font-mono font-bold px-1 py-0.2 rounded-full shadow-2xs leading-none bg-rose-500 text-white animate-pulse">
                              {item.count}
                            </span>
                          )}
                        </div>

                        {/* Title & Micro Descriptor */}
                        <div className="w-full text-center min-w-0 leading-tight">
                          <p className="text-[10px] font-black tracking-tight truncate leading-tight">
                            {item.label}
                          </p>
                          <p className={`text-[7.5px] font-medium leading-tight truncate mt-0.5 hidden min-[380px]:block ${
                            isActive ? 'text-white/90 dark:text-slate-900/90' : 'text-emerald-800/80 dark:text-emerald-300/80'
                          }`}>
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
