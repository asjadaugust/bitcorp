'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton as DialogCloseButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { AppBarLayout } from '@/components/layout/AppBarLayout';
import { EquipmentList } from '@/components/equipment/EquipmentListSimple';
import { EquipmentForm } from '@/components/equipment/EquipmentForm';
import type { Equipment } from '@/types/equipment';

export default function EquipmentPage() {
  const router = useRouter();
  const t = useTranslations('Equipment');
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  const handleSelectEquipment = (equipment: Equipment) => {
    console.log('Selected equipment:', equipment);
    // TODO: Navigate to equipment details page or open modal
  };

  const handleEditEquipment = (equipment: Equipment | null) => {
    setSelectedEquipment(equipment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEquipment(null);
  };

  const handleSaveEquipment = (equipment: Equipment) => {
    console.log('Saved equipment:', equipment);
    handleCloseForm();
    // SWR will automatically refetch the equipment list
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <AppBarLayout title={t('title')} subtitle={t('subtitle')}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
              <Typography color="text.primary">{tNav('equipment')}</Typography>
            </Breadcrumbs>
          </Box>

          <Typography variant="h3" component="h1" gutterBottom>
            {t('title')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            {t('subtitle')}
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
            sx: { minHeight: '70vh' },
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {selectedEquipment ? t('editEquipment') : t('addEquipment')}
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
    </AppBarLayout>
  );
}
