# API Architecture Guide

## 📁 Current File Structure

```
src/lib/api/
├── apiFactory.ts                          # 🏭 Factory pattern - switches Mock/Real
├── contracts/                             # 📋 TypeScript interfaces (contracts)
│   └── operationTable.contract.ts         # Contract for operation table API
├── implementations/                       # 💾 Concrete implementations
│   ├── mockApi.ts                        # Mock API (POC) - implements contract
│   ├── mockData.ts                       # Mock data generator
│   └── realApi.ts                        # 🚀 Real API (future) - implements contract
```

---

## 🎯 How to Add New Search Pages (City/Province Example)

### Step 1: Create New Contract

**File: `src/lib/api/contracts/citySearch.contract.ts`**

```typescript
/**
 * City Search API Contract
 *
 * Defines the interface for city-based vehicle search
 */

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CitySearchParams {
  cityCode?: string;
  provinceCode?: string;
  vehicleType?: "car" | "van" | "truck";
  availableFrom?: Date;
  availableTo?: Date;
}

export interface City {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Province {
  code: string;
  name: string;
  region: string; // 北海道, 東北, 関東, etc.
}

export interface CitySearchResponse {
  availableVehicles: VehicleSummary[];
  totalCount: number;
}

export interface VehicleSummary {
  id: string;
  registNumber: string;
  carName: string;
  classCode: string;
  cityName: string;
  provinceName: string;
  shopName: string;
  dailyRate: number;
}

// ============================================================================
// API Interface (Contract)
// ============================================================================

export interface ICitySearchAPI {
  /**
   * Get all provinces
   */
  getProvinces(): Promise<Province[]>;

  /**
   * Get cities by province
   */
  getCitiesByProvince(provinceCode: string): Promise<City[]>;

  /**
   * Search available vehicles by city/province
   */
  searchByCity(params: CitySearchParams): Promise<CitySearchResponse>;
}
```

---

### Step 2: Create Mock Implementation

**File: `src/lib/api/implementations/citySearchMockApi.ts`**

```typescript
import type {
  ICitySearchAPI,
  Province,
  City,
  CitySearchParams,
  CitySearchResponse,
  VehicleSummary,
} from "../contracts/citySearch.contract";

export class MockCitySearchAPI implements ICitySearchAPI {
  private delay = 500;

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  async getProvinces(): Promise<Province[]> {
    console.log("📡 Mock API: getProvinces()");
    await this.simulateDelay();

    return [
      { code: "01", name: "北海道", region: "北海道" },
      { code: "13", name: "東京都", region: "関東" },
      { code: "27", name: "大阪府", region: "近畿" },
      { code: "40", name: "福岡県", region: "九州" },
    ];
  }

  async getCitiesByProvince(provinceCode: string): Promise<City[]> {
    console.log("📡 Mock API: getCitiesByProvince()", provinceCode);
    await this.simulateDelay();

    const cityMap: Record<string, City[]> = {
      "01": [
        { code: "011", name: "札幌市", provinceCode: "01" },
        { code: "012", name: "函館市", provinceCode: "01" },
        { code: "013", name: "旭川市", provinceCode: "01" },
      ],
      "13": [
        { code: "131", name: "千代田区", provinceCode: "13" },
        { code: "132", name: "新宿区", provinceCode: "13" },
        { code: "133", name: "渋谷区", provinceCode: "13" },
      ],
      "27": [
        { code: "271", name: "大阪市", provinceCode: "27" },
        { code: "272", name: "堺市", provinceCode: "27" },
      ],
      "40": [
        { code: "401", name: "福岡市", provinceCode: "40" },
        { code: "402", name: "北九州市", provinceCode: "40" },
      ],
    };

    return cityMap[provinceCode] || [];
  }

  async searchByCity(params: CitySearchParams): Promise<CitySearchResponse> {
    console.log("📡 Mock API: searchByCity()", params);
    await this.simulateDelay();

    // Mock data - filter based on params
    const mockVehicles: VehicleSummary[] = [
      {
        id: "v001",
        registNumber: "札11-1234",
        carName: "アルファード",
        classCode: "WCL",
        cityName: "札幌市",
        provinceName: "北海道",
        shopName: "札幌駅北口店",
        dailyRate: 15000,
      },
      {
        id: "v002",
        registNumber: "札11-5678",
        carName: "プリウス",
        classCode: "SE",
        cityName: "札幌市",
        provinceName: "北海道",
        shopName: "麻生駅前店",
        dailyRate: 8000,
      },
      // Add more mock vehicles...
    ];

    // Simple filtering
    let filtered = mockVehicles;
    if (params.cityCode) {
      filtered = filtered.filter((v) => v.cityName.includes(params.cityCode!));
    }
    if (params.vehicleType) {
      // Filter by vehicle type (simplified)
      const typeMap: Record<string, string[]> = {
        car: ["SE", "SC"],
        van: ["WV1", "WV2"],
        truck: ["WCL", "WT"],
      };
      const codes = typeMap[params.vehicleType] || [];
      filtered = filtered.filter((v) => codes.includes(v.classCode));
    }

    return {
      availableVehicles: filtered,
      totalCount: filtered.length,
    };
  }
}
```

