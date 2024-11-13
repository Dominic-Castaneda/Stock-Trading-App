// /src/components/StockInfo.js
import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { ShoppingCart, Sell } from '@mui/icons-material';

const StockInfo = ({ handleTrade }) => (
  <Paper style={{ padding: '20px' }}>
    <Typography variant="h6">Stock Information</Typography>
    <Typography>Ticker: AAPL</Typography>
    <Button
      variant="contained"
      color="success"
      startIcon={<ShoppingCart />}
      onClick={() => handleTrade('Buy')}
      style={{ marginTop: '10px', marginRight: '10px' }}
    >
      Buy
    </Button>
    <Button
      variant="contained"
      color="error"
      startIcon={<Sell />}
      onClick={() => handleTrade('Sell')}
      style={{ marginTop: '10px' }}
    >
      Sell
    </Button>
  </Paper>
);

export default StockInfo;
