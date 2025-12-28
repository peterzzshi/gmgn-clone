# Frontend Architecture Guide

Complete guide for the GMGN Clone frontend architecture, patterns, and best practices.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Import Patterns](#import-patterns)
3. [SCSS Architecture](#scss-architecture)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [TypeScript Patterns](#typescript-patterns)
7. [Quick Reference](#quick-reference)

---

## Project Structure

```
frontend/src/
├── types/
│   └── index.ts                    # All TypeScript type definitions
├── services/                       # API client layer
│   ├── index.ts                   # Barrel export (OK for services)
│   ├── api.ts                     # Axios configuration
│   ├── authService.ts             # Auth endpoints
│   ├── tokenService.ts            # Token/market endpoints
│   ├── chartService.ts            # Chart data endpoints
│   ├── walletService.ts           # Wallet endpoints
│   ├── traderService.ts           # Trader endpoints
│   └── tradingService.ts          # Trading endpoints
├── store/                          # Zustand state management
│   ├── authStore.ts               # Auth state + actions
│   ├── marketStore.ts             # Market data state
│   └── tradingStore.ts            # Trading state
├── styles/                         # Shared SCSS
│   ├── global.scss                # Global styles + CSS variables
│   ├── _variables.scss            # SCSS variables
│   ├── _mixins.scss               # Reusable mixins
│   └── _utilities.scss            # Utility classes
├── components/
│   └── [Component]/
│       ├── Component.tsx          # Component logic
│       └── Component.module.scss  # Component-scoped styles
└── pages/
    └── [Page]/
        ├── PageName.tsx           # Page component
        └── PageName.module.scss   # Page-scoped styles
```

### Key Principles

✅ **DO:**
- Keep component `.module.scss` files for component-specific styles
- Use shared mixins/utilities for common patterns
- Import components directly (no barrel exports for components)
- Use services for all API calls
- Use stores for shared state

❌ **DON'T:**
- Create `index.ts` barrel exports for components/pages
- Duplicate data between frontend/backend
- Make API calls directly from components
- Put all styles in one giant CSS file

---

## Import Patterns

### ✅ Correct Patterns

```typescript
// Components - always direct imports
import { HomePage } from '@/pages/Home/HomePage';
import { MainLayout } from '@/components/layout/MainLayout/MainLayout';
import { Button } from '@/components/ui/Button/Button';

// Services - barrel export is OK
import { tokenService, authService } from '@/services';

// Stores - direct imports
import { useMarketStore } from '@/store/marketStore';
import { useAuthStore } from '@/store/authStore';

// Types - single barrel export
import type { Token, User, TokenWithMarket } from '@/types';

// Utils - direct imports
import { formatPrice, formatPercent } from '@/utils/format';
```

### ❌ Patterns to Avoid

```typescript
// Don't use barrel exports for components
import { HomePage } from '@/pages'; // ❌ No pages/index.ts

// Don't import mock data (it doesn't exist anymore)
import { MOCK_TOKENS } from '@/data/tokens'; // ❌ Removed

// Don't skip the service layer
const response = await axios.get('/api/tokens'); // ❌ Use services
```

---

## SCSS Architecture

### Philosophy: Hybrid Approach

We use **component-scoped modules** + **shared utilities** for the best of both worlds.

### Why Keep Individual `.module.scss` Files?

**Example: BottomNav has component-specific styles**
```scss
.bottomNav {
  position: fixed;              // Specific positioning
  bottom: 0;
  height: calc(60px + env(safe-area-inset-bottom, 0)); // Mobile safe area
  
  @media (min-width: 768px) {   // Component-specific breakpoint
    display: none;
  }
}
```

These styles are **unique to BottomNav** and shouldn't be global!

### When to Use What

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Component Module** | Component-specific styles | Complex layouts, unique positioning |
| **Shared Mixins** | Repeated patterns (3+ components) | Cards, buttons, scrollbars |
| **Utility Classes** | Quick one-off styling | Spacing, flex layouts |
| **CSS Variables** | Theme values | Colors, spacing, transitions |

### Structure

```
src/styles/
├── global.scss       # Import point + CSS variables + resets
├── _variables.scss   # SCSS variables (breakpoints, etc.)
├── _mixins.scss      # Reusable SCSS mixins
└── _utilities.scss   # Utility classes
```

### Using Mixins in Component SCSS

```scss
// Button.module.scss
@import '@/styles/mixins';

.button {
  @include button-reset;        // Reusable mixin
  @include focus-visible;       // Keyboard accessibility
  
  // Component-specific styles
  padding: var(--spacing-md);
  background: var(--color-primary);
}

.scrollable {
  @include scrollable;          // Custom scrollbar
}
```

### Available Mixins

```scss
// Layout
@include flex-center;
@include flex-between;
@include flex-column;

// Components
@include card;
@include card-hover;
@include button-reset;
@include scrollable;
@include skeleton;

// Text
@include truncate;
@include line-clamp(2);

// Responsive
@include mobile { /* styles */ }
@include tablet { /* styles */ }
@include desktop { /* styles */ }
```

### Utility Classes (Use in JSX)

```tsx
// Quick styling without creating SCSS
<div className="flex-between gap-md p-lg">
  <span className="text-secondary text-sm">Label</span>
  <span className="text-primary font-semibold">Value</span>
</div>
```

### Migration Strategy

**Don't refactor everything!** Only update when editing files:

```scss
// Before
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

// After
@import '@/styles/mixins';
.card { @include card; }  // Cleaner!
```

---

## State Management (Zustand)

### Purpose

Stores manage **client-side state**, NOT data storage:
- Coordinate API calls
- Track loading/error states
- Provide reactive state to components
- Handle optimistic UI updates

### Store Pattern

```typescript
import { create } from 'zustand';
import { myService } from '@/services';

interface MyState {
  items: MyType[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
}

export const useMyStore = create<MyState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchItems: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await myService.getItems(); // API call
      set({ items, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed' 
      });
    }
  },
}));
```

### Usage in Components

```typescript
const MyComponent = () => {
  const { items, isLoading, fetchItems } = useMyStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (isLoading) return <div>Loading...</div>;
  return <div>{/* render items */}</div>;
};
```

---

## API Integration

### Architecture

```
Component → Store → Service → Backend API
```

**Flow:**
1. Component calls store method
2. Store calls service function
3. Service makes HTTP request
4. Backend returns data
5. Service returns typed data
6. Store updates state
7. Component re-renders

### Service Pattern

```typescript
// src/services/myService.ts
import { api } from './api';
import type { MyType } from '@/types';

export const myService = {
  getAll: async (): Promise<MyType[]> => {
    const response = await api.get('/my-endpoint');
    return response.data.data;
  },

  getById: async (id: string): Promise<MyType> => {
    const response = await api.get(`/my-endpoint/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<MyType>): Promise<MyType> => {
    const response = await api.post('/my-endpoint', data);
    return response.data.data;
  },
};
```

### Environment Configuration

```env
# .env
VITE_API_URL=http://localhost:4000/api
```

The API service automatically uses this URL.

### Authentication

```typescript
// Token stored in localStorage automatically
await authStore.login({ email, password });

// All subsequent requests include Authorization header
const data = await tokenService.getAllTokens();
// ^ Header added by axios interceptor

// Logout clears token
await authStore.logout();
```

---

## TypeScript Patterns

### Component Props

```typescript
interface MyComponentProps {
  readonly title: string;
  readonly count: number;
  readonly onAction?: () => void;
}

export const MyComponent = ({ title, count, onAction }: MyComponentProps) => {
  return <div>{title}: {count}</div>;
};
```

### Async Functions

```typescript
const fetchData = async () => {
  try {
    setIsLoading(true);
    const data = await service.getData();
    setData(data);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### Type Imports

```typescript
// Always use 'type' keyword for type-only imports
import type { Token, User } from '@/types';
import type { ComponentProps } from 'react';
```

---

## Quick Reference

### File Naming

- Components: `PascalCase` → `HomePage.tsx`, `TokenCard.tsx`
- Services: `camelCase + Service` → `tokenService.ts`
- Stores: `camelCase + Store` → `marketStore.ts`
- Styles: `Component.module.scss` → `HomePage.module.scss`

### Common Patterns

#### Loading States
```typescript
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState<MyType[]>([]);

useEffect(() => {
  const fetch = async () => {
    try {
      setIsLoading(true);
      const result = await service.getData();
      setData(result);
    } finally {
      setIsLoading(false);
    }
  };
  fetch();
}, []);

if (isLoading) return <div className="loading">Loading...</div>;
```

#### Error Handling
```typescript
try {
  await service.action();
} catch (error) {
  const message = error instanceof Error 
    ? error.message 
    : 'Unknown error';
  console.error(message);
}
```

#### Responsive Design
```scss
.component {
  @include mobile {
    padding: var(--spacing-sm);
  }
  
  @include desktop {
    padding: var(--spacing-lg);
  }
}
```

---

## Summary

### Architecture Principles

1. **Component Isolation** - `.module.scss` files keep styles scoped
2. **Code Reuse** - Shared mixins/utilities for common patterns
3. **Single Source of Truth** - Backend owns all data
4. **Type Safety** - Full TypeScript coverage
5. **Clear Separation** - Services, stores, and components have distinct roles

### Benefits

✅ No data duplication
✅ Component styles stay isolated  
✅ Common patterns are reusable
✅ Type-safe end-to-end
✅ Easy to understand and maintain
✅ Fast development with utilities
✅ Clean imports (no barrel exports for components)

### Getting Started

1. **New Component:** Create `.tsx` + `.module.scss` files
2. **Use Mixins:** `@import '@/styles/mixins'` when needed
3. **Utility Classes:** Use directly in JSX for quick styling
4. **API Calls:** Always go through services
5. **State:** Use stores for shared state

---

For more details, see:
- `SCSS_ARCHITECTURE.md` - Deep dive into styling
- `TYPESCRIPT_FIXES.md` - Common TypeScript issues
- `REFACTORING_COMPLETE.md` - What changed and why

