# CRSF Web Next.js - Project Overview

## 📋 Project Information

**Project Name:** CRSF Web (Car Rental System & Fleet Management)  
**Version:** 0.1.0 (POC Phase)  
**Repository:** https://github.com/Sparr0wHawk/crsf-web-nextjs  
**Status:** POC Complete - Ready for Production Development  
**Created:** October 2025

## 🎯 Project Purpose

This is a modern web application rewrite of a legacy Java/Backbone.js car rental and fleet management system. The POC focuses on the **Web 稼働表 (Web Operation Table)** feature - a time-chart scheduling interface with drag-and-drop capabilities for managing vehicle operations.

## 🏗️ Architecture Overview

### Technology Stack

#### Core Framework

- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

#### UI Framework

- **Material-UI (MUI) 7.3.4** - Component library
- **Tailwind CSS 4** - Utility-first styling
- **@emotion** - CSS-in-JS for MUI

#### State Management & Data Fetching

- **TanStack React Query 5.90.5** - Server state management with caching
- **Zustand 5.0.8** - Client state management (ready for use)
- **React Hook Form 7.65.0** - Form state management
- **Zod 4.1.12** - Schema validation

#### Drag & Drop

- **@dnd-kit 6.3.1** - Modern drag-and-drop toolkit
  - Core, Sortable, Utilities packages

#### Additional Libraries

- **axios 1.12.2** - HTTP client (for production API)
- **date-fns 4.1.0** - Date utilities
- **@holiday-jp/holiday_jp 2.5.1** - Japanese holiday calculation
- **react-to-print 3.2.0** - Print functionality

## 📁 Project Structure

```
crsf-web-nextjs/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Home page (redirects to menu)
│   │   ├── providers.tsx             # React Query & MUI providers
│   │   ├── globals.css               # Global styles
│   │   ├── menu/
│   │   │   └── page.tsx              # Main menu (OT02000)
│   │   └── operation-table/
│   │       ├── page.tsx              # Operation table page (PT04000)
│   │       └── searchFormSchema.ts   # Form validation schema
│   │
│   ├── components/                   # Shared React components
│   │   └── ErrorBoundary.tsx         # Error handling component
│   │
│   ├── features/                     # Feature modules
│   │   └── operation-table/
│   │       ├── components/
│   │       │   └── OperationTableDisplay.tsx  # Main table component
│   │       └── hooks/                # Custom React Query hooks
│   │           ├── index.ts
│   │           ├── useBlockList.ts
│   │           ├── useOperationTableData.ts
│   │           ├── useOperationTableInit.ts
│   │           ├── useUpdateSchedule.ts
│   │           └── useVehicleDivisions.ts
│   │
│   └── lib/                          # Core libraries
│       ├── api/
│       │   ├── apiFactory.ts         # API factory pattern
│       │   ├── contracts/
│       │   │   └── operationTable.contract.ts  # TypeScript interfaces
│       │   └── implementations/
│       │       ├── mockApi.ts        # Mock API implementation
│       │       └── mockData.ts       # Mock data generators
│       └── theme/
│           └── theme.ts              # MUI theme configuration
│
├── public/                           # Static assets
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── eslint.config.mjs                 # ESLint rules
└── postcss.config.mjs                # PostCSS/Tailwind config
```

## 🎨 Architecture Patterns & Best Practices

### 1. **Separation of Concerns**

#### API Layer Architecture

```
Features/Components
       ↓
  Custom Hooks (useOperationTableData)
       ↓
  API Factory (getOperationTableAPI)
       ↓
  API Contract (IOperationTableAPI interface)
       ↓
  Implementation (MockAPI or RealAPI)
```

**Benefits:**

- Easy to swap between mock and real APIs
- Type-safe API calls
- Centralized data fetching logic
- No direct API calls in components

#### Feature-Based Organization

```
features/
└── operation-table/
    ├── components/     # UI components specific to this feature
    ├── hooks/          # Data fetching hooks for this feature
    ├── types/          # TypeScript types (if needed)
    └── utils/          # Helper functions (if needed)
```

**Benefits:**

- Co-location of related code
- Easy to find and maintain
- Can be extracted as a separate package if needed

### 2. **TypeScript Interfaces as Contracts**

All API contracts are defined in `contracts/` folder:

```typescript
// operationTable.contract.ts
export interface IOperationTableAPI {
  initialize(): Promise<InitializeResponse>;
  search(params: SearchParams): Promise<SearchResponse>;
  getBlocks(sectionCode: string): Promise<Block[]>;
  // ...
}
```

**Benefits:**

- Both mock and production APIs must implement the same interface
- Compile-time type checking
- Self-documenting code
- Easy to generate API documentation

### 3. **React Query for Server State**

