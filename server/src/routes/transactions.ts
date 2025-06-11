import { Hono } from 'hono';
import { TransactionParamsSchema, TransactionQuerySchema } from '../schemas';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest } from '../utils/responses';

const transactionsRouter = new Hono();

transactionsRouter.get('/:signature', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = TransactionParamsSchema.safeParse({
      signature: c.req.param('signature')
    });

    if (!paramsValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_SIGNATURE,
        'Invalid transaction signature',
        paramsValidation.error.issues
      );
    }

    // Validate query parameters
    const queryParams = {
      commitment: c.req.query('commitment') || 'confirmed',
      maxSupportedTransactionVersion: c.req.query('maxSupportedTransactionVersion') || '0'
    };

    const queryValidation = TransactionQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { signature } = paramsValidation.data;
    const { commitment, maxSupportedTransactionVersion } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get transaction details
    const txInfo = await makeRpcRequest(rpcUrl, 'getTransaction', [
      signature,
      {
        encoding: 'json',
        commitment,
        maxSupportedTransactionVersion
      }
    ]);

    if (!txInfo) {
      return sendError(c, ERROR_CODES.TRANSACTION_NOT_FOUND, 'Transaction not found');
    }

    // Process balance changes
    const balanceChanges = [];
    if (txInfo.meta?.preBalances && txInfo.meta?.postBalances) {
      for (let i = 0; i < txInfo.meta.preBalances.length; i++) {
        const before = txInfo.meta.preBalances[i];
        const after = txInfo.meta.postBalances[i];
        const change = after - before;
        
        if (change !== 0 && txInfo.transaction?.message?.accountKeys?.[i]) {
          balanceChanges.push({
            account: txInfo.transaction.message.accountKeys[i],
            before,
            after,
            change
          });
        }
      }
    }

    // Process token transfers (simplified - would need SPL token parsing)
    const tokenTransfers: any[] = [];
    if (txInfo.meta?.innerInstructions) {
      // This would need more sophisticated parsing for real token transfers
      // For now, we'll leave it empty as it requires parsing instruction data
    }

    // Determine confirmation status
    let confirmationStatus: 'processed' | 'confirmed' | 'finalized' = 'confirmed';
    // This would typically come from the RPC response or additional calls

    const transactionResponse = {
      signature,
      status: txInfo.meta?.err ? 'failed' : 'success',
      confirmationStatus,
      blockTime: txInfo.blockTime,
      slot: txInfo.slot,
      block: txInfo.blockTime ? await getBlockHeight(rpcUrl, txInfo.slot) : 0,
      fee: txInfo.meta?.fee || 0,
      computeUnitsConsumed: txInfo.meta?.computeUnitsConsumed || 0,
      recentBlockhash: txInfo.transaction?.message?.recentBlockhash || '',
      transaction: {
        message: {
          accountKeys: (txInfo.transaction?.message?.accountKeys || []).map((key: string, index: number) => ({
            pubkey: key,
            signer: index < (txInfo.transaction?.message?.header?.numRequiredSignatures || 0),
            writable: index < (txInfo.transaction?.message?.header?.numReadonlySignedAccounts || 0) ||
                     (index >= (txInfo.transaction?.message?.header?.numRequiredSignatures || 0) &&
                      index < (txInfo.transaction?.message?.accountKeys?.length || 0) - 
                             (txInfo.transaction?.message?.header?.numReadonlyUnsignedAccounts || 0)),
            source: 'transaction'
          })),
          instructions: (txInfo.transaction?.message?.instructions || []).map((ix: any) => ({
            programId: txInfo.transaction?.message?.accountKeys?.[ix.programIdIndex] || '',
            accounts: ix.accounts || [],
            data: ix.data || '',
            parsed: ix.parsed || undefined
          })),
          addressTableLookups: txInfo.transaction?.message?.addressTableLookups || []
        },
        signatures: txInfo.transaction?.signatures || []
      },
      balanceChanges,
      tokenTransfers,
      logs: txInfo.meta?.logMessages || [],
      error: txInfo.meta?.err ? {
        err: txInfo.meta.err,
        logs: txInfo.meta.logMessages || []
      } : undefined
    };

    return sendSuccess(c, transactionResponse);

  } catch (error) {
    console.error('Transaction fetch error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return sendError(c, ERROR_CODES.TRANSACTION_NOT_FOUND, 'Transaction not found');
    }
    
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch transaction',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

async function getBlockHeight(rpcUrl: string, slot: number): Promise<number> {
  try {
    const blockInfo = await makeRpcRequest(rpcUrl, 'getBlock', [
      slot,
      { transactionDetails: 'none', rewards: false }
    ]);
    return blockInfo?.blockHeight || 0;
  } catch {
    return 0;
  }
}

export default transactionsRouter; 