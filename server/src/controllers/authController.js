const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Üye kaydı
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur' });
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi giriniz' });
    }

    // Şifre uzunluğu kontrolü
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Email kullanımda mı kontrolü
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await User.createUser({
      email,
      password: hashedPassword,
      name
    });

    // Token oluştur
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu' });
  }
};

// Giriş yapma
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur' });
    }

    // Kullanıcıyı bul
    const user = await User.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Token oluştur
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
  }
};

// Profil bilgilerini getir
const getProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ error: 'Profil bilgileri getirilirken bir hata oluştu' });
  }
};

// Profil güncelleme
const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Kullanıcıyı bul
    const user = await User.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Güncellenecek alanları topla
    const updates = {};
    
    if (name) updates.name = name;
    
    if (email && email !== user.email) {
      // Email formatı kontrolü
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Geçerli bir email adresi giriniz' });
      }
      
      // Email kullanımda mı kontrolü
      const existingUser = await User.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Bu email adresi zaten kullanımda' });
      }
      
      updates.email = email;
    }

    // Şifre değişikliği varsa
    if (currentPassword && newPassword) {
      // Mevcut şifreyi kontrol et
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Mevcut şifre hatalı' });
      }

      // Yeni şifre uzunluğu kontrolü
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalıdır' });
      }

      // Yeni şifreyi hashle
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    // Kullanıcıyı güncelle
    if (Object.keys(updates).length > 0) {
      await User.updateUser(userId, updates);
    }

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: {
        id: userId,
        email: updates.email || user.email,
        name: updates.name || user.name
      }
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ error: 'Profil güncellenirken bir hata oluştu' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
}; 