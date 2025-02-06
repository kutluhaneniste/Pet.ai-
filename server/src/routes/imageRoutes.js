const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const auth = require('../middleware/auth');

// Görsel oluşturma
router.post('/generate', auth, imageController.generateImage);

// Görsel oluşturma durumunu kontrol etme
router.get('/status/:jobId', auth, imageController.checkGenerationStatus);

// Kullanıcının tüm görsellerini getirme
router.get('/user', auth, imageController.getUserImages);

module.exports = router; 
