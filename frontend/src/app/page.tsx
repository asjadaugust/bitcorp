'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    </Box>
  );
}
