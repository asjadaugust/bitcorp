'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function SettingsPage() {
  const { isAuthenticated, isInitialized, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  useEffect(() => {
    if (
      isInitialized &&
      isAuthenticated &&
      !hasRole('admin') &&
      !hasRole('developer')
    ) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isInitialized, hasRole, router]);

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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            System Settings
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              System Settings Module
            </Typography>
            <Typography color="text.secondary">
              System configuration and preferences will be available here.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
