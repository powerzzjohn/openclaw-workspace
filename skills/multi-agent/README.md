# Multi-Agent 协作系统 - 状态跟踪版

## 当前状态

生产版本的 `multi_agent.py` 已实现：
- ✅ 任务状态持久化（JSON文件）
- ✅ Ultrawork/Ralph Loop 工作流管理
- ✅ 任务状态查询
- ⚠️  子代理启动需要 OpenClaw 网关集成

## 问题

OpenClaw 的子代理启动不是简单的 CLI 命令，需要通过：
1. WebSocket Gateway 通信
2. 或 `sessions_spawn` 工具调用
3. 需要特殊的认证和会话管理

## 实用方案

### 方案1：使用现有 cron 任务系统（推荐）

通过 OpenClaw 的 cron 任务真正启动子代理：

```bash
# 创建 Ralph Loop 风格的 cron 任务
openclaw cron add \
  --name "ralph-fix-bug" \
  --schedule "*/5 * * * *" \
  --agent kaifa \
  --task "修复登录bug，未完成继续尝试"
```

### 方案2：使用 ma 作为任务跟踪器

`ma` 命令作为任务规划和跟踪工具：

```bash
# 规划任务
ma ultra "部署项目" kaifa,gongzhonghao

# 手动启动子代理（通过 OpenClaw 界面）
# 然后用 ma 跟踪状态
ma status
```

### 方案3：直接调用 sessions_send

通过主会话向子代理发送消息：

```python
# 在虾哥主会话中
sessions_send(
    agentId="kaifa", 
    message="修复登录bug"
)
```

## 建议

当前 `multi_agent.py` 作为**任务管理框架**是有价值的：
1. 记录所有多代理任务
2. 展示 Ultrawork/Ralph Loop 概念
3. 任务状态跟踪

真正执行需要：
- 用户手动启动子代理，或
- 通过 OpenClaw cron 系统配置

要我帮你配置具体的 cron 任务来实现多代理协作吗？
