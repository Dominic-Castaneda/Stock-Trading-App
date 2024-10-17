import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Grid, Paper, Button, Typography, Snackbar, Alert } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { ShoppingCart, Sell } from '@mui/icons-material';
import supabase from './supabaseClient';  // Import the Supabase client

// Create a dark theme using Material-UI's theme system
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [trades, setTrades] = useState([]);  // Fetch trades from Supabase
  const [stockData, setStockData] = useState([]);  // Fetch stock data from Supabase
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to capture errors

  // Function to handle stock change
  const handleStockChange = (event) => {
    setSelectedStock(event.target.value);
  };

  // Fetch stock data from Supabase when component loads
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('AAPL').select('*');
      if (error) {
        console.error('Error fetching stock data:', error);
        setError('Error fetching stock data. Please check your database configuration.');
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.error('No stock data available.');
        setError('No stock data available. Please ensure the table is populated.');
        setLoading(false);
        return;
      }

      console.log('Raw Stock Data from Supabase:', data);  // Debug log to verify data structure

      // Transform the data to match the chart requirements
      const transformedData = data.map(item => {
        const parsePrice = (value) => parseFloat(value.replace('$', '').replace(',', ''));

        const open = parsePrice(item['Open']);
        const high = parsePrice(item['High']);
        const low = parsePrice(item['Low']);
        const close = parsePrice(item['Close/Last']);
        const volume = parseInt(item['Volume'], 10);

        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close) || isNaN(volume)) {
          console.error('Data transformation failed. Invalid numeric values:', item);
        }

        return {
          time: item['Date'],
          open,
          high,
          low,
          close,
          volume
        };
      });

      console.log('Transformed Stock Data:', transformedData); // Debug log to verify transformed data
      setStockData(transformedData);  // Update state with transformed data
      setLoading(false);
    };

    fetchStockData();
  }, []);

  // Fetch trades data (transaction history) from Supabase when component loads
  useEffect(() => {
    const fetchTrades = async () => {
      const { data, error } = await supabase.from('transactions').select('*');
      if (error) {
        console.error('Error fetching trades data:', error);
      } else {
        setTrades(data);  // Update state with trades data
      }
    };

    fetchTrades();
  }, []);

  // Function to handle Buy and Sell actions
  const handleTrade = async (action) => {
    const newTrade = {
      stock: selectedStock,
      action: action,
      quantity: Math.floor(Math.random() * 10) + 1,  // Random quantity for simplicity
      price: Math.floor(Math.random() * 1000) + 100,  // Random price for simplicity
    };

    // Insert the new trade into the Supabase database
    const { error } = await supabase.from('transactions').insert([newTrade]);
    if (error) {
      console.error('Error inserting trade:', error);
      setNotification({
        open: true,
        message: `Failed to place ${action} order for ${newTrade.quantity} shares of ${newTrade.stock}.`,
        severity: 'error',
      });
    } else {
      setTrades([...trades, newTrade]);  // Update local state with the new trade
      setNotification({
        open: true,
        message: `${action} order for ${newTrade.quantity} shares of ${newTrade.stock} placed successfully!`,
        severity: 'success',
      });
    }
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
            {loading ? (
              <Typography variant="body1">Loading stock data...</Typography>
            ) : error ? (
              <Typography variant="body1" color="error">{error}</Typography>
            ) : (
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="close" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            )}
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
                  {trades.map((trade, index) => (
                    <TableRow key={index}>
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
