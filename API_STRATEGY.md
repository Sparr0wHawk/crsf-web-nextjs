# API Integration Strategy for POC & Production

## 🎯 Overview

**Current Situation:**

- ✅ Old backend exists (Java EE) but not suitable for modern REST API
- 🔄 Future backend will be different (customer's existing API + tweaks)
- 🎨 Frontend POC needs to proceed independently

**Strategy:**

- Build **API abstraction layer** in frontend
- Use **mock data** for POC
- Design **API contracts** that work for both scenarios
- Make backend **swappable** without touching components

---

## 📐 Architecture: API Abstraction Layer

### **Layered Architecture**

```
┌─────────────────────────────────────────────────────────┐
│  React Components (UI Layer)                            │
│  - OperationTablePage.tsx                               │
│  - SearchForm.tsx                                       │
│  - OperationTableGraph.tsx                              │
└─────────────────────────────────────────────────────────┘
                        ↓ uses
┌─────────────────────────────────────────────────────────┐
│  Custom Hooks (Data Access Layer)                       │
│  - useOperationTableData()                              │
│  - useBlockList()                                       │
│  - useUpdateSchedule()                                  │
└─────────────────────────────────────────────────────────┘
                        ↓ calls
┌─────────────────────────────────────────────────────────┐
│  API Client (Abstraction Layer) ⭐ THIS IS KEY          │
│  - operationTableApi.ts                                 │
│  - Interface: OperationTableAPI                         │
└─────────────────────────────────────────────────────────┘
                        ↓ implements
┌──────────────────────┬──────────────────────────────────┐
│  Mock Implementation │  Real API Implementation         │
│  (POC Phase)         │  (Production Phase)              │
│  - mockApi.ts        │  - realApi.ts / customerApi.ts   │
└──────────────────────┴──────────────────────────────────┘
```

**Key Principle:** Components never call APIs directly - always through abstraction layer!

---

## 🔧 Implementation Strategy

### **Step 1: Define API Contracts (TypeScript Interfaces)**

These are **backend-agnostic** contracts that both mock and real APIs must implement:

```typescript
// src/lib/api/contracts/operationTable.contract.ts

/**
 * API Contract for Operation Table
 * This interface must be implemented by ANY backend (mock, old system, new API)
 */
export interface IOperationTableAPI {
  // Initialize page with dropdown data
  initialize(): Promise<InitializeResponse>;

  // Search for operations based on filters
  search(params: SearchParams): Promise<SearchResponse>;

  // Get blocks for a given section
  getBlocks(sectionCode: string): Promise<Block[]>;

  // Get vehicle divisions based on disposition/using division
  getVehicleDivisions(dispositionDivision: string): Promise<VehicleDivision[]>;

  // Update schedule (drag & drop)
  updateSchedule(update: ScheduleUpdate): Promise<void>;

  // Get status detail
  getStatusDetail(pieceId: string): Promise<StatusDetail>;
}

// Request/Response types (shared contract)
export interface SearchParams {
  searchDate: Date;
  sectionCode?: string;
  blockCode?: string;
  shopCode?: string;
  classCodes?: string[];
  carModelCode?: string;
  dispositionAndUsingDivision?: string;
  carDivision?: string;
  sortDivision?: string;
  provisionalBookingExecute?: boolean;
  searchScope?: "72h" | "2weeks";
}

export interface SearchResponse {
  header: OperationTableHeader;
  operations: Operation[];
}

export interface OperationTableHeader {
  dateList: string[]; // ["02/10(水)", "02/11(木)", ...]
  timeList: string[]; // ["0", "6", "12", "18"]
  graphMeshCount: number; // Total columns
  dateMeshCount: number; // Columns per day
  timeMeshCount: number; // Columns per hour
}

export interface Operation {
  id: string; // Unique identifier
  registNumber: string; // 登録番号
  carName: string; // 車種名
  condition: string; // 条件
  selfAndOthersDivision: string; // 自他FEE区分
  classCode: string; // クラスコード
  dispositionShopName: string; // 配備営業所
  usingShopName: string; // 運用営業所
  pieceInformationList: StatusPiece[];
}

export interface StatusPiece {
  id: string; // Unique piece ID
  pieceLength: number; // Duration in mesh units
  pieceColor: string; // Hex color code
  tooltipMessage: string; // Hover message
  statusType: string; // 'rental' | 'idle' | 'maintenance' | 'charter'
  startTime: Date; // Absolute start time
  endTime: Date; // Absolute end time
  details: Record<string, any>; // Flexible details (backend-specific)
}

export interface ScheduleUpdate {
  pieceId: string;
  newStartTime: Date;
  newEndTime: Date;
  newVehicleId?: string; // If moved to different vehicle
}

// ... other interfaces
```

---

### **Step 2: Create Mock Implementation (POC Phase)**

```typescript
// src/lib/api/implementations/mockApi.ts

import { IOperationTableAPI, SearchParams, SearchResponse } from "../contracts";
import { mockOperations, mockBlocks, mockSections } from "./mockData";

/**
 * Mock API Implementation for POC
 * Returns hardcoded data, simulates network delay
 */
export class MockOperationTableAPI implements IOperationTableAPI {
  private delay = 500; // Simulate 500ms network latency

  async initialize() {
    await this.simulateDelay();

    return {
      sections: mockSections,
      vehicleDivisions: mockVehicleDivisions,
      sortOptions: mockSortOptions,
      defaultSearchDate: new Date(),
    };
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    await this.simulateDelay();

    // Simple filtering logic for demo
    let filteredOps = mockOperations;

    if (params.sectionCode) {
      filteredOps = filteredOps.filter(
        (op) => op.sectionCode === params.sectionCode
      );
    }

    if (params.blockCode) {
      filteredOps = filteredOps.filter(
        (op) => op.blockCode === params.blockCode
      );
    }

    return {
      header: this.generateHeader(params.searchScope),
      operations: filteredOps,
    };
  }

  async getBlocks(sectionCode: string) {
    await this.simulateDelay();
    return mockBlocks.filter((b) => b.sectionCode === sectionCode);
  }

  async updateSchedule(update: ScheduleUpdate) {
    await this.simulateDelay();
    console.log("Mock: Schedule updated", update);
    // In POC, just log - no persistence
  }

  private simulateDelay() {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  private generateHeader(scope?: "72h" | "2weeks") {
    // Generate date/time headers based on scope
    const dates = [];
    const times = ["0", "6", "12", "18"];
    const days = scope === "2weeks" ? 14 : 3;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(this.formatDate(date));
    }

    return {
      dateList: dates,
      timeList: times,
      graphMeshCount: days * 24 * 2, // 2 mesh per hour
      dateMeshCount: 48,
      timeMeshCount: 2,
    };
  }

  private formatDate(date: Date): string {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month.toString().padStart(2, "0")}/${day
      .toString()
      .padStart(2, "0")}(${dayOfWeek})`;
  }
}
```

---

### **Step 3: Create API Factory (Switcher)**

```typescript
// src/lib/api/apiFactory.ts

