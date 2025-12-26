const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const r = await query('SELECT t.id, t.name, t.description, t.price, t.fasting, t.sample, c.name AS category FROM tests t LEFT JOIN test_categories c ON t.category_id=c.id WHERE t.active=true ORDER BY t.id');
  res.json(r.rows);
});

router.get('/:id', async (req, res) => {
  const r = await query('SELECT t.id, t.name, t.description, t.price, t.fasting, t.sample, c.name AS category FROM tests t LEFT JOIN test_categories c ON t.category_id=c.id WHERE t.id=$1', [parseInt(req.params.id)]);
  const t = r.rows[0];
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, description, price, fasting, sample, category_id } = req.body;
  const r = await query('INSERT INTO tests (name, description, price, fasting, sample, category_id) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,name,description,price,fasting,sample', [name, description, Number(price)||0, !!fasting, sample, category_id||null]);
  res.json(r.rows[0]);
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, description, price, fasting, sample, category_id, active } = req.body;
  const r = await query('UPDATE tests SET name=COALESCE($2,name), description=COALESCE($3,description), price=COALESCE($4,price), fasting=COALESCE($5,fasting), sample=COALESCE($6,sample), category_id=COALESCE($7,category_id), active=COALESCE($8,active) WHERE id=$1 RETURNING id,name,description,price,fasting,sample,category_id,active', [
    parseInt(req.params.id), name, description, price, fasting, sample, category_id, active
  ]);
  if (!r.rows.length) return res.status(404).json({ message: 'Not found' });
  res.json(r.rows[0]);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const r = await query('DELETE FROM tests WHERE id=$1', [parseInt(req.params.id)]);
  if (r.rowCount === 0) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
