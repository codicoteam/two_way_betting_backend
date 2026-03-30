const PrivateMessage = require('../models/private-message');

/**
 * Send a private message
 */
exports.sendMessage = async ({ fromUserId, toUserId, message }) => {
  // Create conversation ID (sorted user IDs)
  const conversationId = [fromUserId.toString(), toUserId.toString()].sort().join('_');

  const msg = await PrivateMessage.create({
    conversationId,
    fromUserId,
    toUserId,
    message,
  });

  const populated = await msg.populate('fromUserId', 'name avatar');

  // Emit via socket to recipient
  const { getIO } = require('../sockets');
  const io = getIO();
  if (io) {
    io.to(`user:${toUserId}`).emit('privateMessage', populated);
  }

  return populated;
};

/**
 * Get conversation between two users
 */
exports.getConversation = async (userId1, userId2, page = 1, limit = 50) => {
  const conversationId = [userId1.toString(), userId2.toString()].sort().join('_');
  const skip = (page - 1) * limit;

  const messages = await PrivateMessage.find({ conversationId })
    .populate('fromUserId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark messages as read if user is recipient
  await PrivateMessage.updateMany(
    { conversationId, toUserId: userId1, isRead: false },
    { isRead: true }
  );

  return messages.reverse();
};

/**
 * Get user's conversations (list of other users they've chatted with)
 */
exports.getConversations = async (userId) => {
  const messages = await PrivateMessage.find({
    $or: [{ fromUserId: userId }, { toUserId: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('fromUserId', 'name avatar')
    .populate('toUserId', 'name avatar');

  // Build unique conversation partners
  const partners = new Map();
  messages.forEach(msg => {
    const otherId = msg.fromUserId._id.toString() === userId.toString() ? msg.toUserId : msg.fromUserId;
    if (!partners.has(otherId._id.toString())) {
      partners.set(otherId._id.toString(), {
        user: otherId,
        lastMessage: msg.message,
        lastMessageAt: msg.createdAt,
        unread: !msg.isRead && msg.toUserId._id.toString() === userId.toString(),
      });
    }
  });

  return Array.from(partners.values()).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
};