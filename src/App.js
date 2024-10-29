import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Grid, Paper, Button, Typography, Snackbar, Alert, Avatar, Popover } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ResponsiveContainer, LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, Bar } from 'recharts';
import { ShoppingCart, Sell } from '@mui/icons-material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useGesture } from '@use-gesture/react';
import supabase from './supabaseClient';  // Import the Supabase client

// Create a dark theme using Material-UI's theme system
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [trades, setTrades] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartDomain, setChartDomain] = useState({ xStart: 0, xEnd: 30 });
  const [profile] = useState({
    name: 'John Doe',
    currentBalance: 10000,
    availableFunds: 5000,
    profilePic: null,
  });
  const [anchorEl, setAnchorEl] = useState(null); // For handling profile popover

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

      console.log('Fetched Data:', data); // Debug log to verify fetched data

      const transformedData = data.map(item => {
        const parsePrice = (value) => parseFloat(value.replace('$', '').replace(',', ''));
        return {
          time: item['Date'],
          open: parsePrice(item['Open']),
          high: parsePrice(item['High']),
          low: parsePrice(item['Low']),
          close: parsePrice(item['Close/Last']),
          volume: parseInt(item['Volume'], 10),
        };
      });

      setStockData(transformedData.reverse()); // Reverse to start from the last entry
      setLoading(false);
    };

    fetchStockData();
  }, []);

  // Function to simulate adding data points every 10 seconds
  useEffect(() => {
    if (stockData.length > 0) {
      const interval = setInterval(() => {
        setStockData((prevData) => {
          const nextIndex = prevData.length;
          if (nextIndex < stockData.length) {
            return [...prevData, stockData[nextIndex]];
          }
          clearInterval(interval);
          return prevData;
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [stockData]);

  // Gesture to handle zooming and panning
  const bind = useGesture({
    onWheel: ({ delta: [, dy] }) => {
      let newDomain = [chartDomain.xStart, chartDomain.xEnd];
      const zoomFactor = dy < 0 ? 0.9 : 1.1;
      newDomain[0] = Math.max(0, newDomain[0] * zoomFactor);
      newDomain[1] = Math.min(stockData.length - 1, newDomain[1] * zoomFactor);
      setChartDomain({ xStart: newDomain[0], xEnd: newDomain[1] });
    },
    onDrag: ({ offset: [ox] }) => {
      const panOffset = Math.round(-ox / 10);
      const newXStart = Math.max(0, chartDomain.xStart + panOffset);
      const newXEnd = Math.min(stockData.length - 1, chartDomain.xEnd + panOffset);
      setChartDomain({ xStart: newXStart, xEnd: newXEnd });
    },
  });

  // Function to handle Buy and Sell actions
  const handleTrade = async (action) => {
    const newTrade = {
      stock: 'AAPL',
      action: action,
      quantity: Math.floor(Math.random() * 10) + 1,
      price: Math.floor(Math.random() * 1000) + 100,
    };

    const { error } = await supabase.from('transactions').insert([newTrade]);
    if (error) {
      console.error('Error inserting trade:', error);
      setNotification({
        open: true,
        message: `Failed to place ${action} order for ${newTrade.quantity} shares of ${newTrade.stock}.`,
        severity: 'error',
      });
    } else {
      setTrades([...trades, newTrade]);
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

  // Function to handle profile popover open
  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle profile popover close
  const handleProfileClose = () => {
    setAnchorEl(null);
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
        {/* Profile Section (Top Left) */}
        <Grid item xs={12} style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
          <Avatar
            alt={profile.name}
            src={profile.profilePic}
            sx={{ width: 56, height: 56, cursor: 'pointer' }}
            onClick={handleProfileClick}
          />
          <div style={{ marginLeft: '15px' }}>
            <Typography variant="h6">{profile.name}</Typography>
            <Typography variant="body1">Current Balance: ${profile.currentBalance}</Typography>
            <Typography variant="body1">Available Funds: ${profile.availableFunds}</Typography>
          </div>

          {/* Profile Popover */}
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleProfileClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <div style={{ padding: '15px' }}>
              <Typography variant="h6">Profile Details</Typography>
              <Typography variant="body1">Name: {profile.name}</Typography>
              <Typography variant="body1">Current Balance: ${profile.currentBalance}</Typography>
              <Typography variant="body1">Available Funds: ${profile.availableFunds}</Typography>
              <Typography variant="body1">Number of Shares Held: ...</Typography>
              <Typography variant="body1">Portfolio Performance: ...</Typography>
              <Button
                variant="outlined"
                color="secondary"
                style={{ marginTop: '10px' }}
                onClick={() => alert('Logout clicked')}
              >
                Logout
              </Button>
            </div>
          </Popover>
        </Grid>

        {/* Left Section (Stock Charts) */}
        <Grid item xs={8}>
          <Paper style={{ height: '85%', padding: '10px' }}>
            <Typography variant="h6" style={{ paddingBottom: '10px' }}>
              Stock Chart for AAPL
            </Typography>
            {loading ? (
              <Typography variant="body1">Loading stock data...</Typography>
            ) : error ? (
              <Typography variant="body1" color="error">{error}</Typography>
            ) : (
              <div {...bind()} style={{ height: '90%', width: '100%' }}>
                <ResponsiveContainer width="100%" height="65%">
                  <LineChart data={stockData.slice(chartDomain.xStart, chartDomain.xEnd + 1)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="linear" dataKey="close" stroke="#82ca9d" yAxisId="right" />
                  </LineChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height="25%">
                  <BarChart data={stockData.slice(chartDomain.xStart, chartDomain.xEnd + 1)}>
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar dataKey="volume" fill="#8884d8" yAxisId="right" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Paper>
        </Grid>

        {/* Right Section (Stock Information and Buy/Sell Orders) */}
        <Grid item xs={4}>
          <Paper style={{ height: '85%', padding: '10px' }}>
            <Typography variant="h6">Stock Information</Typography>
            <div style={{ marginBottom: '10px' }}>
              <Typography variant="body1">Ticker: AAPL</Typography>
              <Typography variant="body1">Company: Apple Inc.</Typography>
              <Typography variant="body1">Current Price: $233.85</Typography>
              <Typography variant="body1">Daily % Change: +1.23%</Typography>
              <Typography variant="body1">Volume: 64,751,370</Typography>
              <Typography variant="body1">Market Status: Open</Typography>
            </div>

            <Typography variant="h6" style={{ marginBottom: '10px' }}>Buy / Sell</Typography>
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

            {/* Recent Transactions */}
            <Typography variant="h6" style={{ marginTop: '20px' }}>Transaction History</Typography>
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

