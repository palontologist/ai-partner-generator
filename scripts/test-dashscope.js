#!/usr/bin/env node

/**
 * Test script for DashScope integration
 * This script tests the qwen service directly
 */

const { qwenService } = require('../lib/services/qwen.ts');

async function testDashScope() {
  console.log('🧪 Testing DashScope integration...\n');

  try {
    // Test health check first
    console.log('1. Testing health check...');
    const isHealthy = await qwenService.healthCheck();
    console.log(`   Health check: ${isHealthy ? '✅ Passed' : '❌ Failed'}\n`);

    // Test basic image generation
    console.log('2. Testing image generation...');
    const result = await qwenService.generateImage({
      prompt: 'A professional headshot of a software engineer, realistic, high quality',
      watermark: false,
      negative_prompt: 'cartoon, animated, low quality'
    });

    console.log('   Generation result:');
    console.log(`   - Status: ${result.status}`);
    console.log(`   - ID: ${result.id}`);
    console.log(`   - Image URL: ${result.imageUrl || 'Not generated'}`);
    console.log(`   - Error: ${result.error || 'None'}`);

    if (result.status === 'completed') {
      console.log('   ✅ Image generation successful!');
    } else {
      console.log('   ❌ Image generation failed');
      console.log(`   Error: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testDashScope().then(() => {
    console.log('\n🎉 DashScope test completed!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testDashScope };