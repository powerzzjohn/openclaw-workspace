"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cultivationController_1 = require("../controllers/cultivationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/v1/cultivate/start
 * @desc    开始修炼
 * @access  Private
 * @body    { city?: string }
 * @response { success: boolean, data: { cultivation: {...}, tianShi: {...} } }
 */
router.post('/start', auth_1.authenticate, cultivationController_1.startCultivationHandler);
/**
 * @route   POST /api/v1/cultivate/end
 * @desc    结束修炼
 * @access  Private
 * @response { success: boolean, data: { result: {...} } }
 */
router.post('/end', auth_1.authenticate, cultivationController_1.endCultivationHandler);
/**
 * @route   GET /api/v1/cultivate/history
 * @desc    获取修炼历史
 * @access  Private
 * @query   { page?: number, pageSize?: number }
 * @response { success: boolean, data: { logs: [...], pagination: {...} } }
 */
router.get('/history', auth_1.authenticate, cultivationController_1.getCultivationHistoryHandler);
/**
 * @route   GET /api/v1/cultivate/status
 * @desc    获取当前修炼状态
 * @access  Private
 * @response { success: boolean, data: { cultivation: {...}, bazi: {...} } }
 */
router.get('/status', auth_1.authenticate, cultivationController_1.getCultivationStatusHandler);
exports.default = router;
//# sourceMappingURL=cultivationRoutes.js.map