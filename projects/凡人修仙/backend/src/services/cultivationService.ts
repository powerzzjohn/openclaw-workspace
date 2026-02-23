import { PrismaClient, Cultivation, CultivateLog, Bazi } from '@prisma/client';
import { getTianShiData, getCultivationBonus, TianShiData } from './tianshiService';

const prisma = new PrismaClient();

// ============================================
// 类型定义
// ============================================

/**
 * 开始修炼响应
 */
export interface StartCultivationResponse {
  success: boolean;
  cultivation: {
    id: string;
    isCultivating: boolean;
    cultivateStartAt: Date | null;
    tianShi: {
      weather: string;
      temperature: number;
      city: string;
      wuYun: string;
      liuQi: string;
      ziWuMeridian: string;
      moonPhase: string;
      totalBonus: number;
    };
  };
}

/**
 * 结束修炼响应
 */
export interface EndCultivationResponse {
  success: boolean;
  result: {
    duration: number;           // 修炼时长（分钟）
    baseExp: number;            // 基础经验
    bonusApplied: number;       // 加成系数
    expGained: number;          // 实际获得经验
    levelUp: boolean;           // 是否升级
    newRealm?: {                // 新境界信息（如果升级）
      realm: number;
      realmName: string;
    };
    cultivation: {
      currentExp: number;
      totalExp: number;
      realm: number;
      realmName: string;
      todayMinutes: number;
      totalDays: number;
    };
    tianShiDetails: string[];   // 天时加成详情
  };
}

/**
 * 修炼记录查询响应
 */
