#!/bin/bash
# 智能 Cron 任务包装器
# 在API限额不足时跳过任务执行

WORKSPACE="/Users/pojohns/.openclaw/workspace"
ALERT_DIR="$WORKSPACE/alerts"
LOG_FILE="$WORKSPACE/logs/cron_wrapper.log"

mkdir -p "$WORKSPACE/logs"

TASK_NAME="$1"
shift

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "=== 检查任务: $TASK_NAME ==="

# 检查最近24小时内是否有大量403错误
RECENT_403_COUNT=$(find ~/.openclaw/agents/main/sessions -name "*.jsonl" -mtime -1 -exec grep -l '"403".*quota\|permission_error' {} \; 2>/dev/null | wc -l)

if [ "$RECENT_403_COUNT" -gt 10 ]; then
    log "⚠️ 检测到 $RECENT_403_COUNT 个403错误，API 限额可能已用完"
    log "⏭️ 跳过任务: $TASK_NAME"
    
    # 记录跳过事件
    mkdir -p "$ALERT_DIR"
    echo "$(date '+%Y-%m-%d %H:%M:%S') - 任务 '$TASK_NAME' 因API限额不足被跳过 (最近24h有 $RECENT_403_COUNT 个403错误)" > "$ALERT_DIR/skipped_due_to_quota.txt"
    
    exit 0
fi

log "✅ API 状态正常，继续执行任务: $TASK_NAME"
exit 0
