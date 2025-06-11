import { Hono } from 'hono';
import { BlockTransactionsParamsSchema, BlockTransactionsQuerySchema } from '../schemas/phase2';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

const blockTransactionsRouter = new Hono();

blockTransactionsRouter.get('/:slot/transactions', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = BlockTransactionsParamsSchema.safeParse({
      slot: c.req.param('slot')
    });

    if (!paramsValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid slot number',
        paramsValidation.error.issues
      );
    }

    // Validate query parameters
    const queryParams = {
      limit: c.req.query('limit') || '100',
      offset: c.req.query('offset') || '0',
      status: c.req.query('status') || 'all',
      sortBy: c.req.query('sortBy') || 'index',
      sortOrder: c.req.query('sortOrder') || 'asc',
      includeDetails: c.req.query('includeDetails') || 'false'
    };

    const queryValidation = BlockTransactionsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { slot } = paramsValidation.data;
    const { limit, offset, status, sortBy, sortOrder, includeDetails } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get block with full transaction details
    const blockInfo = await makeRpcRequest(rpcUrl, 'getBlock', [
      slot,
      {
        encoding: 'json',
        transactionDetails: 'full',
        rewards: false,
        commitment: 'confirmed'
      }
    ]);

    if (!blockInfo) {
      return sendError(c, ERROR_CODES.BLOCK_NOT_FOUND, 'Block not found');
    }

    const allTransactions = blockInfo.transactions || [];
    let filteredTransactions = [...allTransactions];

    // Apply status filter
    if (status !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => {
        const isSuccess = !tx.meta?.err;
        return status === 'success' ? isSuccess : !isSuccess;
      });
    }

    // Sort transactions
    filteredTransactions.sort((a, b) => {
      let comparison = 0;
      const aIndex = allTransactions.indexOf(a);
      const bIndex = allTransactions.indexOf(b);

      switch (sortBy) {
        case 'index':
          comparison = aIndex - bIndex;
          break;
        case 'fee':
          comparison = (a.meta?.fee || 0) - (b.meta?.fee || 0);
          break;
        case 'compute':
          comparison = (a.meta?.computeUnitsConsumed || 0) - (b.meta?.computeUnitsConsumed || 0);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const totalTransactions = filteredTransactions.length;
    const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);

    // Process transactions for response
    const processedTransactions = [];
    const programCounts = new Map<string, number>();
    let totalFees = 0;
    let totalComputeUnits = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;

    for (let i = 0; i < paginatedTransactions.length; i++) {
      const tx = paginatedTransactions[i];
      const originalIndex = allTransactions.indexOf(tx) + offset;
      
      const signature = tx.transaction?.signatures?.[0] || '';
      const fee = tx.meta?.fee || 0;
      const computeUnits = tx.meta?.computeUnitsConsumed || 0;
      const isSuccess = !tx.meta?.err;
      const accountKeys = tx.transaction?.message?.accountKeys || [];

      if (isSuccess) {
        successfulTransactions++;
      } else {
        failedTransactions++;
      }

      totalFees += fee;
      totalComputeUnits += computeUnits;

      // Analyze balance changes
      const balanceChanges = analyzeBalanceChanges(tx);

      // Extract token transfers
      const tokenTransfers = extractTokenTransfers(tx);

      // Analyze program interactions
      const programInteractions = analyzeProgramInteractions(tx, programCounts);

      const processedTransaction: any = {
        signature,
        index: originalIndex,
        status: isSuccess ? 'success' : 'failed',
        fee,
        computeUnitsConsumed: computeUnits,
        accountKeys,
        logMessages: includeDetails ? tx.meta?.logMessages : undefined,
        balanceChanges,
        tokenTransfers,
        programInteractions
      };

      // Include full transaction details if requested
      if (includeDetails) {
        processedTransaction.fullTransaction = {
          message: {
            accountKeys: accountKeys.map((key: string, index: number) => ({
              pubkey: key,
              signer: index < (tx.transaction?.message?.header?.numRequiredSignatures || 0),
              writable: isWritableAccount(index, tx.transaction?.message?.header)
            })),
            instructions: tx.transaction?.message?.instructions?.map((ix: any) => ({
              programId: accountKeys[ix.programIdIndex],
              accounts: ix.accounts,
              data: ix.data,
              parsed: ix.parsed
            })) || []
          },
          signatures: tx.transaction?.signatures || []
        };
      }

      // Include error details if transaction failed
      if (!isSuccess) {
        processedTransaction.error = {
          err: tx.meta?.err,
          logs: tx.meta?.logMessages || []
        };
      }

      processedTransactions.push(processedTransaction);
    }

    // Calculate metrics
    const uniquePrograms = Array.from(programCounts.keys());
    const topPrograms = Array.from(programCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([programId, count]) => ({
        programId,
        name: getKnownProgramName(programId),
        count,
        percentage: (count / totalTransactions) * 100
      }));

    const response = {
      slot,
      blockhash: blockInfo.blockhash,
      blockTime: blockInfo.blockTime,
      blockHeight: blockInfo.blockHeight,
      transactions: processedTransactions,
      pagination: {
        total: totalTransactions,
        limit,
        offset,
        hasNext: offset + limit < totalTransactions,
        hasPrev: offset > 0
      },
      metrics: {
        successfulTransactions,
        failedTransactions,
        totalFees,
        totalComputeUnits,
        uniquePrograms,
        topPrograms
      }
    };

    // Use longer cache for finalized blocks
    const cacheSettings = blockInfo.blockHeight ? CACHE_SETTINGS.BLOCK_TRANSACTIONS : CACHE_SETTINGS.TRANSACTIONS;

    return sendSuccess(c, response, 200, cacheSettings);

  } catch (error) {
    console.error('Block transactions error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return sendError(c, ERROR_CODES.BLOCK_NOT_FOUND, 'Block not found');
    }
    
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch block transactions',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

// Helper function to analyze balance changes
function analyzeBalanceChanges(tx: any) {
  const balanceChanges = [];
  const preBalances = tx.meta?.preBalances || [];
  const postBalances = tx.meta?.postBalances || [];
  const accountKeys = tx.transaction?.message?.accountKeys || [];

  for (let i = 0; i < preBalances.length; i++) {
    const before = preBalances[i];
    const after = postBalances[i];
    const change = after - before;

    if (change !== 0 && accountKeys[i]) {
      balanceChanges.push({
        account: accountKeys[i],
        before,
        after,
        change
      });
    }
  }

  return balanceChanges;
}

// Helper function to extract token transfers
function extractTokenTransfers(tx: any): any[] {
  const transfers: any[] = [];
  
  // Simplified token transfer extraction
  // Real implementation would parse SPL token program instructions
  if (tx.meta?.innerInstructions) {
    for (const innerIx of tx.meta.innerInstructions) {
      for (const instruction of innerIx.instructions) {
        if (instruction.parsed && instruction.parsed.type === 'transfer') {
          const info = instruction.parsed.info;
          transfers.push({
            source: info.source,
            destination: info.destination,
            amount: parseInt(info.amount),
            mint: info.mint || 'SOL',
            decimals: info.decimals || 9,
            symbol: info.mint ? 'TOKEN' : 'SOL'
          });
        }
      }
    }
  }

  return transfers;
}

// Helper function to analyze program interactions
function analyzeProgramInteractions(tx: any, programCounts: Map<string, number>) {
  const interactions: any[] = [];
  const instructions = tx.transaction?.message?.instructions || [];
  const accountKeys = tx.transaction?.message?.accountKeys || [];

  for (const ix of instructions) {
    const programId = accountKeys[ix.programIdIndex];
    if (programId) {
      programCounts.set(programId, (programCounts.get(programId) || 0) + 1);
      
      interactions.push({
        programId,
        programName: getKnownProgramName(programId),
        instructionName: getInstructionName(programId, ix)
      });
    }
  }

  return interactions;
}

// Helper function to determine if an account is writable
function isWritableAccount(index: number, header: any): boolean {
  if (!header) return false;
  
  const numRequiredSignatures = header.numRequiredSignatures || 0;
  const numReadonlySignedAccounts = header.numReadonlySignedAccounts || 0;
  const numReadonlyUnsignedAccounts = header.numReadonlyUnsignedAccounts || 0;

  if (index < numRequiredSignatures) {
    // Signed account
    return index >= numReadonlySignedAccounts;
  } else {
    // Unsigned account
    return index < numRequiredSignatures + (header.accountKeys?.length || 0) - numReadonlyUnsignedAccounts;
  }
}

// Helper function to get instruction name
function getInstructionName(programId: string, instruction: any): string | undefined {
  // This would typically parse instruction data to determine the specific instruction
  // For now, return undefined
  return undefined;
}

// Helper function to get known program names
function getKnownProgramName(programId: string): string | undefined {
  const knownPrograms: Record<string, string> = {
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'SPL Token',
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Account',
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr': 'Memo',
    '11111111111111111111111111111112': 'System Program',
    'Vote111111111111111111111111111111111111111': 'Vote Program',
    'Stake11111111111111111111111111111111111111': 'Stake Program',
    'ComputeBudget111111111111111111111111111111': 'Compute Budget'
  };
  
  return knownPrograms[programId];
}

export default blockTransactionsRouter; 