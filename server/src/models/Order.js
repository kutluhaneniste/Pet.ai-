const db = require('../config/database');

const createOrdersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      image_id INTEGER NOT NULL REFERENCES images(id),
      status VARCHAR(50) DEFAULT 'pending',
      order_type VARCHAR(50) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'TRY',
      shipping_address JSONB NOT NULL,
      payment_id VARCHAR(255),
      tracking_number VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await db.query(query);
    console.log('Orders table created successfully');
  } catch (error) {
    console.error('Error creating orders table:', error);
  }
};

const createOrder = async (orderData) => {
  const {
    userId,
    imageId,
    orderType,
    amount,
    shippingAddress,
    notes
  } = orderData;

  const query = `
    INSERT INTO orders (
      user_id,
      image_id,
      order_type,
      amount,
      shipping_address,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  try {
    const values = [
      userId,
      imageId,
      orderType,
      amount,
      JSON.stringify(shippingAddress),
      notes
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error creating order: ' + error.message);
  }
};

const getOrderById = async (orderId, userId) => {
  const query = `
    SELECT o.*, i.generated_url, i.prompt
    FROM orders o
    JOIN images i ON o.image_id = i.id
    WHERE o.id = $1 AND o.user_id = $2;
  `;

  try {
    const result = await db.query(query, [orderId, userId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error fetching order: ' + error.message);
  }
};

const getUserOrders = async (userId) => {
  const query = `
    SELECT o.*, i.generated_url, i.prompt
    FROM orders o
    JOIN images i ON o.image_id = i.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC;
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    throw new Error('Error fetching user orders: ' + error.message);
  }
};

const updateOrderStatus = async (orderId, status, paymentId = null) => {
  const query = `
    UPDATE orders
    SET 
      status = $1,
      payment_id = COALESCE($2, payment_id),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [status, paymentId, orderId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error updating order status: ' + error.message);
  }
};

const updateTrackingNumber = async (orderId, trackingNumber) => {
  const query = `
    UPDATE orders
    SET 
      tracking_number = $1,
      status = 'shipped',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [trackingNumber, orderId]);
    return result.rows[0];
  } catch (error) {
    throw new Error('Error updating tracking number: ' + error.message);
  }
};

module.exports = {
  createOrdersTable,
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updateTrackingNumber
}; 