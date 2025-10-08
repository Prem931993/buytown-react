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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

function EmailConfig() {
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [editingConfig, setEditingConfig] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ id: null, name: '' });
  const [formData, setFormData] = useState({
    config_type: 'smtp',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_password: '',
    smtp_secure: false,
    from_email: '',
    from_name: '',
    mail_user: '',
    mail_client_id: '',
    mail_client_secret: '',
    mail_refresh_token: '',
    mail_access_token: '',
    token_expires_at: '',
    enabled: true
  });

  // Fetch email configurations
  const fetchEmailConfigs = async () => {
    try {
      const response = await adminService.config.getEmailConfigs();
      setEmailConfigs(response.configs || []);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to load email configurations',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchEmailConfigs();
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
        // Update existing config
        await adminService.config.updateEmailConfig(editingConfig.id, formData);
        setSnackbar({
          open: true,
          message: 'Email configuration updated successfully',
          severity: 'success',
        });
      } else {
        // Create new config
        await adminService.config.createEmailConfig(formData);
        setSnackbar({
          open: true,
          message: 'Email configuration created successfully',
          severity: 'success',
        });
      }
      setShowForm(false);
      setEditingConfig(null);
      setFormData({
        config_type: 'smtp',
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_password: '',
        smtp_secure: false,
        from_email: '',
        from_name: '',
        mail_user: '',
        mail_client_id: '',
        mail_client_secret: '',
        mail_refresh_token: '',
        mail_access_token: '',
        token_expires_at: '',
        enabled: true
      });
      fetchEmailConfigs();
    } catch (err) {
      setSnackbar({
        open: true,
        message: editingConfig ? 'Failed to update email configuration' : 'Failed to create email configuration',
        severity: 'error',
      });
    }
  };

  const handleDeleteConfirmation = (id, name) => {
    setDeleteItem({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteItem({ id: null, name: '' });
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminService.config.deleteEmailConfig(deleteItem.id);
      fetchEmailConfigs();
      setSnackbar({
        open: true,
        message: 'Email configuration deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setDeleteItem({ id: null, name: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete email configuration',
        severity: 'error',
      });
      setDeleteDialogOpen(false);
      setDeleteItem({ id: null, name: '' });
    }
  };

  const handleToggleEnabled = async (id, currentEnabled) => {
    try {
      await adminService.config.updateEmailConfig(id, { enabled: !currentEnabled });
      fetchEmailConfigs();
      setSnackbar({
        open: true,
        message: `Configuration ${!currentEnabled ? 'enabled' : 'disabled'} successfully`,
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
      config_type: config.config_type || 'smtp',
      smtp_host: config.smtp_host || '',
      smtp_port: config.smtp_port || '',
      smtp_user: config.smtp_user || '',
      smtp_password: '', // Do not prefill password for security
      smtp_secure: config.smtp_secure || false,
      from_email: config.from_email || '',
      from_name: config.from_name || '',
      mail_user: config.mail_user || '',
      mail_client_id: config.mail_client_id || '',
      mail_client_secret: '', // Do not prefill secret for security
      mail_refresh_token: '', // Do not prefill token for security
      mail_access_token: config.mail_access_token || '',
      token_expires_at: config.token_expires_at || '',
      enabled: config.enabled || false,
    });
    setShowForm(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };


  const filteredEmailConfigs = emailConfigs.filter((config) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        config.from_email?.toLowerCase().includes(query) ||
        config.from_name?.toLowerCase().includes(query) ||
        config.config_type?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Email Configuration Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingConfig(null);
              setFormData({
                config_type: 'smtp',
                smtp_host: '',
                smtp_port: '',
                smtp_user: '',
                smtp_password: '',
                smtp_secure: false,
                from_email: '',
                from_name: '',
                mail_user: '',
                mail_client_id: '',
                mail_client_secret: '',
                mail_refresh_token: '',
                mail_access_token: '',
                token_expires_at: '',
                enabled: true
              });
            } else {
              setShowForm(true);
            }
          }}
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
                placeholder="Search email configurations..."
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
              {editingConfig ? 'Edit Email Configuration' : 'Add New Email Configuration'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Configuration Type"
                    name="config_type"
                    value={formData.config_type}
                    onChange={handleInputChange}
                    size="small"
                  >
                    <option value="smtp">SMTP</option>
                    <option value="gmail_app_password">Gmail App Password</option>
                    <option value="oauth2">OAuth2</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="From Email"
                    name="from_email"
                    value={formData.from_email}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="From Name"
                    name="from_name"
                    value={formData.from_name}
                    onChange={handleInputChange}
                    required
                    size="small"
                  />
                </Grid>

                {(formData.config_type === 'smtp' || formData.config_type === 'gmail_app_password') && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Host"
                        name="smtp_host"
                        value={formData.smtp_host}
                        onChange={handleInputChange}
                        required
                        placeholder={formData.config_type === 'gmail_app_password' ? 'smtp.gmail.com' : ''}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Port"
                        name="smtp_port"
                        type="number"
                        value={formData.smtp_port}
                        onChange={handleInputChange}
                        required
                        placeholder={formData.config_type === 'gmail_app_password' ? '587' : ''}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP User"
                        name="smtp_user"
                        value={formData.smtp_user}
                        onChange={handleInputChange}
                        required
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SMTP Password"
                        name="smtp_password"
                        type="password"
                        value={formData.smtp_password}
                        onChange={handleInputChange}
                        required={!editingConfig} // Required only if creating new config
                        placeholder={formData.config_type === 'gmail_app_password' ? 'Your Gmail App Password' : ''}
                        size="small"
                      />
                    </Grid>
                  </>
                )}

                {formData.config_type === 'oauth2' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Gmail User"
                        name="mail_user"
                        value={formData.mail_user}
                        onChange={handleInputChange}
                        required
                        placeholder="your-email@gmail.com"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client ID"
                        name="mail_client_id"
                        value={formData.mail_client_id}
                        onChange={handleInputChange}
                        required
                        placeholder="Your Google Client ID"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Client Secret"
                        name="mail_client_secret"
                        type="password"
                        value={formData.mail_client_secret}
                        onChange={handleInputChange}
                        required
                        placeholder="Your Google Client Secret"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Refresh Token"
                        name="mail_refresh_token"
                        type="password"
                        value={formData.mail_refresh_token}
                        onChange={handleInputChange}
                        required
                        placeholder="Your Google Refresh Token"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Access Token"
                        name="mail_access_token"
                        value={formData.mail_access_token}
                        onChange={handleInputChange}
                        placeholder="Access token will be auto-generated"
                        size="small"
                      />
                    </Grid>
                  </>
                )}

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
              <TableCell>Type</TableCell>
              <TableCell>From Email</TableCell>
              <TableCell>From Name</TableCell>
              <TableCell>SMTP Host</TableCell>
              <TableCell>SMTP Port</TableCell>
              <TableCell>SMTP User</TableCell>
              <TableCell>Enabled</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmailConfigs.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.id}</TableCell>
                <TableCell>
                  <Chip
                    label={config.config_type === 'gmail_app_password' ? 'Gmail App Password' :
                           config.config_type === 'oauth2' ? 'OAuth2' : 'SMTP'}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>{config.from_email}</TableCell>
                <TableCell>{config.from_name}</TableCell>
                <TableCell>{config.smtp_host || '—'}</TableCell>
                <TableCell>{config.smtp_port || '—'}</TableCell>
                <TableCell>{config.smtp_user || '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={config.enabled ? 'Active' : 'Inactive'}
                    color={config.enabled ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
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
                  <Tooltip title="Toggle Status">
                    <IconButton
                      size="small"
                      color={config.enabled ? 'default' : 'success'}
                      onClick={() => handleToggleEnabled(config.id, config.enabled)}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Configuration">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteConfirmation(config.id, config.from_email)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmailConfigs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {searchQuery ? 'No email configurations found matching your search' : 'No email configurations found'}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the email configuration for "{deleteItem.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EmailConfig;
