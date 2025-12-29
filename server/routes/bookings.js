const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role === 'admin') {
    const { status, from, to, collectionType, city, pincode } = req.query;
    const where = [];
    const params = [];
    if (status) { params.push(status); where.push(`status=$${params.length}`); }
    if (collectionType) { params.push(collectionType); where.push(`collection_type=$${params.length}`); }
    if (city) { params.push(city); where.push(`city=$${params.length}`); }
    if (pincode) { params.push(pincode); where.push(`pincode=$${params.length}`); }
    if (from) { params.push(new Date(from)); where.push(`created_at >= $${params.length}`); }
    if (to) { params.push(new Date(to)); where.push(`created_at <= $${params.length}`); }
    const sql = `SELECT * FROM bookings ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`;
    const all = await query(sql, params);
    return res.json(all.rows);
  }
  const r = await query('SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
  res.json(r.rows);
});

// Detailed booking with joined items/tests
router.get('/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const br = await query('SELECT * FROM bookings WHERE id=$1', [id]);
  const booking = br.rows[0];
  if (!booking) return res.status(404).json({ message: 'Not found' });
  const ir = await query(
    `SELECT bi.test_id AS id, t.name, t.sample, t.fasting, bi.price 
     FROM booking_items bi LEFT JOIN tests t ON t.id=bi.test_id 
     WHERE bi.booking_id=$1`, 
    [id]
  );
  booking.items = ir.rows;
  res.json(booking);
});

router.post('/', requireAuth, async (req, res) => {
  const { tests: testItems, patient, address, collectionType, datetime, paymentMethod, paymentId } = req.body;
  if (!testItems || !patient || !collectionType || !datetime || !address) return res.status(400).json({ message: 'Missing fields' });
  const total = testItems.reduce((s,t)=>s+(t.price||0),0);
  const r = await query(
    `INSERT INTO bookings 
    (user_id, patient_name, age, gender, phone, email, address_line1, address_line2, landmark, city, state, pincode, country, collection_type, datetime, total, status, payment_method, payment_status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING id`,
    [
      req.user.id,
      patient.name, patient.age||null, patient.gender||null, patient.phone||null, patient.email||null,
      address.addressLine1||'', address.addressLine2||'', address.landmark||'', address.city||'', address.state||'', address.pincode||'', address.country||'India',
      collectionType, new Date(datetime), total, 'Pending', 'COD', 'PENDING'
    ]
  );
  const bookingId = r.rows[0].id;
  for (const it of testItems) {
    await query('INSERT INTO booking_items (booking_id, test_id, price) VALUES ($1,$2,$3)', [bookingId, it.id, it.price||0]);
  }
  if (paymentId) {
    await query('UPDATE payments SET booking_id=$1 WHERE id=$2 AND user_id=$3', [bookingId, paymentId, req.user.id]);
  }
  res.json({ id: bookingId });
});

router.put('/:id/status', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const r = await query('UPDATE bookings SET status=$2 WHERE id=$1 RETURNING *', [id, status]);
  if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(r.rows[0]);
});

router.put('/:id/cancel', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const r = await query('UPDATE bookings SET status=$2 WHERE id=$1 AND user_id=$3 RETURNING *', [id, 'Cancelled', req.user.id]);
  if (!r.rows.length) return res.status(404).json({ message: 'Not found or not owner' });
  res.json(r.rows[0]);
});

// Booking notes (admin)
router.get('/:id/notes', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const r = await query('SELECT bn.id, bn.note, bn.created_at, u.name AS admin_name FROM booking_notes bn LEFT JOIN users u ON u.id=bn.admin_id WHERE bn.booking_id=$1 ORDER BY bn.created_at DESC', [id]);
  res.json(r.rows);
});
router.post('/:id/notes', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { note } = req.body;
  if (!note || !note.trim()) return res.status(400).json({ message: 'Note required' });
  const r = await query('INSERT INTO booking_notes (booking_id, admin_id, note) VALUES ($1,$2,$3) RETURNING id, note, created_at', [id, req.user.id, note.trim()]);
  res.status(201).json(r.rows[0]);
});

// Booking stats and SLA (admin)
router.get('/stats', requireAdmin, async (req, res) => {
  const statusR = await query('SELECT status, COUNT(*)::int AS count FROM bookings GROUP BY status');
  const byDayR = await query(`
    SELECT created_at::date AS date, COUNT(*)::int AS count
    FROM bookings
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY created_at::date
    ORDER BY created_at::date DESC
    LIMIT 7
  `);
  const byWeekR = await query(`
    SELECT date_trunc('week', created_at) AS week, COUNT(*)::int AS count
    FROM bookings
    WHERE created_at >= NOW() - INTERVAL '28 days'
    GROUP BY date_trunc('week', created_at)
    ORDER BY date_trunc('week', created_at) DESC
    LIMIT 4
  `);
  const slaR = await query(`
    SELECT bucket, COUNT(*)::int AS count FROM (
      SELECT CASE 
        WHEN NOW() - created_at < INTERVAL '24 hours' THEN 'lt24h'
        WHEN NOW() - created_at < INTERVAL '48 hours' THEN '24to48h'
        ELSE 'gt48h'
      END AS bucket
      FROM bookings
      WHERE status IN ('Pending','In Progress')
    ) x GROUP BY bucket
  `);
  const statusCounts = {};
  for (const row of statusR.rows) statusCounts[row.status] = row.count;
  const slaBuckets = {};
  for (const row of slaR.rows) slaBuckets[row.bucket] = row.count;
  res.json({
    statusCounts,
    byDay: byDayR.rows.map(r => ({ date: r.date, count: r.count })),
    byWeek: byWeekR.rows.map(r => ({ week: r.week, count: r.count })),
    slaBuckets
  });
});

module.exports = router;
