/**
 * React Query Hook: Confirm Schedule Changes
 * 
 * Mutation hook for confirming and persisting all schedule changes.
 * Works with both Mock API (localStorage) and Real API (backend).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';
import type { ScheduleUpdate } from '@/lib/api/contracts/operationTable.contract';

/**
 * Hook to confirm and save all schedule changes
 * 
 * @example
 * ```tsx
 * const confirmMutation = useConfirmScheduleChanges();
 * 
 * const handleConfirm = async (changes: ScheduleUpdate[]) => {
 *   await confirmMutation.mutateAsync(changes);
 *   alert('Changes saved!');
 * };
 * ```
 */
export function useConfirmScheduleChanges() {
  const queryClient = useQueryClient();
  const api = getOperationTableAPI();

  return useMutation({
    mutationFn: async (changes: ScheduleUpdate[]) => {
      console.log('🔄 Confirming schedule changes:', changes.length, 'changes');
      await api.confirmScheduleChanges(changes);
    },

    onSuccess: (_, changes) => {
      console.log('✅ Schedule changes confirmed successfully');
      
      // Invalidate operation table data to refetch with saved changes
      queryClient.invalidateQueries({ queryKey: ['operationTableData'] });
      
      // Optional: Show success notification
      // You can add a toast/snackbar here
    },

    onError: (error, changes) => {
      console.error('❌ Failed to confirm schedule changes:', error);
      
      // Optional: Show error notification
      // You can add a toast/snackbar here
    },
  });
}
