#!/usr/bin/env node

/**
 * Test script for Imagen API integration with diversity testing
 * Run with: node scripts/test-imagen.js
 */

import { imagenService } from '../lib/services/imagen.js';

async function testImagenDiversity() {
  console.log('🎨 Testing Imagen API integration with diversity...');
  
  try {
    // Test API key configuration
    console.log('📋 Testing API configuration...');
    const isConfigured = await imagenService.healthCheck();
    console.log(`API configured: ${isConfigured ? '✅' : '❌'}`);
    
    if (!isConfigured) {
      console.log('⚠️  Please set GEMINI_API_KEY environment variable');
      return;
    }
    
    console.log('\n🧑‍🤝‍🧑 Testing diverse AI partner generation...');
    
    // Test multiple generations to verify diversity
    const testCases = [
      { category: 'business', description: 'confident business professional' },
      { category: 'technology', description: 'innovative tech expert' },
      { category: 'creative', description: 'artistic and imaginative' },
      { category: 'academic', description: 'knowledgeable researcher' },
      { category: 'travel', description: 'adventurous and worldly' }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🎯 Test ${i + 1}: Generating ${testCase.category} partner...`);
      
      const result = await imagenService.generateDiverseAIPartner({
        category: testCase.category,
        description: testCase.description,
        style: 'realistic'
      });
      
      console.log(`Result ${i + 1}:`, {
        status: result.status,
        hasImageUrl: !!result.imageUrl,
        error: result.error,
        promptLength: result.prompt.length,
        seed: result.parameters?.seed
      });
      
      if (result.status === 'completed') {
        console.log(`✅ Generated diverse ${testCase.category} partner!`);
        console.log(`🔗 Image URL: ${result.imageUrl}`);
      } else {
        console.log(`❌ Generation failed:`, result.error);
      }
    }
    
    console.log('\n👤 Testing realistic human face generation with forced diversity...');
    
    // Test realistic face generation with different parameters
    const faceTests = [
      { profession: 'business executive', lighting: 'studio' },
      { profession: 'creative director', lighting: 'natural' },
      { profession: 'tech innovator', lighting: 'golden-hour' },
    ];
    
    for (let i = 0; i < faceTests.length; i++) {
      const faceTest = faceTests[i];
      console.log(`\n👨‍💼 Face Test ${i + 1}: ${faceTest.profession}...`);
      
      const result = await imagenService.generateRealisticHumanFace({
        profession: faceTest.profession,
        lighting: faceTest.lighting,
        style: 'headshot',
        forceRandomization: true
      });
      
      console.log(`Face Result ${i + 1}:`, {
        status: result.status,
        hasImageUrl: !!result.imageUrl,
        error: result.error,
        seed: result.parameters?.seed
      });
      
      if (result.status === 'completed') {
        console.log(`✅ Generated diverse ${faceTest.profession}!`);
      } else {
        console.log(`❌ Face generation failed:`, result.error);
      }
    }
    
    console.log('\n🔄 Testing seed consistency...');
    const fixedSeed = 12345;
    
    console.log(`🧪 Generating two images with same seed (${fixedSeed}) - should be similar:`);
    
    const result1 = await imagenService.generateImage({
      prompt: 'professional business person, confident smile, studio lighting',
      seed: fixedSeed,
      aspect_ratio: '1:1',
      style_type: 'realistic'
    });
    
    const result2 = await imagenService.generateImage({
      prompt: 'professional business person, confident smile, studio lighting',
      seed: fixedSeed,
      aspect_ratio: '1:1',
      style_type: 'realistic'
    });
    
    console.log('Seed consistency test:', {
      both_successful: result1.status === 'completed' && result2.status === 'completed',
      same_seed_used: result1.parameters?.seed === result2.parameters?.seed,
      seeds: { result1: result1.parameters?.seed, result2: result2.parameters?.seed }
    });
    
    console.log('\n🎉 Diversity testing completed!');
    console.log('💡 Tips:');
    console.log('- Each generation should produce different faces');
    console.log('- Same seed should produce similar results');
    console.log('- Different categories should have appropriate styling');
    console.log('- Faces should vary in ethnicity, age, and features');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testImagenDiversity();