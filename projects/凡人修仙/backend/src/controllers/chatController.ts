/**
 * 聊天控制器
 * 
 * 处理聊天相关的 HTTP 请求
 * 
 * @module controllers/chatController
 */

import { Request, Response } from 'express';
import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory
} from '../services/chatService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 发送聊天消息
 * POST /api/v1/chat
 */
export const sendMessageHandler = async (
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

    const { message, includeHistory = true } = req.body as {
      message: string;
      includeHistory?: boolean;
    };

    // 验证参数
    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '消息内容不能为空'
        }
      });
      return;
    }

    // 获取用户上下文信息
    const [user, cultivation, bazi] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { daoName: true }
      }),
      prisma.cultivation.findUnique({
        where: { userId },
        select: {
          realm: true,
          realmName: true,
          todayMinutes: true,
          totalDays: true,
          streakDays: true
        }
      }),
      prisma.bazi.findUnique({
        where: { userId },
        select: {
          rootName: true,
          primaryElement: true
        }
      })
    ]);

    // 构建上下文
    const context = user && cultivation
      ? {
          daoName: user.daoName,
          realm: cultivation.realmName,
          realmLevel: cultivation.realm,
          rootName: bazi?.rootName,
          primaryElement: bazi?.primaryElement,
          todayMinutes: cultivation.todayMinutes,
          totalDays: cultivation.totalDays,
          streakDays: cultivation.streakDays
        }
      : undefined;

    const result = await sendChatMessage(
      userId,
      message,
      context,
      includeHistory
    );

    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('发送聊天消息失败:', error);

    if (error instanceof Error) {
      if (error.message === 'EMPTY_MESSAGE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'EMPTY_MESSAGE',
            message: '消息内容不能为空'
          }
        });
        return;
      }

      if (error.message === 'MESSAGE_TOO_LONG') {
        res.status(400).json({
          success: false,
          error: {
            code: 'MESSAGE_TOO_LONG',
            message: '消息内容过长，最多 2000 字'
          }
        });
        return;
      }

      if (error.message === 'AI_RESPONSE_FAILED') {
        res.status(503).json({
          success: false,
          error: {
            code: 'AI_RESPONSE_FAILED',
            message: 'AI 回复失败，请稍后重试'
          }
        });
        return;
      }

      if (error.message === 'KIMI_API_KEY_NOT_CONFIGURED') {
        res.status(503).json({
          success: false,
          error: {
            code: 'AI_NOT_CONFIGURED',
            message: 'AI 服务未配置，请联系管理员'
          }
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '发送消息失败，请稍后重试'
      }
    });
  }
};

/**
 * 获取聊天历史
 * GET /api/v1/chat/history
 */
export const getChatHistoryHandler = async (
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
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    // 验证分页参数
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PARAMS',
          message: '分页参数无效'
        }
      });
      return;
    }

    const result = await getChatHistory(userId, page, pageSize);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取聊天历史失败:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '获取聊天历史失败，请稍后重试'
      }
    });
  }
};

/**
 * 清空聊天历史
 * DELETE /api/v1/chat/history
 */
export const clearChatHistoryHandler = async (
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

    const deletedCount = await clearChatHistory(userId);

    res.status(200).json({
      success: true,
      data: {
        message: '聊天历史已清空',
        deletedCount
      }
    });
  } catch (error) {
    console.error('清空聊天历史失败:', error);

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '清空聊天历史失败，请稍后重试'
      }
    });
  }
};

export default {
  sendMessageHandler,
  getChatHistoryHandler,
  clearChatHistoryHandler
};