import { IOperationTableAPI } from "./contracts";
import { MockOperationTableAPI } from "./implementations/mockApi";
import { RealOperationTableAPI } from "./implementations/realApi";

/**
 * API Factory - Switch between mock and real API
 * This is the ONLY place that knows which implementation to use
 */

// Environment variable to control which API to use
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

export function createOperationTableAPI(): IOperationTableAPI {
  if (USE_MOCK_API) {
    console.log("🎭 Using Mock API");
    return new MockOperationTableAPI();
  } else {
    console.log("🌐 Using Real API");
    return new RealOperationTableAPI();
  }
}

// Singleton instance
let apiInstance: IOperationTableAPI | null = null;

export function getOperationTableAPI(): IOperationTableAPI {
  if (!apiInstance) {
    apiInstance = createOperationTableAPI();
  }
  return apiInstance;
}
```

---

### **Step 4: Create React Query Hooks (Data Access Layer)**

```typescript
// src/features/operation-table/hooks/useOperationTableData.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOperationTableAPI } from "@/lib/api/apiFactory";
import { SearchParams } from "@/lib/api/contracts";

/**
 * Custom hook for operation table data
 * Components use THIS, not the API directly
 */
export function useOperationTableData(searchParams: SearchParams) {
  const api = getOperationTableAPI();

  return useQuery({
    queryKey: ["operationTable", searchParams],
    queryFn: () => api.search(searchParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for cascading block list
 */
export function useBlockList(sectionCode: string | undefined) {
  const api = getOperationTableAPI();

  return useQuery({
    queryKey: ["blocks", sectionCode],
    queryFn: () => api.getBlocks(sectionCode!),
    enabled: !!sectionCode, // Only fetch when section is selected
  });
}

/**
 * Hook for updating schedules (drag & drop)
 */
export function useUpdateSchedule() {
  const api = getOperationTableAPI();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: ScheduleUpdate) => api.updateSchedule(update),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["operationTable"] });
    },
    // Optimistic updates
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: ["operationTable"] });

      const previousData = queryClient.getQueryData(["operationTable"]);

      // Optimistically update the UI
      queryClient.setQueryData(["operationTable"], (old: any) => {
        // Update logic here
        return old;
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(["operationTable"], context?.previousData);
    },
  });
}

