import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Pagination,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Fab,
  Tooltip,
  Stack
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '../../hooks/useDebounce'
import { equipmentService } from '../../services/equipmentService'
import type { 
  Equipment, 
  EquipmentSearchParams
} from '../../types/equipment'
import { 
  EquipmentStatus,
  EquipmentType,
  getStatusColor, 
  getStatusLabel, 
  getEquipmentTypeLabel 
} from '../../types/equipment'

interface EquipmentListProps {
  onSelectEquipment?: (equipment: Equipment) => void
  onEditEquipment?: (equipment: Equipment | null) => void
  compact?: boolean
}

interface EquipmentFilters {
  status?: EquipmentStatus | ''
  equipment_type?: EquipmentType | ''
  brand?: string
  year_from?: number | ''
  year_to?: number | ''
}

export const EquipmentList: React.FC<EquipmentListProps> = ({
  onSelectEquipment,
  onEditEquipment,
  compact = false
}) => {
  const queryClient = useQueryClient()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<EquipmentFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // Build search parameters
  const searchParams: EquipmentSearchParams = {
    page,
    per_page: compact ? 10 : 20,
    search: debouncedSearch || undefined,
    sort_by: 'name',
    sort_order: 'asc',
    ...Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
    )
  }
  
  // Queries
  const { 
    data: equipmentData, 
    isLoading, 
    error
  } = useQuery({
    queryKey: ['equipment', searchParams],
    queryFn: () => equipmentService.getEquipment(searchParams)
  })
  
  const { data: equipmentTypes } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: () => equipmentService.getEquipmentTypes()
  })
  
  const { data: equipmentStatuses } = useQuery({
    queryKey: ['equipment-statuses'],
    queryFn: () => equipmentService.getEquipmentStatuses()
  })
  
  // Mutations
  const deleteEquipmentMutation = useMutation({
    mutationFn: (id: number) => equipmentService.deleteEquipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      setDeleteDialogOpen(false)
      setSelectedEquipment(null)
    }
  })
  
  // Handlers
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPage(1) // Reset to first page on search
  }, [])
  
  const handleFilterChange = useCallback((field: keyof EquipmentFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPage(1) // Reset to first page on filter change
  }, [])
  
  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }, [])
  
  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage)
  }, [])
  
  const handleMenuClick = useCallback((equipment: Equipment, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setSelectedEquipment(equipment)
    setMenuAnchor(event.currentTarget)
  }, [])
  
  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null)
  }, [])
  
  const handleView = useCallback(() => {
    if (selectedEquipment && onSelectEquipment) {
      onSelectEquipment(selectedEquipment)
    }
    handleMenuClose()
  }, [selectedEquipment, onSelectEquipment, handleMenuClose])
  
  const handleEdit = useCallback(() => {
    if (selectedEquipment && onEditEquipment) {
      onEditEquipment(selectedEquipment)
    }
    handleMenuClose()
  }, [selectedEquipment, onEditEquipment, handleMenuClose])
  
  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }, [handleMenuClose])
  
  const handleDeleteConfirm = useCallback(() => {
    if (selectedEquipment) {
      deleteEquipmentMutation.mutate(selectedEquipment.id)
    }
  }, [selectedEquipment, deleteEquipmentMutation])
  
  const handleEquipmentClick = useCallback((equipment: Equipment) => {
    if (onSelectEquipment) {
      onSelectEquipment(equipment)
    }
  }, [onSelectEquipment])
  
  // Effects
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters])
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load equipment: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    )
  }
  
  return (
    <Box>
      {/* Header */}
      {!compact && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Equipment Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onEditEquipment?.(null)}
          >
            Add Equipment
          </Button>
        </Box>
      )}
      
      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
              <TextField
                sx={{ flex: 1 }}
                placeholder="Search equipment..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  )
                }}
              />
              
              <Box display="flex" gap={1} alignItems="center">
                <Button
                  variant={showFilters ? 'contained' : 'outlined'}
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                
                {(Object.values(filters).some(v => v !== '' && v !== undefined) || searchQuery) && (
                  <Tooltip title="Clear all filters">
                    <IconButton onClick={handleClearFilters} size="small">
                      <ClearIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
            
            {showFilters && (
              <Box display="flex" gap={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {equipmentStatuses?.map((status: string) => (
                      <MenuItem key={status} value={status}>
                        {getStatusLabel(status as EquipmentStatus)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.equipment_type || ''}
                    label="Type"
                    onChange={(e) => handleFilterChange('equipment_type', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {equipmentTypes?.map((type: string) => (
                      <MenuItem key={type} value={type}>
                        {getEquipmentTypeLabel(type as EquipmentType)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  size="small"
                  label="Brand"
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  sx={{ minWidth: 120 }}
                />
                
                <TextField
                  size="small"
                  label="Year From"
                  type="number"
                  value={filters.year_from || ''}
                  onChange={(e) => handleFilterChange('year_from', e.target.value ? Number(e.target.value) : '')}
                  sx={{ minWidth: 120 }}
                />
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
      
      {/* Equipment Grid */}
      {isLoading ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box 
          display="grid" 
          gridTemplateColumns={{ 
            xs: '1fr', 
            sm: compact ? '1fr' : 'repeat(2, 1fr)', 
            md: compact ? '1fr' : 'repeat(3, 1fr)' 
          }}
          gap={2}
        >
          {equipmentData?.equipment.map((equipment: Equipment) => (
            <Card
              key={equipment.id}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 4
                },
                position: 'relative'
              }}
              onClick={() => handleEquipmentClick(equipment)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" component="h3" noWrap sx={{ flex: 1, mr: 1 }}>
                    {equipment.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(equipment, e)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {equipment.brand} {equipment.model} • {equipment.serial_number}
                </Typography>
                
                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={getStatusLabel(equipment.status)}
                    color={getStatusColor(equipment.status)}
                    size="small"
                  />
                  <Chip
                    label={getEquipmentTypeLabel(equipment.equipment_type)}
                    variant="outlined"
                    size="small"
                  />
                </Box>
                
                {!compact && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Hours: {equipment.hourmeter_reading.toLocaleString()}
                    </Typography>
                    {equipment.hourly_rate && (
                      <Typography variant="body2" color="text.secondary">
                        Rate: ${equipment.hourly_rate}/hr
                      </Typography>
                    )}
                    {equipment.current_value && (
                      <Typography variant="body2" color="text.secondary">
                        Value: ${equipment.current_value.toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Pagination */}
      {equipmentData && equipmentData.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={equipmentData.total_pages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
      
      {/* Floating Action Button for mobile */}
      {compact && (
        <Fab
          color="primary"
          aria-label="add equipment"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => onEditEquipment?.(null)}
        >
          <AddIcon />
        </Fab>
      )}
      
      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Equipment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{selectedEquipment?.name}&rdquo;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteEquipmentMutation.isPending}
          >
            {deleteEquipmentMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
