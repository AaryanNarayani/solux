import { Hono } from 'hono';
import { AddressTokensParamsSchema, AddressTokensQuerySchema } from '../schemas/phase2';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

const addressTokensRouter = new Hono();

addressTokensRouter.get('/:address/tokens', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = AddressTokensParamsSchema.safeParse({
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
      includeNFTs: c.req.query('includeNFTs') || 'false',
      includeZeroBalance: c.req.query('includeZeroBalance') || 'false',
      includePrices: c.req.query('includePrices') || 'true',
      sortBy: c.req.query('sortBy') || 'value',
      sortOrder: c.req.query('sortOrder') || 'desc'
    };

    const queryValidation = AddressTokensQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { address } = paramsValidation.data;
    const { includeNFTs, includeZeroBalance, includePrices, sortBy, sortOrder } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get all SPL token accounts for this address
    const tokenAccounts = await makeRpcRequest(rpcUrl, 'getTokenAccountsByOwner', [
      address,
      {
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' // SPL Token program
      },
      {
        encoding: 'jsonParsed'
      }
    ]);

    const fungibleTokens: any[] = [];
    const nfts: any[] = [];
    let totalValueUsd = 0;
    let totalValueSol = 0;

    if (tokenAccounts?.value) {
      // Process each token account
      for (const tokenAccount of tokenAccounts.value) {
        const accountData = tokenAccount.account?.data?.parsed?.info;
        if (!accountData) continue;

        const mint = accountData.mint;
        const amount = parseInt(accountData.tokenAmount.amount);
        const decimals = accountData.tokenAmount.decimals;
        const uiAmount = accountData.tokenAmount.uiAmount || 0;

        // Skip zero balance tokens if not requested
        if (!includeZeroBalance && amount === 0) continue;

        // Determine if this is an NFT (amount = 1, decimals = 0)
        const isNFT = amount === 1 && decimals === 0;

        if (isNFT && includeNFTs) {
          // Process as NFT
          const nftData = await processNFT(rpcUrl, mint, tokenAccount.pubkey);
          if (nftData) {
            nfts.push({
              mint,
              tokenAccount: tokenAccount.pubkey,
              ...nftData,
              frozen: accountData.state === 'frozen'
            });
          }
        } else if (!isNFT) {
          // Process as fungible token
          const tokenInfo = await getTokenInfo(mint);
          let price = null;
          let value = null;

          if (includePrices && tokenInfo) {
            price = await getTokenPrice(tokenInfo.coingeckoId || mint);
            if (price && uiAmount > 0) {
              const usdValue = uiAmount * price.usd;
              totalValueUsd += usdValue;
              value = {
                usd: usdValue,
                percentage: 0 // Will be calculated later
              };
            }
          }

          fungibleTokens.push({
            mint,
            tokenAccount: tokenAccount.pubkey,
            balance: {
              amount: accountData.tokenAmount.amount,
              decimals,
              uiAmount,
              uiAmountString: accountData.tokenAmount.uiAmountString
            },
            tokenInfo: tokenInfo || {
              name: 'Unknown Token',
              symbol: mint.substring(0, 8),
              verified: false
            },
            price,
            value,
            frozen: accountData.state === 'frozen',
            closeAuthority: accountData.closeAuthority || undefined
          });
        }
      }
    }

    // Calculate percentages for portfolio distribution
    if (totalValueUsd > 0) {
      for (const token of fungibleTokens) {
        if (token.value) {
          token.value.percentage = (token.value.usd / totalValueUsd) * 100;
        }
      }
    }

    // Sort tokens based on criteria
    fungibleTokens.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'balance':
          comparison = (b.balance.uiAmount || 0) - (a.balance.uiAmount || 0);
          break;
        case 'value':
          comparison = (b.value?.usd || 0) - (a.value?.usd || 0);
          break;
        case 'name':
          comparison = (a.tokenInfo.name || '').localeCompare(b.tokenInfo.name || '');
          break;
      }
      
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // Calculate SOL equivalent (simplified - would need current SOL price)
    totalValueSol = totalValueUsd / 100; // Placeholder conversion

    // Get top holdings for summary
    const topHoldings = fungibleTokens
      .filter(token => token.value && token.value.usd > 0)
      .slice(0, 5)
      .map(token => ({
        symbol: token.tokenInfo.symbol,
        percentage: token.value.percentage,
        value: token.value.usd
      }));

    const response = {
      address,
      tokens: {
        fungible: fungibleTokens,
        nfts: includeNFTs ? nfts : []
      },
      summary: {
        totalTokens: fungibleTokens.length,
        totalNFTs: nfts.length,
        totalValue: {
          usd: totalValueUsd,
          sol: totalValueSol
        },
        topHoldings
      }
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.TOKEN_BALANCES);

  } catch (error) {
    console.error('Address tokens error:', error);
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch token holdings',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

// Helper function to get token metadata
async function getTokenInfo(mint: string) {
  // This would typically query a token registry or metadata service
  // For demonstration, return info for known tokens
  const knownTokens: Record<string, any> = {
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
      name: 'USD Coin',
      symbol: 'USDC',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      website: 'https://www.centre.io/',
      coingeckoId: 'usd-coin',
      verified: true
    },
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
      name: 'Tether USD',
      symbol: 'USDT',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
      website: 'https://tether.to/',
      coingeckoId: 'tether',
      verified: true
    }
  };

  return knownTokens[mint] || null;
}

// Helper function to get token price data
async function getTokenPrice(tokenId: string) {
  // This would typically query a price API like CoinGecko
  // For demonstration, return mock price data
  const mockPrices: Record<string, any> = {
    'usd-coin': {
      usd: 1.00,
      change24h: 0.1,
      change7d: -0.2,
      marketCap: 25000000000,
      volume24h: 2500000000,
      lastUpdated: new Date().toISOString()
    },
    'tether': {
      usd: 1.00,
      change24h: 0.0,
      change7d: 0.1,
      marketCap: 95000000000,
      volume24h: 45000000000,
      lastUpdated: new Date().toISOString()
    }
  };

  return mockPrices[tokenId] || null;
}

// Helper function to process NFT data
async function processNFT(rpcUrl: string, mint: string, tokenAccount: string) {
  try {
    // Get NFT metadata account (Metaplex standard)
    // This is a simplified implementation
    // Real implementation would parse Metaplex metadata
    
    return {
      name: 'Unknown NFT',
      symbol: '',
      image: undefined,
      animationUrl: undefined,
      externalUrl: undefined,
      description: undefined,
      collection: undefined,
      attributes: [],
      creators: undefined,
      floorPrice: undefined,
      rarity: undefined
    };
  } catch (error) {
    console.error('Error processing NFT:', error);
    return null;
  }
}

export default addressTokensRouter; 