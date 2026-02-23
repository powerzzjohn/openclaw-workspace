/**
 * 每日总结路由
 * 
 * @module routes/dailySummaryRoutes
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  generateDailySummaryHandler,
  getDailySummaryHandler,
  getSummaryListHandler,
  rateDailySummaryHandler
} from '../controllers/dailySummaryController';

const router = Router();

/**
 * @route   POST /api/v1/daily/summary
 * @desc    生成每日修炼总结
 * @access  Private
 * @body    date - 日期（可选，默认为今天）
 */
router.post('/summary', authenticate, generateDailySummaryHandler);

/**
 * @route   GET /api/v1/daily/summary
 * @desc    获取每日修炼总结
 * @access  Private
 * @query   date - 日期（可选，默认为今天）
 */
router.get('/summary', authenticate, getDailySummaryHandler);

/**
 * @route   GET /api/v1/daily/summaries
 * @desc    获取总结列表
 * @access  Private
 * @query   page - 页码（默认 1）
 * @query   pageSize - 每页数量（默认 10，最大 50）
 */
router.get('/summaries', authenticate, getSummaryListHandler);

/**
 * @route   POST /api/v1/daily/summary/:id/rate
 * @desc    评价每日总结
 * @access  Private
 * @body    rating - 评分（1-5）
 * @body    feedback - 反馈内容（可选）
 */
router.post('/summary/:id/rate', authenticate, rateDailySummaryHandler);

export default router;
