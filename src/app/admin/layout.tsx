'use client';

import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full transition-colors duration-300">
      {/* Ambient Aesthetic Dark Mode Atmospheric Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-500">
        {/* Top-center Emerald Luminous Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        {/* Top-right Indigo Cosmic Glow */}
        <div className="absolute top-20 right-[5%] w-[450px] h-[300px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none" />
        {/* Midground Teal Ambient Glow */}
        <div className="absolute top-96 left-[10%] w-[500px] h-[350px] bg-teal-500/6 rounded-full blur-[110px] pointer-events-none" />
      </div>

      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
}
