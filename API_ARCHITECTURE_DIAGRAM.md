# API Architecture Diagram

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         UI LAYER (React Components)                    │   │
│  │  - SearchForm.tsx                                      │   │
│  │  - OperationTableGraph.tsx                             │   │
│  │  - DraggableStatusBar.tsx                              │   │
│  │                                                        │   │
│  │  ✅ Only uses hooks                                    │   │
│  │  ❌ Never imports API directly                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │      DATA ACCESS LAYER (React Query Hooks)            │   │
│  │  - useOperationTableData(params)                       │   │
│  │  - useBlockList(sectionCode)                           │   │
│  │  - useUpdateSchedule()                                 │   │
│  │                                                        │   │
│  │  ✅ Manages caching, loading, errors                   │   │
│  │  ✅ Calls API via factory                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                              ↓                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         API ABSTRACTION LAYER                          │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │  IOperationTableAPI (Interface/Contract)     │     │   │
│  │  │  - initialize()                              │     │   │
│  │  │  - search(params)                            │     │   │
│  │  │  - getBlocks(section)                        │     │   │
│  │  │  - updateSchedule(update)                    │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                              ↓                         │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │         API Factory                          │     │   │
│  │  │  if (USE_MOCK) return MockAPI;               │     │   │
│  │  │  else return RealAPI;                        │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │                              ↓                         │   │
│  │         ┌────────────────────┴────────────────┐       │   │
│  │         ↓                                      ↓       │   │
│  │  ┌─────────────────┐                  ┌──────────────┐│   │
│  │  │  MockAPI        │                  │   RealAPI    ││   │
│  │  │  (POC Phase)    │                  │ (Production) ││   │
│  │  │                 │                  │              ││   │
│  │  │ Returns:        │                  │ Calls:       ││   │
│  │  │ - mockData.ts   │                  │ - Customer   ││   │
│  │  │ - Simulates     │                  │   API        ││   │
│  │  │   delays        │                  │ - Transforms ││   │
│  │  │                 │                  │   response   ││   │
│  │  └─────────────────┘                  └──────────────┘│   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (Production only)
┌─────────────────────────────────────────────────────────────────┐
│                  CUSTOMER BACKEND API                           │
│  - Existing service from customer                               │
│  - May have different data format                               │
│  - RealAPI adapts it to our contract                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: Component → API

### **Scenario 1: User Changes Section Dropdown**

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. User selects "第一部" from dropdown                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. SearchForm.tsx                                                │
│    setSectionCode('1')                                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. useEffect triggers                                            │
│    setBlockCode('') // Reset dependent field                    │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. useBlockList('1') hook activates                             │
│    React Query detects new queryKey: ['blocks', '1']            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. Hook calls: api.getBlocks('1')                               │
│    const api = getOperationTableAPI(); // From factory           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. API Factory checks environment                               │
│    USE_MOCK_API === true → returns MockOperationTableAPI        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 7. MockOperationTableAPI.getBlocks('1')                         │
│    - Simulates 500ms delay                                       │
│    - Filters mockBlocks.filter(b => b.sectionCode === '1')      │
│    - Returns: [{ code: '11', name: '札幌第一' }, ...]           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 8. React Query receives response                                │
│    - Caches data with key ['blocks', '1']                       │
│    - Sets isLoading = false                                      │
│    - Triggers re-render                                          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 9. SearchForm.tsx re-renders                                    │
│    Block dropdown now shows: 札幌第一, 札幌第二, ...            │
└──────────────────────────────────────────────────────────────────┘
```

**Total time:** 500ms (mock delay) + React render time
**User sees:** Loading spinner → Block list updates

---

## 🎯 Switching to Production API

### **Before: POC with Mock**

```
Component
   ↓
useBlockList('1')
   ↓
getOperationTableAPI()
   ↓
if (USE_MOCK_API) ← TRUE
   ↓
MockOperationTableAPI
   ↓
return mockBlocks.filter(...)
```

### **After: Production with Real API**

```
Component (NO CHANGES!)
   ↓
useBlockList('1') (NO CHANGES!)
   ↓
getOperationTableAPI() (NO CHANGES!)
   ↓
if (USE_MOCK_API) ← FALSE
   ↓
