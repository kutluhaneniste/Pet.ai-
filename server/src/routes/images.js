const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Generate new image
router.post(
  '/generate',
  auth,
  upload.single('image'),
  imageController.generateImage
);

// Check generation status
router.get(
  '/status/:jobId',
  auth,
  imageController.getGenerationStatus
);

// Get user's images
router.get(
  '/user',
  auth,
  imageController.getUserImages
);

module.exports = router; 