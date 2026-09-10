'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent } from '@/context/StudentContext';
import { useAuth } from '@/context/AuthContext';
import StudentDossier from '@/app/student/_components/StudentDossier';
import StudentProfileForm from '@/app/student/_components/StudentProfileForm';
import { StudentLoadingView, StudentErrorView } from '@/app/student/_components/StudentStateView';

export default function StudentOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { student, activities, exams, payments, isLoading, error, handleSaveProfile } = useStudent();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  if (isLoading) {
    return <StudentLoadingView message="Loading your academic dossier..." />;
  }

  if (error || !student) {
    return <StudentErrorView sid={user?.sid} error={error} />;
  }

  if (isEditingProfile) {
    return (
      <StudentProfileForm
        student={student}
        onSave={async (updated) => {
          await handleSaveProfile(updated);
          setIsEditingProfile(false);
        }}
        onCancel={() => setIsEditingProfile(false)}
      />
    );
  }

  return (
    <StudentDossier
      student={student}
      activities={activities}
      exams={exams}
      payments={payments}
      onEditProfileClick={() => setIsEditingProfile(true)}
      onChangePasswordClick={() => router.push('/student/profile')}
    />
  );
}
