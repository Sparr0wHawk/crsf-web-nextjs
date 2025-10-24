/**
 * Vehicle Reservation API Contract
 * 
 * This interface defines all APIs related to vehicle reservation search
 */

// ============================================================================
// Request/Response Types
// ============================================================================

/**
 * Search parameters for reservation search
 */
export interface ReservationSearchParams {
  /** Start date for search range */
  startDate: Date;
  /** End date for search range */
  endDate: Date;
  /** Optional: Filter by customer name */
  customerName?: string;
  /** Optional: Filter by reservation status */
  status?: ReservationStatus;
  /** Optional: Filter by shop code */
  shopCode?: string;
  /** Optional: Filter by vehicle class */
  classCode?: string;
}

/**
 * Reservation status enum
 */
export type ReservationStatus = 'pending' | 'confirmed' | 'in-use' | 'completed' | 'cancelled';

/**
 * Reservation entity
 */
export interface Reservation {
  /** Unique reservation ID */
  id: string;
  /** Reservation number (visible to customer) */
  reservationNumber: string;
  /** Customer information */
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  /** Vehicle information */
  vehicle: {
    registNumber: string;
    carName: string;
    classCode: string;
  };
  /** Rental period */
  rental: {
    startTime: Date;
    endTime: Date;
    pickupShop: string;
    returnShop: string;
  };
  /** Reservation status */
  status: ReservationStatus;
  /** Total amount (JPY) */
  totalAmount: number;
  /** Created timestamp */
  createdAt: Date;
}

/**
 * Search response
 */
export interface ReservationSearchResponse {
  /** List of reservations */
  reservations: Reservation[];
  /** Total count (for pagination) */
  totalCount: number;
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
}

/**
 * Shop master data for dropdown
 */
export interface Shop {
  code: string;
  name: string;
  region: string;
}

/**
 * Vehicle class master data for dropdown
 */
export interface VehicleClass {
  code: string;
  name: string;
  category: string;
}

// ============================================================================
// API Interface (Contract)
// ============================================================================

/**
 * Vehicle Reservation API Interface
 * 
 * All implementations (Mock/Real) must follow this contract
 */
export interface IVehicleReservationAPI {
  /**
   * Get all shops for dropdown
   */
  getShops(): Promise<Shop[]>;

  /**
   * Get all vehicle classes for dropdown
   */
  getVehicleClasses(): Promise<VehicleClass[]>;

  /**
   * Search reservations by criteria
   */
  searchReservations(params: ReservationSearchParams): Promise<ReservationSearchResponse>;

  /**
   * Get single reservation detail
   */
  getReservationDetail(reservationId: string): Promise<Reservation>;

  /**
   * Cancel a reservation
   */
  cancelReservation(reservationId: string, reason: string): Promise<void>;
}

// ============================================================================
// Custom Error
// ============================================================================

export class ReservationAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ReservationAPIError';
  }
}
