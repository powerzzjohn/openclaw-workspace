#!/bin/bash
# 自动备份脚本 - 每小时 commit，每天 push

WORKSPACE="/Users/pojohns/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/auto-backup.log"

# 创建日志目录
mkdir -p "$WORKSPACE/logs"

# 进入工作目录
cd "$WORKSPACE" || exit 1

# 检查是否有变更
if git diff --quiet && git diff --cached --quiet; then
    echo "$(date): 无变更，跳过备份" >> "$LOG_FILE"
    exit 0
fi

# 添加所有变更
git add -A

# 提交
git commit -m "auto: $(date '+%Y-%m-%d %H:%M') 自动备份"

# 每天 00:00 推送（检查小时是否为 00）
HOUR=$(date '+%H')
if [ "$HOUR" -eq "00" ]; then
    git push origin main
    echo "$(date): 已推送到 GitHub" >> "$LOG_FILE"
else
    echo "$(date): 已本地提交，等待 00:00 推送" >> "$LOG_FILE"
fi
