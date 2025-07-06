# Performance Optimization Guide

## Overview

This guide outlines performance optimization strategies for the Bitcorp ERP system, covering backend, frontend, database, and infrastructure optimizations based on best practices from "Designing Data-Intensive Applications" and "Refactoring UI".

## Backend Performance

### Database Optimization

#### Query Optimization

```python
# backend/app/services/equipment.py

from sqlalchemy import select, func, index
from sqlalchemy.orm import selectinload, joinedload

class OptimizedEquipmentService:
    
    def get_equipment_with_maintenance(self, user_id: str):
        """Optimized query with proper joins and indexing"""
        
        # Use selectinload to avoid N+1 queries
        stmt = (
            select(Equipment)
            .options(
                selectinload(Equipment.maintenance_records),
                selectinload(Equipment.assigned_operator)
            )
            .where(Equipment.user_id == user_id)
            .where(Equipment.deleted_at.is_(None))
        )
        
        return self.db.execute(stmt).scalars().all()
    
    def get_equipment_summary(self):
        """Aggregated query for dashboard"""
        
        # Single query for multiple aggregations
        stmt = (
            select(
                func.count(Equipment.id).label('total_equipment'),
                func.count(Equipment.id).filter(
                    Equipment.status == 'active'
                ).label('active_equipment'),
                func.avg(Equipment.cost).label('average_cost'),
                func.sum(Equipment.cost).label('total_value')
            )
            .where(Equipment.deleted_at.is_(None))
        )
        
        return self.db.execute(stmt).first()
```

#### Database Indexing Strategy

```sql
-- Database indexes for optimal performance

-- Composite index for equipment queries
CREATE INDEX idx_equipment_user_status 
ON equipment (user_id, status, deleted_at);

-- Index for date range queries
CREATE INDEX idx_equipment_created_at 
ON equipment (created_at DESC);

-- Partial index for active equipment
CREATE INDEX idx_equipment_active 
ON equipment (id, user_id) 
WHERE deleted_at IS NULL AND status = 'active';

-- Text search index
CREATE INDEX idx_equipment_search 
ON equipment USING gin(to_tsvector('english', name || ' ' || description));

-- Maintenance records index
CREATE INDEX idx_maintenance_equipment_date 
ON maintenance_records (equipment_id, maintenance_date DESC);
```

### Caching Strategy

#### Redis Caching Implementation

```python
# backend/app/core/cache.py

import json
import pickle
from typing import Any, Optional
from datetime import timedelta
from functools import wraps

class CacheManager:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour
    
    async def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        try:
            data = await self.redis.get(key)
            if data:
                return pickle.loads(data)
        except Exception as e:
            logger.warning(f"Cache get error: {e}")
        return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ):
        """Set cached value"""
        try:
            ttl = ttl or self.default_ttl
            serialized = pickle.dumps(value)
            await self.redis.setex(key, ttl, serialized)
        except Exception as e:
            logger.warning(f"Cache set error: {e}")
    
    async def delete(self, pattern: str):
        """Delete cached values by pattern"""
        keys = await self.redis.keys(pattern)
        if keys:
            await self.redis.delete(*keys)

def cache_result(ttl: int = 3600, key_prefix: str = ""):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key
            cache_key = f"{key_prefix}:{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = await cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

# Usage example
@cache_result(ttl=1800, key_prefix="equipment")
async def get_equipment_statistics(user_id: str):
    """Cached equipment statistics"""
    return await EquipmentService.get_equipment_summary(user_id)
```

### Connection Pooling

```python
# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# Optimized database connection pool
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,          # Number of persistent connections
    max_overflow=30,       # Additional connections when needed
    pool_pre_ping=True,    # Validate connections before use
    pool_recycle=3600,     # Recycle connections every hour
    echo=False             # Disable SQL logging in production
)

# Connection configuration
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Keep objects accessible after commit
)
```

### Async Operations

```python
# backend/app/services/async_operations.py

import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import List

class AsyncOperationService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=10)
    
    async def process_equipment_batch(self, equipment_ids: List[str]):
        """Process multiple equipment records concurrently"""
        
        # Create tasks for concurrent processing
        tasks = [
            self.process_single_equipment(equipment_id)
            for equipment_id in equipment_ids
        ]
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle results and exceptions
        successful_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error processing equipment {equipment_ids[i]}: {result}")
            else:
                successful_results.append(result)
        
        return successful_results
    
    async def generate_reports_async(self, report_configs: List[dict]):
        """Generate multiple reports asynchronously"""
        
        # Use thread pool for CPU-intensive tasks
        loop = asyncio.get_event_loop()
        
        tasks = [
            loop.run_in_executor(
                self.executor,
                self.generate_single_report,
                config
            )
            for config in report_configs
        ]
        
        return await asyncio.gather(*tasks)
```

