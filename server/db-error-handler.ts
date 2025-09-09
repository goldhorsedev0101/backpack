// server/db-error-handler.ts - Robust DB error handling with categorization

export interface DbError {
  type: 'network' | 'authorization' | 'schema' | 'data' | 'unknown';
  message: string;
  originalError: any;
  userMessage: string;
}

export function categorizeDbError(error: any): DbError {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorCode = error?.code || error?.status;

  // Network/Transport errors
  if (
    errorMessage.includes('ENOTFOUND') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('network') ||
    errorCode === 'NETWORK_ERROR'
  ) {
    return {
      type: 'network',
      message: `Database connection failed: ${errorMessage}`,
      originalError: error,
      userMessage: 'Database service is temporarily unavailable. Please try again later.'
    };
  }

  // RLS/Authorization errors
  if (
    errorMessage.includes('RLS') ||
    errorMessage.includes('permission denied') ||
    errorMessage.includes('access denied') ||
    errorMessage.includes('unauthorized') ||
    errorCode === '42501' || // insufficient privilege
    errorCode === '42P01'    // undefined table (might be RLS)
  ) {
    return {
      type: 'authorization',
      message: `Authorization failed: ${errorMessage}`,
      originalError: error,
      userMessage: 'Access denied. Please check your permissions or sign in again.'
    };
  }

  // Schema mismatch errors (missing/renamed columns, etc.)
  if (
    errorMessage.includes('column') && errorMessage.includes('does not exist') ||
    errorMessage.includes('relation') && errorMessage.includes('does not exist') ||
    errorMessage.includes('syntax error') ||
    errorMessage.includes('invalid input syntax') ||
    errorCode === '42703' || // undefined column
    errorCode === '42P01' || // undefined table
    errorCode === '42601'    // syntax error
  ) {
    return {
      type: 'schema',
      message: `Database schema error: ${errorMessage}`,
      originalError: error,
      userMessage: 'Database structure issue detected. This has been logged for review.'
    };
  }

  // Data validation errors
  if (
    errorMessage.includes('violates') ||
    errorMessage.includes('duplicate key') ||
    errorMessage.includes('foreign key') ||
    errorMessage.includes('check constraint') ||
    errorCode === '23505' || // unique violation
    errorCode === '23503' || // foreign key violation
    errorCode === '23514'    // check violation
  ) {
    return {
      type: 'data',
      message: `Data validation error: ${errorMessage}`,
      originalError: error,
      userMessage: 'Invalid data provided. Please check your input and try again.'
    };
  }

  // Unknown errors
  return {
    type: 'unknown',
    message: `Database error: ${errorMessage}`,
    originalError: error,
    userMessage: 'An unexpected database error occurred. Please try again.'
  };
}

export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ data: T | null; error: DbError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const dbError = categorizeDbError(error);
    
    // Log detailed error for debugging
    console.error(`[DB Error] ${operationName}:`, {
      type: dbError.type,
      message: dbError.message,
      originalError: dbError.originalError,
      timestamp: new Date().toISOString()
    });

    return { data: null, error: dbError };
  }
}

export function validatePayloadKeys(payload: Record<string, any>, validKeys: string[]): string[] {
  const payloadKeys = Object.keys(payload);
  const invalidKeys = payloadKeys.filter(key => !validKeys.includes(key));
  return invalidKeys;
}