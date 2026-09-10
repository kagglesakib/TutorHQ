'use client';

import React from 'react';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentPaymentsView from '@/app/student/_components/StudentPaymentsView';
import { StudentLoadingView, StudentErrorView } from '@/app/student/_components/StudentStateView';

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const { student, payments, isLoading, error } = useStudent();

  if (isLoading) {
    return <StudentLoadingView message="Loading your tuition payment ledger..." />;
  }

  if (error || !student) {
    return <StudentErrorView sid={user?.sid} error={error} />;
  }

  return (
    <StudentPaymentsView
      student={student}
      payments={payments}
    />
  );
}
