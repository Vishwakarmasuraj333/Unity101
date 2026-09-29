import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminSession, setAdminSessionCookie } from '@/lib/auth';
import { query } from '@/lib/db';
import { UpdateProfileSchema } from '@/lib/validation';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, current_password, new_password } = parsed.data;

    // Fetch current admin
    const rows = await query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, role FROM admins WHERE id = ? LIMIT 1',
      [session.adminId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    }

    const currentAdmin = rows[0];

    // Check duplicate email if changed
    if (email.toLowerCase() !== currentAdmin.email.toLowerCase()) {
      const dup = await query<RowDataPacket[]>(
        'SELECT id FROM admins WHERE email = ? AND id != ? LIMIT 1',
        [email.toLowerCase(), session.adminId]
      );
      if (dup && dup.length > 0) {
        return NextResponse.json(
          { success: false, message: 'An admin account with this email already exists.' },
          { status: 409 }
        );
      }
    }

    // Handle password change if requested
    let updatedPasswordHash = currentAdmin.password_hash;
    let passwordChanged = false;

    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to change password.' },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(current_password, currentAdmin.password_hash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      updatedPasswordHash = await bcrypt.hash(new_password, 10);
      passwordChanged = true;
    }

    // Update in MySQL
    await query<ResultSetHeader>(
      `UPDATE admins 
       SET name = ?, email = ?, password_hash = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name.trim(), email.toLowerCase().trim(), updatedPasswordHash, session.adminId]
    );

    // Update active session cookie
    await setAdminSessionCookie({
      adminId: session.adminId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: currentAdmin.role,
    });

    await logAdminActivity({
      adminId: session.adminId,
      adminEmail: email.toLowerCase().trim(),
      action: passwordChanged ? 'PASSWORD_UPDATED' : 'PROFILE_UPDATED',
      entityType: 'admin',
      entityId: session.adminId,
      description: passwordChanged
        ? `Admin ${name} updated profile details and changed password`
        : `Admin ${name} updated profile information`,
    });

    return NextResponse.json({
      success: true,
      message: passwordChanged
        ? 'Profile and password updated successfully.'
        : 'Profile details saved successfully.',
      admin: {
        id: session.adminId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: currentAdmin.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
  }
}
