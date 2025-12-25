const express = require('express');
const router = express.Router();
const { tests, getNextTestId } = require('../data');
const { requireAdmin } = require('../middleware/auth');

router.get('/', (req, res) => {
  res.json(tests);
});

router.get('/:id', (req, res) => {
  const t = tests.find(x => x.id === parseInt(req.params.id));
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});

router.post('/', requireAdmin, (req, res) => {
  const { name, description, price, fasting, sample, category } = req.body;
  const newTest = { id: getNextTestId(), name, description, price: Number(price)||0, fasting: !!fasting, sample, category };
  tests.push(newTest);
  res.json(newTest);
});

router.put('/:id', requireAdmin, (req, res) => {
  const t = tests.find(x => x.id === parseInt(req.params.id));
  if (!t) return res.status(404).json({ message: 'Not found' });
  Object.assign(t, req.body);
  res.json(t);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const idx = tests.findIndex(x => x.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  tests.splice(idx,1);
  res.json({ message: 'Deleted' });
});

module.exports = router;
