'use client';

import React from 'react';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentPasswordForm from '@/app/student/_components/StudentPasswordForm';
import { StudentLoadingView, StudentErrorView } from '@/app/student/_components/StudentStateView';

export default function StudentProfilePage() {
  const { user } = useAuth();
  const { student, isLoading, error, handleSaveProfile } = useStudent();

  if (isLoading) {
    return <StudentLoadingView message="Loading profile details..." />;
  }

  if (error || !student) {
    return <StudentErrorView sid={user?.sid} error={error} />;
  }

  return (
    <StudentPasswordForm
      student={student}
      onSaveProfile={handleSaveProfile}
    />
  );
}