RealOperationTableAPI (NEW!)
   ↓
fetch('https://customer-api.com/blocks?section=1')
   ↓
Transform response to match contract
   ↓
return blocks
```

**What changed:**

- ✅ Added RealOperationTableAPI class
- ✅ Changed environment variable
- ❌ Zero component changes
- ❌ Zero hook changes

---

## 🧩 Contract Compliance

### **The Contract (Interface)**

```typescript
interface IOperationTableAPI {
  getBlocks(sectionCode: string): Promise<Block[]>;
}

interface Block {
  code: string;
  name: string;
}
```

### **Mock Implementation**

```typescript
class MockOperationTableAPI implements IOperationTableAPI {
  async getBlocks(sectionCode: string): Promise<Block[]> {
    return mockBlocks.filter((b) => b.sectionCode === sectionCode);
  }
}
```

✅ **Complies with contract** - returns `Promise<Block[]>`

### **Real Implementation**

```typescript
class RealOperationTableAPI implements IOperationTableAPI {
  async getBlocks(sectionCode: string): Promise<Block[]> {
    const response = await fetch(`/api/blocks?section=${sectionCode}`);
    const data = await response.json();

    // Customer API returns different format
    // { result: [{ id: '11', label: '札幌第一' }] }

    // Transform to match contract
    return data.result.map((item) => ({
      code: item.id,
      name: item.label,
    }));
  }
}
```

✅ **Complies with contract** - returns `Promise<Block[]>`
✅ **Transforms customer format** - adapts to our interface

**TypeScript compiler ensures both implementations match the contract!**

---

## 📦 File Dependencies Graph

```
SearchForm.tsx
  ↓ imports
useBlockList.ts
  ↓ imports
getOperationTableAPI() from apiFactory.ts
  ↓ returns
MockOperationTableAPI | RealOperationTableAPI
  ↓ implements
IOperationTableAPI (contract)
  ↓ uses types from
operationTable.contract.ts
```

**Dependency Direction:** UI → Hooks → Factory → Implementation → Contract

**Change a file:**

- Change SearchForm.tsx → Only affects UI
- Change useBlockList.ts → Affects all components using it
- Change apiFactory.ts → Switches which API to use
- Change MockAPI → Only affects POC
- Change RealAPI → Only affects production
- Change Contract → **Everything must update** (breaking change!)

---

## 🎨 Developer Workflow

### **Frontend Developer (POC Phase)**

```
1. Define what data I need
   ↓
2. Add method to IOperationTableAPI contract
   ↓
3. Implement in MockOperationTableAPI
   ↓
4. Create mock data
   ↓
5. Create React Query hook
   ↓
6. Use hook in component
   ↓
7. Test with mock data
   ↓
8. POC done! ✅
```

**Backend team:** Not needed yet!

### **Backend Developer (Production Phase)**

```
1. Receive IOperationTableAPI contract
   ↓
2. Review what endpoints are needed
   ↓
3. Build or adapt customer API
   ↓
4. Frontend creates RealOperationTableAPI
   ↓
5. Transform API responses to contract
   ↓
6. Integration testing
   ↓
7. Deploy! ✅
```

**Frontend components:** No changes needed!

---

## 💡 Key Insights

### **Why This Architecture?**

1. **Separation of Concerns**

   - UI only cares about displaying data
   - Hooks only care about fetching data
   - API implementations only care about data source

2. **Testability**

   - Test components by mocking hooks
   - Test hooks by mocking API
   - Test API implementations independently

3. **Flexibility**

   - Switch data source with one line
   - Run POC without backend
   - Gradually migrate to new API

4. **Type Safety**

   - Contract enforces data shape
   - TypeScript catches mismatches
   - Refactoring is safe

5. **Parallel Development**
   - Frontend team builds with mocks
   - Backend team builds API
   - Integration is smooth

---

## 🚀 Result

**POC Development:**

- Fast iteration (no waiting for backend)
- Realistic demo (mock API simulates real behavior)
- Full feature testing (all interactions work)

**Production Deployment:**

- Easy backend integration (just implement contract)
- Zero component changes (swap at factory level)
- Safe migration (can test both APIs side-by-side)

**This is the power of abstraction!** 🎯
