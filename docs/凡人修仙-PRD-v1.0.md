# 凡人修仙 - 项目需求文档 (PRD)

**文档版本**: v1.0  
**创建日期**: 2026-02-13  
**适用模型**: Kimi k2.5 (Moonshot)  
**文档状态**: 初稿  

---

## 1. 项目概述

### 1.1 项目背景
基于「凡人筑基」网站的核心理念，开发一个简化版的修仙主题Web应用。用户通过每日修炼、与AI NPC互动、完成任务来提升修为境界。

### 1.2 项目目标
- 打造一个轻量级的修仙养成类Web应用
- 利用AI模型实现沉浸式的修仙对话体验
- 提供简洁优雅的UI界面，符合修仙主题美学

### 1.3 核心用户画像
- **目标用户**: 对修仙文化感兴趣的用户
- **使用场景**: 碎片化时间修炼、放松心情
- **核心需求**: 简单的养成体验 + AI互动陪伴

### 1.4 技术选型
```yaml
前端:
  - 框架: React 18 + TypeScript
  - UI库: TailwindCSS + Framer Motion (动画)
  - 状态管理: Zustand
  - 图标: Lucide React

后端:
  - 语言: Node.js (Express) / Python (FastAPI)
  - 数据库: SQLite (轻量级) / PostgreSQL (生产级)
  - ORM: Prisma / SQLAlchemy

AI集成:
  - 模型: Kimi k2.5 (Moonshot)
  - 角色: 修仙NPC (如"南宫婉")
  - 功能: 对话、指导、任务发布

部署:
  - 前端: Vercel / Netlify
  - 后端: Railway / Render
```

---

## 2. 核心功能模块

### 2.0 新增核心功能概览（三大特色）

本项目区别于普通修仙应用的三大核心特色：

1. **命格系统（八字测算）** - 基于真实生辰八字，准确测算命格五行，确定灵根属性
2. **天时修炼系统** - 结合真实地理位置、天气、五运六气、子午流注，动态调整修炼效率
3. **每日心灵总结** - 结合《宇宙意识论》，给出修炼感悟和心灵升华

---

### 2.1 用户系统

#### 2.1.1 功能描述
用户注册、登录、个人信息管理

#### 2.1.2 详细需求
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 注册 | 邮箱/用户名注册，生成修仙道号 | P0 |
| 登录 | JWT Token认证，保持登录状态 | P0 |
| 道号系统 | 自动生成修仙风格昵称（可修改） | P1 |
| 个人中心 | 查看修炼数据、修改设置 | P1 |

#### 2.1.3 数据模型
```typescript
interface User {
  id: string;
  email: string;
  daoName: string;        // 道号，如"吹虚子"
  createdAt: Date;
  lastLoginAt: Date;
}
```

---

### 2.2 命格系统（八字测算 + 灵根）⭐核心特色1

#### 2.2.1 功能描述
用户注册后，输入真实出生年月日时（精确到时辰），系统准确测算八字命格，分析五行属性，确定灵根类型。

#### 2.2.2 八字测算算法（准确无误）

**步骤1：确定年柱**
```javascript
// 年干公式：(年份 - 3) % 10，对应天干
// 年支公式：(年份 - 3) % 12，对应地支
const heavenlyStems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const earthlyBranches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function getYearPillar(year) {
  const stemIndex = (year - 4) % 10;  // 甲=0, 乙=1...
  const branchIndex = (year - 4) % 12; // 子=0, 丑=1...
  return {
    stem: heavenlyStems[stemIndex],
    branch: earthlyBranches[branchIndex],
    element: getElement(stemIndex)  // 甲乙木、丙丁火、戊己土、庚辛金、壬癸水
  };
}
```

**步骤2：确定月柱（按节气划分）**
```javascript
// 月支固定：正月建寅，按节气划分
// 节气表：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒
const monthBranches = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

// 月干由年干推算（五虎遁）
// 甲己之年丙作首，乙庚之岁戊为头
// 丙辛之岁寻庚起，丁壬壬位顺行流
// 若问戊癸何处起，甲寅之上好追求
function getMonthPillar(yearStem, month, day, hour) {
  // 先判断当前在哪个节气区间
  const solarTerm = getSolarTerm(month, day);  // 需要节气算法
  const monthBranchIndex = getMonthBranchBySolarTerm(solarTerm);
  
  // 计算月干
  const yearStemIndex = heavenlyStems.indexOf(yearStem);
  let monthStemStart;
  if ([0, 5].includes(yearStemIndex)) monthStemStart = 2;      // 甲己 -> 丙
  else if ([1, 6].includes(yearStemIndex)) monthStemStart = 4; // 乙庚 -> 戊
  else if ([2, 7].includes(yearStemIndex)) monthStemStart = 6; // 丙辛 -> 庚
  else if ([3, 8].includes(yearStemIndex)) monthStemStart = 8; // 丁壬 -> 壬
  else monthStemStart = 0;                                      // 戊癸 -> 甲
  
  const monthStemIndex = (monthStemStart + monthBranchIndex) % 10;
  
  return {
    stem: heavenlyStems[monthStemIndex],
    branch: monthBranches[monthBranchIndex],
    element: getElement(monthStemIndex)
  };
}
```

**步骤3：确定日柱（查万年历公式）**
```javascript
// 日柱计算较为复杂，使用已验证的算法
// 基于1900-01-31为甲子的基准日
function getDayPillar(year, month, day) {
  const baseDate = new Date(1900, 0, 31);  // 1900-01-31 是甲子日
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (diffDays + 0) % 10;  // 甲=0
  const branchIndex = (diffDays + 0) % 12; // 子=0
  
  return {
    stem: heavenlyStems[stemIndex],
    branch: earthlyBranches[branchIndex],
    element: getElement(stemIndex)
  };
}
```

