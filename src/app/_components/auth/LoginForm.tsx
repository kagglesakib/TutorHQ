'use client';

import React, { useState } from 'react';
import {
  UserCheck, UserPlus, Eraser, AlertCircle, Clock,
  CheckCircle2, Sparkles, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { AuthNavbar } from './AuthNavbar';
import { AuthHeroBanner } from './AuthHeroBanner';
import { SignInForm } from './SignInForm';
import { SignUpForm, SignupFormData } from './SignUpForm';
import { PendingApprovalCard } from './PendingApprovalCard';

export { PendingApprovalCard };

const initialSignupState: SignupFormData = {
  name: '',
  college: '',
  hscBatch: '',
  subject: '',
  group: 'Science',
  mobile: '',
  guardiansPhone: '',
  address: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function LoginForm() {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup States
  const [signupData, setSignupData] = useState<SignupFormData>(initialSignupState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const scrollToFormSection = () => {
    const el = document.getElementById('auth-form-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSelectAuthMode = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setError(null);
    setSuccessMsg(null);
    setTimeout(() => {
      scrollToFormSection();
    }, 40);
  };

  const handleSignupFieldChange = (field: keyof SignupFormData, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFields = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setSignupData(initialSignupState);
    setError(null);
    setSuccessMsg(null);
  };

  const cleanErrorMessage = (msg: string | null | undefined): string => {
    if (!msg) return 'An unexpected error occurred.';
    const lower = msg.toLowerCase();
    if (
      lower.includes('unexpected token') ||
      lower.includes('is not valid json') ||
      lower.includes('<html>') ||
      lower.includes('<!doctype') ||
      lower.includes('syntaxerror') ||
      lower.includes('failed to parse')
    ) {
      return 'Unable to process request due to a temporary server issue. Please try again later.';
    }
    return msg;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your Student ID (SID) or Email and Password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginIdentifier.trim(), loginPassword.trim());
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signupData.name.trim() || !signupData.mobile.trim() || !signupData.email.trim() || !signupData.password) {
      setError('Full Name, Mobile Number, Email Address, and Password are required.');
      return;
    }

    if (signupData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match. Please verify password confirmation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setIsSubmitting(false);
        setError('Server temporarily unavailable or returning invalid response. Please try again later.');
        return;
      }

      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setError(cleanErrorMessage(data.error || 'Registration failed. Please check your information and try again.'));
        return;
      }

      setSuccessMsg(`Account created for ${signupData.name}! Your student registration is pending admin approval.`);
      setLoginIdentifier(signupData.email);
      setLoginPassword(signupData.password);
      setAuthMode('login');
    } catch (err: any) {
      setIsSubmitting(false);
      setError(cleanErrorMessage(err?.message || 'Signup request failed. Please try again later.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 flex flex-col justify-between -mt-6 -mx-4 sm:-mx-6 lg:-mx-8 font-sans text-xs">
      {/* 1. TOP NAVBAR */}
      <AuthNavbar
        authMode={authMode}
        onSelectAuthMode={handleSelectAuthMode}
      />

      {/* 2. MAIN CONTAINER */}
      <div className="flex-grow pt-16 sm:pt-20 pb-6 px-3 sm:px-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          
          {/* LEFT DECORATIVE SIDEBAR */}
          <AuthHeroBanner
            authMode={authMode}
            onToggleAuthMode={() => handleSelectAuthMode(authMode === 'login' ? 'signup' : 'login')}
          />

          {/* RIGHT FORM CONTAINER */}
          <motion.div
            id="auth-form-card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-7 bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-emerald-100/80 rounded-2xl p-3.5 sm:p-5 border-2 border-emerald-300/90 shadow-xl flex flex-col justify-between backdrop-blur-xs scroll-mt-20"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200/90 pb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-black font-display text-emerald-950 flex items-center gap-1.5">
                      {authMode === 'login' ? (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span>Portal Sign In</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-emerald-700" />
                          <span>Student Registration</span>
                        </>
                      )}
                    </h3>
                    <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 border border-emerald-300 rounded text-[9px] font-mono font-bold uppercase">
                      {authMode === 'login' ? 'Access' : 'New User'}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-800/80 font-medium truncate">
                    {authMode === 'login'
                      ? 'Enter your SID or registered email with password.'
                      : 'Complete your academic profile to register for student access.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClearFields}
                  className="px-2 py-1 bg-emerald-200/80 hover:bg-emerald-300 text-emerald-950 border border-emerald-400/60 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                  title="Clear all form inputs"
                >
                  <Eraser className="w-3 h-3 text-emerald-800" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>

              {/* Alert Boxes */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2.5 rounded-xl text-[11px] font-semibold flex items-start gap-2 shadow-2xs border ${
                    error.toLowerCase().includes('pending')
                      ? 'bg-amber-100/95 border-amber-300/90 text-amber-950'
                      : 'bg-rose-100/95 border-rose-300 text-rose-950'
                  }`}
                >
                  {error.toLowerCase().includes('pending') ? (
                    <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-snug">{cleanErrorMessage(error)}</div>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-200/90 border border-emerald-400 text-emerald-950 p-2.5 rounded-xl text-[11px] font-semibold flex items-start gap-2 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{successMsg}</div>
                </motion.div>
              )}

              {/* Form Views */}
              {authMode === 'login' ? (
                <SignInForm
                  loginIdentifier={loginIdentifier}
                  loginPassword={loginPassword}
                  onIdentifierChange={setLoginIdentifier}
                  onPasswordChange={setLoginPassword}
                  onSubmit={handleLoginSubmit}
                  onSwitchToSignup={() => handleSelectAuthMode('signup')}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <SignUpForm
                  signupData={signupData}
                  onDataChange={handleSignupFieldChange}
                  onSubmit={handleSignupSubmit}
                  onSwitchToLogin={() => handleSelectAuthMode('login')}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>

            {/* Micro Footer */}
            <div className="pt-2 mt-3 border-t border-emerald-200/90 flex items-center justify-between text-[10px] text-emerald-900/90 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-700" /> Academic Management
              </span>
              <span className="flex items-center gap-1 text-emerald-950 font-semibold px-2 py-0.5 rounded-md bg-emerald-200/80 border border-emerald-300 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-800" />
                <span>Encrypted Portal</span>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
