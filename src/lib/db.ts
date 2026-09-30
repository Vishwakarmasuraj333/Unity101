import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

// Support Aiven MySQL SSL requirements
const isSslRequired =
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_HOST && process.env.DATABASE_HOST.includes('aivencloud.com')) ||
  (process.env.DATABASE_PORT && Number(process.env.DATABASE_PORT) !== 3306);

const sslConfig = isSslRequired
  ? {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
    }
  : undefined;

const poolConfig: mysql.PoolOptions = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      dateStrings: true,
      ssl: sslConfig,
    }
  : {
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'unity101_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      dateStrings: true,
      ssl: sslConfig,
    };

const pool = global._mysqlPool || mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

export async function query<T = unknown>(
  sql: string,
  params: (string | number | boolean | null | undefined)[] = []
): Promise<T> {
  const sanitized = params.map((p) => (p === undefined ? null : p));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results] = await pool.query(sql, sanitized as any);
  return results as T;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('MySQL connection check failed:', error);
    return false;
  }
}

export default pool;
