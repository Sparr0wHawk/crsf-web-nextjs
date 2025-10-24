# Developer Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ and npm
- Git
- VS Code (recommended)

### Setup
```bash
# Clone the repository
git clone git@github.com-work:Sparr0wHawk/crsf-web-nextjs.git
cd crsf-web-nextjs

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit: http://localhost:3000

## 📂 Where to Find Things

### Adding a New Feature
```
src/features/[feature-name]/
  ├── components/          # React components
  ├── hooks/              # Data fetching hooks
  └── types/              # TypeScript types
```

**Example:** Adding a "Vehicle Management" feature
```
src/features/vehicle-management/
  ├── components/
  │   ├── VehicleList.tsx
  │   └── VehicleForm.tsx
  ├── hooks/
  │   ├── useVehicleList.ts
  │   └── useUpdateVehicle.ts
  └── types/
      └── vehicle.types.ts
```

### Adding a New Page
```
src/app/[page-name]/
  └── page.tsx             # Next.js page component
```

**Example:** Adding a "Reports" page
```
src/app/reports/
  └── page.tsx
```

URL will be: `/reports`

### Adding Shared Components
```
src/components/
  └── [ComponentName].tsx
```

Use for: Buttons, Modals, Cards that are used across multiple features.

### API Integration

#### Step 1: Define the API Contract
```typescript
// src/lib/api/contracts/vehicle.contract.ts
export interface IVehicleAPI {
  getVehicles(): Promise<Vehicle[]>;
  createVehicle(data: CreateVehicleInput): Promise<Vehicle>;
}

export interface Vehicle {
  id: string;
  model: string;
  // ...
}
```

#### Step 2: Create Mock Implementation (for development)
```typescript
// src/lib/api/implementations/mockVehicleApi.ts
export class MockVehicleAPI implements IVehicleAPI {
  async getVehicles(): Promise<Vehicle[]> {
    // Return mock data
    return mockVehicles;
  }
}
```

#### Step 3: Create Real Implementation (for production)
```typescript
// src/lib/api/implementations/realVehicleApi.ts
export class RealVehicleAPI implements IVehicleAPI {
  async getVehicles(): Promise<Vehicle[]> {
    const response = await axios.get('/api/vehicles');
    return response.data;
  }
}
```

#### Step 4: Update Factory
```typescript
// src/lib/api/apiFactory.ts
export function getVehicleAPI(): IVehicleAPI {
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
    return new MockVehicleAPI();
  }
  return new RealVehicleAPI();
}
```

#### Step 5: Create Custom Hook
```typescript
// src/features/vehicle-management/hooks/useVehicleList.ts
import { useQuery } from '@tanstack/react-query';
import { getVehicleAPI } from '@/lib/api/apiFactory';

export function useVehicleList() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const api = getVehicleAPI();
      return api.getVehicles();
    },
  });
}
```

#### Step 6: Use in Component
```typescript
// src/features/vehicle-management/components/VehicleList.tsx
import { useVehicleList } from '../hooks/useVehicleList';

export function VehicleList() {
  const { data, isLoading, error } = useVehicleList();
  
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  
  return (
    <div>
      {data?.map(vehicle => (
        <div key={vehicle.id}>{vehicle.model}</div>
      ))}
    </div>
  );
}
```

## 🎨 UI Development

### Using Material-UI Components
```typescript
import { Button, TextField, Card } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export function MyComponent() {
  return (
    <Card>
      <TextField label="名前" fullWidth />
      <Button 
        variant="contained" 
        startIcon={<AddIcon />}
      >
        追加
      </Button>
    </Card>
  );
}
```

### Using MUI sx prop for styling
```typescript
<Box 
  sx={{ 
    p: 2,                    // padding: 16px
    mb: 3,                   // marginBottom: 24px
    bgcolor: 'primary.main', // theme color
    borderRadius: 1,         // 4px
  }}
>
  Content
</Box>
```

### Using Tailwind (when needed)
```typescript
<div className="flex items-center gap-4 p-4">
  <span className="text-lg font-bold">Title</span>
</div>
```

**Best Practice:** Use MUI for components, Tailwind for quick utilities.

## 📝 Form Handling

### Create Form Schema
```typescript
// src/app/my-page/formSchema.ts
import { z } from 'zod';

export const myFormSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  age: z.number().min(0).max(150),
});

export type MyFormData = z.infer<typeof myFormSchema>;
```

### Use in Component
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { myFormSchema, MyFormData } from './formSchema';

export function MyForm() {
  const { control, handleSubmit } = useForm<MyFormData>({
    resolver: zodResolver(myFormSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0,
    },
  });

  const onSubmit = (data: MyFormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="名前"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
          />
        )}
      />
      <Button type="submit" variant="contained">
        送信
      </Button>
    </form>
  );
}
```

## 🔄 Data Mutations (Create, Update, Delete)

