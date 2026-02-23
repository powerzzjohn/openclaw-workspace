import type { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';
import type { ApiResponse, User, CultivationStatus, CultivationResult, CultivationLog, TianShi, ChatMessage, DailySummary, BaziResult } from '../types';

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('xiu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      // Token过期，清除并跳转登录
      localStorage.removeItem('xiu_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== 认证相关 =====

export const authApi = {
  // 注册
  register: async (data: { email: string; password: string; daoName: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // 登录
  login: async (data: { email: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // 获取当前用户
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// ===== 修炼相关 =====

export const cultivationApi = {
  // 开始修炼
  start: async (city?: string): Promise<ApiResponse<{ cultivation: { id: string; isCultivating: boolean; cultivateStartAt: string; tianShi: TianShi } }>> => {
    const response = await apiClient.post('/cultivate/start', { city });
    return response.data;
  },

  // 结束修炼
  end: async (): Promise<ApiResponse<{ result: CultivationResult }>> => {
    const response = await apiClient.post('/cultivate/end');
    return response.data;
  },

  // 获取修炼状态
  getStatus: async (): Promise<ApiResponse<{ cultivation: CultivationStatus; bazi: BaziResult }>> => {
    const response = await apiClient.get('/cultivate/status');
    return response.data;
  },

  // 获取修炼历史
  getHistory: async (page = 1, pageSize = 10): Promise<ApiResponse<{ logs: CultivationLog[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } }>> => {
    const response = await apiClient.get('/cultivate/history', { params: { page, pageSize } });
    return response.data;
  },
};

// ===== 聊天相关 =====

export const chatApi = {
  // 发送消息
  sendMessage: async (message: string): Promise<ApiResponse<{ reply: string }>> => {
    const response = await apiClient.post('/chat', { message });
    return response.data;
  },

  // 获取聊天历史
  getHistory: async (page = 1, pageSize = 20): Promise<ApiResponse<{ messages: ChatMessage[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } }>> => {
    const response = await apiClient.get('/chat/history', { params: { page, pageSize } });
    return response.data;
  },

  // 清空聊天历史
  clearHistory: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete('/chat/history');
    return response.data;
  },
};

// ===== 每日总结相关 =====

export const dailySummaryApi = {
  // 生成每日总结
  generate: async (date?: string): Promise<ApiResponse<DailySummary>> => {
    const response = await apiClient.post('/daily/summary', { date });
    return response.data;
  },

  // 获取每日总结
  get: async (date?: string): Promise<ApiResponse<DailySummary>> => {
    const response = await apiClient.get('/daily/summary', { params: { date } });
    return response.data;
  },

  // 获取总结列表
  getList: async (page = 1, pageSize = 10): Promise<ApiResponse<{ summaries: DailySummary[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } }>> => {
    const response = await apiClient.get('/daily/summaries', { params: { page, pageSize } });
    return response.data;
  },

  // 评价每日总结
  rate: async (id: string, rating: number, feedback?: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post(`/daily/summary/${id}/rate`, { rating, feedback });
    return response.data;
  },
};

// ===== 八字计算 =====

export const baziApi = {
  // 计算八字（基于用户注册时的生日信息，这里简化处理）
  calculate: async (): Promise<ApiResponse<BaziResult>> => {
    // 模拟数据
    const elements = ['金', '木', '水', '火', '土'];
    const rootTypes = ['天灵根', '地灵根', '真灵根', '伪灵根'];
    const randomElement = elements[Math.floor(Math.random() * elements.length)];
    const randomRoot = rootTypes[Math.floor(Math.random() * rootTypes.length)];
    
    return {
      success: true,
      data: {
        rootName: `${randomRoot}·${randomElement}`,
        primaryElement: randomElement,
        rootBonus: 1.5 + Math.random(),
      },
    };
  },
};

export default apiClient;
