const astriaService = require('../services/astriaService');
const imageModel = require('../models/imageModel');

// Görsel oluşturma isteği
const generateImage = async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;
    const userId = req.user.id;

    // Validasyonlar
    if (!imageUrl || !prompt) {
      return res.status(400).json({ error: 'Görsel URL ve prompt zorunludur' });
    }

    // Yeni görsel kaydı oluştur
    const image = await imageModel.createImage({
      user_id: userId,
      original_url: imageUrl,
      prompt: prompt,
      status: 'processing'
    });

    // Astria API'yi çağır
    const astriaResponse = await astriaService.generateImage(imageUrl, prompt);

    // Image kaydını güncelle
    await imageModel.updateGeneratedImage(image.id, {
      job_id: astriaResponse.id,
      status: 'processing'
    });

    res.json({
      message: 'Görsel oluşturma başlatıldı',
      imageId: image.id,
      jobId: astriaResponse.id
    });
  } catch (error) {
    console.error('Görsel oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Görsel oluşturma durumu kontrolü
const checkGenerationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await astriaService.checkGenerationStatus(jobId);

    if (status.status === 'completed' && status.images && status.images.length > 0) {
      // Image kaydını güncelle
      await imageModel.updateGeneratedImage(req.query.imageId, {
        generated_url: status.images[0],
        status: 'completed'
      });
    } else if (status.status === 'failed') {
      await imageModel.updateGeneratedImage(req.query.imageId, {
        status: 'failed',
        error: status.error
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Durum kontrolü hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcının görsellerini getir
const getUserImages = async (req, res) => {
  try {
    const userId = req.user.id;
    const images = await imageModel.getImagesByUserId(userId);
    res.json(images);
  } catch (error) {
    console.error('Kullanıcı görselleri getirme hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateImage,
  checkGenerationStatus,
  getUserImages
}; 