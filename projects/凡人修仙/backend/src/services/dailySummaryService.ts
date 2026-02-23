/**
 * 每日总结服务模块
 * 
 * 生成和管理每日修炼总结
 * 
 * @module services/dailySummaryService
 */

import { PrismaClient, DailySummary } from '@prisma/client';
import { generateDailySummary } from './kimiService';

const prisma = new PrismaClient();

// ============================================
// 类型定义
// ============================================

/**
 * 每日总结内容
 */
export interface DailySummaryContent {
  greeting: string;
  cultivationReview: string;
  insight: string;
  wisdom: string;
  suggestion: string;
  goldenQuote: string;
}

/**
 * 生成总结请求
 */
export interface GenerateSummaryRequest {
  date?: Date;
}

/**
 * 生成总结响应
 */
export interface GenerateSummaryResponse {
  success: boolean;
  data: {
    id: string;
    date: Date;
    todayMinutes: number;
    expGained: number;
    bonusApplied: number;
    greeting: string;
    cultivationReview: string;
    insight: string;
    wisdom: string;
    suggestion: string;
    goldenQuote: string;
    generatedAt: Date;
    modelUsed: string;
  };
}

/**
 * 获取总结响应
 */
export interface GetSummaryResponse {
  summary: DailySummary | null;
  hasCultivated: boolean;
}

/**
 * 总结列表项
 */
export interface SummaryListItem {
  id: string;
  date: Date;
  todayMinutes: number;
  expGained: number;
  goldenQuote: string;
  userRating?: number;
}

/**
 * 总结列表响应
 */
