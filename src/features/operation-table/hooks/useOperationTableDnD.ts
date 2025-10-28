import { useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { 
  StatusPiece, 
  Operation, 
  SearchParams, 
  ScheduleUpdate 
} from '@/lib/api/contracts/operationTable.contract';
import { 
  validateDragOperation, 
  validateResizeOperation, 
  calculateNewTimes, 
  calculateResizedTimes 
} from '../utils/overlapDetection';
import { canPieceBeDragged, canPieceBeResized } from '../types/reservationTypes';

interface UseOperationTableDnDProps {
  searchParams: SearchParams;
  operations: Operation[]; // All operations for validation
  onScheduleUpdate?: (update: ScheduleUpdate) => void;
  onAddHistoryChange?: (
    actionType: 'drag' | 'resize',
    previousState: {
      pieceId: string;
      operationId: string;
      startTime: Date;
      endTime: Date;
      pieceLength: number;
    },
    newState: {
      pieceId: string;
      operationId: string;
      startTime: Date;
      endTime: Date;
      pieceLength: number;
    },
    targetOperationId?: string
  ) => void;
}

interface UseOperationTableDnDReturn {
  selectedStatus: { piece: StatusPiece; vehicle: Operation } | null;
  activePiece: StatusPiece | null;
  activeResizeHandle: { pieceId: string; position: 'start' | 'end' } | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  };
  handleStatusClick: (piece: StatusPiece, vehicle: Operation) => void;
  handleCloseModal: () => void;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
  handleCloseSnackbar: () => void;
}

/**
 * Custom hook to manage drag-and-drop state and handlers for operation table
 * Handles status modal, drag overlay, resize operations, validation, and snackbar notifications
 */
