const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role === 'admin') {
    const all = await query('SELECT * FROM bookings ORDER BY created_at DESC');
    return res.json(all.rows);
  }
  const r = await query('SELECT * FROM bookings WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
  res.json(r.rows);
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

module.exports = router;
