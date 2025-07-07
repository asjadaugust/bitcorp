import React, { useEffect, useState } from 'react'
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
  Paper,
  Chip,
} from '@mui/material'
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { addHours, format } from 'date-fns'
import {
  useCreateSchedule,
  useUpdateSchedule,
  useScheduleConflicts,
  useEquipmentAvailability,
} from '../../hooks/useScheduling'
import { useEquipmentList } from '../../hooks/useEquipment'
import type {
  EquipmentSchedule,
  EquipmentScheduleCreateRequest,
  EquipmentScheduleUpdateRequest,
} from '../../types/scheduling'

const scheduleSchema = z.object({
  equipment_id: z.number().min(1, 'Equipment is required'),
  project_id: z.number().optional(),
  operator_id: z.number().optional(),
  start_datetime: z.date(),
  end_datetime: z.date(),
  notes: z.string().optional(),
}).refine((data) => data.end_datetime > data.start_datetime, {
  message: 'End time must be after start time',
  path: ['end_datetime'],
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

interface ScheduleFormProps {
  schedule?: EquipmentSchedule | null
  onSave?: (schedule: EquipmentSchedule) => void
  onCancel?: () => void
  isModal?: boolean
  defaultEquipmentId?: number
  defaultStartTime?: Date
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  onSave,
  onCancel,
  isModal = false,
  defaultEquipmentId,
  defaultStartTime = new Date(),
}) => {
  const { createSchedule, isCreating, error: createError } = useCreateSchedule()
  const { updateSchedule, isUpdating, error: updateError } = useUpdateSchedule()
  const { data: equipmentList } = useEquipmentList({ status: 'available' })
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    schedule?.equipment_id || defaultEquipmentId || null
  )
  const [startDateTime, setStartDateTime] = useState<Date | null>(
    schedule ? new Date(schedule.start_datetime) : defaultStartTime
  )
  const [endDateTime, setEndDateTime] = useState<Date | null>(
    schedule ? new Date(schedule.end_datetime) : addHours(defaultStartTime, 8)
  )

  const isEditing = !!schedule
  const isLoading = isCreating || isUpdating
  const error = createError || updateError

  // Check for conflicts when dates or equipment change
  const { data: conflicts } = useScheduleConflicts(
    selectedEquipmentId || 0,
    startDateTime ? startDateTime.toISOString() : '',
    endDateTime ? endDateTime.toISOString() : '',
    schedule?.id
  )

  // Check equipment availability
  const { data: availability } = useEquipmentAvailability(
    selectedEquipmentId || 0,
    startDateTime ? format(startDateTime, 'yyyy-MM-dd') : ''
  )

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      equipment_id: schedule?.equipment_id || defaultEquipmentId || 0,
      project_id: schedule?.project_id || undefined,
      operator_id: schedule?.operator_id || undefined,
      start_datetime: schedule ? new Date(schedule.start_datetime) : defaultStartTime,
      end_datetime: schedule ? new Date(schedule.end_datetime) : addHours(defaultStartTime, 8),
      notes: schedule?.notes || '',
    }
  })

  const watchedEquipmentId = watch('equipment_id')
  const watchedStartDateTime = watch('start_datetime')
  const watchedEndDateTime = watch('end_datetime')

  // Update state when form values change
  useEffect(() => {
    setSelectedEquipmentId(watchedEquipmentId || null)
  }, [watchedEquipmentId])

  useEffect(() => {
    setStartDateTime(watchedStartDateTime)
  }, [watchedStartDateTime])

  useEffect(() => {
    setEndDateTime(watchedEndDateTime)
  }, [watchedEndDateTime])

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      const scheduleData = {
        ...data,
        start_datetime: data.start_datetime.toISOString(),
        end_datetime: data.end_datetime.toISOString(),
      }

      let result: EquipmentSchedule

      if (isEditing && schedule) {
        const updateData: EquipmentScheduleUpdateRequest = {
          project_id: scheduleData.project_id,
          operator_id: scheduleData.operator_id,
          start_datetime: scheduleData.start_datetime,
          end_datetime: scheduleData.end_datetime,
          notes: scheduleData.notes,
        }
        result = await updateSchedule({ id: schedule.id, data: updateData })
      } else {
        const createData: EquipmentScheduleCreateRequest = {
          equipment_id: scheduleData.equipment_id,
          project_id: scheduleData.project_id,
          operator_id: scheduleData.operator_id,
          start_datetime: scheduleData.start_datetime,
          end_datetime: scheduleData.end_datetime,
          notes: scheduleData.notes,
        }
        result = await createSchedule(createData)
      }

      onSave?.(result)
    } catch (err) {
      console.error('Failed to save schedule:', err)
    }
  }

  const hasConflicts = conflicts && conflicts.length > 0
  const isEquipmentUnavailable = availability && !availability.is_available

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
        {!isModal && (
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditing ? 'Edit Schedule' : 'Create New Schedule'}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error instanceof Error ? error.message : 'An error occurred while saving schedule'}
          </Alert>
        )}

        {hasConflicts && (
          <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Scheduling Conflicts Detected
            </Typography>
            <Typography variant="body2">
              This equipment is already scheduled during the selected time period. 
              Please choose a different time or equipment.
            </Typography>
            {conflicts.map((conflict, index) => (
              <Chip
                key={index}
                label={`Conflict: ${format(new Date(conflict.overlap_start), 'MMM dd, HH:mm')} - ${format(new Date(conflict.overlap_end), 'HH:mm')}`}
                color="warning"
                size="small"
                sx={{ mt: 1, mr: 1 }}
              />
            ))}
          </Alert>
        )}

        {isEquipmentUnavailable && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Equipment is currently unavailable on the selected date. 
            Available periods: {availability?.available_periods.length || 0}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Equipment Selection */}
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              name="equipment_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth required error={!!errors.equipment_id}>
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    {...field}
                    label="Equipment"
                    disabled={isEditing} // Don't allow changing equipment for existing schedules
                  >
                    {equipmentList?.equipment.map((equipment) => (
                      <MenuItem key={equipment.id} value={equipment.id}>
                        {equipment.name} ({equipment.equipment_type})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.equipment_id && (
                    <Typography variant="caption" color="error">
                      {errors.equipment_id.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          {/* Project Selection */}
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              name="project_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Project (Optional)</InputLabel>
                  <Select
                    {...field}
                    label="Project (Optional)"
                    value={field.value || ''}
                  >
                    <MenuItem value="">
                      <em>No Project</em>
                    </MenuItem>
                    {/* TODO: Add project options */}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Start Date & Time */}
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              name="start_datetime"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="Start Date & Time"
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date)
                    // Auto-adjust end time to maintain duration
                    if (date && endDateTime) {
                      const duration = endDateTime.getTime() - (startDateTime?.getTime() || date.getTime())
                      if (duration > 0) {
                        const newEndTime = new Date(date.getTime() + duration)
                        setValue('end_datetime', newEndTime)
                      }
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.start_datetime,
                      helperText: errors.start_datetime?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* End Date & Time */}
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              name="end_datetime"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  label="End Date & Time"
                  value={field.value}
                  onChange={field.onChange}
                  minDateTime={startDateTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.end_datetime,
                      helperText: errors.end_datetime?.message,
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* Operator Selection */}
          <Grid size={{xs: 12, md: 6}}>
            <Controller
              name="operator_id"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Operator (Optional)</InputLabel>
                  <Select
                    {...field}
                    label="Operator (Optional)"
                    value={field.value || ''}
                  >
                    <MenuItem value="">
                      <em>No Operator Assigned</em>
                    </MenuItem>
                    {/* TODO: Add operator options */}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Duration Display */}
          <Grid size={{xs: 12, md: 6}}>
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Schedule Duration
              </Typography>
              <Typography variant="h6">
                {startDateTime && endDateTime
                  ? `${Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60))} hours`
                  : '0 hours'}
              </Typography>
            </Paper>
          </Grid>

          {/* Notes */}
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
                  placeholder="Add any additional notes about this schedule..."
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
                disabled={isLoading || hasConflicts}
                data-testid="submit-schedule"
              >
                {isLoading ? 'Saving...' : isEditing ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  )
}
