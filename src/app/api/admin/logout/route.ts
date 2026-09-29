import { NextResponse } from 'next/server';
import { clearAdminSessionCookie, getAdminSession } from '@/lib/auth';
import { logAdminActivity } from '@/lib/logger';

export async function POST() {
  try {
    const session = await getAdminSession();
    if (session) {
      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'LOGOUT',
        entityType: 'admin',
        entityId: session.adminId,
        description: `Admin ${session.name} logged out`,
      });
    }

    await clearAdminSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    await clearAdminSessionCookie();
    return NextResponse.json({ success: true });
  }
}
