import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { AdminRegistrationSchema } from '@/lib/validation';
import { logAdminActivity } from '@/lib/logger';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') || '25', 10)));
    const offset = (page - 1) * limit;

    const isTrash = searchParams.get('trash') === 'true';
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'all';
    const food = searchParams.get('food') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Construct WHERE clause
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // Trash condition
    if (isTrash) {
      conditions.push('deleted_at IS NOT NULL');
    } else {
      conditions.push('deleted_at IS NULL');
    }

    // Search condition
    if (search) {
      conditions.push(
        '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR town LIKE ? OR post_code LIKE ?)'
      );
      const searchWild = `%${search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild, searchWild, searchWild);
    }

    // Status filter
    if (status !== 'all' && ['new', 'confirmed', 'cancelled'].includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    // Food filter
    if (food !== 'all' && ['Veg Food', 'Non Veg Food'].includes(food)) {
      conditions.push('food_preference = ?');
      params.push(food);
    }

    // Date range filter
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate safe sort columns
    let orderColumn = 'created_at';
    if (sortBy === 'name') orderColumn = 'first_name';
    else if (sortBy === 'status') orderColumn = 'status';
    else if (sortBy === 'town') orderColumn = 'town';
    else if (sortBy === 'food') orderColumn = 'food_preference';
    else if (sortBy === 'deleted_at' && isTrash) orderColumn = 'deleted_at';

    // Count total query
    const countSql = `SELECT COUNT(*) as total FROM registrations ${whereClause}`;
    const countRows = await query<RowDataPacket[]>(countSql, params);
    const total = Number(countRows[0]?.total || 0);

    // Data query
    const dataSql = `
      SELECT id, first_name, last_name, address, town, post_code, email, mobile, 
             food_preference, gdpr_consent, status, notes, deleted_at, created_at, updated_at
      FROM registrations
      ${whereClause}
      ORDER BY ${orderColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    // Note: limit and offset passed as numbers
    const dataParams = [...params, limit, offset];
    const rows = await query<RowDataPacket[]>(dataSql, dataParams);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Admin registrations list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve registrations' },
      { status: 500 }
    );
  }
}

// POST - Admin manually adds a guest registration
export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = AdminRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      first_name,
      last_name,
      address,
      town,
      post_code,
      email,
      mobile,
      food_preference,
      gdpr_consent,
      status,
      notes,
    } = parsed.data;

    // Check duplicate
    const existing = await query<RowDataPacket[]>(
      'SELECT id FROM registrations WHERE (email = ? OR mobile = ?) AND deleted_at IS NULL LIMIT 1',
      [email.toLowerCase(), mobile]
    );

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'A registration with this email or mobile already exists.',
        },
        { status: 409 }
      );
    }

    const res = await query<ResultSetHeader>(
      `INSERT INTO registrations 
       (first_name, last_name, address, town, post_code, email, mobile, food_preference, gdpr_consent, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name.trim(),
        last_name.trim(),
        address.trim(),
        town.trim(),
        post_code.trim().toUpperCase(),
        email.trim().toLowerCase(),
        mobile.trim(),
        food_preference,
        gdpr_consent ? 1 : 0,
        status || 'confirmed',
        notes || null,
      ]
    );

    const newId = res.insertId;

    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: session.email,
      action: 'REGISTRATION_CREATED',
      entityType: 'registration',
      entityId: newId,
      description: `Admin manually registered: ${first_name} ${last_name} (${email})`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Guest added successfully.',
        data: { id: newId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin add guest error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add guest registration' },
      { status: 500 }
    );
  }
}
