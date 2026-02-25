# Telegram API 代理 - Cloudflare Worker 代码

```javascript
// worker.js - 部署到 Cloudflare Workers
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 构建 Telegram API URL
    const telegramUrl = `https://api.telegram.org${url.pathname}${url.search}`;
    
    // 转发请求
    const response = await fetch(telegramUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });
    
    // 返回响应
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  }
};
```

## 部署步骤：
1. 注册 Cloudflare 账号
2. 创建新的 Worker
3. 粘贴上述代码
4. 获得域名如 `https://tg-proxy.yourname.workers.dev`
5. 修改 bridge 脚本使用代理域名：
   ```bash
   API_BASE="https://tg-proxy.yourname.workers.dev/bot${BOT_TOKEN}"
   ```

## 或者使用 Vercel Edge Function：

```javascript
// api/telegram.js
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/telegram', '');
  const telegramUrl = `https://api.telegram.org${path}${url.search}`;
  
  const response = await fetch(telegramUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  
  return new Response(response.body, {
    status: response.status,
    headers: response.headers
  });
}
```
