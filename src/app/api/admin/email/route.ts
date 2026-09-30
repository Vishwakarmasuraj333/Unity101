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
    const status = searchParams.get('status') || 'all';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (search) {
      conditions.push('(recipient LIKE ? OR subject LIKE ? OR message_id LIKE ?)');
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild);
    }

    if (status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    // Ensure email_logs table exists
    await query(`
      CREATE TABLE IF NOT EXISTS \`email_logs\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`email_type\` VARCHAR(50) NOT NULL,
        \`recipient\` VARCHAR(191) NOT NULL,
        \`subject\` VARCHAR(255) NOT NULL,
        \`status\` ENUM('sent', 'failed', 'simulated') NOT NULL DEFAULT 'sent',
        \`message_id\` VARCHAR(255) NULL,
        \`error_message\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_email_recipient\` (\`recipient\`),
        INDEX \`idx_email_status\` (\`status\`),
        INDEX \`idx_email_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM email_logs ${whereClause}`;
    const countRows = await query<RowDataPacket[]>(countSql, params);
    const total = countRows[0]?.total || 0;

    const offset = (page - 1) * limit;
    const dataSql = `
      SELECT id, email_type, recipient, subject, status, message_id, error_message, created_at
      FROM email_logs
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
    console.error('Email logs error:', error);
    return NextResponse.json({ success: false, message: 'Failed to retrieve email logs' }, { status: 500 });
  }
}
