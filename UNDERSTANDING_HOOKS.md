# 🪝 Understanding Hooks in Our Project

## What are Hooks?

**Hooks** are special functions in React that let you "hook into" React features like state, lifecycle, and side effects **without writing a class component**.

Think of hooks as **reusable pieces of logic** that you can use in your components.

---

## 🎯 Two Types of Hooks in Our Project

### 1. **React Built-in Hooks** (from React library)

- `useState` - Store component state
- `useEffect` - Run side effects (API calls, timers, etc.)
- `useRef` - Reference DOM elements
- `useCallback`, `useMemo` - Optimize performance

### 2. **Custom Hooks** (we write them ourselves)

- `useOperationTableInit` - Fetch initial dropdown data
- `useOperationTableData` - Fetch operation table results
- `useVehicleReservation` - Manage reservation API calls
- Pattern: Always start with `use` prefix

---

## 📚 React Query Hooks in Our Project

We use **TanStack React Query** which provides two powerful hooks:

### **`useQuery`** - For Reading Data (GET requests)

### **`useMutation`** - For Writing Data (POST/PUT/DELETE requests)

---

## 🔍 How Hooks Work: Real Example

### Example 1: `useOperationTableInit()` Hook

**File:** `src/features/operation-table/hooks/useOperationTableInit.ts`

```typescript
import { useQuery } from "@tanstack/react-query";
import { getOperationTableAPI } from "@/lib/api/apiFactory";

export function useOperationTableInit() {
  return useQuery({
    queryKey: ["operationTable", "init"], // 🔑 Unique cache key
    queryFn: async () => {
      // 📡 Function that fetches data
      const api = getOperationTableAPI();
      return api.initialize(); // Call API
    },
    staleTime: 1000 * 60 * 10, // ⏱️ Data stays fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // 🗑️ Cache for 30 minutes
  });
}
```

### How to Use It in a Component:

```typescript
"use client";

export default function OperationTablePage() {
  // ✨ Just call the hook!
  const { data, isLoading, error } = useOperationTableInit();

  // 🎯 React Query automatically handles:
  // - Loading state (isLoading = true/false)
  // - Error handling (error = Error object or null)
  // - Caching (won't re-fetch if data is fresh)
  // - Background refetching

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.sections.map((section) => (
        <div key={section.code}>{section.name}</div>
      ))}
    </div>
  );
}
```

---

## 🎨 Visual Flow: How Hooks Work

```
Component renders
    ↓
Calls: useOperationTableInit()
    ↓
React Query checks cache
    ↓
┌─────────────┬──────────────┐
│ Cache Hit?  │  Cache Miss? │
│ (Fresh)     │  (Stale)     │
└─────────────┴──────────────┘
      ↓                ↓
Return cached    Call queryFn
      ↓                ↓
                  API Factory
                       ↓
                  Mock/Real API
                       ↓
                  Get Data
                       ↓
                  Store in cache
                       ↓
Component receives data
    ↓
Component re-renders with data
```

---

## 🔑 Key Concepts in Our Hooks

### 1. **Query Key** - Unique Cache Identifier

```typescript
queryKey: ["operationTable", "init"];
// Like a file path for caching
// ['feature', 'operation', params]

queryKey: ["reservations", "search", { startDate: "2024-01-01" }];
// Different params = different cache entry
```

### 2. **Query Function** - The API Call

```typescript
queryFn: async () => {
  const api = getOperationTableAPI(); // Get API instance
  return api.initialize(); // Call the API method
};
```

### 3. **Automatic Features**

```typescript
{
  isLoading,      // true while fetching first time
  isFetching,     // true while fetching (including background)
  error,          // Error object if request failed
  data,           // The actual data from API
  refetch,        // Function to manually refetch
  isError,        // true if error occurred
  isSuccess,      // true if data loaded successfully
}
```

---

## 📝 Real Examples from Our Project

### Example 1: Fetching Initial Data (READ)

**Hook:** `useOperationTableInit()`

```typescript
// In the component:
const { data: initData, isLoading, error } = useOperationTableInit();

// What it does:
// 1. Calls api.initialize() to get sections, blocks, vehicle divisions
// 2. Caches the result for 10 minutes
// 3. Returns loading/error/data states
// 4. Component automatically re-renders when data arrives
```

**When to use:** Page loads, need to populate dropdowns

---

### Example 2: Searching with Parameters (READ with params)

**Hook:** `useOperationTableData(params)`