export interface CultivationHistoryResponse {
  logs: CultivateLogItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 修炼记录项
 */
export interface CultivateLogItem {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  expGained: number;
  bonusApplied: number;
  weather: string | null;
  city: string | null;
  wuYun: string | null;
  liuQi: string | null;
}

/**
 * 当前修炼状态响应
 */
export interface CultivationStatusResponse {
  cultivation: {
    currentExp: number;
    totalExp: number;
    realm: number;
    realmName: string;
    totalDays: number;
    streakDays: number;
    todayMinutes: number;
    isCultivating: boolean;
    cultivateStartAt: Date | null;
  } | null;
  bazi: {
    rootName: string;
    primaryElement: string;
    rootBonus: number;
  } | null;
}

// ============================================
// 境界配置
// ============================================

/**
 * 境界配置
 */
const REALM_CONFIGS: Record<number, { name: string; maxExp: number }> = {
  1: { name: '炼气', maxExp: 1000 },
  2: { name: '筑基', maxExp: 3000 },
  3: { name: '金丹', maxExp: 8000 },
  4: { name: '元婴', maxExp: 20000 },
  5: { name: '化神', maxExp: 50000 },
  6: { name: '炼虚', maxExp: 100000 },
  7: { name: '合体', maxExp: 200000 },
  8: { name: '大乘', maxExp: 500000 },
  9: { name: '渡劫', maxExp: 1000000 },
  10: { name: '真仙', maxExp: 999999999 }
};

/**
 * 基础经验计算（每分钟）
 */
const BASE_EXP_PER_MINUTE = 10;

/**
 * 最大单次修炼时长（分钟）
 */
const MAX_CULTIVATION_DURATION = 8 * 60; // 8小时

// ============================================
// 核心修炼功能
// ============================================

/**
 * 开始修炼
 * @param userId 用户ID
 * @param city 城市（用于获取天气）
 */
export const startCultivation = async (
  userId: string,
  city?: string
): Promise<StartCultivationResponse> => {
  // 检查是否已经在修炼中
  const existingCultivation = await prisma.cultivation.findUnique({
    where: { userId }
  });

  if (existingCultivation?.isCultivating) {
    throw new Error('ALREADY_CULTIVATING');
  }

  // 获取天时数据
  const tianShi = await getTianShiData({ city });

  // 更新修炼状态
  const now = new Date();
  const cultivation = await prisma.cultivation.upsert({
    where: { userId },
    create: {
      userId,
      currentExp: 0,
      totalExp: 0,
      realm: 1,
      realmName: '炼气',
      isCultivating: true,
      cultivateStartAt: now,
      todayMinutes: 0,
      totalDays: 0,
      streakDays: 0
    },
    update: {
      isCultivating: true,
      cultivateStartAt: now
    }
  });

  return {
    success: true,
    cultivation: {
      id: cultivation.id,
      isCultivating: cultivation.isCultivating,
      cultivateStartAt: cultivation.cultivateStartAt,
      tianShi: {
        weather: tianShi.weather.weather,
        temperature: tianShi.weather.temperature,
        city: tianShi.weather.city,
        wuYun: tianShi.wuYunLiuQi.wuYun,
        liuQi: tianShi.wuYunLiuQi.liuQi,
        ziWuMeridian: tianShi.ziWuLiuZhu.currentMeridian,
        moonPhase: tianShi.moonPhase.phase,
        totalBonus: tianShi.totalBonus
      }
    }
  };
};

/**
 * 结束修炼
 * @param userId 用户ID
 */
export const endCultivation = async (
  userId: string
): Promise<EndCultivationResponse> => {
  // 获取修炼状态
  const cultivation = await prisma.cultivation.findUnique({
    where: { userId }
  });

  if (!cultivation) {
    throw new Error('CULTIVATION_NOT_FOUND');
  }

  if (!cultivation.isCultivating || !cultivation.cultivateStartAt) {
    throw new Error('NOT_CULTIVATING');
  }

  // 计算修炼时长
  const now = new Date();
  const startTime = cultivation.cultivateStartAt;
  let durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));

  // 限制最大修炼时长
  if (durationMinutes < 1) {
    durationMinutes = 1; // 最少1分钟
  } else if (durationMinutes > MAX_CULTIVATION_DURATION) {
    durationMinutes = MAX_CULTIVATION_DURATION;
  }

  // 获取用户八字信息（用于灵根加成）
  const bazi = await prisma.bazi.findUnique({
    where: { userId }
  });

  // 获取天时数据
  const tianShi = await getTianShiData();

  // 计算加成
  let bonusApplied = tianShi.totalBonus;
  let tianShiDetails: string[] = [];

  if (bazi) {
    const cultivationBonus = getCultivationBonus(bazi.primaryElement, tianShi);
    bonusApplied = cultivationBonus.totalBonus * bazi.rootBonus;
    tianShiDetails = cultivationBonus.details;
  } else {
    tianShiDetails.push(`天时加成：${tianShi.totalBonus.toFixed(2)}倍`);
  }

  // 计算经验
  const baseExp = durationMinutes * BASE_EXP_PER_MINUTE;
  const expGained = Math.floor(baseExp * bonusApplied);

  // 更新修炼数据
  let newCurrentExp = cultivation.currentExp + expGained;
  let newTotalExp = cultivation.totalExp + expGained;
  let newRealm = cultivation.realm;
  let newRealmName = cultivation.realmName;
  let levelUp = false;

  // 检查是否升级
  const currentRealmConfig = REALM_CONFIGS[cultivation.realm];
  if (currentRealmConfig && newCurrentExp >= currentRealmConfig.maxExp) {
    newCurrentExp -= currentRealmConfig.maxExp;
    newRealm = cultivation.realm + 1;
    newRealmName = REALM_CONFIGS[newRealm]?.name || '真仙';
    levelUp = true;
  }

  // 更新今日修炼时长
  const newTodayMinutes = cultivation.todayMinutes + durationMinutes;

  // 更新数据库
  const updatedCultivation = await prisma.cultivation.update({
    where: { userId },
    data: {
      isCultivating: false,
      currentExp: newCurrentExp,
      totalExp: newTotalExp,
      realm: newRealm,
      realmName: newRealmName,
      todayMinutes: newTodayMinutes,
      lastCultivateAt: now
    }
  });

  // 创建修炼记录
  await prisma.cultivateLog.create({
    data: {
      userId,
      startTime,
      endTime: now,
      duration: durationMinutes,
      expGained,
      bonusApplied,
      weather: tianShi.weather.weather,
      temperature: tianShi.weather.temperature,
      city: tianShi.weather.city,
      wuYun: tianShi.wuYunLiuQi.wuYun,
      liuQi: tianShi.wuYunLiuQi.liuQi,
      ziWuMeridian: tianShi.ziWuLiuZhu.currentMeridian,
      moonPhase: tianShi.moonPhase.phase
    }
  });

  return {
    success: true,
    result: {
      duration: durationMinutes,
      baseExp,
      bonusApplied: parseFloat(bonusApplied.toFixed(2)),
      expGained,
      levelUp,
      newRealm: levelUp ? { realm: newRealm, realmName: newRealmName } : undefined,
      cultivation: {
        currentExp: updatedCultivation.currentExp,
        totalExp: updatedCultivation.totalExp,
        realm: updatedCultivation.realm,
        realmName: updatedCultivation.realmName,
        todayMinutes: updatedCultivation.todayMinutes,
        totalDays: updatedCultivation.totalDays
      },
      tianShiDetails
    }
  };
};

