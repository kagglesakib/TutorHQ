import { getMongoDb, splitSubjectTopic, sanitizeDate, sanitizeDateString } from './db';
import fs from 'fs';
import path from 'path';

/**
 * Generates a full database backup snapshot matching the requested schema structure:
 * {
 *   admins: [...],
 *   students: [...],
 *   activities: [...],
 *   exams: [...],
 *   payments: [...],
 *   exportedAt: "...",
 *   version: "TutorHQ-JSON-2.0"
 * }
 */
export async function generateBackup(): Promise<any> {
  const mongoDb = await getMongoDb();

  const [rawAdmins, rawStudents, rawActivities, rawExams, rawPayments] = await Promise.all([
    mongoDb.collection('admins').find({}).toArray(),
    mongoDb.collection('students').find({}).toArray(),
    mongoDb.collection('activities').find({}).toArray(),
    mongoDb.collection('exams').find({}).toArray(),
    mongoDb.collection('payments').find({}).toArray(),
  ]);

  const admins = rawAdmins.map((a: any) => ({
    _id: String(a._id || 'ADMIN'),
    name: a.name || 'Sakibul Hasan',
    email: a.email || '',
    password: a.password || 'admin',
    phone: a.phone || '',
    status: a.status || 'active',
    isApproved: a.isApproved !== undefined ? Boolean(a.isApproved) : a.status === 'active',
    createdAt: a.createdAt ? (typeof a.createdAt === 'string' ? a.createdAt : a.createdAt.toISOString()) : new Date().toISOString(),
    updatedAt: a.updatedAt ? (typeof a.updatedAt === 'string' ? a.updatedAt : a.updatedAt.toISOString()) : new Date().toISOString(),
  }));

  const students = rawStudents.map((s: any) => ({
    _id: String(s._id || s.sid || ''),
    sid: String(s.sid || s._id || ''),
    name: s.name || '',
    email: s.email || '',
    password: s.password || 'student123',
    phone: s.phone || '',
    status: s.status || (s.isApproved ? 'active' : 'revoked'),
    isApproved: s.isApproved !== undefined ? Boolean(s.isApproved) : s.status === 'active',
    college: s.college || '',
    hscBatch: s.hscBatch || '',
    group: s.group || '',
    subject: s.subject || '',
    guardiansPhone: s.guardiansPhone || '',
    address: s.address || '',
    createdAt: s.createdAt ? (typeof s.createdAt === 'string' ? s.createdAt : s.createdAt.toISOString()) : new Date().toISOString(),
    updatedAt: s.updatedAt ? (typeof s.updatedAt === 'string' ? s.updatedAt : s.updatedAt.toISOString()) : new Date().toISOString(),
  }));

  const activities = rawActivities.map((act: any) => ({
    _id: String(act._id || act.aid || `D_${Date.now()}`),
    studentId: String(act.studentId || act.studentSid || ''),
    date: typeof act.date === 'string' ? act.date.slice(0, 10) : sanitizeDateString(act.date).slice(0, 10),
    status: act.status || 'Present',
    subject: act.subject || '',
    topic: act.topic || '',
    hwMarks: act.hwMarks !== undefined && act.hwMarks !== null ? act.hwMarks : '',
    cwMarks: act.cwMarks !== undefined && act.cwMarks !== null ? act.cwMarks : '',
    comment: act.comment || '',
  }));

  const exams = rawExams.map((ex: any) => ({
    _id: String(ex._id || ex.eid || `E_${Date.now()}`),
    studentId: String(ex.studentId || ex.studentSid || ''),
    date: typeof ex.date === 'string' ? ex.date.slice(0, 10) : sanitizeDateString(ex.date).slice(0, 10),
    subject: ex.subject || '',
    topic: ex.topic || '',
    status: ex.status || 'Present',
    totalMarks: Number(ex.totalMarks || 100),
    obtainedMarks: ex.obtainedMarks !== undefined && ex.obtainedMarks !== null ? (typeof ex.obtainedMarks === 'number' ? ex.obtainedMarks : Number(ex.obtainedMarks)) : null,
    remarks: ex.remarks || '',
    comment: ex.comment || '',
  }));

  const payments = rawPayments.map((p: any) => ({
    _id: String(p._id || p.pid || `P_${Date.now()}`),
    studentId: String(p.studentId || p.studentSid || ''),
    date: typeof p.date === 'string' ? p.date.slice(0, 10) : sanitizeDateString(p.date).slice(0, 10),
    amount: Number(p.amount || 0),
    paymentMonth: p.paymentMonth || '',
    comment: p.comment || '',
  }));

  return {
    admins,
    students,
    activities,
    exams,
    payments,
    exportedAt: new Date().toISOString(),
    version: 'TutorHQ-JSON-2.0',
  };
}

