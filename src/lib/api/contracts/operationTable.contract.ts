/**
 * API Contract for Operation Table Feature (PT04000 - Web稼働表)
 * 
 * This interface defines the contract that ANY backend implementation must fulfill.
 * Both MockAPI (POC) and RealAPI (Production) must implement this interface.
 */

// ============================================================================
// API Interface
// ============================================================================

export interface IOperationTableAPI {
  /**
   * Initialize page with dropdown data and defaults
   */
  initialize(): Promise<InitializeResponse>;

  /**
   * Search for operations based on filter criteria
   */
  search(params: SearchParams): Promise<SearchResponse>;

  /**
   * Get blocks for a given section (cascading dropdown)
   */
  getBlocks(sectionCode: string): Promise<Block[]>;

  /**
   * Get vehicle divisions based on disposition/using division
   */
  getVehicleDivisions(dispositionDivision: string): Promise<VehicleDivision[]>;

  /**
   * Update schedule (drag & drop operation)
   */
  updateSchedule(update: ScheduleUpdate): Promise<void>;

  /**
   * Get detailed status information
   */
  getStatusDetail(pieceId: string): Promise<StatusDetail>;
  
  /**
   * Confirm and persist all schedule changes
   * @param changes - Array of all changes to be saved
   * @returns Promise that resolves when changes are saved
   */
  confirmScheduleChanges(changes: ScheduleUpdate[]): Promise<void>;
}

// ============================================================================
// Initialize Response
// ============================================================================

export interface InitializeResponse {
  sections: Section[];
  vehicleDivisions: VehicleDivision[];
  sortOptions: SortOption[];
  dispositionAndUsingDivisions: DispositionDivision[];
  defaultSearchDate: Date;
}

export interface Section {
  code: string;
  name: string;
}

export interface VehicleDivision {
  code: string;
  name: string;
  applicableFor: string[]; // Which disposition divisions this applies to
}

export interface SortOption {
  code: string;
  name: string;
}

export interface DispositionDivision {
  code: string;
  name: string;
}

// ============================================================================
// Search Request/Response
// ============================================================================

export interface SearchParams {
  // Date
  searchDate: Date;

  // Section & Block
  sectionCode?: string;
  blockCode?: string;

  // Shop
  shopCode?: string;

  // Class codes (5 fields)
  classCodes?: string[];
  groupClassCode?: boolean;

  // Vehicle
  carModelCode?: string;
  dispositionAndUsingDivision?: string;
  carDivision?: string;

  // Sort
  sortDivision?: string;

  // Options
  provisionalBookingExecute?: boolean;
  searchScope?: '72h' | '2weeks';
}

export interface SearchResponse {
  header: OperationTableHeader;
  operations: Operation[];
}

export interface OperationTableHeader {
  dateList: string[];        // ["02/10(水)", "02/11(木)", ...]
  timeList: string[];        // ["0", "6", "12", "18"]
  graphMeshCount: number;    // Total columns in graph
  dateMeshCount: number;     // Columns per day (usually 48 = 2 per hour)
  timeMeshCount: number;     // Columns per hour (usually 2 = 30 min each)
}

// ============================================================================
// Operation (Vehicle) Data
// ============================================================================

export interface Operation {
  id: string;                         // Unique identifier
  registNumber: string;               // 登録番号 (Vehicle registration number)
  carName: string;                    // 車種名 (Car model name)
  condition: string;                  // 条件 (Condition code)
  selfAndOthersDivision: string;      // 自他FEE区分 (Self/Others FEE division)
  classCode: string;                  // クラスコード (Class code)
  dispositionShopName: string;        // 配備営業所 (Disposition shop)
  usingShopName: string;              // 運用営業所 (Using shop)
  sectionCode?: string;               // Section code (for filtering)
  blockCode?: string;                 // Block code (for filtering)
  pieceInformationList: StatusPiece[]; // Status bars
}

// ============================================================================
// Status Piece (Bar in Timeline)
// ============================================================================

export interface StatusPiece {
  id: string;                    // Unique piece ID
  pieceLength: number;           // Duration in mesh units (e.g., 12 = 6 hours if 2 mesh per hour)
  pieceColor: string;            // Hex color code (e.g., "#FF5733")
  tooltipMessage: string;        // Message shown on hover
  statusType: StatusType;        // Type of status
  startTime: Date;               // Absolute start time
  endTime: Date;                 // Absolute end time
  details: StatusDetails;        // Additional details for modal
}

export type StatusType = 
  | 'maintenance'            // 整備・修理
  | 'reserved-temporary'     // 予約（仮引当）
  | 'reserved-fixed'         // 予約（確定）
  | 'rental'                 // 貸渡中 (keeping for compatibility)
  | 'idle'                   // アイドル (keeping for compatibility)
  | 'charter'                // チャーター (keeping for compatibility)
  | 'transfer'               // 移動中 (keeping for compatibility)
  | 'other';                 // その他 (keeping for compatibility)

export interface StatusDetails {
  reservationNumber?: string;
  customerName?: string;
  pickupLocation?: string;
  returnLocation?: string;
  notes?: string;
  // Flexible structure - can contain any additional fields
  [key: string]: any;
}

// ============================================================================
// Blocks (Cascading Dropdown Data)
// ============================================================================

export interface Block {
  code: string;
  name: string;
  sectionCode: string; // Parent section
}

// ============================================================================
// Schedule Update (Drag & Drop)
// ============================================================================

export interface ScheduleUpdate {
  pieceId: string;
  operationId: string;        // Current vehicle
  newStartTime: Date;
  newEndTime: Date;
  newOperationId?: string;    // New vehicle (if dropped on different row)
}

// ============================================================================
// Status Detail (Modal View)
// ============================================================================

export interface StatusDetail extends StatusPiece {
  vehicleInfo: {
    registNumber: string;
    carName: string;
    classCode: string;
  };
  fullDetails: StatusDetails;
}

// ============================================================================
// Error Types
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
