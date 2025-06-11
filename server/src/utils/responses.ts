import { Context } from 'hono';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

// Error codes as constants
export const ERROR_CODES = {
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  BLOCK_NOT_FOUND: 'BLOCK_NOT_FOUND',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  RPC_ERROR: 'RPC_ERROR',
  // Phase 2 error codes
  PAGINATION_LIMIT_EXCEEDED: 'PAGINATION_LIMIT_EXCEEDED',
  INVALID_CURSOR: 'INVALID_CURSOR',
  FILTER_NOT_SUPPORTED: 'FILTER_NOT_SUPPORTED',
  ADDRESS_TOO_ACTIVE: 'ADDRESS_TOO_ACTIVE',
  HISTORICAL_DATA_UNAVAILABLE: 'HISTORICAL_DATA_UNAVAILABLE',
  // Phase 3 error codes
  ANALYTICS_DATA_UNAVAILABLE: 'ANALYTICS_DATA_UNAVAILABLE',
  TIMEFRAME_TOO_LARGE: 'TIMEFRAME_TOO_LARGE',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  INSUFFICIENT_HISTORICAL_DATA: 'INSUFFICIENT_HISTORICAL_DATA',
  ANALYSIS_IN_PROGRESS: 'ANALYSIS_IN_PROGRESS',
  CHART_GENERATION_FAILED: 'CHART_GENERATION_FAILED'
} as const;

// Success response helper
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

// Error response helper
export function createErrorResponse(
  code: string,
  message: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  };
}

// HTTP status code mapping
export const getHttpStatusForError = (code: string): number => {
  switch (code) {
    case ERROR_CODES.INVALID_PARAMETERS:
    case ERROR_CODES.INVALID_SIGNATURE:
    case ERROR_CODES.INVALID_ADDRESS:
    case ERROR_CODES.PAGINATION_LIMIT_EXCEEDED:
    case ERROR_CODES.INVALID_CURSOR:
    case ERROR_CODES.FILTER_NOT_SUPPORTED:
      return 400;
    case ERROR_CODES.TRANSACTION_NOT_FOUND:
    case ERROR_CODES.BLOCK_NOT_FOUND:
    case ERROR_CODES.SLOT_NOT_AVAILABLE:
    case ERROR_CODES.HISTORICAL_DATA_UNAVAILABLE:
      return 404;
    case ERROR_CODES.RATE_LIMIT_EXCEEDED:
      return 429;
    case ERROR_CODES.ADDRESS_TOO_ACTIVE:
      return 413; // Payload too large
    case ERROR_CODES.RPC_ERROR:
      return 503;
    case ERROR_CODES.INTERNAL_SERVER_ERROR:
    default:
      return 500;
  }
};

// Cache control types
export interface CacheOptions {
  maxAge: number; // seconds
  staleWhileRevalidate?: number; // seconds
  etag?: string;
  lastModified?: Date;
}

// Convenience methods for common responses
export function sendSuccess<T>(c: Context, data: T, status = 200, cacheOptions?: CacheOptions) {
  const response = c.json(createSuccessResponse(data), status as any);
  
  if (cacheOptions) {
    setCacheHeaders(c, cacheOptions);
  }
  
  return response;
}

export function sendError(
  c: Context,
  code: string,
  message: string,
  details?: any
) {
  const status = getHttpStatusForError(code);
  return c.json(createErrorResponse(code, message, details), status as any);
}

// Set caching headers based on endpoint type
export function setCacheHeaders(c: Context, options: CacheOptions) {
  const { maxAge, staleWhileRevalidate = 60, etag, lastModified } = options;
  
  let cacheControl = `public, max-age=${maxAge}`;
  if (staleWhileRevalidate) {
    cacheControl += `, stale-while-revalidate=${staleWhileRevalidate}`;
  }
  
  c.header('Cache-Control', cacheControl);
  
  if (etag) {
    c.header('ETag', `"${etag}"`);
  }
  
  if (lastModified) {
    c.header('Last-Modified', lastModified.toUTCString());
  }
}

// Predefined cache settings for different endpoint types
export const CACHE_SETTINGS = {
  TRANSACTIONS: { maxAge: 30, staleWhileRevalidate: 60 },
  TOKEN_BALANCES: { maxAge: 60, staleWhileRevalidate: 120 },
  BLOCK_TRANSACTIONS: { maxAge: 300, staleWhileRevalidate: 600 }, // 5 minutes for finalized blocks
  NETWORK_STATS: { maxAge: 15, staleWhileRevalidate: 30 },
  REAL_TIME_UPDATES: { maxAge: 5, staleWhileRevalidate: 10 },
  // Phase 3 cache settings
  ANALYTICS_OVERVIEW: { maxAge: 300, staleWhileRevalidate: 600 }, // 5 minutes
  ANALYTICS_CHARTS: { maxAge: 120, staleWhileRevalidate: 300 }, // 2 minutes for charts
  ANALYTICS_PROGRAMS: { maxAge: 900, staleWhileRevalidate: 1800 }, // 15 minutes
  ANALYTICS_DEFI: { maxAge: 300, staleWhileRevalidate: 600 }, // 5 minutes (TVL sensitive)
  TOKEN_DETAILS: { maxAge: 600, staleWhileRevalidate: 1200 }, // 10 minutes
  ADDRESS_NFTS: { maxAge: 300, staleWhileRevalidate: 600 } // 5 minutes
} as const;

// RPC request helper
export async function makeRpcRequest(
  url: string,
  method: string,
  params: any[]
): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  return data.result;
} 