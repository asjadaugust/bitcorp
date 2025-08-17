'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import {
  Login as LoginIcon,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized } = useAuth();

  // Handle authentication redirect
  React.useEffect(() => {
    if (isInitialized && isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [isAuthenticated, isInitialized, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, simulate authentication
      if (email && password) {
        // Store demo authentication
        localStorage.setItem('demo_auth_token', 'demo-token-123');
        localStorage.setItem(
          'demo_user',
          JSON.stringify({
            id: 1,
            email: email,
            name: 'Demo User',
            role: 'admin',
          })
        );

        setTimeout(() => {
          const returnUrl = searchParams.get('returnUrl') || '/dashboard';
          router.push(returnUrl);
        }, 1000);
      } else {
        setError('Please enter both email and password');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during login';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
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
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              {isAuthenticated ? 'Redirecting to dashboard...' : 'Loading...'}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Paper
            elevation={3}
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main',
            }}
          >
            <LoginIcon sx={{ fontSize: 32, color: 'white' }} />
          </Paper>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Bitcorp ERP
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your account to continue
          </Typography>
        </Box>

        {/* Success Message */}
        {message && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                placeholder="admin@bitcorp.com"
                disabled={isLoading}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                placeholder="Enter your password"
                disabled={isLoading}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={!isLoading ? <LoginIcon /> : undefined}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Register Link */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Link href="/register" style={{ color: 'inherit' }}>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'medium',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Create one here
                  </Typography>
                </Link>
              </Typography>
            </Box>

            {/* Demo Credentials */}
            <Paper
              variant="outlined"
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'grey.50',
              }}
            >
              <Typography
                variant="caption"
                display="block"
                fontWeight="medium"
                gutterBottom
              >
                Demo Credentials:
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                <strong>Admin:</strong> admin@bitcorp.com / admin123!
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
              >
                <strong>Developer:</strong> developer@bitcorp.com / dev123!
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
