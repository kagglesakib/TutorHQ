import { ObjectId } from 'mongodb';
import { getMongoDb, sanitizeDate, sanitizeDateString } from './db';
import { Payment } from '../types';
import { generatePaymentId } from '../utils/id';

export async function getPayments(): Promise<Payment[]> {
  const mongoDb = await getMongoDb();

  const rawPayments = await mongoDb.collection('payments')
    .find({})
    .sort({ date: -1 })
    .toArray();

  const students = await mongoDb.collection('students').find({}).toArray();
  const studentByIdMap = new Map<string, any>();
  const studentBySidMap = new Map<string, any>();

  for (const s of students) {
    studentByIdMap.set(String(s._id), s);
    if (s.sid) {
      studentBySidMap.set(String(s.sid).trim().toUpperCase(), s);
    }
  }

  return rawPayments.map((p) => {
    let student: any = null;
    if (p.studentId) student = studentByIdMap.get(String(p.studentId));
    if (!student && p.studentSid) student = studentBySidMap.get(String(p.studentSid).trim().toUpperCase());

    return {
      _id: String(p._id),
      pid: p.pid || String(p._id),
      studentId: p.studentId || (student ? student._id : undefined),
      studentSid: student?.sid || p.studentSid || '',
      studentName: student?.name || 'Student',
      date: p.date ? (p.date instanceof Date ? p.date.toISOString().split('T')[0] : String(p.date).replace(/"/g, '')) : '',
      amount: Number(p.amount) || 0,
      paymentMonth: p.paymentMonth || '',
      comment: p.comment || '',
      createdAt: p.createdAt ? sanitizeDateString(p.createdAt) : undefined,
    };
  });
}

export async function createPayment(data: Partial<Payment> & Record<string, any>): Promise<Payment> {
  const { pid, studentId, studentSid, date, amount, paymentMonth, comment } = data;
  if ((!studentId && !studentSid) || !date || amount === undefined || !paymentMonth) {
    throw new Error('studentId or studentSid, date, amount, and paymentMonth are required');
  }

  const mongoDb = await getMongoDb();
  let resolvedStudentObjId: ObjectId | null = null;
  let resolvedStudentSid = String(studentSid || '').trim().toUpperCase();
  let resolvedStudentName = 'Student';

  if (studentId) {
    let query: any = { _id: studentId };
    if (typeof studentId === 'string' && ObjectId.isValid(studentId)) {
      query = { $or: [{ _id: new ObjectId(studentId) }, { _id: studentId }] };
    }
    const sDoc = await mongoDb.collection('students').findOne(query);
    if (sDoc) {
      resolvedStudentObjId = sDoc._id;
      resolvedStudentSid = sDoc.sid;
      resolvedStudentName = sDoc.name;
    }
  }

  if (!resolvedStudentObjId && studentSid) {
    const sDoc = await mongoDb.collection('students').findOne({
      $or: [
        { sid: resolvedStudentSid },
        { sid: { $regex: new RegExp(`^${resolvedStudentSid}$`, 'i') } }
      ]
    });
    if (sDoc) {
      resolvedStudentObjId = sDoc._id;
      resolvedStudentSid = sDoc.sid;
      resolvedStudentName = sDoc.name;
    }
  }

  if (!resolvedStudentObjId) {
    resolvedStudentObjId = new ObjectId();
  }

  const paymentId = pid || generatePaymentId();
  const newPaymentDoc: any = {
    _id: paymentId,
    pid: paymentId,
    studentId: resolvedStudentSid || String(studentId || ''),
    studentSid: resolvedStudentSid,
    date: sanitizeDate(date),
    amount: Number(amount),
    paymentMonth,
    comment: comment || '',
    createdAt: new Date(),
  };

  await mongoDb.collection('payments').insertOne(newPaymentDoc);

  return {
    _id: String(newPaymentDoc._id),
    pid: newPaymentDoc.pid,
    studentId: newPaymentDoc.studentId,
    studentSid: resolvedStudentSid,
    studentName: resolvedStudentName,
    date: newPaymentDoc.date instanceof Date ? newPaymentDoc.date.toISOString().split('T')[0] : String(newPaymentDoc.date),
    amount: newPaymentDoc.amount,
    paymentMonth: newPaymentDoc.paymentMonth,
    comment: newPaymentDoc.comment,
    createdAt: sanitizeDateString(newPaymentDoc.createdAt),
  };
}

export async function updatePayment(pidOrId: string, data: Partial<Payment> & Record<string, any>): Promise<Payment> {
  const { date, amount, paymentMonth, comment } = data;
  if (!date || amount === undefined || !paymentMonth) {
    throw new Error('date, amount, and paymentMonth are required');
  }

  const updateFields: any = {
    date: sanitizeDate(date),
    amount: Number(amount),
    paymentMonth,
    comment: comment || '',
    updatedAt: new Date(),
  };

  const mongoDb = await getMongoDb();
  const matchClauses: any[] = [{ pid: pidOrId }, { _id: pidOrId }];
  if (ObjectId.isValid(pidOrId)) {
    matchClauses.push({ _id: new ObjectId(pidOrId) });
  }

  const result = await mongoDb.collection('payments').findOneAndUpdate(
    { $or: matchClauses },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error(`Payment with identifier ${pidOrId} not found`);
  }

  return {
    _id: String(result._id),
    pid: result.pid || String(result._id),
    studentId: result.studentId,
    studentSid: result.studentSid || '',
    date: result.date instanceof Date ? result.date.toISOString().split('T')[0] : String(result.date),
    amount: result.amount,
    paymentMonth: result.paymentMonth,
    comment: result.comment,
    createdAt: sanitizeDateString(result.createdAt),
  };
}

export async function deletePayment(pidOrId: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  const matchClauses: any[] = [{ pid: pidOrId }, { _id: pidOrId }];
  if (ObjectId.isValid(pidOrId)) {
    matchClauses.push({ _id: new ObjectId(pidOrId) });
  }

  await mongoDb.collection('payments').deleteOne({ $or: matchClauses });
  return true;
}
