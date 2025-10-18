import React from 'react';
import { Container, Typography } from '@mui/material';

export default function IotPage() {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" gutterBottom>
				IoT
			</Typography>
			<Typography color="text.secondary">IoT dashboards and device data.</Typography>
		</Container>
	);
}

