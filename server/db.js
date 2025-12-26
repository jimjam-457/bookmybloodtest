const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
});

async function query(text, params) {
  const res = await pool.query(text, params);
  return res;
}

module.exports = { pool, query };
