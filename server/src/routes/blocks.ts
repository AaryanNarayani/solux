import { Hono } from 'hono';
import { BlockParamsSchema, BlockQuerySchema } from '../schemas';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest } from '../utils/responses';

const blocksRouter = new Hono();

blocksRouter.get('/:slot', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = BlockParamsSchema.safeParse({
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
      commitment: c.req.query('commitment') || 'confirmed',
      transactionDetails: c.req.query('transactionDetails') || 'signatures',
      rewards: c.req.query('rewards') || 'true'
    };

    const queryValidation = BlockQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { slot } = paramsValidation.data;
    const { commitment, transactionDetails, rewards } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get block details
    const blockInfo = await makeRpcRequest(rpcUrl, 'getBlock', [
      slot,
      {
        encoding: 'json',
        commitment,
        transactionDetails,
        rewards
      }
    ]);

    if (!blockInfo) {
      return sendError(c, ERROR_CODES.BLOCK_NOT_FOUND, 'Block not found');
    }

    // Get navigation info (previous and next slots)
    const [prevSlotInfo, nextSlotInfo] = await Promise.all([
      getPreviousSlot(rpcUrl, slot),
      getNextSlot(rpcUrl, slot)
    ]);

    // Process transactions based on detail level
    const transactions = [];
    let totalFees = 0;
    let computeUnitsTotal = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;

    if (blockInfo.transactions) {
      for (const tx of blockInfo.transactions) {
        const fee = tx.meta?.fee || 0;
        const computeUnits = tx.meta?.computeUnitsConsumed || 0;
        const isSuccess = !tx.meta?.err;

        totalFees += fee;
        computeUnitsTotal += computeUnits;
        
        if (isSuccess) {
          successfulTransactions++;
        } else {
          failedTransactions++;
        }

        if (transactionDetails === 'full') {
          transactions.push({
            signature: tx.transaction?.signatures?.[0] || '',
            status: isSuccess ? 'success' : 'failed',
            fee,
            computeUnitsConsumed: computeUnits,
            accountKeys: tx.transaction?.message?.accountKeys || [],
            logMessages: tx.meta?.logMessages || [],
            transaction: tx.transaction
          });
        } else if (transactionDetails === 'signatures') {
          transactions.push({
            signature: tx.transaction?.signatures?.[0] || '',
            status: isSuccess ? 'success' : 'failed',
            fee,
            computeUnitsConsumed: computeUnits
          });
        }
      }
    }

    // Process rewards if included
    let rewardsData: any[] = [];
    if (rewards && blockInfo.rewards) {
      rewardsData = blockInfo.rewards.map((reward: any) => ({
        pubkey: reward.pubkey,
        lamports: reward.lamports,
        postBalance: reward.postBalance,
        rewardType: reward.rewardType || 'unknown',
        commission: reward.commission
      }));
    }

    const blockResponse = {
      slot,
      blockhash: blockInfo.blockhash,
      parentSlot: blockInfo.parentSlot,
      blockTime: blockInfo.blockTime,
      blockHeight: blockInfo.blockHeight,
      previousBlockhash: blockInfo.previousBlockhash,
      transactions,
      rewards: rewards ? rewardsData : undefined,
      navigation: {
        prevSlot: prevSlotInfo,
        nextSlot: nextSlotInfo
      },
      metrics: {
        transactionCount: blockInfo.transactions?.length || 0,
        totalFees,
        computeUnitsTotal,
        successfulTransactions,
        failedTransactions
      }
    };

    return sendSuccess(c, blockResponse);

  } catch (error) {
    console.error('Block fetch error:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return sendError(c, ERROR_CODES.BLOCK_NOT_FOUND, 'Block not found');
    }
    
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch block',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

async function getPreviousSlot(rpcUrl: string, slot: number): Promise<number | null> {
  try {
    // Get blocks from a range before this slot
    const blocks = await makeRpcRequest(rpcUrl, 'getBlocks', [
      Math.max(0, slot - 10),
      slot - 1
    ]);
    
    return blocks.length > 0 ? blocks[blocks.length - 1] : null;
  } catch {
    return null;
  }
}

async function getNextSlot(rpcUrl: string, slot: number): Promise<number | null> {
  try {
    // Get blocks from a range after this slot
    const blocks = await makeRpcRequest(rpcUrl, 'getBlocks', [
      slot + 1,
      slot + 10
    ]);
    
    return blocks.length > 0 ? blocks[0] : null;
  } catch {
    return null;
  }
}

export default blocksRouter; 