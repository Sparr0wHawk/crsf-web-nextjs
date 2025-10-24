import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography, 
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { SearchResponse, StatusPiece, Operation, SearchParams, ScheduleUpdate } from '@/lib/api/contracts/operationTable.contract';

interface OperationTableDisplayProps {
  data: SearchResponse;
  searchParams: SearchParams;
  onScheduleUpdate?: (update: ScheduleUpdate) => void;
}

interface StatusDetailModalProps {
  open: boolean;
  onClose: () => void;
  piece: StatusPiece | null;
  vehicle: Operation | null;
}

interface DraggableStatusBarProps {
  piece: StatusPiece;
  operation: Operation;
  onDetailClick: () => void;
}

interface DroppableVehicleRowProps {
  operation: Operation;
  children: React.ReactNode;
}

interface DroppableTimeCellProps {
  operation: Operation;
  timeIndex: number;
  children?: React.ReactNode;
}

// Draggable Status Bar Component - Only for non-idle statuses
function DraggableStatusBar({ piece, operation, onDetailClick }: DraggableStatusBarProps) {
  // Use unique ID combining operation and piece to prevent multiple cars from dragging together
  const uniqueDragId = `drag-${operation.id}-${piece.id}`;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: uniqueDragId,
    data: {
      piece,
      operation,
    },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  // Skip rendering idle status as draggable bars
  if (piece.statusType === 'idle') {
    return null;
  }

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
            {piece.tooltipMessage}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            onDetailClick();
          }
        }}
        sx={{
          bgcolor: piece.pieceColor,
          color: 'white',
          p: 0.3,
          cursor: isDragging ? 'grabbing' : 'grab',
          height: '100%',
          width: '100%',
          minHeight: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDragging ? 0.3 : 1,
          pointerEvents: 'auto',
          '&:hover': {
            opacity: isDragging ? 0.3 : 0.85,
            boxShadow: isDragging ? 0 : 1,
          },
          transition: 'all 0.2s ease-in-out',
          borderRadius: '2px',
          ...style,
        }}
      >
        {piece.pieceLength > 3 && (
          <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
            {piece.tooltipMessage.split('\n')[0]}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}

// Droppable Time Cell Component - Each 1-hour slot is droppable
function DroppableTimeCell({ operation, timeIndex, children }: DroppableTimeCellProps) {
  const dropId = `${operation.id}-slot-${timeIndex}`;
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      operation,
      timeIndex,
    },
  });

  return (
    <TableCell
      ref={setNodeRef}
      sx={{
        p: 0,
        height: 36,
        minHeight: 36,
        maxHeight: 36,
        bgcolor: isOver ? 'primary.light' : 'transparent',
        border: '1px solid rgba(224, 224, 224, 1)',
        transition: 'background-color 0.2s ease-in-out',
        position: 'relative',
        minWidth: 80,
        width: 80,
        maxWidth: 80,
      }}
    >
      {children}
    </TableCell>
  );
}