export interface SummaryListResponse {
  summaries: SummaryListItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// ============================================
// 核心功能
// ============================================

/**
 * 生成每日总结
 * @param userId 用户ID
 * @param date 日期（默认为今天）
 * @returns 生成的总结
 */
export const generateDailySummaryForUser = async (
  userId: string,
  date?: Date
): Promise<GenerateSummaryResponse> => {
  // 确定目标日期
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 检查是否已存在总结
  const existingSummary = await prisma.dailySummary.findUnique({
    where: {
      userId_date: {
        userId,
        date: startOfDay
      }
    }
  });

  // 获取用户修炼数据
  const [cultivation, bazi, cultivateLogs] = await Promise.all([
    prisma.cultivation.findUnique({
      where: { userId },
      select: {
        realm: true,
        realmName: true,
        todayMinutes: true
      }
    }),
    prisma.bazi.findUnique({
      where: { userId },
      select: {
        rootName: true,
        primaryElement: true
      }
    }),
    prisma.cultivateLog.findMany({
      where: {
        userId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        duration: true,
        expGained: true,
        bonusApplied: true
      }
    })
  ]);

  if (!cultivation) {
    throw new Error('CULTIVATION_NOT_FOUND');
  }

  // 计算今日统计数据
  const todayMinutes = cultivateLogs.reduce(
    (sum: number, log: { duration: number }) => sum + log.duration,
    0
  );
  const expGained = cultivateLogs.reduce(
    (sum: number, log: { expGained: number }) => sum + log.expGained,
    0
  );
  const avgBonus = cultivateLogs.length > 0
    ? cultivateLogs.reduce(
        (sum: number, log: { bonusApplied: number }) => sum + log.bonusApplied,
        0
      ) / cultivateLogs.length
    : 1.0;

  // 如果没有修炼记录，返回默认总结
  if (todayMinutes === 0) {
    const defaultSummary: DailySummaryContent = {
      greeting: '道友，今日未曾修炼。',
      cultivationReview: '今日未有修炼记录，道心可还坚定？',
      insight: '修仙之路，贵在持之以恒。一日不炼，如隔三秋。',
      wisdom: '不积跬步，无以至千里；不积小流，无以成江海。',
      suggestion: '明日开始，记得每日修炼，哪怕只有一刻钟也好。',
      goldenQuote: '道阻且长，行则将至；行而不辍，未来可期。'
    };

    // 如果已存在总结，更新它
    if (existingSummary) {
      const updated = await prisma.dailySummary.update({
        where: { id: existingSummary.id },
        data: {
          todayMinutes: 0,
          expGained: 0,
          bonusApplied: 1.0,
          greeting: defaultSummary.greeting,
          cultivationReview: defaultSummary.cultivationReview,
          insight: defaultSummary.insight,
          wisdom: defaultSummary.wisdom,
          suggestion: defaultSummary.suggestion,
          goldenQuote: defaultSummary.goldenQuote,
          modelUsed: 'default'
        }
      });

      return {
        success: true,
        data: {
          id: updated.id,
          date: updated.date,
          todayMinutes: updated.todayMinutes,
          expGained: updated.expGained,
          bonusApplied: updated.bonusApplied,
          greeting: updated.greeting,
          cultivationReview: updated.cultivationReview,
          insight: updated.insight,
          wisdom: updated.wisdom,
          suggestion: updated.suggestion,
          goldenQuote: updated.goldenQuote,
          generatedAt: updated.generatedAt,
          modelUsed: updated.modelUsed
        }
      };
    }

    // 创建新的默认总结
    const created = await prisma.dailySummary.create({
      data: {
        userId,
        date: startOfDay,
        todayMinutes: 0,
        expGained: 0,
        bonusApplied: 1.0,
        greeting: defaultSummary.greeting,
        cultivationReview: defaultSummary.cultivationReview,
        insight: defaultSummary.insight,
        wisdom: defaultSummary.wisdom,
        suggestion: defaultSummary.suggestion,
        goldenQuote: defaultSummary.goldenQuote,
        modelUsed: 'default',
        generationPrompt: 'No cultivation today'
      }
    });

    return {
      success: true,
      data: {
        id: created.id,
        date: created.date,
        todayMinutes: created.todayMinutes,
        expGained: created.expGained,
        bonusApplied: created.bonusApplied,
        greeting: created.greeting,
        cultivationReview: created.cultivationReview,
        insight: created.insight,
        wisdom: created.wisdom,
        suggestion: created.suggestion,
        goldenQuote: created.goldenQuote,
        generatedAt: created.generatedAt,
        modelUsed: created.modelUsed
      }
    };
  }

  // 调用 AI 生成总结
  let summaryContent: DailySummaryContent;
  let modelUsed: string;

  try {
    const aiResult = await generateDailySummary(
      {
        todayMinutes,
        expGained,
        bonusApplied: avgBonus,
        realm: cultivation.realmName,
        realmLevel: cultivation.realm
      },
      bazi || undefined
    );
    summaryContent = aiResult;
    modelUsed = 'kimi-coding/k2p5';
  } catch (error) {
    console.error('AI 生成总结失败:', error);
    // 使用默认内容
    summaryContent = {
      greeting: `道友，今日修炼了 ${todayMinutes} 分钟。`,
      cultivationReview: `今日修炼 ${todayMinutes} 分钟，获得 ${expGained} 点经验。`,
      insight: '修炼之道，贵在坚持。',
      wisdom: '天道酬勤，不负有心人。',
      suggestion: '明日继续修炼，保持道心。',
      goldenQuote: '修仙之路漫漫，吾将上下而求索。'
    };
    modelUsed = 'fallback';
  }

  // 保存或更新总结
  let summary: DailySummary;
  
  if (existingSummary) {
    summary = await prisma.dailySummary.update({
      where: { id: existingSummary.id },
      data: {
        todayMinutes,
        expGained,
        bonusApplied: avgBonus,
        greeting: summaryContent.greeting,
        cultivationReview: summaryContent.cultivationReview,
        insight: summaryContent.insight,
        wisdom: summaryContent.wisdom,
        suggestion: summaryContent.suggestion,
        goldenQuote: summaryContent.goldenQuote,
        modelUsed,
        generationPrompt: JSON.stringify({ todayMinutes, expGained, realm: cultivation.realmName }),
        generatedAt: new Date()
      }
    });
  } else {
    summary = await prisma.dailySummary.create({
      data: {
        userId,
        date: startOfDay,
        todayMinutes,
        expGained,
        bonusApplied: avgBonus,
        greeting: summaryContent.greeting,
        cultivationReview: summaryContent.cultivationReview,
        insight: summaryContent.insight,
        wisdom: summaryContent.wisdom,
        suggestion: summaryContent.suggestion,
        goldenQuote: summaryContent.goldenQuote,
        modelUsed,
        generationPrompt: JSON.stringify({ todayMinutes, expGained, realm: cultivation.realmName }),
        generatedAt: new Date()
      }
    });
  }

  return {
    success: true,
    data: {
      id: summary.id,
      date: summary.date,
      todayMinutes: summary.todayMinutes,
      expGained: summary.expGained,
      bonusApplied: summary.bonusApplied,
      greeting: summary.greeting,
      cultivationReview: summary.cultivationReview,
      insight: summary.insight,
      wisdom: summary.wisdom,
      suggestion: summary.suggestion,
      goldenQuote: summary.goldenQuote,
      generatedAt: summary.generatedAt,
      modelUsed: summary.modelUsed
    }
  };
};

/**
 * 获取指定日期的总结
 * @param userId 用户ID
 * @param date 日期（可选，默认为今天）
 * @returns 总结信息
 */
export const getDailySummary = async (
  userId: string,
  date?: Date
): Promise<GetSummaryResponse> => {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  // 查找总结
  const summary = await prisma.dailySummary.findUnique({
    where: {
      userId_date: {
        userId,
        date: startOfDay
      }
    }
  });

  // 检查今日是否有修炼
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const cultivateCount = await prisma.cultivateLog.count({
    where: {
      userId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  return {
    summary,
    hasCultivated: cultivateCount > 0
  };
};

/**
 * 获取总结列表
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 总结列表
 */
export const getSummaryList = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SummaryListResponse> => {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 10;
  if (pageSize > 50) pageSize = 50;

  const skip = (page - 1) * pageSize;

  const [summaries, total] = await Promise.all([
    prisma.dailySummary.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        date: true,
        todayMinutes: true,
        expGained: true,
        goldenQuote: true,
        userRating: true
      }
    }),
    prisma.dailySummary.count({
      where: { userId }
    })
  ]);

  return {
    summaries,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  };
};

/**
 * 评价每日总结
 * @param userId 用户ID
 * @param summaryId 总结ID
 * @param rating 评分（1-5）
 * @param feedback 反馈内容（可选）
 * @returns 更新后的总结
 */
export const rateDailySummary = async (
  userId: string,
  summaryId: string,
  rating: number,
  feedback?: string
): Promise<DailySummary> => {
  if (rating < 1 || rating > 5) {
    throw new Error('INVALID_RATING');
  }

  const summary = await prisma.dailySummary.update({
    where: {
      id: summaryId,
      userId // 确保只能评价自己的总结
    },
    data: {
      userRating: rating,
      userFeedback: feedback
    }
  });

  return summary;
};

export default {
  generateDailySummaryForUser,
  getDailySummary,
  getSummaryList,
  rateDailySummary
};
