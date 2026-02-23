/**
 * 每日总结控制器
 * 
 * 处理每日总结相关的 HTTP 请求
 * 
 * @module controllers/dailySummaryController
 */

import { Request, Response } from 'express';
import {
  generateDailySummaryForUser,
  getDailySummary,
  getSummaryList,
  rateDailySummary
} from '../services/dailySummaryService';

/**
 * 生成每日总结
 * POST /api/v1/daily/summary
 */
export const generateDailySummaryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录'
        }
      });
      return;
    }

    // 可选的日期参数
    const { date } = req.body as { date?: string };
    let targetDate: Date | undefined;
    
    if (date) {
      targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: '日期格式无效'
          }
        });
        return;
      }
    }

    const result = await generateDailySummaryForUser(userId, targetDate);

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('生成每日总结失败:', error);

    if (error instanceof Error) {
      if (error.message === 'CULTIVATION_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'CULTIVATION_NOT_FOUND',
            message: '修炼数据不存在'
          }
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '生成每日总结失败，请稍后重试'
      }
    });
  }
};

/**
 * 获取每日总结
 * GET /api/v1/daily/summary
 */
export const getDailySummaryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录'
        }
      });
      return;
    }

    // 可选的日期参数
    const dateParam = req.query.date as string | undefined;
    let targetDate: Date | undefined;
    
    if (dateParam) {
      targetDate = new Date(dateParam);
      if (isNaN(targetDate.getTime())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DATE',
            message: '日期格式无效'
          }
        });
        return;
      }
    }

    const result = await getDailySummary(userId, targetDate);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取每日总结失败:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取每日总结失败，请稍后重试'
      }
    });
  }
};

/**
 * 获取总结列表
 * GET /api/v1/daily/summaries
 */
export const getSummaryListHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录'
        }
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '分页参数无效'
        }
      });
      return;
    }

    const result = await getSummaryList(userId, page, pageSize);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取总结列表失败:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取总结列表失败，请稍后重试'
      }
    });
  }
};

/**
 * 评价每日总结
 * POST /api/v1/daily/summary/:id/rate
 */
export const rateDailySummaryHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '请先登录'
        }
      });
      return;
    }

    const { id } = req.params;
    const { rating, feedback } = req.body as {
      rating: number;
      feedback?: string;
    };

    // 验证评分
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: '评分必须是 1-5 之间的数字'
        }
      });
      return;
    }

    const summary = await rateDailySummary(userId, id, rating, feedback);

    res.status(200).json({
      success: true,
      data: {
        id: summary.id,
        userRating: summary.userRating,
        userFeedback: summary.userFeedback
      }
    });
  } catch (error) {
    console.error('评价每日总结失败:', error);

    if (error instanceof Error) {
      if (error.message === 'INVALID_RATING') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_RATING',
            message: '评分必须是 1-5 之间的数字'
          }
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '评价失败，请稍后重试'
      }
    });
  }
};

export default {
  generateDailySummaryHandler,
  getDailySummaryHandler,
  getSummaryListHandler,
  rateDailySummaryHandler
};
