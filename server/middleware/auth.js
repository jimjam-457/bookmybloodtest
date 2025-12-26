const { query } = require('../db');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    return next(); // no auth, continue as guest
  }
  const parts = auth.split(' ');
  if (parts.length !== 2) {
    return next();
  }
  const token = parts[1];
  query('SELECT id, name, email, role FROM users WHERE token=$1', [token])
    .then(r => {
      const user = r.rows[0];
      if (user) {
        req.user = user;
      }
      next();
    })
    .catch(() => next());
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

module.exports = { authMiddleware, requireAuth, requireAdmin };
