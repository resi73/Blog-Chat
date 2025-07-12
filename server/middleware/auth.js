const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không tìm thấy token xác thực' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Kiểm tra user có tồn tại trong database không
    const result = await pool.query(
      'SELECT id, username, email, avatar FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token không hợp lệ' 
      });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token không hợp lệ' 
    });
  }
};

module.exports = auth; 