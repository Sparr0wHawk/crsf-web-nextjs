import { TableHead, TableRow, TableCell } from '@mui/material';
import type { OperationTableHeader } from '@/lib/api/contracts/operationTable.contract';

interface TableHeaderProps {
  header: OperationTableHeader;
}

export function TableHeader({ header }: TableHeaderProps) {
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
            minWidth: 480, // 24 hours × 20px
            bgcolor: '#e3f2fd',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            p: 0.8,
            borderRight: dayIdx === numDays - 1 ? '2px solid #999' : '1px solid #ddd',
            borderBottom: '1px solid #ddd',
            position: 'sticky',
            top: 0,
            zIndex: 3, // Above everything except fixed vehicle columns
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
            minWidth: 20,
            width: 20,
            maxWidth: 20,
            bgcolor: 'grey.100',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            p: 0.5,
            borderRight: (i + 1) % 24 === 0 ? '2px solid #999' : '1px solid #ddd',
            borderBottom: '2px solid #999',
            position: 'sticky',
            top: 37, // Position below date header (date header height ≈ 37px)
            zIndex: 3, // Above status bars
          }}
        >
          {hour}
        </TableCell>
      );
    }
    return cells;
  };

  return (
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
  );
}
