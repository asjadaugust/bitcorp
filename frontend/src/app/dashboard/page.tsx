import React from 'react';
import { Container, Grid, Card, CardContent, Typography } from '@mui/material';

export default function DashboardPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Overview</Typography>
              <Typography color="text.secondary">Key metrics and summary</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Activity</Typography>
              <Typography color="text.secondary">Recent system and user activity</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Health</Typography>
              <Typography color="text.secondary">System health and integrations</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
