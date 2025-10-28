/**
 * API Contract for Shop Selection Feature
 * 
 * Used in various search forms where user needs to select a shop (営業所)
 * with cascading filters: Franchisee → Prefecture → City → Shop
 */

// ============================================================================
// API Interface
// ============================================================================

export interface IShopSelectionAPI {
  /**
   * Get all franchisees (フランチャイジー)
   */
  getFranchisees(): Promise<Franchisee[]>;

  /**
   * Get all prefectures (都道府県)
   * Optionally filtered by franchisee
   */
  getPrefectures(franchiseeCode?: string): Promise<Prefecture[]>;

  /**
   * Get cities/wards (市区) for a specific prefecture
   */
  getCities(prefectureCode: string): Promise<City[]>;

  /**
   * Search for shops based on filter criteria
   */
  searchShops(params: ShopSearchParams): Promise<ShopSearchResponse>;

  /**
   * Get shop details by shop code
   */
  getShopDetail(shopCode: string): Promise<Shop>;
}

// ============================================================================
// Data Types
// ============================================================================

/**
 * Franchisee (フランチャイジー)
 */
export interface Franchisee {
  code: string;
  name: string;
  shortName?: string;
}

/**
 * Prefecture (都道府県)
 */
export interface Prefecture {
  code: string; // "01" to "47"
  name: string; // "北海道", "東京都", etc.
  region: string; // "北海道", "関東", "近畿", etc.
}

/**
 * City/Ward (市区)
 */
export interface City {
  code: string;
  name: string;
  prefectureCode: string;
}

/**
 * Shop (営業所)
 */
export interface Shop {
  code: string; // Shop code (e.g., "12345")
  name: string; // Shop name (e.g., "札幌駅北口店")
  
  // Franchisee info
  franchiseeCode: string;
  franchiseeName: string;
  
  // Location
  prefectureCode: string;
  prefectureName: string;
  cityCode?: string;
  cityName?: string;
  address: string; // Full address
  
  // Status
  businessStatus: ShopBusinessStatus;
  isSelfService: boolean; // セルフ取扱営業所
  
  // Additional info
  phoneNumber?: string;
  postalCode?: string;
}

/**
 * Shop Business Status (営業状態)
 */
export enum ShopBusinessStatus {
  NORMAL = '1', // 通常
  CLOSED = '2', // 休業
  SUSPENDED = '3', // 停止
}

// ============================================================================
// Search Parameters
// ============================================================================

export interface ShopSearchParams {
  // Franchisee filter
  franchiseeCode?: string;
  
  // Location filters
  prefectureCode?: string;
  cityCode?: string;
  
  // Shop name/address (partial match)
  shopName?: string;
  address?: string;
  
  // Status filters
  businessStatus?: ShopBusinessStatus;
  selfServiceOnly?: boolean; // セルフ取扱営業所のみ
  
  // FEE checkbox (business logic TBD - might affect franchisee filter)
  feeOnly?: boolean;
}

export interface ShopSearchResponse {
  shops: Shop[];
  totalCount: number;
}

// ============================================================================
// UI Helper Types
// ============================================================================

/**
 * Selected shop data to return to parent form
 */
export interface SelectedShop {
  code: string;
  name: string;
  address: string;
}
