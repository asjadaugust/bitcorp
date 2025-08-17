'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Badge,
} from '@mui/material';
import {
  Security as Shield,
  Person as User,
  Notifications as Bell,
  Logout as LogOut,
} from '@mui/icons-material';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface AppBarLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppBarLayout({ children, title, subtitle }: AppBarLayoutProps) {
  const { user, isAuthenticated, logout, isInitialized } = useAuth();
  const router = useRouter();
  const t = useTranslations('Common');

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
            {!isAuthenticated ? t('redirectingToLogin') : t('loading')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              {title || t('appTitle')}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications */}
            <IconButton>
              <Badge badgeContent={1} color="error">
                <Bell />
              </Badge>
            </IconButton>

            {/* Language Switcher */}
            <LanguageSwitcher />

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
              <IconButton
                onClick={() => logout()}
                color="error"
                title={t('logout')}
              >
                <LogOut />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      {children}
    </Box>
  );
}
