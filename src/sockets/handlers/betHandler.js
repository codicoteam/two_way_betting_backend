module.exports = (io, socket) => {
  // When a bet status changes, the bet service will emit to involved users
  // This handler just ensures users are in their rooms
  socket.join(`user:${socket.user.id}`);
};

// Emit function for bet service to use
exports.emitBetUpdate = (io, userId, betData) => {
  io.to(`user:${userId}`).emit('betUpdate', betData);
};