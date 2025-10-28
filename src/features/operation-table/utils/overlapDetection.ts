/**
 * Overlap Detection and Validation Utilities
 * 
 * Provides functions to detect overlapping reservations and validate
 * drag/resize operations based on reservation rules.
 */

import type { StatusPiece, Operation } from '@/lib/api/contracts/operationTable.contract';
import { getRuleForType, type ValidationContext, type ValidationResult } from '../types/reservationTypes';

/**
 * Check if two time ranges overlap
 */
function doTimeRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  // Convert to timestamps for comparison
  const s1 = start1.getTime();
  const e1 = end1.getTime();
  const s2 = start2.getTime();
  const e2 = end2.getTime();
  
  // No overlap if one range ends before the other starts
  return !(e1 <= s2 || e2 <= s1);
}

/**
 * Detect if a piece would overlap with any existing pieces in an operation
 */
export function detectOverlapInOperation(
  operation: Operation,
  newStartTime: Date,
  newEndTime: Date,
  excludePieceId?: string
): { hasOverlap: boolean; overlappingPiece?: StatusPiece } {
  for (const piece of operation.pieceInformationList) {
    // Skip the piece being moved/resized itself
    if (excludePieceId && piece.id === excludePieceId) {
      continue;
    }
    
    // Check for overlap
    if (doTimeRangesOverlap(newStartTime, newEndTime, piece.startTime, piece.endTime)) {
      return {
        hasOverlap: true,
        overlappingPiece: piece,
      };
    }
  }
  
  return { hasOverlap: false };
}

/**
 * Validate a drag operation
 */
export function validateDragOperation(
  piece: StatusPiece,
  sourceOperation: Operation,
  targetOperation: Operation,
  newStartTime: Date,
  newEndTime: Date,
  allOperations: Operation[]
): ValidationResult {
  const rule = getRuleForType(piece.statusType);
  
  // Check if piece can be dragged
  if (!rule.canDrag) {
    return {
      valid: false,
      reason: 'piece-locked',
      message: `${rule.displayName}はドラッグできません`,
    };
  }
  
  // Check for overlap if not allowed
  if (!rule.allowOverlap) {
    const overlapCheck = detectOverlapInOperation(
      targetOperation,
      newStartTime,
      newEndTime,
      sourceOperation.id === targetOperation.id ? piece.id : undefined
    );
    
    if (overlapCheck.hasOverlap) {
      return {
        valid: false,
        reason: 'overlap-detected',
        message: '他の予約と重複しています',
      };
    }
  }
  
  // Custom validation if defined
  if (rule.customValidation) {
    const context: ValidationContext = {
      piece,
      targetOperation,
      newStartTime,
      newEndTime,
      allOperations,
      actionType: 'drag',
    };
    
    const customResult = rule.customValidation(context);
    if (!customResult.valid) {
      return customResult;
    }
  }
  
  return { valid: true };
}

/**
 * Validate a resize operation
 */
export function validateResizeOperation(
  piece: StatusPiece,
  operation: Operation,
  newStartTime: Date,
  newEndTime: Date,
  allOperations: Operation[]
): ValidationResult {
  const rule = getRuleForType(piece.statusType);
  
  // Check if piece can be resized
  if (!rule.canResize) {
    return {
      valid: false,
      reason: 'piece-locked',
      message: `${rule.displayName}はリサイズできません`,
    };
  }
  
  // Validate minimum duration (at least 1 hour)
  const durationMs = newEndTime.getTime() - newStartTime.getTime();
  const durationHours = durationMs / (60 * 60 * 1000);
  
  if (durationHours < 1) {
    return {
      valid: false,
      reason: 'invalid-duration',
      message: '最低1時間の予約が必要です',
    };
  }
  
  // Check for overlap if not allowed
  if (!rule.allowOverlap) {
    const overlapCheck = detectOverlapInOperation(
      operation,
      newStartTime,
      newEndTime,
      piece.id
    );
    
    if (overlapCheck.hasOverlap) {
      return {
        valid: false,
        reason: 'overlap-detected',
        message: '他の予約と重複しています',
      };
    }
  }
  
  // Custom validation if defined
  if (rule.customValidation) {
    const context: ValidationContext = {
      piece,
      targetOperation: operation,
      newStartTime,
      newEndTime,
      allOperations,
      actionType: 'resize',
    };
    
    const customResult = rule.customValidation(context);
    if (!customResult.valid) {
      return customResult;
    }
  }
  
  return { valid: true };
}

/**
 * Calculate new times based on time index (for drag operations)
 */
export function calculateNewTimes(
  piece: StatusPiece,
  targetTimeIndex: number,
  searchDate: Date
): { newStartTime: Date; newEndTime: Date } {
  const baseDate = new Date(searchDate);
  baseDate.setHours(0, 0, 0, 0);
  
  // Calculate new start time based on target time index (hours since base)
  const newStartTime = new Date(baseDate.getTime() + targetTimeIndex * 60 * 60 * 1000);
  
  // Keep the same duration
  const duration = piece.endTime.getTime() - piece.startTime.getTime();
  const newEndTime = new Date(newStartTime.getTime() + duration);
  
  return { newStartTime, newEndTime };
}

/**
 * Calculate new times based on resize (for resize operations)
 */
export function calculateResizedTimes(
  piece: StatusPiece,
  resizeEdge: 'start' | 'end',
  deltaHours: number
): { newStartTime: Date; newEndTime: Date } {
  let newStartTime = new Date(piece.startTime);
  let newEndTime = new Date(piece.endTime);
  
  if (resizeEdge === 'start') {
    // Resizing from the left edge
    newStartTime = new Date(piece.startTime.getTime() + deltaHours * 60 * 60 * 1000);
  } else {
    // Resizing from the right edge
    newEndTime = new Date(piece.endTime.getTime() + deltaHours * 60 * 60 * 1000);
  }
  
  return { newStartTime, newEndTime };
}
