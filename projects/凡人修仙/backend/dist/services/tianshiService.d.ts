/**
 * 天气数据
 */
export interface WeatherData {
    city: string;
    weather: string;
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    visibility: number;
}
/**
 * 五运六气数据
 */
export interface WuYunLiuQi {
    yearStem: string;
    yearBranch: string;
    wuYun: string;
    siTian: string;
    zaiQuan: string;
    liuQi: string;
    yunQiBonus: number;
    element: string;
    description: string;
}
/**
 * 子午流注数据
 */
export interface ZiWuLiuZhu {
    currentMeridian: string;
    element: string;
    timeRange: string;
    bonus: number;
    description: string;
}
/**
 * 月相数据
 */
export interface MoonPhase {
    phase: string;
    illumination: number;
    bonus: number;
}
/**
 * 完整的天时数据
 */
export interface TianShiData {
    weather: WeatherData;
    wuYunLiuQi: WuYunLiuQi;
    ziWuLiuZhu: ZiWuLiuZhu;
    moonPhase: MoonPhase;
    totalBonus: number;
}
/**
 * 获取天气数据
 * @param city 城市名称（英文或中文）
 * @param lat 纬度
 * @param lon 经度
 */
export declare const getWeatherData: (city?: string, lat?: number, lon?: number) => Promise<WeatherData | null>;
/**
 * 计算五运六气
 * @param date 日期
 */
export declare const getWuYunLiuQi: (date?: Date) => WuYunLiuQi;
/**
 * 获取当前子午流注
 * @param date 日期
 */
export declare const getZiWuLiuZhu: (date?: Date) => ZiWuLiuZhu;
/**
 * 计算月相
 * @param date 日期
 */
export declare const getMoonPhase: (date?: Date) => MoonPhase;
/**
 * 获取完整的天时数据
 * @param options 选项
 */
export declare const getTianShiData: (options?: {
    city?: string;
    lat?: number;
    lon?: number;
    date?: Date;
}) => Promise<TianShiData>;
/**
 * 获取修炼加成系数（考虑灵根和天时）
 * @param userElement 用户主灵根五行
 * @param tianShi 天时数据
 */
export declare const getCultivationBonus: (userElement: string, tianShi: TianShiData) => {
    totalBonus: number;
    elementBonus: number;
    details: string[];
};
declare const _default: {
    getWeatherData: (city?: string, lat?: number, lon?: number) => Promise<WeatherData | null>;
    getWuYunLiuQi: (date?: Date) => WuYunLiuQi;
    getZiWuLiuZhu: (date?: Date) => ZiWuLiuZhu;
    getMoonPhase: (date?: Date) => MoonPhase;
    getTianShiData: (options?: {
        city?: string;
        lat?: number;
        lon?: number;
        date?: Date;
    }) => Promise<TianShiData>;
    getCultivationBonus: (userElement: string, tianShi: TianShiData) => {
        totalBonus: number;
        elementBonus: number;
        details: string[];
    };
};
export default _default;
//# sourceMappingURL=tianshiService.d.ts.map