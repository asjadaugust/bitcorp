'use client';

import React from 'react';
import {
  Container,
  Typography,
  Grid2 as Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function OperatorDashboard() {
  const router = useRouter();

  // Mock data - would come from API
  const dashboardData = {
    pendingReports: 1,
    completedReports: 23,
    totalHours: 184.5,
    currentAssignment: {
      equipment: 'CAT 320 Excavator',
      project: 'Highway Construction Phase 2',
      location: 'Site A - Section 3',
    },
  };

  const quickActions = [
    {
      title: 'Start New Report',
      description: 'Create a new daily equipment report',
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => router.push('/operator/daily-report'),
      color: 'primary',
    },
    {
      title: 'View Schedule',
      description: 'Check your upcoming assignments',
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      action: () => router.push('/operator/schedule'),
      color: 'info',
    },
    {
      title: 'Report History',
      description: 'View your submitted reports',
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      action: () => router.push('/operator/history'),
      color: 'success',
    },
  ];

  const stats = [
    {
      title: 'Reports This Month',
      value: dashboardData.completedReports,
      icon: <AssignmentIcon />,
      color: 'primary',
    },
    {
      title: 'Total Hours',
      value: `${dashboardData.totalHours}h`,
      icon: <TrendingUpIcon />,
      color: 'success',
    },
    {
      title: 'Pending Reports',
      value: dashboardData.pendingReports,
      icon: <ScheduleIcon />,
      color: 'warning',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome Back, Operator
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>

      {/* Current Assignment Card */}
      <Card
        sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Assignment
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2">Equipment</Typography>
              <Typography variant="h6">
                {dashboardData.currentAssignment.equipment}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2">Project</Typography>
              <Typography variant="h6">
                {dashboardData.currentAssignment.project}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2">Location</Typography>
              <Typography variant="h6">
                {dashboardData.currentAssignment.location}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box color={`${stat.color}.main`}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>

      <Grid container spacing={3}>
        {quickActions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box mb={2}>{action.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button
                  variant="contained"
                  color={action.color as 'primary' | 'info' | 'success'}
                  onClick={action.action}
                  fullWidth
                  sx={{ mx: 2 }}
                >
                  Open
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Card>
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography variant="body1">
                Daily Report - CAT 320 Excavator
              </Typography>
              <Chip label="Submitted" color="success" size="small" />
            </Box>
            <LinearProgress variant="determinate" value={100} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Submitted today at 4:30 PM
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
