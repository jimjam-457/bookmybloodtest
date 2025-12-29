const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Database-backed banners
const FALLBACK_BANNERS = [
  { id: 1, title: 'Full Body Checkup', subtitle: 'Popular package', imageUrl: '/uploads/demo-full-body.jpg', packageSlug: 'full-body' },
  { id: 2, title: 'Thyroid Panel', subtitle: 'T3/T4/TSH', imageUrl: '/uploads/demo-thyroid.jpg', packageSlug: 'thyroid-panel' },
  { id: 3, title: 'Diabetes Care', subtitle: 'HbA1c + FBS', imageUrl: '/uploads/demo-diabetes.jpg', packageSlug: 'diabetes-care' },
];

// GET /api/banners - return all banners (non-auth)
router.get('/', async (req, res) => {
  try {
    const r = await query('SELECT id, title, subtitle, image_url AS imageUrl, package_slug AS packageSlug FROM banners WHERE active=true ORDER BY id');
    res.set('Cache-Control', 'public, max-age=300');
    return res.json(r.rows);
  } catch (e) {
    // Return graceful fallback for local dev without DB
    res.set('Cache-Control', 'no-store');
    return res.json(FALLBACK_BANNERS);
  }
});

// POST /api/banners - add a banner (admin UI may call this)
// Minimal validation and id assignment
router.post('/', async (req, res) => {
  const { title, subtitle, imageUrl, packageSlug } = req.body || {};
  if (!title) return res.status(400).json({ message: 'Title is required' });
  try {
    const r = await query('INSERT INTO banners (title, subtitle, image_url, package_slug) VALUES ($1,$2,$3,$4) RETURNING id,title,subtitle,image_url AS imageUrl,package_slug AS packageSlug', [title, subtitle || '', imageUrl || '', packageSlug || null]);
    res.status(201).json(r.rows[0]);
  } catch (e) {
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

// Optional: simple search by q param (e.g. /api/banners?q=home)
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  if (!q) {
    try {
      const all = await query('SELECT id, title, subtitle, image_url AS imageUrl, package_slug AS packageSlug FROM banners ORDER BY id');
      return res.json(all.rows);
    } catch (e) {
      return res.status(503).json([]);
    }
  }
  try {
    const r = await query('SELECT id, title, subtitle, image_url AS imageUrl, package_slug AS packageSlug FROM banners WHERE LOWER(title || \' \' || COALESCE(subtitle, \'\')) LIKE $1', [`%${q}%`]);
    res.json(r.rows);
  } catch (e) {
    return res.status(503).json([]);
  }
});

// DELETE /api/banners/:id - remove a banner (admin)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.query.id || req.params.id, 10);
  try {
    const r = await query('DELETE FROM banners WHERE id=$1', [id]);
    if (r.rowCount === 0) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted', id });
  } catch (e) {
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

// PUT /api/banners/:id - update a banner
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, subtitle, imageUrl, packageSlug, active } = req.body || {};
  try {
    const r = await query('UPDATE banners SET title=COALESCE($2,title), subtitle=COALESCE($3,subtitle), image_url=COALESCE($4,image_url), package_slug=COALESCE($5,package_slug), active=COALESCE($6,active) WHERE id=$1 RETURNING id,title,subtitle,image_url AS imageUrl,package_slug AS packageSlug,active', [id, title, subtitle, imageUrl, packageSlug, active]);
    if (!r.rows.length) return res.status(404).json({ message: 'Banner not found' });
    res.json(r.rows[0]);
  } catch (e) {
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

module.exports = router;
