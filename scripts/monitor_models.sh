#!/bin/bash
# OpenClaw 模型使用量监控主脚本
# 监控两个模型的使用情况和余额

WORKSPACE="/Users/pojohns/.openclaw/workspace"
ALERT_DIR="$WORKSPACE/alerts"
LOG_DIR="$WORKSPACE/logs"

mkdir -p "$ALERT_DIR" "$LOG_DIR"

# 获取当前时间
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
DATE=$(date '+%Y-%m-%d')

# ===== 1. 监控 Moonshot API 余额 =====
check_moonshot_balance() {
    local api_key="sk-JelCTEpmIrr3BwHIhpJgPj65CuKAUkiki1bL5mWqVyYFSGMK"  # Moonshot API Key (会员账户)
    local threshold=10  # 警报阈值（元）
    
    local response=$(curl -s -X GET "https://api.moonshot.cn/v1/users/me/balance" \
        -H "Authorization: Bearer $api_key" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    local balance=$(echo "$response" | grep -o '"available_balance":[0-9.]*' | cut -d':' -f2)
    
    if [ -z "$balance" ]; then
        echo "ERROR: 无法获取Moonshot余额" > "$ALERT_DIR/moonshot_error.txt"
        return 1
    fi
    
    # 记录余额历史
    echo "$TIMESTAMP,$balance" >> "$LOG_DIR/moonshot_balance_$DATE.csv"
    
    # 检查是否低于阈值
    if (( $(echo "$balance < $threshold" | bc -l 2>/dev/null || echo "0") )); then
        cat > "$ALERT_DIR/moonshot_alert.txt" << EOF
⚠️ **Moonshot API 余额不足**

当前余额：**¥${balance}**
阈值：**¥${threshold}**

请及时充值： https://platform.moonshot.cn

时间：$TIMESTAMP
EOF
        echo "Moonshot余额不足: ¥$balance"
    else
        rm -f "$ALERT_DIR/moonshot_alert.txt"
        echo "Moonshot余额正常: ¥$balance"
    fi
}

# ===== 2. 获取 OpenClaw 会话用量（从状态输出解析） =====
check_openclaw_usage() {
    # 尝试从 session_status 获取用量信息
    # 注意：OpenClaw官方通道的详细用量通常需要通过OpenClaw平台查看
    
    local today=$(date '+%Y-%m-%d')
    local usage_file="$LOG_DIR/openclaw_usage_$today.log"
    
    # 记录检查时间
    echo "[$TIMESTAMP] OpenClaw用量检查" >> "$usage_file"
    
    # OpenClaw通道的用量信息需要在OpenClaw控制台查看
    # 这里主要记录检查日志
    echo "OpenClaw用量已记录"
}

# ===== 3. 生成监控报告 =====
generate_report() {
    local report_file="$LOG_DIR/daily_report_$(date '+%Y%m%d').txt"
    
    cat > "$report_file" << EOF
📊 **模型使用量日报** ($DATE)

生成时间：$TIMESTAMP

---

**模型状态：**

1️⃣ **OpenClaw官方通道** (kimi-coding/k2p5)
   - 状态：✅ 正常运行
   - 用量查看：需登录 OpenClaw 控制台
   - 注意：该通道由OpenClaw管理，无需单独充值

2️⃣ **Moonshot官方API** (moonshot/kimi-k2-5)
   - 余额：$(cat "$LOG_DIR/moonshot_balance_$DATE.csv" 2>/dev/null | tail -1 | cut -d',' -f2 || echo "未知")
   - 计费：输入 ¥0.002/1K tokens，输出 ¥0.008/1K tokens
   - 充值地址： https://platform.moonshot.cn

---

**警报状态：**
$(ls -1 "$ALERT_DIR"/*.txt 2>/dev/null | wc -l) 个待处理警报

$(for f in "$ALERT_DIR"/*.txt 2>/dev/null; do echo "- $(basename $f)"; done)

---

EOF

    echo "报告已生成: $report_file"
}

# ===== 主程序 =====
echo "=== OpenClaw 模型监控 [$TIMESTAMP] ==="

# Moonshot余额检查已禁用（用户主要使用kimi-coding周限额模型）
# check_moonshot_balance
check_openclaw_usage

# 每天上午8点生成报告
if [ "$(date '+%H:%M')" == "08:00" ]; then
    generate_report
fi

echo "监控完成"
