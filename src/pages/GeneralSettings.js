import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import generalSettingsService from '../services/generalSettingsService';
import categoryService from '../services/categoryService.js';
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
  Autocomplete,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { logoService } from '../services/logoService';

const SortableItem = ({ category, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem
      ref={setNodeRef}
      style={style}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': {
          borderBottom: 'none',
        },
      }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        size="small"
        sx={{ mr: 1, cursor: 'grab' }}
      >
        <DragIndicatorIcon />
      </IconButton>
      <ListItemText primary={category.name} />
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => onRemove(category.id)}
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    contactDetails: '',
    phoneNumber: '',
    gstinNumber: '',
    companyEmail: '',
    companyPhoneNumber: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      youtube: '',
      instagram: '',
      linkedin: '',
    }
  });
  const [logos, setLogos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [newLogo, setNewLogo] = useState(null);
  const [categoriesMapped, setCategoriesMapped] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await generalSettingsService.getSettings();
      if (response.success && response.data) {
        const data = response.data;
        setSettings({
          companyName: data.company_name || '',
          contactDetails: data.company_details || '',
          phoneNumber: data.phone_number || '',
          gstinNumber: data.gstin_number || '',
          companyEmail: data.company_email || '',
          companyPhoneNumber: data.company_phone_number || '',
          socialLinks: {
            facebook: data.facebook_link || '',
            twitter: data.twitter_link || '',
            youtube: data.youtube_link || '',
            instagram: data.instagram_link || '',
            linkedin: data.linkedin_link || '',
          }
        });
        // Store selected categories IDs for later processing
        if (data.selected_categories && Array.isArray(data.selected_categories)) {
          setSelectedCategories(data.selected_categories.map(id => ({ id }))); // Temporary objects with just IDs
        }
      }
    } catch (error) {
      showSnackbar('Failed to fetch settings: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

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

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getAllEnabledCategoriesWithImages();
      if (response.statusCode === 200) {
        setCategories(response.categories || []);
        setAvailableCategories(response.categories || []);
      }
    } catch (error) {
      showSnackbar('Failed to fetch categories: ' + error.message, 'error');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchLogos();
    fetchCategories();
  }, [fetchSettings, fetchLogos, fetchCategories]);

  // Effect to map selected category IDs to full category objects when both are available
  useEffect(() => {
    if (categories.length > 0 && selectedCategories.length > 0 && selectedCategories[0].name === undefined && !categoriesMapped) {
      // selectedCategories contains temporary objects with just IDs, map to full objects
      const mappedCategories = selectedCategories
        .map(cat => categories.find(c => c.id === cat.id))
        .filter(Boolean); // Remove any undefined entries
      setSelectedCategories(mappedCategories);
      setCategoriesMapped(true);
    }
  }, [categories, selectedCategories, categoriesMapped]);

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
      const payload = {
        company_name: settings.companyName,
        company_details: settings.contactDetails,
        phone_number: settings.phoneNumber,
        gstin_number: settings.gstinNumber,
        company_email: settings.companyEmail,
        company_phone_number: settings.companyPhoneNumber,
        facebook_link: settings.socialLinks.facebook,
        twitter_link: settings.socialLinks.twitter,
        youtube_link: settings.socialLinks.youtube,
        instagram_link: settings.socialLinks.instagram,
        linkedin_link: settings.socialLinks.linkedin,
        selected_categories: selectedCategories.map(cat => cat.id),
      };
      const response = await generalSettingsService.updateSettings(payload);
      if (response.success) {
        showSnackbar('Settings saved successfully!', 'success');
      } else {
        showSnackbar('Failed to save settings: ' + (response.error || 'Unknown error'), 'error');
      }
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

  // Remove dialog and add drag and drop with autocomplete for categories selection

  const handleAddCategory = (category) => {
    if (category && !selectedCategories.find(cat => cat.id === category.id) && selectedCategories.length < 4) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (categoryId) => {
    setSelectedCategories(selectedCategories.filter(cat => cat.id !== categoryId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSelectedCategories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
        <Grid item xs={12} md={12} lg={12}>
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ width: '100%', p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selected Categories (max 4)
              </Typography>

              <Autocomplete
                multiple
                options={availableCategories.filter(cat => !selectedCategories.find(selected => selected.id === cat.id))}
                getOptionLabel={(option) => option.name}
                value={[]}
                onChange={(event, newValue) => {
                  if (newValue && newValue.length > 0) {
                    handleAddCategory(newValue[0]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add Category"
                    placeholder="Search and select categories..."
                    disabled={loadingCategories || selectedCategories.length >= 4}
                  />
                )}
                renderTags={() => null}
                disabled={selectedCategories.length >= 4}
                sx={{ mb: 2 }}
              />

              {selectedCategories.length > 0 && (
                <Typography variant="subtitle2" gutterBottom>
                  Selected Categories (Drag to reorder):
                </Typography>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedCategories.map(cat => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <List
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      minHeight: 100,
                    }}
                  >
                    {selectedCategories.map((category) => (
                      <SortableItem
                        key={category.id}
                        category={category}
                        onRemove={handleRemoveCategory}
                      />
                    ))}
                  </List>
                </SortableContext>
              </DndContext>

              {selectedCategories.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No categories selected. Use the search field above to add categories.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
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

              <TextField
                fullWidth
                label="Phone Number"
                value={settings.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="GSTIN Number"
                value={settings.gstinNumber}
                onChange={(e) => handleInputChange('gstinNumber', e.target.value)}
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Company Email"
                value={settings.companyEmail}
                onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                margin="normal"
                variant="outlined"
                type="email"
              />

              <TextField
                fullWidth
                label="Company Phone Number"
                value={settings.companyPhoneNumber}
                onChange={(e) => handleInputChange('companyPhoneNumber', e.target.value)}
                margin="normal"
                variant="outlined"
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
                label="YouTube"
                value={settings.socialLinks.youtube}
                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
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
