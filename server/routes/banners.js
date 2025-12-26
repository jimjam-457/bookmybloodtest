const express = require('express');
const router = express.Router();
const { query } = require('../db');

// Database-backed banners

// GET /api/banners - return all banners (non-auth)
router.get('/', async (req, res) => {
  const r = await query('SELECT id, title, subtitle, image_url AS imageUrl, package_slug AS packageSlug FROM banners WHERE active=true ORDER BY id');
  res.set('Cache-Control', 'public, max-age=300');
  return res.json(r.rows);
});

// POST /api/banners - add a banner (admin UI may call this)
// Minimal validation and id assignment
router.post('/', async (req, res) => {
  const { title, subtitle, imageUrl, packageSlug } = req.body || {};
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const r = await query('INSERT INTO banners (title, subtitle, image_url, package_slug) VALUES ($1,$2,$3,$4) RETURNING id,title,subtitle,image_url AS imageUrl,package_slug AS packageSlug', [title, subtitle || '', imageUrl || '', packageSlug || null]);
  res.status(201).json(r.rows[0]);
});

// Optional: simple search by q param (e.g. /api/banners?q=home)
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  if (!q) {
    const all = await query('SELECT id, title, subtitle, image_url AS imageUrl, package_slug AS packageSlug FROM banners ORDER BY id');
    return res.json(all.rows);
  }
  const r = await query('SELECT id, title, subtitle, image_url AS imageUrl, package_slug AS packageSlug FROM banners WHERE LOWER(title || \' \' || COALESCE(subtitle, \'\')) LIKE $1', [`%${q}%`]);
  res.json(r.rows);
});

// DELETE /api/banners/:id - remove a banner (admin)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.query.id || req.params.id, 10);
  const r = await query('DELETE FROM banners WHERE id=$1', [id]);
  if (r.rowCount === 0) return res.status(404).json({ message: 'Banner not found' });
  res.json({ message: 'Banner deleted', id });
});

// PUT /api/banners/:id - update a banner
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, subtitle, imageUrl, packageSlug, active } = req.body || {};
  const r = await query('UPDATE banners SET title=COALESCE($2,title), subtitle=COALESCE($3,subtitle), image_url=COALESCE($4,image_url), package_slug=COALESCE($5,package_slug), active=COALESCE($6,active) WHERE id=$1 RETURNING id,title,subtitle,image_url AS imageUrl,package_slug AS packageSlug,active', [id, title, subtitle, imageUrl, packageSlug, active]);
  if (!r.rows.length) return res.status(404).json({ message: 'Banner not found' });
  res.json(r.rows[0]);
});

module.exports = router;
