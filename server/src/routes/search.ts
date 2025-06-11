import { Hono } from 'hono';
import { SearchQuerySchema } from '../schemas';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest } from '../utils/responses';

const searchRouter = new Hono();

searchRouter.get('/', async (c) => {
  try {
    // Manual validation using Zod
    const queryParams = {
      q: c.req.query('q'),
      type: c.req.query('type') || 'auto'
    };

    const validation = SearchQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid search parameters',
        validation.error.issues
      );
    }

    const { q: query, type } = validation.data;
    const rpcUrl = c.req.rpcUrl;
    
    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Detect the type of query if auto
    let detectedType = type;
    if (type === 'auto') {
      detectedType = detectQueryType(query);
    }

    const results = [];
    let searchType: 'transaction' | 'block' | 'address' | 'unknown' = detectedType as any;

    switch (detectedType) {
      case 'transaction':
        try {
          const txInfo = await makeRpcRequest(rpcUrl, 'getTransaction', [
            query,
            { encoding: 'json', maxSupportedTransactionVersion: 0 }
          ]);
          
          if (txInfo) {
            results.push({
              type: 'transaction',
              id: query,
              summary: {
                signature: query,
                status: txInfo.meta?.err ? 'failed' : 'success',
                blockTime: txInfo.blockTime,
                slot: txInfo.slot,
                fee: txInfo.meta?.fee || 0
              },
              confidence: 1.0
            });
          }
        } catch (error) {
          // Transaction not found - might be a different type
          if (type !== 'auto') {
            return sendError(c, ERROR_CODES.TRANSACTION_NOT_FOUND, 'Transaction not found');
          }
        }
        break;

      case 'block':
        try {
          const slot = parseInt(query);
          if (isNaN(slot)) {
            return sendError(c, ERROR_CODES.INVALID_PARAMETERS, 'Invalid slot number');
          }

          const blockInfo = await makeRpcRequest(rpcUrl, 'getBlock', [
            slot,
            { transactionDetails: 'none', rewards: false }
          ]);

          if (blockInfo) {
            results.push({
              type: 'block',
              id: query,
              summary: {
                blockhash: blockInfo.blockhash,
                parentSlot: blockInfo.parentSlot,
                transactionCount: blockInfo.transactions.length
              },
              confidence: 1.0
            });
          }
        } catch (error) {
          if (type !== 'auto') {
            return sendError(c, ERROR_CODES.BLOCK_NOT_FOUND, 'Block not found');
          }
        }
        break;

      case 'address':
        try {
          const accountInfo = await makeRpcRequest(rpcUrl, 'getAccountInfo', [
            query,
            { encoding: 'base64' }
          ]);

          // Check if it's a program (executable account)
          const isProgram = accountInfo?.executable || false;

          results.push({
            type: 'address',
            id: query,
            summary: {
              address: query,
              balance: accountInfo?.lamports || 0,
              isProgram,
              owner: accountInfo?.owner
            },
            confidence: 1.0
          });

        } catch (error) {
          if (type !== 'auto') {
            return sendError(c, ERROR_CODES.INVALID_ADDRESS, 'Address not found');
          }
        }
        break;

      default:
        searchType = 'unknown';
    }

    // If no results found and it was auto-detection, try other types
    if (results.length === 0 && type === 'auto') {
      searchType = 'unknown';
    }

    const searchResponse = {
      query,
      type: searchType,
      results,
      suggestions: results.length === 0 ? generateSuggestions(query) : undefined
    };

    return sendSuccess(c, searchResponse);

  } catch (error) {
    console.error('Search error:', error);
    return sendError(
      c,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Search failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

function detectQueryType(query: string): 'transaction' | 'block' | 'address' {
  // Base58 transaction signatures are typically 88 characters
  if (query.length >= 80 && query.length <= 90 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(query)) {
    return 'transaction';
  }
  
  // Block slots are numbers
  if (/^\d+$/.test(query)) {
    return 'block';
  }
  
  // Solana addresses are base58 and typically 32-44 characters
  if (query.length >= 32 && query.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(query)) {
    return 'address';
  }
  
  return 'address'; // Default fallback
}

function generateSuggestions(query: string): string[] {
  const suggestions = [];
  
  if (query.length > 0) {
    suggestions.push('Try entering a complete transaction signature (88 characters)');
    suggestions.push('Try entering a block slot number');
    suggestions.push('Try entering a complete Solana address (32-44 characters)');
  }
  
  return suggestions;
}

export default searchRouter; 