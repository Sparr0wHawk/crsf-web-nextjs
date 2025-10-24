import type { IOperationTableAPI } from './contracts/operationTable.contract';
import type { IVehicleReservationAPI } from './contracts/vehicleReservation.contract';
import { MockOperationTableAPI } from './implementations/mock/operationTableMockApi';
import { RealOperationTableAPI } from './implementations/real/operationTableRealApi';
import { MockVehicleReservationAPI } from './implementations/mock/vehicleReservationMockApi';
import { RealVehicleReservationAPI } from './implementations/real/vehicleReservationRealApi';

/**
 * API Factory - Central place to switch between API implementations
 * 
 * In POC: Returns Mock APIs
 * In Production: Returns Real APIs
 * 
 * Switch via environment variable: NEXT_PUBLIC_USE_MOCK_API
 */

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Singleton instances for each API
let operationTableInstance: IOperationTableAPI | null = null;
let vehicleReservationInstance: IVehicleReservationAPI | null = null;

/**
 * Get Operation Table API instance
 */
export function getOperationTableAPI(): IOperationTableAPI {
  if (!operationTableInstance) {
    if (USE_MOCK_API) {
      console.log('🎭 Using Mock Operation Table API (POC Mode)');
      operationTableInstance = new MockOperationTableAPI();
    } else {
      console.log('🌐 Using Real Operation Table API (Production Mode)');
      operationTableInstance = new RealOperationTableAPI();
    }
  }
  return operationTableInstance!;
}

/**
 * Get Vehicle Reservation API instance
 */
export function getVehicleReservationAPI(): IVehicleReservationAPI {
  if (!vehicleReservationInstance) {
    if (USE_MOCK_API) {
      console.log('🎭 Using Mock Vehicle Reservation API (POC Mode)');
      vehicleReservationInstance = new MockVehicleReservationAPI();
    } else {
      console.log('🌐 Using Real Vehicle Reservation API (Production Mode)');
      vehicleReservationInstance = new RealVehicleReservationAPI();
    }
  }
  return vehicleReservationInstance!;
}

/**
 * Reset API instances (useful for testing)
 */
export function resetAPIInstances() {
  operationTableInstance = null;
  vehicleReservationInstance = null;
}
