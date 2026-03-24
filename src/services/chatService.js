const MatchChat = require('../models/match-chat');
const { getIO } = require('../sockets');

/**
 * Post a message to a match chat
 */
exports.postMessage = async ({ matchId, userId, message }) => {
  const chatMessage = await MatchChat.create({
    matchId,
    userId,
    message,
  });

  // Populate user info for real-time delivery
  const populated = await chatMessage.populate('userId', 'name avatar');

  // Emit via socket to all users in that match room
  const io = getIO();
  if (io) {
    io.to(`match:${matchId}`).emit('chatMessage', populated);
  }

  return populated;
};

/**
 * Get recent messages for a match
 */
exports.getMatchMessages = async (matchId, limit = 50) => {
  const messages = await MatchChat.find({ matchId })
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
  return messages.reverse(); // return oldest first
};