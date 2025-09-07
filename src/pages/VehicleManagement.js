import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  DirectionsBike as BikeIcon,
  LocalShipping as TruckIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { adminService } from '../services/adminService';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    rate_per_km: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Function to get icon based on vehicle type
  const getVehicleIcon = (type) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('two wheeler') || lowerType.includes('bike') || lowerType.includes('motorcycle')) {
      return <BikeIcon sx={{ mr: 2, color: 'primary.main' }} />;
    }
    if (lowerType.includes('cargo') || lowerType.includes('truck') || lowerType.includes('lorry')) {
      return <TruckIcon sx={{ mr: 2, color: 'primary.main' }} />;
    }
    if (lowerType.includes('pickup') || lowerType.includes('ace') || lowerType.includes('eicher') || lowerType.includes('tata') || lowerType.includes('407')) {
      return <CarIcon sx={{ mr: 2, color: 'primary.main' }} />;
    }
    // Default icon
    return <CarIcon sx={{ mr: 2, color: 'primary.main' }} />;
  };

  // Fetch vehicles with delivery persons
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await adminService.vehicles.getVehiclesWithDeliveryPersons();
      if (!response || !Array.isArray(response)) {
        throw new Error('Invalid response data');
      }
      setVehicles(response);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch vehicles with delivery persons',
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
        await adminService.vehicles.update(editingVehicle.id, formData);
        setSnackbar({
          open: true,
          message: 'Vehicle updated successfully',
          severity: 'success',
        });
      } else {
        // Create new vehicle
        await adminService.vehicles.create(formData);
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
        await adminService.vehicles.delete(vehicleId);
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
      vehicle_type: vehicle.vehicle_type || '',
      rate_per_km: vehicle.rate_per_km || '',
    });
    setOpen(true);
  };

  // Open dialog for new vehicle
  const handleAdd = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_type: '',
      rate_per_km: '',
    });
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setEditingVehicle(null);
    setFormData({
      vehicle_type: '',
      rate_per_km: '',
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
                <PersonIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" color="text.secondary">
                  Total Delivery Persons
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {vehicles.reduce((total, vehicle) => total + (vehicle.delivery_person_count || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Vehicles List */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Vehicle Types & Delivery Charges
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            vehicles.map((vehicle) => (
              <Accordion key={vehicle.id} sx={{ mb: 1 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getVehicleIcon(vehicle.vehicle_type)}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {vehicle.vehicle_type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ₹{vehicle.rate_per_km}/km
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={`${vehicle.delivery_person_count || 0} Delivery Person${vehicle.delivery_person_count !== 1 ? 's' : ''}`}
                        color="primary"
                        size="small"
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(vehicle);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(vehicle.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Assigned Delivery Persons ({vehicle.delivery_persons?.length || 0})
                  </Typography>
                  {vehicle.delivery_persons && vehicle.delivery_persons.length > 0 ? (
                    <List>
                      {vehicle.delivery_persons.map((person) => (
                        <ListItem key={person.id}>
                          <ListItemText
                            primary={person.name}
                            secondary={`${person.email} • ${person.phone}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No delivery persons assigned to this vehicle type yet.
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Vehicle Type"
                value={formData.vehicle_type}
                onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                placeholder="e.g., Two Wheeler, Cargo, Tata Ace"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Charge (₹/km)"
                type="number"
                value={formData.rate_per_km}
                onChange={(e) => handleInputChange('rate_per_km', e.target.value)}
                placeholder="e.g., 15.00"
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!formData.vehicle_type || !formData.rate_per_km}
          >
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
