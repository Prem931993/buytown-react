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
} from '@mui/material';
import {
  Save as SaveIcon,
  LocationOn as LocationIcon,
  RadioButtonChecked as RadiusIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminService } from '../services/adminService.js';


function DeliverySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    center_point: '',
    delivery_radius_km: 10,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch delivery settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.delivery.getSettings();
      setSettings({
        center_point: response.settings?.center_point || '',
        delivery_radius_km: response.settings?.delivery_radius_km || 10,
      });
    } catch (error) {
      console.error('Error fetching delivery settings:', error);
      // Fallback to default settings if API fails
      setSettings({
        center_point: '',
        delivery_radius_km: 10,
      });
      setSnackbar({
        open: true,
        message: 'Failed to fetch delivery settings, using defaults',
        severity: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Validate inputs
      if (!settings.center_point.trim()) {
        setSnackbar({
          open: true,
          message: 'Center point coordinates are required',
          severity: 'error',
        });
        return;
      }

      if (settings.delivery_radius_km <= 0) {
        setSnackbar({
          open: true,
          message: 'Delivery radius must be greater than 0',
          severity: 'error',
        });
        return;
      }

      // Validate coordinates format (latitude,longitude)
      const coords = settings.center_point.split(',');
      if (coords.length !== 2) {
        setSnackbar({
          open: true,
          message: 'Center point must be in format: latitude,longitude',
          severity: 'error',
        });
        return;
      }

      const lat = parseFloat(coords[0].trim());
      const lng = parseFloat(coords[1].trim());

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        setSnackbar({
          open: true,
          message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180',
          severity: 'error',
        });
        return;
      }

      // Save settings
      await adminService.delivery.updateSettings(settings);
      setSnackbar({
        open: true,
        message: 'Delivery settings saved successfully',
        severity: 'success',
      });
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
  const getCoordinatesDisplay = () => {
    if (!settings.center_point) return 'Not set';

    const coords = settings.center_point.split(',');
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
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Delivery Zone Configuration
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Configure the delivery zone by setting the center point coordinates and delivery radius.
                    Orders will be accepted only within this delivery zone.
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Center Point Coordinates"
                      value={settings.center_point}
                      onChange={(e) => handleInputChange('center_point', e.target.value)}
                      placeholder="e.g., 19.0760,72.8777"
                      helperText="Enter coordinates as: latitude,longitude"
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Delivery Radius (km)"
                      type="number"
                      value={settings.delivery_radius_km}
                      onChange={(e) => handleInputChange('delivery_radius_km', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 1, max: 100 }}
                      InputProps={{
                        startAdornment: <RadiusIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                      helperText="Maximum delivery distance from center point"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                    sx={{ minWidth: 120 }}
                  >
                    {saving ? <CircularProgress size={20} /> : 'Save Settings'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSettings({
                        center_point: '',
                        delivery_radius_km: 10,
                      });
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Info Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Current Settings
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Center Point
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {getCoordinatesDisplay()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Delivery Radius
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {settings.delivery_radius_km} km
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Coverage Area
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {Math.round(Math.PI * Math.pow(settings.delivery_radius_km, 2))} km²
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
