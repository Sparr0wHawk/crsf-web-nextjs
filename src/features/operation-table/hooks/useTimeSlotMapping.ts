import { useMemo } from 'react';
import type { Operation, SearchParams, StatusPiece } from '@/lib/api/contracts/operationTable.contract';

/**
 * Custom hook to calculate time slot mapping for a vehicle operation
 * Maps each time slot index (hour) to the corresponding status piece
 */
export function useTimeSlotMapping(operation: Operation, searchParams: SearchParams) {
  return useMemo(() => {
    const timeSlotMap = new Map<number, StatusPiece>();
    const baseDate = new Date(searchParams.searchDate);
    baseDate.setHours(0, 0, 0, 0); // Start of search date
    
    operation.pieceInformationList.forEach((piece) => {
      // Calculate the time slot index based on actual startTime
      const hoursSinceBase = Math.floor(
        (piece.startTime.getTime() - baseDate.getTime()) / (60 * 60 * 1000)
      );
      
      // Place piece in the correct time slots
      for (let i = 0; i < piece.pieceLength; i++) {
        timeSlotMap.set(hoursSinceBase + i, piece);
      }
    });

    return timeSlotMap;
  }, [operation, searchParams.searchDate]);
}
