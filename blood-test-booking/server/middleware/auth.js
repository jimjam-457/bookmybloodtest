const { users } = require('../data');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) {
    console.log(`Auth: no Authorization header in ${req.method} ${req.path}`);
    return next(); // no auth, continue as guest
  }
  const parts = auth.split(' ');
  if (parts.length !== 2) {
    console.log(`Auth: invalid Authorization format in ${req.method} ${req.path}`);
    return next();
  }
  const token = parts[1];
  console.log(`Auth: checking token ${token.slice(0, 8)}... against ${users.length} users`);
  const user = users.find(u => u.token === token);
  if (user) {
    console.log(`Auth: token valid for ${user.email}`);
    // token is valid - attach user to request
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  } else {
    console.log(`Auth: token ${token.slice(0, 8)}... not found in users`);
  }
  next();
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