```typescript
// In the component:
const [searchParams, setSearchParams] = useState<SearchParams>({
  sectionCode: "1",
  searchDate: new Date(),
});

const { data: tableData, isLoading } = useOperationTableData(searchParams);

// What it does:
// 1. Calls api.search(params) with current searchParams
// 2. When searchParams change, automatically re-fetches
// 3. Each unique params gets its own cache entry
// 4. Smart: Won't refetch if params haven't changed
```

**When to use:** User submits search form, filters change

---

### Example 3: Cascading Dropdowns (Conditional fetch)

**Hook:** `useBlockList(sectionCode)`

```typescript
// In the component:
const [selectedSection, setSelectedSection] = useState("");

const { data: blocks } = useBlockList(selectedSection);
// ⚠️ enabled: !!selectedSection - only fetch if section selected

// What it does:
// 1. Wait for user to select a section
// 2. When selectedSection changes, fetch blocks for that section
// 3. Won't run if selectedSection is empty
```

**When to use:** Second dropdown depends on first dropdown value

---

### Example 4: Updating Data (WRITE)

**Hook:** `useCancelReservation()` (Mutation)

```typescript
// In the component:
const cancelMutation = useCancelReservation();

const handleCancel = async (reservationId: string) => {
  try {
    await cancelMutation.mutateAsync({
      reservationId,
      reason: "User cancelled",
    });
    toast.success("Cancelled!");
  } catch (error) {
    toast.error("Failed!");
  }
};

// What it does:
// 1. Calls api.cancelReservation(id, reason)
// 2. On success, automatically invalidates cache
// 3. Other components refetch and get updated data
// 4. UI stays in sync!
```

**When to use:** User clicks button to modify data (cancel, update, delete)

---

## 🎯 Hook Naming Conventions in Our Project

### Location-based Organization:

```
src/lib/hooks/                          # ✅ Global/shared hooks
  └─ useVehicleReservation.ts           # Multiple hooks for reservation feature

src/features/operation-table/hooks/     # ✅ Feature-specific hooks
  ├─ useOperationTableInit.ts           # One hook per file
  ├─ useOperationTableData.ts
  ├─ useUpdateSchedule.ts
  ├─ useBlockList.ts
  └─ useVehicleDivisions.ts
```

### Naming Pattern:

- `use[Feature][Action]` - e.g., `useOperationTableInit`, `useReservationSearch`
- Always start with `use` (React requirement)
- Verb describes what it does: `Init`, `Data`, `Update`, `Cancel`

---

## ⚙️ React Query Configuration in Our Project

**File:** `src/lib/providers/Providers.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      refetchOnWindowFocus: true, // Refetch when tab becomes active
      retry: 1, // Retry failed requests once
    },
  },
});
```

### What This Means:

- **staleTime: 5 minutes** - Data is considered fresh for 5 minutes

  - If you call the same hook twice within 5 minutes, uses cache
  - After 5 minutes, marks as "stale" and refetches in background

- **refetchOnWindowFocus: true** - When user returns to tab, refetch data

  - Ensures user always sees latest data
  - Great for long-running sessions

- **retry: 1** - If API call fails, try one more time
  - Handles temporary network issues

---

## 🔄 Cache Invalidation (Keeping Data Fresh)

### Problem: User updates data, but cache is old

**Solution:** Invalidate cache after mutations

```typescript
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, reason }) =>
      api.cancelReservation(reservationId, reason),

    onSuccess: (_, variables) => {
      // 🗑️ Clear old cache, force refetch
      queryClient.invalidateQueries({
        queryKey: ["reservations", "detail", variables.reservationId],
      });

      // 🗑️ Also clear search results
      queryClient.invalidateQueries({
        queryKey: ["reservations", "search"],
      });
    },
  });
}
```

### Flow:

```
User clicks "Cancel"
    ↓
useCancelReservation() mutation runs
    ↓
API call succeeds
    ↓
onSuccess callback runs
    ↓
Invalidate cache for:
  - That specific reservation detail
  - All search results
    ↓
Components using those hooks automatically refetch
    ↓
UI updates with fresh data!
```

---

## 💡 Benefits of Using Hooks

### ✅ **No Boilerplate Code**

**Without Hooks (manual approach):**

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setLoading(true);
  fetch("/api/data")
    .then((res) => res.json())
    .then((data) => {
      setData(data);
      setLoading(false);
    })
    .catch((err) => {
      setError(err);
      setLoading(false);
    });
}, []);
```

**With Hooks:**

```typescript
const { data, isLoading, error } = useOperationTableInit();
```

**90% less code!** ✨

---

### ✅ **Automatic Caching**

```typescript
// Component A
const { data } = useShops(); // Fetches from API

