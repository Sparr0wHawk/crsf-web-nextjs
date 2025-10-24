import { useQuery } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';

/**
 * Hook to fetch initial data for operation table (sections, blocks, vehicle divisions)
 * Used to populate dropdown options in the search form
 */
export function useOperationTableInit() {
  return useQuery({
    queryKey: ['operationTable', 'init'],
    queryFn: async () => {
      const api = getOperationTableAPI();
      return api.initialize();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - dropdown data doesn't change often
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
  });
}
