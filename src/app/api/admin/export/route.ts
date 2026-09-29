import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket } from 'mysql2';

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all';
    const food = searchParams.get('food') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const isTrash = searchParams.get('trash') === 'true';

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (ids) {
      const idList = ids.split(',').map((id) => parseInt(id.trim(), 10)).filter((id) => !isNaN(id));
      if (idList.length > 0) {
        conditions.push(`id IN (${idList.map(() => '?').join(',')})`);
        params.push(...idList);
      }
    } else {
      if (isTrash) {
        conditions.push('deleted_at IS NOT NULL');
      } else {
        conditions.push('deleted_at IS NULL');
      }

      if (search) {
        conditions.push(
          '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR town LIKE ? OR post_code LIKE ?)'
        );
        const searchWild = `%${search}%`;
        params.push(searchWild, searchWild, searchWild, searchWild, searchWild, searchWild);
      }

      if (status !== 'all' && ['new', 'confirmed', 'cancelled'].includes(status)) {
        conditions.push('status = ?');
        params.push(status);
      }

      if (food !== 'all' && ['Veg Food', 'Non Veg Food'].includes(food)) {
        conditions.push('food_preference = ?');
        params.push(food);
      }

      if (dateRange === 'today') {
        conditions.push('DATE(created_at) = CURDATE()');
      } else if (dateRange === '7days') {
        conditions.push('created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
      } else if (dateRange === '30days') {
        conditions.push('created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)');
      } else if (dateRange === 'custom' && startDate && endDate) {
        conditions.push('DATE(created_at) BETWEEN ? AND ?');
        params.push(startDate, endDate);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT id, first_name, last_name, address, town, post_code, email, mobile,
             food_preference, gdpr_consent, status, notes, created_at, updated_at
      FROM registrations
      ${whereClause}
      ORDER BY id ASC
    `;

    const rows = await query<RowDataPacket[]>(sql, params);

    // Build CSV Content
    const headers = [
      'Registration ID',
      'First Name',
      'Last Name',
      'Address',
      'Town',
      'Post Code',
      'Email',
      'Mobile Phone',
      'Food Preference',
      'GDPR Consent',
      'Status',
      'Notes',
      'Registered Date',
      'Last Updated',
    ];

    const csvLines = [headers.map(escapeCsvField).join(',')];

    for (const r of rows) {
      csvLines.push(
        [
          r.id,
          r.first_name,
          r.last_name,
          r.address,
          r.town,
          r.post_code,
          r.email,
          r.mobile,
          r.food_preference,
          r.gdpr_consent ? 'Yes' : 'No',
          r.status,
          r.notes || '',
          r.created_at,
          r.updated_at,
        ]
          .map(escapeCsvField)
          .join(',')
      );
    }

    const csvOutput = '\uFEFF' + csvLines.join('\r\n'); // Add UTF-8 BOM for Excel compatibility

    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: session.email,
      action: 'EXPORT_CREATED',
      entityType: 'export',
      description: `Exported ${rows.length} registration records to CSV`,
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `unity101_registrations_${dateStr}.csv`;

    return new NextResponse(csvOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate export file' }, { status: 500 });
  }
}
