#!/usr/bin/env node

/**
 * Simple test for Imagen API integration via HTTP endpoints
 * Run with: node scripts/test-imagen-simple.js
 */

async function testImagenAPI() {
  console.log('🎨 Testing Imagen API integration via HTTP...');
  
  try {
    // Test the health endpoint first
    console.log('📋 Testing API health...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    
    console.log('Health check:', {
      status: healthResponse.status,
      isValid: healthData.configuration?.isValid,
      missingVars: healthData.configuration?.missingVars
    });
    
    if (!healthData.configuration?.isValid) {
      console.log('❌ API not properly configured');
      console.log('Missing:', healthData.configuration?.missingVars);
      return;
    }
    
    console.log('✅ API is properly configured!');
    
    // Test diverse AI partner generation
    console.log('\n🧑‍🤝‍🧑 Testing diverse AI partner generation...');
    
    const testCases = [
      { category: 'business', description: 'confident business professional' },
      { category: 'technology', description: 'innovative tech expert' },
      { category: 'creative', description: 'artistic and imaginative' }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🎯 Test ${i + 1}: Generating ${testCase.category} partner...`);
      
      try {
        const response = await fetch('http://localhost:3000/api/images/diverse-partner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: testCase.category,
            description: testCase.description,
            style: 'realistic',
            gender: 'any'
          }),
        });
        
        const result = await response.json();
        
        console.log(`Result ${i + 1}:`, {
          success: result.success,
          status: response.status,
          hasImageUrl: !!(result.data?.imageUrl),
          error: result.error || result.data?.error,
          provider: result.provider
        });
        
        if (result.success && result.data?.status === 'completed') {
          console.log(`✅ Generated diverse ${testCase.category} partner!`);
          console.log(`🔗 Image URL: ${result.data.imageUrl}`);
        } else {
          console.log(`❌ Generation failed:`, result.error || result.data?.error);
        }
      } catch (error) {
        console.log(`❌ Request failed:`, error.message);
      }
    }
    
    // Test regular image generation with provider selection
    console.log('\n🖼️ Testing regular image generation with Imagen...');
    
    try {
      const response = await fetch('http://localhost:3000/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'professional business person, confident smile, studio lighting',
          provider: 'imagen',
          style: 'realistic',
          aspectRatio: '1:1'
        }),
      });
      
      const result = await response.json();
      
      console.log('Regular generation result:', {
        success: result.success,
        status: response.status,
        hasImageUrl: !!(result.data?.imageUrl),
        error: result.error || result.data?.error,
        provider: result.provider
      });
      
      if (result.success) {
        console.log('✅ Regular image generation successful!');
      } else {
        console.log('❌ Regular image generation failed:', result.error || result.data?.error);
      }
    } catch (error) {
      console.log('❌ Regular generation request failed:', error.message);
    }
    
    console.log('\n🎉 Testing completed!');
    console.log('💡 If successful, your diverse face generation is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if the server is running
console.log('🔍 Make sure your Next.js server is running (pnpm dev)');
console.log('🌐 Testing on http://localhost:3000\n');

testImagenAPI();