const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: Post ID
 *         title:
 *           type: string
 *           description: Post title
 *         content:
 *           type: string
 *           description: Post content
 *         author_id:
 *           type: integer
 *           description: Author ID
 *         image_url:
 *           type: string
 *           description: Image URL
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *         author_name:
 *           type: string
 *           description: Author username
 *         author_avatar:
 *           type: string
 *           description: Author avatar URL
 *         comment_count:
 *           type: integer
 *           description: Number of comments
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           description: Comment ID
 *         content:
 *           type: string
 *           description: Comment content
 *         user_id:
 *           type: integer
 *           description: User ID
 *         post_id:
 *           type: integer
 *           description: Post ID
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         username:
 *           type: string
 *           description: Username
 *         avatar:
 *           type: string
 *           description: Avatar URL
 */

/**
 * @swagger
 * /api/blog/posts:
 *   get:
 *     summary: Lấy danh sách bài viết
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số bài viết mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Danh sách bài viết
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     posts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Post'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalPosts:
 *                           type: integer
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       500:
 *         description: Lỗi server
 */
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username as author_name, u.avatar as author_avatar,
             COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
    `;

    const queryParams = [];
    let whereClause = '';

    if (search) {
      whereClause = 'WHERE p.title ILIKE $1 OR p.content ILIKE $1';
      queryParams.push(`%${search}%`);
    }

    query += whereClause + ' GROUP BY p.id, u.username, u.avatar ORDER BY p.created_at DESC';

    // Lấy tổng số posts
    const countQuery = `
      SELECT COUNT(*) FROM posts p ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const totalPosts = parseInt(countResult.rows[0].count);

    // Lấy posts với phân trang
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: {
        posts: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasNext: page * limit < totalPosts,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy posts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Lấy post theo ID
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('GET /posts/:id - Requesting post with ID:', id);

    const result = await pool.query(`
      SELECT p.*, u.username as author_name, u.avatar as author_avatar
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `, [id]);

    console.log('Database query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('Post not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Lấy comments của post
    const commentsResult = await pool.query(`
      SELECT c.*, u.username, u.avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [id]);

    const post = result.rows[0];
    post.comments = commentsResult.rows;

    console.log('Sending response for post:', post.id, post.title);

    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Lỗi lấy post:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Tạo post mới
router.post('/posts', auth, [
  body('title').isLength({ min: 1, max: 255 }).withMessage('Tiêu đề không được để trống và tối đa 255 ký tự'),
  body('content').isLength({ min: 1 }).withMessage('Nội dung không được để trống'),
  body('image_url').optional().custom((value) => {
    if (!value) return true; // Optional field
    if (value.length > 1000) {
      throw new Error('URL ảnh quá dài');
    }
    return true;
  }).withMessage('URL hình ảnh không hợp lệ')
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

    const { title, content, image_url } = req.body;
    const authorId = req.user.id;

    const result = await pool.query(`
      INSERT INTO posts (title, content, author_id, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [title, content, authorId, image_url]);

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: { post: result.rows[0] }
    });
  } catch (error) {
    console.error('Lỗi tạo post:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Cập nhật post
router.put('/posts/:id', auth, [
  body('title').optional().isLength({ min: 1, max: 255 }).withMessage('Tiêu đề tối đa 255 ký tự'),
  body('content').optional().isLength({ min: 1 }).withMessage('Nội dung không được để trống'),
  body('image_url').optional().custom((value) => {
    if (!value) return true; // Optional field
    if (value.length > 1000) {
      throw new Error('URL ảnh quá dài');
    }
    return true;
  }).withMessage('URL hình ảnh không hợp lệ')
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
    const { title, content, image_url } = req.body;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const postCheck = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND author_id = $2',
      [id, userId]
    );

    if (postCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa bài viết này'
      });
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (title) {
      updateFields.push(`title = $${paramCount}`);
      updateValues.push(title);
      paramCount++;
    }

    if (content) {
      updateFields.push(`content = $${paramCount}`);
      updateValues.push(content);
      paramCount++;
    }

    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount}`);
      updateValues.push(image_url);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có dữ liệu để cập nhật'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);

    const result = await pool.query(
      `UPDATE posts SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: { post: result.rows[0] }
    });
  } catch (error) {
    console.error('Lỗi cập nhật post:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Xóa post
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const postCheck = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND author_id = $2',
      [id, userId]
    );

    if (postCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bài viết này'
      });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa post:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Thêm comment
router.post('/posts/:id/comments', auth, [
  body('content').isLength({ min: 1 }).withMessage('Nội dung comment không được để trống')
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

    // Kiểm tra post tồn tại
    const postCheck = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    const result = await pool.query(`
      INSERT INTO comments (content, post_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [content, id, userId]);

    res.status(201).json({
      success: true,
      message: 'Thêm comment thành công',
      data: { comment: result.rows[0] }
    });
  } catch (error) {
    console.error('Lỗi thêm comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Xóa comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra quyền sở hữu
    const commentCheck = await pool.query(
      'SELECT * FROM comments WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa comment này'
      });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Xóa comment thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa comment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

module.exports = router; 