/**
 * 获取修炼历史记录
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 */
export const getCultivationHistory = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<CultivationHistoryResponse> => {
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.cultivateLog.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        duration: true,
        expGained: true,
        bonusApplied: true,
        weather: true,
        city: true,
        wuYun: true,
        liuQi: true
      }
    }),
    prisma.cultivateLog.count({
      where: { userId }
    })
  ]);

  return {
    logs: logs.map((log: {
      id: string;
      startTime: Date;
      endTime: Date;
      duration: number;
      expGained: number;
      bonusApplied: number;
      weather: string | null;
      city: string | null;
      wuYun: string | null;
      liuQi: string | null;
    }) => ({
      id: log.id,
      startTime: log.startTime,
      endTime: log.endTime,
      duration: log.duration,
      expGained: log.expGained,
      bonusApplied: log.bonusApplied,
      weather: log.weather,
      city: log.city,
      wuYun: log.wuYun,
      liuQi: log.liuQi
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
 * 获取当前修炼状态
 * @param userId 用户ID
 */
export const getCultivationStatus = async (
  userId: string
): Promise<CultivationStatusResponse> => {
  const [cultivation, bazi] = await Promise.all([
    prisma.cultivation.findUnique({
      where: { userId }
    }),
    prisma.bazi.findUnique({
      where: { userId },
      select: {
        rootName: true,
        primaryElement: true,
        rootBonus: true
      }
    })
  ]);

  if (!cultivation) {
    return {
      cultivation: null,
      bazi: bazi ? {
        rootName: bazi.rootName,
        primaryElement: bazi.primaryElement,
        rootBonus: bazi.rootBonus
      } : null
    };
  }

  return {
    cultivation: {
      currentExp: cultivation.currentExp,
      totalExp: cultivation.totalExp,
      realm: cultivation.realm,
      realmName: cultivation.realmName,
      totalDays: cultivation.totalDays,
      streakDays: cultivation.streakDays,
      todayMinutes: cultivation.todayMinutes,
      isCultivating: cultivation.isCultivating,
      cultivateStartAt: cultivation.cultivateStartAt
    },
    bazi: bazi ? {
      rootName: bazi.rootName,
      primaryElement: bazi.primaryElement,
      rootBonus: bazi.rootBonus
    } : null
  };
};

/**
 * 重置每日修炼数据
 * 应该在每天凌晨调用
 * @param userId 用户ID
 */
export const resetDailyCultivation = async (userId: string): Promise<void> => {
  const cultivation = await prisma.cultivation.findUnique({
    where: { userId }
  });

  if (!cultivation) return;

  // 计算连续天数
  let newStreakDays = cultivation.streakDays;
  let newTotalDays = cultivation.totalDays;

  if (cultivation.todayMinutes > 0) {
    newStreakDays += 1;
    newTotalDays += 1;
  } else {
    newStreakDays = 0;
  }

  await prisma.cultivation.update({
    where: { userId },
    data: {
      todayMinutes: 0,
      streakDays: newStreakDays,
      totalDays: newTotalDays
    }
  });
};

export default {
  startCultivation,
  endCultivation,
  getCultivationHistory,
  getCultivationStatus,
  resetDailyCultivation
};