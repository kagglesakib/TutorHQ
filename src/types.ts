export type AccountStatus = 'active' | 'revoked' | 'pending';
export type ApprovalStatus = 'yes' | 'no' | 'pending';

/**
 * Normalized Admin Model
 * Collection: admins
 */
export interface Admin {
  _id?: any;
  email: string;
  password?: string;
  name?: string;
  phone?: string;
  status?: AccountStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  userType?: 'admin' | 'student';
}

/**
 * Normalized Student Model
 * Collection: students
 * Single source of truth for student identity and profile.
 */
export interface Student {
  _id?: any;
  sid: string; // unique human-readable identifier (e.g., "S101")
  name: string;
  email: string;
  password?: string; // plaintext
  phone?: string; // single field replacing phone + mobile
  status?: AccountStatus; // 'active' | 'revoked' | 'pending'
  college?: string;
  hscBatch?: string;
  group?: string;
  subject?: string;
  guardiansPhone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;

  // Aliases for view compatibility
  mobile?: string;
  approved?: ApprovalStatus;
  isApproved?: ApprovalStatus | boolean;
  userType?: 'admin' | 'student';
}

export type User = Student | Admin;
export type UserLogItem = Student & { userType?: 'admin' | 'student' };

export interface AuthUser {
  name: string;
  email: string;
  phone?: string;
  sid?: string;
  userType: 'admin' | 'student';
  approved?: ApprovalStatus;
  isApproved?: ApprovalStatus;
  status?: AccountStatus;
}

/**
 * Normalized Activity Model
 * Collection: activities
 * studentId: ObjectId FK -> students._id
 */
export interface Activity {
  _id?: any;
  aid?: string;
  studentId?: any; // ObjectId reference (resolved on server)
  studentSid?: string; // Populated for display/compatibility
  studentName?: string; // Populated for display
  date: string;
  status: string; // e.g. Present | Absent
  subject?: string; // split out of subjectTuitioned
  topic?: string; // split out of subjectTuitioned
  subjectTuitioned?: string; // Computed compatibility: "${subject} - ${topic}"
  hwMarks?: number | null;
  cwMarks?: number | null;
  comment?: string;
  createdAt?: string;
}

/**
 * Normalized Exam Model
 * Collection: exams
 * studentId: ObjectId FK -> students._id
 */
export interface Exam {
  _id?: any;
  eid?: string;
  studentId?: any; // ObjectId reference (resolved on server)
  studentSid?: string; // Populated for display/compatibility
  studentName?: string; // Populated for display
  date: string;
  subject?: string; // split out of subjectAndTopic
  topic?: string; // split out of subjectAndTopic
  subjectAndTopic?: string; // Computed compatibility: "${subject} - ${topic}"
  status?: string; // Present | Absent
  totalMarks: number;
  obtainedMarks?: number | null;
  remarks?: string;
  comment?: string;
  createdAt?: string;
}

/**
 * Normalized Payment Model
 * Collection: payments
 * studentId: ObjectId FK -> students._id
 */
export interface Payment {
  _id?: any;
  pid?: string;
  studentId?: any; // ObjectId reference (resolved on server)
  studentSid?: string; // Populated for display/compatibility
  studentName?: string; // Populated for display
  date: string;
  amount: number;
  paymentMonth: string; // YYYY-MM
  comment?: string;
  createdAt?: string;
  method?: string;
  status?: string;
}