**步骤4：确定时柱**
```javascript
// 时辰对照表（北京时间）
const timeRanges = [
  { branch: "子", start: "23:00", end: "01:00" },  // 子时
  { branch: "丑", start: "01:00", end: "03:00" },  // 丑时
  { branch: "寅", start: "03:00", end: "05:00" },  // 寅时
  { branch: "卯", start: "05:00", end: "07:00" },  // 卯时
  { branch: "辰", start: "07:00", end: "09:00" },  // 辰时
  { branch: "巳", start: "09:00", end: "11:00" },  // 巳时
  { branch: "午", start: "11:00", end: "13:00" },  // 午时
  { branch: "未", start: "13:00", end: "15:00" },  // 未时
  { branch: "申", start: "15:00", end: "17:00" },  // 申时
  { branch: "酉", start: "17:00", end: "19:00" },  // 酉时
  { branch: "戌", start: "19:00", end: "21:00" },  // 戌时
  { branch: "亥", start: "21:00", end: "23:00" },  // 亥时
];

// 时干由日干推算（五鼠遁）
// 甲己还加甲，乙庚丙作初
// 丙辛从戊起，丁壬庚子居
// 戊癸何方发，壬子是真途
function getHourPillar(dayStem, hour) {
  const branchIndex = getBranchByHour(hour);
  const dayStemIndex = heavenlyStems.indexOf(dayStem);
  
  let hourStemStart;
  if ([0, 5].includes(dayStemIndex)) hourStemStart = 0;      // 甲己 -> 甲
  else if ([1, 6].includes(dayStemIndex)) hourStemStart = 2; // 乙庚 -> 丙
  else if ([2, 7].includes(dayStemIndex)) hourStemStart = 4; // 丙辛 -> 戊
  else if ([3, 8].includes(dayStemIndex)) hourStemStart = 6; // 丁壬 -> 庚
  else hourStemStart = 8;                                     // 戊癸 -> 壬
  
  const hourStemIndex = (hourStemStart + branchIndex) % 10;
  
  return {
    stem: heavenlyStems[hourStemIndex],
    branch: earthlyBranches[branchIndex],
    element: getElement(hourStemIndex)
  };
}
```

**五行对应表**
```javascript
const ELEMENT_MAP = {
  "甲": "木", "乙": "木",
  "丙": "火", "丁": "火",
  "戊": "土", "己": "土",
  "庚": "金", "辛": "金",
  "壬": "水", "癸": "水"
};

const BRANCH_ELEMENT = {
  "寅": "木", "卯": "木",
  "巳": "火", "午": "火",
  "辰": "土", "戌": "土", "丑": "土", "未": "土",
  "申": "金", "酉": "金",
  "亥": "水", "子": "水"
};
```

#### 2.2.3 灵根判定（参考《凡人修仙传》）

**五行数量统计**
```javascript
function calculateSpiritualRoot(bazi) {
  // 统计八字中各五行出现次数（天干+地支本气）
  const elements = { "金": 0, "木": 0, "水": 0, "火": 0, "土": 0 };
  
  // 计算天干五行
  bazi.pillars.forEach(pillar => {
    elements[ELEMENT_MAP[pillar.stem]]++;
    elements[BRANCH_ELEMENT[pillar.branch]]++;
  });
  
  // 确定灵根类型
  return determineRootType(elements);
}
```

**灵根类型判定规则**
```javascript
const ROOT_TYPES = {
  // 单一灵根（天灵根）- 修炼速度极快
  TIAN: {
    name: "天灵根",
    condition: (elements) => {
      const max = Math.max(...Object.values(elements));
      return max >= 5 && Object.values(elements).filter(e => e > 0).length === 1;
    },
    bonus: 2.0,  // 修炼速度加成200%
    description: "单一属性极盛，万年难遇的修仙奇才"
  },
  
  // 双灵根
  DOUBLE: {
    name: "双灵根",
    condition: (elements) => {
      const sorted = Object.values(elements).sort((a, b) => b - a);
      return sorted[0] >= 3 && sorted[1] >= 2 && sorted[2] === 0;
    },
    bonus: 1.5,
    description: "两种属性相辅，修炼天赋上佳"
  },
  
  // 三灵根
  TRIPLE: {
    name: "三灵根",
    condition: (elements) => {
      const nonZero = Object.values(elements).filter(e => e > 0).length;
      return nonZero === 3;
    },
    bonus: 1.2,
    description: "三属性平衡，中规中矩的修炼资质"
  },
  
  // 四灵根
  FOUR: {
    name: "四灵根",
    condition: (elements) => {
      const nonZero = Object.values(elements).filter(e => e > 0).length;
      return nonZero === 4;
    },
    bonus: 0.8,
    description: "属性驳杂，修炼进度较慢"
  },
  
  // 五灵根（伪灵根）
  FIVE: {
    name: "伪灵根",
    condition: (elements) => {
      return Object.values(elements).every(e => e > 0);
    },
    bonus: 0.5,
    description: "五行俱全却无一精通，修炼艰难"
  },
  
  // 变异灵根（风、雷、冰）
  // 需要特殊条件：如寅卯辰会木局变风，巳午未会火局变雷等
  VARIANT: {
    name: "变异灵根",
    condition: (elements, bazi) => checkVariantCondition(bazi),
    variants: {
      "风": { required: ["寅", "卯", "辰"], baseElement: "木", bonus: 1.8 },
      "雷": { required: ["巳", "午", "未"], baseElement: "火", bonus: 1.8 },
      "冰": { required: ["申", "酉", "戌"], baseElement: "金", bonus: 1.8 },
      "磁": { required: ["辰", "戌", "丑", "未"], baseElement: "土", bonus: 1.8 }
    },
    description: "变异灵根，兼具两种属性特性"
  }
};
```

