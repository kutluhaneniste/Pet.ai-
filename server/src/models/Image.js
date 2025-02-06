const db = require('../config/database');

const createImagesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      original_url TEXT NOT NULL,
      generated_url TEXT,
      prompt TEXT NOT NULL,
      job_id TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Images tablosu başarıyla oluşturuldu');
  } catch (error) {
    console.error('Images tablosu oluşturma hatası:', error);
  }
};

const createImage = async ({ userId, originalUrl, prompt, status = 'pending' }) => {
  const query = `
    INSERT INTO images (user_id, original_url, prompt, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  try {
    const values = [userId, originalUrl, prompt, status];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Görsel kaydı oluşturma hatası: ' + error.message);
  }
};

const updateJobId = async (imageId, jobId) => {
  const query = `
    UPDATE images
    SET job_id = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [jobId, imageId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Job ID güncelleme hatası: ' + error.message);
  }
};

const updateGeneratedImage = async (imageId, generatedUrl, status = 'completed') => {
  const query = `
    UPDATE images
    SET 
      generated_url = $1,
      status = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [generatedUrl, status, imageId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Oluşturulan görsel güncelleme hatası: ' + error.message);
  }
};

const updateStatus = async (imageId, status) => {
  const query = `
    UPDATE images
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [status, imageId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Durum güncelleme hatası: ' + error.message);
  }
};

const getImageById = async (imageId) => {
  const query = `
    SELECT *
    FROM images
    WHERE id = $1;
  `;

  try {
    const result = await db.query(query, [imageId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Görsel getirme hatası: ' + error.message);
  }
};

const getImagesByUserId = async (userId) => {
  const query = `
    SELECT *
    FROM images
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw new Error('Kullanıcı görsellerini getirme hatası: ' + error.message);
  }
};

module.exports = {
  createImagesTable,
  createImage,
  updateJobId,
  updateGeneratedImage,
  updateStatus,
  getImageById,
  getImagesByUserId
}; 