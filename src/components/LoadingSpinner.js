import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
        color: 'black',
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        sx={{
          color: 'black',
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'black',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
