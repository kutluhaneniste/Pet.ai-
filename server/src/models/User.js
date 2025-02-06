const db = require('../config/database');
const bcrypt = require('bcryptjs');

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      phone VARCHAR(20),
      is_verified BOOLEAN DEFAULT false,
      verification_token VARCHAR(255),
      reset_password_token VARCHAR(255),
      reset_password_expires TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

const createUser = async (userData) => {
  const { email, password, firstName, lastName, phone } = userData;
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const query = `
    INSERT INTO users (email, password, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, first_name, last_name, phone, created_at;
  `;
  
  try {
    const values = [email, hashedPassword, firstName, lastName, phone];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Email already exists');
    }
    throw new Error('Error creating user: ' + error.message);
  }
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1;
  `;
  
  try {
    const result = await db.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
};

const getUserById = async (id) => {
  const query = `
    SELECT id, email, first_name, last_name, phone, is_verified, created_at
    FROM users
    WHERE id = $1;
  `;
  
  try {
    const result = await db.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error fetching user: ' + error.message);
  }
};

const updateUser = async (id, updateData) => {
  const allowedUpdates = ['first_name', 'last_name', 'phone'];
  const updates = [];
  const values = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updateData)) {
    if (allowedUpdates.includes(key)) {
      updates.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  }

  if (updates.length === 0) return null;

  values.push(id);
  const query = `
    UPDATE users
    SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING id, email, first_name, last_name, phone, is_verified;
  `;

  try {
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error updating user: ' + error.message);
  }
};

const updatePassword = async (id, newPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const query = `
    UPDATE users
    SET password = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id;
  `;

  try {
    const result = await db.query(query, [hashedPassword, id]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error updating password: ' + error.message);
  }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  createUsersTable,
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  updatePassword,
  verifyPassword
}; 