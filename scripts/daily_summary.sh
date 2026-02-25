#!/bin/bash
# 综合数据读取脚本
# 读取：日历、备忘录、提醒事项、手记

echo "========================================"
echo "📊 每日数据汇总 | $(date '+%Y-%m-%d %H:%M')"
echo "========================================"
echo ""

# 1. 读取日历
echo "📅 【今日日历】"
echo "----------------------------------------"
osascript -e '
tell application "Calendar"
    set today to current date
    set startOfDay to today - (time of today)
    set endOfDay to startOfDay + 1 * days
    set eventList to {}
    repeat with cal in calendars
        repeat with evt in (every event of cal whose start date ≥ startOfDay and start date < endOfDay)
            set eventTime to time string of (start date of evt)
            set eventTitle to summary of evt
            set end of eventList to ("• " & eventTime & " | " & eventTitle)
        end repeat
    end repeat
    if length of eventList = 0 then
        return "今天无日程安排"
    else
        return eventList as string
    end if
end tell' 2>/dev/null
echo ""

# 2. 读取提醒事项
echo ""
echo "⏰ 【今日提醒】"
echo "----------------------------------------"
# 已完成
completed=$(remindctl completed --json 2>/dev/null | jq -r '.[] | "✅ " + .title' 2>/dev/null | head -10)
if [ ! -z "$completed" ]; then
    echo "已完成："
    echo "$completed"
fi

# 待完成
today_tasks=$(remindctl today --json 2>/dev/null | jq -r '.[] | select(.isCompleted == false) | "⏳ " + .title' 2>/dev/null | head -10)
if [ ! -z "$today_tasks" ]; then
    echo ""
    echo "待完成："
    echo "$today_tasks"
fi

# 3. 读取备忘录
echo ""
echo "📝 【最近备忘录】"
echo "----------------------------------------"
memo notes 2>/dev/null | head -5

# 4. 读取手记（Journal）
echo ""
echo "📔 【今日手记】"
echo "----------------------------------------"

JOURNAL_DIR="$HOME/.openclaw/workspace/journal/Apple手记条目/Entries"
TODAY=$(date '+%Y-%m-%d')

if [ -d "$JOURNAL_DIR" ]; then
    # 查找今天的条目
    today_entries=$(find "$JOURNAL_DIR" -name "${TODAY}*.html" 2>/dev/null)
    
    if [ ! -z "$today_entries" ]; then
        for entry in $today_entries; do
            # 提取标题（从文件名）
            filename=$(basename "$entry" .html)
            # 移除日期前缀
            title=$(echo "$filename" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_//g' | sed 's/_/ /g')
            echo "• $title"
        done
    else
        # 显示最近3条
        echo "今天无新手记，显示最近3条："
        ls -t "$JOURNAL_DIR"/*.html 2>/dev/null | head -3 | while read entry; do
            filename=$(basename "$entry" .html)
            title=$(echo "$filename" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}_//g' | sed 's/_/ /g')
            echo "• $title"
        done
    fi
else
    echo "手记目录不存在"
fi

echo ""
echo "========================================"
echo "📊 数据读取完成"
echo "========================================"
