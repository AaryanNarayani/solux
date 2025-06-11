import { Hono } from 'hono';
import { z } from 'zod';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

// Define schemas directly in this file to avoid import issues
const AddressTransactionsParamsSchema = z.object({
  address: z.string().min(1, 'Address is required')
});

const AddressTransactionsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(1000).default(50),
  before: z.string().optional(),
  until: z.string().optional(),
  commitment: z.enum(['processed', 'confirmed', 'finalized']).default('confirmed'),
  filter: z.enum(['all', 'sent', 'received', 'program']).default('all'),
  program: z.string().optional()
});

const addressTransactionsRouter = new Hono();

addressTransactionsRouter.get('/:address/transactions', async (c) => {
  try {
    // Validate path parameters
    console.log("Address param:", c.req.param('address'));
    const paramsValidation = AddressTransactionsParamsSchema.safeParse({
      address: c.req.param('address')
    });

    if (!paramsValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_ADDRESS,
        'Invalid address format',
        paramsValidation.error.issues
      );
    }

    // Validate query parameters
    const queryParams = {
      limit: c.req.query('limit') || '50',
      before: c.req.query('before') || undefined,
      until: c.req.query('until') || undefined,
      commitment: c.req.query('commitment') || 'confirmed',
      filter: c.req.query('filter') || 'all',
      program: c.req.query('program') || undefined
    };

    console.log('Query params:', queryParams);

    try {
      // Parse the query params
      const queryValidation = AddressTransactionsQuerySchema.safeParse(queryParams);
      if (!queryValidation.success) {
        console.error('Query validation failed:', queryValidation.error);
        return sendError(
          c,
          ERROR_CODES.INVALID_PARAMETERS,
          'Invalid query parameters',
          queryValidation.error.issues
        );
      }

      const { address } = paramsValidation.data;
      const { limit, before, until, commitment, filter, program } = queryValidation.data;
      const rpcUrl = c.req.rpcUrl;

      if (!rpcUrl) {
        return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
      }

      // Prepare options for getSignaturesForAddress
      const options: any = {
        limit,
        commitment
      };

      // Add optional parameters if provided
      if (before) {
        options.before = before;
      }
      if (until) {
        options.until = until;
      }

      // Get transaction signatures
      const signatures = await makeRpcRequest(rpcUrl, 'getSignaturesForAddress', [
        address,
        options
      ]);

      if (!signatures || !Array.isArray(signatures)) {
        console.log('No transactions found or invalid response:', signatures);
        return sendSuccess(c, {
          address,
          transactions: [],
          pagination: {
            hasNext: false,
            hasPrevious: false,
            total: 0
          },
          summary: {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            totalFeePaid: 0,
            totalReceived: 0,
            totalSent: 0
          }
        }, 200, CACHE_SETTINGS.TRANSACTIONS);
      }

      console.log(`Found ${signatures.length} signatures for address ${address}`);

      // Process the first 10 transactions with full details to avoid overloading the RPC
      const transactionPromises = signatures.slice(0, 10).map(async (sig) => {
        try {
          const txInfo = await makeRpcRequest(rpcUrl, 'getTransaction', [
            sig.signature,
            {
              commitment,
              encoding: 'jsonParsed',
              maxSupportedTransactionVersion: 0
            }
          ]);

          if (!txInfo) {
            return {
              signature: sig.signature,
              blockTime: sig.blockTime,
              slot: sig.slot,
              status: sig.err ? 'failure' : 'success',
              confirmationStatus: sig.confirmationStatus || commitment,
              type: 'unknown' // Will be determined later
            };
          }

          // Determine if the transaction is incoming, outgoing, or both
          let type = 'unknown';
          let balanceChange = undefined;
          
          // Simple way to determine transaction type
          // In a real implementation, you'd need to analyze pre and post balances
          const accountKeys = txInfo.transaction?.message?.accountKeys;
          if (accountKeys && accountKeys.length > 0) {
            const isFromAccount = accountKeys[0]?.pubkey === address;
            
            if (isFromAccount) {
              type = 'sent';
            } else if (accountKeys.some((key: { pubkey: string }) => key.pubkey === address)) {
              type = 'received';
            }
          }

          // Extract program interactions
          const programInteractions = [];
          if (txInfo.transaction?.message?.instructions) {
            for (const instruction of txInfo.transaction.message.instructions) {
              if (instruction.programId) {
                let programName = 'Unknown Program';
                
                // Map some known program IDs to names
                if (instruction.programId === '11111111111111111111111111111111') {
                  programName = 'System Program';
                } else if (instruction.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
                  programName = 'SPL Token Program';
                }
                
                programInteractions.push({
                  programId: instruction.programId,
                  programName,
                  accounts: instruction.accounts
                });
              }
            }
          }

          return {
            signature: sig.signature,
            blockTime: txInfo.blockTime || sig.blockTime,
            slot: txInfo.slot || sig.slot,
            status: sig.err ? 'failure' : 'success',
            fee: txInfo.meta?.fee || 0,
            confirmationStatus: sig.confirmationStatus || commitment,
            computeUnitsConsumed: txInfo.meta?.computeUnitsConsumed,
            type,
            balanceChange,
            programInteractions,
            tokenTransfers: [], // Would need additional parsing
            memo: null // Would need to look for memo program instructions
          };
        } catch (error) {
          console.error(`Error processing transaction ${sig.signature}:`, error);
          // Return minimal information if we couldn't get the full transaction
          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            slot: sig.slot,
            status: sig.err ? 'failure' : 'success',
            type: 'unknown'
          };
        }
      });

      // Process transactions in parallel
      const transactions = await Promise.all(transactionPromises);

      // Calculate summary statistics
      const summary = {
        totalTransactions: signatures.length,
        successfulTransactions: signatures.filter(sig => !sig.err).length,
        failedTransactions: signatures.filter(sig => !!sig.err).length,
        totalFeePaid: transactions.reduce((sum, tx) => sum + (tx.fee || 0), 0),
        totalReceived: 0, // Would need more analysis
        totalSent: 0 // Would need more analysis
      };

      // Create pagination info
      const pagination = {
        hasNext: signatures.length >= limit,
        hasPrevious: !!before,
        total: signatures.length
      };

      return sendSuccess(c, {
        address,
        transactions,
        pagination,
        summary
      }, 200, CACHE_SETTINGS.TRANSACTIONS);

    } catch (error) {
      console.error('Address transactions inner error:', error);
      
      if (error instanceof Error && error.message.includes('too many')) {
        return sendError(c, ERROR_CODES.ADDRESS_TOO_ACTIVE, 'Address has too many transactions to process');
      }
      
      return sendError(
        c,
        ERROR_CODES.RPC_ERROR,
        'Failed to fetch address transactions (inner)',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

  } catch (error) {
    console.error('Address transactions outer error:', error);
    
    if (error instanceof Error && error.message.includes('too many')) {
      return sendError(c, ERROR_CODES.ADDRESS_TOO_ACTIVE, 'Address has too many transactions to process');
    }
    
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch address transactions (outer)',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

export default addressTransactionsRouter; 