import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { SearchParams, SearchResponse } from '../types/api';

/**
 * Search Service
 * Handles universal search functionality
 */
export const SearchService = {
  /**
   * Search for transactions, addresses, blocks, or tokens
   * @param params Search parameters
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<SearchResponse>(
      API_ENDPOINTS[network].search,
      params,
      5000 // 5 second cache (search results may change)
    );
  },

  /**
   * Validate if the query is a valid search input
   * This is a local validation function that doesn't make API calls
   * @param query The search query to validate
   */
  validateSearchQuery: (query: string): { 
    isValid: boolean; 
    type?: 'signature' | 'address' | 'block' | 'token' | 'unknown';
    message?: string;
  } => {
    // Trim the query
    query = query.trim();

    // Empty query
    if (!query) {
      return { isValid: false, message: 'Please enter a search term' };
    }

    // Transaction signature (base58 encoded, 88 characters)
    if (/^[1-9A-HJ-NP-Za-km-z]{88}$/.test(query)) {
      return { isValid: true, type: 'signature' };
    }

    // Solana address (base58 encoded, 32-44 characters)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(query)) {
      return { isValid: true, type: 'address' };
    }

    // Block number/slot (digits only)
    if (/^\d+$/.test(query)) {
      return { isValid: true, type: 'block' };
    }

    // Token symbol (alphanumeric, 2-10 characters)
    // This is a simple heuristic and might need refinement
    if (/^[A-Za-z0-9]{2,10}$/.test(query)) {
      return { isValid: true, type: 'token' };
    }

    // If we're here, the query doesn't match any expected format
    return { 
      isValid: true, 
      type: 'unknown',
      message: 'Search format not recognized, but we\'ll try to find matches' 
    };
  }
}; 