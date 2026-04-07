const messageService = require('../services/messageService');

exports.sendMessage = async (req, res, next) => {
  try {
    const toUserId = req.body.toUserId || req.body.recipientId;
    const { message } = req.body;
    const msg = await messageService.sendMessage({
      fromUserId: req.user.id,
      toUserId,
      message,
    });
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await messageService.getConversation(req.user.id, userId, page, limit);
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await messageService.getConversations(req.user.id);
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};