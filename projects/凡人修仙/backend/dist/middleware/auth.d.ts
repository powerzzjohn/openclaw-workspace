import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/jwt';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
/**
 * JWT 认证中间件
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * 可选认证中间件（不强制要求登录）
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map