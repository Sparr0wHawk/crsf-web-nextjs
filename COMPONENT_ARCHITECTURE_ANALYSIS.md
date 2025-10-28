# Component Architecture Analysis & Improvement Opportunities

**Date**: October 28, 2025  
**Status**: Current State Review

---

## 📊 Current Component Structure

### Overview

```
src/
├── components/              # ⚠️ Only 2 shared components
│   ├── ErrorBoundary.tsx   (100 lines) - Error boundary wrapper
│   └── ShopSelectionModal.tsx (364 lines) - Shop selection dialog
│
├── features/
│   └── operation-table/
│       ├── components/
│       │   └── OperationTableDisplay.tsx (598 lines) ⚠️ LARGE
│       └── hooks/           # ✅ Well organized
│           ├── useBlockList.ts
│           ├── useOperationTableData.ts
│           ├── useOperationTableInit.ts
│           ├── useUpdateSchedule.ts
│           └── useVehicleDivisions.ts
│
└── app/
    ├── operation-table/
    │   └── page.tsx (636 lines) ⚠️ VERY LARGE - Needs componentization
    ├── menu/page.tsx
    └── reservation-search/page.tsx
```

---

## 🔍 Analysis: Current State

### ✅ What's Working Well

1. **Feature-based organization**

   - `features/operation-table/` follows best practices
   - Hooks are properly extracted and reusable

2. **Clear separation of concerns**

   - Hooks handle data fetching (React Query)
   - Components handle UI rendering
   - API layer is abstracted (contracts → factory → implementations)

3. **TypeScript integration**

   - Strong typing throughout
   - Contract-based API interfaces

4. **Modern patterns**
   - React Query for server state
   - React Hook Form for form handling
   - Zod for validation

---

## ⚠️ Problem Areas (Componentization Issues)

### 1. **`operation-table/page.tsx` (636 lines)** ❌ CRITICAL

**Current State**: Monolithic page component with everything mixed together

**Contains**:

- Search form (3 rows, ~350 lines of JSX)
- Form state management (React Hook Form)
- Date calculations
- Shop selection logic
- Print functionality
- Results display coordination
- Error handling

**Problems**:

```tsx
export default function OperationTablePage() {
  // 40+ lines of state declarations
  const [apiSearchParams, setApiSearchParams] = useState<SearchParams | null>(null);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [shopSearchText, setShopSearchText] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // 10+ hook calls
  const { data: initData, isLoading: isInitLoading, error: initError } = useOperationTableInit();
  const { data: shopSearchResults } = useShopSearch({ ... });
  const { data: tableData, isLoading: isTableLoading, error: tableError } = useOperationTableData(...);
  // ... more hooks

  // React Hook Form setup (20+ lines)
  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({ ... });

  // Watch values (10+ lines)
  const selectedSection = watch('sectionCode');
  const selectedDeployment = watch('deploymentDivision');
  const year = watch('year');
  const month = watch('month');
  const day = watch('day');

  // Effects (20+ lines)
  useEffect(() => { /* reset block */ }, [selectedSection, setValue]);
  useEffect(() => { /* reset vehicle division */ }, [selectedDeployment, setValue]);

  // Day of week calculation (15 lines)
  const dayOfWeek = (() => { /* complex logic */ })();

  // Event handlers (60+ lines)
  const onSubmit = (data: SearchFormData) => { /* transform & submit */ };
  const handleReset = () => { /* reset logic */ };
  const handleShopSelect = (shop: SelectedShop) => { /* shop selection */ };
  const handleShopAutocompleteChange = (_: any, newValue: string | Shop | null) => { /* autocomplete */ };
  const handlePrint = useReactToPrint({ /* print config */ });

  // 500+ lines of JSX
  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header - 30 lines */}
        <Box sx={{ mb: 3, display: 'flex', ... }}>
          <Typography variant="h4" component="h1">35. Web稼働表</Typography>
          {/* Print button, back button */}
        </Box>

        {/* Search Form - 350+ lines */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              {/* Row 1: Date, Section, Block, Office - 120 lines */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={1.5}>
                  {/* Date field - 30 lines */}
                  {/* Section field - 20 lines */}
                  {/* Block field - 20 lines */}
                  {/* Office autocomplete - 50 lines */}
                </Grid>
              </Grid>

              {/* Row 2: Class inputs, Group Class, Vehicle Code, etc. - 150 lines */}
              <Grid size={{ xs: 12 }}>
                <Grid container spacing={1.5}>
                  {/* Class label + 5 inputs - 50 lines */}
                  {/* Group Class checkbox - 15 lines */}
                  {/* Vehicle Code - 15 lines */}
                  {/* Deployment Division - 20 lines */}
                  {/* Vehicle Division - 20 lines */}
                  {/* Sort Order - 15 lines */}
                </Grid>
              </Grid>

              {/* Row 3: Radio buttons + Search button - 80 lines */}
              <Grid size={{ xs: 12 }}>
                {/* Provisional Booking radio - 30 lines */}
                {/* Display Range radio - 30 lines */}
                {/* Search button - 20 lines */}
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Results Section - 50 lines */}
        {apiSearchParams && (
          <>
            {isTableLoading && <CircularProgress />}
            {tableError && <Alert severity="error">...</Alert>}
            {tableData && <OperationTableDisplay data={tableData} ... />}
          </>
        )}

        {/* Shop Selection Modal - 10 lines */}
        <ShopSelectionModal open={shopModalOpen} onClose={...} onSelect={...} />
      </Container>
    </ErrorBoundary>
  );
}
```

