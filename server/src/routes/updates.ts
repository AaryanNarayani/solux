import { Hono } from 'hono';
import { 
  LatestUpdatesQuerySchema, 
  AddressUpdatesParamsSchema, 
  AddressUpdatesQuerySchema 
} from '../schemas/phase2';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

const updatesRouter = new Hono();

// GET /api/updates/latest
updatesRouter.get('/latest', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      since: c.req.query('since'),
      types: c.req.query('types') || 'all',
      limit: c.req.query('limit') || '50'
    };

    const queryValidation = LatestUpdatesQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { since, types, limit } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Parse types to include
    const includeTypes = types === 'all' 
      ? ['blocks', 'transactions', 'network'] 
      : types.split(',').map(t => t.trim());

    const updates: any[] = [];
    let networkHealth: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Get current slot for reference
    const currentSlot = await makeRpcRequest(rpcUrl, 'getSlot', []);

    // Get recent blocks if requested
    if (includeTypes.includes('blocks')) {
      try {
        const recentBlocks = await makeRpcRequest(rpcUrl, 'getBlocks', [
          Math.max(0, currentSlot - limit),
          currentSlot
        ]);

        // Get details for most recent blocks
        const blockPromises = recentBlocks.slice(-Math.min(10, limit)).map(async (slot: number) => {
          try {
            const blockInfo = await makeRpcRequest(rpcUrl, 'getBlock', [
              slot,
              { transactionDetails: 'none', rewards: false }
            ]);
            
            if (blockInfo) {
              return {
                type: 'block',
                timestamp: blockInfo.blockTime ? new Date(blockInfo.blockTime * 1000).toISOString() : new Date().toISOString(),
                data: {
                  slot,
                  blockhash: blockInfo.blockhash,
                  parentSlot: blockInfo.parentSlot,
                  transactionCount: blockInfo.transactions?.length || 0,
                  blockTime: blockInfo.blockTime,
                  blockHeight: blockInfo.blockHeight
                }
              };
            }
          } catch (error) {
            console.error(`Error fetching block ${slot}:`, error);
            return null;
          }
        });

        const blockUpdates = (await Promise.all(blockPromises)).filter(Boolean);
        updates.push(...blockUpdates);
      } catch (error) {
        console.error('Error fetching recent blocks:', error);
      }
    }

    // Get network stats if requested
    if (includeTypes.includes('network')) {
      try {
        const [epochInfo, supply, performanceData, validatorInfo] = await Promise.all([
          makeRpcRequest(rpcUrl, 'getEpochInfo', []),
          makeRpcRequest(rpcUrl, 'getSupply', []),
          makeRpcRequest(rpcUrl, 'getRecentPerformanceSamples', [1]),
          makeRpcRequest(rpcUrl, 'getVoteAccounts', [])
        ]);

        // Calculate health based on validator performance
        const totalValidators = validatorInfo.current.length + validatorInfo.delinquent.length;
        const delinquentPercentage = (validatorInfo.delinquent.length / totalValidators) * 100;
        
        if (delinquentPercentage > 20) {
          networkHealth = 'critical';
        } else if (delinquentPercentage > 10) {
          networkHealth = 'warning';
        }

        const performance = performanceData[0];
        const tps = performance ? performance.numTransactions / performance.samplePeriodSecs : 0;

        updates.push({
          type: 'network_stats',
          timestamp: new Date().toISOString(),
          data: {
            currentSlot,
            epochInfo,
            performance: {
              tps: Math.round(tps),
              avgTps1m: Math.round(tps),
              avgTps5m: Math.round(tps)
            },
            validators: {
              total: totalValidators,
              active: validatorInfo.current.length,
              delinquent: validatorInfo.delinquent.length
            },
            supply: {
              total: supply.value.total / 1000000000,
              circulating: supply.value.circulating / 1000000000,
              nonCirculating: supply.value.nonCirculating / 1000000000
            },
            health: networkHealth
          }
        });
      } catch (error) {
        console.error('Error fetching network stats:', error);
        networkHealth = 'critical';
      }
    }

    // Filter by since timestamp if provided
    let filteredUpdates = updates;
    if (since) {
      const sinceDate = new Date(since);
      filteredUpdates = updates.filter(update => 
        new Date(update.timestamp) > sinceDate
      );
    }

    // Sort by timestamp descending
    filteredUpdates.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit results
    filteredUpdates = filteredUpdates.slice(0, limit);

    const response = {
      updates: filteredUpdates,
      latestSlot: currentSlot,
      networkHealth,
      lastUpdated: new Date().toISOString(),
      nextPollIn: 10 // Recommended 10 seconds for next poll
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.REAL_TIME_UPDATES);

  } catch (error) {
    console.error('Latest updates error:', error);
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch latest updates',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

// GET /api/addresses/{address}/updates
updatesRouter.get('/:address/updates', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = AddressUpdatesParamsSchema.safeParse({
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
      since: c.req.query('since'),
      includeTokens: c.req.query('includeTokens') || 'true'
    };

    const queryValidation = AddressUpdatesQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { address } = paramsValidation.data;
    const { since, includeTokens } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    const updates: any[] = [];
    let currentBalance = 0;
    let lastActivity: string | null = null;

    // Get current account info
    try {
      const accountInfo = await makeRpcRequest(rpcUrl, 'getAccountInfo', [
        address,
        { encoding: 'base64' }
      ]);
      
      currentBalance = accountInfo?.lamports || 0;
    } catch (error) {
      console.error('Error fetching account info:', error);
    }

    // Get recent transaction signatures
    const signaturesParams: any = { limit: 20 };
    if (since) {
      // Note: RPC doesn't support filtering by timestamp directly
      // In a real implementation, you'd need to store this data separately
    }

    try {
      const signatures = await makeRpcRequest(rpcUrl, 'getSignaturesForAddress', [
        address,
        signaturesParams
      ]);

      if (signatures && signatures.length > 0) {
        lastActivity = new Date(signatures[0].blockTime * 1000).toISOString();

        // Process recent transactions for updates
        for (const sig of signatures.slice(0, 10)) {
          const txTime = new Date(sig.blockTime * 1000).toISOString();
          
          // Skip if before since timestamp
          if (since && new Date(txTime) <= new Date(since)) continue;

          // Get transaction details for balance changes
          try {
            const txInfo = await makeRpcRequest(rpcUrl, 'getTransaction', [
              sig.signature,
              { encoding: 'json', maxSupportedTransactionVersion: 0 }
            ]);

            if (txInfo) {
              const accountKeys = txInfo.transaction?.message?.accountKeys || [];
              const addressIndex = accountKeys.indexOf(address);
              
              if (addressIndex !== -1) {
                const before = txInfo.meta?.preBalances?.[addressIndex] || 0;
                const after = txInfo.meta?.postBalances?.[addressIndex] || 0;
                const change = after - before;

                if (change !== 0) {
                  updates.push({
                    type: 'balance_change',
                    timestamp: txTime,
                    signature: sig.signature,
                    balanceChange: {
                      before,
                      after,
                      change
                    }
                  });
                }

                // Add transaction update
                updates.push({
                  type: 'transaction',
                  timestamp: txTime,
                  signature: sig.signature,
                  balanceChange: {
                    before,
                    after,
                    change
                  }
                });
              }
            }
          } catch (error) {
            console.error(`Error fetching transaction ${sig.signature}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
    }

    // Get token balance changes if requested
    if (includeTokens) {
      try {
        // This is simplified - real implementation would track token balance changes over time
        const tokenAccounts = await makeRpcRequest(rpcUrl, 'getTokenAccountsByOwner', [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]);

        // In a real implementation, you'd compare with previous snapshots
        // For now, we'll just indicate if there are token accounts
        if (tokenAccounts?.value?.length > 0) {
          // Placeholder for token change detection
        }
      } catch (error) {
        console.error('Error fetching token accounts:', error);
      }
    }

    // Sort updates by timestamp descending
    updates.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const hasNewActivity = since ? updates.length > 0 : false;

    const response = {
      address,
      updates,
      currentBalance,
      lastActivity,
      hasNewActivity
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.REAL_TIME_UPDATES);

  } catch (error) {
    console.error('Address updates error:', error);
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch address updates',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

export default updatesRouter; 