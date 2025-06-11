import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Configuration and Base Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export const API_ENDPOINTS = {
  mainnet: {
    network: '/api/v1/mainnet/network/stats',
    search: '/api/v1/mainnet/search',
    transaction: '/api/v1/mainnet/transactions',
    block: '/api/v1/mainnet/blocks',
    address: '/api/v1/mainnet/addresses',
    addressTransactions: '/api/v1/mainnet/addresses',
    addressTokens: '/api/v1/mainnet/addresses',
    blockTransactions: '/api/v1/mainnet/blocks',
    tokens: '/api/v1/mainnet/tokens',
    analytics: {
      overview: '/api/v1/mainnet/analytics/overview',
      tpsCharts: '/api/v1/mainnet/analytics/charts/tps',
      feesCharts: '/api/v1/mainnet/analytics/charts/fees',
      validators: '/api/v1/mainnet/analytics/charts/validators',
      programs: '/api/v1/mainnet/analytics/programs',
      defi: '/api/v1/mainnet/analytics/defi'
    }
  },
  devnet: {
    network: '/api/v1/devnet/network/stats',
    search: '/api/v1/devnet/search',
    transaction: '/api/v1/devnet/transactions',
    block: '/api/v1/devnet/blocks',
    address: '/api/v1/devnet/addresses',
    addressTransactions: '/api/v1/devnet/addresses',
    addressTokens: '/api/v1/devnet/addresses',
    blockTransactions: '/api/v1/devnet/blocks',
    tokens: '/api/v1/devnet/tokens',
    analytics: {
      overview: '/api/v1/devnet/analytics/overview',
      tpsCharts: '/api/v1/devnet/analytics/charts/tps',
      feesCharts: '/api/v1/devnet/analytics/charts/fees',
      validators: '/api/v1/devnet/analytics/charts/validators',
      programs: '/api/v1/devnet/analytics/programs',
      defi: '/api/v1/devnet/analytics/defi'
    }
  }
};

// Default axios instance with configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for handling auth if needed later
axiosInstance.interceptors.request.use(
  (config) => {
    // Handle auth token if needed
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Add response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Log the error to console
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle rate limits, authentication errors, etc.
    if (error.response) {
      const status = error.response.status;
      
      if (status === 429) {
        // Rate limit reached
        console.warn('Rate limit reached. Please try again later.');
      } else if (status === 401 || status === 403) {
        // Authentication or authorization error
        console.warn('Authentication error.');
      }
    }
    
    return Promise.reject(error);
  }
);

// In-memory cache
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  // Set an item in the cache
  set<T>(key: string, data: T, ttl: number = 0): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: ttl > 0 ? now + ttl : 0 // 0 means no expiration
    });
  }
  
  // Get an item from the cache
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if the cache has expired
    if (item.expiresAt > 0 && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  // Clear the entire cache or a specific item
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
  
  // Get the size of the cache
  size(): number {
    return this.cache.size;
  }
}

// Create a cache instance
const apiCache = new ApiCache();

// Current network state
let currentNetwork: 'mainnet' | 'devnet' = 'mainnet';

// Set active network
export const setNetwork = (network: 'mainnet' | 'devnet'): void => {
  currentNetwork = network;
  // Clear cache when network changes
  apiCache.clear();
};

// Get current network
export const getCurrentNetwork = (): 'mainnet' | 'devnet' => {
  return currentNetwork;
};

// API Client for making requests
export const apiClient = {
  /**
   * Make a GET request
   * @param endpoint API endpoint
   * @param params Query parameters
   * @param cacheTtl Cache time-to-live in milliseconds (0 for no cache)
   */
  async get<T>(endpoint: string, params?: any, cacheTtl: number = 0): Promise<T> {
    // Generate a cache key based on endpoint and params
    const cacheKey = `GET:${endpoint}:${JSON.stringify(params || {})}`;
    
    // Check cache first if caching is enabled
    if (cacheTtl > 0) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        console.log(`[API] Cache hit for ${endpoint}`);
        return cachedData;
      }
    }
    
    // Check if we should use mock data
    // if (shouldUseMockData(endpoint)) {
    //   console.log(`[API] Using mock data for ${endpoint}`);
    //   const mockData = getMockData(endpoint, params);
      
    //   // Cache the mock data if needed
    //   if (cacheTtl > 0) {
    //     apiCache.set(cacheKey, mockData, cacheTtl);
    //   }
      
    //   return mockData as T;
    // }
    
    try {
      const config: AxiosRequestConfig = {};
      if (params) {
        config.params = params;
      }
      
      console.log(`[API] GET ${endpoint}`);
      const response = await axiosInstance.get<T>(endpoint, config);
      
      // Cache the response if needed
      if (cacheTtl > 0) {
        apiCache.set(cacheKey, response.data, cacheTtl);
      }
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error(`[API] Error getting ${endpoint}:`, error);
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param endpoint API endpoint
   * @param data Request body
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      console.log(`[API] POST ${endpoint}`);
      const response = await axiosInstance.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`[API] Error posting to ${endpoint}:`, error);
      throw error;
    }
  }
}; 