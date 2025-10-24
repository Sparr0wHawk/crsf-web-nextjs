/**
 * Mock API Implementation for POC
 * 
 * This class implements IOperationTableAPI using hardcoded mock data.
 * It simulates network delays to make the POC realistic.
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
  OperationTableHeader,
} from '../../contracts/operationTable.contract';

import {
  mockSections,
  mockBlocks,
  mockVehicleDivisions,
  mockSortOptions,
  mockDispositionDivisions,
  mockOperations,
} from './operationTableMockData';

export class MockOperationTableAPI implements IOperationTableAPI {
  private delay = 500; // Simulate 500ms network latency

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * Initialize page with dropdown data
   */
  async initialize(): Promise<InitializeResponse> {
    console.log('📡 Mock API: initialize()');
    await this.simulateDelay();

    return {
      sections: mockSections,
      vehicleDivisions: mockVehicleDivisions,
      sortOptions: mockSortOptions,
      dispositionAndUsingDivisions: mockDispositionDivisions,
      defaultSearchDate: new Date(),
    };
  }

  /**
   * Search for operations
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    console.log('📡 Mock API: search()', params);
    await this.simulateDelay();

    // Filter operations based on params
    let filteredOps = [...mockOperations];

    if (params.sectionCode) {
      filteredOps = filteredOps.filter((op) => op.sectionCode === params.sectionCode);
    }

    if (params.blockCode) {
      filteredOps = filteredOps.filter((op) => op.blockCode === params.blockCode);
    }

    if (params.shopCode) {
      filteredOps = filteredOps.filter(
        (op) =>
          op.dispositionShopName.includes(params.shopCode!) ||
          op.usingShopName.includes(params.shopCode!)
      );
    }

    if (params.classCodes && params.classCodes.length > 0) {
      filteredOps = filteredOps.filter((op) =>
        params.classCodes!.some((code) => code && op.classCode.includes(code))
      );
    }

    // Generate header based on search scope
    const header = this.generateHeader(params.searchDate, params.searchScope);

    return {
      header,
      operations: filteredOps,
    };
  }

  /**
   * Get blocks for a section (cascading dropdown)
   */
  async getBlocks(sectionCode: string): Promise<Block[]> {
    console.log('📡 Mock API: getBlocks()', sectionCode);
    await this.simulateDelay();

    return mockBlocks.filter((block) => block.sectionCode === sectionCode);
  }

  /**
   * Get vehicle divisions based on disposition division
   */
  async getVehicleDivisions(dispositionDivision: string): Promise<VehicleDivision[]> {
    console.log('📡 Mock API: getVehicleDivisions()', dispositionDivision);
    await this.simulateDelay();

    return mockVehicleDivisions.filter((div) =>
      div.applicableFor.includes(dispositionDivision)
    );
  }

  /**
   * Update schedule (drag & drop)
   */
  async updateSchedule(update: ScheduleUpdate): Promise<void> {
    console.log('📡 Mock API: updateSchedule()', update);
    await this.simulateDelay();

    // Find and update the piece in mock data
    const sourceOperation = mockOperations.find(op => op.id === update.operationId);
    if (!sourceOperation) {
      throw new Error(`Operation ${update.operationId} not found`);
    }

    const pieceIndex = sourceOperation.pieceInformationList.findIndex(p => p.id === update.pieceId);
    if (pieceIndex === -1) {
      throw new Error(`Piece ${update.pieceId} not found`);
    }

    const piece = sourceOperation.pieceInformationList[pieceIndex];
    
    // If moving to a different vehicle, remove from source and add to target
    if (update.newOperationId && update.newOperationId !== update.operationId) {
      const targetOperation = mockOperations.find(op => op.id === update.newOperationId);
      if (!targetOperation) {
        throw new Error(`Target operation ${update.newOperationId} not found`);
      }

      // Remove from source
      sourceOperation.pieceInformationList.splice(pieceIndex, 1);
      
      // Update piece times and add to target
      const updatedPiece = {
        ...piece,
        startTime: update.newStartTime,
        endTime: update.newEndTime,
      };
      
      // Insert in chronological order
      const insertIndex = targetOperation.pieceInformationList.findIndex(
        p => p.startTime > update.newStartTime
      );
      if (insertIndex === -1) {
        targetOperation.pieceInformationList.push(updatedPiece);
      } else {
        targetOperation.pieceInformationList.splice(insertIndex, 0, updatedPiece);
      }
    } else {
      // Just update times in same vehicle
      piece.startTime = update.newStartTime;
      piece.endTime = update.newEndTime;
      
      // Re-sort pieces by start time
      sourceOperation.pieceInformationList.sort((a, b) => 
        a.startTime.getTime() - b.startTime.getTime()
      );
    }

    console.log('✅ Schedule updated successfully (mock)');
  }

  /**
   * Get status detail
   */
  async getStatusDetail(pieceId: string): Promise<StatusDetail> {
    console.log('📡 Mock API: getStatusDetail()', pieceId);
    await this.simulateDelay();

    // Find the piece in mock data
    for (const op of mockOperations) {
      const piece = op.pieceInformationList.find((p) => p.id === pieceId);
      if (piece) {
        return {
          ...piece,
          vehicleInfo: {
            registNumber: op.registNumber,
            carName: op.carName,
            classCode: op.classCode,
          },
          fullDetails: piece.details,
        };
      }
    }

    throw new Error(`Piece not found: ${pieceId}`);
  }

  /**
   * Generate table header based on search params
   */
  private generateHeader(
    searchDate: Date,
    scope: '72h' | '2weeks' | undefined
  ): OperationTableHeader {
    const dates: string[] = [];
    const days = scope === '2weeks' ? 14 : 3; // 72h = 3 days, 2weeks = 14 days

    // Generate date list with day of week
    for (let i = 0; i < days; i++) {
      const date = new Date(searchDate);
      date.setDate(date.getDate() + i);
      dates.push(this.formatDate(date));
    }

    const hoursPerDay = 24; // 1-hour based grid
    const meshPerHour = 1; // 1 mesh per hour
    const meshPerDay = hoursPerDay * meshPerHour;

    return {
      dateList: dates,
      timeList: dates, // timeList now contains dates for header display
      graphMeshCount: days * hoursPerDay, // Total hours across all days
      dateMeshCount: meshPerDay,
      timeMeshCount: meshPerHour,
    };
  }

  /**
   * Format date as MM/DD(曜)
   */
  private formatDate(date: Date): string {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}(${dayOfWeek})`;
  }
}
