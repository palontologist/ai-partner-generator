#!/usr/bin/env node

/**
 * Simple test for Imagen API using curl commands
 * Run with: bash scripts/test-imagen-curl.sh
 */

echo "🎨 Testing Imagen API integration via curl..."
echo "🌐 Make sure your server is running on http://localhost:3000"
echo

# Test health endpoint
echo "📋 Testing API health..."
curl -s http://localhost:3000/api/health | jq '.configuration // {error: "No configuration found"}'
echo

# Test image generation with Imagen provider
echo "🖼️ Testing image generation with Imagen provider..."
curl -s -X POST http://localhost:3000/api/images/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "professional business person, confident smile, studio lighting",
    "provider": "imagen", 
    "style": "realistic",
    "aspectRatio": "1:1"
  }' | jq '.success // .error // "Request failed"'
echo

# Test diverse AI partner generation
echo "🧑‍🤝‍🧑 Testing diverse AI partner generation..."
curl -s -X POST http://localhost:3000/api/images/diverse-partner \
  -H "Content-Type: application/json" \
  -d '{
    "category": "business",
    "description": "confident business professional",
    "style": "realistic",
    "gender": "any"
  }' | jq '.success // .error // "Request failed"'
echo

echo "🎉 Testing completed!"
echo "💡 Check the server logs for detailed information"