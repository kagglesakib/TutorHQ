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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-950/95 backdrop-blur-xl border-t border-emerald-800/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all relative ${
                isActive
                  ? 'text-emerald-300 bg-emerald-900/90 shadow-2xs'
                  : 'text-emerald-400/80 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 text-[8px] font-mono font-extrabold px-1 rounded-full">
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
