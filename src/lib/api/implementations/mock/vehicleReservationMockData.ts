/**
 * Mock Data for Vehicle Reservation API
 * 
 * Realistic sample data for testing the reservation search UI
 */

import type {
  Shop,
  VehicleClass,
  Reservation,
  ReservationStatus,
} from '../../contracts/vehicleReservation.contract';

// ============================================================================
// Master Data
// ============================================================================

export const mockShops: Shop[] = [
  { code: 'SH001', name: '札幌駅北口店', region: '北海道' },
  { code: 'SH002', name: '麻生駅前店', region: '北海道' },
  { code: 'SH003', name: '新札幌店', region: '北海道' },
  { code: 'TO001', name: '東京駅八重洲口店', region: '関東' },
  { code: 'TO002', name: '新宿駅南口店', region: '関東' },
  { code: 'OS001', name: '大阪駅前店', region: '関西' },
];

export const mockVehicleClasses: VehicleClass[] = [
  { code: 'SE', name: 'スタンダードエコ', category: '小型車' },
  { code: 'SC', name: 'スタンダードコンパクト', category: '小型車' },
  { code: 'WV1', name: 'ワゴンV1', category: 'ワゴン' },
  { code: 'WV2', name: 'ワゴンV2', category: 'ワゴン' },
  { code: 'WCL', name: 'ワゴンクラス', category: 'ワゴン' },
  { code: 'WT', name: 'ワゴントラック', category: 'トラック' },
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateReservation(
  id: number,
  status: ReservationStatus,
  daysFromNow: number
): Reservation {
  const customerNames = [
    '山田太郎',
    '佐藤花子',
    '鈴木一郎',
    '田中美咲',
    '高橋健太',
    '渡辺由美',
    '伊藤翔太',
    '中村真理',
  ];
  
  const vehicles = [
    { registNumber: '札11-1234', carName: 'アルファード', classCode: 'WCL' },
    { registNumber: '札11-5678', carName: 'プリウス', classCode: 'SE' },
    { registNumber: '札11-9012', carName: 'ハイエース', classCode: 'WV1' },
    { registNumber: '札11-3456', carName: 'ヴェルファイア', classCode: 'WCL' },
    { registNumber: '札11-7890', carName: 'アクア', classCode: 'SE' },
  ];

  const startTime = new Date();
  startTime.setDate(startTime.getDate() + daysFromNow);
  startTime.setHours(10, 0, 0, 0);

  const endTime = new Date(startTime);
  endTime.setDate(endTime.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days rental
  endTime.setHours(18, 0, 0, 0);

  const vehicle = vehicles[id % vehicles.length];
  const customerName = customerNames[id % customerNames.length];
  const pickupShop = mockShops[id % mockShops.length];
  const returnShop = mockShops[(id + 1) % mockShops.length];

  const days = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
  const dailyRate = vehicle.classCode === 'WCL' ? 15000 : vehicle.classCode === 'WV1' ? 12000 : 8000;
  const totalAmount = dailyRate * days;

  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Created within last 30 days

  return {
    id: `RES-${String(id).padStart(5, '0')}`,
    reservationNumber: `R${String(id + 1000).padStart(6, '0')}`,
    customer: {
      id: `CUS-${String(id).padStart(5, '0')}`,
      name: customerName,
      phone: `090-${String(1000 + id).padStart(4, '0')}-${String(id * 11).padStart(4, '0')}`,
      email: `${customerName.toLowerCase().replace(' ', '.')}@example.com`,
    },
    vehicle: {
      registNumber: vehicle.registNumber,
      carName: vehicle.carName,
      classCode: vehicle.classCode,
    },
    rental: {
      startTime,
      endTime,
      pickupShop: pickupShop.name,
      returnShop: returnShop.name,
    },
    status,
    totalAmount,
    createdAt,
  };
}

// ============================================================================
// Mock Reservations
// ============================================================================

export const mockReservations: Reservation[] = [
  // Pending reservations (future)
  ...Array.from({ length: 5 }, (_, i) => generateReservation(i, 'pending', i + 1)),
  
  // Confirmed reservations (future)
  ...Array.from({ length: 8 }, (_, i) => generateReservation(i + 5, 'confirmed', i + 2)),
  
  // In-use reservations (current)
  ...Array.from({ length: 3 }, (_, i) => generateReservation(i + 13, 'in-use', 0)),
  
  // Completed reservations (past)
  ...Array.from({ length: 10 }, (_, i) => generateReservation(i + 16, 'completed', -(i + 1))),
  
  // Cancelled reservations
  ...Array.from({ length: 4 }, (_, i) => generateReservation(i + 26, 'cancelled', i + 3)),
];
