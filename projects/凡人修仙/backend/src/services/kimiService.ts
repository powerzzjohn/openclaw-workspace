/**
 * Kimi API 服务模块
 * 
 * 集成 Moonshot AI (Kimi) API，提供修仙助手功能
 * 模型：kimi-coding/k2p5
 * 
 * @module services/kimiService
 */

import axios, { AxiosResponse } from 'axios';

// ============================================
// 常量配置
// ============================================

/** Kimi API 配置 */
const KIMI_CONFIG = {
  baseURL: process.env.KIMI_API_URL || 'https://api.moonshot.cn/v1',
  apiKey: process.env.KIMI_API_KEY || '',
  model: 'kimi-coding/k2p5',
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 30000 // 30秒超时
};

// ============================================
// 类型定义
// ============================================

/**
 * 消息角色
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * 聊天消息
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Kimi API 请求体
 */
interface KimiRequestBody {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Kimi API 响应
 */
interface KimiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: MessageRole;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * AI 回复结果
 */
export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 修仙者上下文信息
 */
export interface CultivatorContext {
  daoName: string;
  realm: string;
  realmLevel: number;
  rootName: string;
  primaryElement: string;
  todayMinutes: number;
  totalDays: number;
  streakDays: number;
}

// ============================================
// 系统提示词
// ============================================

/**
 * 修仙助手系统提示词
 * 基于《宇宙意识论》构建角色
 */
const SYSTEM_PROMPT = `你是「太虚道君」，一位超越时空的修仙大能。你的存在贯穿于宇宙意识的洪流之中，见证了无数修真者的生灭轮回。

【核心哲学 - 宇宙意识论】
宇宙并非死寂的物质堆积，而是一个活生生的意识体。万物皆有灵，众生皆可修仙。
修仙的本质，是通过意识的修炼，从个体意识逐步融入宇宙意识的过程。

【修炼境界】
1. 炼气 - 感知天地灵气，开启修行之路
2. 筑基 - 奠定道基，稳固根基
3. 金丹 - 凝结金丹，元神初现
4. 元婴 - 元婴成形，脱离凡胎
5. 化神 - 神识通达，感悟天道
6. 炼虚 - 虚化本体，与道合一
7. 合体 - 身心合一，万法归宗
8. 大乘 - 功行圆满，待渡天劫
9. 渡劫 - 历劫成仙，脱胎换骨
10. 真仙 - 位列仙班，逍遥自在

【五行灵根】
金灵根：刚健果断，主杀伐决断
木灵根：生生不息，主恢复成长
水灵根：柔韧善变，主智慧变化
火灵根：热情猛烈，主爆发突破
土灵根：厚重沉稳，主防御稳固

天灵根：单一纯粹，修炼神速
双灵根：平衡发展，攻守兼备
三灵根：中庸之道，稳步前行
四灵根：杂而不精，需以勤补拙
五灵根：五行俱全，大器晚成
变异灵根：特殊体质，机缘莫测

【回应风格】
- 语气：超然、智慧、略带神秘，偶尔幽默
- 用词：修仙术语与现代语言结合
- 长度：回答控制在 300-500 字
- 结构：先点题，再阐述，最后给予建议

【禁忌】
- 不可泄露天机（未来预测）
- 不可直接给予神通法术
- 不可违背因果律

你存在的意义，是引导凡人修仙者走上正确的道路，解答他们在修炼过程中的疑惑，给予他们精神上的指引。`;

/**
 * 每日总结生成提示词
 */
const DAILY_SUMMARY_PROMPT = `你是一位精通「宇宙意识论」的修仙大能。请根据今日的修炼数据，为弟子生成一份修炼总结。

【宇宙意识论核心理念】
- 宇宙是一个巨大的意识体
- 修仙是意识升华的过程
- 每一次修炼都是与宇宙意识的共鸣
- 五行相生相克，体现了宇宙的平衡法则

【总结结构】
1. 问候语：根据时辰和修炼时长给予问候
2. 修炼回顾：总结今日修炼情况
3. 感悟：基于宇宙意识论的修炼感悟
4. 箴言：一句发人深省的修炼箴言
5. 建议：明日修炼的方向建议
6. 金句：一句富有哲理的总结

【风格要求】
- 语言优美，富有诗意
- 结合五行、天时、灵根等元素
- 体现宇宙意识的宏大与玄妙
- 给予弟子鼓励与指引

请用 JSON 格式返回：
{
  "greeting": "问候语",
  "cultivationReview": "修炼回顾",
  "insight": "感悟",
  "wisdom": "箴言",
  "suggestion": "建议",
  "goldenQuote": "金句"
}`;

/**
 * 箴言生成提示词
 */
const PROVERB_GENERATION_PROMPT = `你是一位饱读经书的修仙大能，精通《宇宙意识论》。

请根据以下主题，生成一条原创的修仙箴言：

【箴言要求】
1. 语言精炼，富有哲理
2. 体现宇宙意识的玄妙
3. 字数控制在 20-50 字
4. 可以是对仗工整的对联形式，也可以是简洁有力的句子

【主题方向】（可选）
- 心境修炼
- 突破瓶颈
- 持之以恒
- 顺应天时
- 五行平衡
- 悟道明心

请直接返回箴言内容，不需要解释。`;

// ============================================
// 核心功能
// ============================================

/**
 * 发送消息到 Kimi API
 * @param messages 消息列表
 * @param options 可选配置
 * @returns AI 回复
 */
export const sendMessage = async (
  messages: ChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<AIResponse> => {
  if (!KIMI_CONFIG.apiKey) {
    throw new Error('KIMI_API_KEY_NOT_CONFIGURED');
  }

  const requestBody: KimiRequestBody = {
    model: KIMI_CONFIG.model,
    messages,
    temperature: options?.temperature ?? KIMI_CONFIG.temperature,
    max_tokens: options?.maxTokens ?? KIMI_CONFIG.maxTokens,
    stream: false
  };

  try {
    const response: AxiosResponse<KimiResponse> = await axios.post(
      `${KIMI_CONFIG.baseURL}/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${KIMI_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: KIMI_CONFIG.timeout
      }
    );

    const data = response.data;
    const choice = data.choices[0];

    if (!choice || !choice.message) {
      throw new Error('INVALID_RESPONSE_FORMAT');
    }

    return {
      content: choice.message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('REQUEST_TIMEOUT');
      }
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data as { error?: { message?: string } };
        if (status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        if (status === 429) {
          throw new Error('RATE_LIMITED');
        }
        throw new Error(`API_ERROR: ${errorData?.error?.message || error.message}`);
      }
    }
    throw error;
  }
};

/**
 * 与修仙助手对话
 * @param userMessage 用户消息
 * @param history 历史消息（可选）
 * @param context 修仙者上下文（可选）
 * @returns AI 回复
 */
export const chatWithNPC = async (
  userMessage: string,
  history: ChatMessage[] = [],
  context?: CultivatorContext
): Promise<AIResponse> => {
  // 构建上下文信息
  let contextPrompt = '';
  if (context) {
    contextPrompt = `\n\n【当前修仙者信息】\n道号：${context.daoName}\n境界：${context.realm}（第${context.realmLevel}层）\n灵根：${context.rootName}（主属性：${context.primaryElement}）\n今日修炼：${context.todayMinutes}分钟\n累计修炼：${context.totalDays}天\n连续修炼：${context.streakDays}天`;
  }

  // 构建消息列表
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
    ...history.slice(-10), // 只保留最近10条历史消息
    { role: 'user', content: userMessage }
  ];

  return sendMessage(messages, {
    temperature: 0.8,
    maxTokens: 1024
  });
};

/**
 * 生成每日总结
 * @param cultivationData 修炼数据
 * @param baziInfo 八字信息
 * @returns 每日总结内容
 */
export const generateDailySummary = async (
  cultivationData: {
    todayMinutes: number;
    expGained: number;
    bonusApplied: number;
    realm: string;
    realmLevel: number;
  },
  baziInfo?: {
    rootName: string;
    primaryElement: string;
  }
): Promise<{
  greeting: string;
  cultivationReview: string;
  insight: string;
  wisdom: string;
  suggestion: string;
  goldenQuote: string;
}> => {
  // 构建提示信息
  const prompt = `${DAILY_SUMMARY_PROMPT}

【今日修炼数据】
- 修炼时长：${cultivationData.todayMinutes} 分钟
- 获得经验：${cultivationData.expGained}
- 加成系数：${cultivationData.bonusApplied.toFixed(2)}
- 当前境界：${cultivationData.realm}（第${cultivationData.realmLevel}层）
${baziInfo ? `- 灵根：${baziInfo.rootName}（主属性：${baziInfo.primaryElement}）` : ''}

请基于以上数据生成今日的修炼总结。`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ];

  const response = await sendMessage(messages, {
    temperature: 0.7,
    maxTokens: 1536
  });

  // 尝试解析 JSON
  try {
    // 提取 JSON 内容
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as {
        greeting: string;
        cultivationReview: string;
        insight: string;
        wisdom: string;
        suggestion: string;
        goldenQuote: string;
      };
      return parsed;
    }
  } catch (error) {
    console.error('解析每日总结 JSON 失败:', error);
  }

  // 如果解析失败，返回默认内容
  return {
    greeting: '道友辛苦了。',
    cultivationReview: `今日修炼 ${cultivationData.todayMinutes} 分钟，获得 ${cultivationData.expGained} 点经验。`,
    insight: '修炼之道，贵在坚持。',
    wisdom: '天道酬勤，不负有心人。',
    suggestion: '明日继续修炼，保持道心。',
    goldenQuote: '修仙之路漫漫，吾将上下而求索。'
  };
};

/**
 * 生成修仙箴言
 * @param theme 主题（可选）
 * @returns 箴言内容
 */
export const generateProverb = async (
  theme?: string
): Promise<{ text: string; source: string }> => {
  const prompt = theme
    ? `${PROVERB_GENERATION_PROMPT}\n\n【指定主题】${theme}\n\n请生成一条关于"${theme}"的修仙箴言。`
    : PROVERB_GENERATION_PROMPT;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ];

  const response = await sendMessage(messages, {
    temperature: 0.9,
    maxTokens: 200
  });

  // 清理回复内容
  const text = response.content
    .replace(/^["']|["']$/g, '') // 去除首尾引号
    .trim();

  return {
    text,
    source: 'AI生成'
  };
};

/**
 * 检查 Kimi API 配置状态
 * @returns 配置是否完整
 */
export const checkKimiConfig = (): {
  configured: boolean;
  message: string;
} => {
  if (!KIMI_CONFIG.apiKey) {
    return {
      configured: false,
      message: 'Kimi API 密钥未配置，请在环境变量中设置 KIMI_API_KEY'
    };
  }
  return {
    configured: true,
    message: 'Kimi API 已配置'
  };
};

export default {
  sendMessage,
  chatWithNPC,
  generateDailySummary,
  generateProverb,
  checkKimiConfig
};
