/**
 * 聊天路由
 * 
 * @module routes/chatRoutes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  sendMessageHandler,
  getChatHistoryHandler,
  clearChatHistoryHandler
} from '../controllers/chatController';

const router = Router();

/**
 * @route   POST /api/v1/chat
 * @desc    发送聊天消息，获取 AI 回复
 * @access  Private
 */
router.post('/', authenticate, sendMessageHandler);

/**
 * @route   GET /api/v1/chat/history
 * @desc    获取聊天历史记录
 * @access  Private
 * @query   page - 页码（默认 1）
 * @query   pageSize - 每页数量（默认 20，最大 100）
 */
router.get('/history', authenticate, getChatHistoryHandler);

/**
 * @route   DELETE /api/v1/chat/history
 * @desc    清空聊天历史记录
 * @access  Private
 */
router.delete('/history', authenticate, clearChatHistoryHandler);

export default router;