---

### Step 3: Update API Factory

**File: `src/lib/api/apiFactory.ts`** (Add new factory function)

```typescript
import type { IOperationTableAPI } from "./contracts/operationTable.contract";
import type { ICitySearchAPI } from "./contracts/citySearch.contract";
import { MockOperationTableAPI } from "./implementations/mockApi";
import { MockCitySearchAPI } from "./implementations/citySearchMockApi";

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// Separate singletons for each API
let operationTableInstance: IOperationTableAPI | null = null;
let citySearchInstance: ICitySearchAPI | null = null;

export function getOperationTableAPI(): IOperationTableAPI {
  if (!operationTableInstance) {
    if (USE_MOCK_API) {
      console.log("🎭 Using Mock Operation Table API");
      operationTableInstance = new MockOperationTableAPI();
    } else {
      // operationTableInstance = new RealOperationTableAPI();
      throw new Error(
        "Real API not implemented. Set NEXT_PUBLIC_USE_MOCK_API=true"
      );
    }
  }
  return operationTableInstance!;
}

// 🆕 New factory function for city search
export function getCitySearchAPI(): ICitySearchAPI {
  if (!citySearchInstance) {
    if (USE_MOCK_API) {
      console.log("🎭 Using Mock City Search API");
      citySearchInstance = new MockCitySearchAPI();
    } else {
      // citySearchInstance = new RealCitySearchAPI();
      throw new Error(
        "Real API not implemented. Set NEXT_PUBLIC_USE_MOCK_API=true"
      );
    }
  }
  return citySearchInstance!;
}

export function resetAPIInstances() {
  operationTableInstance = null;
  citySearchInstance = null;
}
```

---

### Step 4: Create Custom Hook

**File: `src/lib/hooks/useCitySearch.ts`**

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCitySearchAPI } from "@/lib/api/apiFactory";
import type { CitySearchParams } from "@/lib/api/contracts/citySearch.contract";

const api = getCitySearchAPI();

/**
 * Get all provinces
 */
