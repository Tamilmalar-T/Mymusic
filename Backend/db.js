const { Pool, Client } = require("pg");

const connectionString = process.env.DATABASE_URL || process.env.PG_URI;
const isVercel = !!process.env.VERCEL;
const isProduction = process.env.NODE_ENV === "production" || isVercel;

// Detect if we are connecting to a local host or external cloud host
const isLocalhost = !connectionString 
  ? (!process.env.PGHOST || process.env.PGHOST === "localhost" || process.env.PGHOST === "127.0.0.1")
  : (connectionString.includes("localhost") || connectionString.includes("127.0.0.1"));

// Cloud PostgreSQL providers (Neon, Supabase, Render, Railway, RDS, etc.) require SSL
const useSsl = process.env.PGSSL === "true" 
  || (!isLocalhost && !isVercel ? true : false)
  || (!isLocalhost)
  || (connectionString && connectionString.includes("sslmode=require"));

function getPoolConfig(dbNameOverride) {
  if (connectionString) {
    let connStr = connectionString;
    if (dbNameOverride) {
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
    port: parseInt(process.env.PGPORT || "5432", 10),
    ssl: useSsl ? { rejectUnauthorized: false } : false
  };
}

let pool = new Pool(getPoolConfig());

async function ensureDatabaseExists() {
  // Only attempt auto-creation on local PostgreSQL. Cloud hosts do not allow CREATE DATABASE via app connections.
  if (!isLocalhost) return;

  const targetDb = process.env.PGDATABASE || "mymusic";
  try {
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
        console.log("Falling back to default 'postgres' database...");
        await pool.end().catch(() => {});
        pool = new Pool(getPoolConfig("postgres"));
      }
    } else {
      throw error;
    }
  }
}

let initPromise = null;

async function initDb() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // If running on Vercel without a cloud database configured
    if (isVercel && isLocalhost) {
      const vercelErr = new Error(
        "DATABASE_URL is not configured for Vercel. Vercel serverless functions cannot connect to localhost:5432. " +
        "Please create a free cloud PostgreSQL database (e.g. Neon.tech, Supabase, or Render) and add DATABASE_URL in Vercel Project Settings > Environment Variables."
      );
      vercelErr.status = 500;
      throw vercelErr;
    }

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
  })().catch((err) => {
    initPromise = null; // Reset so retry is possible
    throw err;
  });

  return initPromise;
}

module.exports = {
  get pool() {
    return pool;
  },
  query: async (text, params) => {
    // If running on Vercel and pointing to localhost, provide actionable error
    if (isVercel && isLocalhost) {
      throw new Error(
        "DATABASE_URL is not configured in Vercel Environment Variables. Vercel serverless functions cannot reach localhost:5432. Please set DATABASE_URL in Vercel Project Settings."
      );
    }
    // Ensure DB tables exist before running queries
    try {
      await initDb();
    } catch (e) {
      // If table init failed, rethrow with clear context
      if (!isLocalhost || isVercel) {
        throw e;
      }
    }
    return pool.query(text, params);
  },
  initDb
};
