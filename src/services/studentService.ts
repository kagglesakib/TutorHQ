import { ObjectId } from 'mongodb';
import { getMongoDb, sanitizeDate, sanitizeDateString } from './db';
import { Student } from '../types';

function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function isAdminUser(user: any): boolean {
  if (!user) return false;
  if (user.userType === 'admin') return true;
  const sid = String(user.sid || '').trim().toUpperCase();
  if (sid === 'ADMIN' || sid === '0000000' || sid === '0') return true;
  const email = String(user.email || '').trim().toLowerCase();
  if (
    email === 'sakib1514817122@gmail.com' ||
    email === 'sakibhasan.office@gmail.com' ||
    email === 'kagglesakib@gmail.com'
  ) {
    return true;
  }
  const name = String(user.name || '').trim().toLowerCase();
  if (name === 'sakibul hasan' || name.includes('sakibul hasan') || name === 'admin') {
    return true;
  }
  return false;
}

/**
 * Maps a database student document to standard Student interface with UI-compatibility aliases
 */
export function formatStudentDoc(s: any): Student {
  const status: 'active' | 'revoked' | 'pending' = 
    s.status === 'revoked' || s.status === 'pending' || s.status === 'active'
      ? s.status
      : (s.approved === 'no' || s.isApproved === 'no' || s.approved === 'disapproved' || s.isApproved === 'disapproved'
        ? 'revoked'
        : (s.approved === 'pending' || s.isApproved === 'pending' ? 'pending' : 'active'));

  const approvalVal: 'yes' | 'no' | 'pending' = 
    status === 'revoked' ? 'no' : (status === 'pending' ? 'pending' : 'yes');

  const phone = (s.phone || s.mobile || '').trim();

  return {
    _id: s._id ? String(s._id) : undefined,
    sid: s.sid || '',
    name: s.name || 'Student',
    email: (s.email || '').trim().toLowerCase(),
    phone,
    mobile: phone, // alias
    status,
    approved: approvalVal, // alias
    isApproved: approvalVal, // alias
    college: s.college || '',
    hscBatch: s.hscBatch || '',
    group: s.group || '',
    subject: s.subject || '',
    guardiansPhone: s.guardiansPhone || '',
    address: s.address || '',
    createdAt: s.createdAt ? sanitizeDateString(s.createdAt) : new Date().toISOString(),
    updatedAt: s.updatedAt ? sanitizeDateString(s.updatedAt) : undefined,
    userType: 'student',
  };
}

/**
 * Returns all active and pending students (excludes admin accounts)
 */
export async function getStudents(): Promise<Student[]> {
  const mongoDb = await getMongoDb();
  
  const rawStudents = await mongoDb.collection('students')
    .find(
      {
        sid: { $nin: ['ADMIN', 'admin', '0000000', '0'] },
      },
      { projection: { password: 0 } }
    )
    .sort({ sid: 1 })
    .toArray();

  return rawStudents
    .filter((s) => !isAdminUser(s))
    .map(formatStudentDoc);
}

/**
 * Lookup single student by SID or ObjectId
 */
export async function getStudentBySid(sid: string): Promise<Student | null> {
  const mongoDb = await getMongoDb();
  const cleanSid = String(sid).trim();
  const upperSid = cleanSid.toUpperCase();

  const doc = await (mongoDb.collection('students') as any).findOne({
    $or: [
      { sid: cleanSid },
      { sid: upperSid },
      { _id: cleanSid },
      { _id: upperSid },
      { sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } },
    ],
  });

  return doc ? formatStudentDoc(doc) : null;
}

