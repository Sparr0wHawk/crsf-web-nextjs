import { useQuery } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';

/**
 * Hook to fetch vehicle divisions for a specific deployment type
 * Used for cascading dropdown: 配備運用区分 → 車両区分
 * 
 * @param deploymentTypeId - The deployment type ID to fetch vehicle divisions for
 * @param enabled - Whether to enable the query (default: true when deploymentTypeId exists)
 */
export function useVehicleDivisions(deploymentTypeId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['operationTable', 'vehicleDivisions', deploymentTypeId],
    queryFn: async () => {
      if (!deploymentTypeId) {
        return [];
      }
      const api = getOperationTableAPI();
      return api.getVehicleDivisions(deploymentTypeId);
    },
    enabled: enabled && !!deploymentTypeId, // Only fetch when enabled and deploymentTypeId exists
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes cache time
  });
}
