# CRSF Web Next.js

Modern web application for Car Rental System & Fleet Management, rebuilt from legacy Java/Backbone.js system using React and Next.js.

## 🎯 Project Status

**Current Phase:** POC Complete - Production Ready Development  
**Version:** 0.1.0  
**Latest Update:** October 2025

## ✨ Features (POC)

### ✅ Implemented
- **Web稼働表 (Operation Table)** - PT04000
  - Time-chart scheduling interface (72 hours / 2 weeks view)
  - Drag-and-drop vehicle scheduling
  - 1-hour based grid system
  - 6 information columns (2×3 layout)
  - Real-time search with 17+ filter fields
  - Cascading and dependent dropdowns
  - Print functionality (A3 landscape)
  - Tooltips and detail modals
  
- **Menu Page** - OT02000
  - Main navigation interface
  - Card-based layout

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Sparr0wHawk/crsf-web-nextjs.git
cd crsf-web-nextjs

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit http://localhost:3000

### Available Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🏗️ Tech Stack

- **Framework:** Next.js 15.5.6 (App Router)
- **Language:** TypeScript 5
- **UI:** Material-UI 7.3.4 + Tailwind CSS 4
- **State Management:** 
  - TanStack React Query 5.90.5 (server state)
  - Zustand 5.0.8 (client state)
- **Forms:** React Hook Form 7.65.0 + Zod 4.1.12
- **Drag & Drop:** @dnd-kit 6.3.1
- **Print:** react-to-print 3.2.0

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── menu/              # Menu page
│   └── operation-table/   # Operation table page
├── components/            # Shared components
├── features/             # Feature modules
│   └── operation-table/
│       ├── components/   # Feature-specific UI
│       └── hooks/        # Data fetching hooks
└── lib/                  # Core libraries
    ├── api/
    │   ├── contracts/    # TypeScript interfaces
    │   └── implementations/  # API implementations
    └── theme/           # MUI theme
```

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Comprehensive project documentation
  - Architecture patterns
  - Best practices
  - Areas for improvement
  - Security considerations

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Quick start guide for developers
  - Common tasks
  - Code patterns
  - API integration
  - Debugging tips

- **[API_ARCHITECTURE_DIAGRAM.md](./API_ARCHITECTURE_DIAGRAM.md)** - API layer architecture

- **[WHY_REACT.md](./WHY_REACT.md)** - Technology decision rationale

## 🎨 Code Architecture

### API Layer Pattern
```
Component → Custom Hook → API Factory → API Contract → Implementation (Mock/Real)
```

**Benefits:**
- Easy switching between mock and production APIs
- Type-safe API calls
- Testable code
- Clear separation of concerns

### Example: Data Fetching
```typescript
// 1. Define contract
export interface IOperationTableAPI {
  search(params: SearchParams): Promise<SearchResponse>;
}

// 2. Create hook
export function useOperationTableData(params: SearchParams) {
  return useQuery({
    queryKey: ['operationTable', 'data', params],
    queryFn: async () => {
      const api = getOperationTableAPI(); // Factory
      return api.search(params);
    },
  });
}

// 3. Use in component
const { data, isLoading } = useOperationTableData(searchParams);
```

## 🧪 Testing

**Status:** Not yet implemented

**Recommended:**
- Jest + React Testing Library (unit/integration)
- Playwright or Cypress (E2E)
- Target coverage: >80%

## 🔐 Environment Variables

Create `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_USE_MOCK_API=true

# Optional
NEXT_PUBLIC_API_TIMEOUT=30000
```

## 📦 Building for Production

```bash
# Build
npm run build

# Test production build locally
npm run start
```

## 🚢 Deployment

### Recommended Platforms

1. **Vercel** (Easiest)
   ```bash
   # Push to GitHub - automatic deployment
   git push origin master
   ```

2. **Docker** (For AWS/Azure)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   CMD ["npm", "start"]
   ```

3. **Manual**
   - Build: `npm run build`
   - Copy `.next`, `public`, `node_modules`, `package.json`
   - Run: `npm start` on server

## 🤝 Contributing

### Branch Strategy
```bash
# Feature
git checkout -b feature/add-reports

# Bug fix
git checkout -b fix/drag-drop-issue

# Refactor
git checkout -b refactor/api-layer
```

### Commit Convention
```
feat: add new feature
fix: bug fix
refactor: code refactoring
docs: documentation
test: add tests
chore: maintenance
```

### Code Style
- Use TypeScript interfaces for all contracts
- Feature-based folder organization
- Custom hooks for all API calls
- MUI for components, Tailwind for utilities
- JSDoc comments for complex logic

## 📊 Project Metrics

- **Total Source Files:** ~20 TypeScript/TSX files
- **Lines of Code:** ~3,000+
- **Dependencies:** 20 production, 8 dev
- **Type Coverage:** 100% (no `any` types)
- **Test Coverage:** 0% (needs implementation)

## ⚠️ Known Limitations (POC)

- No authentication/authorization
- No real API integration (mock only)
- No automated tests
- No accessibility audit
- Bundle size not optimized
- Mobile UX needs improvement

## 🗺️ Roadmap

### Phase 1: Production Foundation (Next)
- [ ] Add authentication (NextAuth.js)
- [ ] Implement real API integration
- [ ] Add unit and E2E tests
- [ ] Accessibility improvements
- [ ] Performance optimization

### Phase 2: Feature Expansion
- [ ] Additional CRS features
- [ ] Reporting module
- [ ] Vehicle management
- [ ] Customer management

### Phase 3: Enhancement
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Advanced analytics
- [ ] Multi-language support

## 📞 Support

- **Issues:** https://github.com/Sparr0wHawk/crsf-web-nextjs/issues
- **Documentation:** See docs in repository root

## 📄 License

Private - Internal Use Only

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Material-UI](https://mui.com/)
- [TanStack Query](https://tanstack.com/query)
- [dnd kit](https://dndkit.com/)

---

**Last Updated:** October 24, 2025  
**Maintained by:** Development Team
