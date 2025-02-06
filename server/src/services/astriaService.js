const fetch = require('node-fetch');

class AstriaService {
  constructor() {
    this.apiKey = process.env.ASTRIA_API_KEY;
    this.baseUrl = process.env.ASTRIA_API_URL || 'https://api.astria.ai/v1';
  }

  async generateImage(imageUrl, prompt) {
    try {
      // Model ID'leri: https://docs.astria.ai/docs/models-list
      const response = await fetch(`${this.baseUrl}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt: prompt,
          model_id: 'sdxl-base-1.0', // SDXL 1.0 modeli
          negative_prompt: 'blurry, low quality, distorted, deformed',
          num_images: 1,
          guidance_scale: 7.5,
          steps: 30,
          seed: -1, // Rastgele seed
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Görsel oluşturma hatası');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Astria API hatası:', error);
      throw error;
    }
  }

  async checkGenerationStatus(jobId) {
    try {
      const response = await fetch(`${this.baseUrl}/images/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Durum kontrolü hatası');
      }

      const data = await response.json();
      return {
        status: data.status,
        images: data.images,
        error: data.error
      };
    } catch (error) {
      console.error('Astria durum kontrolü hatası:', error);
      throw error;
    }
  }
}

module.exports = new AstriaService(); 