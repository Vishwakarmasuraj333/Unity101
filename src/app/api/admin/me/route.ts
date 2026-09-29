import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const rows = await query<RowDataPacket[]>(
    'SELECT id, name, email, role, created_at FROM admins WHERE id = ? LIMIT 1',
    [session.adminId]
  );

  if (!rows || rows.length === 0) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    admin: rows[0],
  });
}
