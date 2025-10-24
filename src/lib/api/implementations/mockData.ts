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
} from '../contracts/operationTable.contract';

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
// Status Colors
// ============================================================================

const STATUS_COLORS: Record<StatusType, string> = {
  rental: '#FF5733',      // Red - 貸渡中
  idle: '#4CAF50',        // Green - アイドル
  maintenance: '#FFC107', // Amber - 整備中
  charter: '#2196F3',     // Blue - チャーター
  reserved: '#9C27B0',    // Purple - 予約済み
  transfer: '#FF9800',    // Orange - 移動中
  other: '#9E9E9E',       // Grey - その他
};

// ============================================================================
// Helper Functions
// ============================================================================

function generatePieces(baseDate: Date, scenario: 'busy' | 'normal' | 'idle'): StatusPiece[] {
  const pieces: StatusPiece[] = [];
  let currentTime = new Date(baseDate);
  let pieceId = 1;

  if (scenario === 'busy') {
    // Busy schedule: rental -> idle -> rental -> idle
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 8, // 8 hours (1 mesh/hour)
      pieceColor: STATUS_COLORS.rental,
      tooltipMessage: '貸渡中\n予約番号: R001\n顧客: 山田太郎',
      statusType: 'rental',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 8)),
      details: { reservationNumber: 'R001', customerName: '山田太郎' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 4, // 4 hours
      pieceColor: STATUS_COLORS.idle,
      tooltipMessage: 'アイドル',
      statusType: 'idle',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 4)),
      details: {},
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 10, // 10 hours
      pieceColor: STATUS_COLORS.rental,
      tooltipMessage: '貸渡中\n予約番号: R002\n顧客: 佐藤花子',
      statusType: 'rental',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 10)),
      details: { reservationNumber: 'R002', customerName: '佐藤花子' },
    });
  } else if (scenario === 'normal') {
    // Normal schedule: idle -> rental -> idle
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 6, // 6 hours
      pieceColor: STATUS_COLORS.idle,
      tooltipMessage: 'アイドル',
      statusType: 'idle',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 6)),
      details: {},
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 12, // 12 hours
      pieceColor: STATUS_COLORS.rental,
      tooltipMessage: '貸渡中\n予約番号: R003\n顧客: 鈴木一郎',
      statusType: 'rental',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 12)),
      details: { reservationNumber: 'R003', customerName: '鈴木一郎' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 6, // 6 hours
      pieceColor: STATUS_COLORS.idle,
      tooltipMessage: 'アイドル',
      statusType: 'idle',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 6)),
      details: {},
    });
  } else {
    // Idle: mostly available with maintenance
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 16, // 16 hours
      pieceColor: STATUS_COLORS.idle,
      tooltipMessage: 'アイドル',
      statusType: 'idle',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 16)),
      details: {},
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 4, // 4 hours
      pieceColor: STATUS_COLORS.maintenance,
      tooltipMessage: '整備中\n作業: 定期点検',
      statusType: 'maintenance',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 4)),
      details: { workType: '定期点検' },
    });
    
    pieces.push({
      id: `piece-${pieceId++}`,
      pieceLength: 4, // 4 hours
      pieceColor: STATUS_COLORS.idle,
      tooltipMessage: 'アイドル',
      statusType: 'idle',
      startTime: new Date(currentTime),
      endTime: new Date(currentTime.setHours(currentTime.getHours() + 4)),
      details: {},
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
    registNumber: '札11-1234',
    carName: 'アルファード',
    condition: 'A',
    selfAndOthersDivision: 'C',
    classCode: 'WCL',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'busy'),
  },
  {
    id: 'op-002',
    registNumber: '札11-5678',
    carName: 'ヴェルファイア',
    condition: 'A',
    selfAndOthersDivision: 'C',
    classCode: 'WCL',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'normal'),
  },
  {
    id: 'op-003',
    registNumber: '札11-9012',
    carName: 'ハイエース',
    condition: 'B',
    selfAndOthersDivision: 'E',
    classCode: 'WV1',
    dispositionShopName: '札幌駅北口',
    usingShopName: '札幌駅北口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'idle'),
  },
  {
    id: 'op-004',
    registNumber: '札11-3456',
    carName: 'プリウス',
    condition: 'A',
    selfAndOthersDivision: 'C',
    classCode: 'SE',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅南口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'busy'),
  },
  {
    id: 'op-005',
    registNumber: '札11-7890',
    carName: 'アクア',
    condition: 'A',
    selfAndOthersDivision: 'C',
    classCode: 'SE',
    dispositionShopName: '麻生駅前',
    usingShopName: '札幌駅南口',
    sectionCode: '1',
    blockCode: '11',
    pieceInformationList: generatePieces(new Date(), 'normal'),
  },
  // Add more vehicles for realistic demo
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `op-${String(i + 6).padStart(3, '0')}`,
    registNumber: `札${10 + (i % 3)}-${1000 + i * 111}`,
    carName: ['ノア', 'ヴォクシー', 'セレナ', 'ステップワゴン', 'フリード'][i % 5],
    condition: ['A', 'B', 'C'][i % 3],
    selfAndOthersDivision: ['C', 'E'][i % 2],
    classCode: ['WV1', 'WV2', 'SE', 'WCL'][i % 4],
    dispositionShopName: ['麻生駅前', '札幌駅北口', '札幌駅南口'][i % 3],
    usingShopName: ['札幌駅北口', '札幌駅南口', '新札幌'][i % 3],
    sectionCode: String((i % 3) + 1),
    blockCode: String((i % 3) + 1) + String((i % 2) + 1),
    pieceInformationList: generatePieces(new Date(), ['busy', 'normal', 'idle'][i % 3] as any),
  })),
];