/**
 * Hook for initialization data
 */
export function useOperationTableInit() {
  const api = getOperationTableAPI();

  return useQuery({
    queryKey: ["operationTableInit"],
    queryFn: () => api.initialize(),
    staleTime: Infinity, // Init data doesn't change
  });
}
```

---

### **Step 5: Components Use Hooks (Never Touch API)**

```typescript
// src/features/operation-table/components/SearchForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useOperationTableInit, useBlockList } from "../hooks";

export function SearchForm({ onSearch }) {
  const [sectionCode, setSectionCode] = useState("");
  const [blockCode, setBlockCode] = useState("");

  // Get init data (sections, defaults, etc.)
  const { data: initData, isLoading: initLoading } = useOperationTableInit();

  // Get blocks when section changes (cascading dropdown)
  const { data: blocks, isLoading: blocksLoading } = useBlockList(sectionCode);

  // Reset block when section changes
  useEffect(() => {
    setBlockCode("");
  }, [sectionCode]);

  return (
    <form>
      <Select
        label="部"
        value={sectionCode}
        onChange={(e) => setSectionCode(e.target.value)}
        disabled={initLoading}
      >
        {initData?.sections.map((s) => (
          <MenuItem key={s.code} value={s.code}>
            {s.name}
          </MenuItem>
        ))}
      </Select>

      <Select
        label="ブロック"
        value={blockCode}
        onChange={(e) => setBlockCode(e.target.value)}
        disabled={!sectionCode || blocksLoading}
      >
        {blocks?.map((b) => (
          <MenuItem key={b.code} value={b.code}>
            {b.name}
          </MenuItem>
        ))}
      </Select>

      {/* ... other fields */}
    </form>
  );
}

// ✅ Component never imports API directly
// ✅ Component only uses hooks
// ✅ Switching API implementation requires ZERO component changes
```

---

## 🔄 Migration Path: POC → Production

### **Phase 1: POC Development (Now)**

```typescript
// .env.local
NEXT_PUBLIC_USE_MOCK_API = true;
```

**What exists:**

- ✅ API contracts defined
- ✅ Mock implementation
- ✅ React hooks using abstraction
- ✅ Components using hooks
- ✅ Full UI working with mock data

**Backend:** Nothing needed!

---

### **Phase 2: Backend Analysis (Parallel)**

While POC is being built, backend team analyzes customer's existing API:

**Questions to answer:**

1. What endpoints exist?
2. What's the request/response format?
3. Authentication method?
4. Rate limiting?
5. What needs to be tweaked?

**Output:** API specification document

---

### **Phase 3: Real API Implementation (After POC)**

```typescript
// src/lib/api/implementations/realApi.ts

import { IOperationTableAPI, SearchParams, SearchResponse } from "../contracts";
import axios from "axios";

/**
 * Real API Implementation
 * Adapts customer's API to our contract
 */
