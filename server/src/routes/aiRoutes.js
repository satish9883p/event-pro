import express from 'express';
import { sendMessage, getChatHistory, clearChatHistory, deleteChatMessage } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/chat', authMiddleware, aiLimiter, sendMessage);
router.get('/history', authMiddleware, getChatHistory);
router.delete('/history', authMiddleware, clearChatHistory);
router.delete('/history/:messageId', authMiddleware, deleteChatMessage);

export default router;
