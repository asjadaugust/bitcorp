# Frontend Architecture Guidelines for Bitcorp ERP

> Based on principles from "React Design Patterns and Best Practices" by Michele Bertoli, "Building Large Scale Web Apps" by Addy Osmani, "Refactoring UI" by Steve Schoger & Adam Wathan, and modern React patterns

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Component Design Patterns](#component-design-patterns)
- [State Management](#state-management)
- [UI/UX Design System](#uiux-design-system)
- [Performance Optimization](#performance-optimization)
- [Testing Strategy](#testing-strategy)
- [Code Organization](#code-organization)
- [TypeScript Patterns](#typescript-patterns)

## Architecture Overview

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 13+ app directory
│   │   ├── (auth)/            # Route groups
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/
│   │   ├── equipment/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (MUI based)
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Data visualization
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # Helper functions
│   │   └── validations.ts   # Form validation schemas
│   ├── stores/              # State management (Zustand)
│   ├── types/               # TypeScript type definitions
│   └── styles/              # Global styles and theme
├── public/                  # Static assets
└── docs/                   # Component documentation
```

### Layered Architecture

```typescript
// 1. Presentation Layer (Components)
// ↓
// 2. State Management Layer (Stores/Context)
// ↓
// 3. Business Logic Layer (Services/Hooks)
// ↓
// 4. Data Access Layer (API Client)
// ↓
// 5. External APIs/Services
```

## Component Design Patterns

### 1. Compound Component Pattern

Perfect for complex UI components that work together.

```typescript
// EquipmentCard compound component
interface EquipmentCardContextValue {
  equipment: Equipment;
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const EquipmentCardContext = createContext<EquipmentCardContextValue | null>(null);

const useEquipmentCard = () => {
  const context = useContext(EquipmentCardContext);
  if (!context) {
    throw new Error('useEquipmentCard must be used within EquipmentCard');
  }
  return context;
};

// Main component
const EquipmentCard: React.FC<{ equipment: Equipment; children: React.ReactNode }> & {
  Header: typeof EquipmentCardHeader;
  Body: typeof EquipmentCardBody;
  Actions: typeof EquipmentCardActions;
} = ({ equipment, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const value = {
    equipment,
    isExpanded,
    toggleExpanded: () => setIsExpanded(!isExpanded)
  };

  return (
    <EquipmentCardContext.Provider value={value}>
      <Card elevation={2} sx={{ mb: 2 }}>
        {children}
      </Card>
    </EquipmentCardContext.Provider>
  );
};

// Sub-components
const EquipmentCardHeader: React.FC = () => {
  const { equipment, isExpanded, toggleExpanded } = useEquipmentCard();
  
  return (
    <CardHeader
      title={equipment.name}
      subheader={`Serial: ${equipment.serialNumber}`}
      action={
        <IconButton onClick={toggleExpanded}>
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      }
    />
  );
};

const EquipmentCardBody: React.FC = () => {
  const { equipment, isExpanded } = useEquipmentCard();
  
  return (
    <Collapse in={isExpanded}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {equipment.description}
        </Typography>
        <Chip 
          label={equipment.status} 
          color={getStatusColor(equipment.status)}
          size="small"
          sx={{ mt: 1 }}
        />
      </CardContent>
    </Collapse>
  );
};

const EquipmentCardActions: React.FC<{ onEdit?: () => void; onDelete?: () => void }> = ({
  onEdit,
  onDelete
}) => {
  const { equipment } = useEquipmentCard();
  
  return (
    <CardActions>
      <Button size="small" onClick={onEdit} startIcon={<Edit />}>
        Edit
      </Button>
      <Button size="small" color="error" onClick={onDelete} startIcon={<Delete />}>
        Delete
      </Button>
    </CardActions>
  );
};

// Attach sub-components
EquipmentCard.Header = EquipmentCardHeader;
EquipmentCard.Body = EquipmentCardBody;
EquipmentCard.Actions = EquipmentCardActions;

// Usage
<EquipmentCard equipment={equipment}>
  <EquipmentCard.Header />
  <EquipmentCard.Body />
  <EquipmentCard.Actions onEdit={handleEdit} onDelete={handleDelete} />
</EquipmentCard>
```

### 2. Render Props Pattern

For flexible component composition.

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
  }) => React.ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<T>(url);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <>{children({ data, loading, error, refetch: fetchData })}</>;
};

// Usage
<DataFetcher<Equipment[]> url="/equipment">
  {({ data, loading, error, refetch }) => {
    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return <Typography>No data available</Typography>;
    
    return (
      <Box>
        <Button onClick={refetch} startIcon={<Refresh />}>
          Refresh
        </Button>
        {data.map(equipment => (
          <EquipmentCard key={equipment.id} equipment={equipment} />
        ))}
      </Box>
    );
  }}
</DataFetcher>
```

### 3. Higher-Order Component (HOC) Pattern

For cross-cutting concerns like authentication and permissions.

```typescript
// Authentication HOC
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: string[] = []
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { user, isAuthenticated, hasPermissions } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (requiredPermissions.length > 0 && !hasPermissions(requiredPermissions)) {
        router.push('/unauthorized');
        return;
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !hasPermissions(requiredPermissions)) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

// Usage
const EquipmentManagementPage = withAuth(
  EquipmentManagement,
  ['equipment:read', 'equipment:write']
);
```

### 4. Custom Hook Pattern

Encapsulate stateful logic for reuse.

```typescript
// Equipment management hook
interface UseEquipmentOptions {
  companyId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const useEquipment = (options: UseEquipmentOptions = {}) => {
  const { companyId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = companyId ? { company_id: companyId } : {};
      const response = await api.get<EquipmentListResponse>('/equipment', { params });
      
      setEquipment(response.data.items);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createEquipment = useCallback(async (data: EquipmentCreate): Promise<Equipment> => {
    const response = await api.post<Equipment>('/equipment', data);
    const newEquipment = response.data;
    
    setEquipment(prev => [...prev, newEquipment]);
    return newEquipment;
  }, []);

  const updateEquipment = useCallback(async (id: string, data: EquipmentUpdate): Promise<Equipment> => {
    const response = await api.put<Equipment>(`/equipment/${id}`, data);
    const updatedEquipment = response.data;
    
    setEquipment(prev => 
      prev.map(eq => eq.id === id ? updatedEquipment : eq)
    );
    return updatedEquipment;
  }, []);

  const deleteEquipment = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/equipment/${id}`);
    setEquipment(prev => prev.filter(eq => eq.id !== id));
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEquipment, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchEquipment]);

  return {
    equipment,
    loading,
    error,
    refetch: fetchEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment
  };
};

// Usage in component
const EquipmentList: React.FC = () => {
  const { equipment, loading, error, createEquipment } = useEquipment({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const handleCreate = async (data: EquipmentCreate) => {
    try {
      await createEquipment(data);
      // Success feedback
    } catch (error) {
      // Error feedback
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      {equipment.map(item => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </Box>
  );
};
```

## State Management

### Zustand Store Pattern

```typescript
// Equipment store
interface EquipmentState {
  // State
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  filters: EquipmentFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
  
  // Actions
  setEquipment: (equipment: Equipment[]) => void;
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed selectors
  filteredEquipment: Equipment[];
  equipmentByStatus: Record<EquipmentStatus, Equipment[]>;
  totalValue: number;
}

const useEquipmentStore = create<EquipmentState>((set, get) => ({
  // Initial state
  equipment: [],
  selectedEquipment: null,
  filters: {
    status: 'all',
    search: '',
    companyId: null
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0
  },
  loading: false,
  error: null,

  // Actions
  setEquipment: (equipment) => set({ equipment }),
  
  addEquipment: (equipment) => set((state) => ({
    equipment: [...state.equipment, equipment]
  })),
  
  updateEquipment: (id, updates) => set((state) => ({
    equipment: state.equipment.map(eq => 
      eq.id === id ? { ...eq, ...updates } : eq
    )
  })),
  
  removeEquipment: (id) => set((state) => ({
    equipment: state.equipment.filter(eq => eq.id !== id),
    selectedEquipment: state.selectedEquipment?.id === id ? null : state.selectedEquipment
  })),
  
  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Computed getters
  get filteredEquipment() {
    const { equipment, filters } = get();
    
    return equipment.filter(eq => {
      const matchesStatus = filters.status === 'all' || eq.status === filters.status;
      const matchesSearch = !filters.search || 
        eq.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        eq.serialNumber.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCompany = !filters.companyId || eq.companyId === filters.companyId;
      
      return matchesStatus && matchesSearch && matchesCompany;
    });
  },

  get equipmentByStatus() {
    const { equipment } = get();
    
    return equipment.reduce((acc, eq) => {
      if (!acc[eq.status]) acc[eq.status] = [];
      acc[eq.status].push(eq);
      return acc;
    }, {} as Record<EquipmentStatus, Equipment[]>);
  },

  get totalValue() {
    const { equipment } = get();
    return equipment.reduce((sum, eq) => sum + (eq.currentValue || eq.purchasePrice), 0);
  }
}));

// Selector hooks for performance
const useEquipmentList = () => useEquipmentStore(state => state.filteredEquipment);
const useEquipmentStats = () => useEquipmentStore(state => ({
  byStatus: state.equipmentByStatus,
  totalValue: state.totalValue,
  total: state.equipment.length
}));
```

### React Query Integration

```typescript
// Equipment queries
const equipmentKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentKeys.all, 'list'] as const,
  list: (filters: EquipmentFilters) => [...equipmentKeys.lists(), filters] as const,
  details: () => [...equipmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
};

// Query hooks
const useEquipmentList = (filters: EquipmentFilters) => {
  return useQuery({
    queryKey: equipmentKeys.list(filters),
    queryFn: () => api.get<EquipmentListResponse>('/equipment', { params: filters }),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

const useEquipmentDetail = (id: string) => {
  return useQuery({
    queryKey: equipmentKeys.detail(id),
    queryFn: () => api.get<Equipment>(`/equipment/${id}`),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Mutation hooks
const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EquipmentCreate) => api.post<Equipment>('/equipment', data),
    onSuccess: (response, variables) => {
      // Invalidate equipment lists
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
      
      // Optimistically update cache
      queryClient.setQueryData(
        equipmentKeys.detail(response.data.id),
        response.data
      );
    },
  });
};

const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentUpdate }) =>
      api.put<Equipment>(`/equipment/${id}`, data),
    onSuccess: (response, { id }) => {
      // Update specific item cache
      queryClient.setQueryData(equipmentKeys.detail(id), response.data);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: equipmentKeys.lists() });
    },
  });
};
```

## UI/UX Design System

### Design Tokens

```typescript
// Theme configuration based on Material Design and Refactoring UI principles
import { createTheme } from '@mui/material/styles';

const designTokens = {
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3', // Main brand color
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    secondary: {
      50: '#f3e5f5',
      100: '#e1bee7',
      200: '#ce93d8',
      300: '#ba68c8',
      400: '#ab47bc',
      500: '#9c27b0',
      600: '#8e24aa',
      700: '#7b1fa2',
      800: '#6a1b9a',
      900: '#4a148c',
    },
    success: {
      50: '#e8f5e8',
      500: '#4caf50',
      700: '#388e3c',
    },
    warning: {
      50: '#fff3e0',
      500: '#ff9800',
      700: '#f57c00',
    },
    error: {
      50: '#ffebee',
      500: '#f44336',
      700: '#d32f2f',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
};

const theme = createTheme({
  palette: {
    primary: designTokens.colors.primary,
    secondary: designTokens.colors.secondary,
    success: designTokens.colors.success,
    warning: designTokens.colors.warning,
    error: designTokens.colors.error,
  },
  
  spacing: 8, // Base spacing unit
  
  shape: {
    borderRadius: 8,
  },
  
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: designTokens.borderRadius.md,
        },
        contained: {
          boxShadow: designTokens.shadows.sm,
          '&:hover': {
            boxShadow: designTokens.shadows.md,
          },
        },
      },
    },
    
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          boxShadow: designTokens.shadows.sm,
          '&:hover': {
            boxShadow: designTokens.shadows.md,
          },
        },
      },
    },
  },
});
```

### Component Library

```typescript
// Status indicator component following Refactoring UI principles
interface StatusIndicatorProps {
  status: EquipmentStatus;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const statusConfig: Record<EquipmentStatus, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
}> = {
  active: {
    color: '#059669',
    bgColor: '#ecfdf5',
    icon: <CheckCircle />,
    label: 'Active'
  },
  maintenance: {
    color: '#d97706',
    bgColor: '#fffbeb',
    icon: <Build />,
    label: 'Maintenance'
  },
  retired: {
    color: '#6b7280',
    bgColor: '#f9fafb',
    icon: <Archive />,
    label: 'Retired'
  },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'medium',
  showText = true
}) => {
  const config = statusConfig[status];
  const sizeMap = {
    small: { chip: 'small', icon: 16 },
    medium: { chip: 'medium', icon: 20 },
    large: { chip: 'large', icon: 24 }
  };

  return (
    <Chip
      size={sizeMap[size].chip as 'small' | 'medium'}
      icon={React.cloneElement(config.icon as React.ReactElement, {
        sx: { fontSize: sizeMap[size].icon }
      })}
      label={showText ? config.label : ''}
      sx={{
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}20`,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  );
};

// Data display component with proper visual hierarchy
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary'
}) => {
  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'success.main';
      case 'down': return 'error.main';
      case 'neutral': return 'text.secondary';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <TrendingUp />;
      case 'down': return <TrendingDown />;
      case 'neutral': return <TrendingFlat />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {change && (
              <Box display="flex" alignItems="center" mt={1}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  color={getTrendColor(change.trend)}
                >
                  {getTrendIcon(change.trend)}
                  <Typography variant="body2" ml={0.5}>
                    {Math.abs(change.value)}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          {icon && (
            <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
```

## Performance Optimization

### Code Splitting and Lazy Loading

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('@/app/dashboard/page'));
const Equipment = lazy(() => import('@/app/equipment/page'));
const Reports = lazy(() => import('@/app/reports/page'));

// Component-based code splitting
const EquipmentDetails = lazy(() => 
  import('@/components/equipment/EquipmentDetails').then(module => ({
    default: module.EquipmentDetails
  }))
);

// Lazy loading with loading states
const LazyEquipmentDetails = () => (
  <Suspense fallback={
    <Box display="flex" justifyContent="center" p={3}>
      <CircularProgress />
    </Box>
  }>
    <EquipmentDetails />
  </Suspense>
);
```

### Memoization Patterns

```typescript
// Component memoization
const EquipmentListItem = React.memo<{
  equipment: Equipment;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}>(({ equipment, onEdit, onDelete }) => {
  const handleEdit = useCallback(() => onEdit(equipment.id), [onEdit, equipment.id]);
  const handleDelete = useCallback(() => onDelete(equipment.id), [onDelete, equipment.id]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{equipment.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {equipment.serialNumber}
        </Typography>
        <StatusIndicator status={equipment.status} />
      </CardContent>
      <CardActions>
        <Button onClick={handleEdit}>Edit</Button>
        <Button onClick={handleDelete} color="error">Delete</Button>
      </CardActions>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-rendering
  return (
    prevProps.equipment.id === nextProps.equipment.id &&
    prevProps.equipment.name === nextProps.equipment.name &&
    prevProps.equipment.status === nextProps.equipment.status &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});

// Expensive calculation memoization
const useEquipmentStatistics = (equipment: Equipment[]) => {
  return useMemo(() => {
    const totalValue = equipment.reduce((sum, eq) => sum + eq.purchasePrice, 0);
    const statusCounts = equipment.reduce((acc, eq) => {
      acc[eq.status] = (acc[eq.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const utilizationRate = equipment.length > 0 
      ? (statusCounts.active || 0) / equipment.length 
      : 0;

    return {
      totalValue,
      statusCounts,
      utilizationRate,
      averageValue: equipment.length > 0 ? totalValue / equipment.length : 0
    };
  }, [equipment]);
};
```

### Virtual Scrolling for Large Lists

```typescript
import { FixedSizeList as List } from 'react-window';

interface VirtualEquipmentListProps {
  equipment: Equipment[];
  onItemClick: (equipment: Equipment) => void;
}

const VirtualEquipmentList: React.FC<VirtualEquipmentListProps> = ({
  equipment,
  onItemClick
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = equipment[index];
    
    return (
      <div style={style}>
        <EquipmentListItem
          equipment={item}
          onClick={() => onItemClick(item)}
        />
      </div>
    );
  };

  return (
    <List
      height={600}
      itemCount={equipment.length}
      itemSize={120}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

---

*This guide should be continuously updated as new patterns emerge and the application grows.*
