/**
 * Real Implementation for Vehicle Reservation API
 * 
 * Makes actual HTTP requests to the backend API
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
import httpClient from './httpClient';

export class RealVehicleReservationAPI implements IVehicleReservationAPI {
  private basePath = '/api/v1/reservations';

  /**
   * Get all shops for dropdown
   * 
   * Backend endpoint: GET /api/v1/reservations/shops
   */
  async getShops(): Promise<Shop[]> {
    try {
      const response = await httpClient.get<Shop[]>(`${this.basePath}/shops`);
      return response.data;
    } catch (error: any) {
      throw new ReservationAPIError(
        'Failed to get shops',
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Get all vehicle classes for dropdown
   * 
   * Backend endpoint: GET /api/v1/reservations/vehicle-classes
   */
  async getVehicleClasses(): Promise<VehicleClass[]> {
    try {
      const response = await httpClient.get<VehicleClass[]>(`${this.basePath}/vehicle-classes`);
      return response.data;
    } catch (error: any) {
      throw new ReservationAPIError(
        'Failed to get vehicle classes',
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Search reservations by criteria
   * 
   * Backend endpoint: POST /api/v1/reservations/search
   * Request body: ReservationSearchParams
   */
  async searchReservations(params: ReservationSearchParams): Promise<ReservationSearchResponse> {
    try {
      const response = await httpClient.post<ReservationSearchResponse>(
        `${this.basePath}/search`,
        params
      );
      return response.data;
    } catch (error: any) {
      throw new ReservationAPIError(
        'Failed to search reservations',
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Get single reservation detail
   * 
   * Backend endpoint: GET /api/v1/reservations/{reservationId}
   */
  async getReservationDetail(reservationId: string): Promise<Reservation> {
    try {
      const response = await httpClient.get<Reservation>(`${this.basePath}/${reservationId}`);
      return response.data;
    } catch (error: any) {
      throw new ReservationAPIError(
        `Failed to get reservation detail: ${reservationId}`,
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Cancel a reservation
   * 
   * Backend endpoint: POST /api/v1/reservations/{reservationId}/cancel
   * Request body: { reason: string }
   */
  async cancelReservation(reservationId: string, reason: string): Promise<void> {
    try {
      await httpClient.post(`${this.basePath}/${reservationId}/cancel`, { reason });
    } catch (error: any) {
      throw new ReservationAPIError(
        `Failed to cancel reservation: ${reservationId}`,
        error.response?.status || 500,
        error.response?.data
      );
    }
  }
}
