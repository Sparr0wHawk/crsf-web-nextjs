# 🎬 Real-World Example: How Hooks Work in Operation Table Page

## The Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User Opens: http://localhost:3000/operation-table              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  page.tsx Component Renders                                      │
│                                                                  │
│  const { data: initData } = useOperationTableInit();            │
│                             ↓                                    │
│  Hook calls: api.initialize()                                   │
│                             ↓                                    │
│  API Factory → Mock/Real API                                    │
│                             ↓                                    │
│  Returns: { sections, vehicleDivisions, sortOptions }          │
│                             ↓                                    │
│  React Query caches this data                                   │
│                             ↓                                    │
│  Component re-renders with data                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Dropdowns Populated with Data                                   │
│                                                                  │
│  <Select>                                                        │
│    {initData.sections.map(s => <MenuItem>{s.name}</MenuItem>)}  │
│  </Select>                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Selects Section: "第一部"                                  │
│                                                                  │
│  setSelectedSection('1');                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Cascading Hook Triggers                                         │
│                                                                  │
│  const { data: blocks } = useBlockList(selectedSection);        │
│                           ↑                                      │
│                    Now '1' instead of ''                        │
│                           ↓                                      │
│  enabled: !!selectedSection → Now TRUE!                         │
│                           ↓                                      │
│  Hook calls: api.getBlocks('1')                                 │
│                           ↓                                      │
│  Returns: [ { code: '11', name: '札幌第一' }, ... ]            │
│                           ↓                                      │
│  Block dropdown populates                                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Fills Form and Clicks "検索" Button                       │
│                                                                  │
│  Form values: {                                                  │
│    sectionCode: '1',                                            │
│    blockCode: '11',                                             │
│    searchDate: new Date(),                                      │
│  }                                                               │
│                           ↓                                      │
│  setApiSearchParams(formValues);                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Search Hook Triggers                                            │
│                                                                  │
│  const { data: tableData } = useOperationTableData(             │
│    apiSearchParams                                              │
│  );                                                              │
│                           ↓                                      │
│  queryKey: ['operationTable', 'data', { section: '1', ... }]   │
│                           ↓                                      │
│  React Query checks cache with this key                         │
│                           ↓                                      │
│  ┌──────────────┬─────────────┐                                │
│  │ Cache Hit?   │ Cache Miss? │                                 │
│  └──────────────┴─────────────┘                                 │
│        ↓               ↓                                         │
│   Return cached    Call API                                     │
│        ↓               ↓                                         │
│                  api.search(params)                             │
│                        ↓                                         │
│                  Returns: { header, operations }                │
│                        ↓                                         │
│                  Store in cache                                 │
│                        ↓                                         │
│  Component receives data                                         │
│                        ↓                                         │
│  isLoading: false                                               │
│  data: { header, operations }                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Table Displays Results                                          │
│                                                                  │
│  {tableData.operations.map(op => (                              │
│    <TableRow>                                                    │
│      <TableCell>{op.registNumber}</TableCell>                   │
│      <TableCell>{op.carName}</TableCell>                        │
│      {/* Schedule bars */}                                      │
│      {op.pieceInformationList.map(piece => (                    │
│        <ScheduleBar piece={piece} />                            │
│      ))}                                                         │
│    </TableRow>                                                   │
│  ))}                                                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  User Drags Schedule Bar (Drag & Drop)                          │
│                                                                  │
│  onDragEnd handler:                                             │
│    - Calculate new startTime/endTime                            │
│    - Call: updateScheduleMutation.mutate({                      │
│        pieceId: 'piece-1',                                      │
│        newStartTime: new Date(),                                │
│        newEndTime: new Date(),                                  │
│      })                                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  Mutation Hook Executes                                          │
│                                                                  │
│  const updateScheduleMutation = useUpdateSchedule(params);      │
│                                                                  │
│  useMutation({                                                   │
│    mutationFn: (update) => api.updateSchedule(update),         │
│                           ↓                                      │
│    Optimistic Update: UI changes immediately                    │
│                           ↓                                      │
│    API call to backend                                          │
│                           ↓                                      │
│    onSuccess: () => {                                           │
│      queryClient.invalidateQueries(['operationTable', 'data'])  │
│    }                                                             │
│  })                                                              │
│                           ↓                                      │
│  Cache invalidated → useOperationTableData hook refetches       │
│                           ↓                                      │
│  Table updates with confirmed data from server                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Moments Where Hooks Work

### Moment 1: Page Load

```typescript
// Component mounts
const { data: initData, isLoading } = useOperationTableInit();

// State progression:
// 1. isLoading: true,  data: undefined
// 2. API call happens (500ms mock delay)
// 3. isLoading: false, data: { sections, vehicleDivisions, ... }
// 4. Component re-renders → Dropdowns populate
```

---

### Moment 2: User Selects Dropdown

```typescript
// State before:
selectedSection = ''
blocks = []  // Empty because hook is disabled

// User clicks: "第一部"
setSelectedSection('1')

// Triggers re-render:
const { data: blocks } = useBlockList('1');  // Now enabled!

// State after:
selectedSection = '1'
blocks = [{ code: '11', name: '札幌第一' }, ...]
```

---

### Moment 3: Search Button Click

