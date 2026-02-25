#!/bin/bash
# OpenClaw 配置文件强化备份脚本 - 保留10个版本
# 每次修改前自动调用，确保有充足回滚点

CONFIG_FILE="/Users/pojohns/.openclaw/openclaw.json"
BACKUP_DIR="/Users/pojohns/.openclaw/backups/config"
MAX_VERSIONS=10
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# 确保备份目录存在
mkdir -p "$BACKUP_DIR"

# 如果配置文件不存在，退出
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 配置文件不存在: $CONFIG_FILE"
    exit 1
fi

# 计算当前备份数量
CURRENT_COUNT=$(ls -1 "$BACKUP_DIR"/openclaw_*.json 2>/dev/null | wc -l)

# 如果已满10个，删除最旧的
if [ "$CURRENT_COUNT" -ge "$MAX_VERSIONS" ]; then
    ls -1t "$BACKUP_DIR"/openclaw_*.json | tail -n +$((MAX_VERSIONS + 1)) | xargs -I {} rm -f {}
    echo "🧹 已清理旧备份，保留最新 $MAX_VERSIONS 个版本"
fi

# 创建新备份
BACKUP_FILE="$BACKUP_DIR/openclaw_$TIMESTAMP.json"
cp "$CONFIG_FILE" "$BACKUP_FILE"

# 验证备份
if [ -f "$BACKUP_FILE" ]; then
    FILE_SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    echo "✅ 备份成功: openclaw_$TIMESTAMP.json ($FILE_SIZE 字节)"
    echo "📦 当前备份数量: $(ls -1 "$BACKUP_DIR"/openclaw_*.json 2>/dev/null | wc -l) / $MAX_VERSIONS"
else
    echo "❌ 备份失败"
    exit 1
fi

# 同时创建 Git 提交（双重保险）
cd /Users/pojohns/.openclaw/workspace 2>/dev/null || true
if [ -d ".git" ]; then
    cp "$CONFIG_FILE" workspace/config/openclaw_backup_$TIMESTAMP.json 2>/dev/null || true
fi
