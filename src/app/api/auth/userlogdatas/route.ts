import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '../../../../services/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getMongoDb();
    // Smart DB Migration: Standardize isApproved values in database to [yes, no, pending]
    try {
      await db.collection('userlogdatas').updateMany(
        { isApproved: 'disapproved' },
        { $set: { isApproved: 'no' } }
      );
      await db.collection('userlogdatas').updateMany(
        {
          userType: 'student',
          $or: [
            { isApproved: { $exists: false } },
            { isApproved: null },
            { isApproved: '' },
          ],
        },
        { $set: { isApproved: 'pending' } }
      );
    } catch (e) {
      // Ignore migration errors if collection is empty
    }

    const userlogs = await db.collection('userlogdatas').find({}).toArray();
    const students = await db.collection('students').find({}).toArray();

    // Map student data by SID and email
    const studentBySid = new Map<string, any>();
    const studentByEmail = new Map<string, any>();
    
    let maxSidNum = 100;

    students.forEach((s) => {
      if (s.sid) {
        studentBySid.set(String(s.sid).toUpperCase(), s);
        const match = String(s.sid).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxSidNum) maxSidNum = num;
        }
      }
      if (s.email) {
        studentByEmail.set(String(s.email).toLowerCase(), s);
      }
    });

    userlogs.forEach((u) => {
      if (u.sid) {
        const match = String(u.sid).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxSidNum) maxSidNum = num;
        }
      }
    });

    const list = userlogs.map((ul) => {
      const emailKey = String(ul.email || '').toLowerCase();
      const sidKey = String(ul.sid || '').toUpperCase();

      const st = (sidKey && studentBySid.get(sidKey)) || (emailKey && studentByEmail.get(emailKey));

      return {
        _id: ul._id ? String(ul._id) : undefined,
        sid: ul.sid || st?.sid || '',
        email: ul.email,
        password: ul.password,
        isApproved: ul.isApproved === 'disapproved' ? 'no' : (ul.isApproved || (ul.userType === 'admin' ? 'yes' : 'pending')),
        userType: ul.userType || 'student',
        name: ul.name || st?.name || 'N/A',
        college: ul.college || st?.college || '',
        hscBatch: ul.hscBatch || st?.hscBatch || '',
        subject: ul.subject || st?.subject || '',
        group: ul.group || st?.group || '',
        mobile: ul.mobile || st?.mobile || ul.phone || '',
        guardiansPhone: ul.guardiansPhone || st?.guardiansPhone || '',
        address: ul.address || st?.address || '',
        createdAt: ul.createdAt || '',
      };
    });

    const suggestedNextSid = `S${maxSidNum + 1}`;

    return NextResponse.json({
      users: list,
      suggestedNextSid,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      sid,
      isApproved,
      userType,
      password,
      name,
      college,
      hscBatch,
      subject,
      group,
      mobile,
      guardiansPhone,
      address,
    } = body;

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanSid = sid !== undefined && sid !== null && String(sid).trim() !== '' 
      ? String(sid).trim().toUpperCase() 
      : undefined;

    if (!cleanEmail && !cleanSid) {
      return NextResponse.json({ error: 'Either email or sid identifier is required.' }, { status: 400 });
    }

    const db = await getMongoDb();
    const userlogCollection = db.collection('userlogdatas');
    const studentsCollection = db.collection('students');

    // 1. Find target user record by email or by SID
    const searchClauses: any[] = [];
    if (cleanEmail) {
      searchClauses.push({ email: cleanEmail });
    }
    if (cleanSid) {
      searchClauses.push({ sid: cleanSid });
      searchClauses.push({ sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } });
    }

    let targetUser = await userlogCollection.findOne({ $or: searchClauses });

    // Fallback: If not in userlogdatas by SID, check if student exists with this SID and find by that email
    if (!targetUser && cleanSid) {
      const studentDoc = await studentsCollection.findOne({
        $or: [{ sid: cleanSid }, { sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } }]
      });
      if (studentDoc && studentDoc.email) {
        targetUser = await userlogCollection.findOne({ email: String(studentDoc.email).toLowerCase() });
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User record not found in database.' }, { status: 404 });
    }

    const finalEmail = (targetUser.email || cleanEmail).toLowerCase();
    const finalUserType = userType || targetUser.userType || 'student';
    
    // Normalize isApproved value
    let finalIsApproved = targetUser.isApproved || 'pending';
    if (isApproved !== undefined) {
      if (isApproved === 'disapproved' || isApproved === 'no') {
        finalIsApproved = 'no';
      } else if (isApproved === 'yes') {
        finalIsApproved = 'yes';
      } else if (isApproved === 'pending') {
        finalIsApproved = 'pending';
      } else {
        finalIsApproved = isApproved;
      }
    }

    const finalSid = cleanSid !== undefined ? cleanSid : (targetUser.sid || '');

    // 2. Validate Approval Constraint: Admin MUST assign an SID when approving a student
    if (finalIsApproved === 'yes' && finalUserType === 'student' && !finalSid) {
      return NextResponse.json(
        { error: 'An SID must be assigned by Admin to approve a student account.' },
        { status: 400 }
      );
    }

    // 3. Validate SID Uniqueness if SID is provided and modified
    if (finalSid && cleanSid && cleanSid !== targetUser.sid) {
      // Check in userlogdatas (excluding current user)
      const existingUserWithSid = await userlogCollection.findOne({
        _id: { $ne: targetUser._id },
        sid: finalSid,
      });

      // Check in students (excluding current user's email)
      const existingStudentWithSid = await studentsCollection.findOne({
        email: { $ne: finalEmail },
        sid: finalSid,
      });

      if (existingUserWithSid || existingStudentWithSid) {
        const takenByName = existingUserWithSid?.name || existingStudentWithSid?.name || 'another student';
        return NextResponse.json(
          { error: `SID '${finalSid}' is already assigned to ${takenByName}. Please enter a unique SID.` },
          { status: 400 }
        );
      }
    }

    // 4. Update userlogdatas
    const updateFields: any = { updatedAt: new Date().toISOString() };
    if (cleanSid !== undefined) updateFields.sid = cleanSid;
    if (isApproved !== undefined) updateFields.isApproved = finalIsApproved;
    if (userType !== undefined) updateFields.userType = userType;
    if (password !== undefined) updateFields.password = password;
    if (name !== undefined) updateFields.name = String(name).trim();
    if (college !== undefined) updateFields.college = String(college).trim();
    if (hscBatch !== undefined) updateFields.hscBatch = String(hscBatch).trim();
    if (subject !== undefined) updateFields.subject = String(subject).trim();
    if (group !== undefined) updateFields.group = String(group).trim();
    if (mobile !== undefined) updateFields.mobile = String(mobile).trim();
    if (guardiansPhone !== undefined) updateFields.guardiansPhone = String(guardiansPhone).trim();
    if (address !== undefined) updateFields.address = String(address).trim();

    await userlogCollection.updateOne({ _id: targetUser._id }, { $set: updateFields });

    // 5. If approved as a student, create/update student record in 'students' collection
    if (finalIsApproved === 'yes' && finalUserType === 'student' && finalSid) {
      const studentDoc = {
        sid: finalSid,
        name: updateFields.name || targetUser.name || 'Student',
        college: updateFields.college !== undefined ? updateFields.college : targetUser.college || '',
        hscBatch: updateFields.hscBatch !== undefined ? updateFields.hscBatch : targetUser.hscBatch || '',
        subject: updateFields.subject !== undefined ? updateFields.subject : targetUser.subject || '',
        group: updateFields.group !== undefined ? updateFields.group : targetUser.group || '',
        mobile: updateFields.mobile !== undefined ? updateFields.mobile : targetUser.mobile || targetUser.phone || '',
        guardiansPhone: updateFields.guardiansPhone !== undefined ? updateFields.guardiansPhone : targetUser.guardiansPhone || '',
        address: updateFields.address !== undefined ? updateFields.address : targetUser.address || '',
        email: finalEmail,
        isApproved: 'yes',
        status: 'active',
        updatedAt: new Date().toISOString(),
      };

      await studentsCollection.updateOne(
        { $or: [{ sid: finalSid }, { email: finalEmail }] },
        {
          $set: studentDoc,
          $setOnInsert: { createdAt: new Date().toISOString() },
        },
        { upsert: true }
      );
    } else if (finalIsApproved === 'no') {
      // If revoked, mark student record as revoked in students collection
      const searchCriteria: any[] = [];
      if (finalSid) searchCriteria.push({ sid: finalSid });
      if (finalEmail) searchCriteria.push({ email: finalEmail });
      if (targetUser.sid) searchCriteria.push({ sid: targetUser.sid });
      if (targetUser.email) searchCriteria.push({ email: targetUser.email.toLowerCase() });

      if (searchCriteria.length > 0) {
        await studentsCollection.updateMany(
          { $or: searchCriteria },
          { $set: { isApproved: 'no', status: 'revoked', updatedAt: new Date().toISOString() } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `User record updated successfully. (SID: ${finalSid || 'N/A'}, Status: ${finalIsApproved})`,
      sid: finalSid,
      isApproved: finalIsApproved,
      userType: finalUserType,
    });
  } catch (err: any) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const sid = searchParams.get('sid');

    if (!email && !sid) {
      return NextResponse.json({ error: 'Either email or sid parameter is required.' }, { status: 400 });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanSid = sid ? sid.trim().toUpperCase() : '';

    const db = await getMongoDb();
    const clauses: any[] = [];
    if (cleanEmail) clauses.push({ email: cleanEmail });
    if (cleanSid) {
      clauses.push({ sid: cleanSid });
      clauses.push({ sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } });
    }

    const userDoc = await db.collection('userlogdatas').findOne({ $or: clauses });
    const studentDoc = await db.collection('students').findOne({ $or: clauses });

    const targetSid = userDoc?.sid || studentDoc?.sid || cleanSid;
    const targetEmail = userDoc?.email || studentDoc?.email || cleanEmail;

    if (targetSid) {
      const upperSid = targetSid.toUpperCase();
      await db.collection('activities').deleteMany({ $or: [{ studentSid: targetSid }, { studentSid: upperSid }] });
      await db.collection('exams').deleteMany({ $or: [{ studentSid: targetSid }, { studentSid: upperSid }] });
      await db.collection('payments').deleteMany({ $or: [{ studentSid: targetSid }, { studentSid: upperSid }] });
      await db.collection('students').deleteOne({ $or: [{ sid: targetSid }, { sid: upperSid }] });
    }

    if (targetEmail) {
      await db.collection('students').deleteOne({ email: targetEmail });
      await db.collection('userlogdatas').deleteOne({ email: targetEmail });
    }
    if (targetSid) {
      await db.collection('userlogdatas').deleteOne({ sid: targetSid });
    }
    if (userDoc?._id) {
      await db.collection('userlogdatas').deleteOne({ _id: userDoc._id });
    }

    return NextResponse.json({ success: true, message: 'User account and student records deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
