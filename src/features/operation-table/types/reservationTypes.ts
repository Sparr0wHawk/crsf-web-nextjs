/**
 * Reservation Types and Rule Definitions
 * 
 * Defines the different types of reservations and their interaction rules
 * for the operation table drag-and-drop system.
 */

export type ReservationType = 
  | 'maintenance'           // 整備・修理
  | 'reserved-temporary'    // 予約（仮引当）
  | 'reserved-fixed'        // 予約（確定）
  | 'rental'                // 貸渡中
  | 'idle';                 // アイドル

export interface ReservationRule {
  /** Unique type identifier */
  type: ReservationType;
  
  /** Display name in Japanese */
  displayName: string;
  
  /** Display name in English */
  displayNameEn: string;
  
  /** Default color for the status bar */
  color: string;
  
  /** Can this type be dragged to different time slots or vehicles? */
  canDrag: boolean;
  
  /** Can this type be resized (duration changed)? */
  canResize: boolean;
  
  /** Can this type overlap with other pieces? */
  allowOverlap: boolean;
  
  /** Visual cursor when hovering over locked items */
  lockedCursor?: 'not-allowed' | 'default';
  
  /** Custom validation function (optional) */
  customValidation?: (context: ValidationContext) => ValidationResult;
}

export interface ValidationContext {
  /** The piece being moved/resized */
  piece: any;
  
  /** The target operation (vehicle) */
  targetOperation: any;
  
  /** New start time after move/resize */
  newStartTime: Date;
  
  /** New end time after move/resize */
  newEndTime: Date;
  
  /** All operations in the table */
  allOperations: any[];
  
  /** Type of action being performed */
  actionType: 'drag' | 'resize';
}

export interface ValidationResult {
  /** Is the operation valid? */
  valid: boolean;
  
  /** Reason for rejection (if invalid) */
  reason?: string;
  
  /** User-friendly error message (Japanese) */
  message?: string;
}

/**
 * Default reservation rules configuration
 * Can be extended with new types easily
 */
export const RESERVATION_RULES: Record<ReservationType, ReservationRule> = {
  // 整備・修理 - Maintenance (Black, Resize only)
  'maintenance': {
    type: 'maintenance',
    displayName: '整備・修理',
    displayNameEn: 'Maintenance',
    color: '#000000', // Black
    canDrag: false,
    canResize: true,
    allowOverlap: false,
    lockedCursor: 'not-allowed',
  },
  
  // 予約（仮引当） - Reserved (Temporary) (Light Blue, Drag only)
  'reserved-temporary': {
    type: 'reserved-temporary',
    displayName: '予約（仮引当）',
    displayNameEn: 'Reserved (Temporary)',
    color: '#64B5F6', // Light Blue (Material UI blue[300])
    canDrag: true,
    canResize: false,
    allowOverlap: false,
    lockedCursor: 'not-allowed',
  },
  
  // 予約（確定） - Reserved (Fixed) (Deep Blue, Locked)
  'reserved-fixed': {
    type: 'reserved-fixed',
    displayName: '予約（確定）',
    displayNameEn: 'Reserved (Fixed)',
    color: '#1565C0', // Deep Blue (Material UI blue[800])
    canDrag: false,
    canResize: false,
    allowOverlap: false,
    lockedCursor: 'not-allowed',
  },
  
  // 貸渡中 - Rental (existing type for compatibility)
  'rental': {
    type: 'rental',
    displayName: '貸渡中',
    displayNameEn: 'Rental',
    color: '#9C27B0', // Purple
    canDrag: true,
    canResize: true,
    allowOverlap: false,
  },
  
  // アイドル - Idle (existing type for compatibility)
  'idle': {
    type: 'idle',
    displayName: 'アイドル',
    displayNameEn: 'Idle',
    color: '#9E9E9E', // Grey
    canDrag: false,
    canResize: false,
    allowOverlap: true, // Idle can overlap
  },
};

/**
 * Get rule for a given reservation type
 * Returns default rule if type not found
 */
export function getRuleForType(type: string): ReservationRule {
  const rule = RESERVATION_RULES[type as ReservationType];
  
  if (!rule) {
    console.warn(`Unknown reservation type: ${type}, using rental default`);
    return RESERVATION_RULES.rental;
  }
  
  return rule;
}

/**
 * Check if a piece can be dragged based on its type
 */
export function canPieceBeDragged(piece: any): boolean {
  const rule = getRuleForType(piece.statusType);
  return rule.canDrag;
}

/**
 * Check if a piece can be resized based on its type
 */
export function canPieceBeResized(piece: any): boolean {
  const rule = getRuleForType(piece.statusType);
  return rule.canResize;
}

/**
 * Get visual feedback for locked pieces
 */
export function getLockedCursor(piece: any): string {
  const rule = getRuleForType(piece.statusType);
  
  if (!rule.canDrag && !rule.canResize) {
    return rule.lockedCursor || 'not-allowed';
  }
  
  return 'default';
}
