'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, LayoutDashboard, Users, BookOpen, ClipboardList, 
  Banknote, Database, RefreshCw, LogOut, ShieldCheck, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import SignupNotificationPanel from './SignupNotificationPanel';

export default function AdminHeader() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isNavOpen, setIsNavOpen] = useState<boolean>(true);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll for pending registration approvals count
  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await fetch('/api/auth/userlogdatas', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.users || [];
        const pending = list.filter((u: any) => u.isApproved !== 'yes').length;
        setPendingCount(pending);
      } catch {
        // Ignore transient errors
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const navItems = [
    { 
      id: 'dashboard',
      label: 'Portal', 
      desc: 'Overview',
      href: '/admin', 
      icon: LayoutDashboard,
      bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white border-emerald-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'students',
      label: 'Students', 
      desc: 'Directory',
      href: '/admin/students', 
      icon: Users,
      bgClass: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 text-white border-teal-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      id: 'tracking',
      label: 'Daily Log', 
      desc: 'Lessons',
      href: '/admin/tracking', 
      icon: BookOpen,
      bgClass: 'bg-gradient-to-br from-emerald-700 via-teal-700 to-emerald-900 text-white border-emerald-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'exams',
      label: 'Exams', 
      desc: 'Marks',
      href: '/admin/exams', 
      icon: ClipboardList,
      bgClass: 'bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white border-teal-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      id: 'payments',
      label: 'Payments', 
      desc: 'Ledger',
      href: '/admin/payments', 
      icon: Banknote,
      bgClass: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white border-emerald-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'approvals',
      label: 'Approvals', 
      desc: 'Requests',
      href: '/admin/approvals', 
      icon: ShieldCheck,
      count: pendingCount,
      bgClass: 'bg-gradient-to-br from-teal-600 via-emerald-700 to-teal-800 text-white border-teal-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-teal-800 text-teal-300 border border-teal-700/60'
    },
    { 
      id: 'backup',
      label: 'Backup', 
      desc: 'Restore',
      href: '/admin/backup', 
      icon: Database,
      bgClass: 'bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 text-white border-emerald-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-emerald-300 border border-emerald-700/60'
    },
    { 
      id: 'refresh',
      label: 'Refresh', 
      desc: 'Sync Data',
      isAction: true,
      icon: RefreshCw,
      bgClass: 'bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 text-white border-teal-400/50 shadow-xs animate-glow-emerald',
      inactiveClass: 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 hover:text-white border-emerald-700/60 shadow-2xs',
      iconBgActive: 'bg-white/20 text-white',
      iconBgInactive: 'bg-emerald-800 text-teal-300 border border-emerald-700/60'
    }
  ];

  const checkIsActive = (href?: string) => {
    if (!href) return false;
    if (href === '/admin') return pathname === '/admin' || pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="bg-emerald-950/95 backdrop-blur-xl border-b border-emerald-800/90 sticky top-0 z-[100] shrink-0 shadow-md relative" id="admin-dashboard-header">
      {/* Top Gradient Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />
      
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
            <h1 className="text-sm sm:text-base font-display font-black text-white tracking-tight flex items-center">
              Tutor<span className="text-emerald-400">HQ</span>
            </h1>
            <span className="text-[9px] bg-emerald-900/90 border border-emerald-700 text-emerald-200 font-extrabold px-1.5 py-0.2 rounded font-mono">
              Admin
            </span>
            <span className="hidden md:inline-flex text-[9px] text-teal-300/80 font-bold uppercase tracking-wider font-mono">
              Command Matrix
            </span>
          </div>
        </Link>

        {/* Right Header Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Refresh Page Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 text-emerald-200 hover:text-white bg-emerald-900/80 hover:bg-emerald-800/90 rounded-xl border border-emerald-700/80 transition-all disabled:opacity-50 cursor-pointer shadow-2xs shrink-0"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-300' : ''}`} />
          </motion.button>

          {/* Pending Signup Approvals Notification Bell */}
          {mounted && <SignupNotificationPanel />}

          {/* Sign Out Button (Smartly responsive: compact icon on mobile, labeled on desktop) */}
          {mounted && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="px-2 sm:px-2.5 py-1.5 sm:py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-200 hover:text-white border border-rose-800/80 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs shrink-0 active:scale-95"
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
            className={`p-1.5 text-emerald-100 hover:text-white rounded-xl border transition-all cursor-pointer shadow-2xs shrink-0 flex items-center justify-center ${
              isNavOpen 
                ? 'bg-emerald-800/90 border-emerald-500/80 text-emerald-200 shadow-emerald-950/50' 
                : 'bg-emerald-900/80 border-emerald-700/80 text-emerald-300 hover:bg-emerald-800'
            }`}
            title={isNavOpen ? 'Hide Navigation Matrix' : 'Show Navigation Matrix'}
            aria-label="Toggle Menu"
            id="admin-hamburger-menu-button"
          >
            {isNavOpen ? (
              <X className="w-4 h-4 text-emerald-300 transition-transform duration-200" />
            ) : (
              <Menu className="w-4 h-4 text-emerald-300 transition-transform duration-200" />
            )}
          </motion.button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* UNIFIED MATRIX NAVIGATION BAR (Toggled with 3-Line Button) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-emerald-800/80 bg-emerald-950/95 shadow-inner overflow-hidden" 
            id="admin-matrix-nav"
          >
            <div className="max-w-7xl mx-auto px-1.5 sm:px-3 py-1">
              <nav className="grid grid-cols-4 lg:grid-cols-8 gap-1 sm:gap-1.5 w-full items-center">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = !item.isAction && checkIsActive(item.href);
                  const isSpinning = item.isAction && isRefreshing;

                  const content = (
                    <>
                      {/* Matrix Icon & Notification Badge */}
                      <div className="relative flex items-center justify-center">
                        <div className={`p-1 rounded-md shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                          isActive ? item.iconBgActive : item.iconBgInactive
                        }`}>
                          <Icon className={`w-3 h-3 ${isSpinning ? 'animate-spin' : ''}`} />
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className="absolute -top-1 -right-2 text-[7.5px] font-mono font-bold px-1 py-0.2 rounded-full shadow-2xs leading-none bg-rose-500 text-white animate-pulse">
                            {item.count}
                          </span>
                        )}
                        {isActive && (!item.count || item.count === 0) && (
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        )}
                      </div>

                      {/* Title & Micro Descriptor */}
                      <div className="w-full text-center min-w-0 leading-tight">
                        <p className="text-[10px] font-black tracking-tight truncate leading-tight">
                          {item.label}
                        </p>
                        <p className={`text-[7.5px] font-medium leading-tight truncate mt-0.5 hidden min-[380px]:block ${
                          isActive ? 'text-white/90' : 'text-emerald-300/80'
                        }`}>
                          {item.desc}
                        </p>
                      </div>
                    </>
                  );

                  if (item.isAction) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={handleRefresh}
                        className={`min-h-[34px] sm:min-h-[38px] p-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border group relative active:scale-95 ${item.inactiveClass}`}
                        title="Synchronize and Refresh Data"
                      >
                        {content}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href!}
                      className={`min-h-[34px] sm:min-h-[38px] p-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 border group relative active:scale-95 ${
                        isActive ? item.bgClass : item.inactiveClass
                      }`}
                      title={`${item.label} - ${item.desc}`}
                    >
                      {content}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
