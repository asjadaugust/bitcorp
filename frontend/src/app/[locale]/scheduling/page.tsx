'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Tab,
  Tabs,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  List as ListIcon,
  Timeline as TimelineIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { format } from 'date-fns';
import { ScheduleForm } from '@/components/scheduling/ScheduleForm';
import { ScheduleCalendarView } from '@/components/scheduling/ScheduleCalendarView';
import { ScheduleTimelineView } from '@/components/scheduling/ScheduleTimelineView';
import { ProjectOperatorSelectors } from '@/components/scheduling/ProjectOperatorSelectors';
import { useScheduleList, useDeleteSchedule } from '@/hooks/useScheduling';
import type { EquipmentSchedule } from '@/types/scheduling';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SchedulingPage() {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [selectedSchedule, setSelectedSchedule] =
    useState<EquipmentSchedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<EquipmentSchedule | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const { data: scheduleData, isLoading, mutate } = useScheduleList();
  const { deleteSchedule, isDeleting } = useDeleteSchedule();

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setIsFormOpen(true);
  };

  const handleEditSchedule = (schedule: EquipmentSchedule) => {
    setSelectedSchedule(schedule);
    setIsFormOpen(true);
  };

  // const handleDeleteSchedule = (schedule: EquipmentSchedule) => {
  //   setScheduleToDelete(schedule)
  //   setIsDeleteDialogOpen(true)
  // }

  const confirmDelete = async () => {
    if (scheduleToDelete) {
      try {
        await deleteSchedule(scheduleToDelete.id);
        setIsDeleteDialogOpen(false);
        setScheduleToDelete(null);
        mutate(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const handleFormSave = () => {
    setIsFormOpen(false);
    setSelectedSchedule(null);
    mutate(); // Refresh the list
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedSchedule(null);
  };

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'scheduled':
  //       return 'primary'
  //     case 'active':
  //       return 'success'
  //     case 'completed':
  //       return 'default'
  //     case 'cancelled':
  //       return 'error'
  //     default:
  //       return 'default'
  //   }
  // }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const schedules = scheduleData?.schedules || [];

  // Filter schedules based on selected projects and operators
  const filteredSchedules = schedules.filter((schedule) => {
    const projectMatch =
      selectedProjects.length === 0 ||
      (schedule.project?.name &&
        selectedProjects.includes(schedule.project.name));
    const operatorMatch =
      selectedOperators.length === 0 ||
      (schedule.operator?.full_name &&
        selectedOperators.includes(schedule.operator.full_name));
    return projectMatch && operatorMatch;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box>
        {/* Navigation Breadcrumbs */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            onClick={handleBackToDashboard}
            sx={{ mr: 2 }}
            aria-label="Back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>

          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                handleBackToDashboard();
              }}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary">Equipment Scheduling</Typography>
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Equipment Scheduling
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Schedule equipment assignments, track availability, and manage
              project timelines.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateSchedule}
            size="large"
          >
            New Schedule
          </Button>
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<ListIcon />}
              label="List View"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<CalendarIcon />}
              label="Calendar View"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              icon={<TimelineIcon />}
              label="Timeline View"
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Paper>

        {/* Filters */}
        <Box mb={3}>
          <ProjectOperatorSelectors
            selectedProjects={selectedProjects}
            selectedOperators={selectedOperators}
            onProjectsChange={setSelectedProjects}
            onOperatorsChange={setSelectedOperators}
          />
        </Box>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          {/* List View */}
          <ScheduleTimelineView
            schedules={filteredSchedules}
            isLoading={isLoading}
            onScheduleClick={handleEditSchedule}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Calendar View */}
          <ScheduleCalendarView
            schedules={filteredSchedules}
            isLoading={isLoading}
            currentDate={currentCalendarDate}
            onScheduleClick={handleEditSchedule}
            onDateClick={(date) => {
              setCurrentCalendarDate(date);
              // Could also open create form with pre-selected date
            }}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Timeline View */}
          <ScheduleTimelineView
            schedules={filteredSchedules}
            isLoading={isLoading}
            onScheduleClick={handleEditSchedule}
          />
        </TabPanel>
        {/* Schedule Form Dialog */}
        <Dialog
          open={isFormOpen}
          onClose={handleFormCancel}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { minHeight: '600px' },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {selectedSchedule ? 'Edit Schedule' : 'Create New Schedule'}
            <IconButton onClick={handleFormCancel} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <ScheduleForm
              schedule={selectedSchedule}
              onSave={handleFormSave}
              onCancel={handleFormCancel}
              isModal={true}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this schedule? This action cannot
              be undone.
            </Typography>
            {scheduleToDelete && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Equipment:</strong> {scheduleToDelete.equipment?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Period:</strong>{' '}
                  {formatDateTime(scheduleToDelete.start_datetime)} -{' '}
                  {formatDateTime(scheduleToDelete.end_datetime)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
