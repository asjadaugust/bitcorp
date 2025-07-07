'use client'

import React, { useState } from 'react'
import { Box, Container, Typography, Breadcrumbs, Link, IconButton, Dialog, DialogTitle, DialogContent, IconButton as DialogCloseButton } from '@mui/material'
import { ArrowBack as ArrowBackIcon, Home as HomeIcon, Close as CloseIcon } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { EquipmentList } from '../../components/equipment/EquipmentListSimple'
import { EquipmentForm } from '../../components/equipment/EquipmentForm'
import type { Equipment } from '../../types/equipment'

export default function EquipmentPage() {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const handleSelectEquipment = (equipment: Equipment) => {
    console.log('Selected equipment:', equipment)
    // TODO: Navigate to equipment details page or open modal
  }

  const handleEditEquipment = (equipment: Equipment | null) => {
    setSelectedEquipment(equipment)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedEquipment(null)
  }

  const handleSaveEquipment = (equipment: Equipment) => {
    console.log('Saved equipment:', equipment)
    handleCloseForm()
    // SWR will automatically refetch the equipment list
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        {/* Navigation Breadcrumbs */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton 
            onClick={handleBackToDashboard}
            sx={{ mr: 2 }}
            aria-label="Back to dashboard"
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Breadcrumbs aria-label="breadcrumb">
            <Link 
              underline="hover" 
              color="inherit" 
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault()
                handleBackToDashboard()
              }}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Dashboard
            </Link>
            <Typography color="text.primary">Equipment</Typography>
          </Breadcrumbs>
        </Box>

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

      {/* Equipment Form Modal */}
      <Dialog 
        open={isFormOpen} 
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
          <DialogCloseButton onClick={handleCloseForm} size="small">
            <CloseIcon />
          </DialogCloseButton>
        </DialogTitle>
        <DialogContent>
          <EquipmentForm
            equipment={selectedEquipment}
            onSave={handleSaveEquipment}
            onCancel={handleCloseForm}
            isModal={true}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}
