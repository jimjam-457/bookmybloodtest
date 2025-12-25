const express = require('express');
const router = express.Router();
const { users, getNextUserId } = require('../data');

function makeToken() {
  return Math.random().toString(36).slice(2);
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: 'Email exists' });
  const user = { id: getNextUserId(), name, email, password, role: 'user', token: null };
  users.push(user);
  const token = makeToken();
  user.token = token;
  console.log(`Auth: registered ${email}`);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log(`Auth: login attempt for ${email}, users array has ${users.length} users`);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const token = makeToken();
  user.token = token;
  console.log(`Auth: login ${email} assigned token ${token.slice(0, 8)}... user.token is now ${user.token.slice(0, 8)}...`);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

  // GET /api/auth/me - returns current user info (requires auth)
  router.get('/me', (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const u = users.find(x => x.id === req.user.id);
    return res.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  });

module.exports = router;
