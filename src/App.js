import React, { useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Grid, Paper, Button, Typography, Snackbar, Alert } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ShoppingCart, Sell } from '@mui/icons-material';

// Create a dark theme using Material-UI's theme system
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// Sample data for the stock chart
const stockData = [
  { time: '10:00', price: 110 },
  { time: '10:05', price: 120 },
  { time: '10:10', price: 115 },
  { time: '10:15', price: 125 },
  { time: '10:20', price: 130 },
];

// Sample transaction history data
const initialTrades = [
  { id: 1, stock: 'AAPL', action: 'Buy', quantity: 10, price: 150 },
  { id: 2, stock: 'GOOGL', action: 'Sell', quantity: 5, price: 1200 },
];

function App() {
  // State for selected stock, trades, and notification
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [trades, setTrades] = useState(initialTrades);
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });

  // Function to handle stock change
  const handleStockChange = (event) => {
    setSelectedStock(event.target.value);
  };

  // Function to handle Buy and Sell actions
  const handleTrade = (action) => {
    const newTrade = {
      id: trades.length + 1,
      stock: selectedStock,
      action,
      quantity: Math.floor(Math.random() * 10) + 1, // Random quantity for simplicity
      price: Math.floor(Math.random() * 1000) + 100, // Random price for simplicity
    };
    setTrades([...trades, newTrade]);
    setNotification({
      open: true,
      message: `${action} order for ${newTrade.quantity} shares of ${newTrade.stock} placed successfully!`,
      severity: 'success',
    });
  };

  // Function to close notification
  const handleCloseNotification = () => {
    setNotification({ open: false, message: '', severity: '' });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* Notification */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>

      <Grid container spacing={2} style={{ height: '100vh' }}>
        {/* Left Section (Price Tickers / Chart) */}
        <Grid item xs={8}>
          <Paper style={{ height: '100%', padding: '10px' }}>
            <Typography variant="h6" style={{ paddingBottom: '10px' }}>
              Stock Chart for {selectedStock}
            </Typography>
            <ResponsiveContainer width="100%" height="80%">
              <LineChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Right Section (Buy/Sell + Account Info + Stock Selector) */}
        <Grid item xs={4}>
          {/* Buy/Sell Section */}
          <Paper style={{ height: '30%', padding: '10px' }}>
            <Typography variant="h6">Buy / Sell</Typography>
            <Button
              variant="contained"
              color="success"
              startIcon={<ShoppingCart />}
              fullWidth
              style={{ marginBottom: '10px' }}
              onClick={() => handleTrade('Buy')}
            >
              Buy
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Sell />}
              fullWidth
              onClick={() => handleTrade('Sell')}
            >
              Sell
            </Button>
          </Paper>

          {/* Account Info Section */}
          <Paper style={{ height: '20%', padding: '10px', marginTop: '10px' }}>
            <Typography variant="h6">Account Info</Typography>
            <div style={{ marginTop: '10px' }}>
              <Typography variant="body1">Account Value: $10,000</Typography>
              <Typography variant="body1">Buying Power: $5,000</Typography>
              <Typography variant="body1">Open P/L: +$200</Typography>
              <Typography variant="body1">Open Positions: {selectedStock} (5 shares)</Typography>
            </div>
          </Paper>

          {/* Stock Selector */}
          <Paper style={{ height: '20%', padding: '10px', marginTop: '10px' }}>
            <Typography variant="h6">Select Stock</Typography>
            <FormControl fullWidth>
              <InputLabel>Select Stock</InputLabel>
              <Select value={selectedStock} onChange={handleStockChange}>
                <MenuItem value="AAPL">Apple (AAPL)</MenuItem>
                <MenuItem value="GOOGL">Google (GOOGL)</MenuItem>
                <MenuItem value="AMZN">Amazon (AMZN)</MenuItem>
              </Select>
            </FormControl>
          </Paper>

          {/* Transaction History */}
          <Paper style={{ height: '30%', padding: '10px', marginTop: '10px' }}>
            <Typography variant="h6">Transaction History</Typography>
            <TableContainer>
              <Table aria-label="transaction history table">
                <TableHead>
                  <TableRow>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Action</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.stock}</TableCell>
                      <TableCell align="right">{trade.action}</TableCell>
                      <TableCell align="right">{trade.quantity}</TableCell>
                      <TableCell align="right">${trade.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
