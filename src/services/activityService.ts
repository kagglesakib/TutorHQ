import { ObjectId } from 'mongodb';
import { getMongoDb, splitSubjectTopic, sanitizeDate, sanitizeDateString } from './db';
import { Activity } from '../types';
import { generateActivityId } from '../utils/id';
import { getRevokedStudentIds } from './revocationService';

const parseActivityMark = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

/**
 * Returns activities joined with student information, filtered for revoked students if requested
 */
export async function getActivities(options?: { includeRevoked?: boolean }): Promise<Activity[]> {
  const mongoDb = await getMongoDb();

  // Fetch all activities sorted by date descending
  const rawActivities = await mongoDb.collection('activities')
    .find({})
    .sort({ date: -1 })
    .toArray();

  // Fetch all students to build fast lookup maps by ObjectId and SID
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

  const formatted: Activity[] = [];

  for (const act of rawActivities) {
    let student: any = null;

    if (act.studentId) {
      student = studentByIdMap.get(String(act.studentId));
    }
    if (!student && act.studentSid) {
      student = studentBySidMap.get(String(act.studentSid).trim().toUpperCase());
    }

    // Check revocation filter
    if (!options?.includeRevoked && student) {
      if (revokedIds.has(String(student._id)) || (student.sid && revokedIds.has(String(student.sid).trim().toUpperCase()))) {
        continue;
      }
    }

    const subject = act.subject || (act.subjectTuitioned ? splitSubjectTopic(act.subjectTuitioned).subject : '');
    const topic = act.topic || (act.subjectTuitioned ? splitSubjectTopic(act.subjectTuitioned).topic : '');
    const displaySubjectTuitioned = topic ? `${subject} - ${topic}` : (subject || 'General Session');

    formatted.push({
      _id: String(act._id),
      aid: act.aid || String(act._id),
      studentId: act.studentId || (student ? student._id : undefined),
      studentSid: student?.sid || act.studentSid || '',
      studentName: student?.name || 'Student',
      date: act.date ? (act.date instanceof Date ? act.date.toISOString().split('T')[0] : String(act.date).replace(/"/g, '')) : '',
      status: act.status || 'Present',
      subject,
      topic,
      subjectTuitioned: displaySubjectTuitioned,
      hwMarks: parseActivityMark(act.hwMarks),
      cwMarks: parseActivityMark(act.cwMarks),
      comment: act.comment || '',
      createdAt: act.createdAt ? sanitizeDateString(act.createdAt) : undefined,
    });
  }

  return formatted;
}

/**
 * Creates a new activity referencing student's ObjectId
 */
export async function createActivity(data: Partial<Activity> & Record<string, any>): Promise<Activity> {
  const { aid, studentId, studentSid, date, status, subject, topic, subjectTuitioned, hwMarks, cwMarks, comment } = data;
  if ((!studentId && !studentSid) || !date || !status) {
    throw new Error('Student reference (studentId or studentSid), date, and status are required');
  }

  const mongoDb = await getMongoDb();
  let resolvedStudentObjId: ObjectId | null = null;
  let resolvedStudentSid = String(studentSid || '').trim().toUpperCase();
  let resolvedStudentName = 'Student';

  // Resolve student by studentId or studentSid
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
    // If student record not found, create an ObjectId so referential integrity isn't broken
    resolvedStudentObjId = new ObjectId();
  }

  // Split subject & topic
  let finalSubject = subject || '';
  let finalTopic = topic || '';
  if (!finalSubject && subjectTuitioned) {
    const split = splitSubjectTopic(subjectTuitioned);
    finalSubject = split.subject;
    finalTopic = split.topic;
  }

  const isAbsent = status === 'Absent';
  const activityId = aid || generateActivityId();
  const newActivityDoc: any = {
    _id: activityId,
    aid: activityId,
    studentId: resolvedStudentSid || String(studentId || ''),
    studentSid: resolvedStudentSid, // keep for backward-compat
    date: sanitizeDate(date),
    status,
    subject: isAbsent ? 'N/A' : (finalSubject || 'Tuition'),
    topic: isAbsent ? '' : (finalTopic || ''),
    hwMarks: isAbsent ? 0 : parseActivityMark(hwMarks),
    cwMarks: isAbsent ? 0 : parseActivityMark(cwMarks),
    comment: comment || '',
    createdAt: new Date(),
  };

  await mongoDb.collection('activities').insertOne(newActivityDoc);

  const displaySubjectTuitioned = finalTopic ? `${finalSubject} - ${finalTopic}` : finalSubject;

  return {
    _id: String(newActivityDoc._id),
    aid: newActivityDoc.aid,
    studentId: newActivityDoc.studentId,
    studentSid: resolvedStudentSid,
    studentName: resolvedStudentName,
    date: newActivityDoc.date instanceof Date ? newActivityDoc.date.toISOString().split('T')[0] : String(newActivityDoc.date),
    status,
    subject: newActivityDoc.subject,
    topic: newActivityDoc.topic,
    subjectTuitioned: displaySubjectTuitioned,
    hwMarks: newActivityDoc.hwMarks,
    cwMarks: newActivityDoc.cwMarks,
    comment: newActivityDoc.comment,
    createdAt: sanitizeDateString(newActivityDoc.createdAt),
  };
}

/**
 * Updates an activity by ID or AID
 */
export async function updateActivity(aidOrId: string, data: Partial<Activity> & Record<string, any>): Promise<Activity> {
  const { date, status, subject, topic, subjectTuitioned, hwMarks, cwMarks, comment } = data;
  const rawHw = hwMarks !== undefined ? hwMarks : data.hw_marks;
  const rawCw = cwMarks !== undefined ? cwMarks : data.cw_marks;

  if (!date || !status) {
    throw new Error('date and status are required');
  }

  let finalSubject = subject || '';
  let finalTopic = topic || '';
  const rawSubjectTopic = subjectTuitioned ?? data.subject_tuitioned;
  if ((!finalSubject || !finalTopic) && rawSubjectTopic) {
    const split = splitSubjectTopic(rawSubjectTopic);
    if (!finalSubject) finalSubject = split.subject;
    if (!finalTopic) finalTopic = split.topic;
  }

  const isAbsent = status === 'Absent';
  const updateFields: any = {
    date: sanitizeDate(date),
    status,
    subject: isAbsent ? 'N/A' : (finalSubject || 'Tuition'),
    topic: isAbsent ? '' : (finalTopic || ''),
    hwMarks: isAbsent ? 0 : parseActivityMark(rawHw),
    cwMarks: isAbsent ? 0 : parseActivityMark(rawCw),
    comment: comment || '',
    updatedAt: new Date(),
  };

  const mongoDb = await getMongoDb();
  const activitiesCol = mongoDb.collection('activities');

  const matchClauses: any[] = [{ aid: aidOrId }, { _id: aidOrId }];
  if (ObjectId.isValid(aidOrId)) {
    matchClauses.push({ _id: new ObjectId(aidOrId) });
  }

  const result = await activitiesCol.findOneAndUpdate(
    { $or: matchClauses },
    { $set: updateFields },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error(`Activity with identifier ${aidOrId} not found`);
  }

  const displaySubjectTuitioned = result.topic ? `${result.subject} - ${result.topic}` : result.subject;

  return {
    _id: String(result._id),
    aid: result.aid || String(result._id),
    studentId: result.studentId,
    studentSid: result.studentSid || '',
    date: result.date instanceof Date ? result.date.toISOString().split('T')[0] : String(result.date),
    status: result.status,
    subject: result.subject,
    topic: result.topic,
    subjectTuitioned: displaySubjectTuitioned,
    hwMarks: result.hwMarks,
    cwMarks: result.cwMarks,
    comment: result.comment,
    createdAt: sanitizeDateString(result.createdAt),
  };
}

/**
 * Deletes an activity
 */
export async function deleteActivity(aidOrId: string): Promise<boolean> {
  const mongoDb = await getMongoDb();
  const matchClauses: any[] = [{ aid: aidOrId }, { _id: aidOrId }];
  if (ObjectId.isValid(aidOrId)) {
    matchClauses.push({ _id: new ObjectId(aidOrId) });
  }

  await mongoDb.collection('activities').deleteOne({ $or: matchClauses });
  return true;
}
