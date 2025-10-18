import React from 'react';
import { Container, Typography } from '@mui/material';

export default function EquipmentPage() {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" gutterBottom>
				Equipment
			</Typography>
			<Typography color="text.secondary">Equipment list and details will appear here.</Typography>
		</Container>
	);
}
