'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentHeader from '@/app/student/_components/StudentHeader';
import AdminHeader from '@/app/admin/_components/AdminHeader';

export default function NavigationHeader() {
  const { user, isAuthenticated } = useAuth();

  // Hide navigation header completely on login/signup page or unapproved student status
  if (!isAuthenticated || !user) {
    return null;
  }

  const isApproved = user.isApproved === 'yes' || (user as any).approved === 'yes';
  if (user.userType === 'student' && !isApproved) {
    return null;
  }

  if (user.userType === 'student') {
    return <StudentHeader />;
  }

  return <AdminHeader />;
}
