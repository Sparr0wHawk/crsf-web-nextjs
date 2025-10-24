import type { IOperationTableAPI } from './contracts/operationTable.contract';
import { MockOperationTableAPI } from './implementations/mockApi';

/**
 * API Factory - Central place to switch between API implementations
 * 
 * In POC: Returns MockOperationTableAPI
 * In Production: Returns RealOperationTableAPI
 * 
 * Switch via environment variable: NEXT_PUBLIC_USE_MOCK_API
 */

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

let apiInstance: IOperationTableAPI | null = null;

export function getOperationTableAPI(): IOperationTableAPI {
  if (!apiInstance) {
    if (USE_MOCK_API) {
      console.log('🎭 Using Mock API (POC Mode)');
      apiInstance = new MockOperationTableAPI();
    } else {
      // In production, this would return RealOperationTableAPI
      console.log('🌐 Using Real API (Production Mode)');
      throw new Error('Real API not implemented yet. Set NEXT_PUBLIC_USE_MOCK_API=true');
    }
  }
  
  // TypeScript: apiInstance is guaranteed to be non-null here
  return apiInstance!;
}

/**
 * Reset API instance (useful for testing)
 */
export function resetAPIInstance() {
  apiInstance = null;
}
