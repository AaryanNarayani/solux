import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '../types/api';

interface UseApiRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  immediate?: boolean;
  dependencies?: any[];
}

/**
 * Custom hook for handling API requests with loading and error states
 * @param apiFunction The API function to call
 * @param options Configuration options
 * @returns Object with data, loading, error, and execute function
 */
export function useApiRequest<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<ApiResponse<T>>,
  options: UseApiRequestOptions<T> = {}
) {
  const { 
    onSuccess, 
    onError, 
    immediate = false, 
    dependencies = [] 
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (...args: P) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (!response.success && response.error) {
        throw new Error(response.error.message);
      }
      
      setData(response.data);
      onSuccess?.(response.data);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as P));
    }
  }, [immediate, execute, ...dependencies]);

  return { data, loading, error, execute };
}

export default useApiRequest; 