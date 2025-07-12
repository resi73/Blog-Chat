const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// Lấy tất cả phòng chat
router.get('/rooms', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cr.*, u.username as created_by_name,
             COUNT(m.id) as message_count,
             MAX(m.created_at) as last_message_time
      FROM chat_rooms cr
      LEFT JOIN users u ON cr.created_by = u.id
      LEFT JOIN messages m ON cr.id = m.room_id
      GROUP BY cr.id, u.username
      ORDER BY last_message_time DESC NULLS LAST
    `);

    res.json({
      success: true,
      data: { rooms: result.rows }
    });
  } catch (error) {
    console.error('Lỗi lấy phòng chat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Tạo phòng chat mới
router.post('/rooms', auth, [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Tên phòng không được để trống và tối đa 100 ký tự')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const { name } = req.body;
    const createdBy = req.user.id;

    const result = await pool.query(`
      INSERT INTO chat_rooms (name, created_by)
      VALUES ($1, $2)
      RETURNING *
    `, [name, createdBy]);

    res.status(201).json({
      success: true,
      message: 'Tạo phòng chat thành công',
      data: { room: result.rows[0] }
    });
  } catch (error) {
    console.error('Lỗi tạo phòng chat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Lấy tin nhắn của phòng chat
router.get('/rooms/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Kiểm tra phòng chat tồn tại
    const roomCheck = await pool.query(
      'SELECT * FROM chat_rooms WHERE id = $1',
      [id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng chat'
      });
    }

    // Lấy tin nhắn với phân trang
    const result = await pool.query(`
      SELECT m.*, u.username, u.avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.room_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    // Lấy tổng số tin nhắn
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE room_id = $1',
      [id]
    );
    const totalMessages = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        messages: result.rows.reverse(), // Đảo ngược để hiển thị tin nhắn cũ trước
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalMessages / limit),
          totalMessages,
          hasNext: page * limit < totalMessages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy tin nhắn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Lưu tin nhắn vào database
router.post('/rooms/:id/messages', auth, [
  body('content').isLength({ min: 1 }).withMessage('Nội dung tin nhắn không được để trống')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Kiểm tra phòng chat tồn tại
    const roomCheck = await pool.query(
      'SELECT * FROM chat_rooms WHERE id = $1',
      [id]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng chat'
      });
    }

    const result = await pool.query(`
      INSERT INTO messages (content, room_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [content, id, userId]);

    // Lấy thông tin user để trả về
    const userResult = await pool.query(
      'SELECT username, avatar FROM users WHERE id = $1',
      [userId]
    );

    const message = {
      ...result.rows[0],
      username: userResult.rows[0].username,
      avatar: userResult.rows[0].avatar
    };

    res.status(201).json({
      success: true,
      message: 'Gửi tin nhắn thành công',
      data: { message }
    });
  } catch (error) {
    console.error('Lỗi gửi tin nhắn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Xóa tin nhắn
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const messageCheck = await pool.query(
      'SELECT * FROM messages WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (messageCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin nhắn này'
      });
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Xóa tin nhắn thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa tin nhắn:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Lấy thông tin phòng chat
router.get('/rooms/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT cr.*, u.username as created_by_name
      FROM chat_rooms cr
      LEFT JOIN users u ON cr.created_by = u.id
      WHERE cr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng chat'
      });
    }

    res.json({
      success: true,
      data: { room: result.rows[0] }
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin phòng chat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 