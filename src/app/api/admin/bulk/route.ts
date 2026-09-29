import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: 'No records selected' }, { status: 400 });
    }

    const sanitizedIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id) && id > 0);
    if (sanitizedIds.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid record IDs' }, { status: 400 });
    }

    const placeholders = sanitizedIds.map(() => '?').join(',');

    if (action === 'confirm') {
      await query<ResultSetHeader>(
        `UPDATE registrations SET status = 'confirmed', updated_at = NOW() WHERE id IN (${placeholders})`,
        sanitizedIds
      );
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'BULK_CONFIRMED',
        entityType: 'registration',
        description: `Bulk marked ${sanitizedIds.length} registration(s) as Confirmed`,
      });
      return NextResponse.json({ success: true, message: `Marked ${sanitizedIds.length} guest(s) as Confirmed` });
    }

    if (action === 'cancel') {
      await query<ResultSetHeader>(
        `UPDATE registrations SET status = 'cancelled', updated_at = NOW() WHERE id IN (${placeholders})`,
        sanitizedIds
      );
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'BULK_CANCELLED',
        entityType: 'registration',
        description: `Bulk marked ${sanitizedIds.length} registration(s) as Cancelled`,
      });
      return NextResponse.json({ success: true, message: `Marked ${sanitizedIds.length} guest(s) as Cancelled` });
    }

    if (action === 'soft_delete') {
      await query<ResultSetHeader>(
        `UPDATE registrations SET deleted_at = NOW() WHERE id IN (${placeholders})`,
        sanitizedIds
      );
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'BULK_DELETED',
        entityType: 'registration',
        description: `Bulk moved ${sanitizedIds.length} registration(s) to trash`,
      });
      return NextResponse.json({ success: true, message: `Moved ${sanitizedIds.length} registration(s) to trash` });
    }

    if (action === 'restore') {
      await query<ResultSetHeader>(
        `UPDATE registrations SET deleted_at = NULL WHERE id IN (${placeholders})`,
        sanitizedIds
      );
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'BULK_RESTORED',
        entityType: 'registration',
        description: `Bulk restored ${sanitizedIds.length} registration(s) from trash`,
      });
      return NextResponse.json({ success: true, message: `Restored ${sanitizedIds.length} registration(s)` });
    }

    if (action === 'permanent_delete') {
      await query<ResultSetHeader>(
        `DELETE FROM registrations WHERE id IN (${placeholders})`,
        sanitizedIds
      );
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'BULK_PERMANENT_DELETED',
        entityType: 'registration',
        description: `Permanently deleted ${sanitizedIds.length} registration(s)`,
      });
      return NextResponse.json({ success: true, message: `Permanently deleted ${sanitizedIds.length} registration(s)` });
    }

    return NextResponse.json({ success: false, message: 'Invalid bulk action specified' }, { status: 400 });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json({ success: false, message: 'Failed to execute bulk action' }, { status: 500 });
  }
}
