const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/initiate', requireAuth, async (req, res) => {
  const { amount, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  const vpa = process.env.UPI_VPA || 'test@upi';
  const payee = process.env.UPI_NAME || 'ThyroLab';
  const upiLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payee)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || 'Blood Test Booking')}`;
  const r = await query('INSERT INTO payments (user_id, method, amount, status, upi_link) VALUES ($1,$2,$3,$4,$5) RETURNING *', [req.user.id, 'UPI', amount, 'INITIATED', upiLink]);
  res.json(r.rows[0]);
});

router.post('/confirm', requireAuth, async (req, res) => {
  const { paymentId, utr, proofUrl, bookingId } = req.body;
  const r = await query('UPDATE payments SET utr=COALESCE($2,utr), proof_url=COALESCE($3,proof_url), status=$4, booking_id=COALESCE($5,booking_id) WHERE id=$1 AND user_id=$6 RETURNING *', [
    parseInt(paymentId), utr || null, proofUrl || null, 'SUBMITTED', bookingId || null, req.user.id
  ]);
  if (!r.rows.length) return res.status(404).json({ message: 'Payment not found' });
  if (bookingId) {
    await query('UPDATE bookings SET payment_status=$2 WHERE id=$1', [bookingId, 'SUBMITTED']);
  }
  res.json(r.rows[0]);
});

router.put('/:id/verify', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const { bookingId } = req.body;
  const r = await query('UPDATE payments SET status=$2, verified_at=NOW() WHERE id=$1 RETURNING *', [id, 'PAID']);
  if (!r.rows.length) return res.status(404).json({ message: 'Payment not found' });
  if (bookingId) {
    await query('UPDATE bookings SET payment_status=$2 WHERE id=$1', [bookingId, 'PAID']);
  }
  res.json(r.rows[0]);
});

router.get('/', requireAdmin, async (req, res) => {
  const r = await query('SELECT * FROM payments ORDER BY created_at DESC');
  res.json(r.rows);
});

module.exports = router;
