import { getMongoDb } from './db';

/**
 * Returns a set of all student SIDs (normalized to uppercase trimmed strings)
 * whose access has been revoked (isApproved === 'no' or 'disapproved' or status === 'revoked').
 */
export async function getRevokedStudentSids(): Promise<Set<string>> {
  try {
    const mongoDb = await getMongoDb();
    const revokedSids = new Set<string>();
    const revokedEmails = new Set<string>();

    // 1. Query userlogdatas where isApproved is 'no' or 'disapproved'
    const revokedUsers = await mongoDb.collection('userlogdatas')
      .find(
        {
          $or: [
            { isApproved: 'no' },
            { isApproved: 'disapproved' },
            { status: 'revoked' },
          ],
        },
        { projection: { sid: 1, email: 1, _id: 0 } }
      )
      .toArray();

    for (const u of revokedUsers) {
      if (u.sid && String(u.sid).trim()) {
        revokedSids.add(String(u.sid).trim().toUpperCase());
      }
      if (u.email && String(u.email).trim()) {
        revokedEmails.add(String(u.email).trim().toLowerCase());
      }
    }

    // 2. Query students collection for any matching revoked emails or explicit isApproved: 'no' / status: 'revoked'
    const studentQueries: any[] = [
      { isApproved: 'no' },
      { isApproved: 'disapproved' },
      { status: 'revoked' },
    ];
    if (revokedEmails.size > 0) {
      studentQueries.push({ email: { $in: Array.from(revokedEmails) } });
    }

    const revokedStudents = await mongoDb.collection('students')
      .find(
        { $or: studentQueries },
        { projection: { sid: 1, _id: 0 } }
      )
      .toArray();

    for (const s of revokedStudents) {
      if (s.sid && String(s.sid).trim()) {
        revokedSids.add(String(s.sid).trim().toUpperCase());
      }
    }

    return revokedSids;
  } catch (err) {
    console.error('Error fetching revoked student SIDs:', err);
    return new Set<string>();
  }
}

/**
 * Checks whether a specific student SID or email is currently revoked.
 */
export async function isStudentRevoked(sid?: string, email?: string): Promise<boolean> {
  if (!sid && !email) return false;
  const revokedSids = await getRevokedStudentSids();
  if (sid && revokedSids.has(String(sid).trim().toUpperCase())) {
    return true;
  }
  return false;
}
