import { Hono } from 'hono';
import { TokenParamsSchema, TokenQuerySchema } from '../schemas/phase3';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

const tokens = new Hono();

// GET /api/tokens/{mint}
tokens.get('/:mint', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = TokenParamsSchema.safeParse({
      mint: c.req.param('mint')
    });

    if (!paramsValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid token mint address',
        paramsValidation.error.issues
      );
    }

    // Validate query parameters
    const queryParams = {
      includeHolders: c.req.query('includeHolders') || 'false',
      includeHistory: c.req.query('includeHistory') || 'true',
      timeframe: c.req.query('timeframe') || '7d'
    };

    const queryValidation = TokenQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { mint } = paramsValidation.data;
    const { includeHolders, includeHistory, timeframe } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

      // Get token supply information
      const supply = await makeRpcRequest(rpcUrl, 'getTokenSupply', [mint]);
      
      // Get token account info (mint authority, freeze authority, etc.)
      const accountInfo = await makeRpcRequest(rpcUrl, 'getAccountInfo', [mint, { encoding: 'jsonParsed' }]);
      
      if (!accountInfo) {
        return sendError(c, ERROR_CODES.TOKEN_NOT_FOUND, 'Token mint not found');
      }

      const mintInfo = accountInfo.data.parsed.info;

      // Mock token metadata (would come from Metaplex or other sources in production)
      const tokenInfo = generateTokenInfo(mint);
      
      // Mock market data (would come from price APIs like CoinGecko/Jupiter)
      const marketData = generateMarketData(mint, timeframe);
      
      // Generate price history if requested
      const priceHistory = includeHistory ? generatePriceHistory(timeframe) : undefined;
      
      // Get top holders if requested
      const holdersData = includeHolders ? await getTokenHolders(rpcUrl, mint) : undefined;
      
      // Calculate transfer statistics
      const transferStats = generateTransferStats(mint, timeframe);
      
      // Get program interactions
      const programInteractions = generateProgramInteractions(mint);

      const response = {
        mint,
        tokenInfo,
        supply: {
          total: supply.value.amount,
          circulating: supply.value.amount, // Simplified
          totalSupplyUi: supply.value.uiAmount || 0,
          circulatingSupplyUi: supply.value.uiAmount || 0,
          maxSupply: mintInfo.supply ? mintInfo.supply : undefined,
          burned: undefined // Would need additional calculation
        },
        mintAuthority: {
          address: mintInfo.mintAuthority,
          canMint: !!mintInfo.mintAuthority
        },
        freezeAuthority: {
          address: mintInfo.freezeAuthority,
          canFreeze: !!mintInfo.freezeAuthority
        },
        market: marketData,
        ...(priceHistory && { priceHistory }),
        ...(holdersData && { holders: holdersData }),
        transfers: transferStats,
        programs: programInteractions
      };

      return sendSuccess(c, response, 200, CACHE_SETTINGS.TOKEN_DETAILS);
    } catch (error) {
      console.error('Token details error:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return sendError(c, ERROR_CODES.TOKEN_NOT_FOUND, 'Token not found or invalid mint address');
      }
      return sendError(c, ERROR_CODES.RPC_ERROR, 'Failed to fetch token details');
    }
  }
);

// Helper functions

function generateTokenInfo(mint: string) {
  // Mock token info - in production this would come from various sources
  const commonTokens: Record<string, any> = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
      description: 'USD Coin (USDC) is a fully collateralized US dollar stablecoin.',
      website: 'https://www.coinbase.com/usdc',
      verified: true,
      tags: ['stablecoin', 'payments'],
      coingeckoId: 'usd-coin'
    },
    'So11111111111111111111111111111111111111112': {
      name: 'Wrapped SOL',
      symbol: 'SOL',
      decimals: 9,
      logoURI: 'https://assets.coingecko.com/coins/images/4128/thumb/solana.png',
      description: 'Wrapped Solana native token.',
      website: 'https://solana.com',
      verified: true,
      tags: ['native', 'layer-1'],
      coingeckoId: 'solana'
    }
  };

  return commonTokens[mint] || {
    name: `Token ${mint.substring(0, 8)}...`,
    symbol: 'UNKNOWN',
    decimals: 9,
    verified: false,
    tags: []
  };
}

