// API Response Types for Solux Block Explorer
// Based on Phase 1-3 API Specifications

// Common Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

// ----------------------------
// Phase 1: Core APIs
// ----------------------------

// GET /api/network/stats
export interface NetworkStatsResponse {
  success: boolean;
  data: {
    currentSlot: number;
    epochInfo: {
      epoch: number;
      slotIndex: number;
      slotsInEpoch: number;
      absoluteSlot: number;
      blockHeight: number;
    };
    performance: {
      tps: number;
      avgTps1m: number;
      avgTps5m: number;
    };
    validators: {
      total: number;
      active: number;
      delinquent: number;
    };
    supply: {
      total: number;
      circulating: number;
      nonCirculating: number;
    };
    health: 'healthy' | 'warning' | 'critical';
  };
}

// GET /api/search
export interface SearchParams {
  query: string;
  type?: 'all' | 'transaction' | 'address' | 'block' | 'token';
}

export interface SearchResponse {
  success: boolean;
  data: {
    type: 'transaction' | 'address' | 'block' | 'token' | 'unknown';
    matches?: {
      transactions?: Array<{
        signature: string;
        blockTime: number;
        slot: number;
        fee: number;
        status: 'success' | 'failure';
      }>;
      addresses?: Array<{
        address: string;
        type: 'wallet' | 'token' | 'program' | 'system';
        owner?: string;
        balance?: number;
      }>;
      blocks?: Array<{
        slot: number;
        blockTime: number;
        blockHeight: number;
        transactionCount: number;
      }>;
      tokens?: Array<{
        mint: string;
        name: string;
        symbol: string;
        decimals: number;
        totalSupply?: number;
      }>;
    };
    exactMatch?: {
      type: 'transaction' | 'address' | 'block' | 'token';
      data: any; // Will be one of the types above
    };
  };
}

// GET /api/transactions/{signature}
export interface TransactionResponse {
  success: boolean;
  data: {
    signature: string;
    slot: number;
    blockTime: number;
    blockHeight?: number;
    fee: number;
    status: 'success' | 'failure';
    recentBlockhash: string;
    confirmations: number;
    instructions: Array<{
      programId: string;
      accounts: string[];
      data: string;
      parsed?: any;
    }>;
    signer: string;
    innerInstructions: Array<{
      index: number;
      instructions: Array<{
        programId: string;
        accounts: string[];
        data: string;
        parsed?: any;
      }>;
    }>;
    logs: string[];
    accountsData: Record<string, {
      owner: string;
      lamports: number;
      executable: boolean;
      rentEpoch: number;
      data: string;
    }>;
    tokenBalanceChanges: Array<{
      address: string;
      mint: string;
      owner: string;
      preAmount: string;
      postAmount: string;
      decimals: number;
    }>;
    solBalanceChanges: Array<{
      address: string;
      preAmount: number;
      postAmount: number;
    }>;
  };
}

// GET /api/blocks/{slot}
export interface BlockResponse {
  success: boolean;
  data: {
    slot: number;
    parentSlot: number;
    blockTime: number;
    blockHeight: number;
    blockhash: string;
    previousBlockhash: string;
    leader: string;
    totalFees?: number;
    rewards: Array<{
      pubkey: string;
      lamports: number;
      postBalance: number;
      rewardType: string;
    }>;
    transactionCount: number;
    transactions: Array<{
      signature: string;
      fee: number;
      status: 'success' | 'failure';
      signer: string;
      programIds: string[];
    }>;
    previousSlot?: number;
    nextSlot?: number;
  };
}

// GET /api/addresses/{address}
export interface AddressResponse {
  success: boolean;
  data: {
    address: string;
    owner: string;
    balance: number;
    executable: boolean;
    rentEpoch: number;
    programId?: string;
    type: 'wallet' | 'program' | 'token' | 'system';
    tokens: Array<{
      mint: string;
      name: string;
      symbol: string;
      amount: string;
      decimals: number;
      tokenAccount: string;
      price?: number;
      priceChangePercentage24h?: number;
      value?: number;
    }>;
    nftCount: number;
    transactions: {
      total: number;
      recent: Array<{
        signature: string;
        blockTime: number;
        slot: number;
        fee: number;
        status: 'success' | 'failure';
        type: 'in' | 'out' | 'both';
      }>;
    };
    programInfo?: {
      name?: string;
      deployedOn: number;
      txCount?: number;
      upgradeable: boolean;
    };
  };
}

// ----------------------------
// Phase 2: Enhanced Features
// ----------------------------

// GET /api/addresses/{address}/transactions
export interface AddressTransactionsParams {
  limit?: number;
  before?: string;
  until?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  filter?: 'all' | 'sent' | 'received' | 'program';
  program?: string;
}

