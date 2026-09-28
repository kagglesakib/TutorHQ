'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  MessageSquare, 
  Linkedin, 
  Facebook, 
  ShieldCheck, 
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, user } = useAuth();

  // Hide footer on login/signup page so the scenic card takes the full canvas
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <footer id="app-footer" className="w-full bg-sky-100/95 dark:bg-slate-950 text-sky-950 dark:text-sky-200 border-t border-sky-300/80 dark:border-blue-900/70 mt-auto py-2.5 sm:py-3 pb-16 sm:pb-3 font-sans relative z-10 overflow-hidden text-[11px] transition-colors duration-200 shadow-sm dark:shadow-[0_-4px_25px_rgba(30,58,138,0.25)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 space-y-2 relative z-10">
        
        {/* Main Compact Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
          
          {/* Brand & Purpose Box (Columns 1-5) */}
          <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center gap-2 bg-sky-50/90 dark:bg-blue-950/70 p-2 sm:p-2.5 rounded-xl border border-sky-300/80 dark:border-blue-800/80 shadow-2xs">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black font-display text-sky-950 dark:text-white tracking-tight">
                  Academic Portal
                </span>
                <span className="px-1.5 py-0.2 bg-sky-200/90 dark:bg-blue-900/60 text-sky-950 dark:text-sky-300 border border-sky-400/80 dark:border-blue-700/60 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Official Ledger
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 bg-emerald-200/80 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-400/70 dark:border-emerald-800/60 rounded">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-[10px] text-sky-800/90 dark:text-blue-300/90 leading-tight truncate sm:whitespace-normal">
                Academic tracking, daily study logs, exam results &amp; payments.
              </p>
            </div>
          </div>

          {/* Direct Contact (Columns 6-8) */}
          <div className="md:col-span-4 grid grid-cols-2 gap-1.5">
            {/* WhatsApp */}
            <a
              href="https://wa.me/8801516518418"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-blue-950/60 border border-sky-300/80 dark:border-blue-800/70 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-blue-900/60 text-sky-950 dark:text-sky-200 transition-all text-[10px] group shadow-2xs truncate"
              title="WhatsApp: 01516518418"
            >
              <div className="p-1 rounded-md bg-emerald-600 text-white shrink-0">
                <MessageSquare className="w-3 h-3" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[8px] text-sky-700 dark:text-blue-400 font-bold uppercase">WhatsApp</span>
                <span className="font-bold text-sky-950 dark:text-white text-[10px] truncate">01516518418</span>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:sakibhasan.office@gmail.com"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-blue-950/60 border border-sky-300/80 dark:border-blue-800/70 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-blue-900/60 text-sky-950 dark:text-sky-200 transition-all text-[10px] group shadow-2xs truncate"
              title="Email: sakibhasan.office@gmail.com"
            >
              <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                <Mail className="w-3 h-3" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[8px] text-sky-700 dark:text-blue-400 font-bold uppercase">Email</span>
                <span className="font-bold text-sky-950 dark:text-white text-[10px] truncate">sakibhasan</span>
              </div>
            </a>
          </div>

          {/* Social Profiles (Columns 9-12) */}
          <div className="md:col-span-3 grid grid-cols-2 gap-1.5">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/Sakib.2004043/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-blue-950/60 border border-sky-300/80 dark:border-blue-800/70 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-blue-900/60 text-sky-950 dark:text-white transition-all text-[10px] font-semibold shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-md bg-sky-600 text-white shrink-0">
                  <Facebook className="w-3 h-3" />
                </div>
                <span className="font-bold text-sky-950 dark:text-white text-[10px] truncate">Facebook</span>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-sky-600 dark:text-blue-400 shrink-0" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/sakibul-hasan-ab9526318"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-white/90 dark:bg-blue-950/60 border border-sky-300/80 dark:border-blue-800/70 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-blue-900/60 text-sky-950 dark:text-white transition-all text-[10px] font-semibold shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                  <Linkedin className="w-3 h-3" />
                </div>
                <span className="font-bold text-sky-950 dark:text-white text-[10px] truncate">LinkedIn</span>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
            </a>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-1.5 border-t border-sky-300/70 dark:border-blue-900/70 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-[10px] text-sky-800/90 dark:text-blue-300 font-medium">
          <p>© {currentYear} Academic Management Portal. All rights reserved.</p>
          <p className="flex items-center gap-1 text-sky-900 dark:text-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Built for Academic Excellence</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
