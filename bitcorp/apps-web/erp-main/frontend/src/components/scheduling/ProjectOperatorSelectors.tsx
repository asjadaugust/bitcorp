'use client';

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';

interface ProjectOperatorSelectorsProps {
  selectedProjects: string[];
  selectedOperators: string[];
  onProjectsChange: (projects: string[]) => void;
  onOperatorsChange: (operators: string[]) => void;
}

// Mock data for now - in a real app, these would come from APIs
const mockProjects = [
  'Highway Construction Phase 1',
  'Bridge Renovation Project',
  'Commercial Building Foundation',
  'Road Maintenance Sector A',
  'Industrial Complex Development',
  'Water Treatment Plant',
  'Residential Development Block C',
  'Airport Runway Extension',
];

const mockOperators = [
  'John Smith',
  'Maria Garcia',
  'Ahmed Hassan',
  'Lisa Chen',
  'Carlos Rodriguez',
  'Anna Kowalski',
  'David Thompson',
  'Sarah Johnson',
  'Michael Brown',
  'Elena Popov',
];

export function ProjectOperatorSelectors({
  selectedProjects,
  selectedOperators,
  onProjectsChange,
  onOperatorsChange,
}: ProjectOperatorSelectorsProps) {
  const handleProjectChange = (
    event: SelectChangeEvent<typeof selectedProjects>
  ) => {
    const value = event.target.value;
    onProjectsChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleOperatorChange = (
    event: SelectChangeEvent<typeof selectedOperators>
  ) => {
    const value = event.target.value;
    onOperatorsChange(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      <FormControl sx={{ minWidth: 250, maxWidth: 400 }}>
        <InputLabel id="projects-select-label">Filter by Projects</InputLabel>
        <Select
          labelId="projects-select-label"
          id="projects-select"
          multiple
          value={selectedProjects}
          onChange={handleProjectChange}
          input={<OutlinedInput label="Filter by Projects" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {mockProjects.map((project) => (
            <MenuItem key={project} value={project}>
              {project}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 200, maxWidth: 350 }}>
        <InputLabel id="operators-select-label">Filter by Operators</InputLabel>
        <Select
          labelId="operators-select-label"
          id="operators-select"
          multiple
          value={selectedOperators}
          onChange={handleOperatorChange}
          input={<OutlinedInput label="Filter by Operators" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {mockOperators.map((operator) => (
            <MenuItem key={operator} value={operator}>
              {operator}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
