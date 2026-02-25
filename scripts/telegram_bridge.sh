#!/bin/bash
# Telegram Bridge - 统一执行脚本
# 先轮询获取消息，然后处理

SCRIPT_DIR="/Users/pojohns/.openclaw/workspace/scripts"
LOG_FILE="/Users/pojohns/.openclaw/workspace/logs/telegram_bridge.log"

# 步骤1: 轮询获取新消息
bash "${SCRIPT_DIR}/telegram_bridge_poll.sh"

# 步骤2: 处理消息（简单命令直接回复，复杂消息进入队列）
bash "${SCRIPT_DIR}/telegram_bridge_process.sh"

echo "[$(date)] Telegram bridge cycle completed" >> "$LOG_FILE"
