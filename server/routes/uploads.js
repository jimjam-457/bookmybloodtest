const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../db');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// POST /api/uploads - upload an image
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' });
  }
  // Return the URL to access the uploaded image
  const imageUrl = `/uploads/${req.file.filename}`;
  const meta = { 
    message: 'Image uploaded successfully',
    imageUrl,
    filename: req.file.filename
  };
  try {
    const userId = req.user?.id || null;
    await query('INSERT INTO uploads (user_id, url, filename) VALUES ($1,$2,$3)', [userId, imageUrl, req.file.filename]);
  } catch (err) {}
  res.json(meta);
});

// DELETE /api/uploads/:filename - delete an uploaded image
router.delete('/:filename', (req, res) => {
  const filename = req.params.filename;
  // Prevent directory traversal attacks
  if (filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ message: 'Invalid filename' });
  }
  const filepath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  fs.unlinkSync(filepath);
  res.json({ message: 'Image deleted', filename });
});

module.exports = router;
