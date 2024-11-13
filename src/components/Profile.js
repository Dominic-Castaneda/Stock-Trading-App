// /src/components/Profile.js
import React from 'react';
import { Paper, Typography } from '@mui/material';

const Profile = ({ profile }) => (
  <Paper style={{ padding: '20px' }}>
    <Typography variant="h6">{profile.name}</Typography>
    <Typography>Current Balance: ${profile.currentBalance.toFixed(2)}</Typography>
    <Typography>Available Funds: ${profile.availableFunds.toFixed(2)}</Typography>
  </Paper>
);

export default Profile;
