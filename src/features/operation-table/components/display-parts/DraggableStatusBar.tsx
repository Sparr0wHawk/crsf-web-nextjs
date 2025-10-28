import { Box, Tooltip, Typography } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ResizeHandle } from './ResizeHandle';
import { getRuleForType, canPieceBeDragged, canPieceBeResized, getLockedCursor } from '../../types/reservationTypes';
import type { StatusPiece, Operation } from '@/lib/api/contracts/operationTable.contract';

interface DraggableStatusBarProps {
  piece: StatusPiece;
  operation: Operation;
  onDetailClick: () => void;
}

export function DraggableStatusBar({ piece, operation, onDetailClick }: DraggableStatusBarProps) {
  // Get reservation rules for this piece
  const rule = getRuleForType(piece.statusType);
  const isDraggable = canPieceBeDragged(piece);
  const isResizable = canPieceBeResized(piece);
  const lockedCursor = getLockedCursor(piece);
  
  // Use unique ID combining operation and piece to prevent multiple cars from dragging together
  const uniqueDragId = `drag-${operation.id}-${piece.id}`;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: uniqueDragId,
    data: {
      piece,
      operation,
    },
    disabled: !isDraggable, // Disable dragging if not allowed by rules
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  // Skip rendering idle status as draggable bars
  if (piece.statusType === 'idle') {
    return null;
  }

  // Determine cursor based on drag/resize capabilities
  const getCursor = () => {
    if (isDragging) return 'grabbing';
    if (!isDraggable && !isResizable) return lockedCursor;
    if (isDraggable) return 'grab';
    return 'default';
  };

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="caption" sx={{ whiteSpace: 'pre-line' }}>
            {piece.tooltipMessage}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8, fontSize: '0.7rem' }}>
            {rule.displayName}
            {!isDraggable && !isResizable && ' (ロック)'}
            {!isDraggable && isResizable && ' (リサイズのみ)'}
            {isDraggable && !isResizable && ' (移動のみ)'}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        ref={setNodeRef}
        {...(isDraggable ? listeners : {})}
        {...(isDraggable ? attributes : {})}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            onDetailClick();
          }
        }}
        sx={{
          position: 'relative',
          bgcolor: piece.pieceColor,
          color: piece.pieceColor === '#000000' ? 'white' : 'white', // Ensure text is visible
          p: 0.3,
          cursor: getCursor(),
          height: '100%',
          width: '100%',
          minHeight: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDragging ? 0.3 : 1,
          pointerEvents: 'auto',
          userSelect: 'none', // Prevent text selection during drag
          '&:hover': {
            opacity: isDragging ? 0.3 : (isDraggable || isResizable ? 0.85 : 1),
            boxShadow: isDragging ? 0 : (isDraggable || isResizable ? 1 : 0),
          },
          transition: 'all 0.2s ease-in-out',
          borderRadius: '2px',
          border: (!isDraggable && !isResizable) ? '2px dashed rgba(255,255,255,0.5)' : 'none',
          ...style,
        }}
      >
        {/* Resize Handles - only show if resizable */}
        {isResizable && (
          <>
            <ResizeHandle 
              position="start" 
              piece={piece}
              operation={operation}
              isDragging={isDragging}
            />
            <ResizeHandle 
              position="end" 
              piece={piece}
              operation={operation}
              isDragging={isDragging}
            />
          </>
        )}

        {/* Status text */}
        {piece.pieceLength > 3 && (
          <Typography variant="caption" noWrap sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
            {piece.tooltipMessage.split('\n')[0]}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
