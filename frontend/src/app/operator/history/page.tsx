'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid2 as Grid,
  TextField,
  Button,
  Chip,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';

interface DailyReportHistory {
  id: number;
  reportDate: string;
  equipmentName: string;
  projectName: string;
  hoursWorked: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
}

export default function ReportHistory() {
  const [selectedReport, setSelectedReport] =
    useState<DailyReportHistory | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');

  // Mock data - would come from API
  const reportHistory: DailyReportHistory[] = [
    {
      id: 1,
      reportDate: '2024-01-15',
      equipmentName: 'CAT 320 Excavator',
      projectName: 'Highway Construction Phase 2',
      hoursWorked: 8.5,
      status: 'approved',
      submittedAt: '2024-01-15T17:30:00Z',
      approvedAt: '2024-01-16T09:15:00Z',
    },
    {
      id: 2,
      reportDate: '2024-01-14',
      equipmentName: 'JCB 3CX Backhoe',
      projectName: 'Site Preparation - Block A',
      hoursWorked: 7.0,
      status: 'approved',
      submittedAt: '2024-01-14T16:45:00Z',
      approvedAt: '2024-01-15T08:30:00Z',
    },
    {
      id: 3,
      reportDate: '2024-01-13',
      equipmentName: 'CAT 320 Excavator',
      projectName: 'Highway Construction Phase 2',
      hoursWorked: 8.0,
      status: 'submitted',
      submittedAt: '2024-01-13T17:00:00Z',
    },
    {
      id: 4,
      reportDate: '2024-01-12',
      equipmentName: 'Volvo L90H Loader',
      projectName: 'Material Loading - Zone C',
      hoursWorked: 6.5,
      status: 'rejected',
      submittedAt: '2024-01-12T16:30:00Z',
    },
    {
      id: 5,
      reportDate: '2024-01-11',
      equipmentName: 'CAT 320 Excavator',
      projectName: 'Highway Construction Phase 2',
      hoursWorked: 0,
      status: 'draft',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'submitted':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓';
      case 'submitted':
        return '⏳';
      case 'rejected':
        return '✗';
      case 'draft':
        return '📝';
      default:
        return '';
    }
  };

  const handleViewReport = (report: DailyReportHistory) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const handleDownloadReport = (reportId: number) => {
    // API call to download report
    console.log('Downloading report:', reportId);
    alert('Download feature will be available soon!');
  };

  const filteredReports = reportHistory.filter((report) => {
    const dateMatch = !dateFilter || report.reportDate.includes(dateFilter);
    const statusMatch = !statusFilter || report.status === statusFilter;
    const equipmentMatch =
      !equipmentFilter ||
      report.equipmentName
        .toLowerCase()
        .includes(equipmentFilter.toLowerCase());

    return dateMatch && statusMatch && equipmentMatch;
  });

  const totalHours = filteredReports.reduce(
    (sum, report) => sum + report.hoursWorked,
    0
  );
  const pendingReports = filteredReports.filter(
    (r) => r.status === 'submitted'
  ).length;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Report History
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {filteredReports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {totalHours.toFixed(1)}h
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Hours
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {pendingReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <FilterIcon color="primary" />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Date"
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <DateRangeIcon sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Equipment"
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                placeholder="Search equipment..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setDateFilter('');
                  setStatusFilter('');
                  setEquipmentFilter('');
                }}
                sx={{ height: '56px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Equipment</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell align="center">Hours</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(report.reportDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {report.equipmentName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {report.projectName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {report.hoursWorked > 0
                          ? `${report.hoursWorked}h`
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${getStatusIcon(
                          report.status
                        )} ${report.status.toUpperCase()}`}
                        color={
                          getStatusColor(report.status) as
                            | 'success'
                            | 'warning'
                            | 'error'
                            | 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewReport(report)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                        {report.status !== 'draft' && (
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadReport(report.id)}
                            color="secondary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredReports.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No reports found matching your filters.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report Details -{' '}
          {selectedReport?.reportDate &&
            new Date(selectedReport.reportDate).toLocaleDateString()}
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Equipment"
                  value={selectedReport.equipmentName}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Project"
                  value={selectedReport.projectName}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Hours Worked"
                  value={selectedReport.hoursWorked || 'N/A'}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Status"
                  value={selectedReport.status.toUpperCase()}
                  disabled
                />
              </Grid>
              {selectedReport.submittedAt && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Submitted At"
                    value={new Date(
                      selectedReport.submittedAt
                    ).toLocaleString()}
                    disabled
                  />
                </Grid>
              )}
              {selectedReport.approvedAt && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Approved At"
                    value={new Date(selectedReport.approvedAt).toLocaleString()}
                    disabled
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selectedReport && selectedReport.status !== 'draft' && (
            <Button
              variant="contained"
              onClick={() => handleDownloadReport(selectedReport.id)}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
