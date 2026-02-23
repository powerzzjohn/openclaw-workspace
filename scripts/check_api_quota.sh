#!/bin/bash
# API 限额检查脚本
# 检查 Kimi API 是否还有可用额度

WORKSPACE="/Users/pojohns/.openclaw/workspace"
ALERT_DIR="$WORKSPACE/alerts"
LOCK_FILE="/tmp/api_quota_check.lock"

# 防止并发执行
if [ -f "$LOCK_FILE" ]; then
    pid=$(cat "$LOCK_FILE" 2>/dev/null)
    if ps -p "$pid" > /dev/null 2>&1; then
        echo " Another check is running"
        exit 1
    fi
fi
echo $$ > "$LOCK_FILE"

# 检查是否有 API 限额警报
QUOTA_ALERT_FILE="$ALERT_DIR/kimi_quota_exceeded.txt"
QUOTA_CHECK_FILE="$WORKSPACE/.kimi_quota_status"

# 尝试调用 API 检查限额
check_api_quota() {
    # 这里可以通过调用一个轻量级 API 来检查限额
    # 由于实际检查需要 API key，我们通过检查最近的错误日志来判断
    local recent_errors=$(find ~/.openclaw/agents/main/sessions -name "*.jsonl" -mtime -1 -exec grep -l "403.*quota" {} \; 2>/dev/null | wc -l)
    
    if [ "$recent_errors" -gt 5 ]; then
        echo "exceeded"
        return 1
    fi
    
    echo "ok"
    return 0
}

# 主检查逻辑
status=$(check_api_quota)

if [ "$status" = "exceeded" ]; then
    echo "API 限额已用完"
    mkdir -p "$ALERT_DIR"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Kimi API quota exceeded" >> "$QUOTA_ALERT_FILE"
    echo "exceeded"
    rm -f "$LOCK_FILE"
    exit 1
else
    # 如果之前有限额警报，现在清除了
    if [ -f "$QUOTA_ALERT_FILE" ]; then
        rm -f "$QUOTA_ALERT_FILE"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Kimi API quota restored" >> "$QUOTA_CHECK_FILE"
    fi
    echo "ok"
    rm -f "$LOCK_FILE"
    exit 0
fi