```typescript
// hooks/useCreateVehicle.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateVehicleInput) => {
      const api = getVehicleAPI();
      return api.createVehicle(data);
    },
    onSuccess: () => {
      // Invalidate and refetch vehicle list
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// In component
const createMutation = useCreateVehicle();

const handleCreate = () => {
  createMutation.mutate({ 
    model: 'Toyota Camry' 
  });
};
```

## 🐛 Debugging Tips

### React Query DevTools
The DevTools are already enabled in development mode. Look for the floating icon in the bottom-right corner.

**Shows:**
- All queries and their states
- Cache contents
- Query dependencies
- Refetch status

### Common Issues

#### "Module not found" Error
```bash
# Make sure path alias is used correctly
# ✅ Correct
import { Button } from '@mui/material';
import { MyComponent } from '@/components/MyComponent';

# ❌ Wrong
import { MyComponent } from '../../components/MyComponent';
```

#### React Query Not Refetching
```typescript
// Check queryKey - must be exact
useQuery({
  queryKey: ['vehicles', filters], // Include all dependencies
  // ...
});
```

#### TypeScript Errors
```bash
# Run type check
npm run lint

# Check tsconfig.json paths are correct
```

## 📦 Adding New Dependencies

```bash
# Production dependency
npm install [package-name]

# Dev dependency
npm install -D [package-name]
```

**Common packages you might need:**
```bash
# Date manipulation
npm install date-fns

# Icons
npm install @mui/icons-material

# HTTP client (already installed)
npm install axios

# State management (already installed)
npm install zustand
```

## 🧪 Testing (TO BE ADDED)

```bash
# Will be added in future
npm run test           # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## 📱 Responsive Design

### MUI Breakpoints
```typescript
<Box 
  sx={{
    width: {
      xs: '100%',      // 0-600px
      sm: '600px',     // 600-900px
      md: '900px',     // 900-1200px
      lg: '1200px',    // 1200-1536px
      xl: '1536px',    // 1536px+
    }
  }}
/>
```

### Mobile-First Approach
```typescript
// Start with mobile, add larger screens
<Box sx={{ 
  flexDirection: 'column',           // Mobile: stack vertically
  md: { flexDirection: 'row' }       // Desktop: side by side
}} />
```

## 🚨 Important Rules

### ✅ DO
- Use TypeScript interfaces for all data structures
- Create custom hooks for all API calls
- Use React Query for server state
- Add loading and error states
- Use MUI components first, Tailwind for utilities
- Follow the existing folder structure
- Use absolute imports with `@/` prefix
- Add JSDoc comments for complex logic

### ❌ DON'T
- Call APIs directly from components
- Use `any` type
- Put business logic in components
- Forget error handling
- Mix styling approaches (choose MUI or Tailwind per component)
- Create deeply nested component trees
- Use `console.log` in production code
- Commit sensitive data or API keys

## 🔗 Useful Links

### Documentation
- **Next.js:** https://nextjs.org/docs
- **React Query:** https://tanstack.com/query/latest/docs
- **Material-UI:** https://mui.com/material-ui/
- **React Hook Form:** https://react-hook-form.com/
- **Zod:** https://zod.dev/

### Internal
- **Repository:** https://github.com/Sparr0wHawk/crsf-web-nextjs
- **Project Overview:** See PROJECT_OVERVIEW.md
- **API Architecture:** See API_ARCHITECTURE_DIAGRAM.md

## 💡 Tips for Success

1. **Start with the mock API** - Get the UI working, then integrate real API
2. **Use React Query DevTools** - Makes debugging data fetching much easier
3. **Follow the existing patterns** - Look at operation-table feature as reference
4. **Keep components small** - Break down complex UIs
5. **Type everything** - TypeScript will save you time in the long run
6. **Test in browser DevTools** - Use React DevTools and Network tab

## 🆘 Getting Help

1. Check existing code in `src/features/operation-table/` for examples
2. Search project documentation (PROJECT_OVERVIEW.md)
3. Check package documentation
4. Ask team members
5. Create GitHub issue for bugs

## 🎯 Quick Reference: File Patterns

| What | Where | Example |
|------|-------|---------|
| New page | `src/app/[name]/page.tsx` | `src/app/reports/page.tsx` |
| New feature | `src/features/[name]/` | `src/features/reporting/` |
| Shared component | `src/components/` | `src/components/DatePicker.tsx` |
| API contract | `src/lib/api/contracts/` | `src/lib/api/contracts/report.contract.ts` |
| Mock API | `src/lib/api/implementations/mock*.ts` | `src/lib/api/implementations/mockReportApi.ts` |
| Custom hook | `src/features/[feature]/hooks/` | `src/features/reporting/hooks/useReports.ts` |
| Types | Feature folder or `contracts/` | Types with API contracts |
| Theme | `src/lib/theme/` | Don't modify without team discussion |

---

**Happy Coding! 🚀**