```typescript
// Custom hook pattern
export function useOperationTableData(params: SearchParams, enabled: boolean) {
  return useQuery({
    queryKey: ["operationTable", "data", params],
    queryFn: async () => {
      const api = getOperationTableAPI();
      return api.search(params);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

**Benefits:**

- Automatic caching and revalidation
- Background refetching
- Optimistic updates
- Loading and error states
- DevTools for debugging

### 4. **Form Validation with Zod**

```typescript
// searchFormSchema.ts
export const searchFormSchema = z.object({
  year: z.number().min(2000).max(2100),
  month: z.number().min(1).max(12),
  // ...
});
```

**Benefits:**

- Type-safe form validation
- Runtime validation
- Automatic TypeScript types from schema
- Clear error messages

### 5. **Component Composition**

The operation table uses multiple levels of composition:

```
OperationTableDisplay (Container)
  ├── DndContext (Drag-and-drop context)
  ├── TableContainer
  │   ├── Table
  │   │   ├── TableHead
  │   │   │   ├── Date Headers Row
  │   │   │   └── Hour Headers Row (0-23)
  │   │   └── TableBody
  │   │       └── Vehicle Rows
  │   │           ├── Fixed Info Columns (6 columns)
  │   │           └── Time Cells (72+ hours)
  │   │               └── DroppableTimeCell
  │   │                   └── DraggableStatusBar
  ├── StatusDetailModal
  └── Snackbar (Notifications)
```

**Benefits:**

- Reusable components
- Easy to test individual pieces
- Clear hierarchy and responsibilities

## ✅ Implemented Features (POC)

### 1. Menu Page (OT02000)

- Main navigation page
- Card-based layout
- Navigation to operation table

### 2. Operation Table Page (PT04000)

#### Search Form

- **17+ search fields:**
  - Date picker with automatic day-of-week calculation
  - Cascading dropdowns (部 → ブロック)
  - Dependent dropdowns (配備運用区分 → 車両区分)
  - 5 class input fields with grouping option
  - Sort order, search range (72h/2weeks)
  - Provisional booking toggle
- **Form validation** with Zod
- **Auto-reset** dependent fields when parent changes
- **Compact layout** optimized for data entry

#### Operation Table Display

- **6 information columns** (2×3 layout):

  - 各種番号 (Registration Number)
  - 車種 (Car Model)
  - 条件 (Condition)
  - クラス (Class)
  - 配備営業所 (Disposition Office)
  - 運用営業所 (Operating Office)

- **Time-chart grid:**

  - 2-row header: Dates + Hours (0-23)
  - 1-hour based cells (80px wide)
  - Supports 72 hours (3 days) or 2 weeks display
  - Sticky headers and fixed columns
  - Horizontal scrolling

- **Status bars:**
  - Color-coded by status type (rental, idle, maintenance, etc.)
  - Positioned by actual start time
  - Span multiple hours visually
  - Show status text if length > 3 hours

#### Drag & Drop Functionality

- **Drag status bars** to different vehicles or time slots
- **Visual feedback:** Blue highlight on drop target
- **Time-based positioning:** Bars move to exact hour dropped
- **Persistent changes:** Updates mock data and refetches
- **Success notifications:** Context-aware messages

#### Additional Features

- **Tooltips:** Hover over status bars for details
- **Detail modal:** Click bars to see full information
- **Print functionality:** A3 landscape with color preservation
- **Error boundary:** Graceful error handling
- **Smooth animations:** Fade-in effects
- **Loading states:** Spinners and disabled UI during operations

## 🎯 Best Practices Implemented

### ✅ **Code Organization**

- Feature-based folder structure
- Clear separation between UI, logic, and data
- Consistent naming conventions

### ✅ **Type Safety**

- Comprehensive TypeScript interfaces
- No `any` types in production code
- Type-safe API contracts

### ✅ **Performance**

- React Query caching (5-minute stale time)
- Lazy loading with Next.js dynamic imports (ready to use)
- Memoization where appropriate
- Optimized re-renders

### ✅ **User Experience**

- Loading states for all async operations
- Error messages in Japanese
- Smooth animations
- Responsive design
- Print-friendly layout

### ✅ **Maintainability**

- Self-documenting code with JSDoc comments
- Consistent code style
- Error boundaries for fault tolerance
- Mock data for development/testing

### ✅ **Scalability**

- API factory pattern for easy backend switching
- Feature modules that can be extracted
- Reusable custom hooks
- Component composition over inheritance

## ⚠️ Areas for Improvement (Production Readiness)

### 1. **Testing** (Currently None)

```typescript
// Recommended additions:
- Unit tests (Jest + React Testing Library)
- Integration tests for API layer
- E2E tests (Playwright or Cypress)
- Test coverage > 80%
```

### 2. **Real API Implementation**

```typescript
// Create RealOperationTableAPI class
export class RealOperationTableAPI implements IOperationTableAPI {
  private baseURL: string;

