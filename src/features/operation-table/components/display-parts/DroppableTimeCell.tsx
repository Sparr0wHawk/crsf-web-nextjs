import { TableCell } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import type { Operation } from '@/lib/api/contracts/operationTable.contract';

interface DroppableTimeCellProps {
  operation: Operation;
  timeIndex: number;
  children?: React.ReactNode;
}

export function DroppableTimeCell({ operation, timeIndex, children }: DroppableTimeCellProps) {
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
        minWidth: 20,
        width: 20,
        maxWidth: 20,
      }}
    >
      {children}
    </TableCell>
  );
}
