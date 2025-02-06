const validateOrderInput = (req, res, next) => {
  const { imageId, orderType, amount, shippingAddress } = req.body;

  // Zorunlu alanların kontrolü
  if (!imageId || !orderType || !amount || !shippingAddress) {
    return res.status(400).json({
      error: 'Eksik bilgi: imageId, orderType, amount ve shippingAddress zorunludur'
    });
  }

  // Sipariş türü kontrolü
  const validOrderTypes = ['canvas', 'poster', 'frame'];
  if (!validOrderTypes.includes(orderType)) {
    return res.status(400).json({
      error: 'Geçersiz sipariş türü. Geçerli türler: canvas, poster, frame'
    });
  }

  // Tutar kontrolü
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: 'Geçersiz tutar. Tutar pozitif bir sayı olmalıdır'
    });
  }

  // Teslimat adresi kontrolü
  const requiredAddressFields = ['firstName', 'lastName', 'address', 'city', 'zipCode', 'phone'];
  for (const field of requiredAddressFields) {
    if (!shippingAddress[field]) {
      return res.status(400).json({
        error: `Eksik teslimat bilgisi: ${field} zorunludur`
      });
    }
  }

  // Telefon numarası formatı kontrolü
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(shippingAddress.phone)) {
    return res.status(400).json({
      error: 'Geçersiz telefon numarası formatı. Örnek: 5321234567'
    });
  }

  // Posta kodu formatı kontrolü
  const zipCodeRegex = /^[0-9]{5}$/;
  if (!zipCodeRegex.test(shippingAddress.zipCode)) {
    return res.status(400).json({
      error: 'Geçersiz posta kodu formatı. Örnek: 34100'
    });
  }

  next();
};

module.exports = {
  validateOrderInput
}; 