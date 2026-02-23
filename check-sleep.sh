#!/bin/bash
# 睡觉提醒检查脚本

STATE_FILE="$HOME/.openclaw/workspace/memory/sleep-state.txt"
QUOTES_FILE="$HOME/.openclaw/workspace/memory/渔樵问对语录.md"

# 读取当前状态
if [ -f "$STATE_FILE" ]; then
  LAST_DATE=$(cat "$STATE_FILE" | grep "date:" | cut -d: -f2 | tr -d ' ')
  LAST_STATUS=$(cat "$STATE_FILE" | grep "status:" | cut -d: -f2 | tr -d ' ')
else
  LAST_DATE=""
  LAST_STATUS="pending"
fi

TODAY=$(date +%Y-%m-%d)

# 如果日期变了，重置状态
if [ "$LAST_DATE" != "$TODAY" ]; then
  echo "date: $TODAY" > "$STATE_FILE"
  echo "status: pending" >> "$STATE_FILE"
  LAST_STATUS="pending"
fi

# 如果还没说晚安，发送语录
if [ "$LAST_STATUS" = "pending" ]; then
  # 随机选择一句语录
  QUOTE=$(grep "^\d\+\." "$QUOTES_FILE" | shuf -n 1)
  echo "🌙 道友还未安寝，送上一句《渔樵问对》："
  echo ""
  echo "$QUOTE"
  echo ""
  echo "回复「晚安虾哥」以停诵。"
fi
