import { NextRequest, NextResponse } from 'next/server';
import { getExams, createExam } from '../../../services/examService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const includeRevoked = request.nextUrl.searchParams.get('includeRevoked') === 'true';
    const list = await getExams({ includeRevoked });
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createExam(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
