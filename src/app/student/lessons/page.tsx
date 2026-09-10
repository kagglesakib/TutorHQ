'use client';

import React from 'react';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentLessonsView from '@/app/student/_components/StudentLessonsView';
import { StudentLoadingView, StudentErrorView } from '@/app/student/_components/StudentStateView';

export default function StudentLessonsPage() {
  const { user } = useAuth();
  const { student, activities, isLoading, error } = useStudent();

  if (isLoading) {
    return <StudentLoadingView message="Loading your study and lesson logs..." />;
  }

  if (error || !student) {
    return <StudentErrorView sid={user?.sid} error={error} />;
  }

  return (
    <StudentLessonsView
      student={student}
      activities={activities}
    />
  );
}
