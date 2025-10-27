# 🎯 Step-by-Step Guide: Adding New API for New Page

## Overview

This guide shows you **exactly** how to add a new API for a new page using the **Vehicle Reservation Search** as a real example.

---

## 📋 The 6-Step Pattern

```
Step 1: Contract     → Define interface & types
Step 2: Mock Data    → Create test data
Step 3: Mock API     → Implement mock version
Step 4: Real API     → Implement production version
Step 5: Factory      → Add to apiFactory.ts
Step 6: Hooks        → Create React Query hooks
Step 7: Page         → Build UI component
```

---

## 📁 File Structure for New API

For a new **"Vehicle Reservation"** feature:

```
src/lib/api/
├── contracts/
│   └── vehicleReservation.contract.ts          ✅ Step 1
├── implementations/
│   ├── mock/
│   │   ├── vehicleReservationMockData.ts       ✅ Step 2
│   │   └── vehicleReservationMockApi.ts        ✅ Step 3
│   └── real/
│       └── vehicleReservationRealApi.ts        ✅ Step 4
└── apiFactory.ts                                ✅ Step 5 (update)

src/lib/hooks/
└── useVehicleReservation.ts                     ✅ Step 6

src/app/
└── reservation-search/
    └── page.tsx                                 ✅ Step 7
```

---

## Step 1: Create Contract (Interface)

**File:** `src/lib/api/contracts/vehicleReservation.contract.ts`

### What to include:

1. **Request/Response Types**

   ```typescript
   export interface ReservationSearchParams {
     startDate: Date;
     endDate: Date;
     customerName?: string;
     status?: ReservationStatus;
   }

   export interface Reservation {
     id: string;
     reservationNumber: string;
     customer: { name: string; phone: string };
     // ... more fields
   }
   ```

2. **API Interface**

   ```typescript
   export interface IVehicleReservationAPI {
     getShops(): Promise<Shop[]>;
     searchReservations(
       params: ReservationSearchParams
     ): Promise<ReservationSearchResponse>;
     cancelReservation(id: string, reason: string): Promise<void>;
   }
   ```

3. **Custom Error**
   ```typescript
   export class ReservationAPIError extends Error {
     constructor(
       message: string,
       public statusCode?: number,
       public details?: any
     ) {
       super(message);
       this.name = "ReservationAPIError";
     }
   }
   ```

### Key Points:

- ✅ Use TypeScript interfaces for type safety
- ✅ Mark optional fields with `?`
- ✅ Use union types for enums: `'pending' | 'confirmed' | 'cancelled'`
- ✅ Document with JSDoc comments

---

## Step 2: Create Mock Data

**File:** `src/lib/api/implementations/mock/vehicleReservationMockData.ts`

### What to include:

1. **Master Data** (for dropdowns)

   ```typescript
   export const mockShops: Shop[] = [
     { code: "SH001", name: "札幌駅北口店", region: "北海道" },
     { code: "SH002", name: "麻生駅前店", region: "北海道" },
   ];
   ```

2. **Helper Functions** (for generating realistic data)

   ```typescript
   function generateReservation(
     id: number,
     status: ReservationStatus
   ): Reservation {
     // Generate realistic test data
     return {
       id: `RES-${String(id).padStart(5, "0")}`,
       // ... more fields
     };
   }
   ```

3. **Mock Entities**
   ```typescript
   export const mockReservations: Reservation[] = [
     ...Array.from({ length: 10 }, (_, i) =>
       generateReservation(i, "confirmed")
     ),
   ];
   ```

### Key Points:

- ✅ Use realistic Japanese names, addresses, etc.
- ✅ Generate various scenarios (pending, confirmed, cancelled)
- ✅ Include edge cases for testing

---

## Step 3: Create Mock API Implementation

**File:** `src/lib/api/implementations/mock/vehicleReservationMockApi.ts`

### Template:

```typescript
import type {
  IVehicleReservationAPI /* ... types */,
} from "../../contracts/vehicleReservation.contract";
import { mockShops, mockReservations } from "./vehicleReservationMockData";

export class MockVehicleReservationAPI implements IVehicleReservationAPI {
  private delay = 500; // Simulate network latency

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async getShops(): Promise<Shop[]> {
    console.log("📡 Mock API: getShops()");
    await this.simulateDelay();
    return mockShops;
  }

  async searchReservations(
    params: ReservationSearchParams
  ): Promise<ReservationSearchResponse> {
    console.log("📡 Mock API: searchReservations()", params);
    await this.simulateDelay();

    // Filter logic based on params
    let filtered = [...mockReservations];
    if (params.customerName) {
      filtered = filtered.filter((r) =>
        r.customer.name.includes(params.customerName!)
      );
    }

    return {
      reservations: filtered,
      totalCount: filtered.length,
    };
  }

  async cancelReservation(id: string, reason: string): Promise<void> {
    console.log("📡 Mock API: cancelReservation()", { id, reason });
    await this.simulateDelay();
    // Simulate cancellation
  }
}
```

