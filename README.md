# Blog & Chat App

Ứng dụng blog hiện đại với tính năng chat real-time, được xây dựng bằng Express.js, PostgreSQL, React và WebSocket.

## 🚀 Tính năng

### Backend
- **Blog API**: CRUD operations cho posts và comments
- **Auth API**: JWT authentication với bcrypt
- **Chat API**: WebSocket real-time chat
- **Database**: PostgreSQL với connection pooling
- **Security**: Rate limiting, CORS, Helmet, validation

### Frontend
- **React.js**: Modern UI với Tailwind CSS
- **Real-time Chat**: Socket.io client
- **Authentication**: JWT token management
- **Responsive Design**: Mobile-first approach
- **Form Validation**: React Hook Form

### DevOps
- **Docker**: Containerization cho development và production
- **Docker Compose**: Multi-service orchestration
- **Environment Variables**: Secure configuration management

## 🛠️ Công nghệ sử dụng

### Backend
- Node.js & Express.js
- PostgreSQL
- JWT & bcrypt
- Socket.io
- Express Validator
- Helmet & CORS

### Frontend
- React.js 18
- React Router DOM
- Tailwind CSS
- Socket.io Client
- Axios
- React Hook Form
- Lucide React Icons

### DevOps
- Docker & Docker Compose
- Environment Variables
- Health Checks

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 18+
- Docker & Docker Compose
- Git

### Cách 1: Sử dụng Docker (Khuyến nghị)

1. **Clone repository**
```bash
git clone <repository-url>
cd blog-chat-app
```

2. **Tạo file môi trường**
```bash
cp env.example .env
# Chỉnh sửa các biến môi trường nếu cần
```

3. **Chạy với Docker Compose**
```bash
# Build và chạy tất cả services
docker-compose up --build

# Hoặc chạy ở background
docker-compose up -d --build
```

4. **Truy cập ứng dụng**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

### Cách 2: Development Local

1. **Cài đặt dependencies**
```bash
# Backend
npm install

# Frontend
cd client
npm install
```

2. **Cấu hình database**
```bash
# Tạo database PostgreSQL
createdb blog_chat_db

# Hoặc sử dụng Docker cho database
docker run --name postgres -e POSTGRES_DB=blog_chat_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
```

3. **Cấu hình môi trường**
```bash
cp env.example .env
# Chỉnh sửa .env file
```

4. **Chạy ứng dụng**
```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
cd client
npm start
```

## 🗄️ Cấu trúc Database

### Bảng Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng Posts
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng Comments
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng Chat Rooms
```sql
CREATE TABLE chat_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bảng Messages
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  room_id INTEGER REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user
- `PUT /api/auth/profile` - Cập nhật profile

### Blog
- `GET /api/blog/posts` - Lấy danh sách posts
- `GET /api/blog/posts/:id` - Lấy chi tiết post
- `POST /api/blog/posts` - Tạo post mới
- `PUT /api/blog/posts/:id` - Cập nhật post
- `DELETE /api/blog/posts/:id` - Xóa post
- `POST /api/blog/posts/:id/comments` - Thêm comment
- `DELETE /api/blog/comments/:id` - Xóa comment

### Chat
- `GET /api/chat/rooms` - Lấy danh sách phòng chat
- `POST /api/chat/rooms` - Tạo phòng chat mới
- `GET /api/chat/rooms/:id` - Lấy thông tin phòng chat
- `GET /api/chat/rooms/:id/messages` - Lấy tin nhắn
- `POST /api/chat/rooms/:id/messages` - Gửi tin nhắn
- `DELETE /api/chat/messages/:id` - Xóa tin nhắn

## 🎯 Tính năng chính

### Blog System
- ✅ Tạo, chỉnh sửa, xóa bài viết
- ✅ Upload hình ảnh cho bài viết
- ✅ Hệ thống bình luận
- ✅ Tìm kiếm bài viết
- ✅ Phân trang

### Chat System
- ✅ Real-time messaging
- ✅ Tạo phòng chat
- ✅ Typing indicators
- ✅ Lưu trữ tin nhắn
- ✅ User avatars

### Authentication
- ✅ JWT token authentication
- ✅ Password hashing với bcrypt
- ✅ Protected routes
- ✅ User profile management

### Security
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection protection
- ✅ XSS protection

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build backend
docker-compose up backend
```

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Kiểm tra PostgreSQL container
docker-compose ps postgres

# Xem logs database
docker-compose logs postgres

# Kết nối vào database
docker-compose exec postgres psql -U postgres -d blog_chat_db
```

### Backend Issues
```bash
# Xem logs backend
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Rebuild backend
docker-compose build backend
docker-compose up backend
```

### Frontend Issues
```bash
# Xem logs frontend
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

## 📝 Environment Variables

Tạo file `.env` từ `env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog_chat_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- Express.js team
- React team
- PostgreSQL team
- Socket.io team
- Tailwind CSS team 