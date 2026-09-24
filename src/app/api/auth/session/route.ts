import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const token = cookieToken || bearerToken;
    const session = verifySessionToken(token);

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const timeLeftMs = Math.max(0, session.expiresAt - Date.now());

    const rawStatus = (session.approved ?? session.isApproved) as any;
    const approved: 'yes' | 'no' | 'pending' = 
      rawStatus === 'yes' || rawStatus === 'approved' || rawStatus === true || session.userType === 'admin'
        ? 'yes'
        : rawStatus === 'no' || rawStatus === 'rejected' || rawStatus === 'disapproved' || rawStatus === false
        ? 'no'
        : 'pending';

    return NextResponse.json({
      authenticated: true,
      user: {
        name: session.name,
        email: session.email,
        phone: session.phone,
        sid: session.sid || '',
        userType: session.userType || 'admin',
        approved,
        isApproved: approved,
      },
      expiresAt: session.expiresAt,
      timeLeftMs,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}