/**
 * Restores database using the exact backup structure provided by the user.
 * Collections:
 * - admins: string _id (e.g. "ADMIN"), name, email, password, phone, status, isApproved, createdAt, updatedAt
 * - students: string _id (e.g. "9909899"), sid, name, email, password, phone, status, isApproved, college, hscBatch, group, subject, guardiansPhone, address, createdAt, updatedAt
 * - activities: string _id (e.g. "D_..."), studentId (string matching student's sid/_id), date, status, subject, topic, hwMarks, cwMarks, comment
 * - exams: string _id (e.g. "E_..."), studentId (string matching student's sid/_id), date, subject, topic, status, totalMarks, obtainedMarks, remarks, comment
 * - payments: string _id (e.g. "P_..."), studentId (string matching student's sid/_id), date, amount, paymentMonth, comment
 */
export async function restoreBackup(payload: any): Promise<{
  success: boolean;
  message: string;
  stats: {
    admins: number;
    students: number;
    activities: number;
    exams: number;
    payments: number;
  };
}> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid backup file: Expected JSON object');
  }

  const mongoDb = await getMongoDb();

  const rawAdmins = Array.isArray(payload.admins) ? payload.admins : [];
  const rawStudents = Array.isArray(payload.students) ? payload.students : [];
  const rawActivities = Array.isArray(payload.activities) ? payload.activities : [];
  const rawExams = Array.isArray(payload.exams) ? payload.exams : [];
  const rawPayments = Array.isArray(payload.payments) ? payload.payments : [];

  // 1. Prepare Admins
  const defaultAdmin = {
    _id: 'ADMIN',
    name: 'Sakibul Hasan',
    email: 'sakib1514817122@gmail.com',
    password: 'sakib338',
    phone: '01516518418',
    status: 'active',
    isApproved: true,
    createdAt: '2026-07-23T06:30:29.005Z',
    updatedAt: new Date().toISOString(),
  };

  const finalAdmins = rawAdmins.length > 0
    ? rawAdmins.map((a: any) => ({
        _id: String(a._id || 'ADMIN'),
        name: a.name || 'Sakibul Hasan',
        email: String(a.email || 'sakib1514817122@gmail.com').trim().toLowerCase(),
        password: a.password || 'sakib338',
        phone: String(a.phone || '01516518418').trim(),
        status: a.status || (a.isApproved ? 'active' : 'revoked'),
        isApproved: a.isApproved !== undefined ? Boolean(a.isApproved) : true,
        createdAt: a.createdAt || new Date().toISOString(),
        updatedAt: a.updatedAt || new Date().toISOString(),
      }))
    : [defaultAdmin];

  // 2. Prepare Students
  const studentMap = new Map<string, any>();

  for (const s of rawStudents) {
    const rawSid = String(s.sid || s._id || '').trim();
    // Unique identifier key
    const sid = rawSid;
    const docId = String(s._id || s.sid || (s.email ? s.email.split('@')[0] : `STU_${Date.now()}`));

    const isAppr = s.isApproved !== undefined 
      ? Boolean(s.isApproved) 
      : (s.status === 'active' || s.approved === 'yes' || s.approved === true);

    const status = s.status || (isAppr ? 'active' : 'revoked');

    const studentDoc = {
      _id: docId,
      sid: sid || docId,
      name: s.name || 'Student',
      email: String(s.email || '').trim().toLowerCase(),
      password: s.password || 'dummy1234',
      phone: String(s.phone || s.mobile || '').trim(),
      status,
      isApproved: isAppr,
      college: s.college || '',
      hscBatch: s.hscBatch || '',
      group: s.group || '',
      subject: s.subject || '',
      guardiansPhone: s.guardiansPhone || '',
      address: s.address || '',
      createdAt: s.createdAt || new Date().toISOString(),
      updatedAt: s.updatedAt || new Date().toISOString(),
    };

    studentMap.set(studentDoc._id, studentDoc);
    if (sid) {
      studentMap.set(sid, studentDoc);
    }
  }

  // Deduplicate array by _id
  const finalStudentsMap = new Map<string, any>();
  for (const s of Array.from(studentMap.values())) {
    finalStudentsMap.set(s._id, s);
  }
  const finalStudents = Array.from(finalStudentsMap.values());

  // 3. Prepare Activities
  const finalActivities = rawActivities.map((act: any, idx: number) => {
    let finalSubject = act.subject || '';
    let finalTopic = act.topic || '';
    if ((!finalSubject || !finalTopic) && act.subjectTuitioned) {
      const split = splitSubjectTopic(act.subjectTuitioned);
      if (!finalSubject) finalSubject = split.subject;
      if (!finalTopic) finalTopic = split.topic;
    }

    return {
      _id: String(act._id || act.aid || `D_${Date.now()}_${idx}`),
      studentId: String(act.studentId || act.studentSid || ''),
      date: typeof act.date === 'string' ? act.date.slice(0, 10) : sanitizeDateString(act.date).slice(0, 10),
      status: act.status || 'Present',
      subject: finalSubject,
      topic: finalTopic,
      hwMarks: act.hwMarks !== undefined ? act.hwMarks : '',
      cwMarks: act.cwMarks !== undefined ? act.cwMarks : '',
      comment: act.comment || '',
    };
  });

  // 4. Prepare Exams
  const finalExams = rawExams.map((ex: any, idx: number) => {
    let finalSubject = ex.subject || '';
    let finalTopic = ex.topic || '';
    if ((!finalSubject || !finalTopic) && ex.subjectAndTopic) {
      const split = splitSubjectTopic(ex.subjectAndTopic);
      if (!finalSubject) finalSubject = split.subject;
      if (!finalTopic) finalTopic = split.topic;
    }

    return {
      _id: String(ex._id || ex.eid || `E_${Date.now()}_${idx}`),
      studentId: String(ex.studentId || ex.studentSid || ''),
      date: typeof ex.date === 'string' ? ex.date.slice(0, 10) : sanitizeDateString(ex.date).slice(0, 10),
      subject: finalSubject,
      topic: finalTopic,
      status: ex.status || 'Present',
      totalMarks: Number(ex.totalMarks || 100),
      obtainedMarks: ex.obtainedMarks !== undefined && ex.obtainedMarks !== null && ex.obtainedMarks !== ''
        ? Number(ex.obtainedMarks)
        : null,
      remarks: ex.remarks || '',
      comment: ex.comment || '',
    };
  });

  // 5. Prepare Payments
  const finalPayments = rawPayments.map((p: any, idx: number) => ({
    _id: String(p._id || p.pid || `P_${Date.now()}_${idx}`),
    studentId: String(p.studentId || p.studentSid || ''),
    date: typeof p.date === 'string' ? p.date.slice(0, 10) : sanitizeDateString(p.date).slice(0, 10),
    amount: Number(p.amount || 0),
    paymentMonth: p.paymentMonth || '',
    comment: p.comment || '',
  }));

  // 6. Write atomically to MongoDB collections
  await Promise.allSettled([
    mongoDb.collection('admins').deleteMany({}),
    mongoDb.collection('students').deleteMany({}),
    mongoDb.collection('activities').deleteMany({}),
    mongoDb.collection('exams').deleteMany({}),
    mongoDb.collection('payments').deleteMany({}),
  ]);

  if (finalAdmins.length > 0) {
    await mongoDb.collection('admins').insertMany(finalAdmins);
  }
  if (finalStudents.length > 0) {
    await mongoDb.collection('students').insertMany(finalStudents);
  }
  if (finalActivities.length > 0) {
    await mongoDb.collection('activities').insertMany(finalActivities);
  }
  if (finalExams.length > 0) {
    await mongoDb.collection('exams').insertMany(finalExams);
  }
  if (finalPayments.length > 0) {
    await mongoDb.collection('payments').insertMany(finalPayments);
  }

  return {
    success: true,
    message: `Database uploaded and synchronized with backup structure: ${finalAdmins.length} Admin, ${finalStudents.length} Students, ${finalActivities.length} Activities, ${finalExams.length} Exams, and ${finalPayments.length} Payments.`,
    stats: {
      admins: finalAdmins.length,
      students: finalStudents.length,
      activities: finalActivities.length,
      exams: finalExams.length,
      payments: finalPayments.length,
    },
  };
}

/**
 * Loads and restores the backup file located at /backup/backup.json directly.
 */
export async function uploadLocalBackupFile(): Promise<{
  success: boolean;
  message: string;
  stats: any;
}> {
  const possiblePaths = [
    path.resolve(process.cwd(), 'backup/backup.json'),
    path.resolve(process.cwd(), 'backup.json'),
    '/backup/backup.json',
  ];

  let filePath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    throw new Error(`Backup file not found in paths: ${possiblePaths.join(', ')}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const payload = JSON.parse(fileContent);
  return await restoreBackup(payload);
}
