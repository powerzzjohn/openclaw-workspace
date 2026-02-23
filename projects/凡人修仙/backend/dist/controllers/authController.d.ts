import { Request, Response } from 'express';
/**
 * 用户注册
 * POST /api/v1/auth/register
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * 用户登录
 * POST /api/v1/auth/login
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * 获取当前用户
 * GET /api/v1/auth/me
 */
export declare const getMe: (req: Request, res: Response) => Promise<void>;
declare const _default: {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    getMe: (req: Request, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=authController.d.ts.map