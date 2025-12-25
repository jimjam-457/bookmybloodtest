const express = require('express');
const router = express.Router();
const { payments, getNextPaymentId, bookings } = require('../data');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/initiate', requireAuth, (req, res) => {
  const { amount, note } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  const id = getNextPaymentId();
  const vpa = process.env.UPI_VPA || 'test@upi';
  const payee = process.env.UPI_NAME || 'ThyroLab';
  const upiLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payee)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note || 'Blood Test Booking')}`;
  const p = { id, userId: req.user.id, amount, method: 'UPI', status: 'INITIATED', upiLink, utr: null, proofUrl: null, bookingId: null, createdAt: Date.now() };
  payments.push(p);
  res.json(p);
});

router.post('/confirm', requireAuth, (req, res) => {
  const { paymentId, utr, proofUrl, bookingId } = req.body;
  const p = payments.find(x => x.id === parseInt(paymentId) && x.userId === req.user.id);
  if (!p) return res.status(404).json({ message: 'Payment not found' });
  p.utr = utr || p.utr;
  p.proofUrl = proofUrl || p.proofUrl;
  p.status = 'SUBMITTED';
  if (bookingId) {
    const b = bookings.find(x => x.id === parseInt(bookingId) && x.userId === req.user.id);
    if (b) {
      p.bookingId = b.id;
      b.paymentStatus = 'SUBMITTED';
    }
  }
  res.json(p);
});

router.put('/:id/verify', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const { bookingId } = req.body;
  const p = payments.find(x => x.id === id);
  if (!p) return res.status(404).json({ message: 'Payment not found' });
  p.status = 'PAID';
  if (bookingId) {
    const b = bookings.find(x => x.id === parseInt(bookingId));
    if (b) b.paymentStatus = 'PAID';
  }
  res.json(p);
});

router.get('/', requireAdmin, (req, res) => {
  res.json(payments);
});

module.exports = router;
