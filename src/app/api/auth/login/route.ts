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
    const { identifier, sid: inputSid, email: inputEmail, password, role } = body;

    const cleanIdentifier = String(identifier || inputSid || inputEmail || '').trim();
    const cleanPassword = String(password || '').trim();
    const requestedRole: 'admin' | 'student' | undefined = role === 'admin' || role === 'student' ? role : undefined;

    if (!cleanIdentifier || !cleanPassword) {
      return NextResponse.json(
        { 
          success: false, 
          error: requestedRole === 'admin'
            ? 'Administrator Email/ID and password are required.'
            : 'Student ID (SID) / Email and password are required.' 
        },
        { status: 200 }
      );
    }

    const lowerIdentifier = cleanIdentifier.toLowerCase();
    const upperIdentifier = cleanIdentifier.toUpperCase();
    const db = await getMongoDb();
    const adminsCol = db.collection('admins');
    const studentsCol = db.collection('students');

    // Helper: Find admin
    const findAdmin = async () => {
      let found = await (adminsCol as any).findOne({
        $or: [
          { email: lowerIdentifier },
          { email: cleanIdentifier },
          { _id: upperIdentifier },
          { _id: cleanIdentifier },
        ],
      });

      // Auto-provision admin if default email used or admins collection is empty
      if (!found && (lowerIdentifier === 'sakib1514817122@gmail.com' || upperIdentifier === 'ADMIN')) {
        const adminCount = typeof adminsCol.countDocuments === 'function' ? await adminsCol.countDocuments() : 0;
        if (adminCount === 0 || lowerIdentifier === 'sakib1514817122@gmail.com') {
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

    // Helper: Find student
    const findStudent = async () => {
      return await (studentsCol as any).findOne({
        $or: [
          { sid: upperIdentifier },
          { sid: cleanIdentifier },
          { _id: upperIdentifier },
          { _id: cleanIdentifier },
          { sid: { $regex: new RegExp(`^${escapeRegex(cleanIdentifier)}$`, 'i') } },
          { email: lowerIdentifier },
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
        const studentSid = student.sid || cleanIdentifier;
        return NextResponse.json(
          { 
            success: false, 
            error: `⏳ Your student registration (${studentSid || 'Pending SID'}) is currently awaiting admin verification and approval.` 
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
            error: `This account (${studentMatch.name || cleanIdentifier}) is registered as a Student. Please switch to the "Student Login" portal.` 
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'No administrator account found with this email or identifier.' },
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
            error: 'This account belongs to an Administrator. Please switch to the "Admin Login" portal.' 
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: `No student account found matching SID or Email '${cleanIdentifier}'. Please verify your credentials or register for an account.` },
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
      { success: false, error: `No account found matching '${cleanIdentifier}'. Please check your credentials.` },
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
