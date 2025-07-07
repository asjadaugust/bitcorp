'use client'

import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'
import type { EquipmentSchedule } from '../../types/scheduling'

interface ScheduleCalendarViewProps {
  schedules: EquipmentSchedule[]
  isLoading?: boolean
  currentDate?: Date
  onDateClick?: (date: Date) => void
  onScheduleClick?: (schedule: EquipmentSchedule) => void
}

export function ScheduleCalendarView({
  schedules,
  isLoading,
  currentDate = new Date(),
  onDateClick,
  onScheduleClick,
}: ScheduleCalendarViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleStart = new Date(schedule.start_datetime)
      const scheduleEnd = new Date(schedule.end_datetime)
      return date >= new Date(scheduleStart.toDateString()) && 
             date <= new Date(scheduleEnd.toDateString())
    })
  }

  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'scheduled':
        return 'primary'
      case 'active':
        return 'success'
      case 'completed':
        return 'default'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        
        <Grid container spacing={1}>
          {/* Week header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid key={day} item xs={1.71}>
              <Typography
                variant="caption"
                align="center"
                sx={{ 
                  display: 'block', 
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  py: 1
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(date => {
            const daySchedules = getSchedulesForDate(date)
            const isCurrentDay = isToday(date)
            
            return (
              <Grid key={date.toISOString()} item xs={1.71}>
                <Paper
                  sx={{
                    minHeight: '120px',
                    p: 1,
                    cursor: onDateClick ? 'pointer' : 'default',
                    bgcolor: isCurrentDay ? 'primary.50' : 'background.paper',
                    border: isCurrentDay ? 1 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: onDateClick ? 'grey.50' : undefined,
                    },
                  }}
                  onClick={() => onDateClick?.(date)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isCurrentDay ? 'bold' : 'normal',
                      color: isCurrentDay ? 'primary.main' : 'text.primary',
                      mb: 1,
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  
                  <Box sx={{ maxHeight: '80px', overflow: 'hidden' }}>
                    {daySchedules.slice(0, 3).map(schedule => (
                      <Chip
                        key={schedule.id}
                        label={schedule.equipment?.name || 'Unknown Equipment'}
                        size="small"
                        color={getStatusColor(schedule.status)}
                        variant="outlined"
                        sx={{
                          fontSize: '10px',
                          height: '20px',
                          mb: 0.5,
                          cursor: onScheduleClick ? 'pointer' : 'default',
                          '&:hover': {
                            bgcolor: onScheduleClick ? 'action.hover' : undefined,
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onScheduleClick?.(schedule)
                        }}
                      />
                    ))}
                    {daySchedules.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '10px' }}
                      >
                        +{daySchedules.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </CardContent>
    </Card>
  )
}