```typescript
// Before click:
apiSearchParams = null
tableData = undefined

// User fills form and clicks "検索":
const formData = {
  sectionCode: '1',
  blockCode: '11',
  searchDate: new Date(),
};
setApiSearchParams(formData);

// Triggers re-render:
const { data: tableData } = useOperationTableData(apiSearchParams);
// Now apiSearchParams is not null → query runs!

// After API call:
tableData = {
  header: { dateList, timeList, ... },
  operations: [{ registNumber: '札11-1234', ... }]
}
```

---

### Moment 4: Drag & Drop Update

```typescript
// User drags schedule bar:
const handleDragEnd = (result) => {
  const update = {
    pieceId: "piece-1",
    operationId: "op-001",
    newStartTime: new Date("2024-01-01 10:00"),
    newEndTime: new Date("2024-01-01 18:00"),
  };

  // Call mutation:
  updateScheduleMutation.mutate(update);
};

// Hook handles:
// 1. Optimistic update (UI changes immediately)
// 2. API call to save changes
// 3. If success: invalidate cache
// 4. Other hooks refetch automatically
// 5. If error: rollback UI changes
```

---

## 🔄 Cache Lifecycle Example

```
Time: 0:00 - User opens page
    ↓
useOperationTableInit() called
    ↓
React Query checks cache:
  - Key: ['operationTable', 'init']
  - Found: NO
    ↓
Fetch from API
    ↓
Store in cache with timestamp: 0:00
    ↓
Return data to component

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time: 0:03 - User navigates away and back
    ↓
useOperationTableInit() called again
    ↓
React Query checks cache:
  - Key: ['operationTable', 'init']
  - Found: YES
  - Age: 3 minutes
  - staleTime: 10 minutes
  - Status: FRESH ✅
    ↓
Return cached data (no API call!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time: 0:11 - User returns to tab after 11 minutes
    ↓
useOperationTableInit() called
    ↓
React Query checks cache:
  - Key: ['operationTable', 'init']
  - Found: YES
  - Age: 11 minutes
  - staleTime: 10 minutes
  - Status: STALE ⚠️
    ↓
Return cached data first (instant UI)
    ↓
Fetch fresh data in background
    ↓
Update cache
    ↓
Component re-renders with fresh data

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time: 0:12 - User performs mutation (update schedule)
    ↓
updateScheduleMutation.mutate(...)
    ↓
API call succeeds
    ↓
onSuccess: invalidate cache
  - queryClient.invalidateQueries(['operationTable', 'data'])
    ↓
All hooks using that key refetch automatically
    ↓
UI updates with fresh data
```

---

## 🎓 What Makes Hooks "Magic"

### Without Hooks (Old Way):

```typescript
class OperationTablePage extends React.Component {
  state = {
    initData: null,
    isLoading: false,
    error: null,
  };

  componentDidMount() {
    this.fetchInitData();
  }

  async fetchInitData() {
    this.setState({ isLoading: true });
    try {
      const api = getOperationTableAPI();
      const data = await api.initialize();
      this.setState({ initData: data, isLoading: false });
    } catch (error) {
      this.setState({ error, isLoading: false });
    }
  }

  render() {
    const { initData, isLoading, error } = this.state;
    // ... rest of component
  }
}
```

### With Hooks (Modern Way):

```typescript
export default function OperationTablePage() {
  const { data: initData, isLoading, error } = useOperationTableInit();

  // That's it! 90% less code.
  // Plus: automatic caching, refetching, error retry, etc.
}
```

---

## 📊 Side-by-Side Comparison

| Feature            | Manual (No Hooks)               | With Hooks                 |
| ------------------ | ------------------------------- | -------------------------- |
| Loading State      | Manually track with `useState`  | Automatic `isLoading`      |
| Error Handling     | Manually track with `try/catch` | Automatic `error`          |
| Caching            | Implement yourself              | Automatic                  |
| Refetch on Focus   | Implement yourself              | Built-in                   |
| Retry on Error     | Implement yourself              | Built-in                   |
| Optimistic Updates | Complex to implement            | Simple `onMutate`          |
| Cache Invalidation | Implement yourself              | Simple `invalidateQueries` |
| **Lines of Code**  | **~100 lines**                  | **~10 lines**              |

---

## 💡 Think of Hooks Like This:

### Hooks are like **Smart Assistants**:

```
You (Component): "I need section data"
    ↓
Hook: "Let me check if I already have that..."
    ↓
Hook: "Yes! Here it is from cache. That was fast!"
    ↓
You: "Thanks!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You (Component): "I need operation table data for section '1'"
    ↓
Hook: "Let me check my cache..."
    ↓
Hook: "I don't have that yet. Let me fetch it for you..."
    ↓
Hook: [Calls API]
    ↓
Hook: "Got it! Here's your data. I'll remember this for 5 minutes."
    ↓
You: "Great!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You (Component): "User wants to update a schedule"
    ↓
Hook: "Okay, I'll update the UI right away so it feels fast..."
    ↓
Hook: [Sends request to API]
    ↓
Hook: "API confirmed the change. I'll refresh all related data now."
    ↓
Hook: [Invalidates cache, triggers refetch]
    ↓
You: "Perfect!"
```

---

**That's how hooks work in our project!** 🎉

They're your smart assistants that handle all the complexity of API calls, caching, and state management so you can focus on building UI.
