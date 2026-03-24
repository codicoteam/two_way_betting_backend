module.exports = (io, socket) => {
  // Join user's private notification room
  socket.join(`user:${socket.user.id}`);
  console.log(`User ${socket.user.id} joined notification room`);

  // Notifications are sent from services via `io.to(userId).emit('notification', data)`
  // This handler just sets up the room
};