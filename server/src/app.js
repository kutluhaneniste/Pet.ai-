const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Güvenlik ve performans middleware'leri
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Test endpoint'i
app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor' });
});

// Astria AI endpoint'i
app.post('/api/images/generate', async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;
    
    // Gelen verileri kontrol et
    if (!imageUrl || !prompt) {
      return res.status(400).json({ error: 'Görsel URL ve prompt zorunludur' });
    }

    // Astria API key'i kontrol et
    const astriaKey = process.env.ASTRIA_API_KEY;
    if (!astriaKey) {
      return res.status(500).json({ error: 'Astria API anahtarı bulunamadı' });
    }

    // Astria API'ye istek gönder
    const astriaResponse = await fetch('https://api.astria.ai/images/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${astriaKey}`
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: prompt,
        seed: Math.floor(Math.random() * 1000000), // Rastgele seed
        num_images: 1,
        guidance_scale: 7.5
      })
    });

    if (!astriaResponse.ok) {
      throw new Error('Astria API yanıt vermedi');
    }

    const astriaData = await astriaResponse.json();
    
    res.json({
      message: 'Görsel oluşturma başlatıldı',
      jobId: astriaData.job_id,
      imageId: astriaData.image_id,
      data: {
        imageUrl,
        prompt
      }
    });
  } catch (error) {
    console.error('Görsel oluşturma hatası:', error);
    res.status(500).json({ error: 'Görsel oluşturulurken bir hata oluştu' });
  }
});

// Görsel durumu endpoint'i
app.get('/api/images/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { imageId } = req.query;

    const astriaKey = process.env.ASTRIA_API_KEY;
    if (!astriaKey) {
      return res.status(500).json({ error: 'Astria API anahtarı bulunamadı' });
    }

    // Astria API'den durum kontrolü
    const statusResponse = await fetch(`https://api.astria.ai/images/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${astriaKey}`
      }
    });

    if (!statusResponse.ok) {
      throw new Error('Astria API durum kontrolü başarısız');
    }

    const statusData = await statusResponse.json();
    
    res.json({
      status: statusData.status,
      jobId: statusData.job_id,
      imageId: imageId,
      images: statusData.output_images || []
    });
  } catch (error) {
    console.error('Durum kontrolü hatası:', error);
    res.status(500).json({ error: 'Durum kontrol edilirken bir hata oluştu' });
  }
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Sunucu hatası' });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} kullanımda. Lütfen farklı bir port deneyin.`);
    process.exit(1);
  } else {
    console.error('Sunucu başlatılırken hata oluştu:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Sunucu kapatılıyor');
    process.exit(0);
  });
});

module.exports = app; 
