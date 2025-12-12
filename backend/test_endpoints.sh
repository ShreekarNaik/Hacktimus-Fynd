#!/bin/bash

echo "========================================="
echo "Testing Backend Endpoints"
echo "========================================="
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Root endpoint
echo "1. Testing Root Endpoint"
echo "GET /"
curl -s $BASE_URL/
echo -e "\n"

# Test 2: Send OTP
echo "2. Testing Send OTP"
echo "POST /api/auth/send-otp"
SEND_OTP_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210"}')
echo $SEND_OTP_RESPONSE | jq .
echo ""

# Test 3: Register with OTP (will fail without valid OTP, but tests the endpoint)
echo "3. Testing Register with OTP (expected to fail without valid OTP)"
echo "POST /api/auth/register"
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "username": "testuser", "otp": "123456"}' | jq .
echo ""

# Test 4: Login with OTP (will fail without valid OTP)
echo "4. Testing Login with OTP (expected to fail without valid OTP)"
echo "POST /api/auth/login-otp"
curl -s -X POST $BASE_URL/api/auth/login-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+919876543210", "otp": "123456"}' | jq .
echo ""

# Test 5: Get User Profile (will fail without valid user)
echo "5. Testing Get User Profile"
echo "GET /api/user/profile?mobileNumber=+919876543210"
curl -s "$BASE_URL/api/user/profile?mobileNumber=%2B919876543210" | jq .
echo ""

# Test 6: Start Game (will fail without valid user)
echo "6. Testing Start Game"
echo "POST /api/games/start"
curl -s -X POST $BASE_URL/api/games/start \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "+919876543210", "gameName": "sandfall"}' | jq .
echo ""

# Test 7: Get Leaderboard
echo "7. Testing Get Leaderboard"
echo "GET /api/games/leaderboard/sandfall"
curl -s $BASE_URL/api/games/leaderboard/sandfall | jq .
echo ""

# Test 8: Abandoned Cart Webhook
echo "8. Testing Abandoned Cart Webhook"
echo "POST /abandoned_cart?user_id=+919876543210"
curl -s -X POST "$BASE_URL/abandoned_cart?user_id=%2B919876543210" \
  -H "Content-Type: application/json" \
  -d '{"cart_json_data": {"id": "cart123", "items": [{"name": "Product 1"}], "breakup_values": {"raw": {"total": 1000}}}}' | jq .
echo ""

echo "========================================="
echo "All Tests Completed"
echo "========================================="