export function useProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: () => api.getProvinces(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get cities for a province (cascading dropdown)
 */
export function useCitiesByProvince(provinceCode: string | undefined) {
  return useQuery({
    queryKey: ["cities", provinceCode],
    queryFn: () => api.getCitiesByProvince(provinceCode!),
    enabled: !!provinceCode, // Only run if province selected
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Search vehicles by city/province
 */
export function useCitySearch(params: CitySearchParams) {
  return useQuery({
    queryKey: ["citySearch", params],
    queryFn: () => api.searchByCity(params),
    enabled: !!(params.cityCode || params.provinceCode),
  });
}
```

---

### Step 5: Create Page

**File: `src/app/city-search/page.tsx`**

```typescript
"use client";

import { useState } from "react";
import {
  useProvinces,
  useCitiesByProvince,
  useCitySearch,
} from "@/lib/hooks/useCitySearch";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

export default function CitySearchPage() {
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");

  const { data: provinces } = useProvinces();
  const { data: cities } = useCitiesByProvince(provinceCode);
  const { data: searchResults, refetch } = useCitySearch({
    cityCode,
    provinceCode,
  });

  return (
    <Box sx={{ p: 3 }}>
      <h1>都市別車両検索</h1>

      {/* Province Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>都道府県</InputLabel>
        <Select
          value={provinceCode}
          onChange={(e) => {
            setProvinceCode(e.target.value);
            setCityCode(""); // Reset city when province changes
          }}
        >
          {provinces?.map((p) => (
            <MenuItem key={p.code} value={p.code}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* City Dropdown (Cascading) */}
      <FormControl fullWidth sx={{ mb: 2 }} disabled={!provinceCode}>
        <InputLabel>市区町村</InputLabel>
        <Select value={cityCode} onChange={(e) => setCityCode(e.target.value)}>
          {cities?.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={() => refetch()}>
        検索
      </Button>

      {/* Results */}
      <Box sx={{ mt: 3 }}>
        <h2>検索結果: {searchResults?.totalCount || 0}件</h2>
        {searchResults?.availableVehicles.map((v) => (
          <Box key={v.id} sx={{ p: 2, border: "1px solid #ccc", mb: 1 }}>
            <div>
              {v.carName} - {v.registNumber}
            </div>
            <div>
              {v.provinceName} {v.cityName} - {v.shopName}
            </div>
            <div>¥{v.dailyRate.toLocaleString()}/日</div>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
```

---

## 🚀 Real API File Structure

When implementing the real API, follow this structure:

```
src/lib/api/
├── apiFactory.ts                          # Factory switches Mock/Real based on env
├── contracts/                             # TypeScript interfaces
│   ├── operationTable.contract.ts
│   ├── citySearch.contract.ts
│   └── shared.contract.ts                 # Common types (APIError, etc.)
│
├── implementations/
│   ├── mock/                              # 🎭 Mock implementations (POC)
│   │   ├── operationTableMockApi.ts
│   │   ├── operationTableMockData.ts
│   │   ├── citySearchMockApi.ts
│   │   └── citySearchMockData.ts
│   │
│   └── real/                              # 🌐 Real implementations (Production)
│       ├── operationTableRealApi.ts       # Implements IOperationTableAPI
│       ├── citySearchRealApi.ts           # Implements ICitySearchAPI
│       ├── httpClient.ts                  # Axios instance with interceptors
│       └── config.ts                      # API base URLs, timeouts
│
└── utils/                                 # Shared utilities
    ├── errorHandler.ts                    # Global error handling
    ├── transformers.ts                    # Data transformers (API ↔ UI)
    └── validators.ts                      # Runtime validation
```

---

## 📝 Real API Implementation Example

**File: `src/lib/api/implementations/real/httpClient.ts`**

```typescript
import axios from "axios";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (add auth token)
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (error handling)
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default httpClient;
```

**File: `src/lib/api/implementations/real/operationTableRealApi.ts`**

```typescript
import type {
  IOperationTableAPI,
  InitializeResponse,
  SearchParams,
  SearchResponse,
  Block,
  VehicleDivision,
  ScheduleUpdate,
  StatusDetail,
} from "../../contracts/operationTable.contract";
import httpClient from "./httpClient";

export class RealOperationTableAPI implements IOperationTableAPI {
  private basePath = "/api/operation-table";

  async initialize(): Promise<InitializeResponse> {
    const response = await httpClient.get<InitializeResponse>(
      `${this.basePath}/initialize`
    );
    return response.data;
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    const response = await httpClient.post<SearchResponse>(
      `${this.basePath}/search`,
      params
    );
    return response.data;
  }

  async getBlocks(sectionCode: string): Promise<Block[]> {
    const response = await httpClient.get<Block[]>(
      `${this.basePath}/blocks/${sectionCode}`
    );
    return response.data;
  }

  async getVehicleDivisions(
    dispositionDivision: string
  ): Promise<VehicleDivision[]> {
    const response = await httpClient.get<VehicleDivision[]>(
      `${this.basePath}/vehicle-divisions/${dispositionDivision}`
    );
    return response.data;
  }

  async updateSchedule(update: ScheduleUpdate): Promise<void> {
    await httpClient.put(`${this.basePath}/schedule`, update);
  }

  async getStatusDetail(pieceId: string): Promise<StatusDetail> {
    const response = await httpClient.get<StatusDetail>(
      `${this.basePath}/status/${pieceId}`
    );
    return response.data;
  }
}
```

---

## 🔄 Migration Strategy

### Phase 1: Mock API (Current - POC)

```
✅ All features use mock data
✅ Fast iteration, no backend dependency
```

### Phase 2: Hybrid (Gradual Migration)

```typescript
// apiFactory.ts - Can switch per API
export function getOperationTableAPI(): IOperationTableAPI {
  if (USE_MOCK_API) {
    return new MockOperationTableAPI();
  } else {
    return new RealOperationTableAPI(); // ✅ Real API ready
  }
}

export function getCitySearchAPI(): ICitySearchAPI {
  if (USE_MOCK_API) {
    return new MockCitySearchAPI(); // 🎭 Still mock
  } else {
    // Not ready yet
    throw new Error("City Search Real API not implemented");
  }
}
```

### Phase 3: Full Production

```
✅ All APIs switched to real implementations
✅ Mock APIs kept for testing
```

---

## 📋 Checklist for Adding New Search Page

- [ ] Create contract interface in `contracts/`
- [ ] Create mock implementation in `implementations/mock/`
- [ ] Add factory function in `apiFactory.ts`
- [ ] Create custom hooks in `lib/hooks/`
- [ ] Create page in `app/[page-name]/`
- [ ] Add route to navigation
- [ ] Test with mock data
- [ ] (Future) Create real implementation in `implementations/real/`

---

## 🎯 Key Benefits of This Architecture

1. **Type Safety**: Contract ensures Mock and Real APIs are identical
2. **Flexibility**: Easy to switch between Mock/Real per environment
3. **Testability**: Mock APIs perfect for unit tests
4. **Scalability**: Add new search pages without changing existing code
5. **Team Collaboration**: Frontend can work independently of backend
6. **Gradual Migration**: Switch APIs one at a time

---

## 🔧 Environment Variables

**.env.local (Development)**

```bash
NEXT_PUBLIC_USE_MOCK_API=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

**.env.production (Production)**

```bash
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=https://api.production.com
```

---

This architecture scales beautifully! You can add as many search pages as needed (city, province, date range, etc.) following the same pattern. Each new feature gets its own contract → mock → real → hooks → page.
