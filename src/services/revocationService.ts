import { getMongoDb } from './db';

/**
 * Returns a set of all student SIDs and ObjectIds whose access is revoked (status === 'revoked')
 */
export async function getRevokedStudentIds(): Promise<Set<string>> {
  try {
    const mongoDb = await getMongoDb();
    const revoked = new Set<string>();

    const revokedStudents = await mongoDb.collection('students')
      .find(
        {
          $or: [
            { status: 'revoked' },
            { approved: 'no' },
            { approved: 'disapproved' },
            { isApproved: 'no' },
            { isApproved: 'disapproved' },
            { isApproved: false },
          ]
        },
        { projection: { _id: 1, sid: 1 } }
      )
      .toArray();

    for (const s of revokedStudents) {
      if (s._id) revoked.add(String(s._id));
      if (s.sid && String(s.sid).trim()) {
        revoked.add(String(s.sid).trim().toUpperCase());
      }
    }

    return revoked;
  } catch (err) {
    console.error('Error fetching revoked student IDs:', err);
    return new Set<string>();
  }
}

export async function getRevokedStudentSids(): Promise<Set<string>> {
  return getRevokedStudentIds();
}

/**
 * Checks whether a specific student SID or email is revoked.
 */
export async function isStudentRevoked(sid?: string, email?: string): Promise<boolean> {
  if (!sid && !email) return false;
  try {
    const mongoDb = await getMongoDb();
    const clauses: any[] = [];
    if (sid) {
      const cleanSid = String(sid).trim().toUpperCase();
      clauses.push({ sid: cleanSid });
    }
    if (email) {
      clauses.push({ email: String(email).trim().toLowerCase() });
    }

    const student = await mongoDb.collection('students').findOne({
      $and: [
        { $or: clauses },
        {
          $or: [
            { status: 'revoked' },
            { approved: 'no' },
            { approved: 'disapproved' },
            { isApproved: 'no' },
            { isApproved: 'disapproved' },
            { isApproved: false },
          ]
        }
      ]
    });

    return !!student;
  } catch {
    return false;
  }
}
