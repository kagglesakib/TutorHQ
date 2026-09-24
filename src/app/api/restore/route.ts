import { NextRequest, NextResponse } from 'next/server';
import { restoreBackup } from '@/services/backupService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: any;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No backup file provided in upload.' }, { status: 400 });
      }
      const text = await file.text();
      try {
        payload = JSON.parse(text);
      } catch (parseErr: any) {
        return NextResponse.json(
          { error: `Corrupt or invalid JSON file: ${parseErr.message}` },
          { status: 400 }
        );
      }
    } else {
      try {
        payload = await request.json();
      } catch (parseErr: any) {
        return NextResponse.json(
          { error: `Malformed JSON request body: ${parseErr.message}` },
          { status: 400 }
        );
      }
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json({ error: 'Payload must be a valid JSON object.' }, { status: 400 });
    }

    const result = await restoreBackup(payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to restore database from backup file.' },
      { status: 500 }
    );
  }
}
