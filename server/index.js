const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend to communicate with backend
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,https://bookmybloodtest.vercel.app')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

console.log('Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  origin(origin, cb) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return cb(null, true);
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowing origin ${origin}`);
      return cb(null, true);
    }
    console.warn(`CORS: Blocking origin ${origin}`);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply authentication middleware to ALL requests
app.use(authMiddleware);

// Health
try {
  const { query } = require('./db');
  app.get('/api/health', async (req, res) => {
    try {
      await query('SELECT 1');
      return res.json({ ok: true, db: true });
    } catch (e) {
      return res.status(503).json({ ok: false, db: false });
    }
  });
} catch (e) {
  app.get('/api/health', (req, res) => res.status(503).json({ ok: false, db: false }));
}

// Root route to avoid 404 for GET /
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Blood Test Booking API</title></head>
      <body style="font-family:system-ui,Arial;margin:24px;">
        <h1>Blood Test Booking API</h1>
        <p>Server is running. Use the API endpoints under <code>/api/</code></p>
        <ul>
          <li><a href="/api/tests">/api/tests</a> (if implemented)</li>
          <li><a href="/api/auth">/api/auth</a> (if implemented)</li>
          <li><a href="/api/bookings">/api/bookings</a> (if implemented)</li>
        </ul>
      </body>
    </html>
  `);
});

// Try to mount API routes if the route files exist
try {
  const authRoutes = require('./routes/auth');
  const testsRoutes = require('./routes/tests');
  const bookingsRoutes = require('./routes/bookings');
  const uploadsRoutes = require('./routes/uploads');

  app.use('/api/auth', authRoutes);
  app.use('/api/tests', testsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/uploads', uploadsRoutes);
  // Debug routes - only enabled in development
  if (process.env.NODE_ENV !== 'production') {
    try {
      const debugRouter = require('./routes/debug');
      app.use('/api/debug', debugRouter);
    } catch (err) {
      // no-op
    }
  }

  try {
    const bannersRoutes = require('./routes/banners');
    app.use('/api/banners', bannersRoutes);
  } catch (err) {
    // banners route may not exist yet
    // console.debug('banners route not mounted:', err.message);
  }
  try {
    const analyticsRoutes = require('./routes/analytics');
    app.use('/api/analytics', analyticsRoutes);
  } catch (err) {
  }
  try {
    const paymentsRoutes = require('./routes/payments');
    app.use('/api/payments', paymentsRoutes);
  } catch (err) {
  }
} catch (err) {
  // If route files are not present yet, continue — root route prevents 404 for GET /
  // console.debug('Some API route files not found yet:', err.message);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
