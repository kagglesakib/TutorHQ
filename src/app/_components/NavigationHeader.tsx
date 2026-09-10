'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

const StudentHeader = dynamic(() => import('@/app/student/_components/StudentHeader'), { ssr: false });
const AdminHeader = dynamic(() => import('@/app/admin/_components/AdminHeader'), { ssr: false });

export default function NavigationHeader() {
  const { user, isAuthenticated } = useAuth();

  // Hide navigation header completely on login/signup page or unapproved student status
  if (!isAuthenticated || !user || (user.userType === 'student' && user.isApproved !== 'yes')) {
    return null;
  }

  if (user.userType === 'student') {
    return <StudentHeader />;
  }

  return <AdminHeader />;
}