## Frontend Performance

### React Optimization

#### Component Optimization

```typescript
// frontend/src/components/EquipmentList.tsx

import React, { memo, useMemo, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { debounce } from 'lodash'

interface EquipmentListProps {
  equipment: Equipment[]
  onSelect: (equipment: Equipment) => void
  searchTerm: string
}

// Memoized list item component
const EquipmentListItem = memo(({ 
  index, 
  style, 
  data 
}: {
  index: number
  style: React.CSSProperties
  data: { items: Equipment[], onSelect: (equipment: Equipment) => void }
}) => {
  const { items, onSelect } = data
  const equipment = items[index]
  
  const handleClick = useCallback(() => {
    onSelect(equipment)
  }, [equipment, onSelect])
  
  return (
    <div style={style} onClick={handleClick}>
      <Card sx={{ mb: 1, cursor: 'pointer' }}>
        <CardContent>
          <Typography variant="h6">{equipment.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {equipment.serialNumber}
          </Typography>
          <Chip 
            label={equipment.status} 
            color={equipment.status === 'active' ? 'success' : 'default'}
            size="small"
          />
        </CardContent>
      </Card>
    </div>
  )
})

export const EquipmentList = memo<EquipmentListProps>(({ 
  equipment, 
  onSelect, 
  searchTerm 
}) => {
  // Memoized filtered equipment
  const filteredEquipment = useMemo(() => {
    if (!searchTerm) return equipment
    
    const lowercaseSearch = searchTerm.toLowerCase()
    return equipment.filter(item =>
      item.name.toLowerCase().includes(lowercaseSearch) ||
      item.serialNumber.toLowerCase().includes(lowercaseSearch)
    )
  }, [equipment, searchTerm])
  
  // Memoized data for virtual list
  const listData = useMemo(() => ({
    items: filteredEquipment,
    onSelect
  }), [filteredEquipment, onSelect])
  
  if (filteredEquipment.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No equipment found
        </Typography>
      </Box>
    )
  }
  
  return (
    <List
      height={400}
      itemCount={filteredEquipment.length}
      itemSize={120}
      itemData={listData}
    >
      {EquipmentListItem}
    </List>
  )
})
```

#### State Management Optimization

```typescript
// frontend/src/stores/equipment.ts

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'

interface EquipmentState {
  equipment: Equipment[]
  loading: boolean
  error: string | null
  selectedEquipment: Equipment | null
  searchTerm: string
  filters: EquipmentFilters
}

interface EquipmentActions {
  setEquipment: (equipment: Equipment[]) => void
  addEquipment: (equipment: Equipment) => void
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  removeEquipment: (id: string) => void
  setSelectedEquipment: (equipment: Equipment | null) => void
  setSearchTerm: (term: string) => void
  setFilters: (filters: Partial<EquipmentFilters>) => void
  clearError: () => void
}

export const useEquipmentStore = create<EquipmentState & EquipmentActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      equipment: [],
      loading: false,
      error: null,
      selectedEquipment: null,
      searchTerm: '',
      filters: {
        status: 'all',
        category: 'all',
        dateRange: null
      },
      
      // Actions
      setEquipment: (equipment) => set((state) => {
        state.equipment = equipment
        state.loading = false
        state.error = null
      }),
      
      addEquipment: (equipment) => set((state) => {
        state.equipment.push(equipment)
      }),
      
      updateEquipment: (id, updates) => set((state) => {
        const index = state.equipment.findIndex(e => e.id === id)
        if (index !== -1) {
          Object.assign(state.equipment[index], updates)
        }
      }),
      
      removeEquipment: (id) => set((state) => {
        state.equipment = state.equipment.filter(e => e.id !== id)
      }),
      
      setSelectedEquipment: (equipment) => set((state) => {
        state.selectedEquipment = equipment
      }),
      
      setSearchTerm: (term) => set((state) => {
        state.searchTerm = term
      }),
      
      setFilters: (filters) => set((state) => {
        Object.assign(state.filters, filters)
      }),
      
      clearError: () => set((state) => {
        state.error = null
      })
    }))
  )
)

// Selectors for computed values
export const useFilteredEquipment = () => {
  return useEquipmentStore((state) => {
    let filtered = state.equipment
    
    // Apply search term
    if (state.searchTerm) {
      const search = state.searchTerm.toLowerCase()
      filtered = filtered.filter(eq =>
        eq.name.toLowerCase().includes(search) ||
        eq.serialNumber.toLowerCase().includes(search)
      )
    }
    
    // Apply filters
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(eq => eq.status === state.filters.status)
    }
    
    if (state.filters.category !== 'all') {
      filtered = filtered.filter(eq => eq.category === state.filters.category)
    }
    
    return filtered
  })
}
```

