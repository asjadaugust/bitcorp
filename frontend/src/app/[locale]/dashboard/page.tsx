'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Groups as Users,
  Settings,
  LocalShipping as Truck,
  BarChart as BarChart3,
  CalendarToday as Calendar,
  AttachMoney as DollarSign,
  Sensors as SensorsIcon,
} from '@mui/icons-material';
import { AppBarLayout } from '@/components/layout/AppBarLayout';

export default function DashboardPage() {
  const { user, isAuthenticated, hasRole, isInitialized } = useAuth();
  const router = useRouter();
  const t = useTranslations('Dashboard');
  const { formatCurrency } = useCurrencyFormatter();

  // DEBUG: Log state changes
  useEffect(() => {
    console.log('[Dashboard] State:', {
      isInitialized,
      isAuthenticated,
      hasUser: !!user,
      user: user?.email,
    });
  }, [isInitialized, isAuthenticated, user]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      console.log('[Dashboard] Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading only while initializing, not after redirect decision is made
  if (!isInitialized) {
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
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // If not authenticated after initialization, return null (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    return null;
  }

  const isAdmin = hasRole('admin');
  const isDeveloper = hasRole('developer');
  const isManager = hasRole('manager');

  const quickActions = [
    {
      title: t('quickActions.equipmentManagement.title'),
      description: t('quickActions.equipmentManagement.description'),
      icon: Truck,
      href: '/equipment',
      color: 'primary.main',
      available: true,
    },
    {
      title: t('quickActions.iotMonitoring.title'),
      description: t('quickActions.iotMonitoring.description'),
      icon: SensorsIcon,
      href: '/iot',
      color: 'info.main',
      available: true,
    },
    {
      title: t('quickActions.equipmentScheduling.title'),
      description: t('quickActions.equipmentScheduling.description'),
      icon: Calendar,
      href: '/scheduling',
      color: 'secondary.main',
      available: true,
    },
    {
      title: t('quickActions.userManagement.title'),
      description: t('quickActions.userManagement.description'),
      icon: Users,
      href: '/users',
      color: 'success.main',
      available: isAdmin,
    },
    {
      title: t('quickActions.reportsAnalytics.title'),
      description: t('quickActions.reportsAnalytics.description'),
      icon: BarChart3,
      href: '/reports',
      color: 'warning.main',
      available: isManager || isAdmin || isDeveloper,
    },
    {
      title: t('quickActions.systemSettings.title'),
      description: t('quickActions.systemSettings.description'),
      icon: Settings,
      href: '/settings',
      color: 'error.main',
      available: isAdmin || isDeveloper,
    },
  ];

  const stats = [
    {
      title: t('stats.activeEquipment'),
      value: '24',
      change: '+12%',
      icon: Truck,
      color: 'primary.main',
    },
    {
      title: t('stats.activeUsers'),
      value: '8',
      change: '+2',
      icon: Users,
      color: 'success.main',
    },
    {
      title: t('stats.monthlyRevenue'),
      value: formatCurrency(45230),
      change: '+8.2%',
      icon: DollarSign,
      color: 'secondary.main',
    },
    {
      title: t('stats.scheduledTasks'),
      value: '16',
      change: '+4',
      icon: Calendar,
      color: 'warning.main',
    },
  ];

  const recentActivities = [
    {
      title: t('recentActivity.newUserRegistration', { name: 'John Operator' }),
      time: t('recentActivity.timeAgo.hoursAgo', { hours: 2 }),
      icon: Users,
      color: 'primary.main',
    },
    {
      title: t('recentActivity.equipmentAssigned', {
        equipment: 'CAT-001',
        project: 'Project Alpha',
      }),
      time: t('recentActivity.timeAgo.hoursAgo', { hours: 4 }),
      icon: Truck,
      color: 'success.main',
    },
    {
      title: t('recentActivity.monthlyReportGenerated'),
      time: t('recentActivity.timeAgo.daysAgo', { days: 1 }),
      icon: BarChart3,
      color: 'secondary.main',
    },
  ];

  return (
    <AppBarLayout
      title={t('title')}
      subtitle={t('welcomeBack', { name: user.full_name })}
    >
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
            {t('quickActionsTitle')}
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
              {t('recentActivityTitle')}
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
    </AppBarLayout>
  );
}
