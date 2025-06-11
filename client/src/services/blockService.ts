import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { BlockResponse, BlockTransactionsParams, BlockTransactionsResponse } from '../types/api';

/**
 * Block Service
 * Handles block-related API endpoints
 */
export const BlockService = {
  /**
   * Get block details by slot number
   * @param slot Block slot number
   */
  getBlock: async (slot: number): Promise<BlockResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].block}/${slot}`;
    
    return apiClient.get<BlockResponse>(
      endpoint,
      undefined,
      300000 // 5 minute cache (blocks don't change once confirmed)
    );
  },

  /**
   * Get block transactions with pagination
   * @param slot Block slot number
   * @param params Pagination parameters
   */
  getBlockTransactions: async (
    slot: number, 
    params: BlockTransactionsParams = {}
  ): Promise<BlockTransactionsResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].blockTransactions}/${slot}/transactions`;
    
    return apiClient.get<BlockTransactionsResponse>(
      endpoint,
      params,
      60000 // 1 minute cache
    );
  },

  /**
   * Format slot number for display
   * @param slot Block slot number
   */
  formatSlot: (slot: number): string => {
    return new Intl.NumberFormat('en-US').format(slot);
  },

  /**
   * Calculate time since block was produced
   * @param blockTime Block time in seconds
   */
  getTimeSinceBlock: (blockTime: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = now - blockTime;
    
    if (diffSeconds < 60) {
      return `${diffSeconds} seconds ago`;
    }
    
    if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    const days = Math.floor(diffSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  },

  /**
   * Format block time as full date string
   * @param blockTime Block time in seconds
   */
  formatBlockTime: (blockTime: number): string => {
    const date = new Date(blockTime * 1000);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  }
}; 