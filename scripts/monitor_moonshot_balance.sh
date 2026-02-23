#!/bin/bash
# Moonshot API 余额监控脚本
# 当余额低于阈值时发送飞书提醒

# 配置
API_KEY="${MOONSHOT_API_KEY:-sk-...GYW52H}"  # 从环境变量或硬编码读取
BALANCE_THRESHOLD=10  # 余额阈值（元），低于此值发送警告
FEISHU_WEBHOOK_URL=""  # 可选：飞书机器人webhook

# 获取余额
get_balance() {
    local response=$(curl -s -X GET "https://api.moonshot.cn/v1/users/me/balance" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json")
    
    # 解析余额（单位：元）
    local balance=$(echo "$response" | grep -o '"available_balance":[0-9.]*' | cut -d':' -f2)
    
    if [ -z "$balance" ]; then
        echo "ERROR: 无法获取余额"
        echo "API响应: $response"
        return 1
    fi
    
    echo "$balance"
}

# 发送飞书提醒（通过虾哥）
send_alert() {
    local balance=$1
    local message="⚠️ **Moonshot API 余额不足**

当前余额：**¥${balance}**
阈值：**¥${BALANCE_THRESHOLD}**

请及时充值，避免影响使用。

时间：$(date '+%Y-%m-%d %H:%M:%S')"

    # 写入提醒文件，虾哥会通过heartbeat检查
    echo "$message" > ~/.openclaw/workspace/alerts/moonshot_balance_alert.txt
    
    echo "警报已记录"
}

# 主逻辑
main() {
    echo "$(date): 检查 Moonshot API 余额..."
    
    BALANCE=$(get_balance)
    
    if [ $? -ne 0 ]; then
        echo "$BALANCE"
        exit 1
    fi
    
    echo "当前余额: ¥$BALANCE"
    
    # 检查是否低于阈值
    if (( $(echo "$BALANCE < $BALANCE_THRESHOLD" | bc -l) )); then
        send_alert "$BALANCE"
    else
        # 清除之前的警报
        rm -f ~/.openclaw/workspace/alerts/moonshot_balance_alert.txt
    fi
    
    # 记录余额历史
    echo "$(date '+%Y-%m-%d %H:%M'),$BALANCE" >> ~/.openclaw/workspace/logs/moonshot_balance_history.csv
}

# 创建目录
mkdir -p ~/.openclaw/workspace/alerts ~/.openclaw/workspace/logs

# 运行
main
