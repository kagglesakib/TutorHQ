'use client';

import React from 'react';
import { StudentProvider } from '@/context/StudentContext';
import StudentMobileDock from '@/app/student/_components/StudentMobileDock';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentProvider>
      <div className="space-y-3 pb-20 sm:pb-8 min-h-screen">
        {children}
        <StudentMobileDock />
      </div>
    </StudentProvider>
  );
}
