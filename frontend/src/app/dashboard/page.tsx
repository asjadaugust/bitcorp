'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Container,
  Paper,
  CircularProgress,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Groups as Users,
  Settings,
  LocalShipping as Truck,
  BarChart as BarChart3,
  Logout as LogOut,
  Security as Shield,
  Person as User,
  Notifications as Bell,
  CalendarToday as Calendar,
  AttachMoney as DollarSign,
  Sensors as SensorsIcon,
} from '@mui/icons-material';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, hasRole, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || (isInitialized && !isAuthenticated)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography color="text.secondary">
            {!isAuthenticated
              ? 'Redirecting to login...'
              : 'Loading dashboard...'}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = hasRole('admin');
  const isDeveloper = hasRole('developer');
  const isManager = hasRole('manager');

  const quickActions = [
    {
      title: 'Equipment Management',
      description: 'Manage equipment inventory and assignments',
      icon: Truck,
      href: '/equipment',
      color: 'primary.main',
      available: true,
    },
    {
      title: 'IoT Monitoring',
      description: 'Real-time equipment monitoring and predictive maintenance',
      icon: SensorsIcon,
      href: '/iot',
      color: 'info.main',
      available: true,
    },
    {
      title: 'Equipment Scheduling',
      description: 'Schedule equipment assignments and track availability',
      icon: Calendar,
      href: '/scheduling',
      color: 'secondary.main',
      available: true,
    },
    {
      title: 'User Management',
      description: 'Manage system users and permissions',
      icon: Users,
      href: '/users',
      color: 'success.main',
      available: isAdmin,
    },
    {
      title: 'Reports & Analytics',
      description: 'View performance reports and analytics',
      icon: BarChart3,
      href: '/reports',
      color: 'warning.main',
      available: isManager || isAdmin || isDeveloper,
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      href: '/settings',
      color: 'error.main',
      available: isAdmin || isDeveloper,
    },
  ];

  const stats = [
    {
      title: 'Active Equipment',
      value: '24',
      change: '+12%',
      icon: Truck,
      color: 'primary.main',
    },
    {
      title: 'Active Users',
      value: '8',
      change: '+2',
      icon: Users,
      color: 'success.main',
    },
    {
      title: 'This Month Revenue',
      value: '$45,230',
      change: '+8.2%',
      icon: DollarSign,
      color: 'secondary.main',
    },
    {
      title: 'Scheduled Tasks',
      value: '16',
      change: '+4',
      icon: Calendar,
      color: 'warning.main',
    },
  ];

  const recentActivities = [
    {
      title: 'New user registration: John Operator',
      time: '2 hours ago',
      icon: User,
      color: 'primary.main',
    },
    {
      title: 'Equipment CAT-001 assigned to Project Alpha',
      time: '4 hours ago',
      icon: Truck,
      color: 'success.main',
    },
    {
      title: 'Monthly report generated successfully',
      time: '1 day ago',
      icon: BarChart3,
      color: 'secondary.main',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user.full_name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications */}
            <IconButton>
              <Badge badgeContent={1} color="error">
                <Bell />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="medium">
                  {user.full_name}
                </Typography>
                <Box
                  sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}
                >
                  {user.roles.map((role) => (
                    <Chip
                      key={role.id}
                      icon={<Shield sx={{ fontSize: '12px !important' }} />}
                      label={role.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <User />
              </Avatar>
              <IconButton onClick={() => logout()} color="error" title="Logout">
                <LogOut />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${stat.color.replace('.main', '.50')}`,
                        mr: 2,
                      }}
                    >
                      <stat.icon sx={{ fontSize: 24, color: stat.color }} />
                    </Paper>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {stat.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h5" fontWeight="semibold">
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ ml: 1 }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="semibold">
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions
              .filter((action) => action.available)
              .map((action, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => router.push(action.href)}
                  >
                    <CardContent>
                      <Paper
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: action.color,
                          mb: 2,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <action.icon sx={{ fontSize: 24, color: 'white' }} />
                      </Paper>
                      <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight="semibold"
                      >
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>

        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="semibold">
              Recent Activity
            </Typography>
            <List disablePadding>
              {recentActivities.map((activity, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${activity.color.replace('.main', '.100')}`,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <activity.icon
                        sx={{ fontSize: 16, color: activity.color }}
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.title}
                    secondary={activity.time}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 'medium',
                    }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
