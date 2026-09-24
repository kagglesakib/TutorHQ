import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb, sanitizeDateString } from '../../../../services/db';

export const dynamic = 'force-dynamic';

function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    const db = await getMongoDb();
    const adminsCol = db.collection('admins');
    const studentsCol = db.collection('students');

    const [admins, students] = await Promise.all([
      adminsCol.find({}).toArray(),
      studentsCol.find({}).toArray(),
    ]);

    let maxSidNum = 100;

    const formattedStudents = students.map((s: any) => {
      if (s.sid) {
        const match = String(s.sid).match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxSidNum) maxSidNum = num;
        }
      }

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
        email: s.email || '',
        password: s.password,
        approved: approvalVal,
        isApproved: approvalVal,
        status,
        userType: 'student',
        name: s.name || 'Student',
        college: s.college || '',
        hscBatch: s.hscBatch || '',
        subject: s.subject || '',
        group: s.group || '',
        phone,
        mobile: phone,
        guardiansPhone: s.guardiansPhone || '',
        address: s.address || '',
        createdAt: s.createdAt ? sanitizeDateString(s.createdAt) : '',
        updatedAt: s.updatedAt ? sanitizeDateString(s.updatedAt) : undefined,
      };
    });

    const formattedAdmins = admins.map((a: any) => {
      const phone = (a.phone || a.mobile || '').trim();
      return {
        _id: a._id ? String(a._id) : undefined,
        sid: 'ADMIN',
        email: a.email || '',
        password: a.password,
        approved: 'yes' as const,
        isApproved: 'yes' as const,
        status: (a.status || 'active') as 'active' | 'revoked' | 'pending',
        userType: 'admin',
        name: a.name || 'Sakibul Hasan',
        college: '',
        hscBatch: '',
        subject: '',
        group: '',
        phone,
        mobile: phone,
        guardiansPhone: '',
        address: '',
        createdAt: a.createdAt ? sanitizeDateString(a.createdAt) : '',
        updatedAt: a.updatedAt ? sanitizeDateString(a.updatedAt) : undefined,
      };
    });

    const suggestedNextSid = `S${maxSidNum + 1}`;

    return NextResponse.json({
      users: [...formattedAdmins, ...formattedStudents],
      suggestedNextSid,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      _id,
      originalSid,
      email,
      sid,
      approved,
      isApproved,
      userType,
      password,
      name,
      college,
      hscBatch,
      subject,
      group,
      phone,
      mobile,
      guardiansPhone,
      address,
      status,
    } = body;

    const rawId = id || _id;
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanSid = sid !== undefined && sid !== null 
      ? String(sid).trim().toUpperCase() 
      : undefined;
    const cleanOriginalSid = originalSid !== undefined && originalSid !== null && String(originalSid).trim() !== ''
      ? String(originalSid).trim().toUpperCase()
      : undefined;

    if (!rawId && !cleanEmail && !cleanSid && !cleanOriginalSid) {
      return NextResponse.json({ error: 'At least one identifier (id, email, or sid) is required.' }, { status: 400 });
    }

    const db = await getMongoDb();
    const adminsCol = db.collection('admins');
    const studentsCol = db.collection('students');

    // 1. Check if target is an Admin
    const isAdminTarget = userType === 'admin' || cleanSid === 'ADMIN' || cleanOriginalSid === 'ADMIN' || cleanEmail === 'sakib1514817122@gmail.com';
    let targetAdmin: any = null;

    if (isAdminTarget) {
      const adminClauses: any[] = [];
      if (rawId && ObjectId.isValid(rawId)) adminClauses.push({ _id: new ObjectId(rawId) });
      if (cleanEmail) adminClauses.push({ email: cleanEmail });
      adminClauses.push({ email: 'sakib1514817122@gmail.com' });

      targetAdmin = await adminsCol.findOne({ $or: adminClauses });
      if (targetAdmin) {
        const updateFields: any = { updatedAt: new Date() };
        if (name) updateFields.name = String(name).trim();
        if (password) updateFields.password = password;
        if (phone || mobile) updateFields.phone = String(phone || mobile).trim();
        if (cleanEmail) updateFields.email = cleanEmail;
        if (status) updateFields.status = status;

        await adminsCol.updateOne({ _id: targetAdmin._id }, { $set: updateFields });
        return NextResponse.json({
          success: true,
          message: 'Admin account updated successfully.',
          sid: 'ADMIN',
          approved: 'yes',
          isApproved: 'yes',
          userType: 'admin',
        });
      }
    }

    // 2. Search in students collection
    let targetStudent: any = null;

    if (rawId) {
      if (ObjectId.isValid(rawId)) {
        targetStudent = await studentsCol.findOne({ _id: new ObjectId(rawId) });
      }
      if (!targetStudent) {
        targetStudent = await studentsCol.findOne({ _id: rawId });
      }
    }

    if (!targetStudent && cleanOriginalSid) {
      targetStudent = await studentsCol.findOne({
        $or: [
          { sid: cleanOriginalSid },
          { sid: { $regex: new RegExp(`^${escapeRegex(cleanOriginalSid)}$`, 'i') } }
        ]
      });
    }

    if (!targetStudent && cleanSid) {
      targetStudent = await studentsCol.findOne({
        $or: [
          { sid: cleanSid },
          { sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } }
        ]
      });
    }

    if (!targetStudent && cleanEmail) {
      targetStudent = await studentsCol.findOne({ email: cleanEmail });
    }

    if (!targetStudent) {
      return NextResponse.json({ error: 'Student record not found in database.' }, { status: 404 });
    }

    // Determine normalized status & approval
    const reqStatus = status;
    const reqApproved = approved !== undefined ? approved : isApproved;
    let finalStatus: 'active' | 'revoked' | 'pending' = targetStudent.status || 'pending';

    if (reqStatus !== undefined) {
      finalStatus = reqStatus;
    } else if (reqApproved !== undefined) {
      if (reqApproved === 'disapproved' || reqApproved === 'no' || reqApproved === 'rejected' || reqApproved === false) {
        finalStatus = 'revoked';
      } else if (reqApproved === 'yes' || reqApproved === 'approved' || reqApproved === true) {
        finalStatus = 'active';
      } else if (reqApproved === 'pending') {
        finalStatus = 'pending';
      }
    }

    const finalSid = cleanSid !== undefined ? cleanSid : (targetStudent.sid || '');

    // Constraint: Admin MUST assign an SID when approving a student
    if (finalStatus === 'active' && !finalSid) {
      return NextResponse.json(
        { error: 'An SID must be assigned by Admin to approve a student account.' },
        { status: 400 }
      );
    }

    // Validate SID uniqueness if changed
    if (finalSid && finalSid !== targetStudent.sid) {
      const existingWithSid = await studentsCol.findOne({
        _id: { $ne: targetStudent._id },
        $or: [
          { sid: finalSid },
          { sid: { $regex: new RegExp(`^${escapeRegex(finalSid)}$`, 'i') } }
        ]
      });

      if (existingWithSid) {
        const takenByName = existingWithSid?.name || 'another student';
        return NextResponse.json(
          { error: `SID '${finalSid}' is already assigned to ${takenByName}. Please enter a unique SID.` },
          { status: 400 }
        );
      }
    }

    // Update students collection
    const updateFields: any = {
      updatedAt: new Date(),
      status: finalStatus,
    };

    if (cleanSid !== undefined) updateFields.sid = cleanSid;
    if (password !== undefined) updateFields.password = password;
    if (name !== undefined && String(name).trim() !== '') updateFields.name = String(name).trim();
    if (college !== undefined) updateFields.college = String(college).trim();
    if (hscBatch !== undefined) updateFields.hscBatch = String(hscBatch).trim();
    if (subject !== undefined) updateFields.subject = String(subject).trim();
    if (group !== undefined) updateFields.group = String(group).trim();
    if (phone !== undefined || mobile !== undefined) {
      updateFields.phone = String(phone || mobile).trim();
    }
    if (guardiansPhone !== undefined) updateFields.guardiansPhone = String(guardiansPhone).trim();
    if (address !== undefined) updateFields.address = String(address).trim();
    if (cleanEmail && cleanEmail !== targetStudent.email) updateFields.email = cleanEmail;

    await studentsCol.updateOne({ _id: targetStudent._id }, { $set: updateFields });

    const approvalResponse: 'yes' | 'no' | 'pending' = 
      finalStatus === 'revoked' ? 'no' : (finalStatus === 'pending' ? 'pending' : 'yes');

    return NextResponse.json({
      success: true,
      message: `Student account updated successfully. (SID: ${finalSid || 'Pending'}, Status: ${finalStatus})`,
      sid: finalSid,
      approved: approvalResponse,
      isApproved: approvalResponse,
      status: finalStatus,
      userType: 'student',
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
    const id = searchParams.get('id');

    if (!email && !sid && !id) {
      return NextResponse.json({ error: 'At least one identifier (id, email, or sid) is required.' }, { status: 400 });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanSid = sid ? sid.trim().toUpperCase() : '';

    if (cleanSid === 'ADMIN' || cleanEmail === 'sakib1514817122@gmail.com') {
      return NextResponse.json({ error: 'Primary administrator account cannot be deleted.' }, { status: 400 });
    }

    const db = await getMongoDb();
    const studentsCol = db.collection('students');
    const activitiesCol = db.collection('activities');
    const examsCol = db.collection('exams');
    const paymentsCol = db.collection('payments');

    const clauses: any[] = [];
    if (id && ObjectId.isValid(id)) clauses.push({ _id: new ObjectId(id) });
    if (cleanEmail) clauses.push({ email: cleanEmail });
    if (cleanSid) {
      clauses.push({ sid: cleanSid });
      clauses.push({ sid: { $regex: new RegExp(`^${escapeRegex(cleanSid)}$`, 'i') } });
    }

    const studentDoc = await studentsCol.findOne({ $or: clauses });
    if (studentDoc) {
      const studentObjId = studentDoc._id;
      const targetSid = studentDoc.sid || cleanSid;

      // Cascade delete student's activity, exam, and payment records
      const refClauses: any[] = [];
      if (studentObjId) {
        refClauses.push({ studentId: studentObjId });
        refClauses.push({ studentId: String(studentObjId) });
      }
      if (targetSid) {
        refClauses.push({ studentSid: targetSid });
        refClauses.push({ studentSid: targetSid.toUpperCase() });
      }

      if (refClauses.length > 0) {
        await Promise.allSettled([
          activitiesCol.deleteMany({ $or: refClauses }),
          examsCol.deleteMany({ $or: refClauses }),
          paymentsCol.deleteMany({ $or: refClauses }),
        ]);
      }

      await studentsCol.deleteOne({ _id: studentObjId });
    }

    return NextResponse.json({ success: true, message: 'Student account and related records deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
