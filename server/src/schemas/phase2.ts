import { z } from 'zod';
import { CommitmentSchema } from './index';

// Address Transactions endpoint schemas
export const AddressTransactionsParamsSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

export const AddressTransactionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(50),
  before: z.string().optional(),
  until: z.string().optional(),
  commitment: CommitmentSchema,
  filter: z.enum(['all', 'sent', 'received', 'program']).default('all'),
  program: z.string().optional()
});

// Address Tokens endpoint schemas
export const AddressTokensParamsSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

export const AddressTokensQuerySchema = z.object({
  includeNFTs: z.coerce.boolean().default(false),
  includeZeroBalance: z.coerce.boolean().default(false),
  includePrices: z.coerce.boolean().default(true),
  sortBy: z.enum(['balance', 'value', 'name']).default('value'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Block Transactions endpoint schemas
export const BlockTransactionsParamsSchema = z.object({
  slot: z.coerce.number().min(0, 'Slot must be a non-negative number')
});

export const BlockTransactionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['all', 'success', 'failed']).default('all'),
  sortBy: z.enum(['index', 'fee', 'compute']).default('index'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  includeDetails: z.coerce.boolean().default(false)
});

// Real-time Updates endpoint schemas
export const LatestUpdatesQuerySchema = z.object({
  since: z.string().datetime().optional(),
  types: z.string().default('all'), // Will be parsed into array
  limit: z.coerce.number().min(1).max(100).default(50)
});

export const AddressUpdatesParamsSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

export const AddressUpdatesQuerySchema = z.object({
  since: z.string().datetime().optional(),
  includeTokens: z.coerce.boolean().default(true)
});

// Additional error codes for Phase 2
export const PHASE2_ERROR_CODES = {
  PAGINATION_LIMIT_EXCEEDED: 'PAGINATION_LIMIT_EXCEEDED',
  INVALID_CURSOR: 'INVALID_CURSOR',
  FILTER_NOT_SUPPORTED: 'FILTER_NOT_SUPPORTED',
  ADDRESS_TOO_ACTIVE: 'ADDRESS_TOO_ACTIVE',
  HISTORICAL_DATA_UNAVAILABLE: 'HISTORICAL_DATA_UNAVAILABLE'
} as const; 