/**
 * Mock API Implementation for Shop Selection
 * 
 * Simulates network delays and provides filtering logic for shop search
 */

import type {
  IShopSelectionAPI,
  Franchisee,
  Prefecture,
  City,
  Shop,
  ShopSearchParams,
  ShopSearchResponse,
} from '../../contracts/shopSelection.contract';

import {
  mockFranchisees,
  mockPrefectures,
  mockCities,
  mockShops,
} from './shopSelectionMockData';

export class MockShopSelectionAPI implements IShopSelectionAPI {
  private delay = 300; // Simulate 300ms network latency

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Get all franchisees
   */
  async getFranchisees(): Promise<Franchisee[]> {
    console.log('📡 Mock API: getFranchisees()');
    await this.simulateDelay();
    return mockFranchisees;
  }

  /**
   * Get all prefectures (optionally filtered by franchisee)
   */
  async getPrefectures(franchiseeCode?: string): Promise<Prefecture[]> {
    console.log('📡 Mock API: getPrefectures()', franchiseeCode);
    await this.simulateDelay();
    
    // For POC, return all prefectures
    // In real system, might filter based on franchisee territory
    return mockPrefectures;
  }

  /**
   * Get cities for a specific prefecture
   */
  async getCities(prefectureCode: string): Promise<City[]> {
    console.log('📡 Mock API: getCities()', prefectureCode);
    await this.simulateDelay();
    
    const cities = mockCities.filter((city) => city.prefectureCode === prefectureCode);
    return cities;
  }

  /**
   * Search for shops based on filter criteria
   */
  async searchShops(params: ShopSearchParams): Promise<ShopSearchResponse> {
    console.log('📡 Mock API: searchShops()', params);
    await this.simulateDelay();

    let filteredShops = [...mockShops];

    // Filter by franchisee
    if (params.franchiseeCode) {
      filteredShops = filteredShops.filter(
        (shop) => shop.franchiseeCode === params.franchiseeCode
      );
    }

    // Filter by prefecture
    if (params.prefectureCode) {
      filteredShops = filteredShops.filter(
        (shop) => shop.prefectureCode === params.prefectureCode
      );
    }

    // Filter by city
    if (params.cityCode) {
      filteredShops = filteredShops.filter(
        (shop) => shop.cityCode === params.cityCode
      );
    }

    // Filter by shop name (partial match)
    if (params.shopName) {
      const searchTerm = params.shopName.toLowerCase();
      filteredShops = filteredShops.filter((shop) =>
        shop.name.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by address (partial match)
    if (params.address) {
      const searchTerm = params.address.toLowerCase();
      filteredShops = filteredShops.filter((shop) =>
        shop.address.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by business status
    if (params.businessStatus) {
      filteredShops = filteredShops.filter(
        (shop) => shop.businessStatus === params.businessStatus
      );
    }

    // Filter self-service only
    if (params.selfServiceOnly) {
      filteredShops = filteredShops.filter((shop) => shop.isSelfService);
    }

    // FEE filter (for POC, just log it - business logic TBD)
    if (params.feeOnly) {
      console.log('🔍 FEE filter applied (mock - no actual filtering)');
      // In real system, this would filter shops based on FEE classification
    }

    return {
      shops: filteredShops,
      totalCount: filteredShops.length,
    };
  }

  /**
   * Get shop details by shop code
   */
  async getShopDetail(shopCode: string): Promise<Shop> {
    console.log('📡 Mock API: getShopDetail()', shopCode);
    await this.simulateDelay();

    const shop = mockShops.find((s) => s.code === shopCode);
    
    if (!shop) {
      throw new Error(`Shop not found: ${shopCode}`);
    }

    return shop;
  }
}
