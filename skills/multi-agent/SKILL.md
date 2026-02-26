# Multi-Agent 多代理协作系统

简化版 Oh-My-OpenCode 实现，支持多 Agent 协作、并行执行、死磕模式。

## 特性

- **5个专业 Agent**：虾哥、公众号、开发、始运、实验员
- **Ultrawork 模式**：一词激活并行执行
- **Ralph Loop 模式**：任务没完成就不停
- **任务编排**：工作流定义和执行
- **状态跟踪**：持久化任务状态

## 快速开始

```bash
# 查看可用命令
ma

# 列出所有代理
ma agents

# Ultrawork 并行模式
ma ultra "部署凡人修仙" kaifa

# 多代理并行
ma ultra "今天工作总结" xiage,shiyun

# Ralph Loop 死磕模式
ma ralph "修复登录bug" kaifa

# 查看任务状态
ma status
```

## Agent 列表

| 名称 | 角色 | 职责 |
|------|------|------|
| xiage | 总指挥 | 战略规划、协调代理 |
| gongzhonghao | 内容官 | 文章撰写、复盘分析 |
| kaifa | 技术官 | 代码开发、部署上线 |
| shiyun | 分析师 | 日历/备忘录/提醒分析 |
| qita | 实验员 | 临时任务、快速原型 |

## 模式详解

### Ultrawork 并行模式

```bash
ma ultra "任务描述" [代理1,代理2,...]
```

特点：
- 同时启动多个代理
- 各自独立完成子任务
- 适合无依赖的并行工作

示例：
```bash
# 同时让开发和公众号助手工作
ma ultra "部署项目并写文章" kaifa,gongzhonghao
```

### Ralph Loop 死磕模式

```bash
ma ralph "任务描述" [代理]
```

特点：
- 单代理专注一个任务
- 自动重试直到完成
- 每次尝试都有检查点

示例：
```bash
# 死磕修复 bug，最多重试5次
ma ralph "修复凡人修仙登录bug" kaifa
```

## 实现原理

- **任务存储**: `~/.openclaw/workspace/.multi_agent_tasks.json`
- **代理启动**: `openclaw sessions spawn`
- **状态跟踪**: 轮询检查会话状态
- **持久化**: JSON 文件记录所有任务

## 与 OpenClaw 集成

可以在 cron 任务或心跳中使用：

```bash
# 定时并行检查
ma ultra "检查所有项目状态" xiage,kaifa,gongzhonghao
```

## 文件位置

- 主脚本: `~/.openclaw/workspace/scripts/multi_agent.py`
- 快捷命令: `~/.openclaw/workspace/scripts/ma`
