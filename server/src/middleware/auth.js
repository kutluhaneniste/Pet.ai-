const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // User bilgisini request'e ekle
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Geçersiz token' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    next();
  } catch (error) {
    console.error('Admin yetki kontrolü hatası:', error);
    res.status(500).json({ error: 'Yetki kontrolü sırasında bir hata oluştu' });
  }
};

module.exports = {
  auth,
  isAdmin
}; 