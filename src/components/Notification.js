// /src/components/Notification.js
import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const Notification = ({ notification, handleClose }) => (
  <Snackbar
    open={notification.open}
    autoHideDuration={6000}
    onClose={handleClose}
  >
    <Alert onClose={handleClose} severity={notification.severity}>
      {notification.message}
    </Alert>
  </Snackbar>
);

export default Notification;
