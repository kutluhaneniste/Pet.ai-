const multer = require('multer');

// Geçici olarak dosyaları memory'de tutuyoruz
// Daha sonra AWS S3'e yükleyeceğiz
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Sadece görsellere izin ver
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece görsel dosyaları yüklenebilir.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload; 