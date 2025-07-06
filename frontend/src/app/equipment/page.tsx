'use client'

import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { EquipmentList } from '../../components/equipment/EquipmentListSimple'
import type { Equipment } from '../../types/equipment'

export default function EquipmentPage() {
  const handleSelectEquipment = (equipment: Equipment) => {
    console.log('Selected equipment:', equipment)
    // TODO: Navigate to equipment details page or open modal
  }

  const handleEditEquipment = (equipment: Equipment | null) => {
    console.log('Edit equipment:', equipment)
    // TODO: Navigate to equipment form page or open modal
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Equipment Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Manage your construction equipment inventory, track utilization, and monitor maintenance schedules.
        </Typography>
        
        <EquipmentList
          onSelectEquipment={handleSelectEquipment}
          onEditEquipment={handleEditEquipment}
        />
      </Box>
    </Container>
  )
}