**Issues**:

- ❌ 636 lines - extremely hard to maintain
- ❌ Mixed concerns (UI, logic, state, effects)
- ❌ Hard to test individual parts
- ❌ Hard to reuse form components
- ❌ Difficult to understand flow
- ❌ Large cognitive load

---

### 2. **`OperationTableDisplay.tsx` (598 lines)** ⚠️ WARNING

**Current State**: Monolithic table component with nested sub-components

**Contains**:

- Main table component (200 lines)
- `DraggableStatusBar` sub-component (80 lines)
- `DroppableTimeCell` sub-component (50 lines)
- `StatusDetailModal` sub-component (150 lines)
- DnD logic (100 lines)
- Time slot rendering logic (100 lines)

**Structure**:

```tsx
// Sub-components defined INSIDE the same file (not exported)
function DraggableStatusBar({ piece, operation, onDetailClick }) { /* 80 lines */ }
function DroppableTimeCell({ operation, timeIndex, children }) { /* 50 lines */ }
function StatusDetailModal({ open, onClose, piece, vehicle }) { /* 150 lines */ }

// Main component
export function OperationTableDisplay({ data, searchParams, onScheduleUpdate }) {
  // State (20 lines)
  const [selectedStatus, setSelectedStatus] = useState(...);
  const [activePiece, setActivePiece] = useState(...);
  const [snackbar, setSnackbar] = useState(...);

  // Event handlers (100 lines)
  const handleStatusClick = ...
  const handleCloseModal = ...
  const handleDragStart = ...
  const handleDragEnd = ... // 60 lines of complex logic
  const handleDragCancel = ...
  const handleCloseSnackbar = ...

  // Render helpers (100 lines)
  const renderDateHeaders = () => { /* 30 lines */ }
  const renderHourHeaders = () => { /* 30 lines */ }

  // Main render (200+ lines)
  return (
    <DndContext onDragStart={...} onDragEnd={...} onDragCancel={...}>
      <TableContainer>
        <Table>
          <TableHead>
            {/* Complex header structure - 2 rows */}
          </TableHead>
          <TableBody>
            {operations.map((operation) => {
              // Complex time slot mapping logic (50 lines)
              const timeSlotMap = new Map<number, StatusPiece>();
              // ... calculation logic

              return (
                <TableRow key={operation.id}>
                  {/* 6 fixed columns */}
                  {/* N dynamic time cells with DnD */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <DragOverlay>{/* ... */}</DragOverlay>
      <StatusDetailModal open={...} onClose={...} piece={...} vehicle={...} />
      <Snackbar>{/* ... */}</Snackbar>
    </DndContext>
  );
}
```

**Issues**:

