'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid2 as Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Card,
  CardContent,
  Box,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Send as SendIcon,
  LocationOn as LocationIcon,
  Camera as CameraIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface DailyReportForm {
  reportDate: string;
  shiftStart: string;
  shiftEnd: string;
  projectName: string;
  siteLocation: string;
  workZone: string;
  equipmentId: string;
  operatorName: string;
  initialHourmeter: string;
  finalHourmeter: string;
  initialOdometer: string;
  finalOdometer: string;
  initialFuelLevel: string;
  finalFuelLevel: string;
  activitiesPerformed: string;
  workDescription: string;
  equipmentIssues: string;
  maintenanceNeeded: boolean;
  safetyIncidents: string;
  weatherConditions: string;
}

export default function DailyReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DailyReportForm>({
    reportDate: new Date().toISOString().split('T')[0],
    shiftStart: '',
    shiftEnd: '',
    projectName: '',
    siteLocation: '',
    workZone: '',
    equipmentId: '',
    operatorName: 'John Operator', // Would come from auth
    initialHourmeter: '',
    finalHourmeter: '',
    initialOdometer: '',
    finalOdometer: '',
    initialFuelLevel: '',
    finalFuelLevel: '',
    activitiesPerformed: '',
    workDescription: '',
    equipmentIssues: '',
    maintenanceNeeded: false,
    safetyIncidents: '',
    weatherConditions: 'Clear',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Mock equipment data - would come from API
  const availableEquipment = [
    { id: '1', name: 'CAT 320 Excavator', code: 'CAT-320-001' },
    { id: '2', name: 'JCB 3CX Backhoe', code: 'JCB-3CX-002' },
    { id: '3', name: 'Volvo L90H Loader', code: 'VOL-L90H-003' },
  ];

  const weatherOptions = [
    'Clear',
    'Partly Cloudy',
    'Cloudy',
    'Light Rain',
    'Heavy Rain',
    'Fog',
    'Snow',
  ];

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(
            `${position.coords.latitude.toFixed(
              6
            )}, ${position.coords.longitude.toFixed(6)}`
          );
        },
        () => {
          console.log('Location access denied');
        }
      );
    }

    // Set default shift start time
    const now = new Date();
    setFormData((prev) => ({
      ...prev,
      shiftStart: `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`,
    }));
  }, []);

  const handleInputChange =
    (field: keyof DailyReportForm) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } }
    ) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleCheckboxChange =
    (field: keyof DailyReportForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.checked,
      }));
    };

  const validateForm = (): boolean => {
    const requiredFields = [
      'projectName',
      'siteLocation',
      'equipmentId',
      'shiftStart',
      'initialHourmeter',
    ];

    const newErrors: string[] = [];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof DailyReportForm]) {
        newErrors.push(
          `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`
        );
      }
    });

    if (
      formData.finalHourmeter &&
      parseFloat(formData.finalHourmeter) <
        parseFloat(formData.initialHourmeter)
    ) {
      newErrors.push(
        'Final hourmeter reading cannot be less than initial reading'
      );
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // API call to save draft
      console.log('Saving draft:', formData);
      setTimeout(() => {
        setLoading(false);
        alert('Draft saved successfully!');
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Error saving draft:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // API call to submit report
      console.log('Submitting report:', formData);
      setTimeout(() => {
        setLoading(false);
        alert('Report submitted successfully!');
        router.push('/operator');
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Error submitting report:', error);
    }
  };

  const calculatedHours =
    formData.finalHourmeter && formData.initialHourmeter
      ? (
          parseFloat(formData.finalHourmeter) -
          parseFloat(formData.initialHourmeter)
        ).toFixed(1)
      : '0';

  const calculatedDistance =
    formData.finalOdometer && formData.initialOdometer
      ? (
          parseFloat(formData.finalOdometer) -
          parseFloat(formData.initialOdometer)
        ).toFixed(1)
      : '0';

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Daily Equipment Report
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Report Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Report Date"
                type="date"
                value={formData.reportDate}
                onChange={handleInputChange('reportDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Operator Name"
                value={formData.operatorName}
                onChange={handleInputChange('operatorName')}
                disabled
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Project & Location Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Project Name *"
                value={formData.projectName}
                onChange={handleInputChange('projectName')}
                placeholder="e.g., Highway Construction Phase 2"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Site Location *"
                value={formData.siteLocation}
                onChange={handleInputChange('siteLocation')}
                placeholder="e.g., Site A - Section 3"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Work Zone"
                value={formData.workZone}
                onChange={handleInputChange('workZone')}
                placeholder="Specific area within the site"
              />
            </Grid>
            {currentLocation && (
              <Grid size={{ xs: 12 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon color="primary" />
                  <Typography variant="body2" color="text.secondary">
                    Current Location: {currentLocation}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Equipment & Shift Details
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Equipment *</InputLabel>
                <Select
                  value={formData.equipmentId}
                  label="Equipment *"
                  onChange={(e) => handleInputChange('equipmentId')(e)}
                >
                  {availableEquipment.map((equipment) => (
                    <MenuItem key={equipment.id} value={equipment.id}>
                      {equipment.name} ({equipment.code})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Weather Conditions</InputLabel>
                <Select
                  value={formData.weatherConditions}
                  label="Weather Conditions"
                  onChange={(e) => handleInputChange('weatherConditions')(e)}
                >
                  {weatherOptions.map((weather) => (
                    <MenuItem key={weather} value={weather}>
                      {weather}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Shift Start *"
                type="time"
                value={formData.shiftStart}
                onChange={handleInputChange('shiftStart')}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <TimeIcon sx={{ mr: 1, color: 'action.active' }} />
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Shift End"
                type="time"
                value={formData.shiftEnd}
                onChange={handleInputChange('shiftEnd')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Equipment Readings
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Initial Hourmeter *"
                type="number"
                value={formData.initialHourmeter}
                onChange={handleInputChange('initialHourmeter')}
                inputProps={{ step: '0.1' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Final Hourmeter"
                type="number"
                value={formData.finalHourmeter}
                onChange={handleInputChange('finalHourmeter')}
                inputProps={{ step: '0.1' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Initial Odometer"
                type="number"
                value={formData.initialOdometer}
                onChange={handleInputChange('initialOdometer')}
                inputProps={{ step: '0.1' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Final Odometer"
                type="number"
                value={formData.finalOdometer}
                onChange={handleInputChange('finalOdometer')}
                inputProps={{ step: '0.1' }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Initial Fuel Level (%)"
                type="number"
                value={formData.initialFuelLevel}
                onChange={handleInputChange('initialFuelLevel')}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                label="Final Fuel Level (%)"
                type="number"
                value={formData.finalFuelLevel}
                onChange={handleInputChange('finalFuelLevel')}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Calculated Hours
                </Typography>
                <Chip label={`${calculatedHours}h`} color="primary" />
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Distance Traveled
                </Typography>
                <Chip label={`${calculatedDistance} km`} color="secondary" />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Work Activities & Observations
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Activities Performed"
                multiline
                rows={3}
                value={formData.activitiesPerformed}
                onChange={handleInputChange('activitiesPerformed')}
                placeholder="Describe the main activities performed during the shift..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Detailed Work Description"
                multiline
                rows={3}
                value={formData.workDescription}
                onChange={handleInputChange('workDescription')}
                placeholder="Provide detailed description of work completed..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Equipment Issues"
                multiline
                rows={2}
                value={formData.equipmentIssues}
                onChange={handleInputChange('equipmentIssues')}
                placeholder="Report any equipment problems or concerns..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Safety Incidents"
                multiline
                rows={2}
                value={formData.safetyIncidents}
                onChange={handleInputChange('safetyIncidents')}
                placeholder="Report any safety incidents or near misses..."
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.maintenanceNeeded}
                    onChange={handleCheckboxChange('maintenanceNeeded')}
                  />
                }
                label="Maintenance Required"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Please fix the following errors:
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save Draft
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              Submit Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box textAlign="center" mb={2}>
        <Button
          variant="outlined"
          startIcon={<CameraIcon />}
          disabled
          sx={{ mb: 1 }}
        >
          Add Photos (Coming Soon)
        </Button>
        <Typography variant="body2" color="text.secondary">
          Photo capture functionality will be available in the next update
        </Typography>
      </Box>
    </Container>
  );
}
