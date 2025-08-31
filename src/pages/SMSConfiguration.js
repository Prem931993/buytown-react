import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const SMSConfiguration = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [otpData, setOtpData] = useState({ phone: '', email: '', otp: '' });

  const [formData, setFormData] = useState({
    provider: 'msg91',
    api_key: '',
    api_secret: '',
    additional_config: {
      sender_id: '',
      region: 'us1',
      account_sid: ''
    }
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.sms.getConfigurations();
      setConfigs(response.configs || []);
    } catch (error) {
      showSnackbar('Failed to fetch SMS configurations: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  const handleSubmit = async () => {
    // Client-side validation for Twilio
    if (formData.provider === 'twilio' && !formData.additional_config.sender_id) {
      showSnackbar('Sender phone number is required for Twilio configuration', 'error');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        additional_config: JSON.stringify(formData.additional_config)
      };

      if (editingConfig) {
        await adminService.sms.updateConfiguration(editingConfig.id, data);
        showSnackbar('SMS configuration updated successfully!');
      } else {
        await adminService.sms.createConfiguration(data);
        showSnackbar('SMS configuration created successfully!');
      }

      setDialogOpen(false);
      setEditingConfig(null);
      resetForm();
      fetchConfigs();
    } catch (error) {
      showSnackbar('Failed to save configuration: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SMS configuration?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.sms.deleteConfiguration(id);
      showSnackbar('SMS configuration deleted successfully!');
      fetchConfigs();
    } catch (error) {
      showSnackbar('Failed to delete configuration: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);

    // Parse additional_config properly (it might be double-stringified)
    let additionalConfig = {};
    try {
      additionalConfig = JSON.parse(config.additional_config);
      if (typeof additionalConfig === 'string') {
        additionalConfig = JSON.parse(additionalConfig);
      }
    } catch (e) {
      additionalConfig = {};
    }

    setFormData({
      provider: config.provider,
      api_key: config.api_key,
      api_secret: config.api_secret,
      additional_config: additionalConfig
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      provider: 'msg91',
      api_key: '',
      api_secret: '',
      additional_config: {
        sender_id: '',
        region: 'us1',
        account_sid: ''
      }
    });
  };

  const handleSendOtp = async () => {
    if (!otpData.phone && !otpData.email) {
      showSnackbar('Please provide either phone or email', 'error');
      return;
    }

    try {
      setLoading(true);
      await adminService.sms.sendOtp({
        phone: otpData.phone,
        email: otpData.email
      });
      showSnackbar('OTP sent successfully!');
      setOtpData({ ...otpData, otp: '' });
    } catch (error) {
      showSnackbar('Failed to send OTP: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpData.phone || !otpData.otp) {
      showSnackbar('Please provide phone and OTP', 'error');
      return;
    }

    try {
      setLoading(true);
      await adminService.sms.verifyOtp({
        phone: otpData.phone,
        otp: otpData.otp
      });
      showSnackbar('OTP verified successfully!');
      setOtpData({ phone: '', email: '', otp: '' });
    } catch (error) {
      showSnackbar('OTP verification failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupOtps = async () => {
    try {
      setLoading(true);
      await adminService.sms.cleanupExpiredOtps();
      showSnackbar('Expired OTPs cleaned up successfully!');
    } catch (error) {
      showSnackbar('Failed to cleanup OTPs: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'msg91':
        return '🇮🇳';
      case 'textlocal':
        return '📱';
      case 'gupshup':
        return '💬';
      case 'twilio':
        return '📱';
      case 'nexmo':
        return '📞';
      case 'whatsapp':
        return '💬';
      default:
        return '📤';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          SMS Configuration & OTP Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleCleanupOtps}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Cleanup OTPs
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingConfig(null);
              resetForm();
              setDialogOpen(true);
            }}
            disabled={loading}
          >
            Add Configuration
          </Button>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* SMS Configurations */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                SMS Provider Configurations
              </Typography>

              {configs.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No SMS configurations found. Add your first configuration to get started.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {configs.map((config) => (
                    <Accordion key={config.id} sx={{ mb: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" width="100%">
                          <Typography variant="h6" sx={{ mr: 2 }}>
                            {getProviderIcon(config.provider)} {config.provider.toUpperCase()}
                          </Typography>
                          <Chip
                            label="Active"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Property</strong></TableCell>
                                <TableCell><strong>Value</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>Provider</TableCell>
                                <TableCell>{config.provider}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>API Key</TableCell>
                                <TableCell>{config.api_key ? '••••••••' : 'Not set'}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>API Secret</TableCell>
                                <TableCell>{config.api_secret ? '••••••••' : 'Not set'}</TableCell>
                              </TableRow>
                              {(() => {
                                let additionalConfig = {};
                                try {
                                  additionalConfig = JSON.parse(config.additional_config);
                                  if (typeof additionalConfig === 'string') {
                                    additionalConfig = JSON.parse(additionalConfig);
                                  }
                                } catch (e) {
                                  additionalConfig = {};
                                }
                                return Object.entries(additionalConfig).map(([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                                    <TableCell>{value || 'Not set'}</TableCell>
                                  </TableRow>
                                ));
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        <Box mt={2} display="flex" justifyContent="flex-end">
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit(config)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(config.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* OTP Testing */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                OTP Testing
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Test your SMS configuration by sending and verifying OTPs
              </Typography>

              <Box mt={2}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={otpData.phone}
                  onChange={(e) => setOtpData({ ...otpData, phone: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  placeholder="+1234567890"
                />

                <TextField
                  fullWidth
                  label="Email (Optional)"
                  value={otpData.email}
                  onChange={(e) => setOtpData({ ...otpData, email: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  placeholder="user@example.com"
                />

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={handleSendOtp}
                  disabled={loading || (!otpData.phone && !otpData.email)}
                  sx={{ mt: 2 }}
                >
                  Send OTP
                </Button>

                <TextField
                  fullWidth
                  label="Enter OTP"
                  value={otpData.otp}
                  onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                  margin="normal"
                  variant="outlined"
                  placeholder="123456"
                />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleVerifyOtp}
                  disabled={loading || !otpData.phone || !otpData.otp}
                  sx={{ mt: 1 }}
                >
                  Verify OTP
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Configuration Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Edit SMS Configuration' : 'Add SMS Configuration'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Provider</InputLabel>
                <Select
                  value={formData.provider}
                  onChange={(e) => handleFormChange('provider', e.target.value)}
                  label="Provider"
                >
                  <MenuItem value="msg91">MSG91 (India)</MenuItem>
                  <MenuItem value="textlocal">Textlocal (India)</MenuItem>
                  <MenuItem value="gupshup">Gupshup (India)</MenuItem>
                  <MenuItem value="twilio">Twilio</MenuItem>
                  <MenuItem value="nexmo">Nexmo (Vonage)</MenuItem>
                  <MenuItem value="whatsapp">WhatsApp Business</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.provider === 'msg91' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Auth Key"
                    value={formData.api_key}
                    onChange={(e) => handleFormChange('api_key', e.target.value)}
                    variant="outlined"
                    type="password"
                    placeholder="Enter MSG91 Auth Key"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender ID"
                    value={formData.additional_config.sender_id || ''}
                    onChange={(e) => handleFormChange('additional_config.sender_id', e.target.value)}
                    variant="outlined"
                    placeholder="Enter Sender ID"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Route"
                    value={formData.additional_config.route || ''}
                    onChange={(e) => handleFormChange('additional_config.route', e.target.value)}
                    variant="outlined"
                    placeholder="Enter Route (e.g., 4)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country Code"
                    value={formData.additional_config.country || ''}
                    onChange={(e) => handleFormChange('additional_config.country', e.target.value)}
                    variant="outlined"
                    placeholder="Enter Country Code (e.g., 91)"
                  />
                </Grid>
              </>
            )}

            {formData.provider !== 'msg91' && formData.provider !== 'twilio' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="API Key"
                    value={formData.api_key}
                    onChange={(e) => handleFormChange('api_key', e.target.value)}
                    variant="outlined"
                    type="password"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="API Secret"
                    value={formData.api_secret}
                    onChange={(e) => handleFormChange('api_secret', e.target.value)}
                    variant="outlined"
                    type="password"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sender ID"
                value={formData.additional_config.sender_id}
                onChange={(e) => handleFormChange('additional_config.sender_id', e.target.value)}
                variant="outlined"
                placeholder="+1234567890"
              />
            </Grid>

            {formData.provider === 'twilio' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account SID"
                    value={formData.api_key}
                    onChange={(e) => handleFormChange('api_key', e.target.value)}
                    variant="outlined"
                    placeholder="Enter Twilio Account SID"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Auth Token"
                    value={formData.api_secret}
                    onChange={(e) => handleFormChange('api_secret', e.target.value)}
                    variant="outlined"
                    type="password"
                    placeholder="Enter Twilio Auth Token"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sender Phone Number"
                    value={formData.additional_config.sender_id}
                    onChange={(e) => handleFormChange('additional_config.sender_id', e.target.value)}
                    variant="outlined"
                    placeholder="+1234567890"
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={formData.additional_config.region}
                  onChange={(e) => handleFormChange('additional_config.region', e.target.value)}
                  label="Region"
                >
                  <MenuItem value="us1">US East (us1)</MenuItem>
                  <MenuItem value="eu1">EU Ireland (eu1)</MenuItem>
                  <MenuItem value="au1">Australia (au1)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {editingConfig ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
};

export default SMSConfiguration;
