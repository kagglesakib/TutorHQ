import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '../../../../services/db';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '../../../../lib/auth';

function escapeRegex(str: string) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email: inputEmail, identifier, password, role } = body;

    const cleanEmail = String(inputEmail || identifier || '').trim();
    const cleanPassword = String(password || '').trim();
    const requestedRole: 'admin' | 'student' | undefined = role === 'admin' || role === 'student' ? role : undefined;

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: requestedRole === 'admin'
            ? 'Administrator Email and password are required.'
            : 'Student Email and password are required.' 
        },
        { status: 200 }
      );
    }

    const lowerEmail = cleanEmail.toLowerCase();
    const db = await getMongoDb();
    const adminsCol = db.collection('admins');
    const studentsCol = db.collection('students');

    // Helper: Find admin strictly by email
    const findAdmin = async () => {
      let found = await (adminsCol as any).findOne({
        $or: [
          { email: lowerEmail },
          { email: { $regex: new RegExp(`^${escapeRegex(cleanEmail)}$`, 'i') } },
        ],
      });

      // Auto-provision admin if default email used or admins collection is empty
      if (!found && lowerEmail === 'sakib1514817122@gmail.com') {
        const adminCount = typeof adminsCol.countDocuments === 'function' ? await adminsCol.countDocuments() : 0;
        if (adminCount === 0 || lowerEmail === 'sakib1514817122@gmail.com') {
          const newAdminDoc: any = {
            _id: 'ADMIN',
            email: 'sakib1514817122@gmail.com',
            password: cleanPassword,
            name: 'Sakibul Hasan',
            phone: '01516518418',
            status: 'active',
            isApproved: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await adminsCol.updateOne(
            { email: 'sakib1514817122@gmail.com' },
            { $set: newAdminDoc },
            { upsert: true }
          );
          found = newAdminDoc;
        }
      }
      return found;
    };

    // Helper: Find student strictly by email (no SID lookup)
    const findStudent = async () => {
      return await (studentsCol as any).findOne({
        $or: [
          { email: lowerEmail },
          { email: { $regex: new RegExp(`^${escapeRegex(cleanEmail)}$`, 'i') } },
        ],
      });
    };

    // Helper: Process admin authentication
    const authenticateAdmin = (admin: any) => {
      if (admin.password !== cleanPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid administrator password. Please check your credentials.' },
          { status: 200 }
        );
      }

      if (admin.status === 'revoked') {
        return NextResponse.json(
          { success: false, error: 'This administrator account has been deactivated.' },
          { status: 200 }
        );
      }

      const adminName = admin.name || 'Administrator';
      const adminEmail = admin.email || 'sakib1514817122@gmail.com';
      const adminPhone = admin.phone || '01516518418';
      const adminSid = admin.sid || admin._id || 'ADMIN';

      const { token, expiresAt } = createSessionToken({
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        sid: String(adminSid),
        userType: 'admin',
        approved: 'yes',
        isApproved: 'yes',
      });

      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful. Session active for 3 hours.',
        user: {
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          sid: String(adminSid),
          userType: 'admin',
          approved: 'yes',
          isApproved: 'yes',
        },
        expiresAt,
        token,
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Math.floor(SESSION_DURATION_MS / 1000),
      });

      return response;
    };

    // Helper: Process student authentication
    const authenticateStudent = (student: any) => {
      if (student.password !== cleanPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid Student Password. Please check your credentials.' },
          { status: 200 }
        );
      }

      const status = student.status || 'pending';
      if (status === 'revoked') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Your student account access has been revoked by the administrator. Please contact your tutor.' 
          },
          { status: 200 }
        );
      }

      if (status === 'pending') {
        return NextResponse.json(
          { 
            success: false, 
            error: `⏳ Your student registration (${student.email || cleanEmail}) is currently awaiting admin verification and approval.` 
          },
          { status: 200 }
        );
      }

      const sid = student.sid || String(student._id) || '';
      const email = student.email || '';
      const name = student.name || 'Student';
      const phone = student.phone || student.mobile || '';

      const { token, expiresAt } = createSessionToken({
        name,
        email,
        phone,
        sid,
        userType: 'student',
        approved: 'yes',
        isApproved: 'yes',
      });

      const response = NextResponse.json({
        success: true,
        message: 'Student login successful. Session active for 3 hours.',
        user: {
          name,
          email,
          phone,
          sid,
          userType: 'student',
          approved: 'yes',
          isApproved: 'yes',
          college: student.college || '',
          hscBatch: student.hscBatch || '',
          subject: student.subject || '',
        },
        expiresAt,
        token,
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Math.floor(SESSION_DURATION_MS / 1000),
      });

      return response;
    };

    // 1. Explicit Admin Login
    if (requestedRole === 'admin') {
      const admin = await findAdmin();
      if (admin) {
        return authenticateAdmin(admin);
      }
      
      // Check if user is trying to log in with a student account
      const studentMatch = await findStudent();
      if (studentMatch) {
        return NextResponse.json(
          { 
            success: false, 
            error: `This email (${studentMatch.email || cleanEmail}) is registered as a Student. Please switch to the "Student Login" tab.` 
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: `No administrator account found with email '${cleanEmail}'.` },
        { status: 200 }
      );
    }

    // 2. Explicit Student Login
    if (requestedRole === 'student') {
      const student = await findStudent();
      if (student) {
        return authenticateStudent(student);
      }

      // Check if user is an admin trying student login
      const adminMatch = await findAdmin();
      if (adminMatch) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'This email belongs to an Administrator. Please switch to the "Admin Login" tab.' 
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: `No student account found with email '${cleanEmail}'. Please verify your email or register for an account.` },
        { status: 200 }
      );
    }

    // 3. Backward-Compatible Automatic Resolution
    const admin = await findAdmin();
    if (admin && admin.password === cleanPassword) {
      return authenticateAdmin(admin);
    }

    const student = await findStudent();
    if (student) {
      return authenticateStudent(student);
    }

    if (admin) {
      return authenticateAdmin(admin);
    }

    return NextResponse.json(
      { success: false, error: `No account found with email '${cleanEmail}'. Please check your credentials.` },
      { status: 200 }
    );

  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an unexpected error.' },
      { status: 500 }
    );
  }
}
