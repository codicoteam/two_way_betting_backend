const matchService = require('../../services/matchService');

module.exports = (io, socket) => {
  // Admin or background job can trigger score updates
  // This handler is mostly for clients to listen

  socket.on('subscribeMatch', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('unsubscribeMatch', (matchId) => {
    socket.leave(`match:${matchId}`);
  });
};

// Function to broadcast score updates (called from jobs)
exports.broadcastScoreUpdate = (io, matchId, scoreData) => {
  io.to(`match:${matchId}`).emit('scoreUpdate', { matchId, ...scoreData });
};