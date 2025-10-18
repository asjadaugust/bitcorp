/**
 * Premium IoT Equipment Dashboard
 * High-value predictive maintenance visualization
 * Revenue-generating feature for subscription upgrades
 */
'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Sensors as SensorsIcon,
  CurrencyRupee as CurrencyRupeeIcon,
  Refresh as RefreshIcon,
  Upgrade as UpgradeIcon,
} from '@mui/icons-material';
import { useEquipmentIoTDashboard, iotMutations } from '@/hooks/useIoT';

interface Alert {
  id: number;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  action: string;
  created: string;
}

interface SensorData {
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  latest_timestamp: string;
}

interface PredictedSavings {
  annual_savings: number;
  monthly_savings: number;
  breakdown: {
    breakdown_prevention: number;
    early_detection: number;
    fuel_efficiency: number;
    extended_lifespan: number;
  };
  roi_multiple: number;
}

interface IoTDashboardProps {
  equipmentId: number;
  isTrialUser?: boolean;
  onUpgrade?: () => void;
}

const HealthScoreGauge: React.FC<{
  score: number;
  label: string;
  color?: string;
}> = ({ score, label, color }) => {
  const theme = useTheme();

  const getScoreColor = (score: number) => {
    if (color) return color;
    if (score >= 90) return theme.palette.success.main;
    if (score >= 75) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box textAlign="center">
      <Box position="relative" display="inline-flex">
        <CircularProgress
          variant="determinate"
          value={score}
          size={80}
          thickness={6}
          sx={{ color: getScoreColor(score) }}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6" component="div" color="text.secondary">
            {score}%
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        {label}
      </Typography>
    </Box>
  );
};

const SensorCard: React.FC<{ sensorType: string; data: SensorData }> = ({
  sensorType,
  data,
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUpIcon color="success" />;
      case 'down':
        return <TrendingDownIcon color="error" />;
      default:
        return <CheckCircleIcon color="primary" />;
    }
  };

  const formatSensorName = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" component="h3">
            {formatSensorName(sensorType)}
          </Typography>
          {getTrendIcon(data.trend)}
        </Box>

        <Typography variant="h4" color="primary" gutterBottom>
          {data.current} {data.unit}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Avg: {data.average} {data.unit} | Range: {data.min}-{data.max}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={(data.current / data.max) * 100}
          sx={{ mt: 1, height: 6, borderRadius: 3 }}
        />
      </CardContent>
    </Card>
  );
};