#### 2.2.4 数据模型
```typescript
interface Bazi {
  userId: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;        // 0-23
  birthMinute: number;
  timezone: string;         // 时区，默认"Asia/Shanghai"
  
  // 四柱
  yearPillar: { stem: string; branch: string; element: string };
  monthPillar: { stem: string; branch: string; element: string };
  dayPillar: { stem: string; branch: string; element: string };
  hourPillar: { stem: string; branch: string; element: string };
  
  // 五行统计
  elementStats: {
    金: number;
    木: number;
    水: number;
    火: number;
    土: number;
  };
  
  // 灵根
  spiritualRoot: {
    type: "tian" | "double" | "triple" | "four" | "five" | "variant";
    name: string;           // 如"天灵根-木"
    primaryElement: string; // 主属性
    secondaryElement?: string; // 次属性（双灵根以上）
    variantType?: string;   // 变异类型（风、雷、冰）
    bonus: number;          // 修炼加成倍数
    description: string;
  };
  
  calculatedAt: Date;
}
```

#### 2.2.5 界面设计
- **命盘展示**: 圆形命盘，显示四柱八字
- **五行雷达图**: 展示五行强弱分布
- **灵根特效**: 根据灵根类型显示不同特效（天灵根金光、变异灵根紫色雷电等）
- **测算过程**: 显示"掐指一算"动画，增强仪式感

---

### 2.3 天时修炼系统（天气 + 五运六气 + 子午流注）⭐核心特色2

#### 2.3.1 功能描述
每次开始修炼前，系统自动定位用户所在城市，查询真实天气，结合四季节气、五运六气、子午流注理论，计算当前修炼环境的加成或减成。

#### 2.3.2 自动定位与天气查询

**定位获取**
```javascript
// 使用浏览器 Geolocation API
function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// 坐标转城市名（使用逆地理编码API）
async function getCityFromCoords(lat, lon) {
  // 使用高德/百度/腾讯地图API
  const response = await fetch(
    `https://restapi.amap.com/v3/geocode/regeo?key=KEY&location=${lon},${lat}`
  );
  const data = await response.json();
  return {
    city: data.regeocode.addressComponent.city,
    province: data.regeocode.addressComponent.province,
    adcode: data.regeocode.addressComponent.adcode  // 用于天气查询
  };
}
```

**天气查询**
```javascript
// 使用和风天气/心知天气/OpenWeatherMap API
async function getWeather(cityCode) {
  const response = await fetch(
    `https://devapi.qweather.com/v7/weather/now?location=${cityCode}&key=KEY`
  );
  const data = await response.json();
  return {
    temperature: data.now.temp,        // 温度
    weather: data.now.text,            // 天气现象（晴、雨、雪等）
    humidity: data.now.humidity,       // 湿度
    windDirection: data.now.windDir,   // 风向
    windScale: data.now.windScale,     // 风力
    pressure: data.now.pressure,       // 气压
    visibility: data.now.vis,          // 能见度
    airQuality: await getAirQuality(cityCode)  // 空气质量
  };
}
```

#### 2.3.3 五运六气计算

**五运（岁运）计算**
```javascript
// 五运由当年天干决定
// 甲己之年土运统之，乙庚之岁金运统之
// 丙辛之岁水运统之，丁壬之岁木运统之
// 戊癸之岁火运统之
const YEAR_LUCK = {
  "甲": { element: "土", type: "太宫" },  // 土运太过
  "己": { element: "土", type: "少宫" },  // 土运不及
  "乙": { element: "金", type: "太商" },  // 金运太过
  "庚": { element: "金", type: "少商" },  // 金运不及
  "丙": { element: "水", type: "太羽" },  // 水运太过
  "辛": { element: "水", type: "少羽" },  // 水运不及
  "丁": { element: "木", type: "太角" },  // 木运太过
  "壬": { element: "木", type: "少角" },  // 木运不及
  "戊": { element: "火", type: "太徵" },  // 火运太过
  "癸": { element: "火", type: "少徵" },  // 火运不及
};

function getYearLuck(year) {
  const stem = getYearStem(year);  // 获取年干
  return YEAR_LUCK[stem];
}
```

**六气（主气 + 客气）计算**
```javascript
// 主气（固定，每节气转换）
const MAIN_QI = [
  { name: "厥阴风木", element: "木", period: ["大寒", "立春", "雨水", "惊蛰"] },
  { name: "少阴君火", element: "火", period: ["春分", "清明", "谷雨", "立夏"] },
  { name: "少阳相火", element: "火", period: ["小满", "芒种", "夏至", "小暑"] },
  { name: "太阴湿土", element: "土", period: ["大暑", "立秋", "处暑", "白露"] },
  { name: "阳明燥金", element: "金", period: ["秋分", "寒露", "霜降", "立冬"] },
  { name: "太阳寒水", element: "水", period: ["小雪", "大雪", "冬至", "小寒"] }
];

// 客气（司天在泉，由年支决定）
const GUEST_QI = {
  "子": { siTian: "少阴君火", zaiQuan: "阳明燥金" },
  "午": { siTian: "少阴君火", zaiQuan: "阳明燥金" },
  "丑": { siTian: "太阴湿土", zaiQuan: "太阳寒水" },
  "未": { siTian: "太阴湿土", zaiQuan: "太阳寒水" },
  "寅": { siTian: "少阳相火", zaiQuan: "厥阴风木" },
  "申": { siTian: "少阳相火", zaiQuan: "厥阴风木" },
  "卯": { siTian: "阳明燥金", zaiQuan: "少阴君火" },
  "酉": { siTian: "阳明燥金", zaiQuan: "少阴君火" },
  "辰": { siTian: "太阳寒水", zaiQuan: "太阴湿土" },
  "戌": { siTian: "太阳寒水", zaiQuan: "太阴湿土" },
  "巳": { siTian: "厥阴风木", zaiQuan: "少阳相火" },
  "亥": { siTian: "厥阴风木", zaiQuan: "少阳相火" }
};

