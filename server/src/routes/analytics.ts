import { Hono } from 'hono';
import {
  AnalyticsOverviewQuerySchema,
  TpsChartsQuerySchema,
  FeesChartsQuerySchema,
  ValidatorsChartsQuerySchema,
  ProgramAnalyticsQuerySchema,
  DefiAnalyticsQuerySchema
} from '../schemas/phase3';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

const analytics = new Hono();

// GET /api/analytics/overview
analytics.get('/overview', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      timeframe: c.req.query('timeframe') || '24h',
      includeHistory: c.req.query('includeHistory') || 'true'
    };

    const queryValidation = AnalyticsOverviewQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { timeframe, includeHistory } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get current epoch info
    const epochInfo = await makeRpcRequest(rpcUrl, 'getEpochInfo', []);
    
    // Get current slot and block time
    const slot = await makeRpcRequest(rpcUrl, 'getSlot', []);
    const blockTime = await makeRpcRequest(rpcUrl, 'getBlockTime', [slot]);
    
    // Get supply information
    const supply = await makeRpcRequest(rpcUrl, 'getSupply', []);
    
    // Get validator info
    const validators = await makeRpcRequest(rpcUrl, 'getVoteAccounts', []);
    
    // Get recent performance samples
    const perfSamples = await makeRpcRequest(rpcUrl, 'getRecentPerformanceSamples', [20]);
    
    // Calculate TPS metrics
    const tpsMetrics = calculateTpsMetrics(perfSamples);
    
    // Estimate transaction counts and fees
    const transactionStats = estimateTransactionStats(perfSamples, timeframe);
    
    // Mock data for advanced analytics (would come from stored data in production)
    const mockAdvancedData = generateMockAnalyticsData(timeframe, includeHistory);

    const response = {
      timeframe,
      network: {
        performance: {
          currentTps: tpsMetrics.current,
          avgTps: tpsMetrics.average,
          maxTps: tpsMetrics.max,
          minTps: tpsMetrics.min,
          tpsHistory: mockAdvancedData.tpsHistory
        },
        blocks: {
          totalBlocks: epochInfo.slotIndex,
          avgBlockTime: 0.4, // Solana target block time
          emptyBlocks: Math.floor(epochInfo.slotIndex * 0.05), // ~5% empty
          emptyBlockPercentage: 5.0
        },
        transactions: {
          total: transactionStats.total,
          successful: transactionStats.successful,
          failed: transactionStats.failed,
          successRate: transactionStats.successRate,
          failureReasons: [
            { reason: 'Insufficient funds', count: Math.floor(transactionStats.failed * 0.4), percentage: 40 },
            { reason: 'Program error', count: Math.floor(transactionStats.failed * 0.3), percentage: 30 },
            { reason: 'Timeout', count: Math.floor(transactionStats.failed * 0.2), percentage: 20 },
            { reason: 'Other', count: Math.floor(transactionStats.failed * 0.1), percentage: 10 }
          ]
        },
        fees: {
          totalFees: transactionStats.totalFees,
          avgFeePerTransaction: transactionStats.avgFee,
          medianFee: 0.000005, // 5000 lamports
          feeDistribution: [
            { range: '0-0.001', count: Math.floor(transactionStats.total * 0.8), percentage: 80 },
            { range: '0.001-0.01', count: Math.floor(transactionStats.total * 0.15), percentage: 15 },
            { range: '0.01-0.1', count: Math.floor(transactionStats.total * 0.04), percentage: 4 },
            { range: '0.1+', count: Math.floor(transactionStats.total * 0.01), percentage: 1 }
          ]
        },
        validators: {
          active: validators.current.length,
          delinquent: validators.delinquent.length,
          stakingApy: 6.8,
          totalStake: supply.value.total / 1e9,
          nakamatoCoefficient: 31 // Approximate for Solana
        }
      },
      programs: mockAdvancedData.programs,
      tokens: mockAdvancedData.tokens,
      defi: mockAdvancedData.defi,
      ...(includeHistory && mockAdvancedData.comparison ? { comparison: mockAdvancedData.comparison } : {})
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.ANALYTICS_OVERVIEW);
  } catch (error) {
    console.error('Analytics overview error:', error);
    return sendError(c, ERROR_CODES.ANALYTICS_DATA_UNAVAILABLE, 'Failed to fetch analytics overview');
  }
});

