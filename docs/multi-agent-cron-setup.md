# 多助手定时任务配置示例

## 助手1: 公众号助手 - 每天早上生成选题
openclaw cron add \
  --name "公众号助手-每日选题" \
  --schedule "0 10 * * *" \
  --session isolated \
  --agent content \
  --task "根据最近热点和阿慶经历，生成3个公众号选题建议"

## 助手2: 开发助手 - 每天检查项目进度  
openclaw cron add \
  --name "开发助手-进度检查" \
  --schedule "0 11 * * *" \
  --session isolated \
  --agent dev \
  --task "检查所有项目代码，更新进度到飞书表格"

## 助手3: 始运工作助手 - 每天下班回顾
openclaw cron add \
  --name "始运助手-下班回顾" \
  --schedule "0 18 * * *" \
  --session isolated \
  --agent work \
  --task "分析今天工作数据，生成下班报告"

## 助手4: 其他助手 - 每周信息汇总
openclaw cron add \
  --name "其他助手-周报" \
  --schedule "0 9 * * 1" \
  --session isolated \
  --agent general \
  --task "汇总本周待办、逾期任务、重要提醒"

## 助手5: 主助手协调 - 每天上午汇总
openclaw cron add \
  --name "主助手-晨会" \
  --schedule "0 8 * * *" \
  --session isolated \
  --agent main \
  --task "汇总所有助手报告，生成今日行动清单"
