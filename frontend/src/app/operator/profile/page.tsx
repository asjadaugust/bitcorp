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
  Avatar,
  Chip,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';

interface OperatorProfileData {
  employeeId: string;
  fullName: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  licenseNumber: string;
  licenseExpiry: string;
  hireDate: string;
  hourlyRate: number;
  employmentStatus: string;
  totalHoursWorked: number;
  totalReportsSubmitted: number;
  averageRating: number;
  certifications: string[];
  equipmentSkills: string[];
}

export default function OperatorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<OperatorProfileData>({
    employeeId: 'OP-2024-001',
    fullName: 'John Operator',
    phoneNumber: '+1-555-0123',
    emergencyContact: 'Jane Operator',
    emergencyPhone: '+1-555-0124',
    licenseNumber: 'CDL-123456789',
    licenseExpiry: '2025-12-31',
    hireDate: '2023-01-15',
    hourlyRate: 35.0,
    employmentStatus: 'Active',
    totalHoursWorked: 1840.5,
    totalReportsSubmitted: 245,
    averageRating: 4.7,
    certifications: [
      'Heavy Equipment Operator',
      'Safety Training Certificate',
      'Crane Operator License',
      'Forklift Certification',
    ],
    equipmentSkills: [
      'Excavator',
      'Bulldozer',
      'Wheel Loader',
      'Backhoe',
      'Crane',
      'Compactor',
    ],
  });

  const [editData, setEditData] = useState<OperatorProfileData>(profileData);

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    // API call to save profile data
    console.log('Saving profile:', editData);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange =
    (field: keyof OperatorProfileData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const currentData = isEditing ? editData : profileData;

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Operator Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box flexGrow={1}>
                  <Typography variant="h5" gutterBottom>
                    {currentData.fullName}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Employee ID: {currentData.employeeId}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={currentData.employmentStatus}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`${currentData.averageRating} ★`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary">
                    ${currentData.hourlyRate}/hr
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hourly Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={currentData.fullName}
                    onChange={handleInputChange('fullName')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={currentData.phoneNumber}
                    onChange={handleInputChange('phoneNumber')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Emergency Contact"
                    value={currentData.emergencyContact}
                    onChange={handleInputChange('emergencyContact')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Emergency Phone"
                    value={currentData.emergencyPhone}
                    onChange={handleInputChange('emergencyPhone')}
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Employment Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Employment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={currentData.licenseNumber}
                    onChange={handleInputChange('licenseNumber')}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="License Expiry"
                    type="date"
                    value={currentData.licenseExpiry}
                    onChange={handleInputChange('licenseExpiry')}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Hire Date"
                    type="date"
                    value={currentData.hireDate}
                    onChange={handleInputChange('hireDate')}
                    disabled={!isEditing}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Hourly Rate ($)"
                    type="number"
                    value={currentData.hourlyRate}
                    onChange={handleInputChange('hourlyRate')}
                    disabled={!isEditing}
                    inputProps={{ step: '0.25' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Stats */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Performance Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}
                  >
                    <AssignmentIcon
                      sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
                    />
                    <Typography variant="h4" color="primary.main">
                      {currentData.totalReportsSubmitted}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reports Submitted
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}
                  >
                    <ScheduleIcon
                      sx={{ fontSize: 40, color: 'success.main', mb: 1 }}
                    />
                    <Typography variant="h4" color="success.main">
                      {currentData.totalHoursWorked.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours Worked
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}
                  >
                    <StarIcon
                      sx={{ fontSize: 40, color: 'warning.main', mb: 1 }}
                    />
                    <Typography variant="h4" color="warning.main">
                      {currentData.averageRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Certifications */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SchoolIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Certifications
                </Typography>
              </Box>
              <List>
                {currentData.certifications.map((cert, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SchoolIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={cert} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Equipment Skills */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <WorkIcon color="primary" />
                <Typography variant="h6" color="primary">
                  Equipment Skills
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {currentData.equipmentSkills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
