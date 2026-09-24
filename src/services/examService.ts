import { ObjectId } from 'mongodb';
import { getMongoDb, splitSubjectTopic, sanitizeDate, sanitizeDateString } from './db';
import { Exam } from '../types';
import { generateExamId } from '../utils/id';
import { getRevokedStudentIds } from './revocationService';

export async function getExams(options?: { includeRevoked?: boolean }): Promise<Exam[]> {
  const mongoDb = await getMongoDb();

  const rawExams = await mongoDb.collection('exams')
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

  const revokedIds = await getRevokedStudentIds();
  const formatted: Exam[] = [];

  for (const ex of rawExams) {
    let student: any = null;

    if (ex.studentId) {
      student = studentByIdMap.get(String(ex.studentId));
    }
    if (!student && ex.studentSid) {
      student = studentBySidMap.get(String(ex.studentSid).trim().toUpperCase());
    }

    if (!options?.includeRevoked && student) {
      if (revokedIds.has(String(student._id)) || (student.sid && revokedIds.has(String(student.sid).trim().toUpperCase()))) {
        continue;
      }
    }

    const subject = ex.subject || (ex.subjectAndTopic ? splitSubjectTopic(ex.subjectAndTopic).subject : '');
    const topic = ex.topic || (ex.subjectAndTopic ? splitSubjectTopic(ex.subjectAndTopic).topic : '');
    const displaySubjectTopic = topic ? `${subject} - ${topic}` : (subject || 'General Assessment');

    formatted.push({
      _id: String(ex._id),
      eid: ex.eid || String(ex._id),
      studentId: ex.studentId || (student ? student._id : undefined),
      studentSid: student?.sid || ex.studentSid || '',
      studentName: student?.name || 'Student',
      date: ex.date ? (ex.date instanceof Date ? ex.date.toISOString().split('T')[0] : String(ex.date).replace(/"/g, '')) : '',
      subject,
      topic,
      subjectAndTopic: displaySubjectTopic,
      status: ex.status || (ex.obtainedMarks !== undefined && ex.obtainedMarks !== null ? 'Present' : 'Absent'),
      totalMarks: Number(ex.totalMarks) || 100,
      obtainedMarks: ex.obtainedMarks !== undefined && ex.obtainedMarks !== null ? Number(ex.obtainedMarks) : null,
      remarks: ex.remarks || '',
      comment: ex.comment || '',
      createdAt: ex.createdAt ? sanitizeDateString(ex.createdAt) : undefined,
    });
  }

  return formatted;
}

export async function createExam(data: Partial<Exam> & Record<string, any>): Promise<Exam> {
  const { eid, studentId, studentSid, date, subject, topic, subjectAndTopic, status, totalMarks, obtainedMarks, remarks, comment } = data;
  if ((!studentId && !studentSid) || !date || totalMarks === undefined) {
    throw new Error('studentId or studentSid, date, and totalMarks are required');
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

  let finalSubject = subject || '';
  let finalTopic = topic || '';
  if (!finalSubject && subjectAndTopic) {
    const split = splitSubjectTopic(subjectAndTopic);
    finalSubject = split.subject;
    finalTopic = split.topic;
  }

  const examStatus = status || 'Present';
  const isAbsent = examStatus === 'Absent';
  const examId = eid || generateExamId();
  const newExamDoc: any = {
    _id: examId,
    eid: examId,
    studentId: resolvedStudentSid || String(studentId || ''),
    studentSid: resolvedStudentSid,
    date: sanitizeDate(date),
    subject: finalSubject || 'Exam',
    topic: finalTopic || '',
    status: examStatus,
    totalMarks: Number(totalMarks),
    obtainedMarks: isAbsent ? 0 : (obtainedMarks !== undefined && obtainedMarks !== null ? Number(obtainedMarks) : null),
    remarks: remarks || '',
    comment: comment || '',
    createdAt: new Date(),
  };

  await mongoDb.collection('exams').insertOne(newExamDoc);

  const displaySubjectTopic = finalTopic ? `${finalSubject} - ${finalTopic}` : finalSubject;

  return {
    _id: String(newExamDoc._id),
    eid: newExamDoc.eid,
    studentId: newExamDoc.studentId,
    studentSid: resolvedStudentSid,
    studentName: resolvedStudentName,
    date: newExamDoc.date instanceof Date ? newExamDoc.date.toISOString().split('T')[0] : String(newExamDoc.date),
    subject: newExamDoc.subject,
    topic: newExamDoc.topic,
    subjectAndTopic: displaySubjectTopic,
    status: examStatus,
    totalMarks: newExamDoc.totalMarks,
    obtainedMarks: newExamDoc.obtainedMarks,
    remarks: newExamDoc.remarks,
    comment: newExamDoc.comment,
    createdAt: sanitizeDateString(newExamDoc.createdAt),
  };
}

export async function updateExam(eidOrId: string, data: Partial<Exam> & Record<string, any>): Promise<Exam> {
  const { date, subject, topic, subjectAndTopic, status, totalMarks, obtainedMarks, remarks, comment } = data;
  if (!date || totalMarks === undefined) {
    throw new Error('date and totalMarks are required');
  }

  let finalSubject = subject || '';
  let finalTopic = topic || '';
  const rawSubjectTopic = subjectAndTopic ?? data.subject_and_topic;
  if ((!finalSubject || !finalTopic) && rawSubjectTopic) {
    const split = splitSubjectTopic(rawSubjectTopic);
    if (!finalSubject) finalSubject = split.subject;
    if (!finalTopic) finalTopic = split.topic;
  }

  const examStatus = status || 'Present';
  const isAbsent = examStatus === 'Absent';
  const updateFields: any = {
    date: sanitizeDate(date),
    subject: finalSubject || 'Exam',
    topic: finalTopic || '',
    status: examStatus,
    totalMarks: Number(totalMarks),
    obtainedMarks: isAbsent ? 0 : (obtainedMarks !== undefined && obtainedMarks !== null ? Number(obtainedMarks) : null),
    remarks: remarks || '',
    comment: comment || '',
    updatedAt: new Date(),
  };

  const mongoDb = await getMongoDb();
  const matchClauses: any[] = [{ eid: eidOrId }, { _id: eidOrId }];
  if (ObjectId.isValid(eidOrId)) {
    matchClauses.push({ _id: new ObjectId(eidOrId) });
  }

  const result = await mongoDb.collection('exams').findOneAndUpdate(
    { $or: matchClauses },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error(`Exam with identifier ${eidOrId} not found`);
  }

  const displaySubjectTopic = result.topic ? `${result.subject} - ${result.topic}` : result.subject;

  return {
    _id: String(result._id),
    eid: result.eid || String(result._id),
    studentId: result.studentId,
    studentSid: result.studentSid || '',
    date: result.date instanceof Date ? result.date.toISOString().split('T')[0] : String(result.date),
    subject: result.subject,
    topic: result.topic,
    subjectAndTopic: displaySubjectTopic,
    status: result.status,
    totalMarks: result.totalMarks,
    obtainedMarks: result.obtainedMarks,
    remarks: result.remarks,
    comment: result.comment,
    createdAt: sanitizeDateString(result.createdAt),
  };
}

export async function deleteExam(eidOrId: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  const matchClauses: any[] = [{ eid: eidOrId }, { _id: eidOrId }];
  if (ObjectId.isValid(eidOrId)) {
    matchClauses.push({ _id: new ObjectId(eidOrId) });
  }

  await mongoDb.collection('exams').deleteOne({ $or: matchClauses });
  return true;
}
