// Seed script for Unity 101 Community Radio - Historical & Previous Year Gala Guests
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

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'mysql-37ec536c-itxsurajofficial-3639.i.aivencloud.com',
    port: Number(process.env.DATABASE_PORT) || 20680,
    user: process.env.DATABASE_USER || 'avnadmin',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false },
  });

  console.log('Connected to MySQL database. Seeding previous year guest list...');

  const previousGalaGuests = [
    {
      first_name: 'Amina',
      last_name: 'Begum',
      address: '14 Portswood Road',
      town: 'Southampton',
      post_code: 'SO17 2ES',
      email: 'amina.begum@southamptondiverse.org.uk',
      mobile: '07700900123',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'Community radio supporter & volunteer coordinator',
    },
    {
      first_name: 'Rajesh',
      last_name: 'Patel',
      address: '88 Shirley High Street',
      town: 'Southampton',
      post_code: 'SO15 3NF',
      email: 'rajesh.patel@hantscommerce.co.uk',
      mobile: '07700900456',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'Long-standing community sponsor - Table 2',
    },
    {
      first_name: 'Marcus',
      last_name: 'Davies',
      address: '22 London Road',
      town: 'Southampton',
      post_code: 'SO15 2AG',
      email: 'marcus.davies@solentmedia.org',
      mobile: '07700900789',
      food_preference: 'Non Veg Food',
      status: 'confirmed',
      notes: 'Civic partner & Solent University media representative',
    },
    {
      first_name: 'Priya',
      last_name: 'Sharma',
      address: '5 Basingstoke Road',
      town: 'Winchester',
      post_code: 'SO23 7DY',
      email: 'priya.sharma@hampshirearts.org',
      mobile: '07700900987',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'Cultural music performer & guest speaker',
    },
    {
      first_name: 'David',
      last_name: 'Miller',
      address: '109 Bitterne Road West',
      town: 'Southampton',
      post_code: 'SO18 1AR',
      email: 'david.miller@southamptoncouncil.gov.uk',
      mobile: '07700900321',
      food_preference: 'Non Veg Food',
      status: 'confirmed',
      notes: 'Civic dignitary & Community Trust liaison',
    },
    {
      first_name: 'Fatima',
      last_name: 'Zahra',
      address: '42 Derby Road',
      town: 'Southampton',
      post_code: 'SO14 0DT',
      email: 'fatima.zahra@newtowncommunity.org',
      mobile: '07700900654',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'Youth empowerment broadcasting lead',
    },
    {
      first_name: 'Gurpreet',
      last_name: 'Singh',
      address: '77 St Mary Street',
      town: 'Southampton',
      post_code: 'SO14 1NW',
      email: 'gurpreet.singh@southamptonheritage.org',
      mobile: '07700900888',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'Interfaith council member & honorary presenter',
    },
    {
      first_name: 'Sarah',
      last_name: 'Jenkins',
      address: '31 The Avenue',
      town: 'Southampton',
      post_code: 'SO17 1XN',
      email: 'sarah.jenkins@hampshirechronicle.co.uk',
      mobile: '07700900222',
      food_preference: 'Non Veg Food',
      status: 'confirmed',
      notes: 'Senior broadcast journalist & community columnist',
    },
    {
      first_name: 'Tariq',
      last_name: 'Mansoor',
      address: '15 Ocean Way, Ocean Village',
      town: 'Southampton',
      post_code: 'SO14 3TJ',
      email: 'tariq.mansoor@oceanmaritime.com',
      mobile: '07700900333',
      food_preference: 'Non Veg Food',
      status: 'confirmed',
      notes: 'Business leader & annual charity contributor',
    },
    {
      first_name: 'Ananya',
      last_name: 'Deshmukh',
      address: '64 Hill Lane',
      town: 'Southampton',
      post_code: 'SO15 5DB',
      email: 'ananya.deshmukh@solenthealthcare.nhs.uk',
      mobile: '07700900444',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'NHS Community Outreach Lead & Radio Health segment contributor',
    },
    {
      first_name: 'Christopher',
      last_name: 'O\'Connor',
      address: '18 Above Bar Street',
      town: 'Southampton',
      post_code: 'SO14 7DU',
      email: 'c.oconnor@mayflower.org.uk',
      mobile: '07700900555',
      food_preference: 'Non Veg Food',
      status: 'confirmed',
      notes: 'Mayflower Theatre community arts partner',
    },
    {
      first_name: 'Meena',
      last_name: 'Kumari',
      address: '93 Bevois Valley Road',
      town: 'Southampton',
      post_code: 'SO14 0JZ',
      email: 'meena.kumari@vedicculturalcentre.org',
      mobile: '07700900666',
      food_preference: 'Veg Food',
      status: 'confirmed',
      notes: 'Senior citizen welfare champion',
    },
  ];

  for (const reg of previousGalaGuests) {
    const [existing] = await connection.execute(
      'SELECT id FROM registrations WHERE email = ? LIMIT 1',
      [reg.email]
    );

    if (existing.length === 0) {
      await connection.execute(
        `INSERT INTO registrations 
         (first_name, last_name, address, town, post_code, email, mobile, food_preference, gdpr_consent, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
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
          reg.notes,
        ]
      );
      console.log(`✓ Seeded previous guest: ${reg.first_name} ${reg.last_name} (${reg.email})`);
    } else {
      console.log(`- Guest already in DB: ${reg.first_name} ${reg.last_name}`);
    }
  }

  const [count] = await connection.query('SELECT COUNT(*) as total FROM registrations WHERE deleted_at IS NULL');
  console.log(`\nAll done! Total active registrations in database: ${count[0].total}`);

  await connection.end();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
