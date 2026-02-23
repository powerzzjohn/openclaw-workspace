#!/bin/bash
# 月度财务简报生成脚本
# 读取飞书记账数据，生成简报发送到飞书

# 配置
APP_TOKEN="GjvKbAYJsaNEems3pMCcB6IUnnc"
TABLE_ID="tblcR0XvslGUmfxC"
FEISHU_USER="ou_af6154cf494e961b3199f31d3120188b"

# 获取当前月份
current_month=$(date +"%Y-%m")
current_month_text=$(date +"%Y-%m月")

echo "=== 月度财务简报生成 [$(date '+%Y-%m-%d %H:%M:%S')] ==="

# 获取最新月份数据
# 注意：这里需要通过API获取，实际运行时需要调用feishu_bitable_list_records

# 生成简报内容
report="📊 **月度财务简报** | ${current_month_text}

━━━━━━━━━━━━━━━━━━━━━

💰 **本月概况**
• 消费预算：¥XXX
• 总消费：¥XXX
• 剩余预算：¥XXX
• 总收入：¥XXX
• 结余：¥XXX

📈 **环比分析**
• 比上月：+XX% / -XX%

⚠️ **预算提醒**
• 剩余预算比例：XX%
• 状态：正常 / 即将超支 / 已超支

━━━━━━━━━━━━━━━━━━━━━

🦐 _虾哥自动生成_"

echo "$report"

# 发送到飞书（需要message工具支持）
# openclaw message send --channel feishu --to "$FEISHU_USER" --content "$report"

echo "简报生成完成"
