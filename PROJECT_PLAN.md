# CRS/CRF Web System - React Migration POC Project Plan

## 📊 Project Overview

### Objective
Migrate the legacy Java EE/Backbone.js web system to a modern **React + Next.js** stack, starting with a Proof of Concept (POC) focused on the **稼働表 (Operation Table/Schedule Board)** feature.

### Tech Stack
- **Frontend**: React 19, Next.js 15, TypeScript
- **UI Libraries**: Material-UI (MUI) + Tailwind CSS 4
- **Drag & Drop**: @dnd-kit
- **State Management**: Zustand + React Query
- **Form Handling**: React Hook Form + Zod
- **Date Utilities**: date-fns + @holiday-jp/holiday_jp

---

## 🎯 POC Scope - Two Pages

### 1. **Menu/Navigation Page** (OT02000 equivalent)
- Display main menu with navigation buttons
- Show "35.Web稼働表" button that links to the operation table
- Simple, clean layout matching old system's menu structure

### 2. **稼働表 (Operation Table)** - PT04000
**Main Feature**: Interactive time-chart displaying vehicle operation status

#### Key Components:
- **Search Form** with multiple filters:
  - Date selection (year/month/day + auto day-of-week calculation)
  - Cascading dropdowns (部→ブロック, 配備/運用区分→車両区分)
  -営業所 (shop) selection dialog
  - Class codes (×5), vehicle model code
  - Sort options, provisional allocation, search range (72h/2weeks)

- **Operation Time-Chart Graph**:
  - Header: Date/time axis (horizontal scrollable)
  - Rows: Vehicle information + colored status bars
  - Each bar represents operation status (rental, idle, maintenance, etc.)
  - **NEW POC FEATURE**: Drag-and-drop capability to edit schedules

- **Interactions**:
  - Tooltip on hover (shows status details)
  - Click to open detail modal
  - Print functionality
  - Horizontal scrolling for extended time periods

---

## 📁 Old System Analysis

### **PT04000 - Web稼働表 (Operation Table)**

#### File Locations:
```
Frontend:
├── HTML: /WEB-INF/views/PT04/PT04000.html
├── JavaScript: /javascript/app/PT04000/
│   ├── app.js (entry point)
│   ├── model/WebOperationTableModel.js
│   └── view/WebOperationTableView.js

Backend:
├── Controller: presentation/PT04/WebOperationTableController.java
├── Resource: presentation/PT04/WebOperationTableResource.java
├── Facade: logic/PT04000/facade/
│   ├── WebOperationTableScreenDefaultDisplayFacade.java
│   └── OperationStatusSearchFacade.java
```

#### Key Data Structures:

**Search Parameters:**
- searchRecordDateYear/Month/Day
- sectionNameSelectValue (部)
- blockNameSelectValue (ブロック)
- shopCode/shopName (営業所)
- classCode1-5 (クラス×5)
- carModelCode (車種コード)
- dispositionAndUsingDivision (配備/運用区分)
- carDivision (車両区分)
- sortDivision (並び順)
- provisionalBookingExecute (仮引当実施)
- searchScope (検索範囲: 72h/2weeks)

**Graph Data Structure:**
```javascript
operationTableGraphHeader: {
  datewriteList: ["02/10(水)", "02/11(木)", ...],
  timewriteList: ["0", "6", "12", "18"],
  graphMeshCount: 180,
  datewriteMeshCount: 48,
  timewriteMeshCount: 2
}

operationTableGraphDataList: [{
  registNumber: "1123022224",          // 登録番号
  carName: "アルファード",              // 車種名
  condition: "1234567",                // 条件
  selfAndOthersDivision: "C",         // 自他FEE区分
  classCode: "WCL",                   // クラスコード
  dispositionShopName: "麻生駅前",     // 配備営業所
  usingShopName: "札幌駅北口",         // 運用営業所
  
  pieceInformationList: [{            // ステータスバー
    pieceLength: 12,                  // セル数(時間幅)
    pieceColor: "#FF5733",           // 色
    tooltipMessage: "貸渡中\n...",    // ツールチップ
    pieceJson: {...}                 // 詳細データ
  }]
}]
```

---

## 🗂️ New Next.js Project Structure

