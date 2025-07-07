import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material'
import { 
  useCreateEquipment,
  useUpdateEquipment,
  useEquipmentTypes,
  useEquipmentStatuses,
  useFuelTypes
} from '../../hooks/useEquipment'
import type { 
  Equipment, 
  EquipmentCreateRequest, 
  EquipmentUpdateRequest,
  EquipmentType,
  EquipmentStatus,
  FuelType
} from '../../types/equipment'

const equipmentSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  model: z.string().optional(),
  brand: z.string().optional(),
  equipment_type: z.string().min(1, 'Equipment type is required'),
  serial_number: z.string().optional(),
  year_manufactured: z.number().min(1900).max(2030).optional().or(z.literal('')),
  purchase_cost: z.number().min(0).optional().or(z.literal('')),
  current_value: z.number().min(0).optional().or(z.literal('')),
  hourly_rate: z.number().min(0).optional().or(z.literal('')),
  fuel_type: z.string().optional(),
  fuel_capacity: z.number().min(0).optional().or(z.literal('')),
  status: z.string().optional(),
  specifications: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  notes: z.string().optional(),
})

type EquipmentFormData = z.infer<typeof equipmentSchema>

interface EquipmentFormProps {
  equipment?: Equipment | null
  onSave?: (equipment: Equipment) => void
  onCancel?: () => void
  isModal?: boolean
}

export const EquipmentForm: React.FC<EquipmentFormProps> = ({
  equipment,
  onSave,
  onCancel,
  isModal = false
}) => {
  const { createEquipment, isCreating, error: createError } = useCreateEquipment()
  const { updateEquipment, isUpdating, error: updateError } = useUpdateEquipment()
  const { data: equipmentTypes } = useEquipmentTypes()
  const { data: equipmentStatuses } = useEquipmentStatuses()
  const { data: fuelTypes } = useFuelTypes()

  const isEditing = !!equipment
  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      model: '',
      brand: '',
      equipment_type: '',
      serial_number: '',
      year_manufactured: '',
      purchase_cost: '',
      current_value: '',
      hourly_rate: '',
      fuel_type: '',
      fuel_capacity: '',
      status: 'available',
      notes: '',
    }
  })

  // Reset form when equipment changes
  useEffect(() => {
    if (equipment) {
      reset({
        name: equipment.name || '',
        model: equipment.model || '',
        brand: equipment.brand || '',
        equipment_type: equipment.equipment_type || '',
        serial_number: equipment.serial_number || '',
        year_manufactured: equipment.year_manufactured || '',
        purchase_cost: equipment.purchase_cost || '',
        current_value: equipment.current_value || '',
        hourly_rate: equipment.hourly_rate || '',
        fuel_type: equipment.fuel_type || '',
        fuel_capacity: equipment.fuel_capacity || '',
        status: equipment.status || 'available',
        notes: equipment.notes || '',
      })
    } else {
      reset({
        name: '',
        model: '',
        brand: '',
        equipment_type: '',
        serial_number: '',
        year_manufactured: '',
        purchase_cost: '',
        current_value: '',
        hourly_rate: '',
        fuel_type: '',
        fuel_capacity: '',
        status: 'available',
        notes: '',
      })
    }
  }, [equipment, reset])

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      // Clean up data - convert empty strings to undefined and ensure proper types
      const cleanData = {
        ...data,
        company_id: 1, // TODO: Get from user context
        year_manufactured: data.year_manufactured === '' ? undefined : Number(data.year_manufactured),
        purchase_cost: data.purchase_cost === '' ? undefined : Number(data.purchase_cost),
        current_value: data.current_value === '' ? undefined : Number(data.current_value),
        hourly_rate: data.hourly_rate === '' ? undefined : Number(data.hourly_rate),
        fuel_capacity: data.fuel_capacity === '' ? undefined : Number(data.fuel_capacity),
        equipment_type: data.equipment_type as EquipmentType,
        fuel_type: data.fuel_type ? data.fuel_type as FuelType : undefined,
        status: data.status as EquipmentStatus,
      }

      let result: Equipment

      if (isEditing && equipment) {
        // Update existing equipment
        const updateData: EquipmentUpdateRequest = { ...cleanData }
        delete (updateData as EquipmentUpdateRequest & { company_id?: number }).company_id // Remove company_id from update data
        result = await updateEquipment({ id: equipment.id, data: updateData })
      } else {
        // Create new equipment
        const createData: EquipmentCreateRequest = cleanData as EquipmentCreateRequest
        result = await createEquipment(createData)
      }

      onSave?.(result)
    } catch (err) {
      console.error('Failed to save equipment:', err)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      {!isModal && (
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'An error occurred while saving equipment'}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{xs: 12}}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Equipment Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                data-testid="equipment-name"
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="equipment_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.equipment_type}>
                <InputLabel>Equipment Type</InputLabel>
                <Select
                  {...field}
                  label="Equipment Type"
                  data-testid="equipment-type"
                >
                  {equipmentTypes?.map((type: string) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="brand"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Brand"
                fullWidth
                data-testid="equipment-brand"
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Model"
                fullWidth
                data-testid="equipment-model"
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="serial_number"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Serial Number"
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="year_manufactured"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Year Manufactured"
                type="number"
                fullWidth
                inputProps={{ min: 1900, max: 2030 }}
                error={!!errors.year_manufactured}
                helperText={errors.year_manufactured?.message}
                data-testid="equipment-year"
              />
            )}
          />
        </Grid>

        {/* Financial Information */}
        <Grid size={{xs: 12}}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Financial Information
          </Typography>
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Controller
            name="purchase_cost"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Purchase Cost"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Controller
            name="current_value"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Current Value"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 4}}>
          <Controller
            name="hourly_rate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Hourly Rate"
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/hr</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          />
        </Grid>

        {/* Technical Specifications */}
        <Grid size={{xs: 12}} >
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Technical Specifications
          </Typography>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="fuel_type"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  {...field}
                  label="Fuel Type"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {fuelTypes?.map((type: string) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Controller
            name="fuel_capacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Fuel Capacity"
                type="number"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">L</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.1 }}
              />
            )}
          />
        </Grid>

        {isEditing && (
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    {...field}
                    label="Status"
                  >
                    {equipmentStatuses?.map((status: string) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
        )}

        {/* Notes */}
        <Grid size={{xs: 12}}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Additional Notes
          </Typography>
        </Grid>

        <Grid size={{xs: 12}}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Notes"
                multiline
                rows={3}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* Actions */}
        <Grid size={{xs: 12}}>
          <Box display="flex" gap={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={isLoading}
              data-testid="submit-equipment"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Equipment' : 'Create Equipment'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
