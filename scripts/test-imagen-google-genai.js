#!/usr/bin/env node

/**
 * Test script for Google GenAI Imagen integration
 * Tests the updated Imagen service with Google GenAI library
 */

const { imagenService } = require('../lib/services/imagen.ts');

async function testImagenIntegration() {
  console.log('🧪 Testing Imagen service with Google GenAI...');
  
  try {
    // Test health check first
    console.log('🔍 Checking Imagen service health...');
    const isHealthy = await imagenService.healthCheck();
    console.log(`Health check result: ${isHealthy ? '✅ Healthy' : '❌ Not healthy'}`);
    
    if (!isHealthy) {
      console.log('❌ Service not healthy, skipping image generation test');
      return;
    }
    
    // Test basic image generation
    console.log('🎨 Testing basic image generation...');
    const result = await imagenService.generateImage({
      prompt: 'A professional headshot of a business person',
      aspect_ratio: '1:1',
      number_of_images: 1,
      person_generation: 'ALLOW_ALL'
    });
    
    console.log('📊 Generation result:', {
      id: result.id,
      status: result.status,
      imageUrl: result.imageUrl,
      prompt: result.prompt.substring(0, 100) + '...',
      error: result.error
    });
    
    if (result.status === 'completed') {
      console.log('✅ Image generation successful!');
      console.log(`🖼️  Image saved to: ${result.imageUrl}`);
    } else {
      console.log('❌ Image generation failed:', result.error);
    }
    
    // Test teammate image generation
    console.log('👥 Testing teammate image generation...');
    const teammateResult = await imagenService.generateTeammateImage(
      'Sarah Johnson',
      'business',
      'A confident business professional with 10 years of experience',
      'professional'
    );
    
    console.log('📊 Teammate generation result:', {
      id: teammateResult.id,
      status: teammateResult.status,
      imageUrl: teammateResult.imageUrl,
      error: teammateResult.error
    });
    
    if (teammateResult.status === 'completed') {
      console.log('✅ Teammate image generation successful!');
      console.log(`🖼️  Image saved to: ${teammateResult.imageUrl}`);
    } else {
      console.log('❌ Teammate image generation failed:', teammateResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testImagenIntegration()
  .then(() => {
    console.log('🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });