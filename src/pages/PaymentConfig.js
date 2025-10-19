import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Payment as PaymentIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

function PaymentConfig() {
  const [paymentConfigs, setPaymentConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    gateway_name: '',
    api_key: '',
    api_secret: '',
    webhook_secret: '',
    is_active: true,
    is_sandbox: true,
    currency: 'INR',
    description: ''
  });

  // Fetch payment configurations
  const fetchPaymentConfigs = async () => {
    try {
      const response = await adminService.config.getPaymentConfigs();
      setPaymentConfigs(response.configs || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load payment configurations',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchPaymentConfigs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await adminService.config.updatePaymentConfig(editingConfig.id, formData);
        setSnackbar({
          open: true,
          message: 'Payment configuration updated successfully',
          severity: 'success',
        });
      } else {
        await adminService.config.createPaymentConfig(formData);
        setSnackbar({
          open: true,
          message: 'Payment configuration created successfully',
          severity: 'success',
        });
      }
      setShowForm(false);
      setEditingConfig(null);
      setFormData({
        gateway_name: '',
        api_key: '',
        api_secret: '',
        webhook_secret: '',
        is_active: true,
        is_sandbox: true,
        currency: 'INR',
        description: ''
      });
      fetchPaymentConfigs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: editingConfig ? 'Failed to update payment configuration' : 'Failed to create payment configuration',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await adminService.config.deletePaymentConfig(id);
        fetchPaymentConfigs();
        setSnackbar({
          open: true,
          message: 'Payment configuration deleted successfully',
          severity: 'success',
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete payment configuration',
          severity: 'error',
        });
      }
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await adminService.config.updatePaymentConfig(id, { is_active: !currentActive });
      fetchPaymentConfigs();
      setSnackbar({
        open: true,
        message: `Configuration ${!currentActive ? 'activated' : 'deactivated'} successfully`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update configuration status',
        severity: 'error',
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      gateway_name: config.gateway_name || '',
      api_key: config.api_key || '',
      api_secret: '', // Do not prefill secret for security
      webhook_secret: config.webhook_secret || '',
      is_active: config.is_active || false,
      is_sandbox: config.is_sandbox || false,
      currency: config.currency || 'INR',
      description: config.description || ''
    });
    setShowForm(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const filteredPaymentConfigs = paymentConfigs.filter((config) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        config.gateway_name?.toLowerCase().includes(query) ||
        config.api_key?.toLowerCase().includes(query) ||
        config.currency?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Payment Configuration Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingConfig(null);
              setFormData({
                gateway_name: '',
                api_key: '',
                api_secret: '',
                webhook_secret: '',
                is_active: true,
                is_sandbox: true,
                currency: 'INR',
                description: ''
              });
            } else {
              setShowForm(true);
            }
          }}
          sx={{
            background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
            },
          }}
        >
          {showForm ? 'Cancel' : 'Add Configuration'}
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search payment configurations..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {showForm && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editingConfig ? 'Edit Payment Configuration' : 'Add New Payment Configuration'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gateway Name"
                    name="gateway_name"
                    value={formData.gateway_name}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="API Key"
                    name="api_key"
                    value={formData.api_key}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="API Secret"
                    name="api_secret"
                    type="password"
                    value={formData.api_secret}
                    onChange={handleInputChange}
                    required={!editingConfig}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Webhook Secret"
                    name="webhook_secret"
                    value={formData.webhook_secret}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    size="small"
                    SelectProps={{ native: true }}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Chip
                    label={formData.is_active ? 'Active' : 'Inactive'}
                    color={formData.is_active ? 'success' : 'default'}
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    sx={{ cursor: 'pointer', width: 'fit-content' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Chip
                    label={formData.is_sandbox ? 'Sandbox' : 'Live'}
                    color={formData.is_sandbox ? 'info' : 'default'}
                    onClick={() => setFormData({ ...formData, is_sandbox: !formData.is_sandbox })}
                    sx={{ cursor: 'pointer', width: 'fit-content' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
                        },
                      }}
                    >
                      Save Configuration
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
              <TableCell>ID</TableCell>
              <TableCell>Gateway Name</TableCell>
              <TableCell>API Key</TableCell>
              <TableCell>Active</TableCell>
              <TableCell>Sandbox</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPaymentConfigs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.id}</TableCell>
                <TableCell>{config.gateway_name}</TableCell>
                <TableCell>{config.api_key}</TableCell>
                <TableCell>
                  <Chip
                    label={config.is_active ? 'Active' : 'Inactive'}
                    color={config.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.is_sandbox ? 'Sandbox' : 'Live'}
                    color={config.is_sandbox ? 'info' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{config.currency}</TableCell>
                <TableCell>{config.description || '—'}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Configuration">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEdit(config)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Active Status">
                    <IconButton
                      size="small"
                      color={config.is_active ? 'default' : 'success'}
                      onClick={() => handleToggleActive(config.id, config.is_active)}
                    >
                      <PaymentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Configuration">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(config.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredPaymentConfigs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ? 'No payment configurations found matching your search' : 'No payment configurations found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default PaymentConfig;
