# Bitcorp ERP - Copilot Instructions

## Architecture Overview

This is a **full-stack construction equipment management ERP** with FastAPI backend, Next.js frontend, and mobile-first operator interface. The system recently migrated from axios to **SWR for all API calls** with comprehensive caching strategies.

### Tech Stack

- **Backend**: FastAPI 0.104.1 + SQLAlchemy + PostgreSQL + Redis
- **Frontend**: Next.js 15.x + TypeScript + Material-UI + SWR
- **Dev Environment**: direnv + pyenv (Python 3.11.5) + Docker services

## Critical Development Patterns

### 1. SWR-First API Integration

**All API calls use SWR**, not fetch/axios. Follow this pattern:

```typescript
// Use factory functions for cache keys
export const equipmentKeys = {
  all: ['equipment'] as const,
  list: (params: EquipmentSearchParams) =>
    [...equipmentKeys.all, 'list', params] as const,
};

// Hooks follow useX pattern with typed fetchers
export function useEquipmentList(params: EquipmentSearchParams) {
  return useSWR(equipmentKeys.list(params), () =>
    equipmentFetcher<EquipmentListResponse>('/equipment', params)
  );
}
```

**Location**: Frontend SWR patterns in `src/hooks/useEquipment.ts`, `src/lib/swr-fetcher.ts`

### 2. Backend API Structure

Routes follow **modular pattern** with separate routers per domain:

```python
# Each domain has its own router in app/api/v1/{domain}/router.py
api_router.include_router(equipment_router, prefix="/equipment", tags=["equipment"])
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
```

**Critical**: Routes are included in `app/api/v1/api.py` and main app includes with `settings.API_V1_STR` prefix.

### 3. Environment Management

**Uses direnv + .envrc for auto-activation**:

- Environment auto-loads on `cd bitcorp`
- Python 3.11.5 via pyenv
- CORS settings hardcoded in config.py (not env vars) due to JSON parsing issues

### 4. Mobile-First Operator Interface

**Operator module** (`/operator/*`) is production-ready with:

- Mobile-optimized Material-UI components
- Daily equipment report forms
- Test credentials: `john.operator` / `operator123`

## Essential Commands

### Development Workflow

```bash
# Start everything (after cd bitcorp triggers direnv)
npm run dev  # Starts both backend:8000 + frontend:3000

# Individual services
./scripts/dev.sh backend    # FastAPI only
./scripts/dev.sh frontend   # Next.js only
./scripts/dev.sh docker     # PostgreSQL + Redis

# Testing
cd frontend && npm run test          # Jest unit tests
cd frontend && npx playwright test   # E2E tests
```

### Cross-Platform Support

- **macOS/Linux**: Use `./scripts/dev.sh`
- **Windows**: Use `.\scripts\dev.ps1` (PowerShell) or `dev.bat`

## Data Flow Patterns

### Authentication

- JWT tokens stored in localStorage
- SWR fetcher includes auto-refresh logic
- Operator routes protected but user-friendly

### Equipment Management

- Full CRUD via SWR hooks
- Optimistic updates with cache invalidation
- Pagination + filtering through URL params

### Database Models

- SQLAlchemy with relationship loading
- Base model pattern in `app/models/base.py`
- Foreign key relationships properly defined

## Common Gotchas

1. **CORS Issues**: Don't add environment variables for CORS*ALLOW*\* - they're hardcoded in config.py
2. **SWR Cache**: Always use key factories, never inline cache keys
3. **Route Conflicts**: Include API routers BEFORE catch-all handlers in main.py
4. **Windows Dev**: Environment variables need JSON array format: `["value1", "value2"]`

## Key File Locations

- **API Routes**: `backend/app/api/v1/{domain}/router.py`
- **SWR Hooks**: `frontend/src/hooks/use{Domain}.ts`
- **Types**: `frontend/src/types/{domain}.ts`
- **Dev Scripts**: `scripts/dev.{sh,ps1,bat}`
- **Operator Module**: `frontend/src/app/operator/`

## Testing Strategy

- **Unit**: Jest + React Testing Library for components
- **E2E**: Playwright for user workflows
- **API**: Direct FastAPI testing via pytest (pending implementation)

When working on this codebase, prioritize SWR patterns, maintain the mobile-first operator experience, and use the established dev scripts for environment management.