export async function getStudentById(id: string | ObjectId): Promise<Student | null> {
  const mongoDb = await getMongoDb();
  let query: any = { _id: id };
  if (typeof id === 'string' && ObjectId.isValid(id)) {
    query = { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
  }

  const doc = await mongoDb.collection('students').findOne(query);
  return doc ? formatStudentDoc(doc) : null;
}

/**
 * Create a new student in the normalized students collection
 */
export async function createStudent(data: Partial<Student>): Promise<Student> {
  const { sid, name, email, password, phone, mobile, college, hscBatch, subject, group, guardiansPhone, address, status, approved, isApproved } = data;
  if (!sid || !name) {
    throw new Error('Student SID and Name are required');
  }

  const cleanSid = String(sid).trim().toUpperCase();
  const cleanEmail = email ? String(email).trim().toLowerCase() : '';
  const cleanPhone = (phone || mobile || '').trim();

  if (isAdminUser({ sid: cleanSid, name, email: cleanEmail })) {
    throw new Error('Cannot create student profile for administrator account.');
  }

  const mongoDb = await getMongoDb();

  // Validate SID uniqueness in students collection
  const existingBySid = await mongoDb.collection('students').findOne({
    $or: [{ sid: cleanSid }, { sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } }],
  });
  if (existingBySid) {
    throw new Error(`Student with SID '${cleanSid}' already exists.`);
  }

  // Validate Email uniqueness in students collection if provided
  if (cleanEmail) {
    const existingByEmail = await mongoDb.collection('students').findOne({ email: cleanEmail });
    if (existingByEmail) {
      throw new Error(`Student with email '${cleanEmail}' already exists.`);
    }
  }

  let finalStatus: 'active' | 'revoked' | 'pending' = status || 'active';
  const reqApproval: any = approved ?? isApproved;
  if (reqApproval === 'no' || reqApproval === 'disapproved' || reqApproval === 'rejected' || reqApproval === false) {
    finalStatus = 'revoked';
  } else if (reqApproval === 'pending') {
    finalStatus = 'pending';
  }

  const newStudentDoc: any = {
    _id: cleanSid,
    sid: cleanSid,
    name: name.trim(),
    email: cleanEmail,
    password: password || 'student123', // plaintext per instructions
    phone: cleanPhone,
    status: finalStatus,
    isApproved: finalStatus === 'active',
    college: college || '',
    hscBatch: hscBatch || '',
    group: group || '',
    subject: subject || '',
    guardiansPhone: guardiansPhone || '',
    address: address || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await mongoDb.collection('students').insertOne(newStudentDoc);

  return formatStudentDoc(newStudentDoc);
}

/**
 * Update student profile in normalized students collection
 */
export async function updateStudent(sid: string, data: Partial<Student>): Promise<Student> {
  const { name, college, hscBatch, subject, group, phone, mobile, guardiansPhone, address, email, password, status, approved, isApproved } = data;
  const cleanSid = String(sid).trim().toUpperCase();

  if (isAdminUser({ sid: cleanSid, name, email })) {
    throw new Error('Cannot update administrator account via student endpoint.');
  }

  const mongoDb = await getMongoDb();
  const studentsCol = mongoDb.collection('students');

  const updateFields: any = { updatedAt: new Date() };
  if (name !== undefined) updateFields.name = String(name).trim();
  if (college !== undefined) updateFields.college = college || '';
  if (hscBatch !== undefined) updateFields.hscBatch = hscBatch || '';
  if (subject !== undefined) updateFields.subject = subject || '';
  if (group !== undefined) updateFields.group = group || '';
  if (phone !== undefined || mobile !== undefined) {
    updateFields.phone = (phone || mobile || '').trim();
  }
  if (guardiansPhone !== undefined) updateFields.guardiansPhone = guardiansPhone || '';
  if (address !== undefined) updateFields.address = address || '';
  if (email !== undefined) updateFields.email = String(email).trim().toLowerCase();
  if (password !== undefined) updateFields.password = password;

  const reqStatus = status;
  const reqApproval: any = approved !== undefined ? approved : isApproved;
  if (reqStatus !== undefined) {
    updateFields.status = reqStatus;
  } else if (reqApproval !== undefined) {
    if (reqApproval === 'no' || reqApproval === 'disapproved' || reqApproval === 'rejected' || reqApproval === false) {
      updateFields.status = 'revoked';
    } else if (reqApproval === 'pending') {
      updateFields.status = 'pending';
    } else {
      updateFields.status = 'active';
    }
  }

  if (updateFields.status !== undefined) {
    updateFields.isApproved = updateFields.status === 'active';
  }

  let result = await (studentsCol as any).findOneAndUpdate(
    {
      $or: [
        { sid: cleanSid },
        { _id: cleanSid },
        { sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } }
      ]
    },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    // Upsert if missing
    const newDoc: any = {
      _id: cleanSid,
      sid: cleanSid,
      name: name || 'Student',
      email: email ? String(email).trim().toLowerCase() : '',
      phone: (phone || mobile || '').trim(),
      password: password || 'student123',
      status: updateFields.status || 'active',
      isApproved: (updateFields.status || 'active') === 'active',
      college: college || '',
      hscBatch: hscBatch || '',
      subject: subject || '',
      group: group || '',
      guardiansPhone: guardiansPhone || '',
      address: address || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await studentsCol.insertOne(newDoc);
    return formatStudentDoc(newDoc);
  }

  return formatStudentDoc(result);
}

/**
 * Delete student and cascade delete activities, exams, and payments referencing their ObjectId or SID
 */
export async function deleteStudent(sid: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  const cleanSid = String(sid).trim().toUpperCase();

  // Find student doc to get ObjectId
  const student = await mongoDb.collection('students').findOne({
    $or: [
      { sid: cleanSid },
      { sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } }
    ]
  });

  const studentObjId = student?._id;

  // Delete all referencing activity, exam, and payment records by ObjectId FK or SID
  const refClauses: any[] = [{ studentSid: cleanSid }];
  if (studentObjId) {
    refClauses.push({ studentId: studentObjId });
    refClauses.push({ studentId: String(studentObjId) });
  }

  await Promise.allSettled([
    mongoDb.collection('activities').deleteMany({ $or: refClauses }),
    mongoDb.collection('exams').deleteMany({ $or: refClauses }),
    mongoDb.collection('payments').deleteMany({ $or: refClauses }),
    mongoDb.collection('students').deleteOne({
      $or: [
        { sid: cleanSid },
        ...(studentObjId ? [{ _id: studentObjId }] : []),
      ]
    }),
  ]);

  return true;
}