export interface AddressTransactionsResponse {
  success: boolean;
  data: {
    address: string;
    transactions: Array<{
      signature: string;
      blockTime: number;
      slot: number;
      fee: number;
      status: 'success' | 'failure';
      type: string;
      confirmationStatus?: string;
      computeUnitsConsumed?: number;
      balanceChange?: {
        before: number;
        after: number;
        change: number;
      };
      tokenTransfers?: any[];
      programInteractions?: Array<{
        programId: string;
        programName?: string;
        accounts?: string[];
      }>;
      memo?: string | null;
      amount?: number;
      counterparties?: string[];
    }>;
    pagination: {
      limit?: number;
      hasNext: boolean;
      hasPrevious: boolean;
      nextCursor?: string;
      prevCursor?: string;
      total?: number;
    };
    summary?: {
      totalTransactions: number;
      successfulTransactions: number;
      failedTransactions: number;
      totalFeePaid: number;
      totalReceived: number;
      totalSent: number;
    }
  };
}

// GET /api/addresses/{address}/tokens
export interface AddressTokensParams {
  includeNfts?: boolean;
  includePrices?: boolean;
  includeZeroBalance?: boolean;
}

export interface AddressTokensResponse {
  success: boolean;
  data: {
    address: string;
    totalValue?: number;
    tokens: Array<{
      mint: string;
      name: string;
      symbol: string;
      amount: string;
      decimals: number;
      tokenAccount: string;
      logo?: string;
      price?: number;
      priceChangePercentage24h?: number;
      value?: number;
      type: 'fungible' | 'nft';
      nftMetadata?: {
        name: string;
        image: string;
        collection?: string;
        attributes?: Array<{
          trait_type: string;
          value: string;
        }>;
      };
    }>;
  };
}

