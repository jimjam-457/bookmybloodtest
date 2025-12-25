const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply authentication middleware to ALL requests
app.use(authMiddleware);

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
} catch (err) {
  // If route files are not present yet, continue — root route prevents 404 for GET /
  // console.debug('Some API route files not found yet:', err.message);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
