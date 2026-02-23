export interface RegisterRequest {
    email: string;
    password: string;
    daoName: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface UserResponse {
    id: string;
    email: string;
    daoName: string;
    createdAt: Date;
    lastLoginAt?: Date | null;
}
export interface AuthResponse {
    user: UserResponse;
    token: string;
}
/**
 * 验证邮箱格式
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * 验证密码强度（最少8位，包含字母和数字）
 */
export declare const isValidPassword: (password: string) => boolean;
/**
 * 验证道号（2-20个字符，只允许中文、英文、数字）
 */
export declare const isValidDaoName: (daoName: string) => boolean;
/**
 * 密码加密
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * 密码验证
 */
export declare const verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
/**
 * 用户注册
 */
export declare const register: (data: RegisterRequest) => Promise<AuthResponse>;
/**
 * 用户登录
 */
export declare const login: (data: LoginRequest) => Promise<AuthResponse>;
/**
 * 根据 ID 获取用户信息
 */
export declare const getUserById: (userId: string) => Promise<UserResponse | null>;
declare const _default: {
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    login: (data: LoginRequest) => Promise<AuthResponse>;
    getUserById: (userId: string) => Promise<UserResponse | null>;
    isValidEmail: (email: string) => boolean;
    isValidPassword: (password: string) => boolean;
    isValidDaoName: (daoName: string) => boolean;
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (password: string, hashedPassword: string) => Promise<boolean>;
};
export default _default;
//# sourceMappingURL=authService.d.ts.map