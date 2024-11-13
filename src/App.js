// /src/App.js
import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './pages/Dashboard';
import Notification from './components/Notification';
import supabase from './supabaseClient'; // Import the Supabase client

// Create a dark theme using Material-UI's theme system
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [trades, setTrades] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [currentCandle, setCurrentCandle] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: '' });
  const [profile] = useState({
    name: 'John Doe',
    currentBalance: 10000,
    availableFunds: 5000,
    profilePic: null,
  });

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
          close: parsePrice(item['Close']),
          volume: parseInt(item['Volume'], 10),
        };
      });

      const reversedData = transformedData.reverse();
      setDisplayedData(reversedData.slice(0, 10)); // Initialize with the latest 10 data points, but no complete candles
      setCurrentCandle({ ...reversedData[0], close: reversedData[0].open }); // Start with the first candle fluctuating

      // Start fluctuating the current candle on the right-most part of the chart
      startFluctuatingCandle(reversedData[0]);
    };

    fetchStockData();
  }, []);

  const startFluctuatingCandle = (initialCandle) => {
    let currentPrice = initialCandle.open;
    let highReached = false;
    let lowReached = false;

    const candleInterval = setInterval(() => {
      setCurrentCandle((prevCandle) => {
        if (!prevCandle) return null;

        let newClose = currentPrice;

        if (!highReached) {
          const priceChange = Math.random() * (initialCandle.high - currentPrice);
          newClose = currentPrice + priceChange;

          if (newClose >= initialCandle.high) {
            newClose = initialCandle.high;
            highReached = true;
          }
        } else if (highReached && !lowReached) {
          const priceChange = Math.random() * (currentPrice - initialCandle.low);
          newClose = currentPrice - priceChange;

          if (newClose <= initialCandle.low) {
            newClose = initialCandle.low;
            lowReached = true;
          }
        } else {
          const randomDirection = Math.random() < 0.5 ? -1 : 1;
          const priceChange = randomDirection * Math.random();
          newClose = Math.max(initialCandle.low, Math.min(initialCandle.high, currentPrice + priceChange));
        }

        currentPrice = newClose;

        // Update the current candle being fluctuated but do not add to displayed data yet
        return {
          ...prevCandle,
          close: newClose,
          high: Math.max(prevCandle.high, newClose),
          low: Math.min(prevCandle.low, newClose),
        };
      });
    }, 1000);

    return candleInterval;
  };

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

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Dashboard
        profile={profile}
        displayedData={displayedData}
        currentCandle={currentCandle}
        handleTrade={handleTrade}
      />
      <Notification notification={notification} handleClose={handleCloseNotification} />
    </ThemeProvider>
  );
}

export default App;
