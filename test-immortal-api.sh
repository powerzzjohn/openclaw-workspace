#!/bin/bash
# 凡人修仙传 API 测试脚本

BASE_URL="https://backend-f3twt8wb5-pojohns-projects.vercel.app/api"

echo "🧪 开始测试凡人修仙传 API"
echo "=========================="
echo ""

# 1. 健康检查
echo "1️⃣ 测试健康检查 endpoint..."
curl -s -w "\nHTTP状态: %{http_code}\n" "${BASE_URL}/health" | head -20
echo ""

# 2. 测试注册 API (使用随机邮箱避免重复)
RANDOM_EMAIL="test$(date +%s)@example.com"
echo "2️⃣ 测试注册 API..."
echo "邮箱: ${RANDOM_EMAIL}"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${RANDOM_EMAIL}\",\"password\":\"test123456\",\"daoName\":\"测试道友$(date +%s)\"}" \
  -w "\nHTTP状态: %{http_code}\n" \
  "${BASE_URL}/auth/register" | head -30
echo ""

# 3. 测试八字计算 API (无需登录)
echo "3️⃣ 测试八字计算 API..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"birthYear":1990,"birthMonth":5,"birthDay":15,"birthHour":10}' \
  -w "\nHTTP状态: %{http_code}\n" \
  "${BASE_URL}/v1/bazi/compute" | head -50
echo ""

# 4. 测试天时 API
echo "4️⃣ 测试天时 API..."
curl -s -w "\nHTTP状态: %{http_code}\n" "${BASE_URL}/celestial/today" | head -30
echo ""

# 5. 测试箴言 API
echo "5️⃣ 测试箴言 API..."
curl -s -w "\nHTTP状态: %{http_code}\n" "${BASE_URL}/wisdom/daily" | head -30
echo ""

echo "=========================="
echo "✅ 测试完成"
