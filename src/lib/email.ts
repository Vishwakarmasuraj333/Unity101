import nodemailer from 'nodemailer';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { logAdminActivity } from '@/lib/logger';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  enabled: boolean;
  adminAlertEmail: string;
}

// Fetch SMTP settings from MySQL system_settings table, falling back to process.env
export async function getEmailConfig(): Promise<SmtpConfig> {
  const config: SmtpConfig = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Unity 101 Community Radio <events@unity101.org>',
    enabled: process.env.EMAIL_NOTIFICATIONS_ENABLED !== 'false',
    adminAlertEmail: process.env.ADMIN_ALERT_EMAIL || 'events@unity101.org',
  };

  try {
    const rows = await query<RowDataPacket[]>(
      `SELECT setting_key, setting_value FROM system_settings 
       WHERE setting_key IN (
         'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass', 
         'smtp_from', 'email_notifications_enabled', 'notification_email'
       )`
    );

    if (rows && rows.length > 0) {
      for (const row of rows) {
        if (row.setting_key === 'smtp_host' && row.setting_value) config.host = row.setting_value;
        if (row.setting_key === 'smtp_port' && row.setting_value) config.port = parseInt(row.setting_value, 10);
        if (row.setting_key === 'smtp_secure') config.secure = row.setting_value === 'true';
        if (row.setting_key === 'smtp_user' && row.setting_value) config.user = row.setting_value;
        if (row.setting_key === 'smtp_pass' && row.setting_value) config.pass = row.setting_value;
        if (row.setting_key === 'smtp_from' && row.setting_value) config.from = row.setting_value;
        if (row.setting_key === 'email_notifications_enabled') config.enabled = row.setting_value === 'true';
        if (row.setting_key === 'notification_email' && row.setting_value) config.adminAlertEmail = row.setting_value;
      }
    }
  } catch (err) {
    console.warn('Could not read email config from database, using env defaults:', err);
  }

  return config;
}

export interface RegistrationEmailData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  address?: string;
  town?: string;
  post_code?: string;
  food_preference: string;
}

/**
 * Generate high-end HTML email for registration confirmation
 */
