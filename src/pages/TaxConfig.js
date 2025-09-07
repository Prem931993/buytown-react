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
  Percent as PercentIcon,
} from '@mui/icons-material';

function TaxConfig() {
  const [taxConfigs, setTaxConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    tax_name: '',
    tax_rate: '',
    tax_type: 'percentage',
    is_active: true,
    description: ''
  });

  // Fetch tax configurations
  const fetchTaxConfigs = async () => {
    try {
      const response = await adminService.config.getTaxConfigs();
      setTaxConfigs(response.configs || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load tax configurations',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchTaxConfigs();
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
      await adminService.config.createTaxConfig(formData);
      setShowForm(false);
      setFormData({
        tax_name: '',
        tax_rate: '',
        tax_type: 'percentage',
        is_active: true,
        description: ''
      });
      fetchTaxConfigs();
      setSnackbar({
        open: true,
        message: 'Tax configuration created successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to create tax configuration',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await adminService.config.deleteTaxConfig(id);
        fetchTaxConfigs();
        setSnackbar({
          open: true,
          message: 'Tax configuration deleted successfully',
          severity: 'success',
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Failed to delete tax configuration',
          severity: 'error',
        });
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const filteredTaxConfigs = taxConfigs.filter((config) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        config.tax_name?.toLowerCase().includes(query) ||
        config.description?.toLowerCase().includes(query) ||
        config.tax_type?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Tax Configuration Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(!showForm)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
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
                placeholder="Search tax configurations..."
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
              Add New Tax Configuration
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax Name"
                    name="tax_name"
                    value={formData.tax_name}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tax Rate (%)"
                    name="tax_rate"
                    type="number"
                    value={formData.tax_rate}
                    onChange={handleInputChange}
                    step="0.01"
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tax Type"
                    name="tax_type"
                    value={formData.tax_type}
                    onChange={handleInputChange}
                    size="small"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="is_active"
                    value={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                    size="small"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    size="small"
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
              <TableCell>Tax Name</TableCell>
              <TableCell>Tax Rate</TableCell>
              <TableCell>Tax Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTaxConfigs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PercentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {config.tax_name}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{config.tax_rate}%</TableCell>
                <TableCell>
                  <Chip
                    label={config.tax_type === 'percentage' ? 'Percentage' : 'Fixed'}
                    size="small"
                    color={config.tax_type === 'percentage' ? 'primary' : 'secondary'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={config.is_active ? 'Active' : 'Inactive'}
                    color={config.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{config.description || '—'}</TableCell>
                <TableCell align="right">
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
            {filteredTaxConfigs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ? 'No tax configurations found matching your search' : 'No tax configurations found'}
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

export default TaxConfig;
