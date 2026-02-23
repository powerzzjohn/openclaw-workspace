import axios from 'axios';

// ============================================
// 类型定义
// ============================================

/**
 * 天气数据
 */
export interface WeatherData {
  city: string;           // 城市名称
  weather: string;        // 天气描述（晴、多云、雨等）
  temperature: number;    // 当前温度
  humidity: number;       // 湿度百分比
  pressure: number;       // 气压
  windSpeed: number;      // 风速
  visibility: number;     // 能见度
}

/**
 * 五运六气数据
 */
export interface WuYunLiuQi {
  yearStem: string;       // 年干
  yearBranch: string;     // 地支
  wuYun: string;          // 中运（年运）
  siTian: string;         // 司天
  zaiQuan: string;        // 在泉
  liuQi: string;          // 当前六气
  yunQiBonus: number;     // 运气加成系数
  element: string;        // 五行属性
  description: string;    // 描述
}

/**
 * 子午流注数据
 */
export interface ZiWuLiuZhu {
  currentMeridian: string;    // 当令经络
  element: string;            // 当令五行
  timeRange: string;          // 时间区间
  bonus: number;              // 加成系数
  description: string;        // 描述
}

/**
 * 月相数据
 */
export interface MoonPhase {
  phase: string;          // 月相名称
  illumination: number;   // 月面照亮百分比
  bonus: number;          // 加成系数
}

/**
 * 完整的天时数据
 */
export interface TianShiData {
  weather: WeatherData;
  wuYunLiuQi: WuYunLiuQi;
  ziWuLiuZhu: ZiWuLiuZhu;
  moonPhase: MoonPhase;
  totalBonus: number;     // 总加成系数
}

// ============================================
// 天干地支数据
// ============================================

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行对应
const TIANGAN_ELEMENT: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支五行对应
const DIZHI_ELEMENT: Record<string, string> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '子': '水', '亥': '水'
};

// 年运（中运）对应表
const YEAR_YUN: Record<string, string> = {
  '甲': '土运太过', '乙': '金运不及', '丙': '水运太过', '丁': '木运不及',
  '戊': '火运太过', '己': '土运不及', '庚': '金运太过', '辛': '水运不及',
  '壬': '木运太过', '癸': '火运不及'
};

// 司天在泉对应表（根据地支）
const SI_TIAN_ZAI_QUAN: Record<string, { siTian: string; zaiQuan: string; element: string }> = {
  '子': { siTian: '少阴君火', zaiQuan: '阳明燥金', element: '火' },
  '丑': { siTian: '太阴湿土', zaiQuan: '太阳寒水', element: '土' },
  '寅': { siTian: '少阳相火', zaiQuan: '厥阴风木', element: '火' },
  '卯': { siTian: '阳明燥金', zaiQuan: '少阴君火', element: '金' },
  '辰': { siTian: '太阳寒水', zaiQuan: '太阴湿土', element: '水' },
  '巳': { siTian: '厥阴风木', zaiQuan: '少阳相火', element: '木' },
  '午': { siTian: '少阴君火', zaiQuan: '阳明燥金', element: '火' },
  '未': { siTian: '太阴湿土', zaiQuan: '太阳寒水', element: '土' },
  '申': { siTian: '少阳相火', zaiQuan: '厥阴风木', element: '火' },
  '酉': { siTian: '阳明燥金', zaiQuan: '少阴君火', element: '金' },
  '戌': { siTian: '太阳寒水', zaiQuan: '太阴湿土', element: '水' },
  '亥': { siTian: '厥阴风木', zaiQuan: '少阳相火', element: '木' }
};

// 六气主气（每年固定顺序）
const LIU_QI_ZHU_QI = [
  '厥阴风木',   // 大寒-春分
  '少阴君火',   // 春分-小满
  '少阳相火',   // 小满-大暑
  '太阴湿土',   // 大暑-秋分
  '阳明燥金',   // 秋分-小雪
  '太阳寒水'    // 小雪-大寒
];

