const express = require('express');
const router = express.Router();

let events = [];

router.post('/', (req, res) => {
  const { type, path, referrer, ua, ts } = req.body || {};
  const event = {
    type: type || 'page_view',
    path: typeof path === 'string' ? path : '/',
    referrer: typeof referrer === 'string' ? referrer : '',
    ua: typeof ua === 'string' ? ua : '',
    ts: ts && Number(ts) ? Number(ts) : Date.now()
  };
  events.push(event);
  if (events.length > 10000) events = events.slice(-5000);
  res.json({ ok: true });
});

router.get('/stats', (req, res) => {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  const recent = events.filter(e => e.ts >= since);
  const total = recent.length;
  const byPath = {};
  for (const e of recent) {
    byPath[e.path] = (byPath[e.path] || 0) + 1;
  }
  res.json({ total24h: total, byPath });
});

router.get('/events', (req, res) => {
  res.json(events.slice(-100).reverse());
});

module.exports = router;
