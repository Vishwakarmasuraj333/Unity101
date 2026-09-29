import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { AdminLoginSchema } from '@/lib/validation';
import { setAdminSessionCookie } from '@/lib/auth';
import { logAdminActivity } from '@/lib/logger';
import { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = AdminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password format' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Fetch admin by email
    const rows = await query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, role FROM admins WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    const admin = rows[0];

    // Verify bcrypt password
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    // Set HTTP-only secure cookie
    await setAdminSessionCookie({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // Log admin login activity
    await logAdminActivity({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'LOGIN',
      entityType: 'admin',
      entityId: admin.id,
      description: `Admin ${admin.name} logged in successfully`,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