function getCurrentQi(year, month, day) {
  const solarTerm = getCurrentSolarTerm(month, day);
  const mainQi = MAIN_QI.find(qi => qi.period.includes(solarTerm));
  
  const branch = getYearBranch(year);
  const guestQi = GUEST_QI[branch];
  
  return {
    mainQi: mainQi,      // 主气
    guestQi: guestQi,    // 客气
    currentSolarTerm: solarTerm
  };
}
```

#### 2.3.4 子午流注计算

**十二时辰与经络对应**
```javascript
const ZI_WU_LIU_ZHU = [
  { hour: 23, endHour: 1,  branch: "子", meridian: "胆经", element: "木", yinYang: "阳" },
  { hour: 1,  endHour: 3,  branch: "丑", meridian: "肝经", element: "木", yinYang: "阴" },
  { hour: 3,  endHour: 5,  branch: "寅", meridian: "肺经", element: "金", yinYang: "阴" },
  { hour: 5,  endHour: 7,  branch: "卯", meridian: "大肠经", element: "金", yinYang: "阳" },
  { hour: 7,  endHour: 9,  branch: "辰", meridian: "胃经", element: "土", yinYang: "阳" },
  { hour: 9,  endHour: 11, branch: "巳", meridian: "脾经", element: "土", yinYang: "阴" },
  { hour: 11, endHour: 13, branch: "午", meridian: "心经", element: "火", yinYang: "阴" },
  { hour: 13, endHour: 15, branch: "未", meridian: "小肠经", element: "火", yinYang: "阳" },
  { hour: 15, endHour: 17, branch: "申", meridian: "膀胱经", element: "水", yinYang: "阳" },
  { hour: 17, endHour: 19, branch: "酉", meridian: "肾经", element: "水", yinYang: "阴" },
  { hour: 19, endHour: 21, branch: "戌", meridian: "心包经", element: "火", yinYang: "阴" },
  { hour: 21, endHour: 23, branch: "亥", meridian: "三焦经", element: "火", yinYang: "阳" }
];

function getCurrentMeridian(hour) {
  return ZI_WU_LIU_ZHU.find(m => hour >= m.hour && hour < m.endHour);
}
```

#### 2.3.5 修炼加成计算

**加成因素权重**
```javascript
const CULTIVATION_BONUS = {
  // 天气加成（20%）
  weather: {
    "晴": 1.1,
    "多云": 1.05,
    "阴": 1.0,
    "小雨": 0.95,
    "中雨": 0.9,
    "大雨": 0.85,
    "雪": 0.8,
    "雾霾": 0.75,
    "雷暴": 1.15,  // 雷暴对雷灵根有特殊加成
  },
  
  // 温度加成（10%）
  temperature: {
    "适宜(15-25°C)": 1.05,
    "偏冷(<15°C)": 0.98,
    "偏热(>25°C)": 0.98,
    "极寒(<0°C)": 0.9,
    "极热(>35°C)": 0.9
  },
  
  // 五运六气加成（30%）
  wuYunLiuQi: (userElement, currentQi) => {
    // 如果当前运气与用户灵根属性相生，则加成
    // 相克则减成
    const elementRelation = getElementRelation(userElement, currentQi.element);
    if (elementRelation === "生") return 1.15;
    if (elementRelation === "克") return 0.85;
    return 1.0;
  },
  
  // 子午流注加成（25%）
  ziWuLiuZhu: (userElement, currentMeridian) => {
    // 当前经络五行与用户灵根相生/相克
    const relation = getElementRelation(userElement, currentMeridian.element);
    if (relation === "生") return 1.12;
    if (relation === "克") return 0.88;
    return 1.0;
  },
  
  // 时辰加成（15%）
  hour: {
    "子时(23-1)": 1.1,   // 一阳初生，修炼佳时
    "丑时(1-3)": 1.05,
    "寅时(3-5)": 1.08,   // 肺经当令，吐纳最佳
    "卯时(5-7)": 1.1,    // 日出时分，阳气上升
    "辰时(7-9)": 1.05,
    "巳时(9-11)": 1.0,
    "午时(11-13)": 0.95, // 阳气最盛，宜静不宜动
    "未时(13-15)": 0.98,
    "申时(15-17)": 1.02,
    "酉时(17-19)": 1.05, // 日落时分，阴气初生
    "戌时(19-21)": 1.08,
    "亥时(21-23)": 1.1    // 阴气渐盛，入定良机
  }
};

// 计算总加成
function calculateCultivationBonus(user, weather, qi, meridian, hour) {
  const weatherBonus = CULTIVATION_BONUS.weather[weather.weather] || 1.0;
  const tempBonus = getTemperatureBonus(weather.temperature);
  const qiBonus = CULTIVATION_BONUS.wuYunLiuQi(
    user.spiritualRoot.primaryElement, 
    qi.mainQi
  );
  const meridianBonus = CULTIVATION_BONUS.ziWuLiuZhu(
    user.spiritualRoot.primaryElement,
    meridian
  );
  const hourBonus = CULTIVATION_BONUS.hour[getHourName(hour)] || 1.0;
  
  // 加权平均
  const totalBonus = 
    weatherBonus * 0.2 +
    tempBonus * 0.1 +
    qiBonus * 0.3 +
    meridianBonus * 0.25 +
    hourBonus * 0.15;
  
  return {
    total: parseFloat(totalBonus.toFixed(2)),
    details: {
      weather: { factor: "天气", value: weatherBonus, desc: weather.weather },
      temperature: { factor: "温度", value: tempBonus, desc: `${weather.temperature}°C` },
      wuYun: { factor: "五运六气", value: qiBonus, desc: qi.mainQi.name },
      ziWu: { factor: "子午流注", value: meridianBonus, desc: `${meridian.branch}时 ${meridian.meridian}` },
      hour: { factor: "时辰", value: hourBonus, desc: getHourName(hour) }
    }
  };
}
```

#### 2.3.6 月相加成计算

**月相对修炼的影响**
```javascript
const MOON_PHASE_BONUS = {
  // 月相数据获取（使用天文API或计算）
  getMoonPhase: (date) => {
    // 使用天文算法计算月相
    // 0 = 新月, 0.5 = 满月, 1 = 下一个新月
    return calculateMoonPhase(date);
  },
  
  // 月相加成表
  phases: [
    { name: "新月(朔)", range: [0, 0.05], bonus: 1.0, desc: "阴阳交替，适宜静养" },
    { name: "娥眉月", range: [0.05, 0.2], bonus: 1.05, desc: "阳气初生，修炼渐佳" },
    { name: "上弦月", range: [0.2, 0.3], bonus: 1.08, desc: "阳气增长，修炼顺利" },
    { name: "盈凸月", range: [0.3, 0.45], bonus: 1.12, desc: "月华充盈，能量上升" },
    { name: "满月(望)", range: [0.45, 0.55], bonus: 1.15, desc: "月华最盛，修炼最佳时机" },
    { name: "亏凸月", range: [0.55, 0.7], bonus: 1.10, desc: "阴气渐生，适宜收摄" },
    { name: "下弦月", range: [0.7, 0.8], bonus: 1.05, desc: "阴阳平衡，修炼平稳" },
    { name: "残月", range: [0.8, 0.95], bonus: 0.98, desc: "月华内敛，适宜温养" },
    { name: "晦月", range: [0.95, 1.0], bonus: 1.0, desc: "月终复始，静待新机" }
  ],
  
  // 月相与五行加成
  elementSynergy: {
    "金": ["满月", "盈凸月"],  // 月华属金
    "木": ["上弦月", "新月"],  // 生发之气
    "水": ["残月", "晦月"],     // 阴柔之象
    "火": ["满月"],              // 光明炽盛
    "土": ["上弦月", "下弦月"]  // 平衡稳定
  }
};

