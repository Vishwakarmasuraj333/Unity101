import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await query<RowDataPacket[]>('SELECT setting_key, setting_value FROM system_settings');
    const settings: Record<string, string> = {};
    rows.forEach((r) => {
      settings[r.setting_key] = r.setting_value;
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = body.settings as Record<string, string>;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO system_settings (setting_key, setting_value) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()`,
        [key, String(value)]
      );
    }

    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: session.email,
      action: 'SETTINGS_UPDATED',
      entityType: 'settings',
      description: `Admin updated system settings: ${Object.keys(settings).join(', ')}`,
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update settings' }, { status: 500 });
  }
}
