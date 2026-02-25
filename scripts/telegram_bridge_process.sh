#!/bin/bash
# Telegram Bridge - 消息处理器
# 处理从 Telegram 收到的消息，调用虾哥回复，并将回复发送回去

BOT_TOKEN="8601999755:AAHnlEYNOk1L-grcetxmBz6Mja3uuLpUqgU"
API_BASE="https://api.telegram.org/bot${BOT_TOKEN}"
PROXY_URL="http://127.0.0.1:4780"
BRIDGE_DIR="/tmp/telegram_bridge"
LOG_FILE="/Users/pojohns/.openclaw/workspace/logs/telegram_bridge_process.log"

mkdir -p "$BRIDGE_DIR" "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 发送消息到 Telegram
send_telegram_message() {
    local chat_id=$1
    local text=$2
    
    # URL 编码文本
    text=$(echo "$text" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\n/\\n/g')
    
    RESPONSE=$(curl -s -m 30 -x "$PROXY_URL" -X POST "${API_BASE}/sendMessage" \
        -H "Content-Type: application/json" \
        -d "{\"chat_id\":\"$chat_id\",\"text\":\"$text\",\"parse_mode\":\"Markdown\"}" 2>/dev/null)
    
    if echo "$RESPONSE" | grep -q '"ok":true'; then
        log "Message sent successfully to $chat_id"
        return 0
    else
        log "ERROR: Failed to send message: $RESPONSE"
        return 1
    fi
}

# 处理待处理的消息
for msg_file in "$BRIDGE_DIR"/msg_*.json; do
    [ -f "$msg_file" ] || continue
    
    log "Processing $msg_file"
    
    # 读取消息
    CHAT_ID=$(grep -o '"chat_id":"[^"]*"' "$msg_file" | cut -d'"' -f4)
    USERNAME=$(grep -o '"username":"[^"]*"' "$msg_file" | cut -d'"' -f4)
    TEXT=$(grep -o '"text":"[^"]*"' "$msg_file" | cut -d'"' -f4)
    UPDATE_ID=$(grep -o '"update_id":[0-9]*' "$msg_file" | cut -d':' -f2)
    
    log "From: @$USERNAME, Chat: $CHAT_ID, Text: $TEXT"
    
    # 特殊命令处理
    case "$TEXT" in
        "/start")
            REPLY="🦐 虾哥已上线！\n\n你可以像和飞书一样跟我对话。\n\n可用命令：\n/ping - 测试连接\n/help - 帮助信息"
            ;;
        "/ping")
            REPLY="pong! 🦐"
            ;;
        "/help")
            REPLY="虾哥 Telegram 桥接版\n\n直接发消息即可对话。\n部分功能可能受限，主要功能正常使用。"
            ;;
        *)
            # 将消息保存到待处理队列，由虾哥处理
            # 这里我们创建一个标记文件，虾哥会读取并回复
            REPLY_FILE="$BRIDGE_DIR/reply_$UPDATE_ID.txt"
            echo "QUEUE:$TEXT:$CHAT_ID:$USERNAME" > "$BRIDGE_DIR/queue_$UPDATE_ID.txt"
            
            # 等待回复（最多5秒）
            for i in {1..50}; do
                if [ -f "$REPLY_FILE" ]; then
                    REPLY=$(cat "$REPLY_FILE")
                    rm -f "$REPLY_FILE"
                    break
                fi
                sleep 0.1
            done
            
            # 如果没有收到回复，发送默认消息
            if [ -z "$REPLY" ]; then
                REPLY="虾哥正在思考...请稍后使用 /status 查询，或通过飞书通道获取完整回复。"
            fi
            ;;
    esac
    
    # 发送回复
    send_telegram_message "$CHAT_ID" "$REPLY"
    
    # 清理消息文件
    rm -f "$msg_file"
done

log "Processing completed"
exit 0