// GET /api/analytics/charts/tps
analytics.get('/charts/tps', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      timeframe: c.req.query('timeframe'),
      granularity: c.req.query('granularity'),
      includeAverage: c.req.query('includeAverage') || 'true'
    };

    const queryValidation = TpsChartsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { timeframe, granularity, includeAverage } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get performance samples
    const samples = await makeRpcRequest(rpcUrl, 'getRecentPerformanceSamples', [100]);
    
    // Auto-select granularity based on timeframe
    const selectedGranularity = granularity || getAutoGranularity(timeframe);
    
    // Generate chart data points
    const dataPoints = generateTpsChartData(samples, timeframe, selectedGranularity, includeAverage);
    
    // Calculate statistics
    const tpsValues = dataPoints.map(d => d.tps);
    const statistics = {
      current: tpsValues[tpsValues.length - 1] || 0,
      average: tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length,
      median: getMedian(tpsValues),
      max: { 
        value: Math.max(...tpsValues), 
        timestamp: dataPoints[tpsValues.indexOf(Math.max(...tpsValues))]?.timestamp || new Date().toISOString()
      },
      min: { 
        value: Math.min(...tpsValues), 
        timestamp: dataPoints[tpsValues.indexOf(Math.min(...tpsValues))]?.timestamp || new Date().toISOString()
      },
      percentiles: {
        p95: getPercentile(tpsValues, 95),
        p99: getPercentile(tpsValues, 99)
      }
    };

    // Calculate trends
    const recentValues = tpsValues.slice(-10);
    const olderValues = tpsValues.slice(-20, -10);
    const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    const response = {
      timeframe,
      granularity: selectedGranularity,
      dataPoints,
      statistics,
      trends: {
        direction: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable',
        changePercent: Math.round(changePercent * 100) / 100,
        volatility: calculateStandardDeviation(tpsValues)
      }
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.ANALYTICS_CHARTS);
  } catch (error) {
    console.error('TPS charts error:', error);
    return sendError(c, ERROR_CODES.CHART_GENERATION_FAILED, 'Failed to generate TPS chart data');
  }
});

// GET /api/analytics/charts/fees
analytics.get('/charts/fees', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      timeframe: c.req.query('timeframe'),
      granularity: c.req.query('granularity'),
      metric: c.req.query('metric') || 'total'
    };

    const queryValidation = FeesChartsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { timeframe, granularity, metric } = queryValidation.data;
    
    // Generate mock fee chart data
    const dataPoints = generateFeeChartData(timeframe, granularity || getAutoGranularity(timeframe), metric);
    
    const response = {
      timeframe,
      granularity: granularity || getAutoGranularity(timeframe),
      metric,
      dataPoints,
      distribution: [
        { feeRange: '0-0.001', count: 800000, percentage: 80, totalFees: 400 },
        { feeRange: '0.001-0.01', count: 150000, percentage: 15, totalFees: 750 },
        { feeRange: '0.01-0.1', count: 40000, percentage: 4, totalFees: 800 },
        { feeRange: '0.1+', count: 10000, percentage: 1, totalFees: 2000 }
      ],
      statistics: {
        totalCollected: 3950,
        averagePerTx: 0.00395,
        highestFee: {
          value: 0.5,
          signature: '5j7s...example',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        burnedFees: 1975, // 50% burned
        validatorRewards: 1975 // 50% to validators
      }
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.ANALYTICS_CHARTS);
  } catch (error) {
    console.error('Fee charts error:', error);
    return sendError(c, ERROR_CODES.CHART_GENERATION_FAILED, 'Failed to generate fee chart data');
  }
});

