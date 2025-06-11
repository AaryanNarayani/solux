import { Hono } from 'hono';
import { NetworkStatsQuerySchema } from '../schemas';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest } from '../utils/responses';

const networkRouter = new Hono();

networkRouter.get(
  '/stats',
  async (c) => {
    try {
      const rpcUrl = c.req.rpcUrl;
      if (!rpcUrl) {
        return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
      }

      // Make parallel RPC calls to get all required data
      const [
        slotInfo,
        epochInfo,
        supply,
        performanceData,
        validatorInfo
      ] = await Promise.all([
        makeRpcRequest(rpcUrl, 'getSlot', []),
        makeRpcRequest(rpcUrl, 'getEpochInfo', []),
        makeRpcRequest(rpcUrl, 'getSupply', []),
        makeRpcRequest(rpcUrl, 'getRecentPerformanceSamples', [1]),
        makeRpcRequest(rpcUrl, 'getVoteAccounts', [])
      ]);

      // Calculate TPS from performance data
      const performance = performanceData[0];
      const tps = performance ? performance.numTransactions / performance.samplePeriodSecs : 0;

      // Count validators
      const totalValidators = validatorInfo.current.length + validatorInfo.delinquent.length;
      const activeValidators = validatorInfo.current.length;
      const delinquentValidators = validatorInfo.delinquent.length;

      // Determine health status based on validator performance
      let health: 'healthy' | 'warning' | 'critical' = 'healthy';
      const delinquentPercentage = (delinquentValidators / totalValidators) * 100;
      
      if (delinquentPercentage > 20) {
        health = 'critical';
      } else if (delinquentPercentage > 10) {
        health = 'warning';
      }

      const networkStats = {
        currentSlot: slotInfo,
        epochInfo: {
          epoch: epochInfo.epoch,
          slotIndex: epochInfo.slotIndex,
          slotsInEpoch: epochInfo.slotsInEpoch,
          absoluteSlot: epochInfo.absoluteSlot,
          blockHeight: epochInfo.blockHeight
        },
        performance: {
          tps: Math.round(tps),
          avgTps1m: Math.round(tps), // Simplified - would need historical data for real averages
          avgTps5m: Math.round(tps)
        },
        validators: {
          total: totalValidators,
          active: activeValidators,
          delinquent: delinquentValidators
        },
        supply: {
          total: supply.value.total / 1000000000, // Convert lamports to SOL
          circulating: supply.value.circulating / 1000000000,
          nonCirculating: supply.value.nonCirculating / 1000000000
        },
        health,
        lastUpdated: new Date().toISOString()
      };

      return sendSuccess(c, networkStats);

    } catch (error) {
      console.error('Network stats error:', error);
      return sendError(
        c,
        ERROR_CODES.RPC_ERROR,
        'Failed to fetch network statistics',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
);

export default networkRouter; 