// 子午流注经络对应表
const ZI_WU_MERIDIANS = [
  { hour: 0, meridian: '胆经', element: '木', timeRange: '23:00-01:00', desc: '子时胆经当令，一阳初生' },
  { hour: 1, meridian: '肝经', element: '木', timeRange: '01:00-03:00', desc: '丑时肝经当令，养血藏魂' },
  { hour: 3, meridian: '肺经', element: '金', timeRange: '03:00-05:00', desc: '寅时肺经当令，气血始新' },
  { hour: 5, meridian: '大肠经', element: '金', timeRange: '05:00-07:00', desc: '卯时大肠经当令，宜排宿便' },
  { hour: 7, meridian: '胃经', element: '土', timeRange: '07:00-09:00', desc: '辰时胃经当令，宜进早餐' },
  { hour: 9, meridian: '脾经', element: '土', timeRange: '09:00-11:00', desc: '巳时脾经当令，运化水谷' },
  { hour: 11, meridian: '心经', element: '火', timeRange: '11:00-13:00', desc: '午时心经当令，宜静养神' },
  { hour: 13, meridian: '小肠经', element: '火', timeRange: '13:00-15:00', desc: '未时小肠经当令，分清泌浊' },
  { hour: 15, meridian: '膀胱经', element: '水', timeRange: '15:00-17:00', desc: '申时膀胱经当令，宜饮水排毒' },
  { hour: 17, meridian: '肾经', element: '水', timeRange: '17:00-19:00', desc: '酉时肾经当令，藏精蓄锐' },
  { hour: 19, meridian: '心包经', element: '火', timeRange: '19:00-21:00', desc: '戌时心包经当令，宜放松娱乐' },
  { hour: 21, meridian: '三焦经', element: '火', timeRange: '21:00-23:00', desc: '亥时三焦经当令，宜准备就寝' }
];

// ============================================
// 天气 API 相关
// ============================================

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';

/**
 * 获取天气数据
 * @param city 城市名称（英文或中文）
 * @param lat 纬度
 * @param lon 经度
 */
export const getWeatherData = async (
  city?: string,
  lat?: number,
  lon?: number
): Promise<WeatherData | null> => {
  try {
    // 如果没有 API Key，返回模拟数据
    if (!WEATHER_API_KEY) {
      return getMockWeatherData(city || '未知');
    }

    let url: string;
    if (city) {
      url = `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`;
    } else if (lat !== undefined && lon !== undefined) {
      url = `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`;
    } else {
      return getMockWeatherData('未知');
    }

    const response = await axios.get(url, { timeout: 5000 });
    const data = response.data as {
      name: string;
      weather: { description: string }[];
      main: { temp: number; humidity: number; pressure: number };
      wind: { speed: number };
      visibility: number;
    };

    return {
      city: data.name,
      weather: data.weather[0]?.description || '未知',
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      visibility: data.visibility ? data.visibility / 1000 : 10
    };
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return getMockWeatherData(city || '未知');
  }
};

/**
 * 获取模拟天气数据（API 失败时使用）
 */
const getMockWeatherData = (city: string): WeatherData => {
  const weathers = ['晴', '多云', '阴天', '小雨', '微风'];
  const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
  
  return {
    city,
    weather: randomWeather,
    temperature: 20 + Math.floor(Math.random() * 10) - 5,
    humidity: 50 + Math.floor(Math.random() * 30),
    pressure: 1013 + Math.floor(Math.random() * 20) - 10,
    windSpeed: Math.random() * 5,
    visibility: 10
  };
};

// ============================================
// 五运六气计算
// ============================================

/**
 * 计算年干
 * @param year 年份
 */
const getYearStem = (year: number): string => {
  const index = (year - 4) % 10;
  return TIANGAN[index];
};

/**
 * 计算年支
 * @param year 年份
 */
const getYearBranch = (year: number): string => {
  const index = (year - 4) % 12;
  return DIZHI[index];
};

/**
 * 根据日期获取当前六气
 * @param date 日期
 */
const getLiuQi = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 六气对应的节气日期（简化版）
  const periods = [
    { month: 1, day: 20, qi: 5 },   // 大寒 -> 太阳寒水
    { month: 2, day: 19, qi: 0 },   // 雨水 -> 厥阴风木
    { month: 4, day: 20, qi: 1 },   // 谷雨 -> 少阴君火
    { month: 5, day: 21, qi: 2 },   // 小满 -> 少阳相火
    { month: 7, day: 23, qi: 3 },   // 大暑 -> 太阴湿土
    { month: 8, day: 23, qi: 4 },   // 处暑 -> 阳明燥金
    { month: 10, day: 23, qi: 5 },  // 霜降 -> 太阳寒水
    { month: 11, day: 22, qi: 0 },  // 小雪 -> 厥阴风木
    { month: 12, day: 21, qi: 1 }   // 冬至 -> 少阴君火
  ];
  
  let currentQi = 0;
  for (const period of periods) {
    if (month > period.month || (month === period.month && day >= period.day)) {
      currentQi = period.qi;
    }
  }
  
  return LIU_QI_ZHU_QI[currentQi];
};