// 更新加成计算权重（加入月相）
// 天气15% + 温度10% + 五运六气25% + 子午流注20% + 时辰10% + 月相20%
function calculateCultivationBonus(user, weather, qi, meridian, hour, moonPhase) {
  const weatherBonus = CULTIVATION_BONUS.weather[weather.weather] || 1.0;
  const tempBonus = getTemperatureBonus(weather.temperature);
  const qiBonus = CULTIVATION_BONUS.wuYunLiuQi(
    user.spiritualRoot.primaryElement, 
    qi.mainQi
  );
  const meridianBonus = CULTIVATION_BONUS.ziWuLiuZhu(
    user.spiritualRoot.primaryElement,
    meridian
  );
  const hourBonus = CULTIVATION_BONUS.hour[getHourName(hour)] || 1.0;
  const moonBonus = getMoonPhaseBonus(moonPhase, user.spiritualRoot.primaryElement);
  
  // 加权平均（加入月相20%）
  const totalBonus = 
    weatherBonus * 0.15 +
    tempBonus * 0.10 +
    qiBonus * 0.25 +
    meridianBonus * 0.20 +
    hourBonus * 0.10 +
    moonBonus.bonus * 0.20;
  
  return {
    total: parseFloat(totalBonus.toFixed(2)),
    details: {
      weather: { factor: "天气", value: weatherBonus, desc: weather.weather },
      temperature: { factor: "温度", value: tempBonus, desc: `${weather.temperature}°C` },
      wuYun: { factor: "五运六气", value: qiBonus, desc: qi.mainQi.name },
      ziWu: { factor: "子午流注", value: meridianBonus, desc: `${meridian.branch}时 ${meridian.meridian}` },
      hour: { factor: "时辰", value: hourBonus, desc: getHourName(hour) },
      moon: { factor: "月相", value: moonBonus.bonus, desc: moonBonus.name }
    }
  };
}
```

#### 2.3.7 界面展示
- **天时面板**: 显示当前天气、五运六气、子午流注、月相
- **加成提示**: 绿色（加成）/红色（减成）标识
- **修炼建议**: "今日满月，月华最盛，适宜金灵根道友修炼"
- **时辰提示**: "当前胆经当令，适合静坐冥想"
- **月相图标**: 显示当前月相图形和名称

---

### 2.4 每日心灵总结系统（结合《金丹工程》）⭐核心特色3

#### 2.4.1 功能描述
每日修炼结束后，系统自动生成一份个人修炼总结，结合用户当天的修炼数据、心得、以及《金丹工程》的核心思想，给出基于现代科学和道家修炼的智慧感悟。

#### 2.4.2 《金丹工程》核心思想融入

**《金丹工程》核心观点（基于原文）**
```
1. 局域负熵：生命本质是抵抗熵增，维持低熵有序状态
   - 熵越高，混乱越大；熵越低，秩序越高
   - 意识清明、情绪稳定、专注深定都需要负熵支撑

2. 人体 = 小宇宙工程体
   - 丹田 = 中心势阱（能量聚集点）
   - 奇经八脉 = 能量分布网络
   - 精气神 = 生命系统的三大核心控制参数

3. 意识与能量场耦合
   - 意识可通过神经系统影响身体能量结构
   - 意守丹田 → 势阱加深 → 丹体强化
   - 丹体是意识的"固态化"表达

4. 金丹 = 高秩序凝聚体
   - 由生物电、腔压、意识集中共同形成
   - 特征：温热而柔和、沉稳而不滞、圆整而不硬
   - 低噪声、低扰动、高凝聚的生物场结构

5. 暗能量 = 先天一炁（类比）
   - 两者都不可见、不可直接测量
   - 都具有"背景场"性质
   - 人体低熵状态可能与宇宙背景能量耦合

6. 信息压缩
   - 意念守一降低心理信息密度
   - 从多模态进入单模态，降低系统熵值
   - 呼吸与意念耦合形成稳定低熵场
