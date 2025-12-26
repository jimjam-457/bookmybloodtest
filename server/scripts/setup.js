const fs = require('fs');
const path = require('path');
const { query } = require('../db');

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
  const statements = sql.split(/;\s*\n/).filter(Boolean);
  for (const stmt of statements) {
    await query(stmt);
  }
  console.log('Database schema applied.');
}

run().catch(err => {
  console.error('DB setup failed:', err);
  process.exit(1);
});
