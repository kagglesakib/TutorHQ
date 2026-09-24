import { Student } from '@/types';

/**
 * Identifies if a user record belongs to an Admin account.
 */
export function isAdminStudent(student: Partial<Student>): boolean {
  if (!student) return false;
  if (student.userType === 'admin') return true;

  const sid = String(student.sid || '').trim().toUpperCase();
  if (sid === 'ADMIN' || sid === '0000000' || sid === '0') return true;

  const email = String(student.email || '').trim().toLowerCase();
  if (
    email === 'sakib1514817122@gmail.com' ||
    email === 'sakibhasan.office@gmail.com' ||
    email === 'kagglesakib@gmail.com'
  ) {
    return true;
  }

  const name = String(student.name || '').trim().toLowerCase();
  if (name === 'sakibul hasan' || name.includes('sakibul hasan') || name === 'admin') {
    return true;
  }

  return false;
}

/**
 * Checks if a student account is pending approval.
 */
export function isPendingStudent(student: Partial<Student>): boolean {
  if (!student || isAdminStudent(student)) return false;

  const approved = String(student.isApproved ?? (student as any).approved ?? '').trim().toLowerCase();
  if (approved === 'pending') return true;

  const status = String(student.status ?? '').trim().toLowerCase();
  if (status === 'pending') return true;

  return false;
}

/**
 * Checks if a student account has been revoked, rejected, or disapproved.
 */
export function isRevokedOrRejectedStudent(student: Partial<Student>): boolean {
  if (!student || isAdminStudent(student)) return false;

  const approved = String(student.isApproved ?? (student as any).approved ?? '').trim().toLowerCase();
  if (approved === 'no' || approved === 'disapproved' || approved === 'rejected' || approved === 'false') {
    return true;
  }

  const status = String(student.status ?? '').trim().toLowerCase();
  if (status === 'revoked' || status === 'disapproved' || status === 'rejected' || status === 'inactive') {
    return true;
  }

  return false;
}

/**
 * Strictly checks if a student is an Active Enrolled Student
 * (Excludes Admins, Pending approvals, and Revoked/Rejected accounts).
 */
export function isActiveEnrolledStudent(student: Partial<Student>): boolean {
  if (!student) return false;
  if (isAdminStudent(student)) return false;
  if (isPendingStudent(student)) return false;
  if (isRevokedOrRejectedStudent(student)) return false;

  // Must be explicitly approved or implicitly approved (not pending/no)
  const approved = String(student.isApproved ?? (student as any).approved ?? '').trim().toLowerCase();
  if (approved && approved !== 'yes' && approved !== 'true') {
    return false;
  }

  return true;
}
