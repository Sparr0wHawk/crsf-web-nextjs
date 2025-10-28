/**
 * Mock Data for Operation Table POC
 * 
 * This file contains realistic sample data for testing the UI
 */

import type { 
  Section, 
  Block, 
  VehicleDivision, 
  SortOption, 
  DispositionDivision,
  Operation,
  StatusPiece,
  StatusType
} from '../../contracts/operationTable.contract';

// ============================================================================
// Master Data (Dropdowns)
// ============================================================================

export const mockSections: Section[] = [
  { code: '1', name: '第一部' },
  { code: '2', name: '第二部' },
  { code: '3', name: '第三部' },
];

export const mockBlocks: Block[] = [
  { code: '11', name: '札幌第一', sectionCode: '1' },
  { code: '12', name: '札幌第二', sectionCode: '1' },
  { code: '13', name: '札幌第三', sectionCode: '1' },
  { code: '21', name: '東京第一', sectionCode: '2' },
  { code: '22', name: '東京第二', sectionCode: '2' },
  { code: '31', name: '大阪第一', sectionCode: '3' },
];

export const mockVehicleDivisions: VehicleDivision[] = [
  { code: '1', name: 'すべて', applicableFor: ['1', '2', '3'] },
  { code: '2', name: '自社車両', applicableFor: ['2'] },
  { code: '3', name: '他社車両', applicableFor: ['2'] },
  { code: '4', name: 'リース車両', applicableFor: ['2', '3'] },
];

export const mockDispositionDivisions: DispositionDivision[] = [
  { code: '1', name: 'すべて' },
  { code: '2', name: '配備' },
  { code: '3', name: '運用' },
];

export const mockSortOptions: SortOption[] = [
  { code: '1', name: 'クラス順' },
  { code: '2', name: '配備営業所順' },
  { code: '3', name: '運用営業所順' },
  { code: '4', name: '車名順' },
];

// ============================================================================
// Status Colors (Updated to match new requirements)
// ============================================================================

const STATUS_COLORS: Record<StatusType, string> = {
  maintenance: '#000000',        // Black - 整備・修理
  'reserved-temporary': '#64B5F6', // Light Blue - 予約（仮引当）
  'reserved-fixed': '#1565C0',   // Deep Blue - 予約（確定）
  rental: '#9C27B0',             // Purple - 貸渡中 (legacy)
  idle: '#9E9E9E',               // Grey - アイドル (legacy)
  charter: '#2196F3',            // Blue - チャーター (legacy)
  transfer: '#FF9800',           // Orange - 移動中 (legacy)
  other: '#9E9E9E',              // Grey - その他 (legacy)
};

// ============================================================================
// Helper Functions
// ============================================================================

