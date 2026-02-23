import bcrypt from 'bcryptjs';
import { PrismaClient, User } from '@prisma/client';
import { generateToken, TokenPayload } from '../utils/jwt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// 注册请求类型
export interface RegisterRequest {
  email: string;
  password: string;
  daoName: string;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 用户响应类型（不含敏感信息）
export interface UserResponse {
  id: string;
  email: string;
  daoName: string;
  createdAt: Date;
  lastLoginAt?: Date | null;
}

// 认证响应类型
export interface AuthResponse {
  user: UserResponse;
  token: string;
}

/**
 * 验证邮箱格式
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证密码强度（最少8位，包含字母和数字）
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * 验证道号（2-20个字符，只允许中文、英文、数字）
 */
export const isValidDaoName = (daoName: string): boolean => {
  const daoNameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/;
  return daoNameRegex.test(daoName);
};

/**
 * 密码加密
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 密码验证
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * 将 User 转换为 UserResponse
 */
const toUserResponse = (user: User): UserResponse => {
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
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
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
  const passwordHash = await hashPassword(password);

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
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    daoName: user.daoName
  };
  const token = generateToken(tokenPayload);

  return {
    user: toUserResponse(user),
    token
  };
};

/**
 * 用户登录
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const { email, password } = data;

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  // 验证密码
  const isPasswordValid = await verifyPassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('INVALID_PASSWORD');
  }

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // 生成 token
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    daoName: user.daoName
  };
  const token = generateToken(tokenPayload);

  return {
    user: toUserResponse(user),
    token
  };
};

/**
 * 根据 ID 获取用户信息
 */
export const getUserById = async (userId: string): Promise<UserResponse | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return null;
  }

  return toUserResponse(user);
};

export default {
  register,
  login,
  getUserById,
  isValidEmail,
  isValidPassword,
  isValidDaoName,
  hashPassword,
  verifyPassword
};
