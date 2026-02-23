// 用户类型
export interface User {
  id: string;
  email: string;
  daoName: string;
  level: number;
  realm: number;
  realmName: string;
  currentExp: number;
  totalExp: number;
  createdAt: string;
}

// 灵根类型
export interface BaziResult {
  rootName: string;
  primaryElement: string;
  rootBonus: number;
}

// 修炼状态
export interface CultivationStatus {
  currentExp: number;
  totalExp: number;
  realm: number;
  realmName: string;
  totalDays: number;
  streakDays: number;
  todayMinutes: number;
  isCultivating: boolean;
  cultivateStartAt: string | null;
}

// 天时数据
export interface TianShi {
  weather: string;
  temperature: number;
  city: string;
  wuYun: string;
  liuQi: string;
  ziWuMeridian: string;
  moonPhase: string;
  totalBonus: number;
}

// 修炼结果
export interface CultivationResult {
  duration: number;
  baseExp: number;
  bonusApplied: number;
  expGained: number;
  levelUp: boolean;
  newRealm?: {
    realm: number;
    realmName: string;
  };
  cultivation: CultivationStatus;
  tianShiDetails: string[];
}

// 修炼记录
export interface CultivationLog {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  expGained: number;
  bonusApplied: number;
  weather: string;
  city: string;
  wuYun: string;
  liuQi: string;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

// 每日箴言
export interface DailyProverb {
  id: string;
  content: string;
  source: string;
  date: string;
}

// 每日总结
export interface DailySummary {
  id: string;
  date: string;
  content: string;
  stats: {
    totalMinutes: number;
    expGained: number;
    sessions: number;
  };
  suggestions: string[];
  rating?: number;
  feedback?: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 境界信息
export interface RealmInfo {
  realm: number;
  name: string;
  requiredExp: number;
}

// 境界列表
export const REALM_LIST: RealmInfo[] = [
  { realm: 1, name: '炼气', requiredExp: 1000 },
  { realm: 2, name: '筑基', requiredExp: 3000 },
  { realm: 3, name: '金丹', requiredExp: 8000 },
  { realm: 4, name: '元婴', requiredExp: 20000 },
  { realm: 5, name: '化神', requiredExp: 50000 },
  { realm: 6, name: '炼虚', requiredExp: 100000 },
  { realm: 7, name: '合体', requiredExp: 200000 },
  { realm: 8, name: '大乘', requiredExp: 500000 },
  { realm: 9, name: '渡劫', requiredExp: 1000000 },
  { realm: 10, name: '真仙', requiredExp: Infinity },
];

// 五行颜色映射
export const ELEMENT_COLORS: Record<string, { color: string; bg: string }> = {
  '金': { color: 'text-gray-200', bg: 'bg-gray-500' },
  '木': { color: 'text-green-400', bg: 'bg-green-500' },
  '水': { color: 'text-blue-400', bg: 'bg-blue-500' },
  '火': { color: 'text-red-400', bg: 'bg-red-500' },
  '土': { color: 'text-yellow-400', bg: 'bg-yellow-600' },
};

// 月相映射
export const MOON_PHASES: Record<string, { name: string; icon: string; bonus: number }> = {
  '新月': { name: '新月', icon: '🌑', bonus: 1.0 },
  '峨眉月': { name: '峨眉月', icon: '🌒', bonus: 1.02 },
  '上弦月': { name: '上弦月', icon: '🌓', bonus: 1.05 },
  '盈凸月': { name: '盈凸月', icon: '🌔', bonus: 1.08 },
  '满月': { name: '满月', icon: '🌕', bonus: 1.15 },
  '亏凸月': { name: '亏凸月', icon: '🌖', bonus: 1.08 },
  '下弦月': { name: '下弦月', icon: '🌗', bonus: 1.05 },
  '残月': { name: '残月', icon: '🌘', bonus: 1.02 },
};