function generateGuestConfirmationHtml(data: RegistrationEmailData): string {
  const refCode = `U101-${String(data.id).padStart(5, '0')}`;
  const isVeg = data.food_preference.toLowerCase().includes('veg') && !data.food_preference.toLowerCase().includes('non');
  const foodBadgeColor = isVeg ? '#166534' : '#991b1b';
  const foodBadgeBg = isVeg ? '#dcfce7' : '#fee2e2';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unity 101 Event Registration Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f1f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f1f8; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(72, 18, 104, 0.08); border: 1px solid #e9d5ff;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #2e0854 0%, #481268 50%, #6b21a8 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="background-color: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); display: inline-block; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">
                      <span style="color: #fde68a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Official Confirmation</span>
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">Unity 101 Community Radio</h1>
                    <p style="margin: 6px 0 0 0; font-size: 14px; color: #e9d5ff; font-weight: 500;">20th Anniversary Community Gala Celebration</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reference Code Box -->
          <tr>
            <td style="padding: 24px 28px 12px 28px; background-color: #faf5ff; border-bottom: 1px dashed #d8b4fe; text-align: center;">
              <span style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b21a8; margin-bottom: 4px;">Your Registration Reference</span>
              <span style="display: inline-block; font-size: 24px; font-weight: 800; font-family: monospace; color: #481268; letter-spacing: 2px; background: #ffffff; padding: 6px 18px; border-radius: 8px; border: 1px solid #c084fc;">${refCode}</span>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Please keep this reference code for check-in on the event day.</p>
            </td>
          </tr>

          <!-- Guest Greeting & Info -->
          <tr>
            <td style="padding: 28px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Dear ${data.first_name} ${data.last_name},</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Thank you for registering to attend the <strong>Unity 101 Community Radio 20th Anniversary Celebration</strong>. Your registration details have been securely recorded in our guest database.
              </p>

              <!-- Registration Summary Table -->
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; margin-bottom: 24px;" cellspacing="0" cellpadding="10">
                <tr>
                  <td width="35%" style="font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">Full Name:</td>
                  <td style="font-size: 13px; font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">${data.first_name} ${data.last_name}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">Email Address:</td>
                  <td style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">${data.email}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">Mobile Phone:</td>
                  <td style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">${data.mobile}</td>
                </tr>
                ${data.address ? `
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">Street Address:</td>
                  <td style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">${data.address}</td>
                </tr>` : ''}
                ${data.town ? `
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">Town & Postcode:</td>
                  <td style="font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding: 10px 14px;">${data.town}${data.post_code ? `, ${data.post_code}` : ''}</td>
                </tr>` : ''}
                <tr>
                  <td style="font-size: 13px; font-weight: 600; color: #64748b; padding: 10px 14px;">Food Choice:</td>
                  <td style="font-size: 13px; padding: 10px 14px;">
                    <span style="display: inline-block; background-color: ${foodBadgeBg}; color: ${foodBadgeColor}; font-weight: 700; font-size: 12px; padding: 3px 10px; border-radius: 9999px;">
                      ${data.food_preference}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Event Details Box -->
              <div style="background-color: #faf5ff; border-left: 4px solid #7e22ce; padding: 16px 20px; border-radius: 0 10px 10px 0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #581c87;">Event Information & Entry Instructions</h3>
                <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569; line-height: 1.6;">
                  <li><strong>Arrival:</strong> Please arrive 15 minutes before the ceremony start time.</li>
                  <li><strong>Check-in:</strong> Present this email or quote Reference <strong>${refCode}</strong> at the reception desk.</li>
                  <li><strong>Venue:</strong> Southampton Community Venue, Hampshire, UK.</li>
                  <li><strong>Dietary:</strong> Your meal preference (<strong>${data.food_preference}</strong>) has been reserved.</li>
                </ul>
              </div>

              <!-- Assistance -->
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Need to amend your details or have any questions? Reply directly to this email or contact us at <a href="mailto:events@unity101.org" style="color: #7e22ce; text-decoration: underline; font-weight: 600;">events@unity101.org</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">
                Unity 101 Community Radio &bull; 101.1 FM Southampton
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Broadcasting culture, community, and entertainment. All rights reserved &copy; ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send guest registration confirmation email
 */
export async function sendGuestRegistrationConfirmationEmail(
  data: RegistrationEmailData
): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const config = await getEmailConfig();

  // If email notifications are explicitly disabled
  if (!config.enabled) {
    console.log(`[EMAIL] Notifications disabled. Skipping email to ${data.email}`);
    return { success: true, simulated: true };
  }

  // If no SMTP host is configured, simulate graceful logging without failing
  if (!config.host || !config.user) {
    console.log(`[EMAIL SIMULATED] SMTP not configured. Confirmation email prepared for: ${data.email} (Ref: U101-${String(data.id).padStart(5, '0')})`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const refCode = `U101-${String(data.id).padStart(5, '0')}`;
    const info = await transporter.sendMail({
      from: config.from,
      to: data.email,
      subject: `Registration Confirmed [${refCode}] - Unity 101 Community Radio 20th Anniversary`,
      text: `Hello ${data.first_name} ${data.last_name},\n\nYour registration for the Unity 101 Community Radio 20th Anniversary Celebration is confirmed.\nReference: ${refCode}\nFood Preference: ${data.food_preference}\n\nWe look forward to seeing you!`,
      html: generateGuestConfirmationHtml(data),
    });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[EMAIL ERROR] Failed to send guest email to ${data.email}:`, errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Send admin alert when a new registration is submitted
 */
export async function sendAdminNewRegistrationAlertEmail(
  data: RegistrationEmailData
): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const config = await getEmailConfig();

  if (!config.enabled || !config.adminAlertEmail) {
    return { success: true, simulated: true };
  }

  if (!config.host || !config.user) {
    console.log(`[EMAIL SIMULATED] Admin alert prepared for: ${config.adminAlertEmail} regarding guest ${data.first_name} ${data.last_name}`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const refCode = `U101-${String(data.id).padStart(5, '0')}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unity101.vercel.app';
    const isVeg = data.food_preference?.toLowerCase().includes('veg') && !data.food_preference?.toLowerCase().includes('non');
    const foodBadgeColor = isVeg ? '#166534' : '#991b1b';
    const foodBadgeBg = isVeg ? '#dcfce7' : '#fee2e2';

    const info = await transporter.sendMail({
      from: config.from,
      to: config.adminAlertEmail,
      subject: `[Unity 101 Admin Alert] New Guest Registered: ${data.first_name} ${data.last_name} (${refCode})`,
      text: `A new registration has been received for the Unity 101 20th Anniversary Gala:\n\nReference: ${refCode}\nGuest Name: ${data.first_name} ${data.last_name}\nEmail: ${data.email}\nMobile: ${data.mobile}\nStreet Address: ${data.address || 'Not provided'}\nTown / City: ${data.town || 'Not provided'}\nPostcode: ${data.post_code || 'Not provided'}\nFood Preference: ${data.food_preference}\n\nView Guest in Admin Portal: ${appUrl}/admin/registrations/${data.id}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
          <table role="presentation" width="100%" style="background-color: #f1f5f9; padding: 24px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="background: linear-gradient(135deg, #1e052c 0%, #3b0e54 100%); padding: 24px; color: #ffffff; text-align: left;">
                      <span style="background-color: #f59e0b; color: #0f172a; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; letter-spacing: 1px;">Admin Notification</span>
                      <h2 style="margin: 8px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff;">New Guest Registration Received</h2>
                      <p style="margin: 4px 0 0 0; font-size: 13px; color: #e9d5ff;">Unity 101 Community Radio • 20th Anniversary Celebration</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px;">
                      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between;">
                        <span style="font-size: 12px; color: #64748b; font-weight: 600;">Reference Code:</span>
                        <span style="font-size: 14px; font-weight: 800; color: #481268; font-family: monospace;">${refCode}</span>
                      </div>

                      <table role="presentation" width="100%" style="font-size: 13px; line-height: 1.6; border-collapse: collapse; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; width: 35%; border-bottom: 1px solid #f1f5f9;">Guest Name:</td>
                          <td style="padding: 8px 0; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9;">${data.first_name} ${data.last_name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Email Address:</td>
                          <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${data.email}" style="color: #481268; text-decoration: none;">${data.email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Mobile Phone:</td>
                          <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;"><a href="tel:${data.mobile}" style="color: #481268; text-decoration: none;">${data.mobile}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Street Address:</td>
                          <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${data.address || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Town / City:</td>
                          <td style="padding: 8px 0; color: #0f172a; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${data.town || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b; border-bottom: 1px solid #f1f5f9;">Postcode:</td>
                          <td style="padding: 8px 0; color: #0f172a; font-weight: 700; border-bottom: 1px solid #f1f5f9; text-transform: uppercase;">${data.post_code || 'Not specified'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #64748b;">Food Preference:</td>
                          <td style="padding: 8px 0;">
                            <span style="background-color: ${foodBadgeBg}; color: ${foodBadgeColor}; padding: 3px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px;">
                              ${data.food_preference}
                            </span>
                          </td>
                        </tr>
                      </table>

                      <div style="text-align: center; padding-top: 10px;">
                        <a href="${appUrl}/admin/registrations/${data.id}" target="_blank" style="display: inline-block; background: #481268; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 6px rgba(72,18,104,0.3);">
                          Open Registration #${data.id} in Admin &rarr;
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
                      Unity 101 Community Radio • 20th Anniversary Gala Admin System
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[EMAIL ERROR] Failed to send admin alert:', errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Log email dispatch to MySQL email_logs table for audit & admin viewing
 */
export async function logEmailRecord(entry: {
  email_type: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'failed' | 'simulated';
  message_id?: string | null;
  error_message?: string | null;
}) {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS \`email_logs\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`email_type\` VARCHAR(50) NOT NULL,
        \`recipient\` VARCHAR(191) NOT NULL,
        \`subject\` VARCHAR(255) NOT NULL,
        \`status\` ENUM('sent', 'failed', 'simulated') NOT NULL DEFAULT 'sent',
        \`message_id\` VARCHAR(255) NULL,
        \`error_message\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_email_recipient\` (\`recipient\`),
        INDEX \`idx_email_status\` (\`status\`),
        INDEX \`idx_email_created_at\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await query(
      `INSERT INTO email_logs (email_type, recipient, subject, status, message_id, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        entry.email_type,
        entry.recipient,
        entry.subject,
        entry.status,
        entry.message_id || null,
        entry.error_message || null,
      ]
    );
  } catch (err) {
    console.warn('[EMAIL LOG] Failed to record in email_logs:', err);
  }
}

/**
 * Send test email to verify SMTP configuration and log result
 */
export async function sendTestEmail(
  toEmail: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const config = await getEmailConfig();

  if (!config.host || !config.user) {
    const simId = `SIM-TEST-${Date.now().toString().slice(-6)}`;
    await logEmailRecord({
      email_type: 'test_dispatch',
      recipient: toEmail,
      subject: 'Unity 101 Community Radio - SMTP Test Email',
      status: 'simulated',
      message_id: simId,
      error_message: 'Live SMTP credentials not set in Settings. Test simulated successfully.',
    });

    return {
      success: true,
      message: `Test email logged for ${toEmail}. Set your live SMTP credentials in Settings for inbox delivery.`,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: config.from,
      to: toEmail,
      subject: 'Unity 101 Community Radio - SMTP Test Email',
      text: 'Congratulations! Your SMTP email service for Unity 101 Event Registration is functioning properly.',
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #481268; margin-top: 0;">SMTP Test Successful! &#10004;</h2>
          <p style="color: #334155; font-size: 14px;">This is a test notification confirming that the email delivery system for <strong>Unity 101 Community Radio</strong> is operational.</p>
          <hr style="border: none; border-top: 1px solid #e9d5ff; margin: 16px 0;" />
          <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    await logEmailRecord({
      email_type: 'test_dispatch',
      recipient: toEmail,
      subject: 'Unity 101 Community Radio - SMTP Test Email',
      status: 'sent',
      message_id: info.messageId,
    });

    return { success: true, message: `Test email sent successfully. ID: ${info.messageId}` };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);

    await logEmailRecord({
      email_type: 'test_dispatch',
      recipient: toEmail,
      subject: 'Unity 101 Community Radio - SMTP Test Email',
      status: 'failed',
      error_message: errMsg,
    });

    return { success: false, error: errMsg };
  }
}
