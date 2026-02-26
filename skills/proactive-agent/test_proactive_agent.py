#!/usr/bin/env python3
"""
ProactiveAgent 测试脚本
展示主动响应 AI 代理的核心功能
"""

import sys
import time
sys.path.insert(0, '/Users/pojohns/.agent-reach-venv/lib/python3.14/site-packages')

from proactiveagent import ProactiveAgent, StaticSleepCalculator

# 模拟 AI 提供商（用于测试，无需真实 API key）
class MockAIProvider:
    """模拟 AI 提供商，用于测试"""
    def __init__(self):
        self.model = "mock-model"
        self.responses = [
            "这是一个自动触发的响应！",
            "我在主动关注对话...",
            "根据上下文，我觉得需要回应一下。",
            "这是一个测试响应。",
        ]
        self.index = 0
    
    async def complete(self, messages, system_prompt=None):
        """模拟 AI 完成"""
        response = self.responses[self.index % len(self.responses)]
        self.index += 1
        return response

# 测试 1: 基础功能测试
def test_basic_functionality():
    print("=" * 60)
    print("🧪 测试 1: 基础功能")
    print("=" * 60)
    
    # 创建主动代理
    agent = ProactiveAgent(
        provider=MockAIProvider(),
        system_prompt="你是一个主动助手的AI",
        decision_config={
            'wake_up_pattern': "每2秒检查一次",
            'min_sleep_time': 2,
            'max_sleep_time': 5,
        }
    )
    
    # 使用固定休眠计算器（便于测试）
    agent.scheduler.set_sleep_time_calculator(StaticSleepCalculator(2))
    
    # 添加回调
    responses = []
    def on_response(response: str):
        responses.append(response)
        print(f"🤖 AI 响应: {response}")
    
    def on_decision(should_respond: bool, reasoning: str):
        status = "✅ 响应" if should_respond else "⏳ 等待"
        print(f"📊 决策: {status} - {reasoning}")
    
    def on_sleep_time(sleep_time: int, reasoning: str):
        print(f"😴 休眠: {sleep_time}秒 - {reasoning}")
    
    agent.add_callback(on_response)
    agent.add_decision_callback(on_decision)
    agent.add_sleep_time_callback(on_sleep_time)
    
    # 启动代理
    print("\n🚀 启动主动代理...")
    agent.start()
    
    # 模拟用户输入
    print("\n💬 模拟用户消息:")
    messages = [
        "你好",
        "今天天气怎么样",
        "帮我查个资料",
    ]
    
    for msg in messages:
        print(f"\n👤 用户: {msg}")
        agent.send_message(msg)
        time.sleep(3)  # 等待代理响应
    
    # 停止代理
    print("\n🛑 停止代理...")
    agent.stop()
    
    print(f"\n📈 统计: 收到 {len(responses)} 个响应")
    print("✅ 测试 1 完成\n")

# 测试 2: 上下文感知
def test_context_awareness():
    print("=" * 60)
    print("🧪 测试 2: 上下文感知")
    print("=" * 60)
    
    agent = ProactiveAgent(
        provider=MockAIProvider(),
        system_prompt="你是一个关注上下文的AI助手",
    )
    
    # 设置上下文
    agent.set_context('user_mood', 'curious')
    agent.set_context('topic_urgency', 'medium')
    
    print(f"\n📋 当前上下文:")
    print(f"   用户心情: {agent.get_context('user_mood')}")
    print(f"   话题紧急度: {agent.get_context('topic_urgency')}")
    
    # 更新上下文
    agent.set_context('user_mood', 'excited')
    print(f"\n🔄 更新上下文: 用户心情 → excited")
    
    print("✅ 测试 2 完成\n")

# 测试 3: 配置更新
def test_config_update():
    print("=" * 60)
    print("🧪 测试 3: 动态配置更新")
    print("=" * 60)
    
    agent = ProactiveAgent(
        provider=MockAIProvider(),
        decision_config={
            'min_response_interval': 30,
            'max_response_interval': 600,
        }
    )
    
    print(f"\n📋 初始配置:")
    print(f"   最小响应间隔: 30秒")
    print(f"   最大响应间隔: 600秒")
    
    # 更新配置
    agent.update_config({
        'min_response_interval': 5,
        'max_response_interval': 300,
    })
    
    print(f"\n🔄 更新配置:")
    print(f"   最小响应间隔: 5秒（更快响应）")
    print(f"   最大响应间隔: 300秒")
    
    print("✅ 测试 3 完成\n")

# 主函数
def main():
    print("\n" + "=" * 60)
    print("🦐 ProactiveAgent 功能测试")
    print("=" * 60 + "\n")
    
    try:
        test_basic_functionality()
        test_context_awareness()
        test_config_update()
        
        print("=" * 60)
        print("✅ 所有测试完成!")
        print("=" * 60)
        print("\n💡 实际使用需要:")
        print("   1. 真实的 AI Provider (OpenAI/Anthropic等)")
        print("   2. 对应的 API Key")
        print("   3. 根据场景调整决策配置")
        print("\n📚 更多信息: ~/.openclaw/workspace/skills/proactive-agent/SKILL.md")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
