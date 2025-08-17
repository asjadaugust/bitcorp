'use client';

import React, { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { AppBarLayout } from '@/components/layout/AppBarLayout';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  roles: Role[];
}

interface Role {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
}

// Mock current user with admin role for now
const mockCurrentUser = {
  id: 1,
  roles: [
    {
      name: 'admin',
      id: 1,
      description: 'Administrator',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      permissions: [],
    },
  ],
};

export default function UserManagementPage() {
  const router = useRouter();
  const t = useTranslations('Users');
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const currentUser = mockCurrentUser;

  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  // Check permissions
  const canManageUsers = currentUser?.roles?.some(
    (role: Role) => role.name === 'admin' || role.name === 'supervisor'
  );

  const canCreateUsers = currentUser?.roles?.some(
    (role: Role) => role.name === 'admin'
  );

  if (!canManageUsers) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          You don&apos;t have permission to access user management.
        </Alert>
      </Container>
    );
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getRoleColor = (roleName: string) => {
    const colors: {
      [key: string]:
        | 'default'
        | 'primary'
        | 'secondary'
        | 'error'
        | 'info'
        | 'success'
        | 'warning';
    } = {
      admin: 'error',
      supervisor: 'warning',
      planning_engineer: 'primary',
      cost_engineer: 'info',
      hr_personnel: 'secondary',
      operator: 'success',
    };
    return colors[roleName] || 'default';
  };

  // Mock data for now
  const mockUsers: User[] = [
    {
      id: 1,
      email: 'admin@bitcorp.com',
      username: 'admin',
      first_name: 'System',
      last_name: 'Administrator',
      full_name: 'System Administrator',
      is_active: true,
      is_verified: true,
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-08-16T10:00:00Z',
      roles: [
        {
          id: 1,
          name: 'admin',
          description: 'Administrator',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          permissions: [],
        },
      ],
    },
    {
      id: 2,
      email: 'john.operator@bitcorp.com',
      username: 'john.operator',
      first_name: 'John',
      last_name: 'Operator',
      full_name: 'John Operator',
      is_active: true,
      is_verified: true,
      created_at: '2024-01-02T00:00:00Z',
      last_login: '2024-08-15T14:30:00Z',
      roles: [
        {
          id: 6,
          name: 'operator',
          description: 'Equipment Operator',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          permissions: [],
        },
      ],
    },
  ];

  const users = mockUsers;
  const total = mockUsers.length;

  return (
    <AppBarLayout title={t('title')} subtitle={t('subtitle')}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box>
          {/* Navigation Breadcrumbs */}
          <Box display="flex" alignItems="center" mb={3}>
            <IconButton
              onClick={handleBackToDashboard}
              sx={{ mr: 2 }}
              aria-label={tCommon('back')}
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
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                {tNav('dashboard')}
              </Link>
              <Typography color="text.primary">{tNav('users')}</Typography>
            </Breadcrumbs>
          </Box>

          {/* Page Header */}
          <Box sx={{ mb: 4 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h3" component="h1" gutterBottom>
                    {t('title')}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('subtitle')}
                  </Typography>
                </Box>
              </Box>

              {canCreateUsers && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  sx={{ height: 'fit-content' }}
                >
                  Add User
                </Button>
              )}
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h3">{total}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      All registered users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Active Users
                    </Typography>
                    <Typography variant="h3">
                      {users.filter((u: User) => u.is_active).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Currently active users
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="info.main" gutterBottom>
                      Operators
                    </Typography>
                    <Typography variant="h3">
                      {
                        users.filter((u: User) =>
                          u.roles.some((r: Role) => r.name === 'operator')
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Field operators
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="warning.main" gutterBottom>
                      Admins
                    </Typography>
                    <Typography variant="h3">
                      {
                        users.filter((u: User) =>
                          u.roles.some((r: Role) => r.name === 'admin')
                        ).length
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System administrators
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Filters */}
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
              <TextField
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />

              <Button variant="outlined" startIcon={<RefreshIcon />}>
                Refresh
              </Button>
            </Box>
          </Box>

          {/* Users Table */}
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.full_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              @{user.username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {user.roles.map((role: Role) => (
                              <Chip
                                key={role.id}
                                label={role.name}
                                size="small"
                                color={getRoleColor(role.name)}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? 'Active' : 'Inactive'}
                            color={user.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.last_login
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <IconButton size="small" title="Edit user">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" title="Manage roles">
                              <SecurityIcon />
                            </IconButton>
                            {canCreateUsers && user.id !== currentUser?.id && (
                              <IconButton
                                size="small"
                                title="Delete user"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Box>
      </Container>
    </AppBarLayout>
  );
}
