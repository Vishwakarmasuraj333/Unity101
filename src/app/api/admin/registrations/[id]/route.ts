import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET single registration
export async function GET(req: NextRequest, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const regId = parseInt(id, 10);
  if (isNaN(regId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }

  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM registrations WHERE id = ? LIMIT 1',
    [regId]
  );

  if (!rows || rows.length === 0) {
    return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: rows[0] });
}

// PATCH update registration
export async function PATCH(req: NextRequest, context: RouteContext) {
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
    const body = await req.json();
    const {
      first_name,
      last_name,
      address,
      town,
      post_code,
      email,
      mobile,
      food_preference,
      status,
      notes,
    } = body;

    // Check if target registration exists
    const existing = await query<RowDataPacket[]>(
      'SELECT id, first_name, last_name, status FROM registrations WHERE id = ? LIMIT 1',
      [regId]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    const current = existing[0];

    // Check duplicate email/mobile on another record
    if (email || mobile) {
      const dup = await query<RowDataPacket[]>(
        'SELECT id FROM registrations WHERE (email = ? OR mobile = ?) AND id != ? AND deleted_at IS NULL LIMIT 1',
        [email?.toLowerCase(), mobile, regId]
      );
      if (dup && dup.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Another guest registration already has this email or mobile number.' },
          { status: 409 }
        );
      }
    }

    await query<ResultSetHeader>(
      `UPDATE registrations 
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           address = COALESCE(?, address),
           town = COALESCE(?, town),
           post_code = COALESCE(?, post_code),
           email = COALESCE(?, email),
           mobile = COALESCE(?, mobile),
           food_preference = COALESCE(?, food_preference),
           status = COALESCE(?, status),
           notes = COALESCE(?, notes),
           updated_at = NOW()
       WHERE id = ?`,
      [
        first_name?.trim() || null,
        last_name?.trim() || null,
        address?.trim() || null,
        town?.trim() || null,
        post_code?.trim()?.toUpperCase() || null,
        email?.trim()?.toLowerCase() || null,
        mobile?.trim() || null,
        food_preference || null,
        status || null,
        notes !== undefined ? notes : null,
        regId,
      ]
    );

    const statusChanged = status && status !== current.status;
    const action = statusChanged ? 'STATUS_CHANGED' : 'REGISTRATION_UPDATED';

    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: session.email,
      action,
      entityType: 'registration',
      entityId: regId,
      description: statusChanged
        ? `Status updated from ${current.status} to ${status} for ${current.first_name} ${current.last_name}`
        : `Updated details for registration #${regId} (${current.first_name} ${current.last_name})`,
    });

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully.',
    });
  } catch (error) {
    console.error('Update registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update registration' },
      { status: 500 }
    );
  }
}

// DELETE registration (Soft delete or permanent delete)
export async function DELETE(req: NextRequest, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;
  const regId = parseInt(id, 10);
  if (isNaN(regId)) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const isPermanent = searchParams.get('permanent') === 'true';

  try {
    const existing = await query<RowDataPacket[]>(
      'SELECT id, first_name, last_name, email FROM registrations WHERE id = ? LIMIT 1',
      [regId]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    const item = existing[0];

    if (isPermanent) {
      // Hard delete from database
      await query<ResultSetHeader>('DELETE FROM registrations WHERE id = ?', [regId]);

      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'REGISTRATION_PERMANENTLY_DELETED',
        entityType: 'registration',
        entityId: regId,
        description: `Permanently purged registration #${regId} (${item.first_name} ${item.last_name}, ${item.email})`,
      });

      return NextResponse.json({
        success: true,
        message: 'Registration permanently deleted from database.',
      });
    } else {
      // Soft delete: move to trash
      await query<ResultSetHeader>('UPDATE registrations SET deleted_at = NOW() WHERE id = ?', [regId]);

      await logAdminActivity({
        adminId: session.adminId,
        adminEmail: session.email,
        action: 'REGISTRATION_DELETED',
        entityType: 'registration',
        entityId: regId,
        description: `Moved registration #${regId} (${item.first_name} ${item.last_name}) to trash`,
      });

      return NextResponse.json({
        success: true,
        message: 'Registration moved to trash.',
      });
    }
  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete registration' },
      { status: 500 }
    );
  }
}