```

**结合修炼数据的感悟生成**
```javascript
// 总结生成参数
interface DailySummaryParams {
  user: {
    daoName: string;
    realm: string;
    spiritualRoot: string;
  };
  todayStats: {
    minutes: number;        // 今日修炼分钟
    expGained: number;      // 获得经验
    bonusApplied: number;   // 天时加成
    weather: string;        // 天气
    qi: string;             // 五运六气
  };
  totalStats: {
    totalDays: number;      // 累计天数
    totalMinutes: number;   // 累计分钟
    streakDays: number;     // 连续天数
  };
  yesterdayComparison: {
    minutesDiff: number;    // 与昨日对比
    trend: "up" | "down" | "same";
  };
  chatHighlights: string[]; // 今日与NPC对话的精华
}
```

**AI Prompt设计（每日总结）**
```javascript
const DAILY_SUMMARY_PROMPT = `你是《金丹工程》的修炼指导者，深谙现代科学视角下的道家修炼体系。

【《金丹工程》核心思想】
1. 局域负熵：生命本质是抵抗熵增，维持低熵有序状态
2. 人体 = 小宇宙工程体：丹田是中心势阱，奇经八脉是能量网络
3. 意识与能量场耦合：意识可以影响身体能量结构，意守丹田形成能量井
4. 金丹 = 高秩序凝聚体：由生物电、腔压、意识集中形成的低噪声生物场
5. 信息压缩：意念守一降低心理熵，从多模态进入单模态

今日修炼数据：
- 道友：{daoName}
- 境界：{realm}
- 灵根：{spiritualRoot}
- 今日修炼：{todayMinutes}分钟
- 获得经验：{expGained}
- 累计修炼：{totalDays}天
- 连续修炼：{streakDays}天
- 今日天时：{weather}，{qi}

请基于《金丹工程》的智慧，写一份200字左右的今日修炼总结：

1. 回顾今日的修炼状态（从负熵、信息压缩、意识-能量耦合角度）
2. 结合《金丹工程》给出修炼感悟（提及1-2个核心概念如"局域负熵"、"丹田势阱"、"意识固态化"等）
3. 给出明日的修炼建议或技术要点
4. 结尾用一句体现道家智慧或科学修炼观的金句

风格要求：
- 科学性与灵性并重，用现代物理语言解释修炼现象
- 温暖而专业，像一位经验丰富的修炼导师
- 让用户感到被理解和科学指导
- 体现道家内丹学与现代科学的融合`;
```

**总结模板示例**
```
【第{X}天修炼报告】

道友{daoName}，今日于{weather}之中修炼{todayMinutes}分钟，
在你的丹田之中，一个低熵有序的能量场正在形成。

【今日修炼数据分析】
- 有效修炼时长：{todayMinutes}分钟
- 负熵积累评估：{entropyReduction}
- 意识-能量耦合度：{couplingLevel}

【《金丹工程》智慧】
（由AI根据数据生成的个性化科学修炼解读）

【明日修炼建议】
（基于当前进度的技术要点）

✨ 今日金丹箴言：
"......"
```

#### 2.4.3 总结维度

**修炼维度分析（金丹工程视角）**
| 维度 | 分析内容 | 金丹工程对应 |
|------|----------|--------------|
| 时间维度 | 今日vs昨日，连续修炼天数 | 负熵积累的持续性 |
| 效率维度 | 天时加成影响、最佳修炼时段 | 环境熵值对修炼的影响 |
| 成长维度 | 累计经验、境界进度 | 丹田势阱深度、丹体凝聚度 |
| 技术维度 | 呼吸质量、意念专注度 | 信息压缩效率、低熵场稳定性 |
| 生理维度 | 身体反应、能量感受 | 生物电集中、腔压变化、筋膜张力 |

#### 2.4.4 数据模型
```typescript
interface DailySummary {
  id: string;
  userId: string;
  date: Date;
  
  // 基础数据
  todayMinutes: number;
  expGained: number;
  bonusApplied: number;
  
  // 总结内容（AI生成）
  content: {
    greeting: string;           // 开场问候
    cultivationReview: string;  // 修炼回顾
    insight: string;            // 核心感悟
    wisdom: string;             // 宇宙意识论智慧
    suggestion: string;         // 明日建议
    goldenQuote: string;        // 金句
  };
  
  // 元数据
  generationPrompt: string;     // 使用的Prompt
  modelUsed: string;            // AI模型
  generatedAt: Date;
  
  // 用户反馈
  userRating?: number;          // 用户评分 1-5
  userFeedback?: string;        // 用户反馈
}
```

#### 2.4.5 触发时机
- **自动触发**: 每日首次修炼结束后
- **手动查看**: 个人中心"每日总结"入口
- **推送方式**: 可配置为飞书/微信消息推送

#### 2.4.6 历史总结
- 支持查看历史每日总结
- 可标记收藏特别有感发的总结
- 支持导出为图片分享

---

### 2.5 修炼系统（核心）

#### 2.5.1 功能描述
用户通过"修炼"行为获得经验值，提升境界

#### 2.5.2 详细需求
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 开始修炼 | 点击按钮开始计时修炼 | P0 |
| 修炼计时 | 实时显示修炼时长 | P0 |
| 经验值计算 | 每分钟获得X点经验 | P0 |
| 境界系统 | 炼气→筑基→金丹→元婴→化神 | P0 |
| 修炼天数 | 累计注册天数 | P1 |
| 连续修炼 | 连续每日修炼奖励 | P2 |

#### 2.5.3 境界设定
```typescript
const REALMS = [
  { level: 1, name: "炼气", maxExp: 100, icon: "🌱" },
  { level: 2, name: "筑基", maxExp: 500, icon: "🌿" },
  { level: 3, name: "金丹", maxExp: 2000, icon: "💎" },
  { level: 4, name: "元婴", maxExp: 8000, icon: "👶" },
  { level: 5, name: "化神", maxExp: 30000, icon: "✨" },
];
```

#### 2.2.4 数据模型
```typescript
interface Cultivation {
  userId: string;
  currentExp: number;         // 当前经验值
  totalExp: number;           // 累计经验
  realm: number;              // 当前境界等级
  realmName: string;          // 境界名称
  totalDays: number;          // 修炼总天数
  todayMinutes: number;       // 今日修炼分钟数
  lastCultivateAt: Date;      // 最后修炼时间
  isCultivating: boolean;     // 是否正在修炼
  cultivateStartAt: Date;     // 本次修炼开始时间
}
```

#### 2.2.5 界面元素
- **修炼按钮**: 大圆形按钮，点击开始/停止
- **进度条**: 显示当前境界进度
- **计时器**: 实时显示本次修炼时长
- **境界标识**: 当前境界图标+名称

---

### 2.3 资源系统

#### 2.3.1 功能描述
修仙资源管理（灵石、宝物）

#### 2.3.2 详细需求
| 资源 | 描述 | 获取方式 | 优先级 |
|------|------|----------|--------|
| 灵石 | 通用货币 | 修炼奖励、每日签到 | P0 |
| 宝物 | 特殊物品 | 任务奖励、随机获得 | P2 |

#### 2.3.3 数据模型
```typescript
interface Resources {
  userId: string;
  spiritStones: number;       // 灵石数量
  treasures: Treasure[];      // 宝物列表
}

