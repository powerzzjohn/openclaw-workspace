"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cultivationRoutes_1 = __importDefault(require("./routes/cultivationRoutes"));
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// 中间件
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API 路由
app.use('/api/v1/auth', authRoutes_1.default);
app.use('/api/v1/cultivate', cultivationRoutes_1.default);
// app.use('/api/v1/user', userRoutes);
// app.use('/api/v1/bazi', baziRoutes);
// app.use('/api/v1/chat', chatRoutes);
// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: '服务器内部错误'
        }
    });
});
// 404 处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: '接口不存在'
        }
    });
});
app.listen(PORT, () => {
    console.log(`🚀 凡人修仙后端服务已启动`);
    console.log(`📡 监听端口: ${PORT}`);
    console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});
//# sourceMappingURL=app.js.map