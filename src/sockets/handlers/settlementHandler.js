module.exports = (io, socket) => {
  // Notify users about settlement requests
  socket.on('settlementRequest', (data) => {
    // The actual request is handled via HTTP; this just acknowledges
    console.log('Settlement request received via socket:', data);
  });
};

exports.emitSettlementRequest = (io, userId, requestData) => {
  io.to(`user:${userId}`).emit('settlementRequest', requestData);
};

exports.emitSettlementResponse = (io, userId, responseData) => {
  io.to(`user:${userId}`).emit('settlementResponse', responseData);
};