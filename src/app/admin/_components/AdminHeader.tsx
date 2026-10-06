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
  const activeClass = 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white border-emerald-400/80 shadow-[0_0_20px_rgba(16,185,129,0.45)] font-black ring-2 ring-emerald-400/50';
  const inactiveClass = 'bg-[#042017]/85 hover:bg-[#073829] text-emerald-100 hover:text-white border-emerald-800/70 hover:border-emerald-500/60 font-bold backdrop-blur-xs transition-all shadow-2xs hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]';

  return (
    <>
      <header className="bg-gradient-to-r from-[#021b13] via-[#052b1e] to-[#021810] backdrop-blur-2xl border-b border-emerald-800/80 text-white sticky top-0 z-[100] shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.55)] relative transition-colors duration-300" id="admin-dashboard-header">
        {/* Top Gradient Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
        
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link 
            href="/admin" 
            className="flex items-center gap-2 group shrink-0" 
            title="TutorHQ Admin Portal"
          >
            <div className="p-1.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/40 group-hover:scale-105 transition-all">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-display font-black text-white tracking-tight flex items-center">
                Tutor<span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]">HQ</span>
              </h1>
              <span className="text-[9px] bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded-md font-mono shadow-2xs">
                Admin
              </span>
              <span className="hidden md:inline-flex text-[9px] text-emerald-300/80 font-bold uppercase tracking-wider font-mono">
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
                  ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  : 'text-emerald-100 hover:text-white bg-emerald-900/70 hover:bg-emerald-800/80 border-emerald-700/70 hover:border-emerald-500/70'
              }`}
              title="Admin Profile & Password Settings"
            >
              <User className="w-3.5 h-3.5 text-emerald-300" />
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
                className="px-2 sm:px-2.5 py-1.5 sm:py-1 bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 hover:text-rose-100 border border-rose-800/70 hover:border-rose-700/80 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 active:scale-95"
                title="Sign Out Admin Account"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-rose-300" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            )}

            {/* 3-Line Hamburger Menu Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsNavOpen(!isNavOpen)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center ${
                isNavOpen 
                  ? 'bg-emerald-800/90 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                  : 'bg-emerald-900/70 border-emerald-700/70 text-emerald-200 hover:text-white hover:bg-emerald-800/80 hover:border-emerald-600/70'
              }`}
              title={isNavOpen ? 'Hide Navigation Matrix' : 'Show Navigation Matrix'}
              aria-label="Toggle Menu"
              id="admin-hamburger-menu-button"
            >
              {isNavOpen ? (
                <X className="w-4 h-4 text-emerald-200 transition-transform duration-200" />
              ) : (
                <Menu className="w-4 h-4 text-emerald-200 transition-transform duration-200" />
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
              className="border-t border-emerald-800/80 bg-gradient-to-b from-[#052b1e] via-[#042419] to-[#021810] backdrop-blur-2xl shadow-[inset_0_2px_12px_rgba(0,0,0,0.5)] overflow-hidden" 
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
                            isActive ? 'bg-white/25 text-white' : 'bg-emerald-900/90 text-emerald-300 group-hover:text-emerald-200 border border-emerald-700/60'
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
                            isActive ? 'text-emerald-100' : 'text-emerald-300/80 group-hover:text-emerald-200'
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
