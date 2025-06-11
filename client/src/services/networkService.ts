import { apiClient, API_ENDPOINTS, getCurrentNetwork } from './api';
import type { 
  NetworkStatsResponse, 
  AnalyticsOverviewResponse, 
  TpsChartResponse,
  FeesChartResponse,
  ValidatorsChartResponse,
  ProgramsAnalyticsResponse,
  DefiAnalyticsResponse
} from '../types/api';

/**
 * Network Statistics and Analytics Service
 * Handles all network-related API endpoints from Phase 1-3
 */
export const NetworkService = {
  /**
   * Get current network statistics (Phase 1)
   */
  getNetworkStats: async (): Promise<NetworkStatsResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<NetworkStatsResponse>(
      API_ENDPOINTS[network].network,
      undefined,
      15000 // 15 second cache
    );
  },

  /**
   * Get analytics overview (Phase 3)
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
   * Get TPS chart data (Phase 3)
   * @param timeframe Timeframe for chart data
   * @param resolution Resolution of data points
   */
  getTpsChartData: async (
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    resolution: 'minute' | 'hour' | 'day' = 'minute'
  ): Promise<TpsChartResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<TpsChartResponse>(
      API_ENDPOINTS[network].analytics.tpsCharts,
      { timeframe, resolution },
      60000 // 1 minute cache
    );
  },

  /**
   * Get fees chart data (Phase 3)
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
   * Get validators chart data (Phase 3)
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
   * Get programs analytics (Phase 3)
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
   * Get DeFi analytics (Phase 3)
   */
  getDefiAnalytics: async (): Promise<DefiAnalyticsResponse> => {
    const network = getCurrentNetwork();
    return apiClient.get<DefiAnalyticsResponse>(
      API_ENDPOINTS[network].analytics.defi,
      undefined,
      300000 // 5 minute cache
    );
  }
}; 