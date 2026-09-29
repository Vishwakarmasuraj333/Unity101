import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RegistrationSchema } from '@/lib/validation';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { logAdminActivity } from '@/lib/logger';
import { getAdminSession } from '@/lib/auth';

// POST /api/registrations - Public Registration Submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Server Validation
    const validationResult = RegistrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please correct the highlighted fields.',
          errors: validationResult.error.flatten().fieldErrors,
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
    } = validationResult.data;

    // 2. Duplicate Check (Active registrations)
    const existing = await query<RowDataPacket[]>(
      `SELECT id, email, mobile FROM registrations 
       WHERE (email = ? OR mobile = ?) AND deleted_at IS NULL 
       LIMIT 1`,
      [email.toLowerCase(), mobile]
    );

    if (existing && existing.length > 0) {
      const match = existing[0];
      const conflictField =
        match.email.toLowerCase() === email.toLowerCase() ? 'email' : 'mobile number';
      return NextResponse.json(
        {
          success: false,
          message: `A registration with this ${conflictField} already exists. If you need to make changes, please contact the event team.`,
        },
        { status: 409 }
      );
    }

    // 3. Insert into MySQL
    const insertResult = await query<ResultSetHeader>(
      `INSERT INTO registrations 
       (first_name, last_name, address, town, post_code, email, mobile, food_preference, gdpr_consent, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
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
      ]
    );

    const newId = insertResult.insertId;

    // 4. Audit Log
    await logAdminActivity({
      action: 'REGISTRATION_CREATED',
      entityType: 'registration',
      entityId: newId,
      description: `New guest registration: ${first_name} ${last_name} (${email}, ${food_preference})`,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully.',
        data: {
          id: newId,
          first_name,
          last_name,
          email,
          food_preference,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'A server error occurred while processing your registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

// GET /api/registrations - Admin query endpoint
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM registrations WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100'
  );
  return NextResponse.json({ success: true, data: rows });
}
