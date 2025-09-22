import { NextRequest, NextResponse } from 'next/server';
import { validateEnvironment, validateImageGeneration, isDatabaseConfigured, isReplicateConfigured, isImagenConfigured } from '@/lib/env-check';

export async function GET(request: NextRequest) {
  try {
    const envCheck = validateEnvironment();
    const imageGenCheck = validateImageGeneration();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          configured: isDatabaseConfigured(),
          status: isDatabaseConfigured() ? 'ready' : 'not configured'
        },
        replicate: {
          configured: isReplicateConfigured(),
          status: isReplicateConfigured() ? 'ready' : 'not configured'
        },
        imagen: {
          configured: isImagenConfigured(),
          status: isImagenConfigured() ? 'ready' : 'not configured'
        }
      },
      configuration: {
        isValid: envCheck.isValid,
        missingVars: envCheck.missingVars,
        message: envCheck.isValid 
          ? 'All required environment variables are configured' 
          : `Missing required environment variables: ${envCheck.missingVars.join(', ')}`
      },
      imageGeneration: {
        available: imageGenCheck.isValid,
        providers: {
          replicate: imageGenCheck.hasReplicate,
          imagen: imageGenCheck.hasImagen
        },
        message: imageGenCheck.isValid
          ? 'Image generation services available'
          : 'No image generation services configured'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}