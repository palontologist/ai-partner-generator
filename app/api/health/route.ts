import { NextRequest, NextResponse } from 'next/server';
import { validateEnvironment, isDatabaseConfigured, isReplicateConfigured } from '@/lib/env-check';

export async function GET(request: NextRequest) {
  try {
    const envCheck = validateEnvironment();
    
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
        }
      },
      configuration: {
        isValid: envCheck.isValid,
        missingVars: envCheck.missingVars,
        message: envCheck.isValid 
          ? 'All required environment variables are configured' 
          : `Missing required environment variables: ${envCheck.missingVars.join(', ')}`
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}