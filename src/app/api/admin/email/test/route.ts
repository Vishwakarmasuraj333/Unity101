import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';
import { logAdminActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const targetEmail = body.to || session.email;

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid recipient email address.' },
        { status: 400 }
      );
    }

    const result = await sendTestEmail(targetEmail);

    if (result.success) {
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'TEST_EMAIL_SENT',
        entityType: 'settings',
        description: `Sent SMTP test email to ${targetEmail}`,
      });

      return NextResponse.json({
        success: true,
        message: result.message || `Test email dispatched to ${targetEmail}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || 'Failed to send test email. Check your SMTP settings.',
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, message: errMsg || 'Server error testing SMTP configuration' },
      { status: 500 }
    );
  }
}
