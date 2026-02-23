#!/usr/bin/env python3
"""飞书消息发送脚本"""
import json
import sys

# 安装 lark_oapi
import subprocess
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "lark-oapi"])

import lark_oapi as lark
from lark_oapi.api.im.v1 import *

# 配置
APP_ID = "cli_a9f1bcf9a7f85bdb"
APP_SECRET = "VDdADxZinYngIRcwdEEOTedniTtNpbzj"

def main():
    # 创建 client
    client = lark.Client.builder() \
        .app_id(APP_ID) \
        .app_secret(APP_SECRET) \
        .log_level(lark.LogLevel.INFO) \
        .build()
    
    # 先搜索群聊
    request = SearchChatRequest.builder() \
        .user_id_type("open_id") \
        .page_size(20) \
        .build()
    
    response = client.im.v1.chat.search(request)
    
    if response.success():
        chats = response.data.items if response.data else []
        print(f"找到 {len(chats)} 个群聊/会话:")
        for chat in chats:
            print(f"  - {chat.name} (ID: {chat.chat_id})")
    else:
        print(f"搜索失败: {response.msg}")
        print(f"错误码: {response.code}")

if __name__ == "__main__":
    main()
