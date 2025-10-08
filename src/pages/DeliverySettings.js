import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  LocationOn as LocationIcon,
  RadioButtonChecked as RadiusIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { adminService } from '../services/adminService.js';


function DeliverySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch delivery settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.delivery.getAllSettings();
      setSettings(response.settings || []);
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      setSettings([]);
      setSnackbar({
        open: true,
        message: 'Failed to fetch delivery settings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (index, field, value) => {
    setSettings(prev => prev.map((setting, i) =>
      i === index ? { ...setting, [field]: value } : setting
    ));
  };

  // Handle toggle active
  const handleToggleActive = (index) => {
    setSettings(prev => prev.map((setting, i) =>
      i === index ? { ...setting, is_active: !setting.is_active } : setting
    ));
  };

  // Handle add new setting
  const handleAddNew = () => {
    setSettings(prev => [...prev, {
      center_point: '',
      delivery_radius_km: 10,
      is_active: true,
    }]);
  };

  // Handle delete setting
  const handleDelete = async (index) => {
    const setting = settings[index];
    if (setting.id) {
      // Existing setting, delete from API
      try {
        await adminService.delivery.deleteSetting(setting.id);
        setSettings(prev => prev.filter((_, i) => i !== index));
        setSnackbar({
          open: true,
          message: 'Delivery setting deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting delivery setting:', error);
        setSnackbar({
          open: true,
          message: 'Failed to delete delivery setting',
          severity: 'error',
        });
      }
    } else {
      // New setting, just remove from array
      setSettings(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Validate single setting
  const validateSetting = (setting) => {
    if (!setting.center_point.trim()) {
      return 'Center point coordinates are required';
    }

    if (setting.delivery_radius_km <= 0) {
      return 'Delivery radius must be greater than 0';
    }

    // Validate coordinates format (latitude,longitude)
    const coords = setting.center_point.split(',');
    if (coords.length !== 2) {
      return 'Center point must be in format: latitude,longitude';
    }

    const lat = parseFloat(coords[0].trim());
    const lng = parseFloat(coords[1].trim());

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate all settings
      for (let i = 0; i < settings.length; i++) {
        const error = validateSetting(settings[i]);
        if (error) {
          setSnackbar({
            open: true,
            message: `Setting ${i + 1}: ${error}`,
            severity: 'error',
          });
          return;
        }
      }

      // Save each setting
      const promises = settings.map(async (setting) => {
        if (setting.id) {
          // Update existing
          return adminService.delivery.updateSetting(setting.id, {
            center_point: setting.center_point,
            delivery_radius_km: setting.delivery_radius_km,
            is_active: setting.is_active,
          });
        } else {
          // Create new
          return adminService.delivery.createSetting({
            center_point: setting.center_point,
            delivery_radius_km: setting.delivery_radius_km,
            is_active: setting.is_active,
          });
        }
      });

      await Promise.all(promises);

      setSnackbar({
        open: true,
        message: 'Delivery settings saved successfully',
        severity: 'success',
      });

      // Refresh settings
      await fetchSettings();
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save delivery settings',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  // Get coordinates display
  const getCoordinatesDisplay = (center_point) => {
    if (!center_point) return 'Not set';

    const coords = center_point.split(',');
    if (coords.length === 2) {
      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    }
    return 'Invalid format';
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Delivery Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchSettings}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Main Settings Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Delivery Zone Configuration
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNew}
                    size="small"
                  >
                    Add New
                  </Button>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Configure multiple delivery zones by setting center point coordinates and delivery radius.
                    Orders will be accepted only within active delivery zones.
                  </Typography>
                </Box>

                {settings.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No delivery settings configured. Click "Add New" to create your first delivery zone.
                    </Typography>
                  </Box>
                ) : (
                  <List>
                    {settings.map((setting, index) => (
                      <ListItem key={setting.id || `new-${index}`} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2 }}>
                        <ListItemText>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={5}>
                              <TextField
                                fullWidth
                                label="Center Point Coordinates"
                                value={setting.center_point}
                                onChange={(e) => handleInputChange(index, 'center_point', e.target.value)}
                                placeholder="e.g., 19.0760,72.8777"
                                helperText="latitude,longitude"
                                size="small"
                                InputProps={{
                                  startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active', fontSize: 18 }} />,
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <TextField
                                fullWidth
                                label="Delivery Radius (km)"
                                type="number"
                                value={setting.delivery_radius_km}
                                onChange={(e) => handleInputChange(index, 'delivery_radius_km', parseFloat(e.target.value) || 0)}
                                inputProps={{ min: 1, max: 100 }}
                                size="small"
                                InputProps={{
                                  startAdornment: <RadiusIcon sx={{ mr: 1, color: 'action.active', fontSize: 18 }} />,
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Coverage: {Math.round(Math.PI * Math.pow(setting.delivery_radius_km, 2))} km²
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {getCoordinatesDisplay(setting.center_point)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </ListItemText>
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: '0.8rem',
                                  color: setting.is_active ? 'success.main' : 'text.secondary',
                                  fontWeight: 500,
                                  minWidth: 55,
                                  textAlign: 'right'
                                }}
                              >
                                {setting.is_active ? 'Active' : 'Inactive'}
                              </Typography>
                              <Switch
                                checked={setting.is_active}
                                onChange={() => handleToggleActive(index)}
                                color="primary"
                                size="small"
                                sx={{
                                  '& .MuiSwitch-thumb': {
                                    backgroundColor: setting.is_active ? 'success.main' : 'grey.400',
                                  },
                                  '& .MuiSwitch-track': {
                                    backgroundColor: setting.is_active ? 'success.light' : 'grey.300',
                                  },
                                }}
                              />
                            </Box>
                            <Box sx={{ width: 1, height: 24, borderLeft: 1, borderColor: 'divider', mx: 0.5 }} />
                            <IconButton
                              onClick={() => handleDelete(index)}
                              color="error"
                              size="small"
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  color: 'white',
                                },
                                borderRadius: 1,
                                p: 0.75,
                                ml: 0.5,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                {settings.length > 0 && (
                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmit}
                      disabled={saving}
                      sx={{ minWidth: 120 }}
                    >
                      {saving ? <CircularProgress size={20} /> : 'Save All Settings'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Info Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Current Settings Summary
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Delivery Zones
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {settings.length}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Active Zones
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {settings.filter(s => s.is_active).length}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Average Radius
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {settings.length > 0 ? (settings.reduce((sum, s) => sum + s.delivery_radius_km, 0) / settings.length).toFixed(1) : 0} km
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Total Coverage Area
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {settings.reduce((sum, s) => sum + Math.round(Math.PI * Math.pow(s.delivery_radius_km, 2)), 0)} km²
                </Typography>
              </Box>
            </Paper>

            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Use Google Maps to find the exact coordinates of your business location.
                Right-click on the map and select "What's here?" to get the coordinates.
              </Typography>
            </Alert>
          </Grid>

          {/* Help Section */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  How to Configure Delivery Settings
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      1. Find Your Location
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Go to Google Maps, find your business location, right-click and copy the coordinates.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      2. Set Delivery Radius
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Choose a radius that covers your delivery area. Consider traffic and delivery time.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      3. Test the Zone
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      After saving, test with sample addresses to ensure the delivery zone works correctly.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      4. Monitor Performance
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Regularly review delivery performance and adjust the radius as needed.
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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
    </Box>
  );
}

export default DeliverySettings;
