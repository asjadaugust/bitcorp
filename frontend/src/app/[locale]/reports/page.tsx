'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Breadcrumbs, Link } from '@mui/material';
import { AppBarLayout } from '@/components/layout/AppBarLayout';
import { useTranslations } from 'next-intl';
import {
  useKPIMetrics,
  useEquipmentPerformance,
  useAvailableReports,
  formatCurrency,
  formatPercentage,
} from '@/hooks/useReports';

// Types for reports

export default function ReportsPage() {
  const router = useRouter();
  const t = useTranslations();
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [dateRange, setDateRange] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('all');

  // Fetch data using SWR hooks
  const { data: kpiData } = useKPIMetrics(dateRange);
  const { data: equipmentData } = useEquipmentPerformance(
    selectedEquipment === 'all' ? undefined : selectedEquipment,
    dateRange
  );
  const { data: reportsData } = useAvailableReports();

  // Mock current user with admin role
  const mockCurrentUser = {
    id: 1,
    roles: [{ name: 'admin', permissions: ['reports.view', 'reports.export'] }],
  };

  const currentUser = mockCurrentUser;

  // Check permissions
  const canViewReports = currentUser?.roles?.some((role) =>
    role.permissions?.includes('reports.view')
  );

  const canExportReports = currentUser?.roles?.some((role) =>
    role.permissions?.includes('reports.export')
  );

  if (!canViewReports) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          You don&apos;t have permission to view reports. Contact your
          administrator.
        </Alert>
      </Container>
    );
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // In real app, this would trigger download or show success message
  };

  const handleExportPDF = async () => {
    if (!canExportReports) {
      alert("You don't have permission to export reports");
      return;
    }

    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsGenerating(false);
    // In real app, this would trigger PDF download
  };

  // Use real data if available, fallback to mock data for demonstration
  const kpiMetrics = kpiData
    ? [
        {
          id: 'utilization',
          title: 'Equipment Utilization Rate',
          value: formatPercentage(kpiData.equipment_utilization_rate),
          change: '+5%',
          trend: 'up',
          icon: <SpeedIcon />,
          color: 'success',
        },
        {
          id: 'cost_savings',
          title: 'Cost Savings vs Rental',
          value: formatCurrency(kpiData.cost_savings_vs_rental),
          change: '+12%',
          trend: 'up',
          icon: <MoneyIcon />,
          color: 'primary',
        },
        {
          id: 'timesheet_completion',
          title: 'Timesheet Completion Rate',
          value: formatPercentage(kpiData.timesheet_completion_rate),
          change: '+2%',
          trend: 'up',
          icon: <AssessmentIcon />,
          color: 'success',
        },
        {
          id: 'report_compliance',
          title: 'Daily Report Compliance',
          value: formatPercentage(kpiData.daily_report_compliance),
          change: 'stable',
          trend: 'stable',
          icon: <TrendingUpIcon />,
          color: 'success',
        },
        {
          id: 'downtime',
          title: 'Equipment Downtime',
          value: formatPercentage(kpiData.equipment_downtime),
          change: '-1.5%',
          trend: 'down',
          icon: <WarningIcon />,
          color: 'warning',
        },
        {
          id: 'roi',
          title: 'Average Equipment ROI',
          value: formatPercentage(kpiData.average_equipment_roi),
          change: '+18%',
          trend: 'up',
          icon: <ShowChartIcon />,
          color: 'primary',
        },
      ]
    : [
        {
          id: 'utilization',
          title: 'Equipment Utilization Rate',
          value: '87%',
          change: '+5%',
          trend: 'up',
          icon: <SpeedIcon />,
          color: 'success',
        },
        {
          id: 'cost_savings',
          title: 'Cost Savings vs Rental',
          value: '₹2.5M',
          change: '+12%',
          trend: 'up',
          icon: <MoneyIcon />,
          color: 'primary',
        },
        {
          id: 'timesheet_completion',
          title: 'Timesheet Completion Rate',
          value: '96%',
          change: '+2%',
          trend: 'up',
          icon: <AssessmentIcon />,
          color: 'success',
        },
        {
          id: 'report_compliance',
          title: 'Daily Report Compliance',
          value: '98%',
          change: 'stable',
          trend: 'stable',
          icon: <TrendingUpIcon />,
          color: 'success',
        },
        {
          id: 'downtime',
          title: 'Equipment Downtime',
          value: '4.2%',
          change: '-1.5%',
          trend: 'down',
          icon: <WarningIcon />,
          color: 'warning',
        },
        {
          id: 'roi',
          title: 'Average Equipment ROI',
          value: '285%',
          change: '+18%',
          trend: 'up',
          icon: <ShowChartIcon />,
          color: 'primary',
        },
      ];

  // Use real equipment data if available, fallback to mock data
  const equipmentReports = equipmentData || [
    {
      id: 1,
      equipment_name: 'CAT 320D Excavator',
      equipment_type: 'Excavator',
      utilization_rate: 89,
      total_hours: 186,
      cost_per_hour: 1200,
      total_cost: 223200,
      roi: 340,
      status: 'active',
    },
    {
      id: 2,
      equipment_name: 'Volvo A40F Truck',
      equipment_type: 'Dump Truck',
      utilization_rate: 92,
      total_hours: 201,
      cost_per_hour: 950,
      total_cost: 190950,
      roi: 280,
      status: 'active',
    },
    {
      id: 3,
      equipment_name: 'JCB 3CX Backhoe',
      equipment_type: 'Backhoe',
      utilization_rate: 78,
      total_hours: 156,
      cost_per_hour: 800,
      total_cost: 124800,
      roi: 195,
      status: 'maintenance',
    },
    {
      id: 4,
      equipment_name: 'Liebherr LTM 1050',
      equipment_type: 'Mobile Crane',
      utilization_rate: 85,
      total_hours: 145,
      cost_per_hour: 1800,
      total_cost: 261000,
      roi: 420,
      status: 'active',
    },
  ];

  // Use real reports data if available, fallback to mock data
  const availableReportsData = reportsData?.reports || [
    {
      id: 'equipment_valuation',
      name: 'Equipment Valuation Report',
      description: 'Comprehensive equipment usage statements and valuations',
      type: 'equipment',
      last_generated: '2024-08-15',
      format: 'PDF',
    },
    {
      id: 'performance_analytics',
      name: 'Performance Analytics Dashboard',
      description: 'Equipment costs, utilization, and ROI analysis',
      type: 'operational',
      last_generated: '2024-08-16',
      format: 'PDF',
    },
    {
      id: 'cost_analysis',
      name: 'Cost Analysis Report',
      description: 'Equipment usage costs and budget adherence',
      type: 'financial',
      last_generated: '2024-08-14',
      format: 'Excel',
    },
    {
      id: 'operator_performance',
      name: 'Operator Performance Report',
      description: 'Operator productivity and salary calculations',
      type: 'operational',
      last_generated: '2024-08-13',
      format: 'PDF',
    },
    {
      id: 'maintenance_schedule',
      name: 'Maintenance Schedule Report',
      description: 'Equipment maintenance tracking and optimization',
      type: 'maintenance',
      last_generated: '2024-08-12',
      format: 'CSV',
    },
  ];

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'idle':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '➡️';
      default:
        return '➡️';
    }
  };

  return (
    <AppBarLayout title={t('Reports.title')} subtitle={t('Reports.subtitle')}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={handleBackToDashboard}
              sx={{ mb: 1 }}
            >
              {t('Common.backToDashboard')}
            </Button>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                underline="hover"
                color="inherit"
                href="/dashboard"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {t('Navigation.dashboard')}
              </Link>
              <Typography color="text.primary">{t('Reports.title')}</Typography>
            </Breadcrumbs>
          </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {t('Reports.title')}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {t('Reports.subtitle')}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={
                  isGenerating ? (
                    <CircularProgress size={20} />
                  ) : (
                    <BarChartIcon />
                  )
                }
                disabled={isGenerating}
                onClick={handleGenerateReport}
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </Box>
          </Paper>

          {/* Filter Controls */}
          <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={selectedReportType}
                    label="Report Type"
                    onChange={(e) => setSelectedReportType(e.target.value)}
                  >
                    <MenuItem value="overview">Overview Dashboard</MenuItem>
                    <MenuItem value="equipment">Equipment Analysis</MenuItem>
                    <MenuItem value="financial">Financial Reports</MenuItem>
                    <MenuItem value="operational">Operational Metrics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange.toString()}
                    label="Date Range"
                    onChange={(e) => setDateRange(parseInt(e.target.value))}
                  >
                    <MenuItem value="7">Last 7 days</MenuItem>
                    <MenuItem value="30">Last 30 days</MenuItem>
                    <MenuItem value="90">Last 3 months</MenuItem>
                    <MenuItem value="365">Last year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Equipment Filter</InputLabel>
                  <Select
                    value={selectedEquipment}
                    label="Equipment Filter"
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                  >
                    <MenuItem value="all">All Equipment</MenuItem>
                    <MenuItem value="excavators">Excavators</MenuItem>
                    <MenuItem value="trucks">Dump Trucks</MenuItem>
                    <MenuItem value="cranes">Cranes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  fullWidth
                  onClick={() => window.location.reload()}
                >
                  Refresh Data
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* KPI Metrics Dashboard */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <TrendingUpIcon />
            Key Performance Indicators (KPIs)
          </Typography>
          <Grid container spacing={3}>
            {kpiMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={4} key={metric.id}>
                <Card elevation={1}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ color: `${metric.color}.main` }}>
                        {metric.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          fontSize="0.9rem"
                        >
                          {metric.title}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant="h4" component="div">
                            {metric.value}
                          </Typography>
                          <Chip
                            label={`${getTrendIcon(metric.trend)} ${
                              metric.change
                            }`}
                            size="small"
                            color={
                              metric.trend === 'up'
                                ? 'success'
                                : metric.trend === 'down'
                                ? 'error'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Equipment Performance Table */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <BuildIcon />
              Equipment Performance Analysis
            </Typography>
            {canExportReports && (
              <Button
                variant="outlined"
                startIcon={<PdfIcon />}
                onClick={handleExportPDF}
                disabled={isGenerating}
              >
                Export PDF
              </Button>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="center">Utilization Rate</TableCell>
                  <TableCell align="center">Total Hours</TableCell>
                  <TableCell align="center">Cost per Hour</TableCell>
                  <TableCell align="center">Total Cost</TableCell>
                  <TableCell align="center">ROI</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipmentReports.map((equipment) => (
                  <TableRow key={equipment.id} hover>
                    <TableCell>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {equipment.equipment_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{equipment.equipment_type}</TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          value={equipment.utilization_rate}
                          size={30}
                          color={
                            equipment.utilization_rate > 85
                              ? 'success'
                              : equipment.utilization_rate > 70
                              ? 'warning'
                              : 'error'
                          }
                        />
                        <Typography variant="body2">
                          {equipment.utilization_rate}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {equipment.total_hours}h
                    </TableCell>
                    <TableCell align="center">
                      ₹{equipment.cost_per_hour.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      ₹{equipment.total_cost.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${equipment.roi}%`}
                        color={
                          equipment.roi > 300
                            ? 'success'
                            : equipment.roi > 200
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={equipment.status}
                        color={getStatusColor(equipment.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Available Reports Section */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <DownloadIcon />
            Available Reports
          </Typography>
          <Grid container spacing={3}>
            {availableReportsData.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card elevation={1}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {report.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      paragraph
                    >
                      {report.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Chip label={report.type} size="small" />
                      <Chip
                        label={report.format}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      gutterBottom
                    >
                      Last generated:{' '}
                      {new Date(report.last_generated).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleGenerateReport}
                        disabled={isGenerating}
                      >
                        Generate
                      </Button>
                      {canExportReports && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={handleExportPDF}
                          disabled={isGenerating}
                        >
                          Download
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </AppBarLayout>
  );
}
