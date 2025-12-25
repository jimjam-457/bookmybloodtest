const express = require('express');
const router = express.Router();
const { bookings, getNextBookingId } = require('../data');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  if (req.user && req.user.role === 'admin') {
    return res.json(bookings);
  }
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const userBookings = bookings.filter(b => b.userId === req.user.id);
  res.json(userBookings);
});

router.post('/', requireAuth, (req, res) => {
  const { tests: testItems, patient, address, collectionType, datetime, paymentMethod } = req.body;
  if (!testItems || !patient || !collectionType || !datetime || !address) return res.status(400).json({ message: 'Missing fields' });

  const id = getNextBookingId();
  const total = testItems.reduce((s,t)=>s+(t.price||0),0);
  // set paymentStatus based on method: CARD or UPI -> PAID (mock), COD -> PENDING
  let paymentStatus = 'PENDING';
  if (paymentMethod === 'CARD' || paymentMethod === 'UPI') paymentStatus = 'PAID';
  const booking = {
    id,
    userId: req.user.id,
    tests: testItems,
    patient,
    address: {
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      country: address.country || 'India'
    },
    collectionType,
    datetime,
    paymentMethod: paymentMethod || 'CARD',
    paymentStatus,
    total,
    status: 'Pending'
  };
  bookings.push(booking);
  res.json(booking);
});

router.put('/:id/status', requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const b = bookings.find(x => x.id === id);
  if (!b) return res.status(404).json({ message: 'Not found' });
  const { status } = req.body;
  b.status = status;
  res.json(b);
});

router.put('/:id/cancel', requireAuth, (req, res) => {
  const id = parseInt(req.params.id);
  const b = bookings.find(x => x.id === id && x.userId === req.user.id);
  if (!b) return res.status(404).json({ message: 'Not found or not owner' });
  b.status = 'Cancelled';
  res.json(b);
});

module.exports = router;
