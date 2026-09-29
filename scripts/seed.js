// Seed script for Unity 101 Community Radio Event Registration
const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'unity101_db',
  });

  console.log('Connected to MySQL. Seeding initial registrations...');

  const sampleRegistrations = [
    {
      first_name: 'Amina',
      last_name: 'Begum',
      address: '14 Portswood Road',
      town: 'Southampton',
      post_code: 'SO17 2ES',
      email: 'amina.begum@example.com',
      mobile: '07700900123',
      food_preference: 'Veg Food',
      status: 'confirmed',
    },
    {
      first_name: 'Rajesh',
      last_name: 'Patel',
      address: '88 Shirley High Street',
      town: 'Southampton',
      post_code: 'SO15 3NF',
      email: 'rajesh.patel@example.com',
      mobile: '07700900456',
      food_preference: 'Veg Food',
      status: 'confirmed',
    },
    {
      first_name: 'Marcus',
      last_name: 'Davies',
      address: '22 London Road',
      town: 'Southampton',
      post_code: 'SO15 2AG',
      email: 'marcus.davies@example.com',
      mobile: '07700900789',
      food_preference: 'Non Veg Food',
      status: 'new',
    },
    {
      first_name: 'Priya',
      last_name: 'Sharma',
      address: '5 Basingstoke Road',
      town: 'Winchester',
      post_code: 'SO23 7DY',
      email: 'priya.sharma@example.com',
      mobile: '07700900987',
      food_preference: 'Veg Food',
      status: 'confirmed',
    },
    {
      first_name: 'David',
      last_name: 'Miller',
      address: '109 Bitterne Road West',
      town: 'Southampton',
      post_code: 'SO18 1AR',
      email: 'david.miller@example.com',
      mobile: '07700900321',
      food_preference: 'Non Veg Food',
      status: 'cancelled',
    },
    {
      first_name: 'Fatima',
      last_name: 'Zahra',
      address: '42 Derby Road',
      town: 'Southampton',
      post_code: 'SO14 0DT',
      email: 'fatima.zahra@example.com',
      mobile: '07700900654',
      food_preference: 'Veg Food',
      status: 'new',
    },
  ];

  for (const reg of sampleRegistrations) {
    const [existing] = await connection.execute(
      'SELECT id FROM registrations WHERE email = ? LIMIT 1',
      [reg.email]
    );

    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO registrations 
         (first_name, last_name, address, town, post_code, email, mobile, food_preference, gdpr_consent, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          reg.first_name,
          reg.last_name,
          reg.address,
          reg.town,
          reg.post_code,
          reg.email,
          reg.mobile,
          reg.food_preference,
          reg.status,
        ]
      );
      console.log(`Inserted seed guest: ${reg.first_name} ${reg.last_name}`);
    }
  }

  console.log('Seeding completed successfully!');
  await connection.end();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
