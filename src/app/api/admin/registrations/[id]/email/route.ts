import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { sendGuestRegistrationConfirmationEmail } from '@/lib/email';
import { RowDataPacket } from 'mysql2';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const regId = parseInt(id, 10);
  if (isNaN(regId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const rows = await query<RowDataPacket[]>(
      'SELECT * FROM registrations WHERE id = ? LIMIT 1',
      [regId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Registration not found' },
        { status: 404 }
      );
    }

    const reg = rows[0];

    const result = await sendGuestRegistrationConfirmationEmail({
      id: reg.id,
      first_name: reg.first_name,
      last_name: reg.last_name,
      email: reg.email,
      mobile: reg.mobile,
      address: reg.address,
      town: reg.town,
      post_code: reg.post_code,
      food_preference: reg.food_preference,
    });

    if (result.success) {
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'EMAIL_RESENT',
        entityType: 'registration',
        entityId: reg.id,
        description: `Admin resent confirmation email to ${reg.first_name} ${reg.last_name} (${reg.email})`,
      });

      return NextResponse.json({
        success: true,
        message: result.simulated
          ? `Simulated: Email logged for ${reg.email} (Configure SMTP in settings for live delivery)`
          : `Confirmation email dispatched to ${reg.email}`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to dispatch email' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: errMsg }, { status: 500 });
  }
}