function generatePieces(baseDate: Date, scenario: 'pattern1' | 'pattern2' | 'pattern3'): StatusPiece[] {
  const pieces: StatusPiece[] = [];
  let currentTime = new Date(baseDate);
  let pieceId = 1;

  if (scenario === 'pattern1') {
    // Pattern 1: maintenance -> reserved-temporary -> maintenance
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 6, // 6 hours
      pieceColor: STATUS_COLORS.maintenance,
      tooltipMessage: '整備・修理\n作業: 定期点検',
      statusType: 'maintenance',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 6)),
      details: { workType: '定期点検' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 8, // 8 hours
      pieceColor: STATUS_COLORS['reserved-temporary'],
      tooltipMessage: '予約（仮引当）\n予約番号: T001\n顧客: 山田太郎',
      statusType: 'reserved-temporary',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 8)),
      details: { reservationNumber: 'T001', customerName: '山田太郎' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 4, // 4 hours
      pieceColor: STATUS_COLORS.maintenance,
      tooltipMessage: '整備・修理\n作業: 清掃',
      statusType: 'maintenance',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 4)),
      details: { workType: '清掃' },
    });
    
  } else if (scenario === 'pattern2') {
    // Pattern 2: reserved-temporary -> reserved-fixed -> reserved-temporary
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 5, // 5 hours
      pieceColor: STATUS_COLORS['reserved-temporary'],
      tooltipMessage: '予約（仮引当）\n予約番号: T002\n顧客: 佐藤花子',
      statusType: 'reserved-temporary',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 5)),
      details: { reservationNumber: 'T002', customerName: '佐藤花子' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 10, // 10 hours
      pieceColor: STATUS_COLORS['reserved-fixed'],
      tooltipMessage: '予約（確定）\n予約番号: F001\n顧客: 鈴木一郎',
      statusType: 'reserved-fixed',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 10)),
      details: { reservationNumber: 'F001', customerName: '鈴木一郎' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 4, // 4 hours
      pieceColor: STATUS_COLORS['reserved-temporary'],
      tooltipMessage: '予約（仮引当）\n予約番号: T003\n顧客: 田中次郎',
      statusType: 'reserved-temporary',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 4)),
      details: { reservationNumber: 'T003', customerName: '田中次郎' },
    });
    
  } else {
    // Pattern 3: reserved-fixed -> maintenance -> reserved-fixed
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 8, // 8 hours
      pieceColor: STATUS_COLORS['reserved-fixed'],
      tooltipMessage: '予約（確定）\n予約番号: F002\n顧客: 高橋三郎',
      statusType: 'reserved-fixed',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 8)),
      details: { reservationNumber: 'F002', customerName: '高橋三郎' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 3, // 3 hours
      pieceColor: STATUS_COLORS.maintenance,
      tooltipMessage: '整備・修理\n作業: オイル交換',
      statusType: 'maintenance',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 3)),
      details: { workType: 'オイル交換' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 7, // 7 hours
      pieceColor: STATUS_COLORS['reserved-fixed'],
      tooltipMessage: '予約（確定）\n予約番号: F003\n顧客: 伊藤四郎',
      statusType: 'reserved-fixed',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 7)),
      details: { reservationNumber: 'F003', customerName: '伊藤四郎' },
    });
  }

  return pieces;
}

// ============================================================================
// Mock Operations (Vehicles)
// ============================================================================

export const mockOperations: Operation[] = [
  {
    id: 'op-001',
    registNumber: '札11-7890',
    carName: 'アクア',
    condition: 'A',
    selfAndOthersDivision: 'SE',
    classCode: 'SE',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'pattern1'),
  },
  {
    id: 'op-002',
    registNumber: '札10-1000',
    carName: 'ノア',
    condition: 'A',
    selfAndOthersDivision: 'WV1',
    classCode: 'WV1',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'pattern2'),
  },
  {
    id: 'op-003',
    registNumber: '札11-1111',
    carName: 'ヴォクシー',
    condition: 'B',
    selfAndOthersDivision: 'WV2',
    classCode: 'WV2',
    dispositionShopName: '札幌駅北口',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'pattern3'),
  },
  {
    id: 'op-004',
    registNumber: '札12-1222',
    carName: 'セレナ',
    condition: 'C',
    selfAndOthersDivision: 'SE',
    classCode: 'SE',
    dispositionShopName: '札幌駅南口',
    usingShopName: '新札幌',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'pattern1'),
  },
  {
    id: 'op-005',
    registNumber: '札10-1333',
    carName: 'ステップワゴン',
    condition: 'A',
    selfAndOthersDivision: 'WCL',
    classCode: 'WCL',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'pattern2'),
  },
  // Add more vehicles with varied patterns
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `op-${String(i + 6).padStart(3, '0')}`,
    registNumber: `札${10 + (i % 3)}-${1000 + i * 111}`,
    carName: ['フリード', 'プリウス', 'アルファード', 'ヴェルファイア', 'ハイエース'][i % 5],
    condition: ['A', 'B', 'C'][i % 3] as 'A' | 'B' | 'C',
    selfAndOthersDivision: ['C', 'E'][i % 2] as 'C' | 'E',
    classCode: ['WV1', 'WV2', 'SE', 'WCL'][i % 4],
    dispositionShopName: ['麻生駅前', '札幌駅北口', '札幌駅南口'][i % 3],
    usingShopName: ['札幌駅北口', '札幌駅南口', '新札幌'][i % 3],
    sectionCode: String((i % 3) + 1),
    blockCode: String((i % 3) + 1) + String((i % 2) + 1),
    pieceInformationList: generatePieces(new Date(), ['pattern1', 'pattern2', 'pattern3'][i % 3] as any),
  })),
];
