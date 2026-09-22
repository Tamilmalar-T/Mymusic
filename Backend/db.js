const { Pool, Client } = require("pg");

const connectionString = process.env.DATABASE_URL || process.env.PG_URI;

const isProduction = process.env.NODE_ENV === "production";
const useSsl = process.env.PGSSL === "true" || (connectionString && connectionString.includes("sslmode=require"));

function getPoolConfig(dbNameOverride) {
  if (connectionString) {
    let connStr = connectionString;
    if (dbNameOverride) {
      // replace pathname in URL
      try {
        const parsed = new URL(connStr);
        parsed.pathname = "/" + dbNameOverride;
        connStr = parsed.toString();
      } catch (e) {}
    }
    return {
      connectionString: connStr,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    };
  }

  return {
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "localhost",
    database: dbNameOverride || process.env.PGDATABASE || "mymusic",
    password: process.env.PGPASSWORD || "postgres",
    port: parseInt(process.env.PGPORT || "5432", 10)
  };
}

let pool = new Pool(getPoolConfig());

async function ensureDatabaseExists() {
  const targetDb = process.env.PGDATABASE || "mymusic";
  try {
    // Try connecting
    const client = await pool.connect();
    client.release();
  } catch (error) {
    if (error.code === "3D000") { // database does not exist
      console.log(`Database "${targetDb}" does not exist. Creating it automatically...`);
      try {
        const rootClientConfig = getPoolConfig("postgres");
        const client = new Client(rootClientConfig);
        await client.connect();
        await client.query(`CREATE DATABASE "${targetDb}"`);
        await client.end();
        console.log(`Database "${targetDb}" created successfully.`);

        // Re-create pool targeting newly created database
        await pool.end().catch(() => {});
        pool = new Pool(getPoolConfig(targetDb));
      } catch (createErr) {
        console.error("Failed to auto-create database:", createErr.message);
        // Fallback to connecting to default 'postgres' database
        console.log("Falling back to default 'postgres' database...");
        await pool.end().catch(() => {});
        pool = new Pool(getPoolConfig("postgres"));
      }
    } else {
      throw error;
    }
  }
}

async function initDb() {
  await ensureDatabaseExists();

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createSongsTable = `
    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      artist VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      image_url TEXT,
      audio_data BYTEA,
      audio_content_type VARCHAR(100),
      image_data BYTEA,
      image_content_type VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(createUsersTable);
  await pool.query(createSongsTable);
  console.log("PostgreSQL tables initialized successfully.");
}

module.exports = {
  get pool() {
    return pool;
  },
  query: (text, params) => pool.query(text, params),
  initDb
};
