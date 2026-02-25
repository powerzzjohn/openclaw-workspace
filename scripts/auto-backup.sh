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
git commit -m "auto: $(date '+%Y-%m-%d %H:%M') 自动备份" || {
    echo "$(date): 提交失败或无变更" >> "$LOG_FILE"
    exit 0
}

# 推送（带重试）
HOUR=$(date '+%H')
if [ "$HOUR" -eq "00" ]; then
    for i in 1 2 3; do
        if git push origin main 2>> "$LOG_FILE"; then
            echo "$(date): 已推送到 GitHub" >> "$LOG_FILE"
            break
        else
            echo "$(date): 推送失败，尝试 $i/3..." >> "$LOG_FILE"
            sleep 10
        fi
    done
    
    # 记录推送失败
    if [ $i -eq 3 ]; then
        echo "$(date): 推送最终失败，请检查网络" >> "$LOG_FILE"
    fi
else
    echo "$(date): 已本地提交，等待 00:00 推送" >> "$LOG_FILE"
fi
