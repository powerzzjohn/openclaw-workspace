"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.login = exports.register = exports.verifyPassword = exports.hashPassword = exports.isValidDaoName = exports.isValidPassword = exports.isValidEmail = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const jwt_1 = require("../utils/jwt");
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
/**
 * 验证邮箱格式
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * 验证密码强度（最少8位，包含字母和数字）
 */
const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.isValidPassword = isValidPassword;
/**
 * 验证道号（2-20个字符，只允许中文、英文、数字）
 */
const isValidDaoName = (daoName) => {
    const daoNameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/;
    return daoNameRegex.test(daoName);
};
exports.isValidDaoName = isValidDaoName;
/**
 * 密码加密
 */
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * 密码验证
 */
const verifyPassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.verifyPassword = verifyPassword;
/**
 * 将 User 转换为 UserResponse
 */
const toUserResponse = (user) => {
    return {
        id: user.id,
        email: user.email,
        daoName: user.daoName,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
    };
};
/**
 * 用户注册
 */
const register = async (data) => {
    const { email, password, daoName } = data;
    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUserByEmail) {
        throw new Error('EMAIL_EXISTS');
    }
    // 检查道号是否已存在
    const existingUserByDaoName = await prisma.user.findUnique({
        where: { daoName }
    });
    if (existingUserByDaoName) {
        throw new Error('DAONAME_EXISTS');
    }
    // 加密密码
    const passwordHash = await (0, exports.hashPassword)(password);
    // 创建用户
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            daoName,
            lastLoginAt: new Date()
        }
    });
    // 初始化用户资源
    await prisma.resources.create({
        data: {
            userId: user.id,
            spiritStones: 0
        }
    });
    // 初始化修炼数据
    await prisma.cultivation.create({
        data: {
            userId: user.id,
            currentExp: 0,
            totalExp: 0,
            realm: 1,
            realmName: '炼气',
            totalDays: 0,
            streakDays: 0,
            todayMinutes: 0,
            isCultivating: false
        }
    });
    // 生成 token
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        daoName: user.daoName
    };
    const token = (0, jwt_1.generateToken)(tokenPayload);
    return {
        user: toUserResponse(user),
        token
    };
};
exports.register = register;
/**
 * 用户登录
 */
const login = async (data) => {
    const { email, password } = data;
    // 查找用户
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }
    // 验证密码
    const isPasswordValid = await (0, exports.verifyPassword)(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
    }
    // 更新最后登录时间
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
    });
    // 生成 token
    const tokenPayload = {
        userId: user.id,
        email: user.email,
        daoName: user.daoName
    };
    const token = (0, jwt_1.generateToken)(tokenPayload);
    return {
        user: toUserResponse(user),
        token
    };
};
exports.login = login;
/**
 * 根据 ID 获取用户信息
 */
const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });
    if (!user) {
        return null;
    }
    return toUserResponse(user);
};
exports.getUserById = getUserById;
exports.default = {
    register: exports.register,
    login: exports.login,
    getUserById: exports.getUserById,
    isValidEmail: exports.isValidEmail,
    isValidPassword: exports.isValidPassword,
    isValidDaoName: exports.isValidDaoName,
    hashPassword: exports.hashPassword,
    verifyPassword: exports.verifyPassword
};
//# sourceMappingURL=authService.js.map