### Key Points:

- ✅ Must implement ALL methods from the interface
- ✅ Add `console.log` for debugging
- ✅ Simulate realistic delays (500ms)
- ✅ Filter mock data based on search params

---

## Step 4: Create Real API Implementation

**File:** `src/lib/api/implementations/real/vehicleReservationRealApi.ts`

### Template:

```typescript
import type {
  IVehicleReservationAPI /* ... types */,
} from "../../contracts/vehicleReservation.contract";
import { ReservationAPIError } from "../../contracts/vehicleReservation.contract";
import httpClient from "./httpClient";

export class RealVehicleReservationAPI implements IVehicleReservationAPI {
  private basePath = "/api/v1/reservations";

  async getShops(): Promise<Shop[]> {
    try {
      const response = await httpClient.get<Shop[]>(`${this.basePath}/shops`);
      return response.data;
    } catch (error: any) {
      throw new ReservationAPIError(
        "Failed to get shops",
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  async searchReservations(
    params: ReservationSearchParams
  ): Promise<ReservationSearchResponse> {
    try {
      const response = await httpClient.post<ReservationSearchResponse>(
        `${this.basePath}/search`,
        params
      );
      return response.data;
    } catch (error: any) {
      throw new ReservationAPIError(
        "Failed to search reservations",
        error.response?.status || 500,
        error.response?.data
      );
    }
  }

  async cancelReservation(id: string, reason: string): Promise<void> {
    try {
      await httpClient.post(`${this.basePath}/${id}/cancel`, { reason });
    } catch (error: any) {
      throw new ReservationAPIError(
        `Failed to cancel reservation: ${id}`,
        error.response?.status || 500,
        error.response?.data
      );
    }
  }
}
```

### Key Points:

- ✅ Use `httpClient` (already configured with auth)
- ✅ Wrap in try-catch with custom error
- ✅ Document backend endpoints in comments
- ✅ Return `response.data` for successful requests

---

## Step 5: Update API Factory

**File:** `src/lib/api/apiFactory.ts`

### Add these lines:

```typescript
// 1. Import the contract interface
import type { IVehicleReservationAPI } from "./contracts/vehicleReservation.contract";

// 2. Import both implementations
import { MockVehicleReservationAPI } from "./implementations/mock/vehicleReservationMockApi";
import { RealVehicleReservationAPI } from "./implementations/real/vehicleReservationRealApi";

// 3. Add singleton instance
let vehicleReservationInstance: IVehicleReservationAPI | null = null;

// 4. Add factory function
export function getVehicleReservationAPI(): IVehicleReservationAPI {
  if (!vehicleReservationInstance) {
    if (USE_MOCK_API) {
      console.log("🎭 Using Mock Vehicle Reservation API");
      vehicleReservationInstance = new MockVehicleReservationAPI();
    } else {
      console.log("🌐 Using Real Vehicle Reservation API");
      vehicleReservationInstance = new RealVehicleReservationAPI();
    }
  }
  return vehicleReservationInstance!;
}

// 5. Update reset function
export function resetAPIInstances() {
  operationTableInstance = null;
  vehicleReservationInstance = null; // Add this line
}
```

---

## Step 6: Create Custom Hooks

**File:** `src/lib/hooks/useVehicleReservation.ts`

### Template:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVehicleReservationAPI } from "@/lib/api/apiFactory";

const api = getVehicleReservationAPI();

// Query Keys (for cache management)
const QUERY_KEYS = {
  shops: ["reservations", "shops"] as const,
  search: (params: ReservationSearchParams) =>
    ["reservations", "search", params] as const,
};