```
crsf-web-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with MUI/Query providers
│   │   ├── page.tsx                # Landing page
│   │   ├── menu/
│   │   │   └── page.tsx            # Menu page (OT02000)
│   │   └── operation-table/        # PT04000
│   │       └── page.tsx
│   │
│   ├── components/                 # Shared components
│   │   ├── ui/                     # Generic UI components
│   │   ├── layout/                 # Layout components
│   │   └── forms/                  # Form components
│   │
│   ├── features/                   # Feature-specific modules
│   │   └── operation-table/
│   │       ├── components/
│   │       │   ├── SearchForm.tsx
│   │       │   ├── OperationTableGraph.tsx
│   │       │   ├── DraggableStatusBar.tsx
│   │       │   └── StatusDetailModal.tsx
│   │       ├── hooks/
│   │       │   ├── useOperationTableData.ts
│   │       │   ├── useBlockList.ts
│   │       │   └── useDragAndDrop.ts
│   │       ├── stores/
│   │       │   └── operationTableStore.ts
│   │       └── types/
│   │           └── operationTable.types.ts
│   │
│   ├── lib/                        # Utilities
│   │   ├── api/                    # API client
│   │   ├── utils/                  # Helper functions
│   │   └── theme/                  # MUI theme config
│   │
│   └── types/                      # Global TypeScript types
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🚀 Implementation Plan

### **Phase 1: Foundation Setup** (Days 1-2)
✅ Dependencies already installed

**Tasks:**
- [ ] Setup MUI Theme Provider with Japanese locale
- [ ] Configure React Query and Zustand
- [ ] Create folder structure
- [ ] Setup path aliases (@/components, @/features, etc.)
- [ ] Create base layout with header/footer

### **Phase 2: Menu Page** (Day 3)
**Tasks:**
- [ ] Create `/menu` route
- [ ] Build menu layout with cards/buttons
- [ ] Add "35.Web稼働表" button
- [ ] Setup navigation to operation table page

### **Phase 3: Operation Table - Search Form** (Days 4-5)
**Tasks:**
- [ ] Create SearchForm component with all fields
- [ ] Implement date inputs with day-of-week auto-calculation
- [ ] Add Zod validation schema
- [ ] Implement cascading dropdowns (部→ブロック)
- [ ] Create 営業所 selection dialog
- [ ] Wire up form submission

### **Phase 4: Operation Table - Graph Display** (Days 6-8)
**Tasks:**
- [ ] Create OperationTableGraph component
- [ ] Build time-chart header (dates/times)
- [ ] Render vehicle rows with information
- [ ] Display status bars with colors and colSpan
- [ ] Implement horizontal scrolling
- [ ] Add mock data for development

### **Phase 5: Interactions** (Days 9-10)
**Tasks:**
- [ ] Add MUI Tooltips to status bars
- [ ] Create StatusDetailModal component
- [ ] Implement modal trigger on bar click
- [ ] Handle multiple overlapping statuses

### **Phase 6: Drag & Drop (POC Key Feature)** (Days 11-14)
**Tasks:**
- [ ] Integrate @dnd-kit
- [ ] Make status bars draggable
- [ ] Implement horizontal drag (time change)
- [ ] Implement vertical drag (vehicle change)
- [ ] Add resize capability (duration adjustment)
- [ ] Show visual feedback during drag
- [ ] Update state on drop
- [ ] Implement optimistic UI updates

### **Phase 7: State Management & API Integration** (Days 15-16)
**Tasks:**
- [ ] Create Zustand store for operation table state
- [ ] Setup React Query hooks
- [ ] Create mock API endpoints (or connect to existing backend)
- [ ] Implement loading states
- [ ] Add error handling

### **Phase 8: Polish & Features** (Days 17-18)
**Tasks:**
- [ ] Add print functionality (react-to-print)
- [ ] Ensure color preservation in print
- [ ] Implement responsive design
- [ ] Add loading spinners/skeletons
- [ ] Add smooth animations
- [ ] Accessibility improvements (keyboard navigation, ARIA labels)

### **Phase 9: Testing & Documentation** (Days 19-20)
**Tasks:**
- [ ] Test all user flows
- [ ] Test drag & drop edge cases
- [ ] Cross-browser testing
- [ ] Write component documentation
- [ ] Create user guide for POC

---

## 🎨 Key Design Decisions

### **1. Drag & Drop Implementation**
Using **@dnd-kit** for:
- **Horizontal drag**: Change start/end time of operation
- **Vertical drag**: Move operation to different vehicle
- **Resize**: Adjust duration by dragging edges
- **Visual feedback**: Ghost image, drop zones highlighting
- **Collision detection**: Prevent overlapping conflicts

### **2. State Management Strategy**
- **Zustand**: Local UI state (search form values, selected items)
- **React Query**: Server state (operation data, cache, refetching)
- **Benefits**: Optimistic updates, automatic refetching, cache management

### **3. Responsive Design**
- Desktop-first (primary use case)
- Horizontal scroll for time-chart on smaller screens
- Collapsible search form on mobile
- Touch-friendly drag & drop

### **4. API Design** (Mock or Backend Integration)
```typescript
// GET /api/operation-table/init
// POST /api/operation-table/search
// GET /api/operation-table/blocks?section={code}
// GET /api/operation-table/status-detail?{params}
// PUT /api/operation-table/update-schedule (for drag & drop)
```

---

## 📝 Key Differences: Old vs New

| Aspect | Old System | New POC |
|--------|-----------|---------|
| **Frontend** | Backbone.js + jQuery | React + Next.js |
| **Rendering** | Server-side (Thymeleaf) | Client-side (React) |
| **State** | Backbone Model | Zustand + React Query |
| **Forms** | jQuery validation | React Hook Form + Zod |
| **Drag & Drop** | ❌ None | ✅ @dnd-kit (POC feature) |
| **API** | Server renders HTML | JSON REST API |
| **Styling** | Bootstrap 3 | MUI + Tailwind CSS 4 |
| **Type Safety** | ❌ None | ✅ TypeScript |

---

## 🔄 Migration Strategy

### **What to Keep:**
✅ Backend APIs (Controllers, Facades, Mappers) - can be reused as JSON APIs
✅ Business logic layer
✅ Database structure and queries
✅ Authentication/authorization logic

### **What to Rewrite:**
🔄 Entire frontend (Backbone → React)
🔄 Views/Templates (Thymeleaf → JSX)
🔄 Client-side state management
🔄 Form handling and validation

### **What to Enhance:**
🆕 Drag & drop editing (POC new feature)
🆕 Real-time validation feedback
🆕 Optimistic UI updates
🆕 Better mobile responsiveness
🆕 Modern UX patterns

---

## 📊 Success Criteria for POC

### **Must Have:**
- ✅ Menu page with navigation to operation table
- ✅ Full search form with all filters working
- ✅ Operation table graph displaying correctly
- ✅ Status bars with colors matching old system
- ✅ **Drag & drop to edit schedules** (horizontal/vertical)
- ✅ Tooltips and detail modal
- ✅ Print functionality
- ✅ Horizontal scrolling for time range

### **Nice to Have:**
- ⭐ Resize status bars for duration
- ⭐ Undo/redo for drag operations
- ⭐ Real-time collaboration (future)
- ⭐ Mobile-optimized view

### **Performance Targets:**
- Initial load: < 2 seconds
- Search results: < 1 second
- Drag & drop: 60fps smooth
- Print generation: < 3 seconds

---

## 🎯 Next Steps

**Immediate Actions:**
1. ✅ Review this plan and adjust if needed
2. 🔜 Start with Phase 1: Setup MUI Theme & Project Structure
3. 🔜 Create base layout and navigation
4. 🔜 Build menu page
5. 🔜 Start on operation table search form

**Questions to Clarify:**
- [ ] Do you want to connect to the existing Java backend or use mock data?
- [ ] Do you need authentication for the POC?
- [ ] What's the priority: feature completeness vs. drag & drop polish?
- [ ] Timeline expectations for the POC?

---

## 📚 Reference Files

### Old System Key Files:
- **Page ID**: PT04000
- **HTML**: `refer/crsf-web-dev_CHAR-VALID/crsf-web-presentation/src/main/webapp/WEB-INF/views/PT04/PT04000.html`
- **JavaScript**: `refer/crsf-web-dev_CHAR-VALID/crsf-web-presentation/src/main/javascript/app/PT04000/`
- **Controller**: `refer/crsf-web-dev_CHAR-VALID/crsf-web-presentation/src/main/java/.../presentation/PT04/`
- **Menu**: `refer/crsf-web-dev_CHAR-VALID/.../views/OT02/OT02000.html` (line 294: "35.Web稼働表")

### Documentation:
- `refer/crsf-web-dev_CHAR-VALID/operation-table-analysis.md`
- `refer/crsf-web-dev_CHAR-VALID/page-identification-guide.md`

---

**Ready to start building? Let's begin with Phase 1!** 🚀
