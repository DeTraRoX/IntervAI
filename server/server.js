require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const socketio = require('socket.io');

const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));

// Static Folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/interview', require('./routes/interview'));

// Default Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Real-time Event handlers (Socket.io)
io.on('connection', (socket) => {
  console.log(`Socket Client connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket Client ${socket.id} joined room ${roomId}`);
  });

  socket.on('typing-response', ({ roomId, value }) => {
    socket.to(roomId).emit('interviewer-alert', { action: 'typing', text: value });
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});
//ports
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`IntervAI Backend running in production mode on port ${PORT}`);
});
