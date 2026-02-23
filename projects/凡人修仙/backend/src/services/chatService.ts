/**
 * 聊天服务模块
 * 
 * 处理聊天消息的存储、查询和 AI 对话
 * 
 * @module services/chatService
 */

import { PrismaClient, ChatMessage } from '@prisma/client';
import {
  chatWithNPC,
  ChatMessage as KimiChatMessage,
  AIResponse,
  CultivatorContext
} from './kimiService';

const prisma = new PrismaClient();

// ============================================
// 类型定义
// ============================================

/**
 * 聊天请求
 */
export interface ChatRequest {
  message: string;
  includeHistory?: boolean;
  historyLimit?: number;
}

/**
 * 聊天响应
 */
export interface ChatResponse {
  success: boolean;
  data: {
    id: string;
    role: 'user' | 'npc';
    content: string;
    createdAt: Date;
    aiResponse?: {
      content: string;
      model: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
    };
  };
}

/**
 * 聊天历史记录项
 */
export interface ChatHistoryItem {
  id: string;
  role: 'user' | 'npc';
  content: string;
  createdAt: Date;
}

/**
 * 聊天历史响应
 */
export interface ChatHistoryResponse {
  messages: ChatHistoryItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 用户上下文信息
 */
export interface UserContext {
  daoName: string;
  realm: string;
  realmLevel: number;
  rootName?: string;
  primaryElement?: string;
  todayMinutes: number;
  totalDays: number;
  streakDays: number;
}

// ============================================
// 核心功能
// ============================================

/**
 * 发送聊天消息并获取 AI 回复
 * @param userId 用户ID
 * @param message 用户消息
 * @param context 用户上下文信息
 * @param includeHistory 是否包含历史消息
 * @param historyLimit 历史消息数量限制
 * @returns 聊天响应
 */
export const sendChatMessage = async (
  userId: string,
  message: string,
  context?: UserContext,
  includeHistory: boolean = true,
  historyLimit: number = 10
): Promise<ChatResponse> => {
  // 验证消息
  if (!message || message.trim().length === 0) {
    throw new Error('EMPTY_MESSAGE');
  }

  if (message.length > 2000) {
    throw new Error('MESSAGE_TOO_LONG');
  }

  // 保存用户消息
  const userMessage = await prisma.chatMessage.create({
    data: {
      userId,
      role: 'user',
      content: message.trim()
    }
  });

  // 获取历史消息（如果需要）
  let history: KimiChatMessage[] = [];
  if (includeHistory) {
    const recentMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: historyLimit,
      select: {
        role: true,
        content: true
      }
    });
    
    // 转换为 Kimi 格式并反转顺序
    history = recentMessages
      .reverse()
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
  }

  // 构建修仙者上下文
  let cultivatorContext: CultivatorContext | undefined;
  if (context) {
    cultivatorContext = {
      daoName: context.daoName,
      realm: context.realm,
      realmLevel: context.realmLevel,
      rootName: context.rootName || '未知',
      primaryElement: context.primaryElement || '未知',
      todayMinutes: context.todayMinutes,
      totalDays: context.totalDays,
      streakDays: context.streakDays
    };
  }

  // 调用 Kimi API 获取回复
  let aiResponse: AIResponse;
  try {
    aiResponse = await chatWithNPC(message.trim(), history, cultivatorContext);
  } catch (error) {
    console.error('Kimi API 调用失败:', error);
    throw new Error('AI_RESPONSE_FAILED');
  }

  // 保存 AI 回复
  const npcMessage = await prisma.chatMessage.create({
    data: {
      userId,
      role: 'npc',
      content: aiResponse.content,
      metadata: JSON.stringify({
        model: aiResponse.model,
        usage: aiResponse.usage
      })
    }
  });

  return {
    success: true,
    data: {
      id: npcMessage.id,
      role: 'npc',
      content: aiResponse.content,
      createdAt: npcMessage.createdAt,
      aiResponse: {
        content: aiResponse.content,
        model: aiResponse.model,
        usage: aiResponse.usage
      }
    }
  };
};

/**
 * 获取聊天历史
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 聊天历史
 */
export const getChatHistory = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<ChatHistoryResponse> => {
  // 验证分页参数
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;

  const skip = (page - 1) * pageSize;

  const [messages, total] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true
      }
    }),
    prisma.chatMessage.count({
      where: { userId }
    })
  ]);

  return {
    messages: messages.map((msg: {
      id: string;
      role: string;
      content: string;
      createdAt: Date;
    }) => ({
      id: msg.id,
      role: msg.role as 'user' | 'npc',
      content: msg.content,
      createdAt: msg.createdAt
    })),
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

/**
 * 删除用户的所有聊天消息
 * @param userId 用户ID
 * @returns 删除数量
 */
export const clearChatHistory = async (userId: string): Promise<number> => {
  const result = await prisma.chatMessage.deleteMany({
    where: { userId }
  });

  return result.count;
};

/**
 * 获取最近的消息
 * @param userId 用户ID
 * @param limit 数量限制
 * @returns 最近的消息列表
 */
export const getRecentMessages = async (
  userId: string,
  limit: number = 5
): Promise<ChatHistoryItem[]> => {
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true
    }
  });

  return messages
    .reverse()
    .map((msg: {
      id: string;
      role: string;
      content: string;
      createdAt: Date;
    }) => ({
      id: msg.id,
      role: msg.role as 'user' | 'npc',
      content: msg.content,
      createdAt: msg.createdAt
    }));
};

export default {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  getRecentMessages
};
