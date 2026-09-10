'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Activity, Exam, Payment } from '@/types';
import { useAuth } from './AuthContext';

interface StudentContextType {
  student: Student | null;
  activities: Activity[];
  exams: Exam[];
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  handleSaveProfile: (updated: Student) => Promise<void>;
  counts: { lessons: number; exams: number; payments: number };
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.sid) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetch('/api/students', { cache: 'no-store' }),
        fetch('/api/activities', { cache: 'no-store' }),
        fetch('/api/exams', { cache: 'no-store' }),
        fetch('/api/payments', { cache: 'no-store' }),
      ]);

      const [resStudents, resActivities, resExams, resPayments] = results;

      if (resStudents.status === 'fulfilled' && resStudents.value.ok) {
        const data = await resStudents.value.json();
        if (Array.isArray(data)) {
          const currentStudent = data.find((s: Student) => s.sid === user.sid);
          if (currentStudent) setStudent(currentStudent);
        }
      }

      if (resActivities.status === 'fulfilled' && resActivities.value.ok) {
        const data = await resActivities.value.json();
        if (Array.isArray(data)) {
          setActivities(data.filter((a: Activity) => a.studentSid === user.sid));
        }
      }

      if (resExams.status === 'fulfilled' && resExams.value.ok) {
        const data = await resExams.value.json();
        if (Array.isArray(data)) {
          setExams(data.filter((e: Exam) => e.studentSid === user.sid));
        }
      }

      if (resPayments.status === 'fulfilled' && resPayments.value.ok) {
        const data = await resPayments.value.json();
        if (Array.isArray(data)) {
          setPayments(data.filter((p: Payment) => p.studentSid === user.sid));
        }
      }
    } catch (err: any) {
      console.error('Error loading student data:', err);
      setError('Could not load student information.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.sid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async (updatedStudent: Student) => {
    try {
      const res = await fetch(`/api/students/${updatedStudent.sid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
      if (!res.ok) throw new Error('Failed to update student profile');
      setStudent(updatedStudent);
    } catch (err) {
      console.error('Failed to update student profile:', err);
      throw err;
    }
  };

  const counts = {
    lessons: activities.length,
    exams: exams.length,
    payments: payments.length,
  };

  return (
    <StudentContext.Provider
      value={{
        student,
        activities,
        exams,
        payments,
        isLoading,
        error,
        refreshData: loadData,
        handleSaveProfile,
        counts,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