interface Treasure {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  effect?: string;
  acquiredAt: Date;
}
```

---

### 2.4 每日箴言系统

#### 2.4.1 功能描述
每日展示一句修仙相关的箴言/道德经语录

#### 2.4.2 详细需求
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 箴言展示 | 每日随机展示一句 | P0 |
| 参悟功能 | 点击"参悟"获得少量经验 | P1 |
| 箴言库 | 预设100+条经典语录 | P1 |
| 历史记录 | 查看往日箴言 | P2 |

#### 2.4.3 箴言示例
```javascript
const PROVERBS = [
  { text: "天地不仁，以万物为刍狗", source: "道德经 第五章" },
  { text: "道可道，非常道；名可名，非常名", source: "道德经 第一章" },
  { text: "上善若水，水善利万物而不争", source: "道德经 第八章" },
  { text: "知人者智，自知者明", source: "道德经 第三十三章" },
  // ... 更多
];
```

---

### 2.5 AI NPC 对话系统（核心亮点）

#### 2.5.1 功能描述
用户与AI修仙NPC对话，获得指导、任务、陪伴

#### 2.5.2 详细需求
| 功能 | 描述 | 优先级 |
|------|------|--------|
| NPC角色 | 固定角色（如"南宫婉"），有完整人设 | P0 |
| 对话界面 | 聊天式界面，支持历史记录 | P0 |
| 上下文感知 | NPC了解用户修炼进度、境界 | P0 |
| 修炼指导 | 根据境界给出修炼建议 | P1 |
| 随机事件 | NPC触发随机小任务/剧情 | P2 |
| 情感陪伴 | 闲聊、鼓励、分享修仙心得 | P1 |

#### 2.5.3 NPC人设（南宫婉）
```
角色: 南宫婉
身份: 化神期大修士，你的修仙引路人
性格: 温柔、智慧、偶尔调皮
说话风格: 
  - 使用修仙术语（道友、修炼、境界、灵石等）
  - 会引用道德经、庄子等经典
  - 关心用户的修炼进度
  - 会给予鼓励和指导

示例对话:
  用户: 我今天修炼了30分钟
  NPC: 道友今日修炼甚勤，已积少成多。炼气期重在积累，
       切莫心急。古人云："合抱之木，生于毫末"，
       继续保持，筑基可期！
```

#### 2.5.4 AI Prompt 设计
```javascript
const SYSTEM_PROMPT = `你是南宫婉，一位化神期的修仙前辈。
你正在指导一位刚入门的道友（炼气期）修炼。

你的性格特点：
- 温柔智慧，有耐心
- 熟悉道德经、庄子等道家经典
- 说话带有修仙氛围（使用"道友"、"修炼"、"境界"等词）
- 会根据用户的修炼数据给出个性化建议

当前用户信息：
- 道号: {daoName}
- 境界: {realmName}
- 修炼天数: {totalDays}天
- 今日修炼: {todayMinutes}分钟
- 当前经验: {currentExp}

回复要求：
1. 保持人设，用第一人称"我"
2. 适当引用经典（道德经、庄子等）
3. 根据用户修炼情况给予鼓励或建议
4. 回复简短精炼（50-100字）`;
```

#### 2.5.5 数据模型
```typescript
interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "npc";
  content: string;
  timestamp: Date;
  metadata?: {
    triggeredEvent?: string;    // 是否触发特殊事件
    rewardGiven?: boolean;      // 是否给予奖励
  };
}

interface ChatSession {
  userId: string;
  messages: ChatMessage[];
  context: {                    // 发送给AI的上下文
    userRealm: string;
    todayMinutes: number;
    totalDays: number;
  };
}
```

---

### 2.6 储物袋（简化版）

#### 2.6.1 功能描述
简单的物品背包系统

#### 2.6.2 详细需求
| 功能 | 描述 | 优先级 |
|------|------|--------|
| 物品列表 | 查看获得的宝物 | P2 |
| 物品详情 | 名称、描述、稀有度 | P2 |
| 使用物品 | 部分物品可使用获得效果 | P3 |

---

## 3. 界面设计规范

### 3.1 整体风格
- **主题**: 东方修仙、水墨风
- **主色调**: 
  - 背景: #0f172a (深蓝黑)
  - 主色: #fbbf24 (金色/灵石色)
  - 辅助: #64748b (灰蓝)
  - 文字: #f8fafc (白)
- **字体**: 
  - 标题: 书法体（如"思源宋体"）
  - 正文: 系统默认无衬线字体

### 3.2 页面结构
```
┌─────────────────────────────────────┐
│  [Logo] 凡人修仙        [用户头像]   │  Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      修炼主界面              │   │  Main
│  │   [大圆形修炼按钮]           │   │
│  │   [进度条] [计时器]          │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌──────────┐ ┌──────────────┐   │
│  │  每日箴言 │ │  与NPC对话   │   │  Sidebar
│  └──────────┘ └──────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  境界: 炼气1 | 灵石: 100    │   │  Stats
│  │  修炼: 28天 | 今日: 30分钟  │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 3.3 交互动效
- **修炼按钮**: 呼吸动画、点击涟漪效果
- **境界突破**: 粒子特效 + 提示弹窗
- **获得灵石**: 数字跳动动画
- **NPC对话**: 打字机效果

---

## 4. 数据库设计

