'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, ClipboardList, Banknote, User } from 'lucide-react';
import { useStudent } from '@/context/StudentContext';

export default function StudentMobileDock() {
  const pathname = usePathname();
  const { counts } = useStudent();

  const navItems = [
    { href: '/student', label: 'Home', icon: LayoutDashboard },
    { href: '/student/lessons', label: 'Lessons', icon: BookOpen, badge: counts.lessons },
    { href: '/student/exams', label: 'Exams', icon: ClipboardList, badge: counts.exams },
    { href: '/student/payments', label: 'Payments', icon: Banknote, badge: counts.payments },
    { href: '/student/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-100/95 dark:bg-emerald-950/95 backdrop-blur-xl border-t border-emerald-300/90 dark:border-emerald-800/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(16,185,129,0.15)] dark:shadow-[0_-4px_25px_rgba(6,78,59,0.4)] transition-colors duration-200">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all relative ${
                isActive
                  ? 'text-emerald-950 dark:text-emerald-300 bg-emerald-200/90 dark:bg-emerald-900/90 border border-emerald-400/80 dark:border-emerald-700 shadow-2xs font-black'
                  : 'text-emerald-800/80 dark:text-emerald-400/70 hover:text-emerald-950 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 bg-emerald-600 text-white text-[8px] font-mono font-extrabold px-1 rounded-full shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
