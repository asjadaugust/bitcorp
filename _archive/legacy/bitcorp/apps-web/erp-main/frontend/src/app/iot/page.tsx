'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  Tab,
  Tabs,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Sensors as SensorsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Upgrade as UpgradeIcon,
} from '@mui/icons-material';
import { IoTDashboard } from '@/components/IoTDashboard';

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
      id={`iot-tabpanel-${index}`}
      aria-labelledby={`iot-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IoTPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Demo equipment IDs (in real app, these would come from API)
  const demoEquipmentIds = [1, 2, 3];

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleUpgrade = () => {
    setUpgradeDialogOpen(true);
  };

  const handleCloseUpgradeDialog = () => {
    setUpgradeDialogOpen(false);
  };

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
            <Typography color="text.primary">IoT Monitoring</Typography>
          </Breadcrumbs>
        </Box>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <SensorsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                IoT Equipment Monitoring
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Real-time equipment health monitoring and predictive maintenance
              </Typography>
            </Box>
          </Box>

          {/* Premium Features Banner */}
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              mb: 3,
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={8}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <TrendingUpIcon sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Premium IoT Features Active
                      </Typography>
                      <Typography variant="body2">
                        Projected annual savings: ₹12.5 lakhs per machine • 348x
                        ROI • Real-time monitoring
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                  sx={{ textAlign: { xs: 'left', md: 'right' } }}
                >
                  <Chip
                    label="PREMIUM"
                    sx={{
                      bgcolor: 'rgba(255,215,0,0.9)',
                      color: 'black',
                      fontWeight: 'bold',
                      mr: 1,
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleUpgrade}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Upgrade Plan
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        {/* Equipment Selection Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="equipment selection tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="JCB Excavator 3CX"
              id="iot-tab-0"
              aria-controls="iot-tabpanel-0"
            />
            <Tab
              label="Concrete Mixer Truck"
              id="iot-tab-1"
              aria-controls="iot-tabpanel-1"
            />
            <Tab
              label="Tower Crane TC-7032"
              id="iot-tab-2"
              aria-controls="iot-tabpanel-2"
            />
          </Tabs>
        </Box>

        {/* Equipment IoT Dashboards */}
        <TabPanel value={currentTab} index={0}>
          <IoTDashboard
            equipmentId={demoEquipmentIds[0]}
            isTrialUser={false}
            onUpgrade={handleUpgrade}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <IoTDashboard
            equipmentId={demoEquipmentIds[1]}
            isTrialUser={false}
            onUpgrade={handleUpgrade}
          />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <IoTDashboard
            equipmentId={demoEquipmentIds[2]}
            isTrialUser={false}
            onUpgrade={handleUpgrade}
          />
        </TabPanel>

        {/* Fleet Overview (if needed) */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Fleet Overview
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Equipment Health
                  </Typography>
                  <Typography variant="h3">94%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average across all equipment
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    Active Devices
                  </Typography>
                  <Typography variant="h3">12</Typography>
                  <Typography variant="body2" color="text.secondary">
                    IoT sensors connected
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    Pending Alerts
                  </Typography>
                  <Typography variant="h3">3</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Require immediate attention
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Upgrade Dialog */}
      <Dialog
        open={upgradeDialogOpen}
        onClose={handleCloseUpgradeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <UpgradeIcon color="primary" />
            Upgrade to Premium IoT
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Unlock advanced IoT features and get maximum value from your
            equipment monitoring.
          </Alert>
          <Typography variant="body1" paragraph>
            Premium IoT features include:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">
              Advanced predictive analytics
            </Typography>
            <Typography component="li" variant="body2">
              Custom alert thresholds
            </Typography>
            <Typography component="li" variant="body2">
              Historical trend analysis
            </Typography>
            <Typography component="li" variant="body2">
              Automated maintenance scheduling
            </Typography>
            <Typography component="li" variant="body2">
              ROI optimization reports
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpgradeDialog}>Maybe Later</Button>
          <Button variant="contained" onClick={handleCloseUpgradeDialog}>
            Upgrade Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
