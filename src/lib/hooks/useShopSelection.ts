/**
 * React Query Hooks for Shop Selection Feature
 * 
 * Provides data fetching hooks for:
 * - Franchisees
 * - Prefectures
 * - Cities (cascading from prefecture)
 * - Shop search
 */

import { useQuery } from '@tanstack/react-query';
import { getShopSelectionAPI } from '@/lib/api/apiFactory';
import type { ShopSearchParams } from '@/lib/api/contracts/shopSelection.contract';

const api = getShopSelectionAPI();

/**
 * Get all franchisees (フランチャイジー)
 */
export function useFranchisees() {
  return useQuery({
    queryKey: ['shopSelection', 'franchisees'],
    queryFn: () => api.getFranchisees(),
    staleTime: 1000 * 60 * 30, // 30 minutes - franchisees don't change often
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Get all prefectures (都道府県)
 * Optionally filtered by franchisee
 */
export function usePrefectures(franchiseeCode?: string) {
  return useQuery({
    queryKey: ['shopSelection', 'prefectures', franchiseeCode],
    queryFn: () => api.getPrefectures(franchiseeCode),
    staleTime: 1000 * 60 * 30, // 30 minutes - prefectures are static
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Get cities for a specific prefecture (市区)
 * Cascading dropdown - only enabled when prefecture is selected
 */
export function useCities(prefectureCode: string | undefined) {
  return useQuery({
    queryKey: ['shopSelection', 'cities', prefectureCode],
    queryFn: () => api.getCities(prefectureCode!),
    enabled: !!prefectureCode, // Only fetch if prefecture is selected
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
  });
}

/**
 * Search for shops based on filter criteria
 */
export function useShopSearch(params: ShopSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['shopSelection', 'search', params],
    queryFn: () => api.searchShops(params),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - shop data might change
    gcTime: 1000 * 60 * 15, // 15 minutes cache
  });
}

/**
 * Get shop details by shop code
 */
export function useShopDetail(shopCode: string | undefined) {
  return useQuery({
    queryKey: ['shopSelection', 'detail', shopCode],
    queryFn: () => api.getShopDetail(shopCode!),
    enabled: !!shopCode,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
