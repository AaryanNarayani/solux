import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { TokenResponse } from '../types/api';

/**
 * Token Service
 * Handles token-related API endpoints
 */
export const TokenService = {
  /**
   * Get token details by mint address
   * @param mint Token mint address
   */
  getToken: async (mint: string): Promise<TokenResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].tokens}/${mint}`;
    
    return apiClient.get<TokenResponse>(
      endpoint,
      undefined,
      60000 // 1 minute cache
    );
  },

  /**
   * Format token amount with proper decimals
   * @param amount Raw token amount as string
   * @param decimals Token decimals
   * @param includeSymbol Whether to include the token symbol
   * @param symbol Token symbol
   */
  formatTokenAmount: (
    amount: string, 
    decimals: number, 
    includeSymbol: boolean = false,
    symbol: string = ''
  ): string => {
    const value = Number(amount) / Math.pow(10, decimals);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
    
    return includeSymbol && symbol ? `${formatted} ${symbol}` : formatted;
  },

  /**
   * Format token price with proper currency symbol
   * @param price Token price in USD
   */
  formatTokenPrice: (price: number): string => {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    }
    
    // For small prices, show more decimal places
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(price);
  },

  /**
   * Format price change percentage
   * @param percentage Price change percentage
   */
  formatPriceChange: (percentage: number): string => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  },

  /**
   * Check if a token is an NFT based on type and supply
   * @param type Token type ('fungible' or 'nft')
   * @param supply Token supply
   * @param decimals Token decimals
   */
  isNFT: (
    type: 'fungible' | 'nft' | undefined, 
    supply: string | undefined, 
    decimals: number
  ): boolean => {
    if (type === 'nft') {
      return true;
    }
    
    // NFTs typically have supply of 1 and 0 decimals
    if (supply === '1' && decimals === 0) {
      return true;
    }
    
    return false;
  }
}; 