const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
}

loadEnv();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: { rejectUnauthorized: false },
  });

  const [rows] = await connection.query(
    'SELECT id, first_name, last_name, email, mobile, address, town, post_code, food_preference, status, notes, created_at FROM registrations WHERE deleted_at IS NULL ORDER BY id ASC'
  );

  const headers = [
    'Reference Code',
    'Full Name',
    'Email Address',
    'Mobile Number',
    'Town',
    'Post Code',
    'Meal Choice',
    'Status',
    'Notes',
  ];

  const esc = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
  const lines = [headers.join(',')];

  rows.forEach((r) => {
    const ref = `U101-${String(r.id).padStart(5, '0')}`;
    lines.push(
      [
        esc(ref),
        esc(`${r.first_name} ${r.last_name}`),
        esc(r.email),
        esc(r.mobile),
        esc(r.town),
        esc(r.post_code),
        esc(r.food_preference),
        esc(r.status),
        esc(r.notes),
      ].join(',')
    );
  });

  const outPath = path.join(__dirname, '..', 'scratch', 'previous_year_guest_list.csv');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log(`Saved previous year guest list to: ${outPath} (${rows.length} guests)`);

  await connection.end();
}

main().catch(console.error);
