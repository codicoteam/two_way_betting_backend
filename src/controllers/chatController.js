const chatService = require('../services/chatService');

exports.postMessage = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { message } = req.body;
    const msg = await chatService.postMessage({
      matchId,
      userId: req.user.id,
      message,
    });
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const messages = await chatService.getMatchMessages(matchId, limit);
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};