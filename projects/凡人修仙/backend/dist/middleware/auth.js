"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * JWT 认证中间件
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
    if (!token) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: '缺少认证令牌'
            }
        });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: '无效的认证令牌'
            }
        });
    }
};
exports.authenticate = authenticate;
/**
 * 可选认证中间件（不强制要求登录）
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = (0, jwt_1.extractTokenFromHeader)(authHeader);
    if (token) {
        try {
            const decoded = (0, jwt_1.verifyToken)(token);
            req.user = decoded;
        }
        catch (error) {
            // 可选认证失败不阻止请求
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map