// GET /api/analytics/charts/validators
analytics.get('/charts/validators', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      timeframe: c.req.query('timeframe'),
      metric: c.req.query('metric') || 'count'
    };

    const queryValidation = ValidatorsChartsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { timeframe, metric } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get current validator information
    const validators = await makeRpcRequest(rpcUrl, 'getVoteAccounts', []);
    
    // Generate mock validator chart data
    const dataPoints = generateValidatorChartData(timeframe, metric);
    
    // Calculate top validators
    const topValidators = validators.current.slice(0, 20).map((validator: any, index: number) => ({
      identity: validator.nodePubkey,
      name: `Validator ${index + 1}`,
      voteAccount: validator.votePubkey,
      stake: validator.activatedStake / 1e9,
      stakePercent: (validator.activatedStake / validators.current.reduce((total: number, v: any) => total + v.activatedStake, 0)) * 100,
      commission: validator.commission,
      performance: {
        skippedSlots: Math.floor(Math.random() * 100),
        totalSlots: 10000,
        uptime: 95 + Math.random() * 5
      },
      apy: 6.5 + Math.random() * 2,
      location: {
        country: ['US', 'DE', 'SG', 'JP', 'UK'][Math.floor(Math.random() * 5)],
        city: ['New York', 'Berlin', 'Singapore', 'Tokyo', 'London'][Math.floor(Math.random() * 5)]
      }
    }));

    const response = {
      timeframe,
      metric,
      dataPoints,
      topValidators,
      decentralization: {
        nakamatoCoefficient: 31,
        herfindahlIndex: 0.008,
        giniCoefficient: 0.75,
        superminorityThreshold: 33.4
      },
      geography: [
        { country: 'US', validatorCount: 350, stakePercent: 35 },
        { country: 'DE', validatorCount: 200, stakePercent: 20 },
        { country: 'SG', validatorCount: 150, stakePercent: 15 },
        { country: 'JP', validatorCount: 120, stakePercent: 12 },
        { country: 'Other', validatorCount: 180, stakePercent: 18 }
      ]
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.ANALYTICS_CHARTS);
  } catch (error) {
    console.error('Validator charts error:', error);
    return sendError(c, ERROR_CODES.CHART_GENERATION_FAILED, 'Failed to generate validator chart data');
  }
});

// GET /api/analytics/programs
analytics.get('/programs', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      timeframe: c.req.query('timeframe') || '24h',
      category: c.req.query('category') || 'all',
      sortBy: c.req.query('sortBy') || 'transactions',
      limit: c.req.query('limit') || '50'
    };

    const queryValidation = ProgramAnalyticsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { timeframe, category, sortBy, limit } = queryValidation.data;
    
    // Generate mock program analytics data
    const programs = generateProgramAnalyticsData(timeframe, category, sortBy, limit);
    
    const response = {
      timeframe,
      programs,
      categoryBreakdown: [
        { category: 'defi', programCount: 45, totalTransactions: 5000000, totalUsers: 150000, marketShare: 45 },
        { category: 'nft', programCount: 30, totalTransactions: 2000000, totalUsers: 80000, marketShare: 20 },
        { category: 'gaming', programCount: 25, totalTransactions: 1500000, totalUsers: 60000, marketShare: 15 },
        { category: 'infrastructure', programCount: 20, totalTransactions: 1000000, totalUsers: 40000, marketShare: 10 },
        { category: 'other', programCount: 80, totalTransactions: 1000000, totalUsers: 50000, marketShare: 10 }
      ],
      trends: {
        fastestGrowing: [
          { programId: 'new1...example', name: 'New DeFi Protocol', growthRate: 150, metric: 'users' },
          { programId: 'grow2...example', name: 'Gaming Platform', growthRate: 120, metric: 'transactions' }
        ],
        newPrograms: [
          { programId: 'new3...example', name: 'NFT Marketplace', deployedAt: new Date(Date.now() - 86400000).toISOString(), firstActivityAt: new Date(Date.now() - 82800000).toISOString() }
        ]
      }
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.ANALYTICS_PROGRAMS);
  } catch (error) {
    console.error('Program analytics error:', error);
    return sendError(c, ERROR_CODES.ANALYTICS_DATA_UNAVAILABLE, 'Failed to fetch program analytics');
  }
});