export class RealOperationTableAPI implements IOperationTableAPI {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  private client = axios.create({
    baseURL: this.baseUrl,
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
    },
  });

  async initialize() {
    // Call customer's init endpoint
    const response = await this.client.get("/api/v1/operation-table/init");

    // Transform their response to our contract
    return this.transformInitResponse(response.data);
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    // Transform our params to their API format
    const apiParams = this.transformSearchParams(params);

    // Call their endpoint
    const response = await this.client.post(
      "/api/v1/operation-table/search",
      apiParams
    );

    // Transform their response to our contract
    return this.transformSearchResponse(response.data);
  }

  async getBlocks(sectionCode: string) {
    const response = await this.client.get(
      `/api/v1/blocks?section=${sectionCode}`
    );
    return this.transformBlocksResponse(response.data);
  }

  async updateSchedule(update: ScheduleUpdate) {
    const apiUpdate = this.transformScheduleUpdate(update);
    await this.client.put("/api/v1/schedule", apiUpdate);
  }

  // Transformation methods to adapt their API to our contract
  private transformSearchParams(params: SearchParams) {
    // Map our param names to their API's expected names
    return {
      search_date: params.searchDate.toISOString(),
      section: params.sectionCode,
      block: params.blockCode,
      shop_id: params.shopCode,
      class_codes: params.classCodes,
      // ... etc
    };
  }

  private transformSearchResponse(apiResponse: any): SearchResponse {
    // Map their response structure to our contract
    return {
      header: {
        dateList: apiResponse.dates,
        timeList: apiResponse.times,
        graphMeshCount: apiResponse.total_columns,
        dateMeshCount: apiResponse.columns_per_day,
        timeMeshCount: apiResponse.columns_per_hour,
      },
      operations: apiResponse.vehicles.map((v) => ({
        id: v.vehicle_id,
        registNumber: v.registration_number,
        carName: v.model_name,
        // ... map all fields
        pieceInformationList: v.statuses.map((s) => ({
          id: s.status_id,
          pieceLength: s.duration,
          pieceColor: s.color_code,
          // ... etc
        })),
      })),
    };
  }

  // ... other transformation methods
}
```

**To switch to real API:**

```typescript
// .env.production
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=https://customer-api.example.com
NEXT_PUBLIC_API_TOKEN=xxx
```

**Result:** ZERO component changes needed! 🎉

---

## 📋 What You Need to Do for POC

### **1. Define API Contracts** ⭐ CRITICAL

```typescript
// Document EVERYTHING your UI needs
interface IOperationTableAPI {
  // List ALL operations here
}

// Define ALL request/response types
interface SearchParams {
  /* ... */
}
interface SearchResponse {
  /* ... */
}
// etc.
```

**Why:** This is the "agreement" between frontend and backend teams

---

### **2. Create Mock Data**

```typescript
// src/lib/api/implementations/mockData.ts

export const mockOperations: Operation[] = [
  {
    id: "op-001",
    registNumber: "1123022224",
    carName: "アルファード",
    condition: "1234567",
    selfAndOthersDivision: "C",
    classCode: "WCL",
    dispositionShopName: "麻生駅前",
    usingShopName: "札幌駅北口",
    pieceInformationList: [
      {
        id: "piece-001",
        pieceLength: 12,
        pieceColor: "#FF5733",
        tooltipMessage: "貸渡中\n予約番号: R001\n返却予定: 12:00",
        statusType: "rental",
        startTime: new Date("2025-10-24T00:00:00"),
        endTime: new Date("2025-10-24T06:00:00"),
        details: {
          reservationNumber: "R001",
          customerName: "山田太郎",
        },
      },
      {
        id: "piece-002",
        pieceLength: 24,
        pieceColor: "#33FF57",
        tooltipMessage: "アイドル",
        statusType: "idle",
        startTime: new Date("2025-10-24T06:00:00"),
        endTime: new Date("2025-10-24T18:00:00"),
        details: {},
      },
    ],
  },
  // Add 20-30 vehicles for realistic POC
  {
    id: "op-002",
    registNumber: "5678901234",
    carName: "ヴェルファイア",
    // ...
  },
];

export const mockSections = [
  { code: "1", name: "第一部" },
  { code: "2", name: "第二部" },
  { code: "3", name: "第三部" },
];

