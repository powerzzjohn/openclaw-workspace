#!/usr/bin/env python3
"""
多 Agent 协作系统 - Multi-Agent Collaboration System (生产版本)
真正可执行的多代理协作框架

特性：
- 5个专业Agent各司其职
- Ultrawork模式：并行执行
- Ralph Loop：死磕到底（自动重试）
- 真正启动OpenClaw子代理会话
- 轮询检查会话状态
"""

import json
import time
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# Agent 配置
AGENTS = {
    "xiage": {
        "id": "main",
        "name": "虾哥",
        "role": "总指挥",
        "description": "战略规划、协调其他代理、关键决策",
        "model": "kimi-coding/k2p5",
        "priority": 1
    },
    "gongzhonghao": {
        "id": "gongzhonghao", 
        "name": "公众号助手",
        "role": "内容官",
        "description": "文章撰写、复盘分析",
        "model": "kimi-coding/k2p5",
        "priority": 2
    },
    "kaifa": {
        "id": "kaifa",
        "name": "开发助手", 
        "role": "技术官",
        "description": "代码开发、部署上线",
        "model": "kimi-coding/k2p5",
        "priority": 2
    },
    "shiyun": {
        "id": "shiyun",
        "name": "始运助手",
        "role": "分析师", 
        "description": "日历/备忘录/提醒分析",
        "model": "kimi-coding/k2p5",
        "priority": 3
    },
    "qita": {
        "id": "qita",
        "name": "实验员",
        "role": "通用",
        "description": "临时任务、快速原型",
        "model": "kimi-coding/k2p5",
        "priority": 3
    }
}

# 任务状态存储
TASK_STATE_FILE = Path("~/.openclaw/workspace/.multi_agent_tasks.json").expanduser()

