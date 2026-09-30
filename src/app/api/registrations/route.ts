import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RegistrationSchema } from '@/lib/validation';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { logAdminActivity } from '@/lib/logger';
import { getAdminSession } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import {
  sendGuestRegistrationConfirmationEmail,
  sendAdminNewRegistrationAlertEmail,
} from '@/lib/email';

// Helper to strip dangerous HTML / script tags from strings
function sanitizeString(str?: string): string {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '').trim();
}

// POST /api/registrations - Public Registration Submission
export async function POST(req: NextRequest) {
  try {
    // 0. Rate Limiting Protection (Max 10 submissions per 15 minutes per client IP)
    const clientIp = getClientIp(req);
    const limiter = rateLimit(`reg_${clientIp}`, { limit: 10, windowMs: 15 * 60 * 1000 });
    if (!limiter.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many registration requests submitted from your network. Please wait a few minutes before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(limiter.reset - Math.ceil(Date.now() / 1000)),
            'X-RateLimit-Limit': String(limiter.limit),
            'X-RateLimit-Remaining': String(limiter.remaining),
          },
        }
      );
    }

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

    // Sanitize text inputs
    const cleanFirstName = sanitizeString(first_name);
    const cleanLastName = sanitizeString(last_name);
    const cleanAddress = sanitizeString(address);
    const cleanTown = sanitizeString(town);
    const cleanPostCode = sanitizeString(post_code).toUpperCase();
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanMobile = sanitizeString(mobile);

    // 2. Duplicate Check (Active registrations)
    const existing = await query<RowDataPacket[]>(
      `SELECT id, email, mobile FROM registrations 
       WHERE (email = ? OR mobile = ?) AND deleted_at IS NULL 
       LIMIT 1`,
      [cleanEmail, cleanMobile]
    );

    if (existing && existing.length > 0) {
      const match = existing[0];
      const conflictField =
        match.email.toLowerCase() === cleanEmail ? 'email' : 'mobile number';
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
        cleanFirstName,
        cleanLastName,
        cleanAddress,
        cleanTown,
        cleanPostCode,
        cleanEmail,
        cleanMobile,
        food_preference,
        gdpr_consent ? 1 : 0,
      ]
    );

    const newId = insertResult.insertId;
    const refCode = `U101-${String(newId).padStart(5, '0')}`;

    // 4. Audit Log
    await logAdminActivity({
      action: 'REGISTRATION_CREATED',
      entityType: 'registration',
      entityId: newId,
      description: `New guest registration: ${cleanFirstName} ${cleanLastName} (${cleanEmail}, ${food_preference}) [Ref: ${refCode}]`,
    });

    // 5. Automated Email Notifications (Asynchronous dispatch, never blocks user response)
    const emailData = {
      id: newId,
      first_name: cleanFirstName,
      last_name: cleanLastName,
      email: cleanEmail,
      mobile: cleanMobile,
      address: cleanAddress,
      town: cleanTown,
      post_code: cleanPostCode,
      food_preference,
    };

    Promise.allSettled([
      sendGuestRegistrationConfirmationEmail(emailData),
      sendAdminNewRegistrationAlertEmail(emailData),
    ]).catch((err) => {
      console.warn('Background email dispatch notice:', err);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Registration completed successfully.',
        data: {
          id: newId,
          reference: refCode,
          first_name: cleanFirstName,
          last_name: cleanLastName,
          email: cleanEmail,
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
