/**
 * Operation Table Action Buttons Component
 * 
 * Displays three action buttons for managing table changes:
 * - 確定 (Confirm): Save changes to database
 * - 元に戻す (Undo): Revert last change
 * - やり直し (Reset All): Cancel all changes
 */

import { Box, Button, Tooltip } from '@mui/material';
import {
  Check as ConfirmIcon,
  Undo as UndoIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';

export interface OperationTableActionsProps {
  /** Can the user undo the last change? */
  canUndo: boolean;
  
  /** Can the user reset all changes? */
  canReset: boolean;
  
  /** Are there any unsaved changes? */
  hasChanges: boolean;
  
  /** Callback when user clicks confirm button */
  onConfirm: () => void;
  
  /** Callback when user clicks undo button */
  onUndo: () => void;
  
  /** Callback when user clicks reset button */
  onReset: () => void;
  
  /** Is a confirm operation in progress? */
  isConfirming?: boolean;
  
  /** Number of changes to display (optional) */
  changeCount?: number;
}

export function OperationTableActions({
  canUndo,
  canReset,
  hasChanges,
  onConfirm,
  onUndo,
  onReset,
  isConfirming = false,
  changeCount,
}: OperationTableActionsProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Confirm Button - 確定 */}
      <Tooltip 
        title={hasChanges ? "変更をデータベースに保存します" : "保存する変更がありません"}
        arrow
      >
        <span>
          <Button
            variant="contained"
            color="primary"
            size="medium"
            disabled={!hasChanges || isConfirming}
            onClick={onConfirm}
            startIcon={<ConfirmIcon />}
            sx={{ minWidth: 140 }}
          >
            確定 {changeCount !== undefined && hasChanges && `(${changeCount})`}
          </Button>
        </span>
      </Tooltip>

      {/* Undo Button - 元に戻す */}
      <Tooltip 
        title={canUndo ? "最後の変更を元に戻します (Ctrl+Z)" : "元に戻す変更がありません"}
        arrow
      >
        <span>
          <Button
            variant="outlined"
            color="primary"
            size="medium"
            disabled={!canUndo}
            onClick={onUndo}
            startIcon={<UndoIcon />}
            sx={{ minWidth: 140 }}
          >
            元に戻す
          </Button>
        </span>
      </Tooltip>

      {/* Reset All Button - やり直し */}
      <Tooltip 
        title={canReset ? "すべての変更をキャンセルして最初の状態に戻します" : "キャンセルする変更がありません"}
        arrow
      >
        <span>
          <Button
            variant="outlined"
            color="error"
            size="medium"
            disabled={!canReset}
            onClick={onReset}
            startIcon={<ResetIcon />}
            sx={{ minWidth: 140 }}
          >
            やり直し
          </Button>
        </span>
      </Tooltip>

      {/* Status indicator */}
      {hasChanges && (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            ml: 'auto',
            color: 'warning.main',
            fontSize: '0.875rem',
          }}
        >
          ● 未保存の変更があります
        </Box>
      )}
    </Box>
  );
}
