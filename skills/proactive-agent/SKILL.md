# ProactiveAgent

让 AI 从被动响应变成主动响应的 Python 库。

## 功能

- **智能决策** - 多因素决策引擎决定何时响应
- **动态休眠** - 智能计算响应间隔时间
- **上下文感知** - 分析对话流程、用户参与度
- **完全可定制** - 自定义决策引擎和休眠计算器

## 安装

```bash
# 已在虚拟环境中安装
source ~/.agent-reach-venv/bin/activate
pip install proactiveagent
```

## 快速开始

```python
from proactiveagent import ProactiveAgent, OpenAIProvider
import time

# 创建主动代理
agent = ProactiveAgent(
    provider=OpenAIProvider(model="gpt-4"),
    system_prompt="你是一个主动助手的AI",
    decision_config={
        'wake_up_pattern': "像正常聊天一样的节奏",
    }
)

# 添加响应回调
def on_response(response: str):
    print(f"🤖 AI: {response}")

agent.add_callback(on_response)
agent.start()

# 发送消息
agent.send_message("你好")
time.sleep(3)

agent.stop()
```

## 决策引擎

### 内置引擎
- `AIBasedDecisionEngine` - AI 智能决策（默认）
- `SimpleDecisionEngine` - 基于时间的简单决策
- `PatternBasedDecisionEngine` - 基于关键词模式

### 自定义引擎
```python
from proactiveagent import DecisionEngine

class MyDecisionEngine(DecisionEngine):
    async def should_respond(self, messages, last_time, context, config, triggered_by_user):
        # 自定义决策逻辑
        return should_respond, "reasoning"

agent = ProactiveAgent(provider=provider, decision_engine=MyDecisionEngine())
```

## 休眠计算器

### 内置计算器
- `AIBasedSleepCalculator` - AI 解释自然语言模式（默认）
- `StaticSleepCalculator` - 固定间隔
- `PatternBasedSleepCalculator` - 关键词匹配
- `FunctionBasedSleepCalculator` - 自定义函数

### 自定义计算器
```python
from proactiveagent import SleepTimeCalculator

class SmartCalculator(SleepTimeCalculator):
    async def calculate_sleep_time(self, config, context):
        engagement = context.get('user_engagement', 'medium')
        if engagement == 'high':
            return 30, "High engagement"
        return 120, "Standard interval"

agent.scheduler.set_sleep_time_calculator(SmartCalculator())
```

## 回调系统

```python
# 响应回调
def on_response(response: str):
    print(f"Response: {response}")

# 决策回调
def on_decision(should_respond: bool, reasoning: str):
    print(f"Decision: {should_respond} - {reasoning}")

# 休眠时间回调
def on_sleep_time(sleep_time: int, reasoning: str):
    print(f"Sleeping {sleep_time}s - {reasoning}")

agent.add_callback(on_response)
agent.add_decision_callback(on_decision)
agent.add_sleep_time_callback(on_sleep_time)
```

## 配置参数

```python
agent = ProactiveAgent(
    provider=provider,
    decision_config={
        'min_response_interval': 30,    # 最小响应间隔（秒）
        'max_response_interval': 600,   # 最大响应间隔（秒）
        'probability_weight': 0.3,      # AI 决策权重
        'wake_up_pattern': "2-3分钟检查一次",
        'min_sleep_time': 30,
        'max_sleep_time': 600,
    }
)
```

## 与 OpenClaw 集成

可以在 OpenClaw 的 cron 任务中使用 ProactiveAgent 创建主动推送的代理。

示例场景：
- 主动监控股票价格并在达到阈值时提醒
- 主动检查邮件并在重要邮件到达时通知
- 主动监控系统状态并报告异常

## 参考

- 官方仓库：https://github.com/leomariga/ProactiveAgent
- PyPI：https://pypi.org/project/proactiveagent/
- 文档：https://leomariga.github.io/ProactiveAgent/
