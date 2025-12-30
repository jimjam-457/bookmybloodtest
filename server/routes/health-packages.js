const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/health-packages - get all active packages
router.get('/', async (req, res) => {
  try {
    const r = await query(`
      SELECT id, slug, title, description, price, icon, image_url AS imageUrl, best_for AS bestFor
      FROM health_packages 
      WHERE active = true 
      ORDER BY id
    `);
    res.set('Cache-Control', 'public, max-age=300');
    return res.json(r.rows);
  } catch (e) {
    console.error('Error fetching health packages:', e);
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

// GET /api/health-packages/:slug - get specific package with tests
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const pkgRes = await query(
      'SELECT id, slug, title, description, price, icon, image_url AS imageUrl, best_for AS bestFor FROM health_packages WHERE slug = $1 AND active = true',
      [slug]
    );
    if (pkgRes.rows.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    const pkg = pkgRes.rows[0];
    
    // Get associated tests
    const testsRes = await query(`
      SELECT t.id, t.name, t.description, t.price, t.fasting, t.sample
      FROM tests t
      JOIN health_package_tests hpt ON t.id = hpt.test_id
      WHERE hpt.package_id = $1
      ORDER BY t.name
    `, [pkg.id]);
    
    pkg.tests = testsRes.rows;
    res.json(pkg);
  } catch (e) {
    console.error('Error fetching package:', e);
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

// POST /api/health-packages - create package (admin)
router.post('/', async (req, res) => {
  const { slug, title, description, price, icon, imageUrl, bestFor, testIds } = req.body;
  
  if (!slug || !title) {
    return res.status(400).json({ message: 'Slug and title are required' });
  }
  
  try {
    // Create package
    const pkgRes = await query(
      'INSERT INTO health_packages (slug, title, description, price, icon, image_url, best_for) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, slug, title, description, price, icon, image_url AS imageUrl, best_for AS bestFor',
      [slug, title, description || '', parseFloat(price) || 0, icon || '', imageUrl || '', bestFor || '']
    );
    const pkg = pkgRes.rows[0];
    
    // Associate tests if provided
    if (Array.isArray(testIds) && testIds.length > 0) {
      for (const testId of testIds) {
        await query(
          'INSERT INTO health_package_tests (package_id, test_id) VALUES ($1, $2)',
          [pkg.id, parseInt(testId)]
        );
      }
    }
    
    res.status(201).json(pkg);
  } catch (e) {
    console.error('Error creating package:', e);
    if (e.message.includes('unique constraint')) {
      return res.status(400).json({ message: 'Package slug already exists' });
    }
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

// PUT /api/health-packages/:id - update package (admin)
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { slug, title, description, price, icon, imageUrl, bestFor, testIds } = req.body;
  
  try {
    const pkgRes = await query(
      'UPDATE health_packages SET slug = COALESCE($2, slug), title = COALESCE($3, title), description = COALESCE($4, description), price = COALESCE($5, price), icon = COALESCE($6, icon), image_url = COALESCE($7, image_url), best_for = COALESCE($8, best_for) WHERE id = $1 RETURNING id, slug, title, description, price, icon, image_url AS imageUrl, best_for AS bestFor',
      [id, slug, title, description, price !== undefined ? parseFloat(price) : null, icon, imageUrl, bestFor]
    );
    
    if (pkgRes.rows.length === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    
    const pkg = pkgRes.rows[0];
    
    // Update tests association if provided
    if (Array.isArray(testIds)) {
      // Delete old associations
      await query('DELETE FROM health_package_tests WHERE package_id = $1', [id]);
      // Add new associations
      for (const testId of testIds) {
        await query(
          'INSERT INTO health_package_tests (package_id, test_id) VALUES ($1, $2)',
          [id, parseInt(testId)]
        );
      }
    }
    
    res.json(pkg);
  } catch (e) {
    console.error('Error updating package:', e);
    if (e.message.includes('unique constraint')) {
      return res.status(400).json({ message: 'Package slug already exists' });
    }
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

// DELETE /api/health-packages/:id - delete package (admin)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  try {
    const r = await query('DELETE FROM health_packages WHERE id = $1', [id]);
    if (r.rowCount === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }
    res.json({ message: 'Package deleted', id });
  } catch (e) {
    console.error('Error deleting package:', e);
    return res.status(503).json({ message: 'Database unavailable' });
  }
});

module.exports = router;