/**
 * 计算五运六气
 * @param date 日期
 */
export const getWuYunLiuQi = (date: Date = new Date()): WuYunLiuQi => {
  const year = date.getFullYear();
  const yearStem = getYearStem(year);
  const yearBranch = getYearBranch(year);
  
  const wuYun = YEAR_YUN[yearStem];
  const siTianZaiQuan = SI_TIAN_ZAI_QUAN[yearBranch];
  const liuQi = getLiuQi(date);
  
  // 计算运气加成
  const wuYunElement = TIANGAN_ELEMENT[yearStem];
  const yunQiBonus = calculateYunQiBonus(wuYunElement, siTianZaiQuan.element);
  
  return {
    yearStem,
    yearBranch,
    wuYun,
    siTian: siTianZaiQuan.siTian,
    zaiQuan: siTianZaiQuan.zaiQuan,
    liuQi,
    yunQiBonus,
    element: siTianZaiQuan.element,
    description: `${yearStem}${yearBranch}年，${wuYun}，${siTianZaiQuan.siTian}司天，${siTianZaiQuan.zaiQuan}在泉，主气为${liuQi}`
  };
};

/**
 * 计算运气加成系数
 */
const calculateYunQiBonus = (yunElement: string, siTianElement: string): number => {
  // 同气相求，加成更高
  const elementMatch: Record<string, string[]> = {
    '木': ['木'],
    '火': ['火'],
    '土': ['土'],
    '金': ['金'],
    '水': ['水']
  };
  
  const baseBonus = 1.0;
  let bonus = baseBonus;
  
  if (yunElement === siTianElement) {
    bonus += 0.15; // 运气相合，加成 15%
  }
  
  return parseFloat(bonus.toFixed(2));
};

// ============================================
// 子午流注计算
// ============================================

/**
 * 获取当前子午流注
 * @param date 日期
 */
export const getZiWuLiuZhu = (date: Date = new Date()): ZiWuLiuZhu => {
  const hour = date.getHours();
  const meridianIndex = Math.floor(((hour + 1) % 24) / 2);
  const meridian = ZI_WU_MERIDIANS[meridianIndex];
  
  // 计算加成：子时、午时、卯时、酉时（四正时）加成更高
  let bonus = 1.0;
  const specialHours = [0, 6, 12, 18]; // 子、卯、午、酉
  if (specialHours.includes(hour) || specialHours.includes(hour - 1)) {
    bonus = 1.1;
  }
  
  return {
    currentMeridian: meridian.meridian,
    element: meridian.element,
    timeRange: meridian.timeRange,
    bonus,
    description: meridian.desc
  };
};

// ============================================
// 月相计算
// ============================================

/**
 * 计算月相
 * @param date 日期
 */
export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
  // 简化版月相计算
  // 已知2000年1月6日是新月，以此为基准
  const baseDate = new Date(2000, 0, 6);
  const diffDays = (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53059;
  const age = diffDays % lunarCycle;
  const normalizedAge = age < 0 ? age + lunarCycle : age;
  
  // 计算月面照亮百分比
  const illumination = Math.round((1 - Math.cos((normalizedAge / lunarCycle) * 2 * Math.PI)) / 2 * 100);
  
  // 确定月相名称
  let phase: string;
  let bonus = 1.0;
  
  if (normalizedAge < 1) {
    phase = '新月';
    bonus = 1.0;
  } else if (normalizedAge < 7) {
    phase = '峨眉月';
    bonus = 1.02;
  } else if (normalizedAge < 8) {
    phase = '上弦月';
    bonus = 1.05;
  } else if (normalizedAge < 14) {
    phase = '盈凸月';
    bonus = 1.08;
  } else if (normalizedAge < 16) {
    phase = '满月';
    bonus = 1.15; // 满月加成最高
  } else if (normalizedAge < 22) {
    phase = '亏凸月';
    bonus = 1.08;
  } else if (normalizedAge < 23) {
    phase = '下弦月';
    bonus = 1.05;
  } else if (normalizedAge < 29) {
    phase = '残月';
    bonus = 1.02;
  } else {
    phase = '新月';
    bonus = 1.0;
  }
  
  return {
    phase,
    illumination,
    bonus: parseFloat(bonus.toFixed(2))
  };
};