  async search(params: SearchParams): Promise<SearchResponse> {
    const response = await axios.post(`${this.baseURL}/api/search`, params);
    return response.data;
  }
  // ...
}
```

### 3. **Environment Configuration**

```typescript
// .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
```

### 4. **Authentication & Authorization**

- Implement NextAuth.js or similar
- Add JWT token management
- Protected routes
- Role-based access control

### 5. **Error Handling Enhancement**

```typescript
// Centralized error handling
- API error interceptors
- Error reporting service (Sentry)
- User-friendly error messages
- Retry logic for failed requests
```

### 6. **Performance Optimization**

```typescript
// Additional optimizations needed:
- Code splitting for large components
- Image optimization with next/image
- Bundle size analysis
- Lighthouse performance audit
```

### 7. **Accessibility (A11y)**

- ARIA labels for drag-and-drop
- Keyboard navigation support
- Screen reader compatibility
- Color contrast validation

### 8. **Internationalization (i18n)**

```typescript
// If needed for multiple languages:
- next-intl or react-i18next
- Language switcher
- Date/number formatting by locale
```

### 9. **Documentation**

```typescript
// Additional docs needed:
- API documentation (OpenAPI/Swagger)
- Component storybook
- Development setup guide
- Deployment guide
```

### 10. **Code Quality Tools**

```json
// package.json additions:
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "type-check": "tsc --noEmit",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

## 🔄 Development Workflow

### Current Setup

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Build
npm run build        # Production build
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

### Recommended Additions

```bash
# Testing (to be added)
npm run test         # Run all tests
npm run test:watch   # Watch mode
npm run test:e2e     # E2E tests

# Code Quality (to be added)
npm run type-check   # TypeScript check
npm run format       # Format code
npm run audit        # Security audit
```

## 📝 Configuration Files

### TypeScript Configuration (`tsconfig.json`)

- **Target:** ES2017 (modern browsers)
- **Strict mode:** Enabled for type safety
- **Path aliases:** `@/*` maps to `src/*`
- **JSX:** Preserve (handled by Next.js)

### Next.js Configuration (`next.config.ts`)

- Currently using defaults
- Ready to add environment variables, rewrites, redirects

### ESLint Configuration (`eslint.config.mjs`)

- Next.js recommended rules
- Can be extended with custom rules

### Tailwind Configuration (`postcss.config.mjs`)

- Tailwind CSS 4 with PostCSS
- Works alongside MUI styling

## 🚀 Deployment Considerations

### Recommended Platforms

1. **Vercel** (easiest for Next.js)

   - Zero configuration
   - Automatic deployments from Git
   - Preview deployments for PRs

2. **AWS (ECS/Fargate)**

   - Dockerized deployment
   - More control over infrastructure
   - Integration with existing AWS services

3. **Azure App Service**
   - Good for enterprise environments
   - AD integration available

### Environment Variables Needed

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_API_TIMEOUT=
DATABASE_URL=
AUTH_SECRET=
```

## 📊 Project Metrics

- **Total Files (src/):** ~20 TypeScript/TSX files
- **Total Lines of Code:** ~3,000+ lines
- **Dependencies:** 20 production, 8 dev
- **Bundle Size:** Not yet optimized
- **Type Coverage:** 100% (no `any` types)
- **Test Coverage:** 0% (needs implementation)

## 🔐 Security Considerations

### Implemented

- ✅ TypeScript for type safety
- ✅ Input validation with Zod
- ✅ No sensitive data in client-side code
- ✅ Environment variables for configuration

### TODO

- ⚠️ CSRF protection
- ⚠️ XSS prevention (sanitize user input)
- ⚠️ Rate limiting
- ⚠️ Security headers
- ⚠️ Dependency vulnerability scanning

## 🎓 Learning Resources for Team

### Next.js 15 (App Router)

- https://nextjs.org/docs
- Focus on: Server Components, Route Handlers, Metadata API

### React Query (TanStack Query)

- https://tanstack.com/query/latest
- Focus on: Query keys, Caching, Optimistic updates

### Material-UI v7

- https://mui.com/material-ui/
- Focus on: Component API, Theming, sx prop

### @dnd-kit

- https://docs.dndkit.com/
- Focus on: Sensors, Modifiers, Collision detection

### TypeScript Patterns

- Focus on: Interface design, Type guards, Generics

## 🤝 Contributing Guidelines (For Team)

### Code Style

1. **Use TypeScript interfaces** for all API contracts
2. **Custom hooks** for all data fetching
3. **Feature folders** for related code
4. **JSDoc comments** for complex logic
5. **Consistent naming:**
   - Components: PascalCase (e.g., `OperationTable`)
   - Hooks: camelCase with 'use' prefix (e.g., `useOperationTableData`)
   - Files: Match component name or feature name

### Git Workflow

```bash
# Feature branches
git checkout -b feature/add-reporting-page
git checkout -b fix/drag-drop-mobile
git checkout -b refactor/api-layer

# Commit messages
feat: add new feature
fix: fix bug
refactor: code refactoring
docs: documentation updates
test: add tests
chore: maintenance tasks
```

### Pull Request Checklist

- [ ] Code follows project structure
- [ ] TypeScript types are correct
- [ ] No console.log in production code
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design tested
- [ ] Browser tested (Chrome, Firefox, Safari)

## 📞 Support & Contact

**Repository Issues:** https://github.com/Sparr0wHawk/crsf-web-nextjs/issues

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Author:** Development Team