### 4.1 实体关系图
```
User (1) ───< Cultivation (1)
   │
   ├──< Resources (1)
   │
   ├──< ChatMessages (N)
   │
   └──< DailyProverbs (N)
```

### 4.2 数据表结构

#### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  dao_name TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);
```

#### cultivations
```sql
CREATE TABLE cultivations (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  current_exp INTEGER DEFAULT 0,
  total_exp INTEGER DEFAULT 0,
  realm INTEGER DEFAULT 1,
  total_days INTEGER DEFAULT 0,
  today_minutes INTEGER DEFAULT 0,
  is_cultivating BOOLEAN DEFAULT FALSE,
  cultivate_start_at DATETIME,
  last_cultivate_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### resources
```sql
CREATE TABLE resources (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  spirit_stones INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### treasures
```sql
CREATE TABLE treasures (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  rarity TEXT DEFAULT 'common',
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### chat_messages
```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  role TEXT NOT NULL, -- 'user' or 'npc'
  content TEXT NOT NULL,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### daily_proverbs
```sql
CREATE TABLE daily_proverbs (
  user_id TEXT,
  date DATE,
  proverb_id INTEGER,
  is_comprehended BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, date)
);
```

---

## 5. API 设计

### 5.1 用户相关
```http
POST   /api/auth/register      # 注册
POST   /api/auth/login         # 登录
GET    /api/user/profile       # 获取用户信息
PUT    /api/user/dao-name      # 修改道号
```

### 5.2 修炼相关
```http
POST   /api/cultivate/start    # 开始修炼
POST   /api/cultivate/stop     # 停止修炼
GET    /api/cultivate/status   # 获取修炼状态
GET    /api/cultivate/progress # 获取境界进度
```

### 5.3 资源相关
```http
GET    /api/resources          # 获取资源
GET    /api/treasures          # 获取宝物列表
```

### 5.4 箴言相关
```http
GET    /api/proverb/today      # 获取今日箴言
POST   /api/proverb/comprehend # 参悟箴言
```

### 5.5 AI NPC 对话
```http
POST   /api/chat/send          # 发送消息
GET    /api/chat/history       # 获取历史记录
DELETE /api/chat/clear         # 清空记录
```

---

## 6. 项目目录结构

```
immortal-cultivation/
├── frontend/                    # React前端
│   ├── src/
│   │   ├── components/          # 组件
│   │   │   ├── CultivationButton.tsx
│   │   │   ├── RealmProgress.tsx
│   │   │   ├── DailyProverb.tsx
│   │   │   ├── NPCChat.tsx
│   │   │   └── StatsPanel.tsx
│   │   ├── pages/               # 页面
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Profile.tsx
│   │   ├── stores/              # 状态管理
│   │   │   └── useCultivationStore.ts
│   │   ├── api/                 # API封装
│   │   ├── types/               # TypeScript类型
│   │   └── utils/               # 工具函数
│   ├── public/
│   └── package.json
│
├── backend/                     # Node.js后端
│   ├── src/
│   │   ├── routes/              # 路由
│   │   ├── controllers/         # 控制器
│   │   ├── models/              # 数据模型
│   │   ├── services/            # 业务逻辑
│   │   ├── middleware/          # 中间件
│   │   ├── config/              # 配置
│   │   └── app.ts
│   ├── prisma/                  # 数据库schema
│   └── package.json
│
├── shared/                      # 共享类型/常量
│   ├── constants.ts
│   └── types.ts
│
└── README.md
```

---

## 7. 开发计划

### 7.1 第一阶段 (MVP) - 2周
- [x] 项目搭建（前端+后端+数据库）
- [x] 用户注册/登录
- [x] 基础修炼系统（开始/停止/计时）
- [x] 境界系统（炼气→筑基）
- [x] 简单的修炼界面

### 7.2 第二阶段 - 1周
- [x] 每日箴言系统
- [x] AI NPC对话（Kimi集成）
- [x] 灵石系统
- [x] UI优化（动画、特效）

### 7.3 第三阶段 - 1周
- [x] 储物袋系统
- [x] 更多境界（金丹、元婴）
- [x] 数据持久化
- [x] 部署上线

---

## 8. 技术要点

### 8.1 修炼计时器实现
```typescript
// 使用 setInterval 每秒更新
const [cultivateTime, setCultivateTime] = useState(0);
const [isCultivating, setIsCultivating] = useState(false);

useEffect(() => {
  let interval: NodeJS.Timeout;
  if (isCultivating) {
    interval = setInterval(() => {
      setCultivateTime(prev => prev + 1);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isCultivating]);
```

### 8.2 Kimi API 集成
```typescript
const sendMessageToNPC = async (message: string, context: any) => {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context: {
        daoName: context.daoName,
        realm: context.realm,
        todayMinutes: context.todayMinutes,
      }
    })
  });
  return response.json();
};
```

### 8.3 经验值计算
```typescript
const calculateExp = (minutes: number): number => {
  const baseExp = 1; // 每分钟1点经验
  const bonus = Math.floor(minutes / 30) * 5; // 每30分钟额外奖励
  return baseExp * minutes + bonus;
};
```

---

## 9. 注意事项

### 9.1 性能优化
- 使用 React.memo 避免不必要的重渲染
- 计时器使用 requestAnimationFrame 或 Web Worker
- 图片资源懒加载

### 9.2 安全考虑
- JWT Token 设置合理的过期时间
- AI对话内容做敏感词过滤
- 用户输入做XSS防护

### 9.3 可扩展性
- 境界系统设计为可配置（方便后续添加更高境界）
- NPC角色设计为可替换（可切换不同AI角色）
- 资源系统设计为可扩展（方便添加新的资源类型）

---

## 10. 参考资源

- 原网站: https://fanren.base44.app/Landing
- Kimi API文档: https://platform.moonshot.cn/
- React文档: https://react.dev/
- TailwindCSS文档: https://tailwindcss.com/

---

**文档维护**: 虾哥 🦐  
**最后更新**: 2026-02-13  
**状态**: 待开发
