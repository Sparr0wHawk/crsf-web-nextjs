import { useQuery } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';
import type { SearchParams } from '@/lib/api/contracts/operationTable.contract';

/**
 * Hook to fetch operation table data based on search parameters
 * This is the main data hook for the operation table display
 * 
 * @param params - Search parameters for filtering the operation table
 * @param enabled - Whether to enable the query (default: true)
 */
export function useOperationTableData(params: SearchParams, enabled = true) {
  return useQuery({
    queryKey: ['operationTable', 'data', params],
    queryFn: async () => {
      const api = getOperationTableAPI();
      return api.search(params);
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - operation data changes more frequently
    gcTime: 1000 * 60 * 15, // 15 minutes cache time
    // Refetch on window focus to ensure data is fresh
    refetchOnWindowFocus: true,
  });
}
