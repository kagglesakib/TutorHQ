'use client';

import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '@/context/ThemeContext';

interface DayNightToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function DayNightToggle({ className = '', size = 'sm' }: DayNightToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const isSmall = size === 'sm';
  const width = isSmall ? 'w-[52px]' : 'w-[62px]';
  const height = isSmall ? 'h-[26px]' : 'h-[30px]';
  const thumbSize = isSmall ? 'w-[20px] h-[20px]' : 'w-[24px] h-[24px]';
  const travelDist = isSmall ? 26 : 32;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative rounded-full cursor-pointer focus:outline-hidden transition-all duration-300 select-none shrink-0 border border-black/20 dark:border-white/20 overflow-hidden shadow-inner ${width} ${height} ${className}`}
      style={{
        backgroundColor: isDark ? '#0c162d' : '#48cae4',
        boxShadow: isDark 
          ? 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(99,102,241,0.2)' 
          : 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 8px rgba(56,189,248,0.3)',
      }}
      aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      {/* ========================================================================= */}
      {/* 1. LIGHT MODE BACKGROUND: SKY & CLOUDS                                    */}
      {/* ========================================================================= */}
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#48cae4] to-[#90e0ef]" />

        {/* Back Cloud */}
        <svg
          className="absolute right-1 top-1 w-5 h-2.5 text-sky-100/70"
          viewBox="0 0 24 12"
          fill="currentColor"
        >
          <path d="M19 6a3 3 0 0 0-2.8-2A4.5 4.5 0 0 0 8 5a3.5 3.5 0 0 0-5 3.1A3 3 0 0 0 6 11h13a3 3 0 0 0 0-5z" />
        </svg>

        {/* Front Fluffy White Cloud */}
        <svg
          className="absolute right-2.5 bottom-0.5 w-6 h-3.5 text-white drop-shadow-xs"
          viewBox="0 0 24 12"
          fill="currentColor"
        >
          <path d="M19 6a3 3 0 0 0-2.8-2A4.5 4.5 0 0 0 8 5a3.5 3.5 0 0 0-5 3.1A3 3 0 0 0 6 11h13a3 3 0 0 0 0-5z" />
        </svg>

        {/* Mini Accent Cloud */}
        <svg
          className="absolute right-0.5 bottom-1 w-3.5 h-2 text-white/90"
          viewBox="0 0 24 12"
          fill="currentColor"
        >
          <path d="M19 6a3 3 0 0 0-2.8-2A4.5 4.5 0 0 0 8 5a3.5 3.5 0 0 0-5 3.1A3 3 0 0 0 6 11h13a3 3 0 0 0 0-5z" />
        </svg>
      </motion.div>

      {/* ========================================================================= */}
      {/* 2. DARK MODE BACKGROUND: NIGHT SKY & STARS                                */}
      {/* ========================================================================= */}
      <motion.div
        initial={false}
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Midnight gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090e24] via-[#0f172a] to-[#1e1b4b]" />

        {/* Subtle Dark Mountain Horizon */}
        <div className="absolute -bottom-2 -left-2 w-8 h-6 bg-[#091124] rounded-full opacity-60" />

        {/* Star Dots */}
        <div className="absolute left-2 top-1 w-1 h-1 bg-white rounded-full opacity-90 shadow-[0_0_2px_#fff]" />
        <div className="absolute left-4.5 top-1.5 w-0.5 h-0.5 bg-indigo-200 rounded-full opacity-80" />
        <div className="absolute left-3 bottom-1.5 w-0.5 h-0.5 bg-white rounded-full opacity-75" />
        <div className="absolute left-5.5 bottom-2 w-1 h-1 bg-indigo-100 rounded-full opacity-90 shadow-[0_0_2px_#fff]" />
        <div className="absolute left-1 bottom-2.5 w-0.5 h-0.5 bg-sky-200 rounded-full opacity-60" />

        {/* Sparkle Star */}
        <svg
          className="absolute left-3.5 top-3 w-1.5 h-1.5 text-indigo-100 opacity-80 animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9Z" />
        </svg>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. SLIDING SUN / MOON THUMB                                               */}
      {/* ========================================================================= */}
      <motion.div
        initial={false}
        animate={{
          x: isDark ? travelDist : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 450,
          damping: 28,
        }}
        className={`absolute top-[2px] left-[2px] rounded-full flex items-center justify-center pointer-events-none z-10 ${thumbSize}`}
      >
        {isDark ? (
          /* PALE GLOWING MOON WITH CRATERS */
          <div className="relative w-full h-full rounded-full bg-[#f1f5f9] shadow-[0_0_6px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(100,116,139,0.5)] border border-slate-300 flex items-center justify-center overflow-hidden">
            {/* Crater 1 */}
            <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#cbd5e1]/80" />
            {/* Crater 2 */}
            <div className="absolute bottom-1 right-1 w-0.5 h-0.5 rounded-full bg-[#cbd5e1]/80" />
            {/* Crater 3 */}
            <div className="absolute bottom-1 left-1.5 w-0.5 h-0.5 rounded-full bg-[#cbd5e1]/70" />
          </div>
        ) : (
          /* BRIGHT GOLDEN RADIANT SUN */
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-[#f59e0b] via-[#fbbf24] to-[#fde047] shadow-[0_0_8px_#f59e0b,inset_0_1px_2px_rgba(255,255,255,0.8)] border border-amber-300 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#ffea00] opacity-80" />
          </div>
        )}
      </motion.div>
    </button>
  );
}
