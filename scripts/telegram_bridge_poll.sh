#!/bin/bash
# Telegram-OpenClaw Bridge 脚本
# 轮询 Telegram Bot API，将消息转发给 OpenClaw 处理

# 配置
BOT_TOKEN="8601999755:AAHnlEYNOk1L-grcetxmBz6Mja3uuLpUqgU"
API_BASE="https://api.telegram.org/bot${BOT_TOKEN}"
PROXY_URL="http://127.0.0.1:4780"
OFFSET_FILE="/tmp/telegram_bridge_offset"
LOG_FILE="/Users/pojohns/.openclaw/workspace/logs/telegram_bridge.log"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 读取上次处理的 update_id
if [ -f "$OFFSET_FILE" ]; then
    OFFSET=$(cat "$OFFSET_FILE")
else
    OFFSET=0
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 获取更新
log "Polling Telegram API with offset: $OFFSET"

RESPONSE=$(curl -s -m 30 -x "$PROXY_URL" "${API_BASE}/getUpdates?offset=${OFFSET}&limit=10" 2>/dev/null)

if [ -z "$RESPONSE" ]; then
    log "ERROR: No response from Telegram API"
    exit 1
fi

# 检查是否有 ok 字段
OK=$(echo "$RESPONSE" | grep -o '"ok":true' || echo "")
if [ -z "$OK" ]; then
    log "ERROR: Telegram API returned error: $RESPONSE"
    exit 1
fi

# 处理消息
echo "$RESPONSE" | grep -o '"update_id":[0-9]*[^}]*' | while read -r update; do
    UPDATE_ID=$(echo "$update" | grep -o '"update_id":[0-9]*' | cut -d':' -f2)
    
    # 跳过已处理的消息
    if [ "$UPDATE_ID" -le "$OFFSET" ]; then
        continue
    fi
    
    # 更新 offset
    echo $((UPDATE_ID + 1)) > "$OFFSET_FILE"
    
    # 提取消息信息
    CHAT_ID=$(echo "$update" | grep -o '"chat":{[^}]*' | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    MESSAGE_TEXT=$(echo "$update" | grep -o '"text":"[^"]*' | cut -d'"' -f4)
    FROM_USERNAME=$(echo "$update" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$MESSAGE_TEXT" ]; then
        continue
    fi
    
    log "Received message from @${FROM_USERNAME} (chat_id: $CHAT_ID): $MESSAGE_TEXT"
    
    # 保存消息到临时文件，供 OpenClaw 读取
    TEMP_MSG_FILE="/tmp/telegram_msg_${UPDATE_ID}.json"
    cat > "$TEMP_MSG_FILE" << EOF
{
  "update_id": $UPDATE_ID,
  "chat_id": "$CHAT_ID",
  "username": "$FROM_USERNAME",
  "text": "$MESSAGE_TEXT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    log "Message saved to $TEMP_MSG_FILE"
done

log "Poll completed"
exit 0
