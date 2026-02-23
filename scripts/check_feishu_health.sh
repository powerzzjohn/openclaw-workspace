#!/bin/bash
# 飞书通道健康检查脚本
# 用于 HEARTBEAT 自动检测和修复飞书连接

LOG_FILE="/tmp/openclaw/openclaw-$(date +%Y-%m-%d).log"
CHECK_WINDOW_MINUTES=30  # 检查最近30分钟的日志
ALERT_FILE="$HOME/.openclaw/workspace/alerts/feishu_connection_alert.txt"

# 检查日志文件是否存在
if [ ! -f "$LOG_FILE" ]; then
    echo "Log file not found: $LOG_FILE"
    exit 0
fi

# 获取最近30分钟的日志（按时间戳判断）
# 飞书错误关键字
FEISHU_ERRORS=(
    "getaddrinfo ENOTFOUND open.feishu.cn"
    "\\[ws\\].*reconnect"
    "feishu.*error"
    "AxiosError.*open.feishu.cn"
)

# 检查最近是否有飞书消息成功接收
# 如果最近30分钟内没有成功消息，且出现错误，说明连接可能断了
RECENT_SUCCESS=$(grep -E "feishu: dispatching to agent|feishu: added typing indicator" "$LOG_FILE" 2>/dev/null | tail -1)

# 检查最近是否有错误
RECENT_ERRORS=""
for pattern in "${FEISHU_ERRORS[@]}"; do
    ERRORS=$(grep -E "$pattern" "$LOG_FILE" 2>/dev/null | tail -5)
    if [ -n "$ERRORS" ]; then
        RECENT_ERRORS="$RECENT_ERRORS$ERRORS"
    fi
done

# 判断是否需要重启
# 如果有错误，且最近没有成功消息，则尝试重启
if [ -n "$RECENT_ERRORS" ] && [ -z "$RECENT_SUCCESS" ]; then
    echo "$(date): Feishu connection issues detected, attempting restart..."
    
    # 记录警报
    echo "$(date): Feishu connection unstable, auto-restarting gateway" > "$ALERT_FILE"
    
    # 重启网关
    openclaw gateway restart 2>&1
    
    echo "$(date): Gateway restarted"
    exit 1
fi

# 清理旧警报文件
if [ -f "$ALERT_FILE" ]; then
    rm "$ALERT_FILE"
fi

echo "$(date): Feishu connection OK"
exit 0
