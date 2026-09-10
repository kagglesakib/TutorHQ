'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function RootPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) return;

    if (user.userType === 'student') {
      router.replace('/student');
    } else {
      router.replace('/admin');
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center py-24 space-y-3 min-h-[50vh]">
      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      <p className="text-xs text-slate-500 font-mono font-bold">Redirecting to workspace...</p>
    </div>
  );
}