- ⚠️ 598 lines - approaching critical size
- ⚠️ Sub-components not reusable (defined internally)
- ⚠️ Complex DnD logic mixed with rendering
- ⚠️ Time slot calculation embedded in render
- ⚠️ Hard to unit test sub-components

---

### 3. **`ShopSelectionModal.tsx` (364 lines)** ⚠️ MODERATE

**Current State**: Acceptable but could be improved

**Contains**:

- Form state (20 lines)
- Search logic (20 lines)
- Autocomplete filters (80 lines)
- Results table (100 lines)
- Modal UI structure (100 lines)

**Could be split into**:

- `ShopSearchForm` component
- `ShopResultsTable` component
- Modal wrapper component

---

## 💡 Improvement Opportunities

### **Priority 1: Break Down `operation-table/page.tsx`** 🔴 CRITICAL

#### Recommended Component Structure:

```
features/operation-table/components/
├── OperationTableSearchForm.tsx       (NEW) - Main search form container
│   ├── SearchFormRow1.tsx             (NEW) - Date, Section, Block, Office
│   ├── SearchFormRow2.tsx             (NEW) - Class inputs, Vehicle fields
│   └── SearchFormRow3.tsx             (NEW) - Radio buttons, Search button
│
├── OperationTableHeader.tsx           (NEW) - Page header with title & actions
├── OperationTableResults.tsx          (NEW) - Results wrapper with loading/error states
├── OperationTableDisplay.tsx          (EXISTING - could be refactored)
│
└── search-form-fields/                (NEW) - Reusable field components
    ├── DateField.tsx
    ├── SectionField.tsx
    ├── BlockField.tsx
    ├── OfficeField.tsx
    ├── ClassInputs.tsx
    ├── VehicleFields.tsx
    └── SearchOptions.tsx
```

#### Proposed `page.tsx` (simplified to ~100 lines):

```tsx
"use client";

import { useState } from "react";
import { Container } from "@mui/material";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ShopSelectionModal } from "@/components/ShopSelectionModal";
import {
  OperationTableHeader,
  OperationTableSearchForm,
  OperationTableResults,
} from "@/features/operation-table/components";
import { useOperationTableData } from "@/features/operation-table/hooks";
import type { SearchParams, SelectedShop } from "@/lib/api/contracts";

export default function OperationTablePage() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [shopModalOpen, setShopModalOpen] = useState(false);

  // Data fetching
  const {
    data: tableData,
    isLoading,
    error,
  } = useOperationTableData(searchParams!, !!searchParams);

  // Event handlers
  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  const handleShopSelect = (shop: SelectedShop) => {
    setShopModalOpen(false);
    // ... handle selection
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <OperationTableHeader
          hasResults={!!tableData}
          onPrint={() => {
            /* ... */
          }}
        />

        <OperationTableSearchForm
          onSearch={handleSearch}
          onOpenShopModal={() => setShopModalOpen(true)}
        />

        <OperationTableResults
          data={tableData}
          isLoading={isLoading}
          error={error}
          searchParams={searchParams}
        />

        <ShopSelectionModal
          open={shopModalOpen}
          onClose={() => setShopModalOpen(false)}
          onSelect={handleShopSelect}
        />
      </Container>
    </ErrorBoundary>
  );
}
```

**Benefits**:

- ✅ 636 lines → ~100 lines (page.tsx)
- ✅ Each component has single responsibility
- ✅ Easy to test components individually
- ✅ Easy to understand flow
- ✅ Reusable form field components
- ✅ Better code organization

---

### **Priority 2: Refactor `OperationTableDisplay.tsx`** 🟡 HIGH

#### Recommended Structure:

```
features/operation-table/components/
├── OperationTableDisplay.tsx          (REFACTORED) - Main orchestrator (~150 lines)
│
└── operation-table-parts/             (NEW)
    ├── DraggableStatusBar.tsx         - Extract to own file
    ├── DroppableTimeCell.tsx          - Extract to own file
    ├── StatusDetailModal.tsx          - Extract to own file
    ├── TableHeader.tsx                - Date/hour headers
    ├── VehicleRow.tsx                 - Single vehicle row
    ├── VehicleInfoCell.tsx            - Fixed info columns
    └── TimeSlotManager.tsx            - Time slot calculation logic
```