// Status Detail Modal Component
function StatusDetailModal({ open, onClose, piece, vehicle }: StatusDetailModalProps) {
  if (!piece || !vehicle) return null;

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTypeLabel = (statusType: string) => {
    const labels: Record<string, string> = {
      'rental': '貸渡中',
      'idle': 'アイドル',
      'maintenance': '整備中',
      'charter': 'チャーター',
      'reserved': '予約済み',
      'transfer': '移動中',
      'other': 'その他',
    };
    return labels[statusType] || statusType;
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="medium">
        {value}
      </Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: piece.pieceColor, color: 'white', pb: 2 }}>
        <Typography variant="h6">ステータス詳細</Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        {/* Vehicle Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mb: 2 }}>
            車両情報
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <InfoRow label="車両番号" value={vehicle.registNumber} />
            <InfoRow label="車名" value={vehicle.carName} />
            <InfoRow label="クラス" value={vehicle.classCode} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mb: 2 }}>
            ステータス情報
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <InfoRow label="ステータス種別" value={getStatusTypeLabel(piece.statusType)} />
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                状態
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box 
                  sx={{ 
                    width: 16, 
                    height: 16, 
                    bgcolor: piece.pieceColor, 
                    borderRadius: 1 
                  }} 
                />
                <Typography variant="body2" fontWeight="medium">
                  {piece.tooltipMessage.split('\n')[0]}
                </Typography>
              </Box>
            </Box>
            <InfoRow label="開始時刻" value={formatDateTime(piece.startTime)} />
            <InfoRow label="終了時刻" value={formatDateTime(piece.endTime)} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Additional Details */}
        {piece.details && Object.keys(piece.details).length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mb: 2 }}>
              詳細情報
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              {Object.entries(piece.details).map(([key, value]) => {
                if (value === undefined || value === null) return null;
                const labelMap: Record<string, string> = {
                  reservationNumber: '予約番号',
                  customerName: '顧客名',
                  pickupLocation: '出発地',
                  returnLocation: '返却地',
                  notes: '備考',
                };
                return (
                  <InfoRow 
                    key={key} 
                    label={labelMap[key] || key} 
                    value={String(value)} 
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Full Tooltip Message */}
        {piece.tooltipMessage && (
          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              メッセージ
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {piece.tooltipMessage}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function OperationTableDisplay({ data, searchParams, onScheduleUpdate }: OperationTableDisplayProps) {
  const { header, operations } = data;
  const [selectedStatus, setSelectedStatus] = useState<{ piece: StatusPiece; vehicle: Operation } | null>(null);
  const [activePiece, setActivePiece] = useState<StatusPiece | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
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
    setActivePiece(piece);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePiece(null);

    if (!over) return;

    const sourcePiece = active.data.current?.piece as StatusPiece;
    const sourceOperation = active.data.current?.operation as Operation;
    const targetOperation = over.data.current?.operation as Operation;
    const targetTimeIndex = over.data.current?.timeIndex as number;

    if (!sourcePiece || !sourceOperation || !targetOperation || targetTimeIndex === undefined) return;

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
      // Calculate new start time based on target time index
      // Each time index represents 1 hour
      const baseDate = new Date(searchParams.searchDate);
      const newStartTime = new Date(baseDate.getTime() + targetTimeIndex * 60 * 60 * 1000);
      
      // Keep the same duration
      const duration = sourcePiece.endTime.getTime() - sourcePiece.startTime.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);
      
      const update: ScheduleUpdate = {
        pieceId: sourcePiece.id,
        operationId: sourceOperation.id,
        newStartTime,
        newEndTime,
        newOperationId: isDifferentVehicle ? targetOperation.id : undefined,
      };

      if (onScheduleUpdate) {
        onScheduleUpdate(update);
        
        let message = '';
        if (isDifferentVehicle && isDifferentTime) {
          message = `「${sourceOperation.carName}」から「${targetOperation.carName}」へ移動し、時間を変更しました`;
        } else if (isDifferentVehicle) {
          message = `「${sourceOperation.carName}」から「${targetOperation.carName}」へ移動しました`;
        } else {
          message = `時間を変更しました（${targetTimeIndex}時間目へ）`;
        }
        
        setSnackbar({
          open: true,
          message,
          severity: 'success',
        });
      }
    }
  };

  const handleDragCancel = () => {
    setActivePiece(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Create time header - 2 separate rows: dates and hours
  const renderDateHeaders = () => {
    if (!header?.timeList || header.timeList.length === 0) return null;
    
    const cells = [];
    const numDays = header.timeList.length;
    
    for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
      cells.push(
        <TableCell
          key={`date-${dayIdx}`}
          align="center"
          colSpan={24}
          sx={{
            minWidth: 1920, // 24 hours × 80px
            bgcolor: '#e3f2fd',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            p: 0.8,
            borderRight: dayIdx === numDays - 1 ? '2px solid #999' : '1px solid #ddd',
            borderBottom: '1px solid #ddd',
          }}
        >
          {header.timeList[dayIdx]}
        </TableCell>
      );
    }
    return cells;
  };

  const renderHourHeaders = () => {
    if (!header?.graphMeshCount) return null;
    
    const cells = [];
    // Each hour from 0-23 for each day
    for (let i = 0; i < header.graphMeshCount; i++) {
      const hour = i % 24;
      
      cells.push(
        <TableCell
          key={`hour-${i}`}
          align="center"
          sx={{
            minWidth: 80,
            width: 80,
            maxWidth: 80,
            bgcolor: 'grey.100',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            p: 0.5,
            borderRight: (i + 1) % 24 === 0 ? '2px solid #999' : '1px solid #ddd',
            borderBottom: '2px solid #999',
          }}
        >
          {hour}
        </TableCell>
      );
    }
    return cells;
  };

  return (
    <>
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
        <Table stickyHeader size="small" sx={{ minWidth: 1680, tableLayout: 'fixed' }}>
          {/* Header with dates and times - 2 rows */}
          <TableHead>
            {/* Row 1: Date headers */}
            <TableRow>
              {/* Fixed columns - 6 columns in 2x3 layout, spanning 2 rows */}
              <TableCell rowSpan={2} sx={{ minWidth: 90, width: 90, bgcolor: 'grey.200', fontWeight: 'bold', position: 'sticky', left: 0, zIndex: 3, fontSize: '0.75rem', p: 0.5 }}>各種番号</TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 80, width: 80, bgcolor: 'grey.200', fontWeight: 'bold', position: 'sticky', left: 90, zIndex: 3, fontSize: '0.75rem', p: 0.5 }}>車種</TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 70, width: 70, bgcolor: 'grey.200', fontWeight: 'bold', position: 'sticky', left: 170, zIndex: 3, fontSize: '0.75rem', p: 0.5 }}>条件</TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 60, width: 60, bgcolor: 'grey.200', fontWeight: 'bold', position: 'sticky', left: 240, zIndex: 3, fontSize: '0.75rem', p: 0.5 }}>クラス</TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 90, width: 90, bgcolor: 'grey.200', fontWeight: 'bold', position: 'sticky', left: 300, zIndex: 3, fontSize: '0.75rem', p: 0.5 }}>配備営業所</TableCell>
              <TableCell rowSpan={2} sx={{ minWidth: 90, width: 90, bgcolor: 'grey.200', fontWeight: 'bold', position: 'sticky', left: 390, zIndex: 3, fontSize: '0.75rem', p: 0.5 }}>運用営業所</TableCell>
              
              {/* Date headers - spans 24 hours each */}
              {renderDateHeaders()}
            </TableRow>
            
            {/* Row 2: Hour headers (0-23) */}
            <TableRow>
              {/* Fixed columns already span 2 rows, so only time cells here */}
              {renderHourHeaders()}
            </TableRow>
          </TableHead>

          {/* Vehicle rows */}
          <TableBody>
            {operations.map((operation) => {
              // Create a map of time slots to status pieces based on actual startTime
              const timeSlotMap = new Map<number, StatusPiece>();
              const baseDate = new Date(searchParams.searchDate);
              baseDate.setHours(0, 0, 0, 0); // Start of search date
              
              operation.pieceInformationList.forEach((piece) => {
                // Calculate the time slot index based on actual startTime
                const hoursSinceBase = Math.floor((piece.startTime.getTime() - baseDate.getTime()) / (60 * 60 * 1000));
                
                // Place piece in the correct time slots
                for (let i = 0; i < piece.pieceLength; i++) {
                  timeSlotMap.set(hoursSinceBase + i, piece);
                }
              });

              return (
                <TableRow key={operation.id} hover sx={{ height: 36 }}>
                  {/* Fixed info columns - 6 columns matching 2x3 header layout */}
                  <TableCell sx={{ fontWeight: 'medium', position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2, p: 0.5, fontSize: '0.7rem' }}>
                    {operation.registNumber}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 90, bgcolor: 'background.paper', zIndex: 2, p: 0.5, fontSize: '0.7rem' }}>
                    {operation.carName}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 170, bgcolor: 'background.paper', zIndex: 2, p: 0.5, fontSize: '0.65rem' }}>
                    {operation.condition}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 240, bgcolor: 'background.paper', zIndex: 2, p: 0.5, fontSize: '0.7rem' }}>
                    {operation.classCode || '-'}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 300, bgcolor: 'background.paper', zIndex: 2, p: 0.5, fontSize: '0.7rem' }}>
                    {operation.dispositionShopName}
                  </TableCell>
                  <TableCell sx={{ position: 'sticky', left: 390, bgcolor: 'background.paper', zIndex: 2, p: 0.5, fontSize: '0.7rem' }}>
                    {operation.usingShopName || '-'}
                  </TableCell>

                  {/* Render individual hour cells */}
                  {Array.from({ length: header.graphMeshCount }).map((_, slotIndex) => {
                    const piece = timeSlotMap.get(slotIndex);
                    
                    // Find if this is the first slot of a piece
                    const isFirstSlot = piece && (slotIndex === 0 || timeSlotMap.get(slotIndex - 1) !== piece);
                    
                    return (
                      <DroppableTimeCell key={slotIndex} operation={operation} timeIndex={slotIndex}>
                        {piece && isFirstSlot && piece.statusType !== 'idle' && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: `${piece.pieceLength * 100}%`,
                              height: '100%',
                              zIndex: 1,
                              pointerEvents: 'none', // Allow dragging through
                            }}
                          >
                            <DraggableStatusBar
                              piece={piece}
                              operation={operation}
                              onDetailClick={() => handleStatusClick(piece, operation)}
                            />
                          </Box>
                        )}
                      </DroppableTimeCell>
                    );
                  })}
                </TableRow>
              );
            })}
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
              p: 1,
              borderRadius: 1,
              minWidth: 100,
              textAlign: 'center',
              boxShadow: 4,
              opacity: 0.9,
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
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
