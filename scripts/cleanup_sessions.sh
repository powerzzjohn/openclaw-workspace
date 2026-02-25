#!/bin/bash
# 会话存储清理脚本
# 保留最近30天会话，删除旧文件

SESSION_DIR="$HOME/.openclaw/agents/main/sessions"
LOG_FILE="$HOME/.openclaw/workspace/logs/session_cleanup.log"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 清理超过30天的 .jsonl 文件
find "$SESSION_DIR" -name "*.jsonl" -mtime +30 -type f -print -delete 2>/dev/null | while read -r file; do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] 删除旧会话: $file" >> "$LOG_FILE"
done

# 清理超过7天的 .lock 文件（防止锁残留）
find "$SESSION_DIR" -name "*.lock" -mtime +7 -type f -delete 2>/dev/null

# 统计清理后大小
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 会话存储大小: $(du -sh "$SESSION_DIR" 2>/dev/null | cut -f1)" >> "$LOG_FILE"
