"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
/**
 * 用户注册
 * POST /api/v1/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, daoName } = req.body;
        // 参数验证
        if (!email || !password || !daoName) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: '缺少必要参数：email、password、daoName'
                }
            });
            return;
        }
        // 验证邮箱格式
        if (!authService.isValidEmail(email)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: '邮箱格式不正确'
                }
            });
            return;
        }
        // 验证密码强度
        if (!authService.isValidPassword(password)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: '密码强度不足，至少需要8位且包含字母和数字'
                }
            });
            return;
        }
        // 验证道号格式
        if (!authService.isValidDaoName(daoName)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: '道号格式不正确，需要2-20个字符（中文、英文或数字）'
                }
            });
            return;
        }
        // 执行注册
        const result = await authService.register({ email, password, daoName });
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        const errorMessage = error.message;
        if (errorMessage === 'EMAIL_EXISTS') {
            res.status(409).json({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: '该邮箱已被注册'
                }
            });
            return;
        }
        if (errorMessage === 'DAONAME_EXISTS') {
            res.status(409).json({
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: '该道号已被使用'
                }
            });
            return;
        }
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误'
            }
        });
    }
};
exports.register = register;
/**
 * 用户登录
 * POST /api/v1/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 参数验证
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: '缺少必要参数：email、password'
                }
            });
            return;
        }
        // 执行登录
        const result = await authService.login({ email, password });
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        const errorMessage = error.message;
        if (errorMessage === 'USER_NOT_FOUND') {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '用户不存在'
                }
            });
            return;
        }
        if (errorMessage === 'INVALID_PASSWORD') {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '密码错误'
                }
            });
            return;
        }
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误'
            }
        });
    }
};
exports.login = login;
/**
 * 获取当前用户
 * GET /api/v1/auth/me
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: '未认证'
                }
            });
            return;
        }
        const user = await authService.getUserById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '用户不存在'
                }
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误'
            }
        });
    }
};
exports.getMe = getMe;
exports.default = {
    register: exports.register,
    login: exports.login,
    getMe: exports.getMe
};
//# sourceMappingURL=authController.js.map