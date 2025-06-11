import type { 
  AddressResponse, 
  AddressTransactionsResponse,
  AddressTokensResponse,
  AddressNftsResponse
} from '../../types/api';

/**
 * Mock Address Response
 */
export const mockAddressResponse = (address: string): AddressResponse => ({
  success: true,
  data: {
    address,
    owner: '11111111111111111111111111111111', // System program for regular wallets
    balance: 12.456789,
    executable: false,
    rentEpoch: 361,
    type: 'wallet',
    tokens: [
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        amount: '1000000000',
        decimals: 6,
        tokenAccount: `TokenAcc${address.substring(0, 8)}USDC`,
        price: 1.00,
        priceChangePercentage24h: 0.01,
        value: 1000.00
      },
      {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'Tether USD',
        symbol: 'USDT',
        amount: '500000000',
        decimals: 6,
        tokenAccount: `TokenAcc${address.substring(0, 8)}USDT`,
        price: 1.00,
        priceChangePercentage24h: 0.00,
        value: 500.00
      },
      {
        mint: 'So11111111111111111111111111111111111111112',
        name: 'Wrapped SOL',
        symbol: 'SOL',
        amount: '5000000000',
        decimals: 9,
        tokenAccount: `TokenAcc${address.substring(0, 8)}WSOL`,
        price: 150.00,
        priceChangePercentage24h: 5.23,
        value: 750.00
      }
    ],
    nftCount: 12,
    transactions: {
      total: 1247,
      recent: [
        {
          signature: '5j7VkPqY6K8ZQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J9',
          blockTime: Math.floor(Date.now() / 1000) - 300,
          slot: 245678910,
          fee: 0.000005,
          status: 'success',
          type: 'in'
        },
        {
          signature: '2k8VjQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J95j7Vp',
          blockTime: Math.floor(Date.now() / 1000) - 1800,
          slot: 245678900,
          fee: 0.000005,
          status: 'success',
          type: 'out'
        }
      ]
    }
  }
});

/**
 * Mock Address Transactions Response
 */
export const mockAddressTransactionsResponse = (address: string): AddressTransactionsResponse => ({
  success: true,
  data: {
    address,
    transactions: [
      {
        signature: '5j7VkPqY6K8ZQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J9',
        blockTime: Math.floor(Date.now() / 1000) - 300,
        slot: 245678910,
        fee: 0.000005,
        status: 'success',
        type: 'in',
        amount: 1.5,
        counterparties: ['DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2']
      },
      {
        signature: '2k8VjQ9XN5rW7T3M8P1L4B9C6X2H5S8D3F7A2J95j7Vp',
        blockTime: Math.floor(Date.now() / 1000) - 1800,
        slot: 245678900,
        fee: 0.000005,
        status: 'success',
        type: 'out',
        amount: 500,
        counterparties: ['XYZ789GHI012JKL345MNO678PQR901STU234VWX567YZA']
      },
      {
        signature: '9L3MpR8T4K5W2Q7Y1N6X8V9B3C5F2H7J4M9S1D6A8P5R',
        blockTime: Math.floor(Date.now() / 1000) - 3600,
        slot: 245678890,
        fee: 0.000005,
        status: 'success',
        type: 'both',
        amount: 2.5,
        counterparties: ['DznpEHjgea8xZm2WpWYATHy1YEj9oKYGG5hHnLAj4Lh2']
      }
    ],
    pagination: {
      limit: 10,
      hasNext: true,
      hasPrevious: false,
    }
  }
});

/**
 * Mock Address Tokens Response
 */
export const mockAddressTokensResponse = (address: string): AddressTokensResponse => ({
  success: true,
  data: {
    address,
    totalValue: 2250.00,
    tokens: [
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        name: 'USD Coin',
        symbol: 'USDC',
        amount: '1000000000',
        decimals: 6,
        tokenAccount: `TokenAcc${address.substring(0, 8)}USDC`,
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
        price: 1.00,
        priceChangePercentage24h: 0.01,
        value: 1000.00,
        type: 'fungible'
      },
      {
        mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        name: 'Tether USD',
        symbol: 'USDT',
        amount: '500000000',
        decimals: 6,
        tokenAccount: `TokenAcc${address.substring(0, 8)}USDT`,
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
        price: 1.00,
        priceChangePercentage24h: 0.00,
        value: 500.00,
        type: 'fungible'
      },
      {
        mint: 'So11111111111111111111111111111111111111112',
        name: 'Wrapped SOL',
        symbol: 'SOL',
        amount: '5000000000',
        decimals: 9,
        tokenAccount: `TokenAcc${address.substring(0, 8)}WSOL`,
        logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        price: 150.00,
        priceChangePercentage24h: 5.23,
        value: 750.00,
        type: 'fungible'
      }
    ]
  }
});

/**
 * Mock Address NFTs Response
 */
export const mockAddressNftsResponse = (address: string): AddressNftsResponse => ({
  success: true,
  data: {
    address,
    nftsCount: 12,
    collectionsCount: 4,
    estimatedValue: 4000,
    collections: [
      {
        name: 'Degenerate Ape Academy',
        image: 'https://example.com/collections/degen-apes.jpg',
        count: 2,
        floorPrice: 1.55,
        totalValue: 3.1
      }
    ],
    nfts: [
      {
        mint: 'NFT1mint1111111111111111111111111111111111',
        name: 'Degenerate Ape #1234',
        image: 'https://example.com/nft1.jpg',
        collection: 'Degenerate Ape Academy',
        tokenAccount: `NFTAcc${address.substring(0, 8)}1234`,
        attributes: [
          { trait_type: 'Background', value: 'Jungle' },
          { trait_type: 'Fur', value: 'Pink' },
          { trait_type: 'Eyes', value: 'Laser' },
          { trait_type: 'Clothes', value: 'Tuxedo' },
          { trait_type: 'Mouth', value: 'Grin' }
        ],
        rarityRank: 134,
        estimatedValue: 1.55,
        lastSalePrice: 1.8,
        lastSaleDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        mint: 'NFT2mint2222222222222222222222222222222222',
        name: 'Okay Bear #5678',
        image: 'https://example.com/nft2.jpg',
        collection: 'Okay Bears',
        tokenAccount: `NFTAcc${address.substring(0, 8)}5678`,
        attributes: [
          { trait_type: 'Background', value: 'Blue' },
          { trait_type: 'Fur', value: 'Brown' },
          { trait_type: 'Eyes', value: 'Sleepy' },
          { trait_type: 'Clothes', value: 'Hoodie' },
          { trait_type: 'Accessory', value: 'Gold Chain' }
        ],
        rarityRank: 578,
        estimatedValue: 25,
        lastSalePrice: 22.5,
        lastSaleDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    pagination: {
      limit: 10,
      offset: 0,
      total: 12,
      hasNext: true,
      hasPrevious: false
    }
  }
}); 