#### Proposed Refactored Structure:

```tsx
// OperationTableDisplay.tsx (150 lines)
import { DndContext } from '@dnd-kit/core';
import {
  TableHeader,
  VehicleRow,
  StatusDetailModal,
  DragOverlay
} from './operation-table-parts';
import { useOperationTableDnD } from '../hooks/useOperationTableDnD';

export function OperationTableDisplay({ data, searchParams, onScheduleUpdate }) {
  const {
    selectedStatus,
    activePiece,
    snackbar,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleStatusClick,
    handleCloseModal,
    handleCloseSnackbar,
  } = useOperationTableDnD(data, searchParams, onScheduleUpdate);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <TableContainer>
        <Table>
          <TableHeader header={data.header} />

          <TableBody>
            {data.operations.map((operation) => (
              <VehicleRow
                key={operation.id}
                operation={operation}
                header={data.header}
                searchParams={searchParams}
                onStatusClick={handleStatusClick}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DragOverlayComponent activePiece={activePiece} />
      <StatusDetailModal {...modalProps} />
      <SnackbarComponent {...snackbarProps} />
    </DndContext>
  );
}

// operation-table-parts/VehicleRow.tsx (80 lines)
export function VehicleRow({ operation, header, searchParams, onStatusClick }) {
  const timeSlotMap = useTimeSlotMapping(operation, searchParams);

  return (
    <TableRow>
      <VehicleInfoCells operation={operation} />
      <TimeCells
        operation={operation}
        timeSlotMap={timeSlotMap}
        header={header}
        onStatusClick={onStatusClick}
      />
    </TableRow>
  );
}

// operation-table-parts/StatusDetailModal.tsx (150 lines)
export function StatusDetailModal({ open, onClose, piece, vehicle }) {
  // Extracted from main file - fully reusable
  return <Dialog>{/* ... */}</Dialog>;
}

// hooks/useOperationTableDnD.ts (NEW - 100 lines)
export function useOperationTableDnD(data, searchParams, onScheduleUpdate) {
  // Extract all DnD logic, state, and handlers
  const [selectedStatus, setSelectedStatus] = useState(...);
  const [activePiece, setActivePiece] = useState(...);
  const [snackbar, setSnackbar] = useState(...);

  const handleDragEnd = (event) => {
    // Complex DnD logic extracted
  };

  return {
    selectedStatus,
    activePiece,
    snackbar,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    handleStatusClick,
    handleCloseModal,
    handleCloseSnackbar,
  };
}

// hooks/useTimeSlotMapping.ts (NEW - 50 lines)
export function useTimeSlotMapping(operation, searchParams) {
  return useMemo(() => {
    const timeSlotMap = new Map<number, StatusPiece>();
    const baseDate = new Date(searchParams.searchDate);
    baseDate.setHours(0, 0, 0, 0);

    operation.pieceInformationList.forEach((piece) => {
      const hoursSinceBase = Math.floor(
        (piece.startTime.getTime() - baseDate.getTime()) / (60 * 60 * 1000)
      );

      for (let i = 0; i < piece.pieceLength; i++) {
        timeSlotMap.set(hoursSinceBase + i, piece);
      }
    });

    return timeSlotMap;
  }, [operation, searchParams.searchDate]);
}
```

**Benefits**:

- ✅ 598 lines → ~150 lines (main component)
- ✅ Sub-components are reusable and testable
- ✅ Business logic extracted to custom hooks
- ✅ Clear separation of concerns
- ✅ Easier to maintain and debug

---

### **Priority 3: Improve `ShopSelectionModal.tsx`** 🟢 MEDIUM

#### Quick Wins:

```
components/
└── shop-selection/
    ├── ShopSelectionModal.tsx       (Refactored - 100 lines)
    ├── ShopSearchForm.tsx           (NEW - 150 lines)
    └── ShopResultsTable.tsx         (NEW - 100 lines)
```

---

## 📈 Componentization Benefits

### Before Refactoring:

