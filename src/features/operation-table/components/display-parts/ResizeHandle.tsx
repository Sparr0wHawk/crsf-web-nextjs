/**
 * Resize Handle Component
 * 
 * Provides a draggable handle for resizing status bars.
 * Displays on the left or right edge of a status piece.
 */

import { Box } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import type { StatusPiece, Operation } from '@/lib/api/contracts/operationTable.contract';

export type ResizePosition = 'start' | 'end';

interface ResizeHandleProps {
  /** Position of the handle (start = left edge, end = right edge) */
  position: ResizePosition;
  
  /** The piece being resized */
  piece: StatusPiece;
  
  /** The operation containing the piece */
  operation: Operation;
  
  /** Is the handle currently active/being dragged? */
  isDragging?: boolean;
}

export function ResizeHandle({ 
  position, 
  piece,
  operation,
  isDragging = false,
}: ResizeHandleProps) {
  const uniqueId = `resize-${position}-${operation.id}-${piece.id}`;
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: uniqueId,
    data: {
      type: 'resize',
      position,
      pieceId: piece.id,
      operationId: operation.id,
      piece, // Pass the piece for access in DnD hook
      operation, // Pass the operation for access in DnD hook
      resizeHandle: { pieceId: piece.id, position }, // Add this for DnD hook to detect resize
    },
  });

  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [position === 'start' ? 'left' : 'right']: 0,
        width: 8,
        cursor: 'ew-resize',
        zIndex: 20, // Higher z-index to ensure it's above everything
        opacity: isDragging ? 0.5 : 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: 'auto', // Ensure it receives pointer events
        '&:hover': {
          opacity: 1,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: '60%',
          bgcolor: 'white',
          borderRadius: 1,
          boxShadow: 1,
          pointerEvents: 'none', // Let events pass through to parent
        },
        // Invisible hit area for easier grabbing
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          [position === 'start' ? 'right' : 'left']: 0,
          width: 16, // Wider hit area
          left: position === 'start' ? -8 : 'auto',
          right: position === 'end' ? -8 : 'auto',
          pointerEvents: 'none', // Let events pass through to parent
        },
      }}
      onClick={(e) => {
        e.stopPropagation(); // Prevent triggering the piece's onClick
      }}
      onPointerDown={(e) => {
        e.stopPropagation(); // Prevent piece dragging when clicking handle
      }}
    />
  );
}
