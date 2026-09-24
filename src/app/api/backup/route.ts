import { NextRequest, NextResponse } from 'next/server';
import { generateBackup } from '@/services/backupService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const backup = await generateBackup();
    const url = new URL(req.url);
    const isDownload = url.searchParams.get('download') === '1' || url.searchParams.get('download') === 'true';

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `tutorhq-backup-${dateStr}.json`;

    if (isDownload) {
      return new NextResponse(JSON.stringify(backup, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    return NextResponse.json(backup, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Backup generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate database backup' },
      { status: 500 }
    );
  }
}
