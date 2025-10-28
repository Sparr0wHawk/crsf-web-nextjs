/**
 * Operation Table History Manager Hook
 * 
 * Manages undo/redo functionality for drag and resize operations.
 * Tracks up to 10 changes and allows reverting or resetting all changes.
 */

import { useState, useCallback } from 'react';
import type { StatusPiece, Operation } from '@/lib/api/contracts/operationTable.contract';

export type HistoryActionType = 'drag' | 'resize';

export interface PieceState {
  pieceId: string;
  operationId: string;
  startTime: Date;
  endTime: Date;
  pieceLength: number;
}

export interface HistoryEntry {
  /** Unique ID for this history entry */
  id: string;
  
  /** Type of action performed */
  actionType: HistoryActionType;
  
  /** State before the change */
  previousState: PieceState;
  
  /** State after the change */
  newState: PieceState;
  
  /** Timestamp when change was made */
  timestamp: Date;
  
  /** If drag: target operation ID (may differ from source) */
  targetOperationId?: string;
}

const MAX_HISTORY_SIZE = 10;

export function useOperationTableHistory() {
  // Stack of all changes made
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Current position in history (-1 means no changes)
  const [currentIndex, setCurrentIndex] = useState(-1);

  /**
   * Can we undo? (are there any changes to revert)
   */
  const canUndo = currentIndex >= 0;

  /**
   * Can we reset? (are there any changes at all)
   */
  const canReset = history.length > 0;

  /**
   * Do we have any unsaved changes?
   */
  const hasChanges = history.length > 0;

  /**
   * Add a new change to history
   */
  const addChange = useCallback((
    actionType: HistoryActionType,
    previousState: PieceState,
    newState: PieceState,
    targetOperationId?: string
  ) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random()}`,
      actionType,
      previousState,
      newState,
      targetOperationId,
      timestamp: new Date(),
    };

    setHistory(prev => {
      // Remove any "undone" entries after current index
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add new entry
      newHistory.push(entry);
      
      // Limit history size (keep only last MAX_HISTORY_SIZE entries)
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(newHistory.length - MAX_HISTORY_SIZE);
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, MAX_HISTORY_SIZE - 1);
      return newIndex;
    });
  }, [currentIndex]);

  /**
   * Undo the last change (元に戻す)
   */
  const undo = useCallback((): HistoryEntry | null => {
    if (!canUndo) return null;

    const entryToUndo = history[currentIndex];
    setCurrentIndex(prev => prev - 1);
    
    return entryToUndo;
  }, [canUndo, currentIndex, history]);

  /**
   * Reset all changes (やり直し - cancel all)
   */
  const resetAll = useCallback((): HistoryEntry[] => {
    const entriesToReset = [...history];
    
    setHistory([]);
    setCurrentIndex(-1);
    
    return entriesToReset;
  }, [history]);

  /**
   * Confirm changes (確定 - save to database)
   * Clears history as changes are now persisted
   */
  const confirmChanges = useCallback(() => {
    const confirmedChanges = [...history];
    
    setHistory([]);
    setCurrentIndex(-1);
    
    return confirmedChanges;
  }, [history]);

  /**
   * Get current history for debugging
   */
  const getHistory = useCallback(() => history, [history]);

  /**
   * Get number of changes in history
   */
  const getChangeCount = useCallback(() => history.length, [history.length]);

  return {
    // State
    canUndo,
    canReset,
    hasChanges,
    
    // Actions
    addChange,
    undo,
    resetAll,
    confirmChanges,
    
    // Utilities
    getHistory,
    getChangeCount,
  };
}

/**
 * Helper: Create PieceState from StatusPiece
 */
export function createPieceState(
  piece: StatusPiece,
  operationId: string
): PieceState {
  return {
    pieceId: piece.id,
    operationId,
    startTime: new Date(piece.startTime),
    endTime: new Date(piece.endTime),
    pieceLength: piece.pieceLength,
  };
}

/**
 * Helper: Apply history entry to update operation data
 * Returns the updated piece that should be applied
 */
export function applyHistoryEntry(
  entry: HistoryEntry,
  revert: boolean = false
): PieceState {
  // If reverting, use previousState, otherwise use newState
  return revert ? entry.previousState : entry.newState;
}
