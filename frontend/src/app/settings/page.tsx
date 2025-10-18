'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  TextField,
  Button,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Settings as SettingsIcon,
  Security,
  Storage as Database,
  NotificationsActive as Notifications,
  Business as Company,
  Mail,
  Smartphone,
  Language as Globe,
  Storage as HardDrive,
  LocalShipping as Truck,
  BarChart,
  Download,
  Home,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasPermission, isInitialized } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(
    null
  );
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Bitcorp Construction',
    companyEmail: 'info@bitcorp.com',
    companyPhone: '+1-555-0123',
    timeZone: 'America/New_York',
    language: 'en',
    currency: 'USD',

    // Equipment Settings
    defaultEquipmentStatus: 'available',
    maintenanceReminderDays: 30,
    equipmentRetirementYears: 10,
    fuelTrackingEnabled: true,
    autoAssignmentEnabled: true,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReportReminders: true,
    maintenanceAlerts: true,

    // Security Settings
    sessionTimeoutMinutes: 60,
    passwordExpirationDays: 90,
    twoFactorAuthRequired: false,
    loginAttemptLimit: 5,

    // Reporting Settings
    defaultReportFormat: 'pdf',
    autoGenerateReports: false,
    reportRetentionDays: 365,

    // System Settings
    backupFrequency: 'daily',
    logRetentionDays: 30,
    maintenanceMode: false,
    debugMode: false,
  });

  // Authentication check
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Loading state while checking authentication
  if (!isInitialized || (isInitialized && !isAuthenticated)) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Check permissions
  const canViewSettings =
    user &&
    (hasPermission('settings:read') ||
      hasPermission('system_admin') ||
      hasPermission('admin') ||
      user.roles?.some((role) => ['admin', 'developer'].includes(role.name)));

  const canUpdateSettings =
    user &&
    (hasPermission('settings:update') ||
      hasPermission('system_admin') ||
      hasPermission('admin') ||
      user.roles?.some((role) => ['admin', 'developer'].includes(role.name)));

  if (!canViewSettings) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          You don&apos;t have permission to view system settings. Contact your
          administrator.
        </Alert>
      </Container>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSettingChange = (
    section: string,
    key: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [`${section}${key.charAt(0).toUpperCase() + key.slice(1)}`]: value,
    }));
  };

  const handleSave = async () => {
    if (!canUpdateSettings) {
      setSaveStatus('error');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `bitcorp-settings-${
      new Date().toISOString().split('T')[0]
    }.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleBackupDatabase = async () => {
    setLoading(true);
    try {
      // Mock API call for backup
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Database backup initiated successfully');
    } catch {
      alert('Failed to initiate database backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              System Settings
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 0.5 }}>
              <Link
                underline="hover"
                color="inherit"
                href="/dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/dashboard');
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Home sx={{ mr: 0.5, fontSize: 16 }} />
                Dashboard
              </Link>
              <Typography
                color="text.primary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <SettingsIcon sx={{ mr: 0.5, fontSize: 16 }} />
                System Settings
              </Typography>
            </Breadcrumbs>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {saveStatus === 'success' && (
              <Alert severity="success" sx={{ py: 0 }}>
                Settings saved successfully
              </Alert>
            )}
            {saveStatus === 'error' && (
              <Alert severity="error" sx={{ py: 0 }}>
                Failed to save settings
              </Alert>
            )}

            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportSettings}
              disabled={loading}
            >
              Export
            </Button>

            {canUpdateSettings && (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: 2,
            }}
          >
            <Tab icon={<Company />} label="General" />
            <Tab icon={<Truck />} label="Equipment" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Security />} label="Security" />
            <Tab icon={<BarChart />} label="Reports" />
            <Tab icon={<Database />} label="System" />
          </Tabs>

          {/* General Settings Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Company Information" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Company Name"
                          value={settings.companyName}
                          onChange={(e) =>
                            handleSettingChange(
                              'company',
                              'name',
                              e.target.value
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Company Email"
                          type="email"
                          value={settings.companyEmail}
                          onChange={(e) =>
                            handleSettingChange(
                              'company',
                              'email',
                              e.target.value
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Company Phone"
                          value={settings.companyPhone}
                          onChange={(e) =>
                            handleSettingChange(
                              'company',
                              'phone',
                              e.target.value
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Regional Settings" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Time Zone</InputLabel>
                          <Select
                            value={settings.timeZone}
                            onChange={(e) =>
                              handleSettingChange(
                                '',
                                'timeZone',
                                e.target.value
                              )
                            }
                            disabled={!canUpdateSettings}
                          >
                            <MenuItem value="America/New_York">
                              Eastern Time (ET)
                            </MenuItem>
                            <MenuItem value="America/Chicago">
                              Central Time (CT)
                            </MenuItem>
                            <MenuItem value="America/Denver">
                              Mountain Time (MT)
                            </MenuItem>
                            <MenuItem value="America/Los_Angeles">
                              Pacific Time (PT)
                            </MenuItem>
                            <MenuItem value="UTC">UTC</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={settings.language}
                            onChange={(e) =>
                              handleSettingChange(
                                '',
                                'language',
                                e.target.value
                              )
                            }
                            disabled={!canUpdateSettings}
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="es">Spanish</MenuItem>
                            <MenuItem value="fr">French</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Currency</InputLabel>
                          <Select
                            value={settings.currency}
                            onChange={(e) =>
                              handleSettingChange(
                                '',
                                'currency',
                                e.target.value
                              )
                            }
                            disabled={!canUpdateSettings}
                          >
                            <MenuItem value="USD">US Dollar (USD)</MenuItem>
                            <MenuItem value="EUR">Euro (EUR)</MenuItem>
                            <MenuItem value="CAD">
                              Canadian Dollar (CAD)
                            </MenuItem>
                            <MenuItem value="MXN">Mexican Peso (MXN)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Equipment Settings Tab */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Equipment Defaults" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Default Equipment Status</InputLabel>
                          <Select
                            value={settings.defaultEquipmentStatus}
                            onChange={(e) =>
                              handleSettingChange(
                                'defaultEquipment',
                                'status',
                                e.target.value
                              )
                            }
                            disabled={!canUpdateSettings}
                          >
                            <MenuItem value="available">Available</MenuItem>
                            <MenuItem value="in-use">In Use</MenuItem>
                            <MenuItem value="maintenance">Maintenance</MenuItem>
                            <MenuItem value="out-of-service">
                              Out of Service
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Maintenance Reminder (days)"
                          type="number"
                          value={settings.maintenanceReminderDays}
                          onChange={(e) =>
                            handleSettingChange(
                              'maintenanceReminder',
                              'days',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Equipment Retirement (years)"
                          type="number"
                          value={settings.equipmentRetirementYears}
                          onChange={(e) =>
                            handleSettingChange(
                              'equipmentRetirement',
                              'years',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Equipment Features" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Fuel Tracking"
                          secondary="Track fuel consumption for equipment"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.fuelTrackingEnabled}
                            onChange={(e) =>
                              handleSettingChange(
                                'fuelTracking',
                                'enabled',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Auto Assignment"
                          secondary="Automatically assign equipment to operators"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.autoAssignmentEnabled}
                            onChange={(e) =>
                              handleSettingChange(
                                'autoAssignment',
                                'enabled',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Notification Channels" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <Mail />
                        </ListItemIcon>
                        <ListItemText
                          primary="Email Notifications"
                          secondary="Receive notifications via email"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.emailNotifications}
                            onChange={(e) =>
                              handleSettingChange(
                                'email',
                                'notifications',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Smartphone />
                        </ListItemIcon>
                        <ListItemText
                          primary="SMS Notifications"
                          secondary="Receive notifications via SMS"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.smsNotifications}
                            onChange={(e) =>
                              handleSettingChange(
                                'sms',
                                'notifications',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Globe />
                        </ListItemIcon>
                        <ListItemText
                          primary="Push Notifications"
                          secondary="Receive browser push notifications"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.pushNotifications}
                            onChange={(e) =>
                              handleSettingChange(
                                'push',
                                'notifications',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Alert Types" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Daily Report Reminders"
                          secondary="Remind operators to submit daily reports"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.dailyReportReminders}
                            onChange={(e) =>
                              handleSettingChange(
                                'dailyReport',
                                'reminders',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Maintenance Alerts"
                          secondary="Alert when equipment needs maintenance"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.maintenanceAlerts}
                            onChange={(e) =>
                              handleSettingChange(
                                'maintenance',
                                'alerts',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Security Settings Tab */}
          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Session Management" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Session Timeout (minutes)"
                          type="number"
                          value={settings.sessionTimeoutMinutes}
                          onChange={(e) =>
                            handleSettingChange(
                              'sessionTimeout',
                              'minutes',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Password Expiration (days)"
                          type="number"
                          value={settings.passwordExpirationDays}
                          onChange={(e) =>
                            handleSettingChange(
                              'passwordExpiration',
                              'days',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Login Attempt Limit"
                          type="number"
                          value={settings.loginAttemptLimit}
                          onChange={(e) =>
                            handleSettingChange(
                              'loginAttempt',
                              'limit',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Authentication" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <ShieldIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Two-Factor Authentication"
                          secondary="Require 2FA for all users"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.twoFactorAuthRequired}
                            onChange={(e) =>
                              handleSettingChange(
                                'twoFactorAuth',
                                'required',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Reports Settings Tab */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Report Defaults" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Default Report Format</InputLabel>
                          <Select
                            value={settings.defaultReportFormat}
                            onChange={(e) =>
                              handleSettingChange(
                                'defaultReport',
                                'format',
                                e.target.value
                              )
                            }
                            disabled={!canUpdateSettings}
                          >
                            <MenuItem value="pdf">PDF</MenuItem>
                            <MenuItem value="excel">Excel</MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="html">HTML</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Report Retention (days)"
                          type="number"
                          value={settings.reportRetentionDays}
                          onChange={(e) =>
                            handleSettingChange(
                              'reportRetention',
                              'days',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Report Generation" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Auto-Generate Reports"
                          secondary="Automatically generate daily reports"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.autoGenerateReports}
                            onChange={(e) =>
                              handleSettingChange(
                                'autoGenerate',
                                'reports',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* System Settings Tab */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Backup & Maintenance" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Backup Frequency</InputLabel>
                          <Select
                            value={settings.backupFrequency}
                            onChange={(e) =>
                              handleSettingChange(
                                'backup',
                                'frequency',
                                e.target.value
                              )
                            }
                            disabled={!canUpdateSettings}
                          >
                            <MenuItem value="hourly">Hourly</MenuItem>
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Log Retention (days)"
                          type="number"
                          value={settings.logRetentionDays}
                          onChange={(e) =>
                            handleSettingChange(
                              'logRetention',
                              'days',
                              parseInt(e.target.value)
                            )
                          }
                          disabled={!canUpdateSettings}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<HardDrive />}
                          onClick={handleBackupDatabase}
                          disabled={loading || !canUpdateSettings}
                        >
                          Backup Database Now
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="System Status" />
                  <CardContent>
                    <List>
                      <ListItem>
                        <ListItemText
                          primary="Maintenance Mode"
                          secondary="Put system in maintenance mode"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.maintenanceMode}
                            onChange={(e) =>
                              handleSettingChange(
                                'maintenance',
                                'mode',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Debug Mode"
                          secondary="Enable debug logging"
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={settings.debugMode}
                            onChange={(e) =>
                              handleSettingChange(
                                'debug',
                                'mode',
                                e.target.checked
                              )
                            }
                            disabled={!canUpdateSettings}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  );
}