export function useOperationTableDnD({ 
  searchParams,
  operations,
  onScheduleUpdate,
  onAddHistoryChange,
}: UseOperationTableDnDProps): UseOperationTableDnDReturn {
  const [selectedStatus, setSelectedStatus] = useState<{ piece: StatusPiece; vehicle: Operation } | null>(null);
  const [activePiece, setActivePiece] = useState<StatusPiece | null>(null);
  const [activeResizeHandle, setActiveResizeHandle] = useState<{ pieceId: string; position: 'start' | 'end' } | null>(null);
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleStatusClick = (piece: StatusPiece, vehicle: Operation) => {
    setSelectedStatus({ piece, vehicle });
  };

  const handleCloseModal = () => {
    setSelectedStatus(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const piece = active.data.current?.piece as StatusPiece;
    const resizeHandle = active.data.current?.resizeHandle as { pieceId: string; position: 'start' | 'end' } | undefined;
    
    if (resizeHandle) {
      // This is a resize operation
      setActiveResizeHandle(resizeHandle);
    } else {
      // This is a regular drag operation
      setActivePiece(piece);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePiece(null);
    setActiveResizeHandle(null);

    if (!over) return;

    // Check if this is a resize operation
    const resizeHandle = active.data.current?.resizeHandle as { pieceId: string; position: 'start' | 'end' } | undefined;
    
    if (resizeHandle) {
      // Handle resize operation
      handleResizeEnd(event, resizeHandle);
    } else {
      // Handle drag operation
      handleDragEndInternal(event);
    }
  };

  const handleDragEndInternal = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const sourcePiece = active.data.current?.piece as StatusPiece;
    const sourceOperation = active.data.current?.operation as Operation;
    const targetOperation = over.data.current?.operation as Operation;
    const targetTimeIndex = over.data.current?.timeIndex as number;

    if (!sourcePiece || !sourceOperation || !targetOperation || targetTimeIndex === undefined) return;

    // Check if piece can be dragged
    if (!canPieceBeDragged(sourcePiece)) {
      setSnackbar({
        open: true,
        message: `この予約タイプは移動できません（${sourcePiece.statusType}）`,
        severity: 'error',
      });
      return;
    }

    // Find the source piece's original time slot
    let sourceTimeIndex = 0;
    let currentSlot = 0;
    for (const piece of sourceOperation.pieceInformationList) {
      if (piece.id === sourcePiece.id) {
        sourceTimeIndex = currentSlot;
        break;
      }
      currentSlot += piece.pieceLength;
    }

    // Check if dropped on a different vehicle or time slot
    const isDifferentVehicle = sourceOperation.id !== targetOperation.id;
    const isDifferentTime = targetTimeIndex !== sourceTimeIndex;

    if (isDifferentVehicle || isDifferentTime) {
      // Calculate new start/end times
      const { newStartTime, newEndTime } = calculateNewTimes(
        sourcePiece,
        targetTimeIndex,
        searchParams.searchDate
      );

      // Validate the drag operation
      const validationResult = validateDragOperation(
        sourcePiece,
        sourceOperation,
        targetOperation,
        newStartTime,
        newEndTime,
        operations
      );

      if (!validationResult.valid) {
        setSnackbar({
          open: true,
          message: validationResult.message || '移動できません',
          severity: 'error',
        });
        return;
      }

      // Store previous state for history
      const previousState = {
        pieceId: sourcePiece.id,
        operationId: sourceOperation.id,
        startTime: new Date(sourcePiece.startTime),
        endTime: new Date(sourcePiece.endTime),
        pieceLength: sourcePiece.pieceLength,
      };

      // Create new state
      const newState = {
        pieceId: sourcePiece.id,
        operationId: isDifferentVehicle ? targetOperation.id : sourceOperation.id,
        startTime: newStartTime,
        endTime: newEndTime,
        pieceLength: sourcePiece.pieceLength,
      };

      // Update schedule
      const update: ScheduleUpdate = {
        pieceId: sourcePiece.id,
        operationId: sourceOperation.id,
        newStartTime,
        newEndTime,
        newOperationId: isDifferentVehicle ? targetOperation.id : undefined,
      };

      if (onScheduleUpdate) {
        console.log('🔄 Calling onScheduleUpdate with:', update);
        onScheduleUpdate(update);
        
        // Add to history
        if (onAddHistoryChange) {
          onAddHistoryChange(
            'drag',
            previousState,
            newState,
            isDifferentVehicle ? targetOperation.id : undefined
          );
        }

        let message = '';
        if (isDifferentVehicle && isDifferentTime) {
          message = `「${sourceOperation.carName}」から「${targetOperation.carName}」へ移動し、時間を変更しました`;
        } else if (isDifferentVehicle) {
          message = `「${sourceOperation.carName}」から「${targetOperation.carName}」へ移動しました`;
        } else {
          message = `時間を変更しました（${targetTimeIndex}時間目へ）`;
        }
        
        console.log('✅ Drag completed:', message);
        setSnackbar({
          open: true,
          message,
          severity: 'success',
        });
      }
    }
  };

  const handleResizeEnd = (
    event: DragEndEvent,
    resizeHandle: { pieceId: string; position: 'start' | 'end' }
  ) => {
    const { active, delta } = event;

    const sourcePiece = active.data.current?.piece as StatusPiece;
    const sourceOperation = active.data.current?.operation as Operation;

    if (!sourcePiece || !sourceOperation) return;

    // Check if piece can be resized
    if (!canPieceBeResized(sourcePiece)) {
      setSnackbar({
        open: true,
        message: `この予約タイプはリサイズできません（${sourcePiece.statusType}）`,
        severity: 'error',
      });
      return;
    }

    // Calculate new times based on delta (in pixels) and time slot width
    // Assuming each time slot is 60 pixels wide (1 hour)
    const TIME_SLOT_WIDTH = 60; // pixels per hour
    const hoursChanged = Math.round(delta.x / TIME_SLOT_WIDTH);

    if (hoursChanged === 0) return; // No change

    const { newStartTime, newEndTime } = calculateResizedTimes(
      sourcePiece,
      resizeHandle.position,
      hoursChanged
    );

    // Validate the resize operation
    const validationResult = validateResizeOperation(
      sourcePiece,
      sourceOperation,
      newStartTime,
      newEndTime,
      operations
    );

    if (!validationResult.valid) {
      setSnackbar({
        open: true,
        message: validationResult.message || 'リサイズできません',
        severity: 'error',
      });
      return;
    }

    // Store previous state for history
    const previousState = {
      pieceId: sourcePiece.id,
      operationId: sourceOperation.id,
      startTime: new Date(sourcePiece.startTime),
      endTime: new Date(sourcePiece.endTime),
      pieceLength: sourcePiece.pieceLength,
    };

    // Create new state
    const newPieceLength = Math.round((newEndTime.getTime() - newStartTime.getTime()) / (60 * 60 * 1000));
    const newState = {
      pieceId: sourcePiece.id,
      operationId: sourceOperation.id,
      startTime: newStartTime,
      endTime: newEndTime,
      pieceLength: newPieceLength,
    };

    // Update schedule
    const update: ScheduleUpdate = {
      pieceId: sourcePiece.id,
      operationId: sourceOperation.id,
      newStartTime,
      newEndTime,
    };

    if (onScheduleUpdate) {
      onScheduleUpdate(update);
      
      // Add to history
      if (onAddHistoryChange) {
        onAddHistoryChange('resize', previousState, newState);
      }

      const direction = resizeHandle.position === 'start' ? '開始' : '終了';
      setSnackbar({
        open: true,
        message: `${direction}時刻を${Math.abs(hoursChanged)}時間${hoursChanged > 0 ? '延長' : '短縮'}しました`,
        severity: 'success',
      });
    }
  };

  const handleDragCancel = () => {
    setActivePiece(null);
    setActiveResizeHandle(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return {
    selectedStatus,
    activePiece,
    activeResizeHandle,
    snackbar,
    handleStatusClick,
    handleCloseModal,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleCloseSnackbar,
  };
}
