import { Request, Response } from 'express';
import * as authService from '../services/authService';

/**
 * 用户注册
 * POST /api/v1/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    const errorMessage = (error as Error).message;

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

/**
 * 用户登录
 * POST /api/v1/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    const errorMessage = (error as Error).message;

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

/**
 * 获取当前用户
 * GET /api/v1/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
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

export default {
  register,
  login,
  getMe
};
