#!/bin/bash
# Telegram Bridge - 虾哥处理器
# 由 OpenClaw 定时任务调用，处理需要虾哥智能回复的消息

BRIDGE_DIR="/tmp/telegram_bridge"
QUEUE_DIR="$BRIDGE_DIR/queue"
REPLY_DIR="$BRIDGE_DIR/replies"
LOG_FILE="/Users/pojohns/.openclaw/workspace/logs/telegram_bridge_ai.log"

mkdir -p "$QUEUE_DIR" "$REPLY_DIR" "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 处理队列中的消息
for queue_file in "$QUEUE_DIR"/*.txt; do
    [ -f "$queue_file" ] || continue
    
    log "Processing AI request: $queue_file"
    
    # 解析队列文件内容: QUEUE:TEXT:CHAT_ID:USERNAME
    CONTENT=$(cat "$queue_file")
    TEXT=$(echo "$CONTENT" | cut -d':' -f2)
    CHAT_ID=$(echo "$CONTENT" | cut -d':' -f3)
    USERNAME=$(echo "$CONTENT" | cut -d':' -f4)
    MSG_ID=$(basename "$queue_file" .txt)
    
    # 保存为待处理格式，虾哥会读取这个
    REQUEST_FILE="$BRIDGE_DIR/request_${MSG_ID}.json"
    cat > "$REQUEST_FILE" << EOF
{
  "message_id": "$MSG_ID",
  "chat_id": "$CHAT_ID",
  "username": "$USERNAME",
  "text": "$TEXT"
}
EOF
    
    # 删除队列文件
    rm -f "$queue_file"
    
    log "Request saved to $REQUEST_FILE for AI processing"
done

log "AI processor completed"
exit 0
