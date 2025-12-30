const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { users } = require('../data');
const { query } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Return limited user token info - admin only
router.get('/tokens', requireAdmin, (req, res) => {
  const list = users.map(u => ({ id: u.id, email: u.email, token: u.token || null, tokenExpires: u.tokenExpires || null }));
  res.json(list);
});

// Run schema migration - admin only
router.post('/migrate', requireAdmin, async (req, res) => {
  try {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql.split(/;\s*\n/).filter(s => s.trim());
    
    let executed = 0;
    for (const stmt of statements) {
      if (stmt.trim()) {
        await query(stmt);
        executed++;
      }
    }
    
    res.json({ success: true, message: `Applied ${executed} schema statements` });
  } catch (e) {
    console.error('Migration failed:', e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
