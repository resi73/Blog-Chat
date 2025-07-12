const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import utilities
const { logger, logRequest, logError } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blog');
const chatRoutes = require('./routes/chat');
const db = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(logRequest);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/chat', chatRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id });

  // Test event
  socket.on('test', (data) => {
    logger.info('Test event received', { socketId: socket.id, data });
    socket.emit('test-response', { message: 'Hello from server!', timestamp: new Date().toISOString() });
  });

  // Join chat room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    logger.info('User joined room', { socketId: socket.id, roomId });
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Send message
  socket.on('send-message', (data) => {
    logger.info('Message sent', { 
      socketId: socket.id, 
      roomId: data.roomId,
      messageLength: data.message?.length 
    });
    
    socket.to(data.roomId).emit('receive-message', {
      id: Date.now(),
      userId: data.userId,
      username: data.username,
      message: data.message,
      timestamp: new Date().toISOString()
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      username: data.username
    });
  });

  // Stop typing
  socket.on('stop-typing', (data) => {
    socket.to(data.roomId).emit('user-stop-typing', {
      userId: data.userId,
      username: data.username
    });
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    logger.info('User disconnected', { socketId: socket.id, reason });
  });

  // Error handling
  socket.on('error', (error) => {
    logError(error);
  });
});

const PORT = process.env.PORT || 5000;

// Database connection check function
const waitForDatabase = async () => {
  const maxRetries = 30;
  const retryDelay = 2000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.query('SELECT 1');
      logger.info('Database connection established');
      return true;
    } catch (error) {
      logger.warn(`Waiting for database... (${i + 1}/${maxRetries})`, { error: error.message });
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  logger.error('Failed to connect to database after multiple attempts');
  process.exit(1);
};

// Start server after database is ready
waitForDatabase().then(() => {
  server.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
    
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Blog API: http://localhost:${PORT}/api/blog`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  });
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

module.exports = { app, io }; 