#!/bin/bash
# OpenClaw 配置文件恢复脚本
# 用法: ./config-restore.sh [版本号] 或 ./config-restore.sh list

BACKUP_DIR="/Users/pojohns/.openclaw/backups/config"
CONFIG_FILE="/Users/pojohns/.openclaw/openclaw.json"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 列出所有备份
list_backups() {
    echo -e "${YELLOW}📦 可用备份版本 (共 $(ls -1 "$BACKUP_DIR"/openclaw_*.json 2>/dev/null | wc -l) 个):${NC}"
    echo ""
    ls -1t "$BACKUP_DIR"/openclaw_*.json 2>/dev/null | while read file; do
        filename=$(basename "$file")
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        date_str=$(echo "$filename" | grep -o '[0-9]\{8\}_[0-9]\{6\}' | sed 's/_/ /' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\1-\2-\3/')
        echo "  $filename (${size} 字节) - $date_str"
    done
    echo ""
    echo "使用: $0 [版本号] 进行恢复"
    echo "例如: $0 20260226_013436"
}

# 恢复指定版本
restore_backup() {
    local version=$1
    local backup_file="$BACKUP_DIR/openclaw_$version.json"
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ 备份版本不存在: openclaw_$version.json${NC}"
        list_backups
        exit 1
    fi
    
    # 先备份当前配置（防止二次损坏）
    echo "📦 正在备份当前配置..."
    /Users/pojohns/.openclaw/workspace/scripts/config-backup.sh > /dev/null
    
    echo -e "${YELLOW}⚠️  即将恢复到版本: $version${NC}"
    echo "这将覆盖当前的 openclaw.json"
    read -p "确认恢复? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        cp "$backup_file" "$CONFIG_FILE"
        echo -e "${GREEN}✅ 已恢复到版本: $version${NC}"
        echo "请重启 OpenClaw 服务以应用更改:"
        echo "  openclaw gateway restart"
    else
        echo "❌ 已取消"
    fi
}

# 恢复到最新备份
restore_latest() {
    local latest=$(ls -1t "$BACKUP_DIR"/openclaw_*.json 2>/dev/null | head -1)
    if [ -z "$latest" ]; then
        echo -e "${RED}❌ 没有可用的备份${NC}"
        exit 1
    fi
    local version=$(basename "$latest" | sed 's/openclaw_//' | sed 's/.json$//')
    restore_backup "$version"
}

# 主逻辑
case "${1:-list}" in
    list|""|-l)
        list_backups
        ;;
    latest|-1)
        restore_latest
        ;;
    *)
        restore_backup "$1"
        ;;
esac