// ============================================
// 综合天时数据获取
// ============================================

/**
 * 获取完整的天时数据
 * @param options 选项
 */
export const getTianShiData = async (options: {
  city?: string;
  lat?: number;
  lon?: number;
  date?: Date;
} = {}): Promise<TianShiData> => {
  const date = options.date || new Date();
  
  // 并行获取各项数据
  const [weather, wuYunLiuQi, ziWuLiuZhu, moonPhase] = await Promise.all([
    getWeatherData(options.city, options.lat, options.lon),
    Promise.resolve(getWuYunLiuQi(date)),
    Promise.resolve(getZiWuLiuZhu(date)),
    Promise.resolve(getMoonPhase(date))
  ]);
  
  // 计算总加成
  const totalBonus = parseFloat(
    (wuYunLiuQi.yunQiBonus * ziWuLiuZhu.bonus * moonPhase.bonus).toFixed(2)
  );
  
  return {
    weather: weather || getMockWeatherData(options.city || '未知'),
    wuYunLiuQi,
    ziWuLiuZhu,
    moonPhase,
    totalBonus
  };
};

/**
 * 获取修炼加成系数（考虑灵根和天时）
 * @param userElement 用户主灵根五行
 * @param tianShi 天时数据
 */
export const getCultivationBonus = (
  userElement: string,
  tianShi: TianShiData
): { totalBonus: number; elementBonus: number; details: string[] } => {
  const details: string[] = [];
  
  // 基础加成
  let totalBonus = tianShi.totalBonus;
  
  // 五行相生相克加成
  let elementBonus = 0;
  const elementRelations: Record<string, { sheng: string; ke: string; beiSheng: string; beiKe: string }> = {
    '金': { sheng: '水', ke: '木', beiSheng: '土', beiKe: '火' },
    '木': { sheng: '火', ke: '土', beiSheng: '水', beiKe: '金' },
    '水': { sheng: '木', ke: '火', beiSheng: '金', beiKe: '土' },
    '火': { sheng: '土', ke: '金', beiSheng: '木', beiKe: '水' },
    '土': { sheng: '金', ke: '水', beiSheng: '火', beiKe: '木' }
  };
  
  const relation = elementRelations[userElement];
  
  // 检查天时五行
  const tianShiElements = [
    tianShi.wuYunLiuQi.element,
    tianShi.ziWuLiuZhu.element
  ];
  
  for (const element of tianShiElements) {
    if (element === userElement) {
      elementBonus += 0.1;
      details.push(`天时五行${element}与灵根相合，加成 +10%`);
    } else if (element === relation.sheng) {
      elementBonus += 0.15;
      details.push(`${element}生${userElement}，获得相生加成 +15%`);
    } else if (element === relation.ke) {
      elementBonus -= 0.1;
      details.push(`${userElement}克${element}，略有损耗 -10%`);
    } else if (element === relation.beiKe) {
      elementBonus -= 0.15;
      details.push(`${element}克${userElement}，受到克制 -15%`);
    }
  }
  
  totalBonus += elementBonus;
  
  // 天气加成
  const weather = tianShi.weather.weather;
  if (weather.includes('晴') || weather.includes('Clear')) {
    totalBonus += 0.05;
    details.push('天气晴朗，天地灵气充沛 +5%');
  } else if (weather.includes('雨') || weather.includes('Rain')) {
    totalBonus += 0.03;
    details.push('雨水滋润，水灵气活跃 +3%');
  }
  
  // 月相加成说明
  if (tianShi.moonPhase.bonus > 1.1) {
    details.push(`月相为${tianShi.moonPhase.phase}，太阴之力强盛`);
  }
  
  return {
    totalBonus: parseFloat(Math.max(0.5, totalBonus).toFixed(2)),
    elementBonus: parseFloat(elementBonus.toFixed(2)),
    details
  };
};

export default {
  getWeatherData,
  getWuYunLiuQi,
  getZiWuLiuZhu,
  getMoonPhase,
  getTianShiData,
  getCultivationBonus
};