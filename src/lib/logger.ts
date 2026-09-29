import { query } from './db';

export async function logAdminActivity(params: {
  adminId?: number | null;
  adminEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  description: string;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO admin_activity_logs (admin_id, admin_email, action, entity_type, entity_id, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.adminId || null,
        params.adminEmail || null,
        params.action,
        params.entityType,
        params.entityId || null,
        params.description,
      ]
    );
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
}
