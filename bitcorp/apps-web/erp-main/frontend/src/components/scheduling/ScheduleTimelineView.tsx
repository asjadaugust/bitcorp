'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';
import type { EquipmentSchedule } from '../../types/scheduling';

interface ScheduleTimelineViewProps {
  schedules: EquipmentSchedule[];
  isLoading?: boolean;
  onScheduleClick?: (schedule: EquipmentSchedule) => void;
}

export function ScheduleTimelineView({
  schedules,
  isLoading,
  onScheduleClick,
}: ScheduleTimelineViewProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <ScheduleIcon />;
      case 'active':
        return <PlayArrowIcon />;
      case 'completed':
        return <CheckCircleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <ConstructionIcon />;
    }
  };

  const getStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const formatDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return formatDistance(start, end);
  };

  // Sort schedules by start date
  const sortedSchedules = [...schedules].sort(
    (a, b) =>
      new Date(a.start_datetime).getTime() -
      new Date(b.start_datetime).getTime()
  );

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <ConstructionIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No schedules found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first equipment schedule to get started.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Schedule Timeline
        </Typography>

        <List disablePadding>
          {sortedSchedules.map((schedule, index) => (
            <Box key={schedule.id}>
              <ListItem
                sx={{
                  cursor: onScheduleClick ? 'pointer' : 'default',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: onScheduleClick ? 'action.hover' : undefined,
                  },
                }}
                onClick={() => onScheduleClick?.(schedule)}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getStatusColor(schedule.status)}.main`,
                      color: 'white',
                    }}
                  >
                    {getStatusIcon(schedule.status)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" component="span">
                        {schedule.equipment?.name || 'Unknown Equipment'}
                      </Typography>
                      <Chip
                        label={schedule.status}
                        size="small"
                        color={getStatusColor(schedule.status)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Project:</strong>{' '}
                        {schedule.project?.name || 'No project specified'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Operator:</strong>{' '}
                        {schedule.operator?.full_name || 'No operator assigned'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Duration:</strong>{' '}
                        {formatDuration(
                          schedule.start_datetime,
                          schedule.end_datetime
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Period:</strong>{' '}
                        {formatDateTime(schedule.start_datetime)} -{' '}
                        {formatDateTime(schedule.end_datetime)}
                      </Typography>
                      {schedule.notes && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          <strong>Notes:</strong> {schedule.notes}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>

              {index < sortedSchedules.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
