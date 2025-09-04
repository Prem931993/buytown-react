import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  LocalShipping as TruckIcon,
  TwoWheeler as BikeIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    vehicle_type: '',
    capacity: '',
    driver_name: '',
    driver_phone: '',
    status: 'active',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Vehicle type icons
  const getVehicleIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'truck':
        return <TruckIcon />;
      case 'bike':
        return <BikeIcon />;
      default:
        return <CarIcon />;
    }
  };

  // Status colors
  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'error';
  };

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // For now, using mock data since the API might not be fully implemented
      const mockVehicles = [
        {
          id: 1,
          vehicle_number: 'MH12AB1234',
          vehicle_type: 'Truck',
          capacity: '5000kg',
          driver_name: 'Rajesh Kumar',
          driver_phone: '+91-9876543210',
          status: 'active',
          created_at: new Date(),
        },
        {
          id: 2,
          vehicle_number: 'MH12CD5678',
          vehicle_type: 'Bike',
          capacity: '50kg',
          driver_name: 'Amit Singh',
          driver_phone: '+91-9876543211',
          status: 'active',
          created_at: new Date(),
        },
        {
          id: 3,
          vehicle_number: 'MH12EF9012',
          vehicle_type: 'Car',
          capacity: '200kg',
          driver_name: 'Priya Sharma',
          driver_phone: '+91-9876543212',
          status: 'inactive',
          created_at: new Date(),
        },
      ];
      setVehicles(mockVehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch vehicles',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (editingVehicle) {
        // Update vehicle
        console.log('Updating vehicle:', editingVehicle.id, formData);
        setSnackbar({
          open: true,
          message: 'Vehicle updated successfully',
          severity: 'success',
        });
      } else {
        // Create new vehicle
        console.log('Creating vehicle:', formData);
        setSnackbar({
          open: true,
          message: 'Vehicle created successfully',
          severity: 'success',
        });
      }
      handleClose();
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save vehicle',
        severity: 'error',
      });
    }
  };

  // Handle delete
  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        console.log('Deleting vehicle:', vehicleId);
        setSnackbar({
          open: true,
          message: 'Vehicle deleted successfully',
          severity: 'success',
        });
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete vehicle',
          severity: 'error',
        });
      }
    }
  };

  // Open dialog for editing
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_number: vehicle.vehicle_number || '',
      vehicle_type: vehicle.vehicle_type || '',
      capacity: vehicle.capacity || '',
      driver_name: vehicle.driver_name || '',
      driver_phone: vehicle.driver_phone || '',
      status: vehicle.status || 'active',
    });
    setOpen(true);
  };

  // Open dialog for new vehicle
  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_number: '',
      vehicle_type: '',
      capacity: '',
      driver_name: '',
      driver_phone: '',
      status: 'active',
    });
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setEditingVehicle(null);
    setFormData({
      vehicle_number: '',
      vehicle_type: '',
      capacity: '',
      driver_name: '',
      driver_phone: '',
      status: 'active',
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Vehicle Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ borderRadius: 2 }}
        >
          Add Vehicle
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="text.secondary">
                  Total Vehicles
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vehicles.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ActiveIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" color="text.secondary">
                  Active Vehicles
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vehicles.filter(v => v.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TruckIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" color="text.secondary">
                  Trucks
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vehicles.filter(v => v.vehicle_type === 'Truck').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BikeIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" color="text.secondary">
                  Bikes
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vehicles.filter(v => v.vehicle_type === 'Bike').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vehicles Table */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Vehicle List
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Capacity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getVehicleIcon(vehicle.vehicle_type)}
                          <Typography sx={{ ml: 1, fontWeight: 500 }}>
                            {vehicle.vehicle_number}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{vehicle.vehicle_type}</TableCell>
                      <TableCell>{vehicle.capacity}</TableCell>
                      <TableCell>{vehicle.driver_name}</TableCell>
                      <TableCell>{vehicle.driver_phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={vehicle.status}
                          color={getStatusColor(vehicle.status)}
                          size="small"
                          icon={vehicle.status === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(vehicle)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(vehicle.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vehicle Number"
                value={formData.vehicle_number}
                onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                placeholder="e.g., MH12AB1234"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  value={formData.vehicle_type}
                  onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                  label="Vehicle Type"
                >
                  <MenuItem value="Car">Car</MenuItem>
                  <MenuItem value="Truck">Truck</MenuItem>
                  <MenuItem value="Bike">Bike</MenuItem>
                  <MenuItem value="Van">Van</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="e.g., 5000kg"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver Name"
                value={formData.driver_name}
                onChange={(e) => handleInputChange('driver_name', e.target.value)}
                placeholder="Enter driver name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Driver Phone"
                value={formData.driver_phone}
                onChange={(e) => handleInputChange('driver_phone', e.target.value)}
                placeholder="+91-9876543210"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingVehicle ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAdd}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default VehicleManagement;
