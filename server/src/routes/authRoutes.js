const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Üyelik ve giriş rotaları
router.post('/register', authController.register);
router.post('/login', authController.login);

// Profil rotaları (kimlik doğrulama gerekli)
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router; 