/**
 * Real API Implementation for Operation Table
 * 
 * This class implements IOperationTableAPI using actual HTTP requests
 * to the backend API server.
 */

import type {
  IOperationTableAPI,
  InitializeResponse,
  SearchParams,
  SearchResponse,
  Block,
  VehicleDivision,
  ScheduleUpdate,
  StatusDetail,
} from '../../contracts/operationTable.contract';
import httpClient from './httpClient';
import { APIError } from '../../contracts/operationTable.contract';

export class RealOperationTableAPI implements IOperationTableAPI {
  private basePath = '/api/v1/operation-table';

  /**
   * Initialize page with dropdown data
   * 
   * Backend endpoint: GET /api/v1/operation-table/initialize
   */
  async initialize(): Promise<InitializeResponse> {
    try {
      const response = await httpClient.get<InitializeResponse>(`${this.basePath}/initialize`);
      return response.data;
    } catch (error: any) {
      throw new APIError(
        'Failed to initialize operation table',
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Search for operations
   * 
   * Backend endpoint: POST /api/v1/operation-table/search
   * Request body: SearchParams
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    try {
      const response = await httpClient.post<SearchResponse>(`${this.basePath}/search`, params);
      return response.data;
    } catch (error: any) {
      throw new APIError(
        'Failed to search operations',
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Get blocks for a section (cascading dropdown)
   * 
   * Backend endpoint: GET /api/v1/operation-table/blocks/{sectionCode}
   */
  async getBlocks(sectionCode: string): Promise<Block[]> {
    try {
      const response = await httpClient.get<Block[]>(`${this.basePath}/blocks/${sectionCode}`);
      return response.data;
    } catch (error: any) {
      throw new APIError(
        `Failed to get blocks for section ${sectionCode}`,
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Get vehicle divisions based on disposition division
   * 
   * Backend endpoint: GET /api/v1/operation-table/vehicle-divisions/{dispositionDivision}
   */
  async getVehicleDivisions(dispositionDivision: string): Promise<VehicleDivision[]> {
    try {
      const response = await httpClient.get<VehicleDivision[]>(
        `${this.basePath}/vehicle-divisions/${dispositionDivision}`
      );
      return response.data;
    } catch (error: any) {
      throw new APIError(
        `Failed to get vehicle divisions for ${dispositionDivision}`,
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Update schedule (drag & drop)
   * 
   * Backend endpoint: PUT /api/v1/operation-table/schedule
   * Request body: ScheduleUpdate
   */
  async updateSchedule(update: ScheduleUpdate): Promise<void> {
    try {
      await httpClient.put(`${this.basePath}/schedule`, update);
    } catch (error: any) {
      throw new APIError(
        'Failed to update schedule',
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  /**
   * Get status detail for a piece
   * 
   * Backend endpoint: GET /api/v1/operation-table/status/{pieceId}
   */
  async getStatusDetail(pieceId: string): Promise<StatusDetail> {
    try {
      const response = await httpClient.get<StatusDetail>(`${this.basePath}/status/${pieceId}`);
      return response.data;
    } catch (error: any) {
      throw new APIError(
        `Failed to get status detail for piece ${pieceId}`,
        error.response?.status || 500,
        error.response?.data
      );
    }
  }
}
