import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
 import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { logoService } from '../services/logoService';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    contactDetails: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
    }
  });
  const [logos, setLogos] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [newLogo, setNewLogo] = useState(null);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchLogos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await logoService.getLogos();
      setLogos(data.logos || []);
    } catch (error) {
      showSnackbar('Failed to fetch logos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  const handleInputChange = (field, value) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };

  const handleSocialLinkChange = (platform, value) => {
    setSettings({
      ...settings,
      socialLinks: {
        ...settings.socialLinks,
        [platform]: value
      }
    });
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Save settings to backend
      showSnackbar('Settings saved successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to save settings: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewLogo(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!newLogo) {
      showSnackbar('Please select a logo file', 'error');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', newLogo);

      const uploadResponse = await axios.post('/upload/logos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const filePath = uploadResponse.data.filePath;
      const metadata = {
        fileName: newLogo.name,
        filePath: filePath,
      };

      await logoService.uploadLogos(metadata);
      showSnackbar('Logo uploaded successfully!', 'success');
      setNewLogo(null);
      fetchLogos();
    } catch (error) {
      showSnackbar('Failed to upload logo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogo = async (id) => {
    try {
      setLoading(true);
      await logoService.deleteLogo(id);
      showSnackbar('Logo deleted successfully!', 'success');
      fetchLogos();
    } catch (error) {
      showSnackbar('Failed to delete logo: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        General Settings
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              
              <TextField
                fullWidth
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Contact Details"
                value={settings.contactDetails}
                onChange={(e) => handleInputChange('contactDetails', e.target.value)}
                margin="normal"
                variant="outlined"
                multiline
                rows={4}
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Social Network Links
              </Typography>
              
              <TextField
                fullWidth
                label="Facebook"
                value={settings.socialLinks.facebook}
                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Twitter"
                value={settings.socialLinks.twitter}
                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Instagram"
                value={settings.socialLinks.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                margin="normal"
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="LinkedIn"
                value={settings.socialLinks.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                margin="normal"
                variant="outlined"
              />
              
              <Button
                variant="contained"
                onClick={handleSaveSettings}
                disabled={loading}
                sx={{ mt: 3 }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Logo Management
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleLogoFileChange}
                />
                <label htmlFor="logo-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    disabled={loading}
                  >
                    {newLogo ? newLogo.name : 'Select Logo'}
                  </Button>
                </label>
                <Button
                  variant="contained"
                  onClick={handleUploadLogo}
                  disabled={loading || !newLogo}
                  sx={{ ml: 2 }}
                >
                  Upload Logo
                </Button>
              </Box>
              
              {logos.length > 0 ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Uploaded Logos
                  </Typography>
                  
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <List>
                      {logos.map((logo) => (
                        <ListItem
                          key={logo.id}
                          sx={{
                            mb: 1,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <img 
                            src={logo.file_path} 
                            alt={logo.name}
                            style={{ 
                              width: 60, 
                              height: 40, 
                              objectFit: 'cover', 
                              marginRight: 16,
                              borderRadius: 4 
                            }}
                          />
                          <ListItemText
                            primary={logo.name}
                            secondary={`Path: ${logo.file_path}`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleDeleteLogo(logo.id)}
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  No logos uploaded yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GeneralSettings;
