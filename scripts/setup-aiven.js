// Script to initialize Aiven MySQL database tables and seed default admin
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Simple .env parser to avoid extra dependency
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
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

async function main() {
  console.log('Connecting to Aiven MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'mysql-37ec536c-itxsurajofficial-3639.i.aivencloud.com',
    port: Number(process.env.DATABASE_PORT) || 20680,
    user: process.env.DATABASE_USER || 'avnadmin',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  });

  console.log('Connected to Aiven MySQL successfully!');

  // Read schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  let schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Remove CREATE DATABASE and USE unity101_db if running directly on defaultdb
  schemaSql = schemaSql
    .replace(/CREATE DATABASE IF NOT EXISTS unity101_db[^;]*;/gi, '')
    .replace(/USE unity101_db;/gi, '');

  console.log('Executing database schema...');
  await connection.query(schemaSql);

  console.log('Schema executed successfully!');

  // Verify tables
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tables verified in database.');

  // Check admin user
  const [admins] = await connection.query('SELECT id, name, email, role FROM admin_users');
  console.log('Admin users provisioned:', admins);

  await connection.end();
  console.log('Aiven database setup complete!');
}

main().catch((err) => {
  console.error('Aiven initialization error:', err);
  process.exit(1);
});
