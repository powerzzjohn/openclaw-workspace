#!/bin/bash
# 财务简报生成脚本 - 从飞书Bitable读取数据
# 用于每日项目简报中的财务部分

APP_TOKEN="GjvKbAYJsaNEems3pMCcB6IUnnc"
TABLE_ID="tblcR0XvslGUmfxC"

# 获取当前年月
current_year=$(date +"%Y")
current_month=$(date +"%-m")
current_month_text="${current_year}-${current_month}月"

echo "📊 **财务简报** | ${current_month_text}"
echo ""
echo "💰 **本月收支概况**"

# 这里的数据需要通过API调用获取
# 当前脚本框架，实际数据由调用方传入

echo ""
echo "⚠️ **预算提醒**"
echo "• 建议：及时记录收入，避免超支误判"
echo "• 习惯养成：每日记账 > 月末补记"

echo ""
echo "📝 **记账小贴士**"
echo "• 收入：每月固定收入请及时记录"
echo "• 支出：实时记录更准确"
echo "• 分类：有助于分析消费习惯"