const AlertCard: React.FC<{
  alerts: Alert[];
  onResolve?: (alertId: number) => void;
}> = ({ alerts, onResolve }) => {
  const getSeverityColor = (
    severity: string
  ): 'error' | 'warning' | 'info' | 'success' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon />;
      case 'high':
        return <WarningIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <WarningIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Active Alerts ({alerts.length})</Typography>
        </Box>

        {alerts.length === 0 ? (
          <Alert severity="success">
            No active alerts - Equipment is operating normally
          </Alert>
        ) : (
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={getSeverityColor(alert.severity)}
                icon={getSeverityIcon(alert.severity)}
                action={
                  onResolve && (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => onResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  )
                }
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle2">{alert.message}</Typography>
                <Typography variant="caption" display="block">
                  Action: {alert.action}
                </Typography>
              </Alert>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const ROICard: React.FC<{ savings: PredictedSavings }> = ({ savings }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <CurrencyRupeeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" color="inherit">
            Predicted Savings
          </Typography>
        </Box>

        <Typography variant="h3" color="inherit" gutterBottom>
          {formatCurrency(savings.annual_savings)}
        </Typography>
        <Typography variant="body2" color="inherit" gutterBottom>
          Annual savings potential
        </Typography>

        <Box mt={2}>
          <Typography variant="subtitle2" color="inherit">
            ROI: {savings.roi_multiple}x return on investment
          </Typography>
          <Typography variant="caption" color="inherit" display="block">
            Monthly savings: {formatCurrency(savings.monthly_savings)}
          </Typography>
        </Box>

        <Box mt={2}>
          <Typography variant="caption" color="inherit" display="block">
            • Breakdown prevention:{' '}
            {formatCurrency(savings.breakdown.breakdown_prevention)}
          </Typography>
          <Typography variant="caption" color="inherit" display="block">
            • Early detection:{' '}
            {formatCurrency(savings.breakdown.early_detection)}
          </Typography>
          <Typography variant="caption" color="inherit" display="block">
            • Fuel efficiency:{' '}
            {formatCurrency(savings.breakdown.fuel_efficiency)}
          </Typography>
          <Typography variant="caption" color="inherit" display="block">
            • Extended lifespan:{' '}
            {formatCurrency(savings.breakdown.extended_lifespan)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const UpgradePrompt: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => (
  <Card
    sx={{
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      color: 'white',
      mb: 3,
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" color="inherit" gutterBottom>
            🚀 Unlock Premium IoT Features
          </Typography>
          <Typography variant="body2" color="inherit">
            Get AI-powered predictive maintenance, real-time monitoring, and
            save ₹12.5L annually
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<UpgradeIcon />}
          onClick={onUpgrade}
          sx={{
            bgcolor: 'rgba(255,255,255,0.2)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
          }}
        >
          Upgrade Now
        </Button>
      </Box>
    </CardContent>
  </Card>
);

export const IoTDashboard: React.FC<IoTDashboardProps> = ({
  equipmentId,
  isTrialUser = false,
  onUpgrade,
}) => {
  // Use SWR for data fetching with real-time updates
  const {
    data: dashboardData,
    error,
    isLoading: loading,
    mutate: refreshDashboard,
  } = useEquipmentIoTDashboard(equipmentId);

  const handleResolveAlert = async (alertId: number) => {
    try {
      await iotMutations.resolveAlert(alertId);
      // Refresh dashboard data after resolving alert
      await refreshDashboard();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error?.message ||
          error?.toString() ||
          'An error occurred loading IoT data'}
        <Button onClick={refreshDashboard} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info">
        No IoT data available for this equipment. Install IoT sensors to start
        monitoring.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Trial user upgrade prompt */}
      {isTrialUser && onUpgrade && <UpgradePrompt onUpgrade={onUpgrade} />}

      {/* Header with refresh */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Equipment Health Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={refreshDashboard}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Health Scores */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Health Scores
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={2}>
              <HealthScoreGauge
                score={dashboardData.health_score.overall}
                label="Overall"
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <HealthScoreGauge
                score={dashboardData.health_score.engine}
                label="Engine"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <HealthScoreGauge
                score={dashboardData.health_score.hydraulic}
                label="Hydraulic"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <HealthScoreGauge
                score={dashboardData.health_score.transmission}
                label="Transmission"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <HealthScoreGauge
                score={dashboardData.health_score.electrical}
                label="Electrical"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <HealthScoreGauge
                score={dashboardData.health_score.structural}
                label="Structural"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Alerts and ROI */}
        <Grid item xs={12} md={8}>
          <AlertCard
            alerts={dashboardData.alerts}
            onResolve={handleResolveAlert}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ROICard savings={dashboardData.predicted_savings} />
        </Grid>

        {/* Sensor Data */}
        {Object.entries(dashboardData.sensor_summary).map(
          ([sensorType, data]) => (
            <Grid item xs={12} sm={6} md={4} key={sensorType}>
              <SensorCard sensorType={sensorType} data={data} />
            </Grid>
          )
        )}

        {/* IoT Devices Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IoT Devices Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Device ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Communication</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.iot_devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>{device.device_id}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<SensorsIcon />}
                            label={device.type}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={device.status}
                            color={
                              device.status === 'online' ? 'success' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {device.last_communication
                            ? new Date(
                                device.last_communication
                              ).toLocaleString()
                            : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IoTDashboard;
