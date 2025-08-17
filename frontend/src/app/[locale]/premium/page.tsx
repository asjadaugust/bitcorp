/**
 * Premium Features Page - Special Design
 * Token-gated premium features with distinctive styling
 */

'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Star,
  TrendingUp,
  Analytics,
  Speed,
  Security,
  Support,
  AutoAwesome,
  Diamond,
} from '@mui/icons-material';

export default function PremiumPage() {
  const theme = useTheme();

  const premiumFeatures = [
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'AI-powered insights and predictive maintenance',
      status: 'available',
    },
    {
      icon: <TrendingUp />,
      title: 'Performance Optimization',
      description: 'Equipment utilization optimization algorithms',
      status: 'available',
    },
    {
      icon: <Speed />,
      title: 'Real-time Monitoring',
      description: 'Live equipment telemetry and alerts',
      status: 'coming-soon',
    },
    {
      icon: <Security />,
      title: 'Enhanced Security',
      description: 'Advanced user permissions and audit trails',
      status: 'available',
    },
    {
      icon: <Support />,
      title: 'Priority Support',
      description: '24/7 dedicated support channel',
      status: 'available',
    },
    {
      icon: <AutoAwesome />,
      title: 'AI Assistant',
      description: 'Intelligent scheduling and resource planning',
      status: 'beta',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 50%, ${theme.palette.primary.main} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', pt: 8, pb: 8 }}>
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              mb: 2,
              p: 1,
              borderRadius: 50,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Diamond sx={{ color: '#FFD700', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PREMIUM
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            Unlock Advanced Features
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Take your equipment management to the next level with AI-powered insights and advanced analytics
          </Typography>

          {/* Token Status */}
          <Card
            sx={{
              maxWidth: 400,
              mx: 'auto',
              mb: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Plan
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="body1">Free Tier</Typography>
                <Chip
                  icon={<Star />}
                  label="Upgrade Available"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={30}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                }}
              />
              <Typography variant="body2" color="textSecondary">
                3 of 10 premium features unlocked
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3} mb={6}>
          {premiumFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white',
                        mr: 2,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {feature.title}
                      </Typography>
                      <Chip
                        label={
                          feature.status === 'available' ? 'Available' :
                          feature.status === 'beta' ? 'Beta' : 'Coming Soon'
                        }
                        size="small"
                        color={
                          feature.status === 'available' ? 'success' :
                          feature.status === 'beta' ? 'warning' : 'default'
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box textAlign="center">
          <Card
            sx={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 4,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <Typography variant="h5" fontWeight="bold" mb={2}>
              Ready to Upgrade?
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={3}>
              Contact your administrator to enable premium features for your organization
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: 50,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              Contact Administrator
            </Button>
          </Card>
        </Box>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
}