function generateMarketData(mint: string, timeframe: string) {
  // Mock market data - in production this would come from price APIs
  const isStablecoin = mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  
  if (isStablecoin) {
    return {
      price: {
        usd: 1.0,
        sol: 0.046,
        change24h: -0.05,
        change7d: 0.02,
        change30d: -0.01,
        lastUpdated: new Date().toISOString()
      },
      marketCap: 32000000000,
      volume24h: 2500000000,
      volume7d: 17500000000,
      fdv: 32000000000,
      liquidityUsd: 1500000000,
      holders: 850000,
      rankByMarketCap: 5
    };
  }

  // Regular token mock data
  const price = 0.5 + Math.random() * 50;
  return {
    price: {
      usd: price,
      sol: price / 22,
      change24h: (Math.random() - 0.5) * 20,
      change7d: (Math.random() - 0.5) * 40,
      change30d: (Math.random() - 0.5) * 80,
      lastUpdated: new Date().toISOString()
    },
    marketCap: price * 1000000 * (100 + Math.random() * 900),
    volume24h: price * 10000 * (10 + Math.random() * 90),
    volume7d: price * 70000 * (10 + Math.random() * 90),
    fdv: price * 1000000 * (120 + Math.random() * 880),
    liquidityUsd: price * 50000 * (5 + Math.random() * 45),
    holders: Math.floor(1000 + Math.random() * 50000),
    rankByMarketCap: Math.floor(50 + Math.random() * 950)
  };
}

function generatePriceHistory(timeframe: string) {
  const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
  const now = new Date();
  
  return Array.from({ length: Math.min(hours, 100) }, (_, i) => {
    const timestamp = new Date(now.getTime() - (hours - 1 - i) * 3600000).toISOString();
    const basePrice = 1.5;
    const price = basePrice + Math.sin(i / 10) * 0.3 + (Math.random() - 0.5) * 0.2;
    
    return {
      timestamp,
      price: Math.max(0.1, price),
      volume: 50000 + Math.random() * 200000,
      marketCap: price * 1000000
    };
  });
}

async function getTokenHolders(rpcUrl: string, mint: string) {
  try {
    // Get largest token accounts
    const largestAccounts = await makeRpcRequest(rpcUrl, 'getTokenLargestAccounts', [mint]);
    
    // Mock additional holder data
    const mockHolders = largestAccounts.value.slice(0, 20).map((account: any, index: number) => ({
      address: account.address,
      balance: account.amount,
      balanceUi: account.uiAmount || 0,
      percentage: (account.uiAmount || 0) / 1000000 * 100, // Mock percentage
      isProgram: index < 3, // First few are usually programs
      programName: index < 3 ? ['DEX Pool', 'Treasury', 'Staking'][index] : undefined
    }));

    return {
      total: Math.floor(1000 + Math.random() * 50000),
      top: mockHolders,
      distribution: [
        { range: '0-1', count: 25000, percentage: 50, totalBalance: 50000 },
        { range: '1-10', count: 15000, percentage: 30, totalBalance: 75000 },
        { range: '10-100', count: 8000, percentage: 16, totalBalance: 200000 },
        { range: '100-1000', count: 1800, percentage: 3.6, totalBalance: 500000 },
        { range: '1000+', count: 200, percentage: 0.4, totalBalance: 10000000 }
      ]
    };
  } catch (error) {
    // Return mock data if RPC fails
    return {
      total: 5000,
      top: [],
      distribution: []
    };
  }
}

function generateTransferStats(mint: string, timeframe: string) {
  const multiplier = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
  
  return {
    total24h: Math.floor(1000 + Math.random() * 5000),
    total7d: Math.floor(7000 + Math.random() * 35000),
    uniqueWallets24h: Math.floor(500 + Math.random() * 2000),
    largestTransfer24h: {
      signature: '5j7s8K9...' + Math.random().toString(36).substring(7),
      amount: 100000 + Math.random() * 900000,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      from: 'wallet1...' + Math.random().toString(36).substring(7),
      to: 'wallet2...' + Math.random().toString(36).substring(7)
    }
  };
}

function generateProgramInteractions(mint: string) {
  return [
    {
      programId: 'seram...dex',
      name: 'Serum DEX',
      interactionCount: Math.floor(10000 + Math.random() * 50000),
      category: 'dex'
    },
    {
      programId: 'orca...amm',
      name: 'Orca AMM',
      interactionCount: Math.floor(5000 + Math.random() * 25000),
      category: 'defi'
    },
    {
      programId: 'raydium...amm',
      name: 'Raydium',
      interactionCount: Math.floor(3000 + Math.random() * 15000),
      category: 'defi'
    }
  ];
}

export default tokens; 