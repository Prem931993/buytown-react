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
  Divider,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  AppBar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Edit as EditIcon,
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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { bannerService } from '../services/bannerService';

const BannerUpload = () => {
  const [banners, setBanners] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState({
    id: null,
    type: 'image',
    file: null,
    url: '',
    linkUrl: '',
    linkTarget: '_self'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Create a SortableItem component
  const SortableItem = ({ banner }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: banner.id });
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    const getMediaPreview = (banner) => {
      if (banner.media_type === 'youtube') {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = banner.file_path.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
        return (
          <img 
            src={thumbnailUrl} 
            alt="YouTube Thumbnail"
            style={{ 
              width: 60, 
              height: 40, 
              objectFit: 'cover', 
              marginRight: 16,
              borderRadius: 4 
            }}
          />
        );
      } else if (banner.media_type === 'video') {
        // For video files, show a video icon or a placeholder
        return (
          <Box sx={{ 
            width: 60, 
            height: 40, 
            backgroundColor: '#333', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            borderRadius: 1,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem'
          }}>
            VIDEO
          </Box>
        );
      } else {
        return (
          <img 
            src={banner.file_path} 
            alt={banner.name}
            style={{ 
              width: 60, 
              height: 40, 
              objectFit: 'cover', 
              marginRight: 16,
              borderRadius: 4 
            }}
          />
        );
      }
    };
    
    return (
      <Box
        ref={setNodeRef}
        style={style}
        {...attributes}
        sx={{
          mb: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          position: 'relative',
        }}
      >
        <Box
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            p: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box {...listeners} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <DragIcon sx={{ cursor: 'grab' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {getMediaPreview(banner)}
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {banner.name}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="end" 
              aria-label="edit"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDialog(banner);
              }}
              disabled={loading}
              sx={{ 
                mr: 1,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.main',
                }
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              edge="end" 
              aria-label="delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteBanner(banner.id);
              }}
              disabled={loading}
              sx={{ 
                bgcolor: 'error.light',
                color: 'error.contrastText',
                '&:hover': {
                  bgcolor: 'error.main',
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };
  
  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBanners();
      setBanners(data.banners || []);
    } catch (error) {
      showSnackbar('Failed to fetch banners: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenDialog = (banner = null) => {
    if (banner) {
      // Editing existing banner
      setCurrentItem({
        id: banner.id,
        type: banner.media_type || 'image',
        file: null,
        url: banner.media_type === 'youtube' ? banner.file_path : '',
        linkUrl: banner.link_url || '',
        linkTarget: banner.link_target || '_self'
      });
      setIsEditing(true);
    } else {
      // Adding new banner
      setCurrentItem({
        id: null,
        type: 'image',
        file: null,
        url: '',
        linkUrl: '',
        linkTarget: '_self'
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setIsEditing(false);
    setCurrentItem({
      id: null,
      type: 'image',
      file: null,
      url: '',
      linkUrl: '',
      linkTarget: '_self'
    });
  };

  const handleItemTypeChange = (event, newValue) => {
    setCurrentItem({
      ...currentItem,
      type: newValue,
      file: null,
      url: ''
    });
  };

  const handleInputChange = (field, value) => {
    setCurrentItem({
      ...currentItem,
      [field]: value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCurrentItem({
        ...currentItem,
        file: file
      });
    }
  };

  const validateItem = () => {
    if (currentItem.type === 'youtube' && !currentItem.url) {
      showSnackbar('Please enter a YouTube URL', 'error');
      return false;
    }
    
    if ((currentItem.type === 'image' || currentItem.type === 'video') && !currentItem.file && !isEditing) {
      showSnackbar('Please select a file', 'error');
      return false;
    }
    
    // Additional validation for editing mode
    if (isEditing && (currentItem.type === 'image' || currentItem.type === 'video') && !currentItem.file) {
      // When editing, if no new file is selected, we need to ensure the banner has an existing file
      const currentBanner = banners.find(b => b.id === currentItem.id);
      if (!currentBanner || !currentBanner.file_path) {
        showSnackbar('Please select a file', 'error');
        return false;
      }
    }
    
    return true;
  };

  const handleAddItem = async () => {
    if (banners.length >= 5 && !isEditing) {
      showSnackbar('You can only add up to 5 items.', 'error');
      return;
    }

    if (!validateItem()) {
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        // Update existing banner
        let filePath = currentItem.url;
        let fileName = currentItem.url;
        
        if (currentItem.file) {
          const formData = new FormData();
          formData.append('file', currentItem.file);
          const uploadResponse = await axios.post('/upload/banners', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          filePath = uploadResponse.data.filePath;
          fileName = currentItem.file.name;
        } else {
          // If no new file is selected, keep the existing file path and name
          const currentBanner = banners.find(b => b.id === currentItem.id);
          if (currentBanner) {
            filePath = currentBanner.file_path;
            fileName = currentBanner.name;
          }
        }

        const metadata = {
          id: currentItem.id,
          fileName: fileName,
          filePath: filePath,
          mediaType: currentItem.type,
          linkUrl: currentItem.linkUrl || null,
          linkTarget: currentItem.linkTarget || '_self',
        };

        await bannerService.uploadBanners(metadata); // Assuming this endpoint can handle updates
        showSnackbar('Banner updated successfully!', 'success');
      } else {
        // Add new banner
        if (currentItem.type === 'youtube') {
          const metadata = {
            fileName: currentItem.url,
            filePath: currentItem.url,
            mediaType: 'youtube',
            linkUrl: currentItem.linkUrl || null,
            linkTarget: currentItem.linkTarget || '_self',
          };

          await bannerService.uploadBanners(metadata);
          showSnackbar('YouTube URL added successfully!', 'success');
        } else {
          const formData = new FormData();
          formData.append('file', currentItem.file);

          const uploadResponse = await axios.post('/upload/banners', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const filePath = uploadResponse.data.filePath;
          const metadata = {
            fileName: currentItem.file.name,
            filePath: filePath,
            mediaType: currentItem.type,
            linkUrl: currentItem.linkUrl || null,
            linkTarget: currentItem.linkTarget || '_self',
          };

          await bannerService.uploadBanners(metadata);
          showSnackbar('Banner uploaded successfully!', 'success');
        }
      }

      handleCloseDialog();
      fetchBanners();
    } catch (error) {
      showSnackbar('Failed to upload banner: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Reorder the banners array
    const oldIndex = banners.findIndex(banner => banner.id === active.id);
    const newIndex = banners.findIndex(banner => banner.id === over.id);
    
    const reordered = arrayMove(banners, oldIndex, newIndex);
    
    // Update order indices
    const updatedBanners = reordered.map((banner, index) => ({
      ...banner,
      order_index: index
    }));
    
    setBanners(updatedBanners);
    
    // Update order in backend
    try {
      const orderData = updatedBanners.map(banner => ({
        id: banner.id,
        order_index: banner.order_index
      }));
      
      await bannerService.updateBannerOrder(orderData);
      showSnackbar('Banner order updated successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to update banner order: ' + error.message, 'error');
      // Revert to original order on error
      fetchBanners();
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      setLoading(true);
      await bannerService.deleteBanner(id);
      showSnackbar('Banner deleted successfully!', 'success');
      fetchBanners();
    } catch (error) {
      showSnackbar('Failed to delete banner: ' + error.message, 'error');
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
        Banner Upload
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Banners
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                disabled={loading}
                sx={{ mb: 2 }}
                type="button"
              >
                Add New Item
              </Button>
              
              {banners.length > 0 ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Banner Order (Drag to reorder)
                  </Typography>
                  
                   <Paper elevation={2} sx={{ p: 2, maxWidth: '100%' }}>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={banners.map(banner => banner.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <List sx={{ width: '100%' }}>
                          {banners
                            .slice()
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((banner) => (
                              <SortableItem key={banner.id} banner={banner} />
                            ))}
                        </List>
                      </SortableContext>
                    </DndContext>
                  </Paper>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  No banners uploaded yet. Click "Add New Item" to upload banners.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={() => handleCloseDialog()} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {isEditing ? 'Edit Banner Item' : 'Add New Banner Item'}
        </DialogTitle>
        <DialogContent sx={{ minHeight: 400 }}>
          <AppBar position="static" sx={{ mb: 3, mt: 1, borderRadius: 1, boxShadow: 3 }}>
            <Tabs 
              value={currentItem.type} 
              onChange={(event, newValue) => handleItemTypeChange(event, newValue)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                }
              }}
            >
              <Tab 
                label="Image" 
                value="image" 
                sx={{ 
                  backgroundColor: currentItem.type === 'image' ? 'primary.main' : 'grey.200',
                  color: currentItem.type === 'image' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: currentItem.type === 'image' ? 'primary.dark' : 'grey.300',
                  }
                }} 
              />
              <Tab 
                label="Video" 
                value="video" 
                sx={{ 
                  backgroundColor: currentItem.type === 'video' ? 'primary.main' : 'grey.200',
                  color: currentItem.type === 'video' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: currentItem.type === 'video' ? 'primary.dark' : 'grey.300',
                  }
                }} 
              />
              <Tab 
                label="YouTube" 
                value="youtube" 
                sx={{ 
                  backgroundColor: currentItem.type === 'youtube' ? 'primary.main' : 'grey.200',
                  color: currentItem.type === 'youtube' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: currentItem.type === 'youtube' ? 'primary.dark' : 'grey.300',
                  }
                }} 
              />
            </Tabs>
          </AppBar>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {currentItem.type === 'youtube' ? (
                <TextField
                  fullWidth
                  label="YouTube URL"
                  value={currentItem.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  margin="normal"
                  placeholder="https://www.youtube.com/watch?v=..."
                  variant="outlined"
                />
              ) : (
                <Box sx={{ mt: 1 }}>
                  <input
                    accept={currentItem.type === 'image' ? "image/*" : "video/*"}
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button 
                      variant="outlined" 
                      component="span" 
                      fullWidth
                      sx={{ 
                        py: 2, 
                        borderColor: 'primary.main', 
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          borderColor: 'primary.dark',
                        }
                      }}
                    >
                      {currentItem.file ? currentItem.file.name : `Select ${currentItem.type} file`}
                    </Button>
                  </label>
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Preview:
                    </Typography>
                    {currentItem.file ? (
                      currentItem.type === 'image' ? (
                        <img 
                          src={URL.createObjectURL(currentItem.file)} 
                          alt="Preview" 
                          style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 8, border: '1px solid #ddd' }}
                        />
                      ) : (
                        <video 
                          src={URL.createObjectURL(currentItem.file)} 
                          controls 
                          style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 8, border: '1px solid #ddd' }}
                        />
                      )
                    ) : (
                      <Box sx={{ 
                        width: '100%', 
                        height: 250, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        bgcolor: 'grey.200',
                        borderRadius: 8,
                        border: '1px solid #ddd'
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          {isEditing ? 'No file selected' : 'No file selected - Preview will appear here'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Link URL (optional)"
                value={currentItem.linkUrl}
                onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                margin="normal"
                placeholder="https://example.com"
                variant="outlined"
              />
              
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel>Link Target</InputLabel>
                <Select
                  value={currentItem.linkTarget}
                  onChange={(e) => handleInputChange('linkTarget', e.target.value)}
                  label="Link Target"
                >
                  <MenuItem value="_self">Same Window</MenuItem>
                  <MenuItem value="_blank">New Window</MenuItem>
                </Select>
              </FormControl>
              
              {isEditing && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Current Banner Preview:
                  </Typography>
                  {(() => {
                    // Find the current banner being edited
                    const currentBanner = banners.find(b => b.id === currentItem.id);
                    if (!currentBanner) return null;
                    
                    const getMediaPreview = (banner) => {
                      if (banner.media_type === 'youtube') {
                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                        const match = banner.file_path.match(regExp);
                        const videoId = (match && match[2].length === 11) ? match[2] : null;
                        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                        return (
                          <img 
                            src={thumbnailUrl} 
                            alt="YouTube Thumbnail"
                            style={{ 
                              width: 60, 
                              height: 40, 
                              objectFit: 'cover', 
                              marginRight: 16,
                              borderRadius: 4 
                            }}
                          />
                        );
                      } else if (banner.media_type === 'video') {
                        // For video files, show a video icon or a placeholder
                        return (
                          <Box sx={{ 
                            width: 60, 
                            height: 40, 
                            backgroundColor: '#333', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderRadius: 1,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}>
                            VIDEO
                          </Box>
                        );
                      } else {
                        return (
                          <img 
                            src={banner.file_path} 
                            alt={banner.name}
                            style={{ 
                              width: 60, 
                              height: 40, 
                              objectFit: 'cover', 
                              marginRight: 16,
                              borderRadius: 4 
                            }}
                          />
                        );
                      }
                    };
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getMediaPreview(currentBanner)}
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          {currentBanner.name}
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseDialog} sx={{ mr: 1 }} type="button">
            Cancel
          </Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            disabled={loading}
            sx={{ 
              bgcolor: 'primary.main', 
              '&:hover': { bgcolor: 'primary.dark' },
              px: 3
            }}
            type="button"
          >
            {isEditing ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default BannerUpload;
