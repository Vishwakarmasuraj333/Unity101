import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25', 10)));
    const search = searchParams.get('search')?.trim() || '';
    const action = searchParams.get('action') || 'all';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push('(action LIKE ? OR description LIKE ? OR admin_email LIKE ?)');
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (action !== 'all') {
      conditions.push('action = ?');
      params.push(action);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Check which table exists: audit_logs or admin_activity_logs
    let tableName = 'audit_logs';
    try {
      await query('SELECT 1 FROM audit_logs LIMIT 1');
    } catch {
      tableName = 'admin_activity_logs';
    }

    const countSql = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
    const countRows = await query<RowDataPacket[]>(countSql, params);
    const total = countRows[0]?.total || 0;

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT id, admin_id, admin_email, action, entity_type, entity_id, description, created_at
      FROM ${tableName}
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const logs = await query<RowDataPacket[]>(dataSql, [...params, limit, offset]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