// GET /api/analytics/defi
analytics.get('/defi', async (c) => {
  try {
    // Validate query parameters
    const queryParams = {
      timeframe: c.req.query('timeframe') || '24h',
      protocol: c.req.query('protocol'),
      includeHistorical: c.req.query('includeHistorical') || 'true'
    };

    const queryValidation = DefiAnalyticsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { timeframe, protocol, includeHistorical } = queryValidation.data;
    
    // Generate mock DeFi analytics data
    const defiData = generateDefiAnalyticsData(timeframe, protocol, includeHistorical);
    
    return sendSuccess(c, defiData, 200, CACHE_SETTINGS.ANALYTICS_DEFI);
  } catch (error) {
    console.error('DeFi analytics error:', error);
    return sendError(c, ERROR_CODES.ANALYTICS_DATA_UNAVAILABLE, 'Failed to fetch DeFi analytics');
  }
});

// Helper functions

function calculateTpsMetrics(perfSamples: any[]) {
  if (!perfSamples || perfSamples.length === 0) {
    return { current: 0, average: 0, max: 0, min: 0 };
  }

  const tpsValues = perfSamples.map(sample => 
    sample.numTransactions / (sample.samplePeriodSecs || 1)
  );

  return {
    current: tpsValues[0] || 0,
    average: tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length,
    max: Math.max(...tpsValues),
    min: Math.min(...tpsValues)
  };
}

function estimateTransactionStats(perfSamples: any[], timeframe: string) {
  const totalTx = perfSamples.reduce((sum, sample) => sum + (sample.numTransactions || 0), 0);
  const failed = Math.floor(totalTx * 0.05); // ~5% failure rate
  const successful = totalTx - failed;
  
  return {
    total: totalTx,
    successful,
    failed,
    successRate: (successful / totalTx) * 100,
    totalFees: totalTx * 0.000005, // Average 5000 lamports per tx
    avgFee: 0.000005
  };
}

function getAutoGranularity(timeframe: string): string {
  switch (timeframe) {
    case '1h':
    case '6h':
      return 'minute';
    case '24h':
      return 'hour';
    case '7d':
    case '30d':
      return 'day';
    default:
      return 'hour';
  }
}

function generateTpsChartData(samples: any[], timeframe: string, granularity: string, includeAverage: boolean) {
  const dataPointCount = getDataPointCount(timeframe, granularity);
  const now = new Date();
  const interval = getIntervalMs(granularity);
  
  return Array.from({ length: dataPointCount }, (_, i) => {
    const timestamp = new Date(now.getTime() - (dataPointCount - 1 - i) * interval).toISOString();
    const tps = 800 + Math.random() * 1200 + Math.sin(i / 10) * 200;
    const blockCount = Math.floor(tps * (interval / 1000) * 0.4); // Approximate blocks per interval
    
    return {
      timestamp,
      tps: Math.round(tps),
      ...(includeAverage && { movingAverage: Math.round(tps * (0.9 + Math.random() * 0.2)) }),
      blockCount,
      transactionCount: Math.floor(tps * (interval / 1000))
    };
  });
}

