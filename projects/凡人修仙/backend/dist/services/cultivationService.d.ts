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
        duration: number;
        baseExp: number;
        bonusApplied: number;
        expGained: number;
        levelUp: boolean;
        newRealm?: {
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
        tianShiDetails: string[];
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
/**
 * 开始修炼
 * @param userId 用户ID
 * @param city 城市（用于获取天气）
 */
export declare const startCultivation: (userId: string, city?: string) => Promise<StartCultivationResponse>;
/**
 * 结束修炼
 * @param userId 用户ID
 */
export declare const endCultivation: (userId: string) => Promise<EndCultivationResponse>;
/**
 * 获取修炼历史记录
 * @param userId 用户ID
 * @param page 页码
 * @param pageSize 每页数量
 */
export declare const getCultivationHistory: (userId: string, page?: number, pageSize?: number) => Promise<CultivationHistoryResponse>;
/**
 * 获取当前修炼状态
 * @param userId 用户ID
 */
export declare const getCultivationStatus: (userId: string) => Promise<CultivationStatusResponse>;
/**
 * 重置每日修炼数据
 * 应该在每天凌晨调用
 * @param userId 用户ID
 */
export declare const resetDailyCultivation: (userId: string) => Promise<void>;
declare const _default: {
    startCultivation: (userId: string, city?: string) => Promise<StartCultivationResponse>;
    endCultivation: (userId: string) => Promise<EndCultivationResponse>;
    getCultivationHistory: (userId: string, page?: number, pageSize?: number) => Promise<CultivationHistoryResponse>;
    getCultivationStatus: (userId: string) => Promise<CultivationStatusResponse>;
    resetDailyCultivation: (userId: string) => Promise<void>;
};
export default _default;
//# sourceMappingURL=cultivationService.d.ts.map