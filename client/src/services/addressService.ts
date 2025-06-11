import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { 
  AddressResponse, 
  AddressTransactionsParams, 
  AddressTransactionsResponse,
  AddressTokensParams,
  AddressTokensResponse,
  AddressNftsParams,
  AddressNftsResponse
} from '../types/api';

/**
 * Address Service
 * Handles address/account-related API endpoints
 */
export const AddressService = {
  /**
   * Get address details by address/public key
   * @param address Solana address/public key
   */
  getAddress: async (address: string): Promise<AddressResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].address}/${address}`;
    
    return apiClient.get<AddressResponse>(
      endpoint,
      undefined,
      30000 // 30 second cache (account data can change frequently)
    );
  },

  /**
   * Get address transactions with pagination and filtering
   * @param address Solana address/public key
   * @param params Pagination and filtering parameters
   */
  getAddressTransactions: async (
    address: string, 
    params: AddressTransactionsParams = {}
  ): Promise<AddressTransactionsResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].addressTransactions}/${address}/transactions`;
    
    return apiClient.get<AddressTransactionsResponse>(
      endpoint,
      params,
      30000 // 30 second cache
    );
  },

  /**
   * Get address tokens
   * @param address Solana address/public key
   * @param params Filter parameters
   */
  getAddressTokens: async (
    address: string, 
    params: AddressTokensParams = {}
  ): Promise<AddressTokensResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].addressTokens}/${address}/tokens`;
    
    return apiClient.get<AddressTokensResponse>(
      endpoint,
      params,
      30000 // 30 second cache
    );
  },

  /**
   * Get address NFTs
   * @param address Solana address/public key
   * @param params Pagination and filter parameters
   */
  getAddressNfts: async (
    address: string, 
    params: AddressNftsParams = {}
  ): Promise<AddressNftsResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].address}/${address}/nfts`;
    
    return apiClient.get<AddressNftsResponse>(
      endpoint,
      params,
      60000 // 1 minute cache (NFT data doesn't change as frequently)
    );
  },

  /**
   * Format/shorten address for display
   * @param address Solana address/public key
   * @param prefixLength Number of characters to keep at the beginning
   * @param suffixLength Number of characters to keep at the end
   */
  formatAddress: (
    address: string, 
    prefixLength: number = 4, 
    suffixLength: number = 4
  ): string => {
    if (!address || address.length <= prefixLength + suffixLength) {
      return address;
    }
    
    return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
  },

  /**
   * Identify address type based on analysis
   * @param address Solana address/public key
   * @param isExecutable Whether the account is executable
   * @param programId Optional program ID for token accounts
   */
  getAddressType: (
    address: string, 
    isExecutable: boolean = false,
    programId?: string
  ): 'wallet' | 'program' | 'token' | 'system' => {
    // System program address
    if (address === '11111111111111111111111111111111') {
      return 'system';
    }
    
    // Executable accounts are programs
    if (isExecutable) {
      return 'program';
    }
    
    // Token accounts owned by the token program
    if (programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
      return 'token';
    }
    
    // Default to wallet for other addresses
    return 'wallet';
  }
}; 