import { Box, Paper, Table, TableBody, TableContainer, Typography, Snackbar, Alert } from '@mui/material';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import {
  StatusDetailModal,
  TableHeader,
  VehicleRow,
} from './display-parts';
import { OperationTableActions } from './OperationTableActions';
import { useOperationTableDnD } from '../hooks/useOperationTableDnD';
import { useOperationTableHistory } from '../hooks/useOperationTableHistory';
import type { SearchResponse, SearchParams, ScheduleUpdate } from '@/lib/api/contracts/operationTable.contract';

interface OperationTableDisplayProps {
  data: SearchResponse;
  searchParams: SearchParams;
  onScheduleUpdate?: (update: ScheduleUpdate) => void;
}


export function OperationTableDisplay({ data, searchParams, onScheduleUpdate }: OperationTableDisplayProps) {
  const { header, operations } = data;

  // History management hook for undo/redo
  const {
    canUndo,
    canReset,
    hasChanges,
    addChange,
    undo,
    resetAll,
    confirmChanges,
  } = useOperationTableHistory();

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
    onScheduleUpdate,
    onAddHistoryChange: addChange,
  });

  return (
    <>
      {/* Action Buttons */}
      <Box sx={{ mb: 2 }}>
        <OperationTableActions
          canUndo={canUndo}
          canReset={canReset}
          hasChanges={hasChanges}
          onConfirm={() => confirmChanges()}
          onUndo={undo}
          onReset={resetAll}
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

