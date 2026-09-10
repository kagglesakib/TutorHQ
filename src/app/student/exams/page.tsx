'use client';

import React from 'react';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentExamsView from '@/app/student/_components/StudentExamsView';
import { StudentLoadingView, StudentErrorView } from '@/app/student/_components/StudentStateView';

export default function StudentExamsPage() {
  const { user } = useAuth();
  const { student, exams, isLoading, error } = useStudent();

  if (isLoading) {
    return <StudentLoadingView message="Loading your examination scorecards..." />;
  }

  if (error || !student) {
    return <StudentErrorView sid={user?.sid} error={error} />;
  }

  return (
    <StudentExamsView
      student={student}
      exams={exams}
    />
  );
}
