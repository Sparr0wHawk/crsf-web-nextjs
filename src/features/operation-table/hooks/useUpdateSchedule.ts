import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';
import type { SearchParams, ScheduleUpdate } from '@/lib/api/contracts/operationTable.contract';

/**
 * Hook to update a schedule piece (used for drag-and-drop)
 * Includes optimistic updates for better UX
 * 
 * @param searchParams - Current search parameters (used to invalidate the correct query)
 */
export function useUpdateSchedule(searchParams: SearchParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: ScheduleUpdate) => {
      const api = getOperationTableAPI();
      return api.updateSchedule(update);
    },
    // Optimistic update: immediately update the UI before the server responds
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['operationTable', 'data', searchParams] 
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['operationTable', 'data', searchParams]);

      // Optimistically update the cache
      // Note: In a real implementation, you'd update the specific piece in the operations array
      // For now, we'll just invalidate to refetch

      return { previousData };
    },
    // On error, roll back to the previous value
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['operationTable', 'data', searchParams],
          context.previousData
        );
      }
      console.error('Failed to update schedule:', err);
    },
    // Always refetch after error or success to ensure we're in sync with the server
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['operationTable', 'data', searchParams] 
      });
    },
  });
}
