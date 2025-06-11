import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { TransactionResponse } from '../types/api';

/**
 * Transaction Service
 * Handles transaction-related API endpoints
 */
export const TransactionService = {
  /**
   * Get transaction details by signature
   * @param signature Transaction signature
   */
  getTransaction: async (signature: string): Promise<TransactionResponse> => {
    const network = getCurrentNetwork();
    const endpoint = `${API_ENDPOINTS[network].transaction}/${signature}`;
    
    return apiClient.get<TransactionResponse>(
      endpoint,
      undefined,
      300000 // 5 minute cache (transactions don't change once confirmed)
    );
  },

  /**
   * Helper function to parse logs for human-readable descriptions
   * @param logs Transaction logs
   */
  parseTransactionLogs: (logs: string[]): {
    key: string;
    value: string;
    type: 'info' | 'error' | 'success' | 'warning';
  }[] => {
    return logs.map(log => {
      // Check for program errors
      if (log.includes('Error:') || log.includes('failed')) {
        return {
          key: 'Error',
          value: log,
          type: 'error'
        };
      }
      
      // Check for instruction logging
      if (log.includes('Instruction:')) {
        return {
          key: 'Instruction',
          value: log.replace('Instruction:', '').trim(),
          type: 'info'
        };
      }
      
      // Check for success confirmations
      if (log.includes('success') || log.includes('confirmed')) {
        return {
          key: 'Success',
          value: log,
          type: 'success'
        };
      }
      
      // Default case
      return {
        key: 'Log',
        value: log,
        type: 'info'
      };
    });
  },

  /**
   * Format SOL amount with proper decimals
   * @param lamports Amount in lamports
   */
  formatSolAmount: (lamports: number): string => {
    const sol = lamports / 1000000000;
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 9,
    }).format(sol);
  },

  /**
   * Format token amount with proper decimals
   * @param amount Raw token amount as string
   * @param decimals Token decimals
   */
  formatTokenAmount: (amount: string, decimals: number): string => {
    const value = Number(amount) / Math.pow(10, decimals);
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}; 