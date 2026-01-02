const { Pool, types } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

types.setTypeParser(1700, (val) => parseFloat(val));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}
const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(sqlPath)) {
      console.error('schema.sql not found');
      return;
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql.split(/;\s*\n/).filter(Boolean);
    for (const stmt of statements) {
      if (stmt.trim()) {
        await query(stmt);
      }
    }
    console.log('Database schema ensured.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err);
    // Don't throw, let the app start even if DB init fails (might be transient)
  }
}

module.exports = { pool, query, initDb };
