import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Grid, Paper, Button, Typography, Snackbar, Alert } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { VictoryChart, VictoryCandlestick, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory';
import { ShoppingCart, Sell } from '@mui/icons-material';
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
  const [displayedData, setDisplayedData] = useState([]); // Data shown on the chart
  const [currentCandle, setCurrentCandle] = useState(null); // Current candle being simulated
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const [profile] = useState({
    name: 'John Doe',
    currentBalance: 10000,
    availableFunds: 5000,
    profilePic: null,
  });

  // Fetch stock data from Supabase when component loads
  useEffect(() => {
    const fetchStockData = async () => {
      const { data, error } = await supabase.from('AAPL').select('*');
      if (error) {
        console.error('Error fetching stock data:', error);
        setNotification({
          open: true,
          message: 'Error fetching stock data. Please check your database configuration.',
          severity: 'error',
        });
        return;
      }

      if (!data || data.length === 0) {
        console.error('No stock data available.');
        setNotification({
          open: true,
          message: 'No stock data available. Please ensure the table is populated.',
          severity: 'error',
        });
        return;
      }

      const transformedData = data.map(item => {
        const parsePrice = (value) => parseFloat(value.replace('$', '').replace(',', ''));
        return {
          date: new Date(item['Date']),
          open: parsePrice(item['Open']),
          high: parsePrice(item['High']),
          low: parsePrice(item['Low']),
          close: parsePrice(item['Close/Last']),
          volume: parseInt(item['Volume'], 10),
        };
      });

      setStockData(transformedData.reverse()); // Reverse to start from the latest entry
      setDisplayedData([transformedData[0]]); // Display the first data point immediately
      setCurrentCandle({ ...transformedData[0], close: transformedData[0].open });

      // Start fluctuating the first candle right away
      startFluctuatingCandle(transformedData[0]);
    };

    fetchStockData();
  }, []);

  // Function to simulate candle fluctuations starting right away
  const startFluctuatingCandle = (candle) => {
    let currentPrice = candle.open;
    let highReached = false;
    let lowReached = false;

    const candleInterval = setInterval(() => {
      setCurrentCandle((prevCandle) => {
        if (!prevCandle) return null;

        let newClose = currentPrice;

        if (!highReached) {
          // Move towards the high price
          const priceChange = Math.random() * (candle.high - currentPrice);
          newClose = currentPrice + priceChange;

          if (newClose >= candle.high) {
            newClose = candle.high;
            highReached = true;
          }
        } else if (highReached && !lowReached) {
          // Move towards the low price
          const priceChange = Math.random() * (currentPrice - candle.low);
          newClose = currentPrice - priceChange;

          if (newClose <= candle.low) {
            newClose = candle.low;
            lowReached = true;
          }
        } else {
          // Fluctuate towards the closing price within high and low bounds
          const randomDirection = Math.random() < 0.5 ? -1 : 1;
          const priceChange = randomDirection * Math.random();
          newClose = Math.max(candle.low, Math.min(candle.high, currentPrice + priceChange));
        }

        if (highReached && lowReached && Math.abs(newClose - candle.close) < 0.1) {
          clearInterval(candleInterval);
          newClose = candle.close;

          // Push the finalized candle to displayed data
          setDisplayedData((prevData) => [...prevData, {
            ...candle,
            close: newClose,
            high: Math.max(prevCandle.high, newClose),
            low: Math.min(prevCandle.low, newClose)
          }]);

          return null; // Candle is complete, no need to keep fluctuating
        }

        currentPrice = newClose;

        // Update the current candle being fluctuated but do not add to displayed data yet
        return {
          ...prevCandle,
          close: newClose,
          high: Math.max(prevCandle.high, newClose),
          low: Math.min(prevCandle.low, newClose)
        };
      });
    }, 1000);

    return candleInterval;
  };

  // Function to simulate adding data points every 60 seconds
  useEffect(() => {
    if (stockData.length > 0) {
      let candleInterval;

      const interval = setInterval(() => {
        setDisplayedData((prevData) => {
          const nextIndex = prevData.length;
          if (nextIndex < stockData.length) {
            const newCandle = stockData[nextIndex];
            setCurrentCandle({ ...newCandle, close: newCandle.open });

            // Clear previous candleInterval if exists
            if (candleInterval) {
              clearInterval(candleInterval);
            }

            // Start a new interval to simulate price changes every second within the current candle
            candleInterval = startFluctuatingCandle(newCandle);

            return [...prevData, newCandle];
          }
          clearInterval(interval);
          return prevData;
        });
      }, 60000);

      return () => {
        clearInterval(interval);
        if (candleInterval) {
          clearInterval(candleInterval);
        }
      };
    }
  }, [stockData]);

  // Function to handle Buy and Sell actions
  const handleTrade = async (action) => {
    const newTrade = {
      stock: 'AAPL',
      action: action,
      quantity: Math.floor(Math.random() * 10) + 1,
      price: currentCandle ? currentCandle.close : 0,
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
    setNotification({ ...notification, open: false });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper style={{ padding: '20px' }}>
            <Typography variant="h6">{profile.name}</Typography>
            <Typography>Current Balance: ${profile.currentBalance}</Typography>
            <Typography>Available Funds: ${profile.availableFunds}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 25, y: 20 }}
            scale={{ x: 'time' }}
            width={1000}
            height={500}
            style={{ background: { fill: "#282c34" } }}
          >
            <VictoryLabel text="AAPL Stock Price" x={500} y={30} textAnchor="middle" style={{ fill: "#ffffff" }} />
            <VictoryAxis
              tickFormat={(t) => `${t.getMonth() + 1}/${t.getDate()}`}
              style={{
                axis: { stroke: "#FFFFFF" },
                tickLabels: { fill: "#FFFFFF" },
                grid: { stroke: "#444", strokeDasharray: "3, 3" },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: "#FFFFFF" },
                tickLabels: { fill: "#FFFFFF" },
                grid: { stroke: "#444", strokeDasharray: "3, 3" },
              }}
            />
            <VictoryCandlestick
              data={[...displayedData, currentCandle].filter(Boolean)}
              x="date"
              open="open"
              close="close"
              high="high"
              low="low"
              candleColors={{ positive: "#4caf50", negative: "#f44336" }}
            />
          </VictoryChart>
        </Grid>
        <Grid item xs={12} md={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
        </Grid>
      </Grid>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
