import React from 'react';
import { Container, Typography } from '@mui/material';

export default function UsersPage() {
	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h4" gutterBottom>
				Users
			</Typography>
			<Typography color="text.secondary">Manage users and permissions.</Typography>
		</Container>
	);
}

