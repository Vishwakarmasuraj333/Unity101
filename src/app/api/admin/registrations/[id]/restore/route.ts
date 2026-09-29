import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const regId = parseInt(id, 10);
  if (isNaN(regId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const existing = await query<RowDataPacket[]>(
      'SELECT id, first_name, last_name, email FROM registrations WHERE id = ? LIMIT 1',
      [regId]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    const item = existing[0];

    await query<ResultSetHeader>(
      'UPDATE registrations SET deleted_at = NULL WHERE id = ?',
      [regId]
    );

    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: session.email,
      action: 'REGISTRATION_RESTORED',
      entityType: 'registration',
      entityId: regId,
      description: `Restored registration #${regId} (${item.first_name} ${item.last_name}) from trash`,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration restored successfully.',
    });
  } catch (error) {
    console.error('Restore registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to restore registration' },
      { status: 500 }
    );
  }
}
