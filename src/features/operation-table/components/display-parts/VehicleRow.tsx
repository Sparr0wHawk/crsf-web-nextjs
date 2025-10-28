import { Box, TableRow, TableCell } from '@mui/material';
import { DroppableTimeCell } from './DroppableTimeCell';
import { DraggableStatusBar } from './DraggableStatusBar';
import { useTimeSlotMapping } from '@/features/operation-table/hooks/useTimeSlotMapping';
import type { Operation, SearchParams, StatusPiece, OperationTableHeader } from '@/lib/api/contracts/operationTable.contract';

interface VehicleRowProps {
  operation: Operation;
  header: OperationTableHeader;
  searchParams: SearchParams;
  onStatusClick: (piece: StatusPiece, vehicle: Operation) => void;
}

export function VehicleRow({ operation, header, searchParams, onStatusClick }: VehicleRowProps) {
  const timeSlotMap = useTimeSlotMapping(operation, searchParams);

  return (
    <TableRow hover sx={{ height: 36 }}>
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
                  zIndex: 1, // Lower than sticky header (zIndex: 2-3)
                  pointerEvents: 'auto', // CRITICAL: Allow pointer events for drag/resize
                }}
              >
                <DraggableStatusBar
                  piece={piece}
                  operation={operation}
                  onDetailClick={() => onStatusClick(piece, operation)}
                />
              </Box>
            )}
          </DroppableTimeCell>
        );
      })}
    </TableRow>
  );
}
