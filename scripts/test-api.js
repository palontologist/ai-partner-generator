#!/usr/bin/env node

/**
 * Test the image generation API with all providers
 * This script tests the multi-provider image generation system
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function testAPI() {
  console.log('🚀 Starting API tests...');
  
  const testCases = [
    {
      name: 'Ideogram Provider',
      provider: 'ideogram',
      data: {
        prompt: 'A professional business headshot',
        provider: 'ideogram',
        style: 'professional',
        aspectRatio: '1:1',
        userId: 'test-user'
      }
    },
    {
      name: 'Imagen Provider',
      provider: 'imagen',
      data: {
        prompt: 'A professional business headshot',
        provider: 'imagen',
        style: 'realistic',
        aspectRatio: '1:1',
        userId: 'test-user'
      }
    },
    {
      name: 'Qwen Provider',
      provider: 'qwen',
      data: {
        prompt: 'A professional business headshot',
        provider: 'qwen',
        style: 'realistic',
        seed: 42,
        userId: 'test-user'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing ${testCase.name}...`);
    
    try {
      const response = await fetch('http://localhost:3000/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const result = await response.json();
      
      console.log(`📊 Response Status: ${response.status}`);
      console.log(`📊 Result:`, {
        success: result.success,
        provider: result.provider,
        message: result.message,
        error: result.error,
        hasData: !!result.data
      });

      if (result.success) {
        console.log(`✅ ${testCase.name} test passed!`);
        if (result.data?.imageUrl) {
          console.log(`🖼️  Image URL: ${result.data.imageUrl}`);
        }
      } else {
        console.log(`❌ ${testCase.name} test failed:`, result.error);
        if (result.details) {
          console.log(`🔍 Details: ${result.details}`);
        }
      }
      
    } catch (error) {
      console.error(`💥 ${testCase.name} test crashed:`, error.message);
    }
  }
}

async function main() {
  // Check if server is already running
  console.log('🔍 Checking if server is running...');
  const serverRunning = await waitForServer('http://localhost:3000', 5000);
  
  if (!serverRunning) {
    console.log('❌ Server is not running. Please start it with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!');
  
  // Run API tests
  await testAPI();
  
  console.log('\n🏁 All tests completed!');
}

main().catch(console.error);