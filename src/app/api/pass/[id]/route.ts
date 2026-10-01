import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface PassRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  town: string;
  post_code: string;
  food_preference: string;
  status: string;
  checked_in_at: string | null;
  created_at: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawParam } = await params;
    if (!rawParam) {
      return NextResponse.json({ success: false, message: 'Missing pass parameter' }, { status: 400 });
    }

    const clean = rawParam.trim();
    let numericId: number | null = null;

    // Check patterns: U101-00012, U101-12, or raw 12
    const u101Match = clean.match(/U101-(\d+)/i);
    if (u101Match) {
      numericId = parseInt(u101Match[1], 10);
    } else if (/^\d+$/.test(clean)) {
      numericId = parseInt(clean, 10);
    }

    if (numericId === null || isNaN(numericId)) {
      return NextResponse.json({ success: false, message: 'Invalid pass identifier format' }, { status: 400 });
    }

    const rows = await query<PassRow[]>(
      `SELECT id, first_name, last_name, town, post_code, food_preference, status, checked_in_at, created_at
       FROM registrations
       WHERE id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [numericId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No registered guest pass found for this reference code.' },
        { status: 404 }
      );
    }

    const guest = rows[0];
    const reference = `U101-${String(guest.id).padStart(5, '0')}`;

    return NextResponse.json({
      success: true,
      data: {
        id: guest.id,
        reference,
        first_name: guest.first_name,
        last_name: guest.last_name,
        town: guest.town,
        post_code: guest.post_code,
        food_preference: guest.food_preference,
        status: guest.status,
        checked_in_at: guest.checked_in_at,
        created_at: guest.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching guest pass:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving guest pass details' },
      { status: 500 }
    );
  }
}
