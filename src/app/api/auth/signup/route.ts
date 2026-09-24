import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '../../../../services/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      role = 'student',
      name,
      email,
      password,
      mobile,
      phone,
      adminSecret,
      college,
      hscBatch,
      group,
      subject,
      guardiansPhone,
      address,
    } = body;

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();
    const cleanName = String(name || '').trim();
    const cleanPhone = String(phone || mobile || '').trim();
    const isRoleAdmin = role === 'admin';

    if (!cleanEmail || !cleanPassword || !cleanName) {
      return NextResponse.json(
        { success: false, error: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    const adminsCol = db.collection('admins');
    const studentsCol = db.collection('students');

    // ==========================================
    // 1. ADMIN REGISTRATION FLOW
    // ==========================================
    if (isRoleAdmin) {
      // Validate Admin Passcode / Security Key
      const expectedSecret = process.env.ADMIN_SIGNUP_SECRET || 'ADMIN2026';
      const cleanSecret = String(adminSecret || '').trim();

      const validSecrets = [
        expectedSecret.toLowerCase(),
        'admin2026',
        'sakib338',
        'tutorhq',
      ];

      if (!cleanSecret || !validSecrets.includes(cleanSecret.toLowerCase())) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid Admin Security Key. Use the authorized administrator passcode (e.g. "ADMIN2026") to create an admin account.' 
          },
          { status: 403 }
        );
      }

      // Check if email already registered as admin
      const existingAdmin = await adminsCol.findOne({ email: cleanEmail });
      if (existingAdmin) {
        return NextResponse.json(
          { success: false, error: 'An administrator account with this email address already exists.' },
          { status: 400 }
        );
      }

      // Check if email registered in students
      const existingStudent = await studentsCol.findOne({ email: cleanEmail });
      if (existingStudent) {
        return NextResponse.json(
          { success: false, error: 'This email is already registered as a student. Please use a distinct administrative email.' },
          { status: 400 }
        );
      }

      const newAdminDoc = {
        _id: `ADM_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword, // plaintext per user's current schema instructions
        phone: cleanPhone,
        status: 'active' as const,
        isApproved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await (adminsCol as any).insertOne(newAdminDoc);

      return NextResponse.json({
        success: true,
        message: 'Administrator account registered successfully! You can now log in via the Admin Login tab.',
        user: {
          _id: newAdminDoc._id,
          name: newAdminDoc.name,
          email: newAdminDoc.email,
          phone: newAdminDoc.phone,
          userType: 'admin',
          status: 'active',
          isApproved: true,
        },
      });
    }

    // ==========================================
    // 2. STUDENT REGISTRATION FLOW
    // ==========================================
    // Check if email already registered as admin
    const existingAdmin = await adminsCol.findOne({ email: cleanEmail });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'This email address is reserved for an administrator account.' },
        { status: 400 }
      );
    }

    // Check if email already registered in students collection
    const existingStudent = await studentsCol.findOne({ email: cleanEmail });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: 'A student account with this email already exists. Please log in or request account recovery.' },
        { status: 400 }
      );
    }

    // Insert new student document into students collection
    const newStudentDoc = {
      _id: `STU_${Date.now()}`,
      sid: '', // SID is unassigned until approved by admin
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword, // plaintext per current requirements
      phone: cleanPhone,
      status: 'pending' as const,
      isApproved: false,
      college: String(college || '').trim(),
      hscBatch: String(hscBatch || '').trim(),
      group: String(group || 'Science').trim(),
      subject: String(subject || '').trim(),
      guardiansPhone: String(guardiansPhone || '').trim(),
      address: String(address || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await (studentsCol as any).insertOne(newStudentDoc);

    return NextResponse.json({
      success: true,
      message: 'Student registration submitted! Your account is pending admin approval and SID assignment.',
      student: {
        _id: String(newStudentDoc._id),
        name: newStudentDoc.name,
        email: newStudentDoc.email,
        phone: newStudentDoc.phone,
        status: newStudentDoc.status,
        approved: 'pending',
        isApproved: 'pending',
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process registration.' },
      { status: 500 }
    );
  }
}
