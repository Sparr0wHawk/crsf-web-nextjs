import { useQuery } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';

/**
 * Hook to fetch blocks for a specific section
 * Used for cascading dropdown: 部 → ブロック
 * 
 * @param sectionId - The section ID to fetch blocks for
 * @param enabled - Whether to enable the query (default: true when sectionId exists)
 */
export function useBlockList(sectionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['operationTable', 'blocks', sectionId],
    queryFn: async () => {
      if (!sectionId) {
        return [];
      }
      const api = getOperationTableAPI();
      return api.getBlocks(sectionId);
    },
    enabled: enabled && !!sectionId, // Only fetch when enabled and sectionId exists
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
  });
}
