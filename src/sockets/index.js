const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret } = require('../configs/auth');
const chatHandler = require('./handlers/chatHandler');
const notificationHandler = require('./handlers/notificationHandler');
const scoreHandler = require('./handlers/scoreHandler');
const betHandler = require('./handlers/betHandler');
const settlementHandler = require('./handlers/settlementHandler');

let io;

exports.init = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error('No token');
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
      if (!user) throw new Error('User not found');
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Initialize handlers
    chatHandler(io, socket);
    notificationHandler(io, socket);
    scoreHandler(io, socket);
    betHandler(io, socket);
    settlementHandler(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};