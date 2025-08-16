'use client';

import React from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Blue-600 equivalent
      dark: '#1d4ed8', // Blue-700 equivalent
    },
    secondary: {
      main: '#059669', // Green-600 equivalent
      dark: '#047857', // Green-700 equivalent
    },
    error: {
      main: '#dc2626', // Red-600 equivalent
    },
    warning: {
      main: '#d97706', // Orange-600 equivalent
    },
    success: {
      main: '#059669', // Green-600 equivalent
    },
    background: {
      default: '#f8fafc', // Gray-50 equivalent
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Gray-900 equivalent
      secondary: '#6b7280', // Gray-500 equivalent
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.25rem', // text-4xl equivalent
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem', // text-3xl equivalent
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem', // text-2xl equivalent
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem', // text-xl equivalent
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem', // text-lg equivalent
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem', // text-base equivalent
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem', // text-sm equivalent
      lineHeight: 1.4,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '0.5rem', // rounded-lg equivalent
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          fontWeight: 500,
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem', // rounded-lg equivalent
            '& fieldset': {
              borderColor: '#d1d5db', // gray-300 equivalent
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af', // gray-400 equivalent
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb', // blue-600 equivalent
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '0.75rem', // rounded-xl equivalent
          boxShadow:
            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem', // rounded-lg equivalent
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