function generateFeeChartData(timeframe: string, granularity: string, metric: string) {
  const dataPointCount = getDataPointCount(timeframe, granularity);
  const now = new Date();
  const interval = getIntervalMs(granularity);
  
  return Array.from({ length: dataPointCount }, (_, i) => {
    const timestamp = new Date(now.getTime() - (dataPointCount - 1 - i) * interval).toISOString();
    const txCount = 1000 + Math.random() * 2000;
    const totalFees = txCount * (0.000003 + Math.random() * 0.000004);
    
    return {
      timestamp,
      totalFees: Math.round(totalFees * 1000000) / 1000000,
      averageFee: Math.round((totalFees / txCount) * 1000000) / 1000000,
      medianFee: 0.000005,
      transactionCount: Math.floor(txCount),
      feePercentiles: {
        p50: 0.000005,
        p90: 0.000008,
        p95: 0.000012
      }
    };
  });
}

function generateValidatorChartData(timeframe: string, metric: string) {
  const dataPointCount = getDataPointCount(timeframe, 'hour');
  const now = new Date();
  
  return Array.from({ length: dataPointCount }, (_, i) => {
    const timestamp = new Date(now.getTime() - (dataPointCount - 1 - i) * 3600000).toISOString();
    
    return {
      timestamp,
      activeValidators: 1400 + Math.floor(Math.random() * 100),
      delinquentValidators: Math.floor(Math.random() * 20),
      totalStake: 400000000 + Math.random() * 10000000,
      averageStake: 285000 + Math.random() * 50000,
      skippedSlots: Math.floor(Math.random() * 100),
      performance: 95 + Math.random() * 5
    };
  });
}

function generateMockAnalyticsData(timeframe: string, includeHistory: boolean) {
  return {
    tpsHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      value: 800 + Math.random() * 1200
    })),
    programs: {
      mostActive: [
        { programId: 'prog1...example', name: 'Serum DEX', transactionCount: 500000, uniqueUsers: 15000, totalFees: 2500, category: 'defi' },
        { programId: 'prog2...example', name: 'Magic Eden', transactionCount: 300000, uniqueUsers: 8000, totalFees: 1500, category: 'nft' }
      ],
      newPrograms: [
        { programId: 'new1...example', name: 'New Protocol', deployedAt: new Date(Date.now() - 86400000).toISOString(), firstTransactionAt: new Date(Date.now() - 82800000).toISOString() }
      ]
    },
    tokens: {
      newTokens: 250,
      activeTokens: 5000,
      totalTransfers: 1500000,
      topTokensByVolume: [
        { mint: 'EPjF...USDC', symbol: 'USDC', volume: 50000000, transfers: 250000, uniqueHolders: 100000 },
        { mint: 'So11...SOL', symbol: 'SOL', volume: 30000000, transfers: 180000, uniqueHolders: 80000 }
      ]
    },
    defi: {
      totalValueLocked: 2500000000,
      dexVolume: 500000000,
      topDexes: [
        { program: 'seram...dex', name: 'Serum', volume: 200000000, trades: 50000 },
        { program: 'orca...dex', name: 'Orca', volume: 150000000, trades: 35000 }
      ],
      liquidations: {
        count: 150,
        totalValue: 5000000,
        topProtocols: [
          { protocol: 'Mango', count: 80, value: 3000000 },
          { protocol: 'Solend', count: 70, value: 2000000 }
        ]
      }
    },
    ...(includeHistory && {
      comparison: {
        previousPeriod: {
          tps: { value: 900, change: 5.5 },
          transactions: { value: 8500000, change: 12.3 },
          fees: { value: 42500, change: 8.7 },
          activeAddresses: { value: 280000, change: 15.2 }
        }
      }
    })
  };
}

