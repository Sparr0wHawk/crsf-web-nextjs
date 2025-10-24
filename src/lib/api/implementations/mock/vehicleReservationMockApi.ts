/**
 * Mock Implementation for Vehicle Reservation API
 * 
 * Simulates backend API with realistic delays and data
 */

import type {
  IVehicleReservationAPI,
  Shop,
  VehicleClass,
  ReservationSearchParams,
  ReservationSearchResponse,
  Reservation,
} from '../../contracts/vehicleReservation.contract';
import { ReservationAPIError } from '../../contracts/vehicleReservation.contract';
import { mockShops, mockVehicleClasses, mockReservations } from './vehicleReservationMockData';

export class MockVehicleReservationAPI implements IVehicleReservationAPI {
  private delay = 500; // Simulate 500ms network latency

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Get all shops for dropdown
   */
  async getShops(): Promise<Shop[]> {
    console.log('📡 Mock API: getShops()');
    await this.simulateDelay();
    return mockShops;
  }

  /**
   * Get all vehicle classes for dropdown
   */
  async getVehicleClasses(): Promise<VehicleClass[]> {
    console.log('📡 Mock API: getVehicleClasses()');
    await this.simulateDelay();
    return mockVehicleClasses;
  }

  /**
   * Search reservations by criteria
   */
  async searchReservations(params: ReservationSearchParams): Promise<ReservationSearchResponse> {
    console.log('📡 Mock API: searchReservations()', params);
    await this.simulateDelay();

    // Filter reservations based on params
    let filtered = [...mockReservations];

    // Filter by date range
    filtered = filtered.filter((res) => {
      const resStart = res.rental.startTime;
      return resStart >= params.startDate && resStart <= params.endDate;
    });

    // Filter by customer name (partial match)
    if (params.customerName) {
      const searchName = params.customerName.toLowerCase();
      filtered = filtered.filter((res) =>
        res.customer.name.toLowerCase().includes(searchName)
      );
    }

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((res) => res.status === params.status);
    }

    // Filter by shop (pickup or return)
    if (params.shopCode) {
      const shopName = mockShops.find((s) => s.code === params.shopCode)?.name;
      if (shopName) {
        filtered = filtered.filter(
          (res) =>
            res.rental.pickupShop.includes(shopName) ||
            res.rental.returnShop.includes(shopName)
        );
      }
    }

    // Filter by vehicle class
    if (params.classCode) {
      filtered = filtered.filter((res) => res.vehicle.classCode === params.classCode);
    }

    // Simple pagination (10 items per page)
    const PAGE_SIZE = 10;
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const currentPage = 1; // In real app, this would come from params

    const paginatedResults = filtered.slice(0, PAGE_SIZE);

    return {
      reservations: paginatedResults,
      totalCount,
      currentPage,
      totalPages,
    };
  }

  /**
   * Get single reservation detail
   */
  async getReservationDetail(reservationId: string): Promise<Reservation> {
    console.log('📡 Mock API: getReservationDetail()', reservationId);
    await this.simulateDelay();

    const reservation = mockReservations.find((res) => res.id === reservationId);
    
    if (!reservation) {
      throw new ReservationAPIError(
        `予約が見つかりません: ${reservationId}`,
        404
      );
    }

    return reservation;
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(reservationId: string, reason: string): Promise<void> {
    console.log('📡 Mock API: cancelReservation()', { reservationId, reason });
    await this.simulateDelay();

    const reservation = mockReservations.find((res) => res.id === reservationId);
    
    if (!reservation) {
      throw new ReservationAPIError(
        `予約が見つかりません: ${reservationId}`,
        404
      );
    }

    // Check if cancellation is allowed
    if (reservation.status === 'completed') {
      throw new ReservationAPIError(
        '完了済みの予約はキャンセルできません',
        400
      );
    }

    if (reservation.status === 'cancelled') {
      throw new ReservationAPIError(
        'この予約は既にキャンセルされています',
        400
      );
    }

    // Simulate cancellation
    reservation.status = 'cancelled';
    console.log('✅ Reservation cancelled successfully (mock)');
  }
}