### Code Splitting and Lazy Loading

```typescript
// frontend/src/App.tsx

import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CircularProgress, Box } from '@mui/material'

// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const EquipmentList = React.lazy(() => import('./pages/EquipmentList'))
const EquipmentDetail = React.lazy(() => import('./pages/EquipmentDetail'))
const Reports = React.lazy(() => import('./pages/Reports'))

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <CircularProgress />
  </Box>
)

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/equipment" element={<EquipmentList />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Suspense>
    </Router>
  )
}
```

### API Optimization

#### Query Optimization with React Query

```typescript
// frontend/src/hooks/useEquipment.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentAPI } from '../services/api'

export const useEquipment = (filters?: EquipmentFilters) => {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentAPI.getEquipment(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3
  })
}

export const useEquipmentDetail = (id: string) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentAPI.getEquipmentById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id
  })
}

export const useCreateEquipment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: equipmentAPI.createEquipment,
    onSuccess: (newEquipment) => {
      // Update cache optimistically
      queryClient.setQueryData(['equipment'], (old: Equipment[] | undefined) => {
        return old ? [...old, newEquipment] : [newEquipment]
      })
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
    }
  })
}

// Prefetch related data
export const usePrefetchEquipmentDetail = () => {
  const queryClient = useQueryClient()
  
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['equipment', id],
      queryFn: () => equipmentAPI.getEquipmentById(id),
      staleTime: 10 * 60 * 1000
    })
  }
}
```

## Database Performance

### Connection Optimization

```python
# backend/app/core/database.py

from sqlalchemy import event
from sqlalchemy.engine import Engine
import time

# Database performance monitoring
@event.listens_for(Engine, "before_cursor_execute")
def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    context._query_start_time = time.time()

@event.listens_for(Engine, "after_cursor_execute")
def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - context._query_start_time
    if total > 0.1:  # Log slow queries (>100ms)
        logger.warning(f"Slow query: {total:.3f}s - {statement[:100]}...")
```

### Query Optimization Strategies

```python
# backend/app/services/optimized_queries.py

from sqlalchemy import select, func, case, exists
from sqlalchemy.orm import selectinload, contains_eager

class OptimizedQueries:
    
    @staticmethod
    def get_equipment_dashboard_data(user_id: str):
        """Single query for dashboard data"""
        
        stmt = select(
            func.count(Equipment.id).label('total_equipment'),
            func.sum(
                case(
                    (Equipment.status == 'active', 1),
                    else_=0
                )
            ).label('active_equipment'),
            func.sum(
                case(
                    (Equipment.status == 'maintenance', 1),
                    else_=0
                )
            ).label('maintenance_equipment'),
            func.avg(Equipment.cost).label('average_cost'),
            func.sum(Equipment.cost).label('total_value')
        ).where(
            Equipment.user_id == user_id,
            Equipment.deleted_at.is_(None)
        )
        
        return stmt
    
    @staticmethod
    def get_equipment_with_latest_maintenance(user_id: str):
        """Efficient query for equipment with latest maintenance"""
        
        # Subquery for latest maintenance per equipment
        latest_maintenance = (
            select(
                MaintenanceRecord.equipment_id,
                func.max(MaintenanceRecord.date).label('latest_date')
            )
            .group_by(MaintenanceRecord.equipment_id)
            .subquery()
        )
        
        # Main query with join
        stmt = (
            select(Equipment, MaintenanceRecord)
            .join(
                latest_maintenance,
                Equipment.id == latest_maintenance.c.equipment_id,
                isouter=True
            )
            .join(
                MaintenanceRecord,
                (MaintenanceRecord.equipment_id == Equipment.id) &
                (MaintenanceRecord.date == latest_maintenance.c.latest_date),
                isouter=True
            )
            .where(Equipment.user_id == user_id)
            .options(contains_eager(Equipment.maintenance_records))
        )
        
        return stmt
```

