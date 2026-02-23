# 修炼系统 API 文档 (Phase 3)

## 概述
修炼系统实现了核心修仙功能，包括：
- 开始/结束修炼
- 天时数据获取（天气、五运六气、子午流注、月相）
- 经验计算（含灵根加成、天时加成）
- 修炼历史记录

## 基础信息

- **Base URL**: `http://localhost:3001/api/v1/cultivate`
- **认证方式**: Bearer Token

## API 列表

### 1. 开始修炼

开始一次修炼会话，获取天时数据。

```http
POST /api/v1/cultivate/start
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "city": "北京"  // 可选，城市名称
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "cultivation": {
      "id": "b4f71132-eb41-4c6b-8620-294709c08b16",
      "isCultivating": true,
      "cultivateStartAt": "2026-02-14T01:42:33.829Z",
      "tianShi": {
        "weather": "晴",
        "temperature": 20,
        "city": "北京",
        "wuYun": "水运太过",
        "liuQi": "太阳寒水",
        "ziWuMeridian": "脾经",
        "moonPhase": "残月",
        "totalBonus": 1.17
      }
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_CULTIVATING",
    "message": "您已经在修炼中了"
  }
}
```

---

### 2. 结束修炼

结束当前修炼，计算经验收益。

```http
POST /api/v1/cultivate/end
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "result": {
      "duration": 30,              // 修炼时长（分钟）
      "baseExp": 300,              // 基础经验
      "bonusApplied": 1.32,        // 总加成系数
      "expGained": 396,            // 实际获得经验
      "levelUp": false,            // 是否升级
      "newRealm": {                // 升级时返回
        "realm": 2,
        "realmName": "筑基"
      },
      "cultivation": {
        "currentExp": 396,
        "totalExp": 396,
        "realm": 1,
        "realmName": "炼气",
        "todayMinutes": 30,
        "totalDays": 0
      },
      "tianShiDetails": [
        "天时加成：1.17倍",
        "木生火，获得相生加成 +15%",
        "天气晴朗，天地灵气充沛 +5%"
      ]
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_CULTIVATING",
    "message": "您当前不在修炼状态"
  }
}
```

---

### 3. 获取修炼状态

获取当前修炼状态和进度。

```http
GET /api/v1/cultivate/status
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cultivation": {
      "currentExp": 396,
      "totalExp": 396,
      "realm": 1,
      "realmName": "炼气",
      "totalDays": 5,
      "streakDays": 3,
      "todayMinutes": 30,
      "isCultivating": false,
      "cultivateStartAt": null
    },
    "bazi": {
      "rootName": "天灵根·火",
      "primaryElement": "火",
      "rootBonus": 2.0
    }
  }
}
```

---

### 4. 获取修炼历史

获取修炼记录列表。

```http
GET /api/v1/cultivate/history?page=1&pageSize=10
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认10，最大50 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "a1f27444-7d4d-4abc-9e90-dec7314f2745",
        "startTime": "2026-02-14T01:42:33.829Z",
        "endTime": "2026-02-14T01:42:41.631Z",
        "duration": 30,
        "expGained": 396,
        "bonusApplied": 1.32,
        "weather": "晴",
        "city": "北京",
        "wuYun": "水运太过",
        "liuQi": "太阳寒水"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
  }
}
```

---

## 天时系统详解

### 五运六气

根据当前年份和日期计算：

- **年运（中运）**: 如 "水运太过"
- **司天**: 主管上半年的气
- **在泉**: 主管下半年的气
- **六气**: 当前主气

### 子午流注

根据当前时辰计算当令经络：

| 时辰 | 经络 | 五行 | 时间 |
|------|------|------|------|
| 子 | 胆经 | 木 | 23:00-01:00 |
| 丑 | 肝经 | 木 | 01:00-03:00 |
| 寅 | 肺经 | 金 | 03:00-05:00 |
| 卯 | 大肠经 | 金 | 05:00-07:00 |
| 辰 | 胃经 | 土 | 07:00-09:00 |
| 巳 | 脾经 | 土 | 09:00-11:00 |
| 午 | 心经 | 火 | 11:00-13:00 |
| 未 | 小肠经 | 火 | 13:00-15:00 |
| 申 | 膀胱经 | 水 | 15:00-17:00 |
| 酉 | 肾经 | 水 | 17:00-19:00 |
| 戌 | 心包经 | 火 | 19:00-21:00 |
| 亥 | 三焦经 | 火 | 21:00-23:00 |

### 月相加成

| 月相 | 加成 |
|------|------|
| 新月 | 1.0x |
| 峨眉月 | 1.02x |
| 上弦月 | 1.05x |
| 盈凸月 | 1.08x |
| 满月 | 1.15x |
| 亏凸月 | 1.08x |
| 下弦月 | 1.05x |
| 残月 | 1.02x |

---

## 经验计算规则

### 基础经验
- 每分钟基础经验：10 点
- 单次最大修炼时长：8 小时

### 加成计算
```
总加成 = 天时加成 × 灵根加成 × 五行加成

实际经验 = 基础经验 × 总加成
```

### 五行相生相克
- 相生（如木生火）：+15%
- 相合（同五行）：+10%
- 相克（如木克土）：-10%
- 被克（如金克木）：-15%

---

## 境界系统

| 境界 | 名称 | 所需经验 |
|------|------|----------|
| 1 | 炼气 | 1000 |
| 2 | 筑基 | 3000 |
| 3 | 金丹 | 8000 |
| 4 | 元婴 | 20000 |
| 5 | 化神 | 50000 |
| 6 | 炼虚 | 100000 |
| 7 | 合体 | 200000 |
| 8 | 大乘 | 500000 |
| 9 | 渡劫 | 1000000 |
| 10 | 真仙 | ∞ |

---

## 环境变量

```bash
# 天气 API Key（可选，不配置则使用模拟数据）
WEATHER_API_KEY=your_openweather_api_key
```

---

## 测试示例

```bash
# 1. 登录获取 token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"xiuxian@qq.com","password":"Test1234!"}'

# 2. 开始修炼
TOKEN="your_token"
curl -X POST http://localhost:3001/api/v1/cultivate/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"city":"北京"}'

# 3. 结束修炼
curl -X POST http://localhost:3001/api/v1/cultivate/end \
  -H "Authorization: Bearer $TOKEN"

# 4. 查看历史
curl -X GET http://localhost:3001/api/v1/cultivate/history \
  -H "Authorization: Bearer $TOKEN"
```