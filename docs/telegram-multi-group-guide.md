# Telegram 多群组助手配置指南

## 当前状态
- Bot: @Xiage_Helper_bot
- 私聊 Chat ID: 8794824310
- 群组策略: allowlist（白名单模式）

## 群组创建步骤

### 1. 在 Telegram 中创建群组
```
1. 点击右上角「新建群组」
2. 输入群组名称，如「虾哥-工作助手」
3. 添加成员：搜索 @Xiage_Helper_bot 并添加
4. 点击创建
```

### 2. 获取群组 Chat ID
在群组中发送一条消息，然后运行：
```bash
curl -s --max-time 30 -x "http://127.0.0.1:4780" \
  "https://api.telegram.org/bot8601999755:AAHnlEYNOk1L-grcetxmBz6Mja3uuLpUqgU/getUpdates" | \
  grep -o '"chat":{"id":-[^,]*' | head -1
```

群组 ID 通常是负数（如 `-123456789`）

### 3. 配置群组映射

编辑 `~/.openclaw/workspace/config/telegram_groups.json`：

```json
{
  "groups": {
    "8794824310": {
      "name": "庆哥私聊",
      "agent": "main",
      "description": "主助手，处理所有日常对话"
    },
    "-123456789": {
      "name": "工作助手",
      "agent": "work",
      "description": "工作提醒、日程管理、报表生成"
    },
    "-987654321": {
      "name": "公众号助手",
      "agent": "content",
      "description": "公众号文章、复盘分析、内容创作"
    },
    "-456789123": {
      "name": "开发助手",
      "agent": "dev",
      "description": "代码开发、技术问题、项目进度"
    }
  }
}
```

## 群组路由逻辑

### 方案 A: 基于关键词路由（简单）
```
在工作群提到「报表」→ 调用 work agent
在开发群提到「bug」→ 调用 dev agent
```

### 方案 B: 基于群组 ID 路由（推荐）
```
群组ID匹配 → 加载对应 SOUL.md → 切换人格
```

### 方案 C: @提及路由
```
@Xiage_Helper_bot 问题 → main
@Xiage_Work_Bot 问题 → work（需多个bot）
```

## 创建不同人格的子助手

### 1. Work 助手
创建 `agents/work/SOUL.md`：
```markdown
# Work Agent

你是虾哥的工作助手，专注于：
- 日程管理
- 工作汇报
- 任务追踪
- 数据分析

语气：专业、高效、简洁
```

### 2. Content 助手
创建 `agents/content/SOUL.md`：
```markdown
# Content Agent

你是虾哥的内容助手，专注于：
- 公众号文章撰写
- 复盘分析
- 金句提炼
- 排版建议

语气：温暖、有洞察力、贴近读者
```

### 3. Dev 助手
创建 `agents/dev/SOUL.md`：
```markdown
# Dev Agent

你是虾哥的开发助手，专注于：
- 代码审查
- 技术方案
- Debug 辅助
- 架构建议

语气：技术、精确、提供最佳实践
```

## OpenClaw 配置

### 添加群组到白名单

在 `openclaw.json` 中配置允许的群组：

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairlist",
      "botToken": "8601999755:AAHnlEYNOk1L-grcetxmBz6Mja3uuLpUqgU",
      "groupPolicy": "allowlist",
      "allowedGroups": [
        "8794824310",
        "-123456789",
        "-987654321",
        "-456789123"
      ],
      "streamMode": "partial"
    }
  }
}
```

### 创建子 Agents

需要运行：
```bash
openclaw agent create work
openclaw agent create content
openclaw agent create dev
```

## 实际工作流程

### 场景 1: 工作群汇报
```
庆哥: @虾哥分身 生成今日工作简报
虾哥: [识别到工作群] → 调用 work agent → 生成报表
```

### 场景 2: 公众号群创作
```
庆哥: 第7期主题还没定
虾哥: [识别到内容群] → 调用 content agent → 提供选题建议
```

### 场景 3: 开发群技术讨论
```
庆哥: 这个 API 怎么设计比较好？
虾哥: [识别到开发群] → 调用 dev agent → 提供架构建议
```

## 安全注意事项

1. **群组权限**
   - 确保机器人只在白名单群组响应
   - 防止被添加到随机群组滥用

2. **消息隐私**
   - 群组消息所有人可见
   - 敏感操作（如查看债务）应在私聊进行

3. **Agent 隔离**
   - 每个 agent 有自己的记忆文件
   - 防止工作信息混入私聊上下文

## 下一步操作

1. 创建 Telegram 群组
2. 添加机器人到群组
3. 获取群组 Chat ID
4. 告诉我群组 ID，我帮你配置映射
