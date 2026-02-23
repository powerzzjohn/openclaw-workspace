export interface TokenPayload {
    userId: string;
    email: string;
    daoName: string;
}
/**
 * 生成 JWT Token
 */
export declare const generateToken: (payload: TokenPayload) => string;
/**
 * 验证 JWT Token
 */
export declare const verifyToken: (token: string) => TokenPayload;
/**
 * 从 Authorization header 中提取 token
 */
export declare const extractTokenFromHeader: (authHeader: string | undefined) => string | null;
//# sourceMappingURL=jwt.d.ts.map