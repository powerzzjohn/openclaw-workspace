# 凡人修仙 - 项目说明

基于「凡人筑基」理念开发的修仙主题 Web 应用。

## 核心特色

1. **命格系统** - 基于真实生辰八字测算灵根
2. **天时修炼** - 结合天气、五运六气、子午流注
3. **每日心灵总结** - 融入《金丹工程》科学修炼观

## 技术栈

- **前端**: React 18 + TypeScript + TailwindCSS + Zustand
- **后端**: Node.js + Express + Prisma + SQLite
- **AI**: Kimi k2.5 (Moonshot)

## 快速开始

```bash
# 安装前端依赖
cd frontend/my-app && npm install

# 安装后端依赖
cd backend && npm install

# 初始化数据库
cd backend && npx prisma migrate dev --name init

# 启动开发服务器
# 前端: npm run dev (port 5173)
# 后端: npm run dev (port 3001)
```

## 项目文档

- [产品需求文档 (PRD)](./docs/凡人修仙-PRD-v1.0.md)
- [技术架构文档](./docs/技术架构文档.md)
- [开发日志](./memory/开发日志.md)

## 开发原则

1. 代码保存在 `projects/凡人修仙/` 目录
2. 每次完成功能后更新 `开发日志.md`
3. 重大技术决策先询问用户确认
