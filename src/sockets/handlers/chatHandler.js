const chatService = require('../../services/chatService');
const messageService = require('../../services/messageService');

module.exports = (io, socket) => {
  // Join a match room
  socket.on('joinMatch', (matchId) => {
    socket.join(`match:${matchId}`);
    console.log(`User ${socket.user.id} joined match room ${matchId}`);
  });

  // Leave match room
  socket.on('leaveMatch', (matchId) => {
    socket.leave(`match:${matchId}`);
    console.log(`User ${socket.user.id} left match room ${matchId}`);
  });

  // Match chat message
  socket.on('matchMessage', async (data) => {
    try {
      const { matchId, message, betOffer } = data;
      const msg = await chatService.postMessage({
        matchId,
        userId: socket.user.id,
        message,
        betOffer,
      });
      // Broadcast to all in match room
      io.to(`match:${matchId}`).emit('matchMessage', msg);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Private message
  socket.on('privateMessage', async (data) => {
    try {
      const { toUserId, message } = data;
      const msg = await messageService.sendMessage({
        fromUserId: socket.user.id,
        toUserId,
        message,
      });
      // Emit to recipient's private room
      io.to(`user:${toUserId}`).emit('privateMessage', msg);
      // Also emit back to sender for confirmation
      socket.emit('privateMessageSent', msg);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
};