"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCultivationStatusHandler = exports.getCultivationHistoryHandler = exports.endCultivationHandler = exports.startCultivationHandler = void 0;
const cultivationService_1 = require("../services/cultivationService");
/**
 * 开始修炼
 * POST /api/v1/cultivate/start
 */
const startCultivationHandler = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '请先登录'
                }
            });
            return;
        }
        const { city } = req.body;
        const result = await (0, cultivationService_1.startCultivation)(userId, city);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('开始修炼失败:', error);
        if (error instanceof Error && error.message === 'ALREADY_CULTIVATING') {
            res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_CULTIVATING',
                    message: '您已经在修炼中了'
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '开始修炼失败，请稍后重试'
            }
        });
    }
};
exports.startCultivationHandler = startCultivationHandler;
/**
 * 结束修炼
 * POST /api/v1/cultivate/end
 */
const endCultivationHandler = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '请先登录'
                }
            });
            return;
        }
        const result = await (0, cultivationService_1.endCultivation)(userId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('结束修炼失败:', error);
        if (error instanceof Error) {
            if (error.message === 'CULTIVATION_NOT_FOUND') {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'CULTIVATION_NOT_FOUND',
                        message: '修炼数据不存在'
                    }
                });
                return;
            }
            if (error.message === 'NOT_CULTIVATING') {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'NOT_CULTIVATING',
                        message: '您当前不在修炼状态'
                    }
                });
                return;
            }
        }
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '结束修炼失败，请稍后重试'
            }
        });
    }
};
exports.endCultivationHandler = endCultivationHandler;
/**
 * 获取修炼历史
 * GET /api/v1/cultivate/history
 */
const getCultivationHistoryHandler = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '请先登录'
                }
            });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        // 验证分页参数
        if (page < 1 || pageSize < 1 || pageSize > 50) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PARAMS',
                    message: '分页参数无效'
                }
            });
            return;
        }
        const result = await (0, cultivationService_1.getCultivationHistory)(userId, page, pageSize);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('获取修炼历史失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取修炼历史失败，请稍后重试'
            }
        });
    }
};
exports.getCultivationHistoryHandler = getCultivationHistoryHandler;
/**
 * 获取修炼状态
 * GET /api/v1/cultivate/status
 */
const getCultivationStatusHandler = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '请先登录'
                }
            });
            return;
        }
        const result = await (0, cultivationService_1.getCultivationStatus)(userId);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('获取修炼状态失败:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '获取修炼状态失败，请稍后重试'
            }
        });
    }
};
exports.getCultivationStatusHandler = getCultivationStatusHandler;
exports.default = {
    startCultivationHandler: exports.startCultivationHandler,
    endCultivationHandler: exports.endCultivationHandler,
    getCultivationHistoryHandler: exports.getCultivationHistoryHandler,
    getCultivationStatusHandler: exports.getCultivationStatusHandler
};
//# sourceMappingURL=cultivationController.js.map