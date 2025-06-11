import { z } from 'zod';

// Common schemas
export const CommitmentSchema = z.enum(['processed', 'confirmed', 'finalized']).default('confirmed');
export const EncodingSchema = z.enum(['base58', 'base64', 'jsonParsed']).default('base58');

// Network Stats - no parameters needed
export const NetworkStatsQuerySchema = z.object({});

// Search endpoint
export const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  type: z.enum(['transaction', 'block', 'address', 'auto']).default('auto')
});

// Transaction endpoint
export const TransactionParamsSchema = z.object({
  signature: z.string().min(1, 'Transaction signature is required')
});

export const TransactionQuerySchema = z.object({
  commitment: CommitmentSchema,
  maxSupportedTransactionVersion: z.coerce.number().default(0)
});

// Block endpoint
export const BlockParamsSchema = z.object({
  slot: z.coerce.number().min(0, 'Slot must be a non-negative number')
});

export const BlockQuerySchema = z.object({
  commitment: CommitmentSchema,
  transactionDetails: z.enum(['full', 'signatures', 'none']).default('signatures'),
  rewards: z.coerce.boolean().default(true)
});

// Address endpoint
export const AddressParamsSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

export const AddressQuerySchema = z.object({
  commitment: CommitmentSchema,
  includeTokens: z.coerce.boolean().default(false),
  encoding: EncodingSchema
});

// Response schemas for type safety
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }),
  timestamp: z.string()
});

// Success response wrapper
export const createSuccessResponse = <T>(dataSchema: z.ZodSchema<T>) => 
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string()
  });

// Re-export Phase 2 schemas
export * from './phase2';

// Re-export Phase 3 schemas
export * from './phase3'; 