'use client';

import {
  Container,
  Typography,
  Paper,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Settings,
  AccountCircle,
  Security,
  Notifications,
  Computer,
} from '@mui/icons-material';
import { AppBarLayout } from '@/components/layout/AppBarLayout';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations();

  return (
    <AppBarLayout title={t('settings.title')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Settings sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            {t('settings.title')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Account Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountCircle sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    {t('settings.account.title')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={t('settings.account.displayName')}
                    defaultValue="System Administrator"
                    variant="outlined"
                    size="small"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={t('settings.account.email')}
                    defaultValue="admin@bitcorp.com"
                    variant="outlined"
                    size="small"
                    type="email"
                  />
                </Box>
                <Button variant="contained" size="small">
                  {t('Common.save')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    {t('settings.security.title')}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.security.twoFactor')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.security.sessionTimeout')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch />}
                  label={t('settings.security.loginAlerts')}
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" size="small">
                  {t('settings.security.changePassword')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    {t('settings.notifications.title')}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.notifications.email')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.notifications.push')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch />}
                  label={t('settings.notifications.sms')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.notifications.equipmentAlerts')}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* System Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Computer sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    {t('settings.system.title')}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.system.darkMode')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label={t('settings.system.autoBackup')}
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch />}
                  label={t('settings.system.maintenanceMode')}
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" size="small" color="error">
                  {t('settings.system.clearCache')}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* System Information */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('settings.systemInfo.title')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('settings.systemInfo.version')}
              </Typography>
              <Typography variant="body1">Bitcorp ERP v1.0.0</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('settings.systemInfo.lastUpdate')}
              </Typography>
              <Typography variant="body1">August 16, 2025</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('settings.systemInfo.database')}
              </Typography>
              <Typography variant="body1">PostgreSQL 15.3</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                {t('settings.systemInfo.uptime')}
              </Typography>
              <Typography variant="body1">2 days, 14 hours</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </AppBarLayout>
  );
}
