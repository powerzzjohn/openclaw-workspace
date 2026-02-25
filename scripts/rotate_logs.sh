#!/bin/bash
# 日志轮转脚本
# 当日志超过 10MB 时进行轮转压缩

LOG_DIR="/tmp/openclaw"
ARCHIVE_DIR="$HOME/.openclaw/workspace/logs/archive"
MAX_SIZE=$((10 * 1024 * 1024))  # 10MB

mkdir -p "$ARCHIVE_DIR"

for log_file in "$LOG_DIR"/openclaw-*.log; do
    [ -f "$log_file" ] || continue
    
    file_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null)
    
    if [ "$file_size" -gt "$MAX_SIZE" ]; then
        filename=$(basename "$log_file")
        date_suffix=$(date '+%Y%m%d_%H%M%S')
        archive_name="${filename%.log}_${date_suffix}.gz"
        
        # 复制并压缩
        gzip -c "$log_file" > "$ARCHIVE_DIR/$archive_name"
        
        # 清空原文件（不删除以保持文件句柄）
        : > "$log_file"
        
        echo "[$(date)] 日志已轮转: $filename -> $archive_name ($(numfmt --to=iec $file_size))"
    fi
done

# 清理超过90天的归档日志
find "$ARCHIVE_DIR" -name "*.gz" -mtime +90 -type f -delete 2>/dev/null
