'use client';

import React from 'react';
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

  return (
    <footer id="app-footer" className="w-full bg-slate-950 text-slate-400 border-t border-slate-800/70 mt-auto py-2.5 sm:py-3 pb-16 sm:pb-3 font-sans relative z-10 overflow-hidden text-[11px]">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 space-y-2 relative z-10">
        
        {/* Main Compact Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
          
          {/* Brand & Purpose Box (Columns 1-5) */}
          <div className="md:col-span-5 flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-slate-800/80">
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black font-display text-white tracking-tight">
                  Academic Portal
                </span>
                <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Official Ledger
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight truncate sm:whitespace-normal">
                Academic tracking, daily study logs, exam results & payments.
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
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-900/50 text-emerald-200 transition-all text-[10px] group shadow-2xs truncate"
              title="WhatsApp: 01516518418"
            >
              <div className="p-1 rounded-md bg-emerald-500 text-white shrink-0">
                <MessageSquare className="w-3 h-3" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[8px] text-emerald-400/90 font-bold uppercase">WhatsApp</span>
                <span className="font-bold text-emerald-100 text-[10px] truncate">01516518418</span>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:sakibhasan.office@gmail.com"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-900/50 text-indigo-200 transition-all text-[10px] group shadow-2xs truncate"
              title="Email: sakibhasan.office@gmail.com"
            >
              <div className="p-1 rounded-md bg-indigo-600 text-white shrink-0">
                <Mail className="w-3 h-3" />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[8px] text-indigo-400/90 font-bold uppercase">Email</span>
                <span className="font-bold text-indigo-100 text-[10px] truncate">sakibhasan</span>
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
              className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-sky-950/40 border border-sky-500/30 hover:border-sky-400 hover:bg-sky-900/50 text-sky-200 transition-all text-[10px] font-semibold shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-md bg-sky-600 text-white shrink-0">
                  <Facebook className="w-3 h-3" />
                </div>
                <span className="font-bold text-white text-[10px] truncate">Facebook</span>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-sky-400 shrink-0" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/sakibul-hasan-ab9526318"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/50 text-blue-200 transition-all text-[10px] font-semibold shadow-2xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="p-1 rounded-md bg-blue-600 text-white shrink-0">
                  <Linkedin className="w-3 h-3" />
                </div>
                <span className="font-bold text-white text-[10px] truncate">LinkedIn</span>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-blue-400 shrink-0" />
            </a>
          </div>

        </div>

        {/* Bottom Bar - Super tight single row */}
        <div className="pt-1.5 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-[10px] text-slate-500 font-medium">
          <p>© {currentYear} Academic Management Portal. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Built for Academic Excellence</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
