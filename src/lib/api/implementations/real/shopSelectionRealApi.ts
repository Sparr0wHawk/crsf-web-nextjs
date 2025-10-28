/**
 * Real API Implementation for Shop Selection (Future Backend Integration)
 * 
 * This is a stub implementation ready for backend integration.
 * Replace the mock logic with actual HTTP calls to your backend.
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

// TODO: Import your HTTP client (axios, fetch, etc.)
// import httpClient from './httpClient';

export class RealShopSelectionAPI implements IShopSelectionAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  }

  /**
   * Get all franchisees
   * 
   * @example Backend endpoint: GET /api/shop-selection/franchisees
   */
  async getFranchisees(): Promise<Franchisee[]> {
    console.log('🌐 Real API: getFranchisees()');
    
    // TODO: Replace with actual API call
    // const response = await httpClient.get<Franchisee[]>(`${this.baseURL}/api/shop-selection/franchisees`);
    // return response.data;
    
    throw new Error('Real API not implemented. Backend endpoint: GET /api/shop-selection/franchisees');
  }

  /**
   * Get all prefectures (optionally filtered by franchisee)
   * 
   * @example Backend endpoint: GET /api/shop-selection/prefectures?franchiseeCode={code}
   */
  async getPrefectures(franchiseeCode?: string): Promise<Prefecture[]> {
    console.log('🌐 Real API: getPrefectures()', franchiseeCode);
    
    // TODO: Replace with actual API call
    // const params = franchiseeCode ? { franchiseeCode } : {};
    // const response = await httpClient.get<Prefecture[]>(
    //   `${this.baseURL}/api/shop-selection/prefectures`,
    //   { params }
    // );
    // return response.data;
    
    throw new Error('Real API not implemented. Backend endpoint: GET /api/shop-selection/prefectures');
  }

  /**
   * Get cities for a specific prefecture
   * 
   * @example Backend endpoint: GET /api/shop-selection/cities/{prefectureCode}
   */
  async getCities(prefectureCode: string): Promise<City[]> {
    console.log('🌐 Real API: getCities()', prefectureCode);
    
    // TODO: Replace with actual API call
    // const response = await httpClient.get<City[]>(
    //   `${this.baseURL}/api/shop-selection/cities/${prefectureCode}`
    // );
    // return response.data;
    
    throw new Error(`Real API not implemented. Backend endpoint: GET /api/shop-selection/cities/${prefectureCode}`);
  }

  /**
   * Search for shops based on filter criteria
   * 
   * @example Backend endpoint: POST /api/shop-selection/search
   */
  async searchShops(params: ShopSearchParams): Promise<ShopSearchResponse> {
    console.log('🌐 Real API: searchShops()', params);
    
    // TODO: Replace with actual API call
    // const response = await httpClient.post<ShopSearchResponse>(
    //   `${this.baseURL}/api/shop-selection/search`,
    //   params
    // );
    // return response.data;
    
    // Example request body:
    // {
    //   "franchiseeCode": "51",
    //   "prefectureCode": "13",
    //   "cityCode": "1304",
    //   "shopName": "新宿",
    //   "address": "東京",
    //   "businessStatus": "1",
    //   "selfServiceOnly": false
    // }
    
    throw new Error('Real API not implemented. Backend endpoint: POST /api/shop-selection/search');
  }

  /**
   * Get shop details by shop code
   * 
   * @example Backend endpoint: GET /api/shop-selection/shops/{shopCode}
   */
  async getShopDetail(shopCode: string): Promise<Shop> {
    console.log('🌐 Real API: getShopDetail()', shopCode);
    
    // TODO: Replace with actual API call
    // const response = await httpClient.get<Shop>(
    //   `${this.baseURL}/api/shop-selection/shops/${shopCode}`
    // );
    // return response.data;
    
    throw new Error(`Real API not implemented. Backend endpoint: GET /api/shop-selection/shops/${shopCode}`);
  }
}

/**
 * Backend API Endpoints Documentation
 * 
 * These are the expected endpoints for backend integration:
 * 
 * 1. GET /api/shop-selection/franchisees
 *    Response: Franchisee[]
 * 
 * 2. GET /api/shop-selection/prefectures?franchiseeCode={code}
 *    Response: Prefecture[]
 * 
 * 3. GET /api/shop-selection/cities/{prefectureCode}
 *    Response: City[]
 * 
 * 4. POST /api/shop-selection/search
 *    Request: ShopSearchParams
 *    Response: ShopSearchResponse
 * 
 * 5. GET /api/shop-selection/shops/{shopCode}
 *    Response: Shop
 * 
 * All types are defined in: src/lib/api/contracts/shopSelection.contract.ts
 */
