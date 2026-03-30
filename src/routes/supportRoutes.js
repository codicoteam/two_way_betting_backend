const express = require('express');
const { getQuicklinks } = require('../controllers/supportController');

const router = express.Router();

/**
 * @swagger
 * /api/support/quicklinks:
 *   get:
 *     summary: Get DuelBet quicklinks and support resources
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: Support quicklinks list
 */
router.get('/quicklinks', getQuicklinks);

module.exports = router;