// GET /api/blocks/{slot}/transactions
export interface BlockTransactionsParams {
  limit?: number;
  offset?: number;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export interface BlockTransactionsResponse {
  success: boolean;
  data: {
    slot: number;
    blockTime: number;
    transactions: Array<{
      signature: string;
      fee: number;
      status: 'success' | 'failure';
      signer: string;
      programIds: string[];
      instructions: {
        count: number;
        programs: Array<{
          programId: string;
          count: number;
        }>;
      };
    }>;
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

// ----------------------------
// Phase 3: Advanced Analytics
// ----------------------------

// GET /api/analytics/overview
export interface AnalyticsOverviewResponse {
  success: boolean;
  data: {
    timeframe: string;
    network: {
      performance: {
        currentTps: number;
        avgTps: number;
        maxTps: number;
        minTps: number;
        tpsHistory: Array<{
          timestamp: string;
          value: number;
        }>;
      };
      blocks: {
        total: number;
        averageBlockTime: number;
        blockTimeHistory: Array<{
          timestamp: string;
          value: number;
        }>;
      };
      transactions: {
        total: number;
        success: number;
        failed: number;
        transactionsByProgram: Array<{
          programId: string;
          programName?: string;
          count: number;
          percentage: number;
        }>;
      };
      fees: {
        total: number;
        average: number;
        feeHistory: Array<{
          timestamp: string;
          value: number;
        }>;
      };
      supply: {
        total: number;
        circulating: number;
        staked: number;
        stakingAPY: number;
      };
    };
    comparison?: {
      tps: {
        change: number;
        trend: 'up' | 'down' | 'stable';
      };
      transactions: {
        change: number;
        trend: 'up' | 'down' | 'stable';
      };
      fees: {
        change: number;
        trend: 'up' | 'down' | 'stable';
      };
    };
  };
}

// GET /api/analytics/charts/tps
export interface TpsChartParams {
  timeframe: '1h' | '24h' | '7d' | '30d';
  resolution: 'minute' | 'hour' | 'day';
}

export interface TpsChartResponse {
  success: boolean;
  data: {
    timeframe: string;
    resolution: string;
    series: Array<{
      timestamp: string;
      tps: number;
    }>;
    statistics: {
      currentTps: number;
      maxTps: number;
      minTps: number;
      avgTps: number;
      maxTpsTime: string;
      timeAbove90Pct: number; // seconds
      volatility: number; // 0-1 measure of how much TPS varies
    };
  };
}

// GET /api/analytics/charts/fees
export interface FeesChartResponse {
  success: boolean;
  data: {
    timeframe: string;
    series: Array<{
      timestamp: string;
      avgFee: number;
      totalFees: number;
    }>;
    summary: {
      totalFees: number;
      averageFee: number;
      medianFee: number;
      maxFee: number;
      minFee: number;
      feeDistribution: Array<{
        range: string; // e.g., "0-0.000001", "0.000001-0.00001", etc.
        count: number;
        percentage: number;
      }>;
      programFees: Array<{
        program: string;
        programName?: string;
        totalFees: number;
        percentage: number;
      }>;
    };
  };
}

// GET /api/analytics/charts/validators
export interface ValidatorsChartResponse {
  success: boolean;
  data: {
    overview: {
      totalValidators: number;
      activeValidators: number;
      delinquentValidators: number;
      totalStake: number;
      averageStake: number;
      averageAPY: number;
    };
    topValidators: Array<{
      identity: string;
      name?: string;
      stake: number;
      commission: number;
      apy: number;
      voteAccount: string;
      activatedStake: number;
      delinquent: boolean;
      skipRate: number;
      credits: number;
    }>;
    stakeDistribution: Array<{
      validatorCount: number;
      totalStake: number;
      stakePercentage: number;
      category: string; // e.g., "Top 10", "11-50", etc.
    }>;
    geographicDistribution?: Array<{
      region: string;
      validatorCount: number;
      totalStake: number;
      stakePercentage: number;
    }>;
  };
}

// GET /api/tokens/{mint}
export interface TokenResponse {
  success: boolean;
  data: {
    mint: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    marketData?: {
      price: number;
      priceChangePercentage24h: number;
      volume24h: number;
      marketCap: number;
      fullyDilutedValuation: number;
      allTimeHigh: number;
      allTimeHighDate: string;
      allTimeLow: number;
      allTimeLowDate: string;
    };
    metadata: {
      description?: string;
      image?: string;
      externalUrl?: string;
      twitterUrl?: string;
      discordUrl?: string;
      telegramUrl?: string;
    };
    type: 'fungible' | 'nft';
    nftDetails?: {
      collection?: string;
      attributes?: Array<{
        trait_type: string;
        value: string;
        rarity?: number;
      }>;
      rarityRank?: number;
      lastSalePrice?: number;
      lastSaleDate?: string;
      owner: string;
    };
    tokenHolders: {
      count: number;
      largestHolders: Array<{
        address: string;
        amount: string;
        percentage: number;
      }>;
      distributionChart: Array<{
        range: string;
        holderCount: number;
        percentage: number;
      }>;
    };
    transferHistory: {
      total: number;
      history: Array<{
        signature: string;
        blockTime: number;
        fromAddress: string;
        toAddress: string;
        amount: string;
        decimals: number;
      }>;
    };
  };
}

// GET /api/addresses/{address}/nfts
export interface AddressNftsParams {
  includeMetadata?: boolean;
  collections?: string[];
  limit?: number;
  offset?: number;
}

export interface AddressNftsResponse {
  success: boolean;
  data: {
    address: string;
    nftsCount: number;
    collectionsCount: number;
    estimatedValue?: number;
    collections: Array<{
      name: string;
      image?: string;
      count: number;
      floorPrice?: number;
      totalValue?: number;
    }>;
    nfts: Array<{
      mint: string;
      name: string;
      image: string;
      collection?: string;
      tokenAccount: string;
      attributes?: Array<{
        trait_type: string;
        value: string;
        rarity?: number;
      }>;
      rarityRank?: number;
      estimatedValue?: number;
      lastSalePrice?: number;
      lastSaleDate?: string;
    }>;
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

// GET /api/analytics/programs
export interface ProgramsAnalyticsResponse {
  success: boolean;
  data: {
    timeframe: string;
    programsCount: number;
    totalTransactions: number;
    programs: Array<{
      programId: string;
      name?: string;
      description?: string;
      website?: string;
      transactions: number;
      transactionsPercentage: number;
      uniqueUsers: number;
      trend: 'up' | 'down' | 'stable';
      change: number;
      avgFee: number;
      totalFees: number;
      category?: string;
      transactionVolume?: number;
    }>;
    categories: Array<{
      name: string;
      programCount: number;
      transactions: number;
      transactionsPercentage: number;
      uniqueUsers: number;
    }>;
    historicalTrends: Array<{
      timestamp: string;
      topPrograms: Array<{
        programId: string;
        name?: string;
        transactions: number;
        percentage: number;
      }>;
    }>;
  };
}

// GET /api/analytics/defi
export interface DefiAnalyticsResponse {
  success: boolean;
  data: {
    overview: {
      totalValueLocked: number;
      totalVolume24h: number;
      uniqueUsers24h: number;
      totalTransactions24h: number;
      tvlChange24h: number;
      volumeChange24h: number;
    };
    protocols: Array<{
      name: string;
      programId: string;
      category: string;
      tvl: number;
      tvlChange24h: number;
      volume24h: number;
      volumeChange24h: number;
      transactions24h: number;
      uniqueUsers24h: number;
    }>;
    tvlChart: Array<{
      timestamp: string;
      totalTvl: number;
      byProtocol: Array<{
        name: string;
        tvl: number;
      }>;
    }>;
    volumeChart: Array<{
      timestamp: string;
      totalVolume: number;
      byProtocol: Array<{
        name: string;
        volume: number;
      }>;
    }>;
    categories: Array<{
      name: string;
      protocolCount: number;
      tvl: number;
      tvlPercentage: number;
      volume24h: number;
    }>;
  };
} 