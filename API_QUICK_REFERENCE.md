# API Integration - Quick Reference

## 🎯 Golden Rules for POC

1. **Components NEVER import API implementations directly**
2. **Components ONLY use React Query hooks**
3. **Hooks use API factory to get implementation**
4. **Mock and Real APIs implement same contract**

---

## 📁 File Organization

```
src/lib/api/
├── contracts/
│   └── operationTable.contract.ts        # ⭐ Define interface + types HERE
├── implementations/
│   ├── mockApi.ts                        # ⭐ POC implementation
│   ├── mockData.ts                       # ⭐ Sample data
│   └── realApi.ts                        # Production (add later)
└── apiFactory.ts                         # ⭐ Switcher

src/features/operation-table/
├── hooks/
│   ├── useOperationTableData.ts          # ⭐ Components use THIS
│   ├── useBlockList.ts                   # ⭐ And THIS
│   └── useUpdateSchedule.ts              # ⭐ And THIS
└── components/
    └── SearchForm.tsx                    # ✅ Uses hooks only
```

---

## 🔧 Implementation Checklist

### **Phase 1: Contracts (Do First)**

```typescript
// src/lib/api/contracts/operationTable.contract.ts

export interface IOperationTableAPI {
  initialize(): Promise<InitializeResponse>;
  search(params: SearchParams): Promise<SearchResponse>;
  getBlocks(sectionCode: string): Promise<Block[]>;
  updateSchedule(update: ScheduleUpdate): Promise<void>;
}

export interface SearchParams {
  searchDate: Date;
  sectionCode?: string;
  blockCode?: string;
  // ... all search fields
}

export interface SearchResponse {
  header: OperationTableHeader;
  operations: Operation[];
}

// ... define ALL types
```

---

### **Phase 2: Mock Implementation**

```typescript
// src/lib/api/implementations/mockApi.ts

export class MockOperationTableAPI implements IOperationTableAPI {
  async search(params: SearchParams): Promise<SearchResponse> {
    await new Promise(r => setTimeout(r, 500)); // Simulate delay
    return { header: mockHeader, operations: mockOperations };
  }
  
  // Implement all interface methods
}

// src/lib/api/implementations/mockData.ts
export const mockOperations = [
  { id: 'op-001', registNumber: '1123022224', /* ... */ },
  // 20-30 vehicles
];
```

---

### **Phase 3: API Factory**

```typescript
// src/lib/api/apiFactory.ts

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

export function getOperationTableAPI(): IOperationTableAPI {
  return USE_MOCK ? new MockOperationTableAPI() : new RealOperationTableAPI();
}
```

```env
# .env.local
NEXT_PUBLIC_USE_MOCK_API=true
```

---

### **Phase 4: React Query Hooks**

```typescript
// src/features/operation-table/hooks/useOperationTableData.ts

import { useQuery } from '@tanstack/react-query';
import { getOperationTableAPI } from '@/lib/api/apiFactory';

export function useOperationTableData(params: SearchParams) {
  const api = getOperationTableAPI();
  
  return useQuery({
    queryKey: ['operationTable', params],
    queryFn: () => api.search(params),
  });
}
```

---

### **Phase 5: Components Use Hooks**

```typescript
// src/features/operation-table/components/SearchForm.tsx

import { useOperationTableData, useBlockList } from '../hooks';

export function SearchForm() {
  const [searchParams, setSearchParams] = useState({...});
  
  // ✅ Use hook (not API directly)
  const { data, isLoading } = useOperationTableData(searchParams);
  const { data: blocks } = useBlockList(searchParams.sectionCode);
  
  // Component logic...
}

// ❌ NEVER do this:
// import { MockOperationTableAPI } from '@/lib/api/implementations/mockApi';
// const api = new MockOperationTableAPI(); // WRONG!
```

---

## 🔄 Switching to Real API (Future)

**Step 1:** Create real implementation
```typescript
// src/lib/api/implementations/realApi.ts

export class RealOperationTableAPI implements IOperationTableAPI {
  async search(params: SearchParams): Promise<SearchResponse> {
    const response = await fetch('/api/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return this.transformResponse(await response.json());
  }
  
  private transformResponse(apiData: any): SearchResponse {
    // Transform their API format to our contract
    return { /* ... */ };
  }
}
```

**Step 2:** Change environment variable
```env
NEXT_PUBLIC_USE_MOCK_API=false
```

**Step 3:** Done! ✅ Zero component changes needed

---

## 🎨 Component Development Pattern

### **❌ WRONG - Direct API Call**
```typescript
function SearchForm() {
  const handleSearch = async () => {
    const api = new MockOperationTableAPI(); // ❌ Don't do this!
    const data = await api.search(params);
    setResults(data);
  };
}
```

### **✅ RIGHT - Use Hook**
```typescript
function SearchForm() {
  const [params, setParams] = useState({...});
  
  // ✅ Hook handles everything
  const { data, isLoading, error } = useOperationTableData(params);
  
  // UI updates automatically when params change
}
```

---

## 🧪 Testing Benefits

### **With Abstraction:**
```typescript
// test/SearchForm.test.tsx

test('renders search results', async () => {
  // Easy to mock at hook level
  vi.mock('../hooks/useOperationTableData', () => ({
    useOperationTableData: () => ({
      data: mockData,
      isLoading: false,
    }),
  }));
  
  render(<SearchForm />);
  // Test component behavior
});
```

### **Without Abstraction:**
```typescript
// Would need to mock fetch, axios, or entire API class
// Much harder to test!
```

---

## 📝 For Backend Team: API Contract Document

When ready to build real API, give backend team this:

```typescript
/**
 * API Contract for Operation Table Feature
 * 
 * All endpoints must return data matching these TypeScript interfaces.
 * Frontend will transform your response format to match these types.
 */

// POST /api/operation-table/search
interface SearchRequest {
  searchDate: string;        // ISO 8601 format
  sectionCode?: string;
  blockCode?: string;
  // ... all fields with types and constraints
}

interface SearchResponse {
  header: {
    dateList: string[];      // Format: "MM/DD(曜)"
    timeList: string[];      // Format: "0", "6", "12", "18"
    graphMeshCount: number;
    // ... etc
  };
  operations: Array<{
    id: string;
    registNumber: string;
    // ... etc
  }>;
}

// GET /api/blocks?section={code}
interface BlocksResponse {
  blocks: Array<{
    code: string;
    name: string;
  }>;
}

// ... document all endpoints
```

**Note:** Backend doesn't have to match these formats exactly - we'll create an adapter to transform their responses.

---

## 🎯 Summary

**For POC:**
1. Define contracts (interfaces)
2. Create mock implementation
3. Create hooks that use API factory
4. Components use hooks only
5. Everything works with mock data

**For Production:**
1. Backend team builds API (can be any format)
2. Create real implementation that transforms to contract
3. Change environment variable
4. Components work without changes

**Key Benefit:** Frontend and backend can work **completely independently** 🎉
