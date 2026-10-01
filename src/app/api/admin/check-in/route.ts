import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RegistrationRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  address: string;
  town: string;
  post_code: string;
  food_preference: string;
  status: string;
  notes: string | null;
  checked_in_at: string | null;
  created_at: string;
}

// Helper to extract clean reference or ID from raw QR scan or user string
function parseCode(raw: string): { refCode?: string; id?: number; searchStr: string } {
  const clean = raw.trim();

  // Pattern 1: UNITY101:21ST:U101-00012:Amina+Begum
  if (clean.includes('UNITY101:')) {
    const parts = clean.split(':');
    for (const part of parts) {
      const match = part.match(/U101-(\d+)/i);
      if (match) {
        return { refCode: `U101-${match[1]}`, id: parseInt(match[1], 10), searchStr: clean };
      }
    }
  }

  // Pattern 2: U101-00012 or U101-12
  const u101Match = clean.match(/U101-(\d+)/i);
  if (u101Match) {
    return { refCode: `U101-${u101Match[1]}`, id: parseInt(u101Match[1], 10), searchStr: clean };
  }

  // Pattern 3: Raw numeric ID (e.g. "12")
  if (/^\d{1,8}$/.test(clean)) {
    return { id: parseInt(clean, 10), searchStr: clean };
  }

  return { searchStr: clean };
}

// POST /api/admin/check-in - Process or Verify VIP Pass Check-In
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Admin credentials required.' }, { status: 401 });
    }

    const body = await req.json();
    const { code, action = 'check-in' } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, message: 'Please provide a valid QR Code or Reference Code.' }, { status: 400 });
    }

    const { id, searchStr } = parseCode(code);

    let rows: RegistrationRow[] = [];

    // 1. Search by ID if available
    if (id !== undefined && !isNaN(id)) {
      rows = await query<RegistrationRow[]>(
        `SELECT id, first_name, last_name, email, mobile, address, town, post_code, food_preference, status, notes, checked_in_at, created_at 
         FROM registrations 
         WHERE id = ? AND deleted_at IS NULL 
         LIMIT 1`,
        [id]
      );
    }

    // 2. Search by email or mobile if not found by ID
    if (rows.length === 0 && searchStr) {
      rows = await query<RegistrationRow[]>(
        `SELECT id, first_name, last_name, email, mobile, address, town, post_code, food_preference, status, notes, checked_in_at, created_at 
         FROM registrations 
         WHERE (email = ? OR mobile = ?) AND deleted_at IS NULL 
         LIMIT 1`,
        [searchStr.toLowerCase(), searchStr]
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          message: `No registration found matching "${code}". Please check the Reference Code or guest email.`,
        },
        { status: 404 }
      );
    }

    const guest = rows[0];
    const refCode = `U101-${String(guest.id).padStart(5, '0')}`;
    const isAlreadyCheckedIn = guest.status === 'attended' || Boolean(guest.checked_in_at);

    // Action: UNDO
    if (action === 'undo') {
      await query<ResultSetHeader>(
        `UPDATE registrations SET status = 'confirmed', checked_in_at = NULL WHERE id = ?`,
        [guest.id]
      );

      await logAdminActivity({
        action: 'CHECK_IN_REVERTED',
        entityType: 'registration',
        entityId: guest.id,
        description: `Check-in reverted by ${session.email} for ${guest.first_name} ${guest.last_name} (${refCode})`,
      });

      return NextResponse.json({
        success: true,
        action: 'undo',
        message: `Check-in reverted for ${guest.first_name} ${guest.last_name}.`,
        guest: {
          ...guest,
          reference: refCode,
          status: 'confirmed',
          checked_in_at: null,
        },
      });
    }

    // Action: VERIFY ONLY
    if (action === 'verify') {
      return NextResponse.json({
        success: true,
        action: 'verify',
        alreadyCheckedIn: isAlreadyCheckedIn,
        message: isAlreadyCheckedIn
          ? `Guest is already checked in (${guest.checked_in_at || 'Earlier'}).`
          : 'Valid registration found. Ready for check-in.',
        guest: {
          ...guest,
          reference: refCode,
        },
      });
    }

    // Action: CHECK-IN (DEFAULT)
    if (isAlreadyCheckedIn) {
      return NextResponse.json({
        success: false,
        alreadyCheckedIn: true,
        message: `⚠️ ALREADY CHECKED IN: ${guest.first_name} ${guest.last_name} was already checked in at ${guest.checked_in_at || 'Earlier'}.`,
        guest: {
          ...guest,
          reference: refCode,
        },
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();

    await query<ResultSetHeader>(
      `UPDATE registrations SET status = 'attended', checked_in_at = NOW() WHERE id = ?`,
      [guest.id]
    );

    await logAdminActivity({
      action: 'CHECK_IN_SUCCESS',
      entityType: 'registration',
      entityId: guest.id,
      description: `Gala Check-in processed by ${session.email}: ${guest.first_name} ${guest.last_name} (${refCode}) [${guest.food_preference}]`,
    });

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      message: `🎉 Welcome, ${guest.first_name}! Check-in verified successfully.`,
      guest: {
        ...guest,
        reference: refCode,
        status: 'attended',
        checked_in_at: nowIso,
      },
    });
  } catch (error) {
    console.error('Check-in processing error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing check-in. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/admin/check-in/stats - Get Live Attendance Metrics
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const totalRows = await query<RowDataPacket[]>(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'attended' OR checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as attended,
         SUM(CASE WHEN food_preference = 'Veg Food' AND (status = 'attended' OR checked_in_at IS NOT NULL) THEN 1 ELSE 0 END) as veg_attended,
         SUM(CASE WHEN food_preference = 'Non Veg Food' AND (status = 'attended' OR checked_in_at IS NOT NULL) THEN 1 ELSE 0 END) as non_veg_attended,
         SUM(CASE WHEN food_preference = 'Veg Food' THEN 1 ELSE 0 END) as veg_total,
         SUM(CASE WHEN food_preference = 'Non Veg Food' THEN 1 ELSE 0 END) as non_veg_total
       FROM registrations 
       WHERE deleted_at IS NULL`
    );

    const recentRows = await query<RowDataPacket[]>(
      `SELECT id, first_name, last_name, email, mobile, food_preference, status, checked_in_at 
       FROM registrations 
       WHERE (status = 'attended' OR checked_in_at IS NOT NULL) AND deleted_at IS NULL 
       ORDER BY checked_in_at DESC, updated_at DESC 
       LIMIT 10`
    );

    const stats = (Array.isArray(totalRows) && totalRows[0]) || {
      total: 0,
      attended: 0,
      veg_attended: 0,
      non_veg_attended: 0,
      veg_total: 0,
      non_veg_total: 0,
    };

    const attended = Number(stats.attended) || 0;
    const total = Number(stats.total) || 0;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        attended,
        remaining: Math.max(0, total - attended),
        percentage,
        vegAttended: Number(stats.veg_attended) || 0,
        nonVegAttended: Number(stats.non_veg_attended) || 0,
        vegTotal: Number(stats.veg_total) || 0,
        nonVegTotal: Number(stats.non_veg_total) || 0,
      },
      recentCheckins: (recentRows as RowDataPacket[]).map((r: RowDataPacket) => ({
        ...r,
        reference: `U101-${String(r.id).padStart(5, '0')}`,
      })),
    });
  } catch (error) {
    console.error('Check-in stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error loading check-in stats.' },
      { status: 500 }
    );
  }
}