function generateProgramAnalyticsData(timeframe: string, category: string, sortBy: string, limit: number) {
  const programs = [
    { programId: 'serum...dex', name: 'Serum DEX', category: 'defi', verified: true, transactions: 500000, uniqueUsers: 15000, totalFees: 2500, volume: 200000000, successRate: 95 },
    { programId: 'magic...nft', name: 'Magic Eden', category: 'nft', verified: true, transactions: 300000, uniqueUsers: 8000, totalFees: 1500, successRate: 98 },
    { programId: 'orca...dex', name: 'Orca', category: 'defi', verified: true, transactions: 250000, uniqueUsers: 12000, totalFees: 1250, volume: 150000000, successRate: 96 }
  ];

  return programs
    .filter(p => category === 'all' || p.category === category)
    .sort((a, b) => {
      switch (sortBy) {
        case 'users': return b.uniqueUsers - a.uniqueUsers;
        case 'fees': return b.totalFees - a.totalFees;
        case 'volume': return (b.volume || 0) - (a.volume || 0);
        default: return b.transactions - a.transactions;
      }
    })
    .slice(0, limit)
    .map(p => ({
      ...p,
      metrics: {
        transactions: p.transactions,
        uniqueUsers: p.uniqueUsers,
        totalFees: p.totalFees,
        volume: p.volume,
        successRate: p.successRate
      },
      growth: {
        transactionsChange: Math.random() * 50 - 10,
        usersChange: Math.random() * 30 - 5,
        volumeChange: Math.random() * 40 - 15
      }
    }));
}

function generateDefiAnalyticsData(timeframe: string, protocol?: string, includeHistorical?: boolean) {
  return {
    timeframe,
    overview: {
      totalValueLocked: 2500000000,
      tvlChange24h: 5.2,
      totalVolume: 500000000,
      volumeChange24h: 12.5,
      activeProtocols: 45,
      totalUsers: 150000
    },
    protocols: [
      {
        name: 'Serum',
        programId: 'serum...dex',
        category: 'dex' as const,
        tvl: 800000000,
        tvlChange24h: 3.2,
        volume24h: 200000000,
        volumeChange24h: 15.5,
        users24h: 5000,
        transactions24h: 50000,
        fees24h: 100000,
        tokens: [
          { mint: 'EPjF...USDC', symbol: 'USDC', tvl: 400000000, volume: 100000000 },
          { mint: 'So11...SOL', symbol: 'SOL', tvl: 300000000, volume: 80000000 }
        ]
      }
    ],
    dexes: {
      totalVolume: 500000000,
      totalTrades: 250000,
      topDexes: [
        {
          name: 'Serum',
          programId: 'serum...dex',
          volume24h: 200000000,
          trades24h: 100000,
          uniqueTraders: 5000,
          marketShare: 40,
          topPairs: [
            { baseToken: 'SOL', quoteToken: 'USDC', volume: 80000000, price: 21.5, priceChange24h: 2.5 }
          ]
        }
      ]
    },
    lending: {
      totalBorrowed: 800000000,
      totalSupplied: 1200000000,
      avgBorrowRate: 8.5,
      avgSupplyRate: 5.2,
      protocols: [
        {
          name: 'Solend',
          programId: 'solend...lending',
          totalBorrowed: 500000000,
          totalSupplied: 750000000,
          utilizationRate: 66.7
        }
      ]
    },
    ...(includeHistorical && {
      tvlHistory: Array.from({ length: 30 }, (_, i) => ({
        timestamp: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
        tvl: 2400000000 + Math.random() * 200000000,
        protocols: [
          { name: 'Serum', tvl: 780000000 + Math.random() * 40000000 }
        ]
      }))
    })
  };
}

function getDataPointCount(timeframe: string, granularity: string): number {
  const timeframeHours = {
    '1h': 1,
    '6h': 6,
    '24h': 24,
    '7d': 168,
    '30d': 720
  }[timeframe] || 24;

  const granularityHours = {
    'minute': 1/60,
    'hour': 1,
    'day': 24
  }[granularity] || 1;

  return Math.ceil(timeframeHours / granularityHours);
}

function getIntervalMs(granularity: string): number {
  return {
    'minute': 60000,
    'hour': 3600000,
    'day': 86400000
  }[granularity] || 3600000;
}

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function getPercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDifferences.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

export default analytics; 