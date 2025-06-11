import type { NetworkStatsResponse } from '../../types/api';

export const mockNetworkStatsResponse: NetworkStatsResponse = {
  success: true,
  data: {
    currentSlot: 245678912,
    epochInfo: {
      epoch: 468,
      slotIndex: 432000,
      slotsInEpoch: 432000,
      absoluteSlot: 245678912,
      blockHeight: 223456789
    },
    performance: {
      tps: 1254,
      avgTps1m: 1189,
      avgTps5m: 1230
    },
    validators: {
      total: 1979,
      active: 1922,
      delinquent: 57
    },
    supply: {
      total: 534748495,
      circulating: 399451928,
      nonCirculating: 135296567
    },
    health: 'healthy'
  }
}; 