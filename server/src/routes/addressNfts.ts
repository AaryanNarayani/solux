import { Hono } from 'hono';
import { AddressNftsParamsSchema, AddressNftsQuerySchema } from '../schemas/phase3';
import { sendSuccess, sendError, ERROR_CODES, makeRpcRequest, CACHE_SETTINGS } from '../utils/responses';

const addressNfts = new Hono();

// GET /api/addresses/{address}/nfts
addressNfts.get('/:address/nfts', async (c) => {
  try {
    // Validate path parameters
    const paramsValidation = AddressNftsParamsSchema.safeParse({
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
      limit: c.req.query('limit') || '100',
      offset: c.req.query('offset') || '0',
      includeMetadata: c.req.query('includeMetadata') || 'true',
      includeFloorPrice: c.req.query('includeFloorPrice') || 'true',
      sortBy: c.req.query('sortBy') || 'name',
      filterBy: c.req.query('filterBy')
    };

    const queryValidation = AddressNftsQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return sendError(
        c,
        ERROR_CODES.INVALID_PARAMETERS,
        'Invalid query parameters',
        queryValidation.error.issues
      );
    }

    const { address } = paramsValidation.data;
    const { limit, offset, includeMetadata, includeFloorPrice, sortBy, filterBy } = queryValidation.data;
    const rpcUrl = c.req.rpcUrl;

    if (!rpcUrl) {
      return sendError(c, ERROR_CODES.INTERNAL_SERVER_ERROR, 'RPC URL not configured');
    }

    // Get NFT token accounts (tokens with amount = 1 and decimals = 0)
    const tokenAccounts = await makeRpcRequest(rpcUrl, 'getTokenAccountsByOwner', [
      address,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed' }
    ]);

    if (!tokenAccounts?.value) {
      return sendSuccess(c, {
        address,
        nfts: [],
        pagination: {
          total: 0,
          limit,
          offset,
          hasNext: false,
          hasPrev: false
        },
        summary: {
          totalNfts: 0,
          collections: [],
          estimatedValue: { usd: 0, sol: 0, methodology: 'floor_price_average' },
          topCollections: []
        }
      }, 200, CACHE_SETTINGS.ADDRESS_NFTS);
    }

    // Filter for NFTs (amount = 1, decimals = 0)
    const nftAccounts = tokenAccounts.value.filter((account: any) => {
      const tokenData = account.account?.data?.parsed?.info;
      return tokenData && 
             tokenData.tokenAmount.amount === '1' && 
             tokenData.tokenAmount.decimals === 0;
    });

    // Generate mock NFT data (in production, would fetch from Metaplex and other sources)
    const allNfts = await Promise.all(
      nftAccounts.map(async (account: any) => {
        const mint = account.account.data.parsed.info.mint;
        return generateNftData(mint, includeMetadata, includeFloorPrice);
      })
    );

    // Apply filtering
    let filteredNfts = allNfts;
    if (filterBy) {
      filteredNfts = allNfts.filter(nft => 
        nft.collection?.name.toLowerCase().includes(filterBy.toLowerCase())
      );
    }

    // Apply sorting
    filteredNfts.sort((a, b) => {
      switch (sortBy) {
        case 'collection':
          return (a.collection?.name || '').localeCompare(b.collection?.name || '');
        case 'rarity':
          return (a.rarity?.rank || 0) - (b.rarity?.rank || 0);
        case 'floorPrice':
          return (b.collection?.floorPrice?.sol || 0) - (a.collection?.floorPrice?.sol || 0);
        default: // name
          return a.metadata.name.localeCompare(b.metadata.name);
      }
    });

    // Apply pagination
    const paginatedNfts = filteredNfts.slice(offset, offset + limit);
    
    // Generate summary data
    const summary = generateNftSummary(filteredNfts);

    const response = {
      address,
      nfts: paginatedNfts,
      pagination: {
        total: filteredNfts.length,
        limit,
        offset,
        hasNext: offset + limit < filteredNfts.length,
        hasPrev: offset > 0
      },
      summary
    };

    return sendSuccess(c, response, 200, CACHE_SETTINGS.ADDRESS_NFTS);

  } catch (error) {
    console.error('Address NFTs error:', error);
    
    if (error instanceof Error && error.message.includes('Invalid param')) {
      return sendError(c, ERROR_CODES.INVALID_ADDRESS, 'Invalid address format');
    }
    
    return sendError(
      c,
      ERROR_CODES.RPC_ERROR,
      'Failed to fetch NFTs',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});

// Helper functions

async function generateNftData(mint: string, includeMetadata: boolean, includeFloorPrice: boolean) {
  // Mock NFT data - in production would fetch from Metaplex, Magic Eden, etc.
  const collections = [
    'DeGods', 'y00ts', 'Okay Bears', 'Solana Monkey Business', 'Famous Fox Federation',
    'Aurory', 'Degenerate Ape Academy', 'SolPunks', 'Thugbirdz', 'Catalina Whales'
  ];
  
  const randomCollection = collections[Math.floor(Math.random() * collections.length)];
  const tokenNumber = Math.floor(Math.random() * 10000) + 1;
  
  return {
    mint,
    tokenAccount: `token_${mint.substring(0, 8)}...`,
    metadata: includeMetadata ? {
      name: `${randomCollection} #${tokenNumber}`,
      symbol: randomCollection.substring(0, 3).toUpperCase(),
      description: `A unique NFT from the ${randomCollection} collection`,
      image: `https://example.com/nfts/${mint}.png`,
      animationUrl: Math.random() > 0.8 ? `https://example.com/nfts/${mint}.mp4` : undefined,
      externalUrl: `https://magiceden.io/item-details/${mint}`,
      attributes: generateNftAttributes()
    } : {
      name: `${randomCollection} #${tokenNumber}`,
      symbol: randomCollection.substring(0, 3).toUpperCase(),
      attributes: []
    },
    collection: {
      name: randomCollection,
      family: randomCollection,
      verified: true,
      ...(includeFloorPrice && {
        floorPrice: {
          usd: 50 + Math.random() * 500,
          sol: 2 + Math.random() * 20,
          marketplace: 'Magic Eden',
          lastUpdated: new Date().toISOString()
        }
      }),
      totalSupply: 10000,
      holders: Math.floor(3000 + Math.random() * 7000),
      royalty: 5 + Math.random() * 5
    },
    creators: [
      {
        address: `creator_${mint.substring(0, 8)}...`,
        verified: true,
        share: 100
      }
    ],
    rarity: {
      rank: Math.floor(Math.random() * 10000) + 1,
      score: Math.random() * 100,
      total: 10000,
      traits: generateRarityTraits()
    },
    ownership: {
      owner: `owner_${mint.substring(0, 8)}...`,
      frozen: false,
      delegated: false
    },
    marketData: {
      lastSale: Math.random() > 0.3 ? {
        price: 1 + Math.random() * 50,
        marketplace: 'Magic Eden',
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        signature: `sale_${mint.substring(0, 8)}...`
      } : undefined,
      listings: Math.random() > 0.7 ? [{
        price: 5 + Math.random() * 100,
        marketplace: 'Magic Eden',
        listingTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        seller: `seller_${mint.substring(0, 8)}...`
      }] : []
    }
  };
}

function generateNftAttributes() {
  const traitTypes = ['Background', 'Skin', 'Eyes', 'Mouth', 'Hat', 'Clothes'];
  const backgrounds = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];
  const skins = ['Light', 'Medium', 'Dark', 'Zombie', 'Alien', 'Robot'];
  
  return traitTypes.map(trait => ({
    trait_type: trait,
    value: trait === 'Background' ? 
      backgrounds[Math.floor(Math.random() * backgrounds.length)] :
      trait === 'Skin' ?
      skins[Math.floor(Math.random() * skins.length)] :
      `${trait} ${Math.floor(Math.random() * 10) + 1}`
  }));
}

function generateRarityTraits() {
  return [
    {
      trait_type: 'Background',
      value: 'Golden',
      rarity: 0.01 // 1% rarity
    },
    {
      trait_type: 'Eyes',
      value: 'Laser',
      rarity: 0.05 // 5% rarity
    }
  ];
}

function generateNftSummary(nfts: any[]) {
  // Group by collection
  const collectionGroups = nfts.reduce((acc, nft) => {
    const collectionName = nft.collection?.name || 'Unknown';
    if (!acc[collectionName]) {
      acc[collectionName] = {
        name: collectionName,
        count: 0,
        floorPrice: nft.collection?.floorPrice?.sol || 0,
        totalValue: 0
      };
    }
    acc[collectionName].count++;
    acc[collectionName].totalValue += nft.collection?.floorPrice?.sol || 0;
    return acc;
  }, {} as Record<string, any>);

  const collections = Object.values(collectionGroups);
  const totalValue = collections.reduce((sum: number, col: any) => sum + col.totalValue, 0);

  return {
    totalNfts: nfts.length,
    collections: collections.slice(0, 10), // Top 10 collections
    estimatedValue: {
      usd: totalValue * 22, // Mock SOL/USD rate
      sol: totalValue,
      methodology: 'floor_price_average'
    },
    topCollections: collections
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((col: any) => ({
        name: col.name,
        count: col.count,
        percentage: Math.round((col.count / nfts.length) * 100)
      }))
  };
}

export default addressNfts; 