import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

function PlaceholderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.substring(1); // Remove leading slash
  
  // Convert path to title (e.g., 'delivery' -> 'Delivery Management')
  const getPageTitle = () => {
    switch (path) {
      case 'delivery':
        return 'Delivery Management';
      case 'tax':
        return 'Tax Management';
      case 'payment':
        return 'Payment Gateway';
      case 'sms':
        return 'SMS Configuration';
      case 'email':
        return 'Email Configuration';
      default:
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        {getPageTitle()}
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mt: 4, 
          textAlign: 'center',
          border: '1px dashed #ccc',
          borderRadius: 2,
          backgroundColor: 'rgba(99, 102, 241, 0.04)'
        }}
      >
        <Typography variant="h5" gutterBottom color="primary.main">
          Coming Soon
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
          This feature is currently under development. Check back later for updates or contact the administrator for more information.
        </Typography>
        <Button 
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}

export default PlaceholderPage;