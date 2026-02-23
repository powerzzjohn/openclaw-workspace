/**
 * 箴言服务模块
 * 
 * 管理修仙箴言的获取、生成和收藏
 * 
 * @module services/proverbService
 */

import { PrismaClient, Proverb, UserProverb } from '@prisma/client';
import { generateProverb } from './kimiService';

const prisma = new PrismaClient();

// ============================================
// 类型定义
// ============================================

/**
 * 箴言项
 */
export interface ProverbItem {
  id: string;
  text: string;
  source: string;
  element?: string;
  theme?: string;
  isComprehended?: boolean;
  comprehendedAt?: Date;
}

/**
 * 箴言列表响应
 */
export interface ProverbListResponse {
  proverbs: ProverbItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 今日箴言响应
 */
export interface TodayProverbResponse {
  proverb: ProverbItem | null;
  isComprehended: boolean;
}

/**
 * 生成箴言响应
 */
export interface GenerateProverbResponse {
  success: boolean;
  data: {
    text: string;
    source: string;
    theme?: string;
    isNew: boolean;
  };
}

/**
 * 用户箴言统计
 */
export interface UserProverbStats {
  totalComprehended: number;
  totalAvailable: number;
  byElement: Record<string, number>;
}

// ============================================
// 预设箴言库
// ============================================

/**
 * 预设箴言数据
 */
const DEFAULT_PROVERBS: Array<{
  text: string;
  source: string;
  element?: string;
  theme?: string;
}> = [
  {
    text: '天地不仁，以万物为刍狗；圣人不仁，以百姓为刍狗。',
    source: '《道德经》',
    element: '土',
    theme: '心境'
  },
  {
    text: '上善若水，水善利万物而不争。',
    source: '《道德经》',
    element: '水',
    theme: '心境'
  },
  {
    text: '道生一，一生二，二生三，三生万物。',
    source: '《道德经》',
    element: '木',
    theme: '悟道'
  },
  {
    text: '知人者智，自知者明。胜人者有力，自胜者强。',
    source: '《道德经》',
    element: '金',
    theme: '心境'
  },
  {
    text: '大道废，有仁义；智慧出，有大伪。',
    source: '《道德经》',
    element: '火',
    theme: '悟道'
  },
  {
    text: '天行健，君子以自强不息。',
    source: '《易经》',
    element: '金',
    theme: '坚持'
  },
  {
    text: '地势坤，君子以厚德载物。',
    source: '《易经》',
    element: '土',
    theme: '心境'
  },
  {
    text: '穷则变，变则通，通则久。',
    source: '《易经》',
    element: '水',
    theme: '突破'
  },
  {
    text: '一阴一阳之谓道。',
    source: '《易经》',
    element: '木',
    theme: '悟道'
  },
  {
    text: '积善之家，必有余庆；积不善之家，必有余殃。',
    source: '《易经》',
    element: '土',
    theme: '因果'
  },
  {
    text: '修仙之道，在于逆天改命，而非顺天应人。',
    source: '《太虚经》',
    element: '火',
    theme: '修炼'
  },
  {
    text: '心若冰清，天塌不惊；万变犹定，神怡气静。',
    source: '《冰心诀》',
    element: '水',
    theme: '心境'
  },
  {
    text: '五行相生，循环不息；五行相克，制衡有序。',
    source: '《五行真解》',
    element: '木',
    theme: '悟道'
  },
  {
    text: '金性刚强，木性柔和，水性智慧，火性热情，土性稳重。',
    source: '《灵根论》',
    theme: '五行'
  },
  {
    text: '炼精化气，炼气化神，炼神还虚，炼虚合道。',
    source: '《内丹心法》',
    element: '火',
    theme: '修炼'
  },
  {
    text: '悟道者，悟天地之道也；得道者，得长生之道也。',
    source: '《悟道录》',
    element: '木',
    theme: '悟道'
  },
  {
    text: '不以物喜，不以己悲。',
    source: '《岳阳楼记》',
    element: '水',
    theme: '心境'
  },
  {
    text: '非淡泊无以明志，非宁静无以致远。',
    source: '《诫子书》',
    element: '土',
    theme: '心境'
  },
  {
    text: '大道至简，大音希声，大象无形。',
    source: '《道德经》',
    element: '金',
    theme: '悟道'
  },
  {
    text: '合抱之木，生于毫末；九层之台，起于累土。',
    source: '《道德经》',
    element: '木',
    theme: '坚持'
  }
];

// ============================================
// 核心功能
// ============================================

/**
 * 初始化箴言库
 * 如果数据库中为空，则导入预设数据
 */
export const initProverbs = async (): Promise<void> => {
  const count = await prisma.proverb.count();
  
  if (count === 0) {
    console.log('初始化箴言库...');
    
    for (const proverb of DEFAULT_PROVERBS) {
      await prisma.proverb.create({
        data: proverb
      });
    }
    
    console.log(`已导入 ${DEFAULT_PROVERBS.length} 条箴言`);
  }
};

/**
 * 获取箴言列表
 * @param page 页码
 * @param pageSize 每页数量
 * @param element 五行筛选（可选）
 * @param theme 主题筛选（可选）
 * @returns 箴言列表
 */
export const getProverbs = async (
  page: number = 1,
  pageSize: number = 20,
  element?: string,
  theme?: string
): Promise<ProverbListResponse> => {
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 20;
  if (pageSize > 100) pageSize = 100;

  const skip = (page - 1) * pageSize;

  // 构建筛选条件
  const where: {
    element?: string;
    theme?: string;
  } = {};
  if (element) where.element = element;
  if (theme) where.theme = theme;

  const [proverbs, total] = await Promise.all([
    prisma.proverb.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.proverb.count({ where })
  ]);

  return {
    proverbs: proverbs.map((p: Proverb) => ({
      id: p.id,
      text: p.text,
      source: p.source,
      element: p.element || undefined,
      theme: p.theme || undefined
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
 * 获取随机箴言
 * @param element 五行筛选（可选）
 * @returns 随机箴言
 */
export const getRandomProverb = async (
  element?: string
): Promise<ProverbItem | null> => {
  const where: { element?: string } = {};
  if (element) where.element = element;

  // 获取总数
  const total = await prisma.proverb.count({ where });
  
  if (total === 0) return null;

  // 随机跳过
  const skip = Math.floor(Math.random() * total);

  const proverbs = await prisma.proverb.findMany({
    where,
    skip,
    take: 1
  });

  if (proverbs.length === 0) return null;

  const p = proverbs[0];
  return {
    id: p.id,
    text: p.text,
    source: p.source,
    element: p.element || undefined,
    theme: p.theme || undefined
  };
};

/**
 * 获取今日箴言
 * @param userId 用户ID
 * @returns 今日箴言
 */
export const getTodayProverb = async (
  userId: string
): Promise<TodayProverbResponse> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 查找今日箴言
  const userProverb = await prisma.userProverb.findUnique({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    include: {
      proverb: true
    }
  });

  if (userProverb) {
    return {
      proverb: {
        id: userProverb.proverb.id,
        text: userProverb.proverb.text,
        source: userProverb.proverb.source,
        element: userProverb.proverb.element || undefined,
        theme: userProverb.proverb.theme || undefined,
        isComprehended: userProverb.isComprehended,
        comprehendedAt: userProverb.comprehendedAt || undefined
      },
      isComprehended: userProverb.isComprehended
    };
  }

  // 随机选择一条新箴言
  const randomProverb = await getRandomProverb();
  
  if (!randomProverb) {
    return { proverb: null, isComprehended: false };
  }

  // 保存为今日箴言
  await prisma.userProverb.create({
    data: {
      userId,
      date: today,
      proverbId: randomProverb.id,
      isComprehended: false
    }
  });

  return {
    proverb: { ...randomProverb, isComprehended: false },
    isComprehended: false
  };
};

/**
 * AI 生成箴言
 * @param theme 主题（可选）
 * @returns 生成的箴言
 */
export const generateAIProverb = async (
  theme?: string
): Promise<GenerateProverbResponse> => {
  try {
    const result = await generateProverb(theme);

    // 检查是否已存在相同内容的箴言
    const existing = await prisma.proverb.findFirst({
      where: {
        text: {
          contains: result.text.slice(0, 20) // 检查前20个字符
        }
      }
    });

    if (existing) {
      return {
        success: true,
        data: {
          text: existing.text,
          source: existing.source,
          theme: existing.theme || undefined,
          isNew: false
        }
      };
    }

    // 保存新生成的箴言
    const created = await prisma.proverb.create({
      data: {
        text: result.text,
        source: 'AI生成',
        theme: theme || '悟道'
      }
    });

    return {
      success: true,
      data: {
        text: created.text,
        source: created.source,
        theme: created.theme || undefined,
        isNew: true
      }
    };
  } catch (error) {
    console.error('AI 生成箴言失败:', error);
    throw new Error('GENERATE_FAILED');
  }
};

/**
 * 领悟箴言
 * @param userId 用户ID
 * @param proverbId 箴言ID
 * @param date 日期（可选，默认为今天）
 * @returns 更新后的用户箴言记录
 */
export const comprehendProverb = async (
  userId: string,
  proverbId: string,
  date?: Date
): Promise<UserProverb> => {
  const targetDate = date || new Date();
  targetDate.setHours(0, 0, 0, 0);

  const userProverb = await prisma.userProverb.update({
    where: {
      userId_date: {
        userId,
        date: targetDate
      }
    },
    data: {
      isComprehended: true,
      comprehendedAt: new Date()
    }
  });

  return userProverb;
};

/**
 * 获取用户箴言统计
 * @param userId 用户ID
 * @returns 统计信息
 */
export const getUserProverbStats = async (
  userId: string
): Promise<UserProverbStats> => {
  const [comprehended, total, elementStats] = await Promise.all([
    prisma.userProverb.count({
      where: {
        userId,
        isComprehended: true
      }
    }),
    prisma.userProverb.count({
      where: { userId }
    }),
    prisma.userProverb.findMany({
      where: {
        userId,
        isComprehended: true
      },
      include: {
        proverb: {
          select: { element: true }
        }
      }
    })
  ]);

  // 统计各五行数量
  const byElement: Record<string, number> = {};
  for (const up of elementStats) {
    const element = up.proverb.element || '未知';
    byElement[element] = (byElement[element] || 0) + 1;
  }

  return {
    totalComprehended: comprehended,
    totalAvailable: total,
    byElement
  };
};

export default {
  initProverbs,
  getProverbs,
  getRandomProverb,
  getTodayProverb,
  generateAIProverb,
  comprehendProverb,
  getUserProverbStats
};
