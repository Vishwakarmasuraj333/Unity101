import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Total active registrations
    const totalRows = await query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM registrations WHERE deleted_at IS NULL'
    );
    const totalRegistrations = Number(totalRows[0]?.count || 0);

    // 2. Count by status
    const statusRows = await query<RowDataPacket[]>(
      `SELECT status, COUNT(*) as count 
       FROM registrations 
       WHERE deleted_at IS NULL 
       GROUP BY status`
    );

    // 3. Count by food preference
    const foodRows = await query<RowDataPacket[]>(
      `SELECT food_preference, COUNT(*) as count 
       FROM registrations 
       WHERE deleted_at IS NULL 
       GROUP BY food_preference`
    );

    // 4. Trash count (soft-deleted)
    const trashRows = await query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM registrations WHERE deleted_at IS NOT NULL'
    );

    // 5. Today's registrations
    const todayRows = await query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM registrations WHERE DATE(created_at) = CURDATE() AND deleted_at IS NULL'
    );

    // 6. Recent registrations
    const recentRegistrations = await query<RowDataPacket[]>(
      `SELECT id, first_name, last_name, town, post_code, email, mobile, food_preference, status, created_at 
       FROM registrations 
       WHERE deleted_at IS NULL 
       ORDER BY created_at DESC 
       LIMIT 6`
    );

    // 7. Recent activity logs
    const recentLogs = await query<RowDataPacket[]>(
      `SELECT id, admin_email, action, entity_type, entity_id, description, created_at 
       FROM admin_activity_logs 
       ORDER BY created_at DESC 
       LIMIT 8`
    );

    // 8. Daily Activity for last 7-14 days
    const dailyRows = await query<RowDataPacket[]>(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as reg_date, COUNT(*) as count 
       FROM registrations 
       WHERE deleted_at IS NULL 
       GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
       ORDER BY reg_date ASC`
    );

    // Build continuous last 7 days timeline
    const dateMap = new Map<string, number>();
    dailyRows.forEach((r) => {
      dateMap.set(r.reg_date, Number(r.count));
    });

    const dailyActivity = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      dailyActivity.push({
        date: isoDate,
        dayLabel,
        count: dateMap.get(isoDate) || 0,
      });
    }

    // 9. Town Distribution (Top 5)
    const townRows = await query<RowDataPacket[]>(
      `SELECT town, COUNT(*) as count 
       FROM registrations 
       WHERE deleted_at IS NULL AND town IS NOT NULL AND TRIM(town) != '' 
       GROUP BY town 
       ORDER BY count DESC 
       LIMIT 5`
    );

    const townDistribution = townRows.map((r) => {
      const count = Number(r.count);
      const percentage = totalRegistrations > 0 ? Math.round((count / totalRegistrations) * 100) : 0;
      return {
        town: String(r.town),
        count,
        percentage,
      };
    });

    // 10. Capacity Metrics from system_settings
    let maxCapacity = 500;
    try {
      const settingRows = await query<RowDataPacket[]>(
        "SELECT setting_value FROM system_settings WHERE setting_key = 'max_capacity' LIMIT 1"
      );
      if (settingRows.length > 0 && settingRows[0].setting_value) {
        maxCapacity = parseInt(settingRows[0].setting_value, 10) || 500;
      }
    } catch {
      maxCapacity = 500;
    }

    const percentFilled = maxCapacity > 0 ? Math.min(100, Math.round((totalRegistrations / maxCapacity) * 100)) : 0;
    const remaining = Math.max(0, maxCapacity - totalRegistrations);

    // Parse status counts
    let newCount = 0;
    let confirmedCount = 0;
    let cancelledCount = 0;

    statusRows.forEach((r) => {
      if (r.status === 'new') newCount = Number(r.count);
      if (r.status === 'confirmed') confirmedCount = Number(r.count);
      if (r.status === 'cancelled') cancelledCount = Number(r.count);
    });

    // Parse food preference counts
    let vegCount = 0;
    let nonVegCount = 0;

    foodRows.forEach((r) => {
      if (r.food_preference === 'Veg Food') vegCount = Number(r.count);
      if (r.food_preference === 'Non Veg Food') nonVegCount = Number(r.count);
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRegistrations,
        newRegistrations: newCount,
        confirmedRegistrations: confirmedCount,
        cancelledRegistrations: cancelledCount,
        vegFoodCount: vegCount,
        nonVegFoodCount: nonVegCount,
        trashCount: Number(trashRows[0]?.count || 0),
        todayCount: Number(todayRows[0]?.count || 0),
      },
      dailyActivity,
      townDistribution,
      capacity: {
        target: maxCapacity,
        registered: totalRegistrations,
        percentFilled,
        remaining,
      },
      recentRegistrations,
      recentLogs,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to calculate database metrics' },
      { status: 500 }
    );
  }
}