def load_tasks():
    """加载任务状态"""
    if TASK_STATE_FILE.exists():
        with open(TASK_STATE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_tasks(tasks):
    """保存任务状态"""
    with open(TASK_STATE_FILE, 'w') as f:
        json.dump(tasks, f, indent=2, default=str)

def get_session_status(session_key):
    """获取会话状态"""
    try:
        result = subprocess.run(
            ["openclaw", "sessions", "status", session_key],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            # 解析状态输出
            output = result.stdout
            if "completed" in output.lower() or "done" in output.lower():
                return "completed"
            elif "running" in output.lower() or "active" in output.lower():
                return "running"
            elif "error" in output.lower() or "failed" in output.lower():
                return "error"
        return "unknown"
    except Exception as e:
        print(f"  ⚠️  检查状态失败: {e}")
        return "unknown"

def get_session_history(session_key, limit=10):
    """获取会话历史消息"""
    try:
        result = subprocess.run(
            ["openclaw", "sessions", "history", session_key, "--limit", str(limit)],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return result.stdout
        return None
    except Exception as e:
        return None

def spawn_agent(agent_id, task, timeout=300):
    """
    真正启动子代理执行任务
    返回: (session_key, success)
    """
    agent_info = AGENTS.get(agent_id, {})
    agent_name = agent_info.get('name', agent_id)
    
    print(f"  🚀 正在启动 {agent_name}...")
    
    try:
        # 使用 openclaw sessions spawn 启动子代理
        result = subprocess.run(
            ["openclaw", "sessions", "spawn",
             "--agent", agent_id,
             "--mode", "run",
             "--timeout", str(timeout),
             "--task", task],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if result.returncode != 0:
            print(f"  ❌ 启动失败: {result.stderr}")
            return None, False
        
        # 解析输出获取 session_key
        output = result.stdout + result.stderr
        session_key = None
        
        for line in output.split('\n'):
            if 'sessionKey' in line or 'session_key' in line or 'spawned' in line.lower():
                # 尝试提取 session key
                parts = line.replace(':', ' ').replace('"', ' ').split()
                for i, part in enumerate(parts):
                    if 'session' in part.lower() and i + 1 < len(parts):
                        session_key = parts[i + 1].strip()
                        break
        
        # 如果无法解析，使用默认格式
        if not session_key:
            session_key = f"agent:{agent_id}:{int(time.time())}"
        
        print(f"  ✅ {agent_name} 已启动")
        print(f"  📍 Session: {session_key[:50]}...")
        
        return session_key, True
        
    except subprocess.TimeoutExpired:
        print(f"  ⏱️ 启动超时")
        return None, False
    except Exception as e:
        print(f"  ❌ 启动异常: {e}")
        return None, False

def wait_for_completion(session_key, timeout=300, poll_interval=10):
    """
    轮询等待任务完成
    返回: (status, duration)
    """
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        status = get_session_status(session_key)
        
        if status == "completed":
            duration = int(time.time() - start_time)
            return "completed", duration
        elif status == "error":
            duration = int(time.time() - start_time)
            return "error", duration
        
        print(f"  ⏳ 等待中... ({int(time.time() - start_time)}s)")
        time.sleep(poll_interval)
    
    return "timeout", int(time.time() - start_time)

# ==================== Ultrawork 模式 ====================

def ultrawork(task_description, agent_roles=None, parallel=True, wait=True):
    """
    Ultrawork 模式：一个词激活并行执行
    
    示例:
    ultrawork("部署凡人修仙并写公众号文章", ["kaifa", "gongzhonghao"])
    """
    print("=" * 60)
    print("⚡ Ultrawork 模式 - 并行执行")
    print("=" * 60)
    print(f"📝 任务: {task_description}")
    print(f"🔄 模式: {'并行' if parallel else '串行'}")
    print()
    
    # 根据角色选择代理
    if agent_roles is None:
        agent_roles = list(AGENTS.keys())
    
    selected_agents = {k: AGENTS[k] for k in agent_roles if k in AGENTS}
    
    print(f"🤖 参与代理: {', '.join([a['name'] for a in selected_agents.values()])}")
    print()
    
    # 创建任务记录
    task_id = f"ultrawork_{int(time.time())}"
    tasks = load_tasks()
    tasks[task_id] = {
        "type": "ultrawork",
        "description": task_description,
        "agents": agent_roles,
        "parallel": parallel,
        "started_at": datetime.now().isoformat(),
        "status": "running",
        "subtasks": {}
    }
    save_tasks(tasks)
    
    # 启动所有代理
    active_sessions = {}
    
    for agent_key, agent_info in selected_agents.items():
        subtask = f"【{agent_info['role']} - {agent_info['name']}】\n\n任务: {task_description}\n\n请独立完成你的职责范围内的工作。完成后报告：\n1. 执行结果\n2. 完成状态 (成功/失败)\n3. 关键输出或交付物"
        
        print(f"\n👉 启动 [{agent_info['role']}] {agent_info['name']}")
        session, success = spawn_agent(agent_info['id'], subtask, timeout=600)
        
        if success:
            active_sessions[agent_key] = {
                "session": session,
                "agent_name": agent_info['name'],
                "status": "running"
            }
            tasks[task_id]["subtasks"][agent_key] = {
                "session": session,
                "status": "running",
                "started_at": datetime.now().isoformat()
            }
        else:
            tasks[task_id]["subtasks"][agent_key] = {
                "status": "failed",
                "error": "Failed to spawn"
            }
        
        save_tasks(tasks)
        
        if not parallel:
            # 串行模式：等待当前代理完成
            if session:
                print(f"  ⏳ 等待 {agent_info['name']} 完成...")
                status, duration = wait_for_completion(session, timeout=600)
                print(f"  {'✅' if status == 'completed' else '❌'} {agent_info['name']} {status} ({duration}s)")
                
                active_sessions[agent_key]["status"] = status
                tasks[task_id]["subtasks"][agent_key]["status"] = status
                tasks[task_id]["subtasks"][agent_key]["completed_at"] = datetime.now().isoformat()
                save_tasks(tasks)
    
    # 并行模式：等待所有代理完成
    if parallel and wait and active_sessions:
        print(f"\n⏳ 等待所有代理完成...")
        print("-" * 40)
        
        for agent_key, info in active_sessions.items():
            if info["status"] == "running":
                print(f"\n📍 检查 {info['agent_name']}...")
                status, duration = wait_for_completion(info["session"], timeout=600)
                print(f"  {'✅' if status == 'completed' else '❌'} {status} ({duration}s)")
                
                active_sessions[agent_key]["status"] = status
                tasks[task_id]["subtasks"][agent_key]["status"] = status
                tasks[task_id]["subtasks"][agent_key]["completed_at"] = datetime.now().isoformat()
                save_tasks(tasks)
    
    # 更新任务状态
    all_completed = all(
        s.get("status") in ["completed", "error", "failed"] 
        for s in tasks[task_id]["subtasks"].values()
    )
    tasks[task_id]["status"] = "completed" if all_completed else "partial"
    tasks[task_id]["completed_at"] = datetime.now().isoformat()
    save_tasks(tasks)
    
    print()
    print("=" * 60)
    print(f"✅ Ultrawork 任务完成: {task_id}")
    print("=" * 60)
    
    return task_id

# ==================== Ralph Loop 模式 ====================

def ralph_loop(task_description, agent_role, max_retries=5, timeout_per_attempt=600):
    """
    Ralph Loop 模式：任务没完成就不停，死磕到底
    
    示例:
    ralph_loop("修复凡人修仙登录bug", "kaifa", max_retries=5)
    """
    if agent_role not in AGENTS:
        print(f"❌ 未知代理: {agent_role}")
        return None
    
    agent_info = AGENTS[agent_role]
    
    print("=" * 60)
    print("🎯 Ralph Loop 模式 - 死磕到底")
    print("=" * 60)
    print(f"📝 任务: {task_description}")
    print(f"🤖 代理: {agent_info['name']} ({agent_info['role']})")
    print(f"🔁 最大重试: {max_retries}")
    print()
    
    task_id = f"ralph_{int(time.time())}"
    tasks = load_tasks()
    tasks[task_id] = {
        "type": "ralph_loop",
        "description": task_description,
        "agent": agent_role,
        "max_retries": max_retries,
        "started_at": datetime.now().isoformat(),
        "status": "running",
        "attempts": []
    }
    save_tasks(tasks)
    
    for attempt in range(1, max_retries + 1):
        print(f"\n🔄 第 {attempt}/{max_retries} 次尝试")
        print("-" * 40)
        
        # 构建带检查点的任务
        checkpoint_task = f"""【Ralph Loop - 尝试 {attempt}/{max_retries}】

任务: {task_description}

⚠️ 重要：完成后必须明确报告：
1. 执行结果摘要
2. 完成状态: ✅ 完成 / ❌ 未完成
3. 如果未完成，说明当前进展和遇到的障碍
4. 建议下一步行动

当前尝试 {attempt}/{max_retries}，如果未完成我会继续尝试。
"""
        
        session, success = spawn_agent(agent_info['id'], checkpoint_task, timeout=timeout_per_attempt)
        
        if not success:
            print(f"  ❌ 启动失败，准备重试...")
            tasks[task_id]["attempts"].append({
                "attempt": attempt,
                "status": "failed",
                "error": "Spawn failed"
            })
            save_tasks(tasks)
            time.sleep(5)
            continue
        
        # 等待任务完成
        print(f"  ⏳ 等待任务完成...")
        status, duration = wait_for_completion(session, timeout=timeout_per_attempt)
        
        attempt_record = {
            "attempt": attempt,
            "session": session,
            "status": status,
            "duration": duration,
            "completed_at": datetime.now().isoformat()
        }
        tasks[task_id]["attempts"].append(attempt_record)
        save_tasks(tasks)
        
        if status == "completed":
            print(f"  ✅ 任务完成！({duration}s)")
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["completed_at"] = datetime.now().isoformat()
            save_tasks(tasks)
            break
        else:
            print(f"  ⚠️  未完成 ({status})，准备重试...")
            time.sleep(10)
    else:
        print(f"\n❌ 达到最大重试次数 ({max_retries})，任务失败")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["completed_at"] = datetime.now().isoformat()
        save_tasks(tasks)
    
    print()
    print("=" * 60)
    print(f"🏁 Ralph Loop 结束: {task_id}")
    print(f"   状态: {tasks[task_id]['status']}")
    print(f"   尝试: {len(tasks[task_id]['attempts'])}/{max_retries}")
    print("=" * 60)
    
    return task_id

# ==================== 状态查询 ====================

def status(task_id=None):
    """查询任务状态"""
    tasks = load_tasks()
    
    if task_id:
        if task_id in tasks:
            task = tasks[task_id]
            print(f"\n📋 任务详情: {task_id}")
            print("=" * 60)
            print(f"类型: {task.get('type', 'unknown')}")
            print(f"状态: {task.get('status', 'unknown')}")
            print(f"开始: {task.get('started_at', 'N/A')}")
            print(f"描述: {task.get('description', 'N/A')}")
            
            if 'subtasks' in task:
                print(f"\n子任务:")
                for agent, info in task['subtasks'].items():
                    status_icon = "✅" if info.get('status') == 'completed' else "🟡" if info.get('status') == 'running' else "❌"
                    print(f"  {status_icon} {AGENTS.get(agent, {}).get('name', agent)}: {info.get('status', 'unknown')}")
            
            if 'attempts' in task:
                print(f"\n尝试记录:")
                for att in task['attempts']:
                    status_icon = "✅" if att.get('status') == 'completed' else "⚠️"
                    print(f"  {status_icon} 尝试 {att.get('attempt')}: {att.get('status')} ({att.get('duration', 'N/A')}s)")
        else:
            print(f"❌ 任务 {task_id} 不存在")
    else:
        print("\n📊 所有任务:")
        print("=" * 60)
        if not tasks:
            print("暂无任务")
        else:
            for tid, task in tasks.items():
                status_icon = "✅" if task.get('status') == 'completed' else "🟡" if task.get('status') == 'running' else "❌"
                print(f"  {status_icon} {tid}: {task.get('type', 'unknown')} | {task.get('status', 'unknown')}")

# ==================== CLI 入口 ====================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("🤖 多 Agent 协作系统 (生产版本)")
        print()
        print("用法:")
        print("  python multi_agent.py ultrawork '任务描述' [代理列表]")
        print("  python multi_agent.py ralph '任务描述' [代理]")
        print("  python multi_agent.py status [任务ID]")
        print()
        print("可用代理:")
        for k, v in AGENTS.items():
            print(f"  {k}: {v['name']} - {v['role']}")
        sys.exit(0)
    
    command = sys.argv[1]
    
    if command == "ultrawork":
        task = sys.argv[2] if len(sys.argv) > 2 else "默认任务"
        agents = sys.argv[3].split(",") if len(sys.argv) > 3 else None
        ultrawork(task, agents)
    
    elif command == "ralph":
        task = sys.argv[2] if len(sys.argv) > 2 else "默认任务"
        agent = sys.argv[3] if len(sys.argv) > 3 else "kaifa"
        ralph_loop(task, agent)
    
    elif command == "status":
        task_id = sys.argv[2] if len(sys.argv) > 2 else None
        status(task_id)
    
    else:
        print(f"❌ 未知命令: {command}")