## Infrastructure Optimization

### Load Balancing Configuration

```nginx
# nginx.conf for load balancing

upstream backend_servers {
    least_conn;
    server backend1:8000 weight=3 max_fails=3 fail_timeout=30s;
    server backend2:8000 weight=3 max_fails=3 fail_timeout=30s;
    server backend3:8000 weight=2 max_fails=3 fail_timeout=30s;
}

upstream frontend_servers {
    server frontend1:3000 weight=1;
    server frontend2:3000 weight=1;
}

server {
    listen 80;
    server_name bitcorp.example.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bitcorp.example.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/bitcorp.crt;
    ssl_certificate_key /etc/ssl/private/bitcorp.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # Frontend static files
    location / {
        proxy_pass http://frontend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # Increase timeouts for long-running operations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Rate limiting zones
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
}
```

## Monitoring and Profiling

### Performance Monitoring

```python
# backend/app/middleware/performance.py

import time
import psutil
from fastapi import Request, Response
from prometheus_client import Counter, Histogram, generate_latest

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
MEMORY_USAGE = Histogram('memory_usage_bytes', 'Memory usage in bytes')

async def performance_middleware(request: Request, call_next):
    start_time = time.time()
    
    # Get memory usage before request
    memory_before = psutil.Process().memory_info().rss
    
    # Process request
    response = await call_next(request)
    
    # Calculate metrics
    duration = time.time() - start_time
    memory_after = psutil.Process().memory_info().rss
    memory_used = memory_after - memory_before
    
    # Record metrics
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_DURATION.observe(duration)
    MEMORY_USAGE.observe(memory_used)
    
    # Add performance headers
    response.headers["X-Response-Time"] = str(duration)
    response.headers["X-Memory-Used"] = str(memory_used)
    
    # Log slow requests
    if duration > 1.0:  # Log requests taking more than 1 second
        logger.warning(
            f"Slow request: {request.method} {request.url.path} "
            f"took {duration:.3f}s and used {memory_used} bytes"
        )
    
    return response

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### Database Query Analysis

```python
# backend/app/utils/query_analyzer.py

import time
from contextlib import contextmanager
from sqlalchemy import event

class QueryAnalyzer:
    def __init__(self):
        self.queries = []
        self.total_time = 0
    
    @contextmanager
    def track_queries(self):
        """Context manager to track database queries"""
        self.queries.clear()
        self.total_time = 0
        
        @event.listens_for(engine, "before_cursor_execute")
        def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            context._query_start_time = time.time()
        
        @event.listens_for(engine, "after_cursor_execute")  
        def receive_after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            total = time.time() - context._query_start_time
            self.queries.append({
                'statement': statement,
                'parameters': parameters,
                'duration': total
            })
            self.total_time += total
        
        try:
            yield self
        finally:
            event.remove(engine, "before_cursor_execute", receive_before_cursor_execute)
            event.remove(engine, "after_cursor_execute", receive_after_cursor_execute)
    
    def get_analysis(self):
        """Get query analysis report"""
        if not self.queries:
            return {"message": "No queries executed"}
        
        slow_queries = [q for q in self.queries if q['duration'] > 0.1]
        
        return {
            "total_queries": len(self.queries),
            "total_time": self.total_time,
            "average_time": self.total_time / len(self.queries),
            "slow_queries": len(slow_queries),
            "queries": self.queries
        }

# Usage in tests or debugging
async def test_endpoint_performance():
    analyzer = QueryAnalyzer()
    
    with analyzer.track_queries():
        # Execute your endpoint or service method
        result = await equipment_service.get_equipment_list()
    
    analysis = analyzer.get_analysis()
    print(f"Executed {analysis['total_queries']} queries in {analysis['total_time']:.3f}s")
    
    if analysis['slow_queries'] > 0:
        print(f"Warning: {analysis['slow_queries']} slow queries detected")
```

This comprehensive performance optimization guide provides strategies for optimizing every layer of the Bitcorp ERP system, ensuring optimal performance under various load conditions while maintaining code quality and maintainability.