// Component B (rendered later)
const { data } = useShops(); // Uses cache, no API call!
```

---

### ✅ **Smart Re-fetching**

```typescript
const [params, setParams] = useState({ date: "2024-01-01" });
const { data } = useOperationTableData(params);

// User changes date:
setParams({ date: "2024-01-02" });
// Hook automatically detects params changed → refetches!
```

---

### ✅ **Optimistic Updates**

```typescript
const updateMutation = useUpdateSchedule();

// User drags a schedule bar
updateMutation.mutate(newSchedule);
// UI updates immediately (optimistic)
// If API fails, automatically rolls back!
```

---

## 🎓 Hook Rules (React Requirements)

### ✅ **DO:**

- Call hooks at the top level of your component
- Call hooks in the same order every time
- Only call hooks from React components or custom hooks
- Start custom hook names with `use`

### ❌ **DON'T:**

- Call hooks inside loops, conditions, or nested functions
- Call hooks from regular JavaScript functions

**Example:**

```typescript
// ✅ GOOD
function MyComponent() {
  const { data } = useShops();
  const [count, setCount] = useState(0);

  if (data) {
    return <div>{data.length}</div>;
  }
}

// ❌ BAD
function MyComponent() {
  if (someCondition) {
    const { data } = useShops(); // ❌ Conditional hook call
  }
}
```

---

## 📊 Hook Comparison Table

| Hook Type     | Purpose       | Returns                        | Use Case                                |
| ------------- | ------------- | ------------------------------ | --------------------------------------- |
| `useQuery`    | Read data     | `{ data, isLoading, error }`   | GET requests, fetching data             |
| `useMutation` | Write data    | `{ mutate, isPending, error }` | POST/PUT/DELETE, modify data            |
| `useState`    | Store state   | `[value, setValue]`            | Form inputs, toggles, counters          |
| `useEffect`   | Side effects  | `void`                         | Manual API calls, timers, subscriptions |
| `useRef`      | DOM reference | `{ current: value }`           | Access DOM element, print functionality |

---

## 🔧 Debugging Hooks

### 1. **React Query DevTools** (enabled in development)

```typescript
// In Providers.tsx
<ReactQueryDevtools initialIsOpen={false} />
```

**What it shows:**

- All active queries and their cache keys
- Query status (loading, success, error)
- Cache data (inspect what's cached)
- Refetch buttons to test manually

**How to use:**

1. Run `npm run dev`
2. Look for floating React Query icon in bottom-right
3. Click to open DevTools panel
4. See all your API calls in real-time!

---

### 2. **Console Logging**

```typescript
const { data, isLoading, error } = useOperationTableInit();

console.log("Init Data:", { data, isLoading, error });
// See what the hook returns
```

---

### 3. **Network Tab** (Browser DevTools)

- Open browser DevTools (F12)
- Go to Network tab
- Filter by "Fetch/XHR"
- See actual API calls happening

---

## 🎯 Common Patterns in Our Project

### Pattern 1: Dependent Queries (Cascading)

```typescript
// First query
const { data: sections } = useOperationTableInit();

// Second query depends on first
const [selectedSection, setSelectedSection] = useState("");
const { data: blocks } = useBlockList(selectedSection);
// Won't run until selectedSection has a value
```

---

### Pattern 2: Refetch on Demand

```typescript
const { data, refetch } = useOperationTableData(params);

// User clicks "Refresh" button
<Button onClick={() => refetch()}>Refresh</Button>;
```

---

### Pattern 3: Optimistic Updates

```typescript
const updateMutation = useUpdateSchedule(params);

// Update UI immediately, then sync with server
updateMutation.mutate(newSchedule, {
  onSuccess: () => console.log("Saved!"),
  onError: () => console.log("Failed, rolled back"),
});
```

---

## 📚 Summary

### Hooks in Our Project:

1. **React Query Hooks** - Handle API calls automatically

   - `useQuery` for reading
   - `useMutation` for writing

2. **Custom Hooks** - Wrap API calls with React Query

   - `useOperationTableInit()` - Fetch initial data
   - `useOperationTableData(params)` - Search operation table
   - `useVehicleReservation()` - Manage reservations

3. **Benefits:**

   - ✅ No loading/error state management needed
   - ✅ Automatic caching
   - ✅ Smart refetching
   - ✅ Less code to write
   - ✅ Better user experience

4. **Key Concept:**
   - Hooks are **reusable functions** that connect your UI components to data
   - They handle the complexity of state, caching, and API calls
   - You just call them and use the data!

---

**Think of hooks as your personal assistants:**

- You ask for data → Hook fetches it
- You ask to update → Hook updates it
- You want loading state → Hook tracks it
- You want error handling → Hook handles it

**All automatically!** 🚀
