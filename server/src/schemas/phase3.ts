import { z } from 'zod';

// Common timeframe and granularity schemas
export const TimeframeSchema = z.enum(['1h', '6h', '24h', '7d', '30d', '90d']);
export const GranularitySchema = z.enum(['minute', 'hour', 'day']);
export const ChartTimeframeSchema = z.enum(['1h', '6h', '24h', '7d', '30d']);

// Analytics Overview endpoint
export const AnalyticsOverviewQuerySchema = z.object({
  timeframe: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
  includeHistory: z.coerce.boolean().default(true)
});

// Charts endpoints
export const TpsChartsQuerySchema = z.object({
  timeframe: ChartTimeframeSchema,
  granularity: GranularitySchema.optional(),
  includeAverage: z.coerce.boolean().default(true)
});

export const FeesChartsQuerySchema = z.object({
  timeframe: ChartTimeframeSchema,
  granularity: GranularitySchema.optional(),
  metric: z.enum(['total', 'average', 'median']).default('total')
});

export const ValidatorsChartsQuerySchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d', '90d']),
  metric: z.enum(['count', 'stake', 'performance']).default('count')
});

// Token details endpoint
export const TokenParamsSchema = z.object({
  mint: z.string().min(1, 'Token mint address is required')
});

export const TokenQuerySchema = z.object({
  includeHolders: z.coerce.boolean().default(false),
  includeHistory: z.coerce.boolean().default(true),
  timeframe: z.enum(['24h', '7d', '30d']).default('7d')
});

// Address NFTs endpoint
export const AddressNftsParamsSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

export const AddressNftsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  includeMetadata: z.coerce.boolean().default(true),
  includeFloorPrice: z.coerce.boolean().default(true),
  sortBy: z.enum(['name', 'collection', 'rarity', 'floorPrice']).default('name'),
  filterBy: z.string().optional()
});

// Program analytics endpoint
export const ProgramAnalyticsQuerySchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d']).default('24h'),
  category: z.enum(['defi', 'nft', 'gaming', 'infrastructure', 'all']).default('all'),
  sortBy: z.enum(['transactions', 'users', 'fees', 'volume']).default('transactions'),
  limit: z.coerce.number().min(1).max(200).default(50)
});

// DeFi analytics endpoint
export const DefiAnalyticsQuerySchema = z.object({
  timeframe: z.enum(['24h', '7d', '30d']).default('24h'),
  protocol: z.string().optional(),
  includeHistorical: z.coerce.boolean().default(true)
});

// Additional error codes for Phase 3
export const PHASE3_ERROR_CODES = {
  ANALYTICS_DATA_UNAVAILABLE: 'ANALYTICS_DATA_UNAVAILABLE',
  TIMEFRAME_TOO_LARGE: 'TIMEFRAME_TOO_LARGE',
  TOKEN_NOT_FOUND: 'TOKEN_NOT_FOUND',
  INSUFFICIENT_HISTORICAL_DATA: 'INSUFFICIENT_HISTORICAL_DATA',
  ANALYSIS_IN_PROGRESS: 'ANALYSIS_IN_PROGRESS',
  CHART_GENERATION_FAILED: 'CHART_GENERATION_FAILED'
} as const; 