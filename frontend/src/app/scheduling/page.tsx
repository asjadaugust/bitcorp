import React from 'react';
import { Container, Typography } from '@mui/material';

export default function SchedulingPage() {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" gutterBottom>
				Scheduling
			</Typography>
			<Typography color="text.secondary">Scheduling calendar and assignments.</Typography>
		</Container>
	);
}

