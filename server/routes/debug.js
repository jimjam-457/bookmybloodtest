const express = require('express');
const router = express.Router();
const { users } = require('../data');
const { requireAdmin } = require('../middleware/auth');

// Return limited user token info - admin only
router.get('/tokens', requireAdmin, (req, res) => {
  const list = users.map(u => ({ id: u.id, email: u.email, token: u.token || null, tokenExpires: u.tokenExpires || null }));
  res.json(list);
});

module.exports = router;
