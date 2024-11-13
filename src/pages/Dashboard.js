// /src/pages/Dashboard.js
import React from 'react';
import { Grid } from '@mui/material';
import Profile from '../components/Profile';
import StockChart from '../components/StockChart';
import StockInfo from '../components/StockInfo';

const Dashboard = ({ profile, displayedData, currentCandle, handleTrade }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={3}>
      <Profile profile={profile} />
    </Grid>
    <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <StockChart displayedData={displayedData} currentCandle={currentCandle} />
    </Grid>
    <Grid item xs={12} md={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <StockInfo handleTrade={handleTrade} />
    </Grid>
  </Grid>
);

export default Dashboard;
