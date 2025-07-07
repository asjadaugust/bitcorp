'use client'

import React, { Suspense } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Paper,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person,
  Lock,
} from '@mui/icons-material'

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoginPending, error, isInitialized } = useAuth()
  const [showPassword, setShowPassword] = React.useState(false)
  
  const message = searchParams.get('message')

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already authenticated - but only after initialization
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isInitialized, router])

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  // Show loading state while initializing or checking authentication to prevent flicker
  if (!isInitialized || (isInitialized && isAuthenticated)) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary"
              sx={{ mb: 2 }}
            >
              {isAuthenticated ? 'Redirecting to dashboard...' : 'Loading...'}
            </Typography>
          </Box>
        </Container>
      </Box>
    )
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
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              {/* Username/Email Field */}
              <Controller
                name="username"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Username or Email"
                    variant="outlined"
                    margin="normal"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your username or email"
                  />
                )}
              />

              {/* Password Field */}
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    margin="normal"
                    error={!!errors.password}
                    helperText={errors.password?.message}
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
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="Enter your password"
                  />
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoginPending}
                startIcon={!isLoginPending ? <LoginIcon /> : undefined}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoginPending ? 'Signing in...' : 'Sign In'}
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
              <Typography variant="caption" display="block" fontWeight="medium" gutterBottom>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                <strong>Admin:</strong> admin@bitcorp.com / admin123!
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                <strong>Developer:</strong> developer@bitcorp.com / dev123!
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