```
operation-table/page.tsx         636 lines ❌
OperationTableDisplay.tsx        598 lines ⚠️
ShopSelectionModal.tsx           364 lines ⚠️
-------------------------------------------
TOTAL:                          1598 lines in 3 files
```

### After Refactoring:

```
operation-table/page.tsx         ~100 lines ✅
OperationTableSearchForm.tsx     ~150 lines ✅
SearchFormRow1.tsx               ~80 lines  ✅
SearchFormRow2.tsx               ~100 lines ✅
SearchFormRow3.tsx               ~60 lines  ✅
OperationTableHeader.tsx         ~40 lines  ✅
OperationTableResults.tsx        ~60 lines  ✅

OperationTableDisplay.tsx        ~150 lines ✅
TableHeader.tsx                  ~80 lines  ✅
VehicleRow.tsx                   ~80 lines  ✅
StatusDetailModal.tsx            ~150 lines ✅
DraggableStatusBar.tsx           ~80 lines  ✅
DroppableTimeCell.tsx            ~50 lines  ✅
useOperationTableDnD.ts          ~100 lines ✅
useTimeSlotMapping.ts            ~50 lines  ✅

ShopSelectionModal.tsx           ~100 lines ✅
ShopSearchForm.tsx               ~150 lines ✅
ShopResultsTable.tsx             ~100 lines ✅
-------------------------------------------
TOTAL:                          ~1540 lines in 18 files ✅
```

**Advantages**:

- ✅ Same total lines, but in smaller, focused components
- ✅ Each file < 200 lines (maintainable)
- ✅ Easy to locate and fix issues
- ✅ Reusable components
- ✅ Testable in isolation
- ✅ Better developer experience

---

## 🎯 Recommended Action Plan

### Phase 1: Operation Table Search Form (Week 1)

1. Create `OperationTableSearchForm.tsx` component
2. Extract form rows into separate components
3. Create reusable field components
4. Update `page.tsx` to use new components
5. Test thoroughly

### Phase 2: Operation Table Display (Week 2)

1. Extract sub-components to separate files
2. Create custom hooks for DnD logic
3. Create custom hook for time slot mapping
4. Refactor main `OperationTableDisplay.tsx`
5. Test thoroughly

### Phase 3: Shop Selection Modal (Week 3)

1. Split into `ShopSearchForm` and `ShopResultsTable`
2. Refactor modal wrapper
3. Test thoroughly

### Phase 4: Create Shared Component Library (Week 4)

1. Identify reusable patterns
2. Create shared components in `/components`
3. Document component usage
4. Update Storybook (if using)

---

## 📚 Best Practices Applied

### ✅ Component Size

- **Guideline**: Keep components under 200 lines
- **Reason**: Easier to understand, maintain, test

### ✅ Single Responsibility

- **Guideline**: Each component does one thing well
- **Reason**: Easier to reason about, reuse, test

### ✅ Composition over Nesting

- **Guideline**: Compose small components rather than nesting logic
- **Reason**: More flexible, reusable, testable

### ✅ Extract Custom Hooks

- **Guideline**: Extract complex logic into custom hooks
- **Reason**: Separates concerns, enables reuse

### ✅ Co-location

- **Guideline**: Keep related files close together
- **Reason**: Easier to navigate, understand relationships

---

## 🚀 Next Steps

1. **Review this analysis** with the team
2. **Prioritize** which refactoring to tackle first
3. **Create feature branch** for refactoring work
4. **Refactor incrementally** - one component at a time
5. **Test thoroughly** after each refactoring
6. **Document** new component structure

---

## 📝 Summary

### Current State:

- ✅ Good: Feature-based organization, hooks extracted
- ⚠️ Warning: Some components are too large
- ❌ Critical: `page.tsx` is 636 lines - needs immediate refactoring

### Target State:

- ✅ All components < 200 lines
- ✅ Clear separation of concerns
- ✅ Reusable, testable components
- ✅ Easy to navigate and maintain

### ROI:

- **Development Speed**: Faster feature additions
- **Bug Reduction**: Easier to spot and fix issues
- **Developer Experience**: Easier to onboard new developers
- **Maintainability**: Sustainable long-term codebase

---

**Ready to proceed with refactoring?** Let me know which phase you'd like to start with!