export const mockBlocks = [
  { code: "11", name: "札幌第一", sectionCode: "1" },
  { code: "12", name: "札幌第二", sectionCode: "1" },
  { code: "21", name: "東京第一", sectionCode: "2" },
  { code: "22", name: "東京第二", sectionCode: "2" },
];
```

**Goal:** Make POC look realistic with enough variety

---

### **3. Implement Mock API Class**

```typescript
// Simple implementation that returns mock data
export class MockOperationTableAPI implements IOperationTableAPI {
  async search(params) {
    await delay(500); // Simulate network
    return { header: mockHeader, operations: mockOperations };
  }
  // ... implement all interface methods
}
```

---

### **4. Setup API Factory**

```typescript
// One place to switch between mock and real
export function getOperationTableAPI() {
  return USE_MOCK_API ? new MockAPI() : new RealAPI();
}
```

---

### **5. Create React Query Hooks**

```typescript
// Components use these, never API directly
export function useOperationTableData(params) {
  const api = getOperationTableAPI();
  return useQuery(["ops", params], () => api.search(params));
}
```

---

## 📦 Folder Structure

```
src/
├── lib/
│   └── api/
│       ├── contracts/                    # ⭐ API Contracts (interfaces)
│       │   └── operationTable.contract.ts
│       │
│       ├── implementations/               # API Implementations
│       │   ├── mockApi.ts                # POC phase
│       │   ├── mockData.ts               # Sample data
│       │   └── realApi.ts                # Production phase (add later)
│       │
│       └── apiFactory.ts                 # Switcher
│
├── features/
│   └── operation-table/
│       ├── hooks/                        # ⭐ Components use these
│       │   ├── useOperationTableData.ts
│       │   ├── useBlockList.ts
│       │   └── useUpdateSchedule.ts
│       │
│       └── components/
│           ├── SearchForm.tsx            # Uses hooks only
│           └── OperationTableGraph.tsx   # Uses hooks only
```

---

## 🎯 Benefits of This Approach

### **For POC:**

✅ **Independent development** - No waiting for backend
✅ **Fast iteration** - Mock data is instant
✅ **Realistic demo** - Mock API simulates real delays
✅ **Full feature testing** - Test all UI interactions

### **For Production:**

✅ **Easy backend swap** - Just implement contract, change env var
✅ **Zero component changes** - Components don't know about backend
✅ **Type-safe integration** - TypeScript ensures contract compliance
✅ **Parallel development** - Frontend and backend teams work independently
✅ **Backend flexibility** - Can switch APIs without rewriting frontend

### **For Maintenance:**

✅ **Clear boundaries** - API layer is isolated
✅ **Easy testing** - Can test components with mock API
✅ **Migration safety** - Old API can coexist with new during transition
✅ **Backend upgrades** - Backend changes only affect one implementation file

---

## 📝 Checklist for POC

### **Must Do Now:**

- [ ] Define `IOperationTableAPI` contract (all methods)
- [ ] Define all TypeScript interfaces (request/response types)
- [ ] Create mock data (20-30 vehicles, realistic scenarios)
- [ ] Implement `MockOperationTableAPI` class
- [ ] Create API factory with environment switch
- [ ] Create React Query hooks
- [ ] Document API contract for backend team

### **Don't Need Now:**

- [ ] ❌ Real API implementation (do after POC approval)
- [ ] ❌ Authentication logic (POC doesn't need it)
- [ ] ❌ Error retry logic (keep simple for POC)
- [ ] ❌ Complex caching strategies (React Query defaults are fine)

---

## 🔮 Future: When Backend is Ready

**Step 1:** Backend team provides API specification

```
GET /api/v1/operation-table/init
POST /api/v1/operation-table/search
etc.
```

**Step 2:** Create adapter class

```typescript
export class CustomerAPIAdapter implements IOperationTableAPI {
  // Transform their API to our contract
}
```

**Step 3:** Change environment variable

```env
NEXT_PUBLIC_USE_MOCK_API=false
```

**Step 4:** Test

```typescript
// All components work without changes!
```

**Step 5:** Deploy 🚀

---

## 💡 Key Takeaways

1. **Abstraction is everything** - Never let components talk to APIs directly
2. **Contracts are the agreement** - Define them carefully, they're your "API spec"
3. **Mock first, real later** - POC proves value before backend investment
4. **Environment variables for switching** - One line change to swap backends
5. **TypeScript enforces contracts** - Compiler catches integration errors
6. **React Query is your friend** - Handles caching, loading, errors automatically

**The goal:** Build POC that works perfectly with mock data, then drop in real API with minimal changes! 🎯
