import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { bannerService } from '../services/bannerService';

const UpdatedBannerUpload = () => {
  const [banners, setBanners] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'image',
    file: null,
    youtubeUrl: '',
    linkUrl: '',
    linkTarget: '_self',
  });

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBanners();
      setBanners(data.banners || []);
    } catch (error) {
      showSnackbar('Failed to fetch banners: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleNewItemChange = (field, value) => {
    setNewItem({
      ...newItem,
      [field]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleNewItemChange('file', file);
  };

  const handleAddItem = async () => {
    if (banners.length >= 5) {
      showSnackbar('You can only add up to 5 items.', 'error');
      return;
    }

    if (newItem.type === 'youtube' && !newItem.youtubeUrl) {
      showSnackbar('Please enter a YouTube URL.', 'error');
      return;
    }

    if ((newItem.type === 'image' || newItem.type === 'video') && !newItem.file) {
      showSnackbar('Please select a file.', 'error');
      return;
    }

    try {
      setLoading(true);

      let metadata = {
        linkUrl: newItem.linkUrl || null,
        linkTarget: newItem.linkTarget || '_self',
      };

      if (newItem.type === 'youtube') {
        metadata = {
          ...metadata,
          fileName: newItem.youtubeUrl,
          filePath: newItem.youtubeUrl,
          mediaType: 'youtube',
        };
      } else {
        const formData = new FormData();
        formData.append('file', newItem.file);

        const uploadResponse = await axios.post('/upload/banners', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const filePath = uploadResponse.data.filePath;
        metadata = {
          ...metadata,
          fileName: newItem.file.name,
          filePath: filePath,
          mediaType: newItem.type,
        };
      }

      await bannerService.uploadBanners(metadata);
      showSnackbar('Item added successfully!', 'success');

      // Reset form
      setNewItem({
        type: 'image',
        file: null,
        youtubeUrl: '',
        linkUrl: '',
        linkTarget: '_self',
      });
    } catch (error) {
      showSnackbar('Failed to add item: ' + error.message, 'error');
    } finally {
      setLoading(false);
      fetchBanners();
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(banners);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setBanners(reordered);
    // TODO: Update order in backend if needed
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add New Banner Item
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Add Item</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="item-type-label">Item Type</InputLabel>
                        <Select
                          labelId="item-type-label"
                          value={newItem.type}
                          onChange={(e) => handleNewItemChange('type', e.target.value)}
                        >
                          <MenuItem value="image">Image</MenuItem>
                          <MenuItem value="video">Video</MenuItem>
                          <MenuItem value="youtube">YouTube URL</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {newItem.type === 'youtube' ? (
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="YouTube URL"
                          value={newItem.youtubeUrl}
                          onChange={(e) => handleNewItemChange('youtubeUrl', e.target.value)}
                        />
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          component="label"
                          fullWidth
                        >
                          Select File
                          <input
                            type="file"
                            hidden
                            accept={newItem.type === 'image' ? 'image/*' : 'video/mp4'}
                            onChange={handleFileChange}
                          />
                        </Button>
                        {newItem.file && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Selected: {newItem.file.name}
                          </Typography>
                        )}
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Link URL (optional)"
                        value={newItem.linkUrl}
                        onChange={(e) => handleNewItemChange('linkUrl', e.target.value)}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="link-target-label">Link Target</InputLabel>
                        <Select
                          labelId="link-target-label"
                          value={newItem.linkTarget}
                          onChange={(e) => handleNewItemChange('linkTarget', e.target.value)}
                        >
                          <MenuItem value="_self">Same Window</MenuItem>
                          <MenuItem value="_blank">New Window</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        onClick={handleAddItem}
                        disabled={loading}
                        fullWidth
                      >
                        Add Item
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              {banners.length > 0 ? (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Banner Order (Drag to reorder)
                  </Typography>
                  
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="banners" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                        {(provided) => (
                          <List
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {banners
                              .slice()
                              .sort((a, b) => a.order_index - b.order_index)
                              .map((banner, index) => {
                                const MemoizedDraggable = React.memo(({ banner, index }) => (
                                  <Draggable key={banner.id} draggableId={String(banner.id)} index={index}>
                                    {(provided) => (
                                      <ListItem
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        sx={{
                                          mb: 1,
                                          bgcolor: 'grey.50',
                                          borderRadius: 1,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                        }}
                                      >
                                        <DragIcon sx={{ mr: 2, cursor: 'grab' }} />
                                        <a href={banner.linkUrl || '#'} target={banner.linkTarget || '_self'} rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
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
                                          <ListItemText
                                            primary={banner.name}
                                            secondary={`Path: ${banner.file_path}`}
                                          />
                                        </a>
                                        <ListItemSecondaryAction>
                                          <IconButton 
                                            edge="end" 
                                            aria-label="delete"
