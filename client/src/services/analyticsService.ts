import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { 
  AnalyticsOverviewResponse, 
  TpsChartParams,
  TpsChartResponse,
  FeesChartResponse,
  ValidatorsChartResponse,
  ProgramsAnalyticsResponse,
  DefiAnalyticsResponse
} from '../types/api';

/**
 * Analytics Service
 * Handles analytics-related API endpoints
 */
export const AnalyticsService = {
  /**
   * Get analytics overview
   * @param timeframe Timeframe for analytics
   * @param includeHistory Include historical comparison
   */
  getAnalyticsOverview: async (
    timeframe: '1h' | '24h' | '7d' | '30d' | '90d' = '24h',
    includeHistory: boolean = true
  ): Promise<AnalyticsOverviewResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<AnalyticsOverviewResponse>(
      API_ENDPOINTS[network].analytics.overview,
      { timeframe, includeHistory },
      60000 // 1 minute cache
    );
  },

  /**
   * Get TPS chart data
   * @param params Chart parameters
   */
  getTpsChartData: async (params: TpsChartParams): Promise<TpsChartResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<TpsChartResponse>(
      API_ENDPOINTS[network].analytics.tpsCharts,
      params,
      60000 // 1 minute cache
    );
  },

  /**
   * Get fees chart data
   * @param timeframe Timeframe for chart data
   */
  getFeesChartData: async (
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<FeesChartResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<FeesChartResponse>(
      API_ENDPOINTS[network].analytics.feesCharts,
      { timeframe },
      60000 // 1 minute cache
    );
  },

  /**
   * Get validators chart data
   */
  getValidatorsChartData: async (): Promise<ValidatorsChartResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<ValidatorsChartResponse>(
      API_ENDPOINTS[network].analytics.validators,
      undefined,
      300000 // 5 minute cache (validators don't change often)
    );
  },

  /**
   * Get programs analytics
   * @param timeframe Timeframe for analytics
   * @param limit Number of programs to return
   */
  getProgramsAnalytics: async (
    timeframe: '24h' | '7d' | '30d' = '7d',
    limit: number = 20
  ): Promise<ProgramsAnalyticsResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<ProgramsAnalyticsResponse>(
      API_ENDPOINTS[network].analytics.programs,
      { timeframe, limit },
      300000 // 5 minute cache
    );
  },

  /**
   * Get DeFi analytics
   */
  getDefiAnalytics: async (): Promise<DefiAnalyticsResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<DefiAnalyticsResponse>(
      API_ENDPOINTS[network].analytics.defi,
      undefined,
      300000 // 5 minute cache
    );
  },
  
  /**
   * Format large numbers with appropriate suffixes
   * @param value Numeric value to format
   */
  formatLargeNumber: (value: number): string => {
    const trillion = 1000000000000;
    const billion = 1000000000;
    const million = 1000000;
    const thousand = 1000;
    
    if (value >= trillion) {
      return `${(value / trillion).toFixed(2)}T`;
    }
    
    if (value >= billion) {
      return `${(value / billion).toFixed(2)}B`;
    }
    
    if (value >= million) {
      return `${(value / million).toFixed(2)}M`;
    }
    
    if (value >= thousand) {
      return `${(value / thousand).toFixed(2)}K`;
    }
    
    return value.toFixed(2);
  },

  /**
   * Format percentage values
   * @param value Percentage value
   * @param includeSign Whether to include a sign (+/-)
   */
  formatPercentage: (value: number, includeSign: boolean = true): string => {
    if (includeSign) {
      const sign = value > 0 ? '+' : '';
      return `${sign}${value.toFixed(2)}%`;
    }
    
    return `${value.toFixed(2)}%`;
  }
}; 