// Read Operation (useQuery)
export function useShops() {
  return useQuery({
    queryKey: QUERY_KEYS.shops,
    queryFn: () => api.getShops(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReservationSearch(params: ReservationSearchParams) {
  return useQuery({
    queryKey: QUERY_KEYS.search(params),
    queryFn: () => api.searchReservations(params),
    enabled: !!(params.startDate && params.endDate), // Only run if dates provided
  });
}

// Write Operation (useMutation)
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.cancelReservation(id, reason),
    onSuccess: () => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
```

### Key Points:

- ✅ Use `useQuery` for GET operations (read)
- ✅ Use `useMutation` for POST/PUT/DELETE (write)
- ✅ Define `queryKey` for cache management
- ✅ Use `enabled` to control when queries run
- ✅ Invalidate cache after mutations

---

## Step 7: Create Page Component

**File:** `src/app/reservation-search/page.tsx`

### Template:

```typescript
"use client";

import { useState } from "react";
import {
  useShops,
  useReservationSearch,
  useCancelReservation,
} from "@/lib/hooks/useVehicleReservation";

export default function ReservationSearchPage() {
  const [searchParams, setSearchParams] = useState<ReservationSearchParams>({
    startDate: new Date(),
    endDate: new Date(),
  });

  // Use hooks
  const { data: shops } = useShops();
  const {
    data: results,
    isLoading,
    error,
  } = useReservationSearch(searchParams);
  const cancelMutation = useCancelReservation();

  return (
    <Box>
      {/* Search Form */}
      <TextField
        label="開始日"
        type="date"
        value={searchParams.startDate.toISOString().split("T")[0]}
        onChange={(e) =>
          setSearchParams({
            ...searchParams,
            startDate: new Date(e.target.value),
          })
        }
      />

      {/* Results Table */}
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table>
          {results?.reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.reservationNumber}</TableCell>
              <TableCell>{reservation.customer.name}</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    cancelMutation.mutate({ id: reservation.id, reason: "..." })
                  }
                >
                  キャンセル
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </Box>
  );
}
```

---

## 🔄 Complete Flow Diagram

```
User Action (UI)
    ↓
Custom Hook (useReservationSearch)
    ↓
React Query (caching, loading states)
    ↓
API Factory (getVehicleReservationAPI)
    ↓
    ├─ Mock API (POC)
    │   ↓
    │   Mock Data
    │
    └─ Real API (Production)
        ↓
        HTTP Client
        ↓
        Backend Server
```

---

## ✅ Checklist for New API

- [ ] **Step 1:** Create contract interface in `contracts/[name].contract.ts`

  - [ ] Define request/response types
  - [ ] Define API interface
  - [ ] Create custom error class

- [ ] **Step 2:** Create mock data in `implementations/mock/[name]MockData.ts`

  - [ ] Master data (dropdowns)
  - [ ] Helper functions
  - [ ] Mock entities

- [ ] **Step 3:** Create mock API in `implementations/mock/[name]MockApi.ts`

  - [ ] Implement interface
  - [ ] Add delays
  - [ ] Add filtering logic

- [ ] **Step 4:** Create real API in `implementations/real/[name]RealApi.ts`

  - [ ] Implement interface
  - [ ] Use httpClient
  - [ ] Add error handling

- [ ] **Step 5:** Update `apiFactory.ts`

  - [ ] Import contract
  - [ ] Import implementations
  - [ ] Add singleton instance
  - [ ] Add factory function
  - [ ] Update reset function

- [ ] **Step 6:** Create hooks in `hooks/use[Name].ts`

  - [ ] Define query keys
  - [ ] Create useQuery hooks
  - [ ] Create useMutation hooks

- [ ] **Step 7:** Create page in `app/[page-name]/page.tsx`

  - [ ] Import hooks
  - [ ] Build UI
  - [ ] Handle loading/error states

- [ ] **Test with mock API** (`.env.local`: `NEXT_PUBLIC_USE_MOCK_API=true`)

- [ ] **Switch to real API when backend ready** (`.env.local`: `NEXT_PUBLIC_USE_MOCK_API=false`)

---

## 🎯 Real Example: Files Created

For **Vehicle Reservation Search**, we created:

1. ✅ `contracts/vehicleReservation.contract.ts` (140 lines)
2. ✅ `implementations/mock/vehicleReservationMockData.ts` (130 lines)
3. ✅ `implementations/mock/vehicleReservationMockApi.ts` (150 lines)
4. ✅ `implementations/real/vehicleReservationRealApi.ts` (110 lines)
5. ✅ `apiFactory.ts` (updated - added 15 lines)
6. ✅ `hooks/useVehicleReservation.ts` (130 lines)
7. ✅ `app/reservation-search/page.tsx` (330 lines)

**Total:** ~1,000 lines of code for a complete feature!

---

## 🚀 Next Steps

### To test the new page:

1. Make sure `.env.local` has `NEXT_PUBLIC_USE_MOCK_API=true`
2. Run dev server: `npm run dev`
3. Visit: `http://localhost:3000/reservation-search`
4. Test search functionality with mock data

### When backend is ready:

1. Update `.env.local`: `NEXT_PUBLIC_USE_MOCK_API=false`
2. Update `NEXT_PUBLIC_API_BASE_URL` to backend URL
3. Test all API endpoints
4. Fix any data format mismatches

---

## 💡 Tips

### Naming Conventions:

- Contract: `[feature].contract.ts`
- Mock Data: `[feature]MockData.ts`
- Mock API: `[feature]MockApi.ts`
- Real API: `[feature]RealApi.ts`
- Hooks: `use[Feature].ts`
- Page: `[kebab-case]/page.tsx`

### Best Practices:

- ✅ Keep contracts small and focused
- ✅ Use realistic mock data (Japanese names, addresses)
- ✅ Add JSDoc comments for complex types
- ✅ Use `console.log` in mock API for debugging
- ✅ Invalidate cache after mutations
- ✅ Handle loading/error states in UI

---

**You now have a complete, working example!** Just follow this pattern for any new API. 🎉
