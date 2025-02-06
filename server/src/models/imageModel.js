const db = require('../config/database');

const createImagesTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        original_url TEXT NOT NULL,
        generated_url TEXT,
        prompt TEXT NOT NULL,
        job_id TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Images table created successfully');
  } catch (error) {
    console.error('Error creating images table:', error);
    throw error;
  }
};

const createImage = async ({ user_id, original_url, prompt, status = 'pending' }) => {
  const result = await db.query(
    'INSERT INTO images (user_id, original_url, prompt, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_id, original_url, prompt, status]
  );
  return result.rows[0];
};

const updateGeneratedImage = async (id, { generated_url, job_id, status, error }) => {
  const updates = [];
  const values = [];
  let counter = 1;

  if (generated_url) {
    updates.push(`generated_url = $${counter}`);
    values.push(generated_url);
    counter++;
  }

  if (job_id) {
    updates.push(`job_id = $${counter}`);
    values.push(job_id);
    counter++;
  }

  if (status) {
    updates.push(`status = $${counter}`);
    values.push(status);
    counter++;
  }

  if (error) {
    updates.push(`error = $${counter}`);
    values.push(error);
    counter++;
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  const result = await db.query(
    `UPDATE images SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

const getImagesByUserId = async (userId) => {
  const result = await db.query(
    'SELECT * FROM images WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

module.exports = {
  createImagesTable,
  createImage,
  updateGeneratedImage,
  getImagesByUserId
}; 