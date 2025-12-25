const express = require('express');
const router = express.Router();

// Simple in-memory banners store (safe default)
let banners = [
  { id: 1, title: 'Home Sample Collection', subtitle: 'We collect samples at your home', imageUrl: '/assets/banner1.svg', packageSlug: 'Hematology' },
  { id: 2, title: 'Fast Digital Reports', subtitle: 'View results online within 24-48 hours', imageUrl: '/assets/banner2.svg', packageSlug: 'Cardiac' },
  { id: 3, title: 'Diabetes Testing', subtitle: 'Comprehensive diabetes screening packages', imageUrl: '/assets/banner3.svg', packageSlug: 'Diabetes' },
  { id: 4, title: 'Thyroid Panel', subtitle: 'Complete thyroid health evaluation', imageUrl: '/assets/banner4.svg', packageSlug: 'Endocrine' }
];

// GET /api/banners - return all banners (non-auth)
router.get('/', (req, res) => {
  // Ensure full URLs for uploaded images
  const bannersWithFullUrls = banners.map(b => ({
    ...b,
    imageUrl: b.imageUrl && b.imageUrl.startsWith('/uploads') 
      ? `http://localhost:5000${b.imageUrl}` 
      : b.imageUrl
  }));
  return res.json(bannersWithFullUrls);
});

// POST /api/banners - add a banner (admin UI may call this)
// Minimal validation and id assignment
router.post('/', (req, res) => {
  const { title, subtitle, imageUrl, testId, packageSlug } = req.body || {};
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const newBanner = { 
    id: banners.length ? (banners[banners.length-1].id + 1) : 1, 
    title, 
    subtitle: subtitle || '', 
    imageUrl: imageUrl || '',
    testId: testId || null,
    packageSlug: packageSlug || null
  };
  banners.push(newBanner);
  // Return with full URL if it's an uploaded image
  const responseData = {
    ...newBanner,
    imageUrl: newBanner.imageUrl && newBanner.imageUrl.startsWith('/uploads')
      ? `http://localhost:5000${newBanner.imageUrl}`
      : newBanner.imageUrl
  };
  res.status(201).json(responseData);
});

// Optional: simple search by q param (e.g. /api/banners?q=home)
router.get('/search', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase();
  if (!q) return res.json(banners);
  const filtered = banners.filter(b => (b.title + ' ' + (b.subtitle||'')).toLowerCase().includes(q));
  res.json(filtered);
});

// DELETE /api/banners/:id - remove a banner (admin)
router.delete('/:id', (req, res) => {
  const id = parseInt(req.query.id || req.params.id, 10);
  const idx = banners.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Banner not found' });
  banners.splice(idx, 1);
  res.json({ message: 'Banner deleted', id });
});

module.exports = router;
