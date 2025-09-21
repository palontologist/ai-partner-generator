/**
 * Environment variable validation utilities
 * These help ensure the app works during build time even without all env vars
 */

export function isDatabaseConfigured(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}

export function isReplicateConfigured(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}

export function isProductionBuild(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
}

export function validateEnvironment() {
  const missing: string[] = [];
  
  if (!process.env.REPLICATE_API_TOKEN) {
    missing.push('REPLICATE_API_TOKEN');
  }
  
  if (!process.env.TURSO_DATABASE_URL) {
    missing.push('TURSO_DATABASE_URL');
  }
  
  if (!process.env.TURSO_AUTH_TOKEN) {
    missing.push('TURSO_AUTH_TOKEN');
  }

  return {
    isValid: missing.length === 0,
    missingVars: missing
  };
}