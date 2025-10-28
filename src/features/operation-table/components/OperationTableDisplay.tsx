import { Box, Paper, Table, TableBody, TableContainer, Typography, Snackbar, Alert } from '@mui/material';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useState, useRef } from 'react';
import {
  StatusDetailModal,
  TableHeader,
  VehicleRow,
} from './display-parts';
import { OperationTableActions } from './OperationTableActions';
import { useOperationTableDnD } from '../hooks/useOperationTableDnD';
import { useOperationTableHistory, applyHistoryEntry } from '../hooks/useOperationTableHistory';
import { useConfirmScheduleChanges } from '../hooks/useConfirmScheduleChanges';
import type { SearchResponse, SearchParams, ScheduleUpdate, Operation } from '@/lib/api/contracts/operationTable.contract';

interface OperationTableDisplayProps {
  data: SearchResponse;
  searchParams: SearchParams;
  onScheduleUpdate?: (update: ScheduleUpdate) => void;
}


export function OperationTableDisplay({ data, searchParams, onScheduleUpdate }: OperationTableDisplayProps) {
  const { header, operations: initialOperations } = data;
  
  // Store initial operations snapshot (deep copy to preserve original state)
  const initialOperationsSnapshot = useRef<Operation[]>(
    initialOperations.map(op => ({
      ...op,
      pieceInformationList: op.pieceInformationList.map(piece => ({
        ...piece,
        startTime: new Date(piece.startTime),
        endTime: new Date(piece.endTime),
      })),
    }))
  );
  
  // Local state for operations (allows undo/redo)
  const [operations, setOperations] = useState<Operation[]>(initialOperations);

  // History management hook for undo/redo
  const {
    canUndo,
    canReset,
    hasChanges,
    addChange,
    undo,
    resetAll,
    confirmChanges,
    getChangeCount,
  } = useOperationTableHistory();
  
  // Mutation hook for confirming changes
  const confirmMutation = useConfirmScheduleChanges();

  // Use custom hook for all DnD logic and state management
  const {
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
  } = useOperationTableDnD({ 
    searchParams,
    operations,
    onScheduleUpdate: (update) => {
      // Apply the update to local operations
      setOperations(prev => {
        const newOps = prev.map(op => {
          if (op.id === update.operationId) {
            return {
              ...op,
              pieceInformationList: op.pieceInformationList.map(piece => {
                if (piece.id === update.pieceId) {
                  return {
                    ...piece,
                    startTime: new Date(update.newStartTime),
                    endTime: new Date(update.newEndTime),
                    pieceLength: Math.round(
                      (new Date(update.newEndTime).getTime() - new Date(update.newStartTime).getTime()) / (1000 * 60 * 60)
                    ),
                  };
                }
                return piece;
              }),
            };
          }
          // Handle cross-vehicle drag
          if (update.newOperationId && op.id === update.newOperationId) {
            // Find the piece from source operation
            const sourcePiece = prev
              .find(o => o.id === update.operationId)
              ?.pieceInformationList.find(p => p.id === update.pieceId);
            
            if (sourcePiece) {
              return {
                ...op,
                pieceInformationList: [
                  ...op.pieceInformationList,
                  {
                    ...sourcePiece,
                    startTime: new Date(update.newStartTime),
                    endTime: new Date(update.newEndTime),
                    pieceLength: Math.round(
                      (new Date(update.newEndTime).getTime() - new Date(update.newStartTime).getTime()) / (1000 * 60 * 60)
                    ),
                  },
                ].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
              };
            }
          }
          return op;
        });
        
        // If cross-vehicle drag, remove from source
        if (update.newOperationId && update.newOperationId !== update.operationId) {
          return newOps.map(op => {
            if (op.id === update.operationId) {
              return {
                ...op,
                pieceInformationList: op.pieceInformationList.filter(p => p.id !== update.pieceId),
              };
            }
            return op;
          });
        }
        
        return newOps;
      });
      
      // Don't call parent API callback during drag!
      // API updates only happen when user clicks Confirm button
      // onScheduleUpdate?.(update); // ❌ Removed - causes state sync issues
    },
    onAddHistoryChange: addChange,
  });

  /**
   * Handle Undo button click
   */
  const handleUndo = () => {
    const entry = undo();
    if (!entry) return;

    console.log('🔙 Undoing change:', entry);

    // Revert the change in operations
    const previousState = applyHistoryEntry(entry, true); // revert=true
    const newState = entry.newState;
    
    setOperations(prev => {
      let updatedOps = [...prev];
      
      // Check if this was a cross-vehicle drag
      const wasCrossVehicleDrag = entry.targetOperationId && entry.targetOperationId !== entry.previousState.operationId;
      
      if (wasCrossVehicleDrag) {
        console.log('🔙 Reverting cross-vehicle drag');
        // Move piece back from target to source
        
        // 1. Remove from target vehicle
        updatedOps = updatedOps.map(op => {
          if (op.id === entry.targetOperationId) {
            return {
              ...op,
              pieceInformationList: op.pieceInformationList.filter(p => p.id !== previousState.pieceId),
            };
          }
          return op;
        });
        
        // 2. Add back to source vehicle
        updatedOps = updatedOps.map(op => {
          if (op.id === previousState.operationId) {
            // Find the piece in the current state
            const pieceToRestore = prev
              .find(o => o.id === entry.targetOperationId)
              ?.pieceInformationList.find(p => p.id === previousState.pieceId);
            
            if (pieceToRestore) {
              return {
                ...op,
                pieceInformationList: [
                  ...op.pieceInformationList,
                  {
                    ...pieceToRestore,
                    startTime: previousState.startTime,
                    endTime: previousState.endTime,
                    pieceLength: previousState.pieceLength,
                  },
                ].sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
              };
            }
          }
          return op;
        });
      } else {
        // Same-vehicle move - just update times
        console.log('🔙 Reverting same-vehicle drag');
        updatedOps = updatedOps.map(op => {
          if (op.id === previousState.operationId) {
            return {
              ...op,
              pieceInformationList: op.pieceInformationList.map(piece => {
                if (piece.id === previousState.pieceId) {
                  return {
                    ...piece,
                    startTime: previousState.startTime,
                    endTime: previousState.endTime,
                    pieceLength: previousState.pieceLength,
                  };
                }
                return piece;
              }),
            };
          }
          return op;
        });
      }
      
      return updatedOps;
    });
    
    console.log('✅ Undo complete');
  };

  /**
   * Handle Reset All button click (やり直し)
   * Reverts all changes back to initial state
   */
  const handleResetAll = () => {
    console.log('🔄 Resetting all changes');
    const entries = resetAll();
    
    console.log('🔄 Reverting', entries.length, 'changes, resetting to initial state');
    
    // Reset to initial snapshot (deep copy to avoid reference issues)
    const resetData = initialOperationsSnapshot.current.map(op => ({
      ...op,
      pieceInformationList: op.pieceInformationList.map(piece => ({
        ...piece,
        startTime: new Date(piece.startTime),
        endTime: new Date(piece.endTime),
      })),
    }));
    
    setOperations(resetData);
    console.log('✅ Reset complete - restored initial state');
  };

  /**
   * Handle Confirm button click
   */
  const handleConfirm = async () => {
    console.log('💾 Confirm button clicked');
    const changes = confirmChanges();
    console.log('💾 Changes to confirm:', changes);
    
    if (changes.length === 0) {
      console.log('⚠️ No changes to confirm');
      alert('保存する変更がありません');
      return;
    }

    try {
      // Convert history entries to ScheduleUpdates
      const scheduleUpdates: ScheduleUpdate[] = changes.map(change => ({
        pieceId: change.newState.pieceId,
        operationId: change.previousState.operationId,
        newOperationId: change.targetOperationId || change.newState.operationId,
        newStartTime: change.newState.startTime,
        newEndTime: change.newState.endTime,
      }));
      
      console.log('💾 Calling API with updates:', scheduleUpdates);
      
      // Call the API to save changes (works with both Mock and Real API)
      await confirmMutation.mutateAsync(scheduleUpdates);
      
      console.log('✅ Changes saved successfully');
      
      // Show success message
      alert(`✅ ${changes.length}件の変更を保存しました`);
      
    } catch (error) {
      console.error('❌ Failed to confirm changes:', error);
      alert('❌ 保存に失敗しました');
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <Box sx={{ mb: 2 }}>
        <OperationTableActions
          canUndo={canUndo}
          canReset={canReset}
          hasChanges={hasChanges}
          changeCount={getChangeCount()}
          isConfirming={confirmMutation.isPending}
          onConfirm={handleConfirm}
          onUndo={handleUndo}
          onReset={handleResetAll}
        />
      </Box>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <TableContainer 
          component={Paper} 
          sx={{ 
            maxHeight: 'calc(100vh - 200px)', 
            overflow: 'auto',
            '@media print': {
              maxHeight: 'none',
              overflow: 'visible',
            },
            animation: 'fadeIn 0.3s ease-in',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Table 
            stickyHeader 
            size="small" 
            sx={{ 
              width: 480 + (header.graphMeshCount * 20), // Fixed columns + (hours × cell width)
              tableLayout: 'fixed',
            }}
          >
            <TableHeader header={header} />

            <TableBody>
              {operations.map((operation) => (
                <VehicleRow
                  key={operation.id}
                  operation={operation}
                  header={header}
                  searchParams={searchParams}
                  onStatusClick={handleStatusClick}
                />
              ))}
            </TableBody>
          </Table>

          {/* Empty state */}
          {operations.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                該当する車両がありません
              </Typography>
            </Box>
          )}
        </TableContainer>

        {/* Drag Overlay - Shows a copy of the dragged item */}
        <DragOverlay>
          {activePiece ? (
            <Box
              sx={{
                bgcolor: activePiece.pieceColor,
                color: 'white',
                p: 0,
                borderRadius: '2px',
                width: activePiece.pieceLength * 20, // Match cell width: pieceLength * 20px
                height: 32,
                boxSizing: 'border-box',
                textAlign: 'center',
                boxShadow: 4,
                opacity: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem', fontWeight: 500, px: 0.3 }}>
                {activePiece.tooltipMessage.split('\n')[0]}
              </Typography>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Status Detail Modal */}
      <StatusDetailModal
        open={!!selectedStatus}
        onClose={handleCloseModal}
        piece={selectedStatus?.piece || null}
        vehicle={selectedStatus?.vehicle || null}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

