/**
 * Custom React Hooks for Vehicle Reservation API
 * 
 * These hooks wrap the API calls with React Query for automatic
 * caching, loading states, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVehicleReservationAPI } from '@/lib/api/apiFactory';
import type { ReservationSearchParams } from '@/lib/api/contracts/vehicleReservation.contract';

const api = getVehicleReservationAPI();

// ============================================================================
// Query Keys (for cache management)
// ============================================================================

const QUERY_KEYS = {
  shops: ['reservations', 'shops'] as const,
  vehicleClasses: ['reservations', 'vehicle-classes'] as const,
  search: (params: ReservationSearchParams) => ['reservations', 'search', params] as const,
  detail: (id: string) => ['reservations', 'detail', id] as const,
};

// ============================================================================
// Queries (Read Operations)
// ============================================================================

/**
 * Get all shops for dropdown
 * 
 * Usage:
 * ```tsx
 * const { data: shops, isLoading, error } = useShops();
 * ```
 */
export function useShops() {
  return useQuery({
    queryKey: QUERY_KEYS.shops,
    queryFn: () => api.getShops(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get all vehicle classes for dropdown
 * 
 * Usage:
 * ```tsx
 * const { data: classes, isLoading, error } = useVehicleClasses();
 * ```
 */
export function useVehicleClasses() {
  return useQuery({
    queryKey: QUERY_KEYS.vehicleClasses,
    queryFn: () => api.getVehicleClasses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Search reservations with automatic re-fetching when params change
 * 
 * Usage:
 * ```tsx
 * const [searchParams, setSearchParams] = useState<ReservationSearchParams>({
 *   startDate: new Date(),
 *   endDate: new Date(),
 * });
 * const { data, isLoading, error } = useReservationSearch(searchParams);
 * ```
 */
export function useReservationSearch(params: ReservationSearchParams) {
  return useQuery({
    queryKey: QUERY_KEYS.search(params),
    queryFn: () => api.searchReservations(params),
    enabled: !!(params.startDate && params.endDate), // Only run if dates provided
  });
}

/**
 * Get single reservation detail
 * 
 * Usage:
 * ```tsx
 * const { data: reservation, isLoading, error } = useReservationDetail('RES-00001');
 * ```
 */
export function useReservationDetail(reservationId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.detail(reservationId || ''),
    queryFn: () => api.getReservationDetail(reservationId!),
    enabled: !!reservationId, // Only run if ID provided
  });
}

// ============================================================================
// Mutations (Write Operations)
// ============================================================================

/**
 * Cancel a reservation with optimistic updates
 * 
 * Usage:
 * ```tsx
 * const cancelMutation = useCancelReservation();
 * 
 * const handleCancel = async () => {
 *   try {
 *     await cancelMutation.mutateAsync({
 *       reservationId: 'RES-00001',
 *       reason: 'Customer requested cancellation',
 *     });
 *     toast.success('予約をキャンセルしました');
 *   } catch (error) {
 *     toast.error('キャンセルに失敗しました');
 *   }
 * };
 * ```
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: string; reason: string }) =>
      api.cancelReservation(reservationId, reason),
    onSuccess: (_, variables) => {
      // Invalidate and refetch reservation detail
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(variables.reservationId),
      });
      
      // Invalidate all search results to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['reservations', 'search'],
      });
    },
  });
}
