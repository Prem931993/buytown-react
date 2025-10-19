import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Chip,
  LinearProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PhotoCamera as PhotoCameraIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { adminService } from '../services/adminService';

const ImageUploadModal = ({ open, onClose, product, onImageUpdate }) => {
  const [images, setImages] = useState(product?.images || []);
  const [originalImages, setOriginalImages] = useState(product?.images || []);
  const [pendingUploads, setPendingUploads] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const fileInputRef = useRef(null);

  // Update images when product changes
  useEffect(() => {
    if (product?.images) {
      setImages(product.images);
      setOriginalImages(product.images);
      setPendingUploads([]);
      setPendingDeletions([]);
    }
  }, [product?.images]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select image files only',
        severity: 'error'
      });
      return;
    }

    // Add to pending uploads for batch submission
    setPendingUploads(prev => [...prev, ...imageFiles]);

    setSnackbar({
      open: true,
      message: `${imageFiles.length} image(s) added for upload. Click Submit to upload all changes.`,
      severity: 'info'
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleSetPrimary = (imageId) => {
    const updatedImages = images.map(img => ({
      ...img,
      is_primary: img.id === imageId
    }));
    setImages(updatedImages);
    setSnackbar({
      open: true,
      message: 'Primary image set. Click Submit to save changes.',
      severity: 'info'
    });
  };

  const handleDeleteImage = (imageId) => {
    setPendingDeletions(prev => [...prev, imageId]);
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    setSnackbar({
      open: true,
      message: 'Image marked for deletion. Click Submit to save changes.',
      severity: 'info'
    });
  };

  const handleMoveImage = (imageId, direction) => {
    const currentIndex = images.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    // Swap sort orders
    const currentImage = images[currentIndex];
    const targetImage = images[newIndex];

    const updatedImages = [...images];
    updatedImages[currentIndex] = { ...targetImage, sort_order: currentImage.sort_order };
    updatedImages[newIndex] = { ...currentImage, sort_order: targetImage.sort_order };

    // Sort by sort_order
    updatedImages.sort((a, b) => a.sort_order - b.sort_order);

    setImages(updatedImages);
    setSnackbar({
      open: true,
      message: 'Image order changed. Click Submit to save changes.',
      severity: 'info'
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Prepare data for image update API
      const imageData = {};

      // Handle new image uploads
      if (pendingUploads.length > 0) {
        imageData.images = pendingUploads;
      }

      // Handle image deletions
      if (pendingDeletions.length > 0) {
        imageData.images_to_remove = pendingDeletions;
      }

      // Handle image reordering and primary setting
      if (JSON.stringify(images) !== JSON.stringify(originalImages)) {
        const currentImages = images.filter(img => !pendingDeletions.includes(img.id));
        const imageUpdates = currentImages.map((img, index) => ({
          id: img.id,
          sort_order: index + 1,
          is_primary: img.is_primary
        }));
        imageData.image_updates = imageUpdates;
      }

      // Only call the API if there are changes
      if (Object.keys(imageData).length > 0) {
        setUploading(true);
        setUploadProgress(0);

        // Use the dedicated image update API
        const response = await adminService.products.updateImages(product.id, imageData);

        // Update local state with new images
        if (response.product && response.product.images) {
          setImages(response.product.images);
        }

        setUploading(false);
        setUploadProgress(0);
      }

      // Update parent component
      const finalImages = images.filter(img => !pendingDeletions.includes(img.id));
      onImageUpdate(product.id, finalImages);

      setSnackbar({
        open: true,
        message: 'All changes saved successfully',
        severity: 'success'
      });

      // Reset pending states
      setPendingUploads([]);
      setPendingDeletions([]);

      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error saving changes:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save changes',
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const hasChanges = pendingUploads.length > 0 || pendingDeletions.length > 0 ||
    JSON.stringify(images) !== JSON.stringify(originalImages);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          <Typography component="span" variant="body1" sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
            Manage Images - {product?.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Upload Area */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: dragOver ? '#E7BE4C' : '#d1d5db',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragOver ? 'rgba(99, 102, 241, 0.05)' : 'rgba(243, 244, 246, 0.5)',
              transition: 'all 0.2s ease-in-out',
              mb: 3,
              '&:hover': {
                borderColor: '#E7BE4C',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: dragOver ? '#E7BE4C' : '#9ca3af', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: dragOver ? '#E7BE4C' : '#374151' }}>
              {dragOver ? 'Drop images here' : 'Drag & drop images here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Supports: JPG, PNG, GIF up to 10MB each
            </Typography>
            {pendingUploads.length > 0 && (
              <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>
                {pendingUploads.length} image(s) ready to upload
              </Typography>
            )}
          </Box>

          {/* Upload Progress */}
          {uploading && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Uploading images...
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Current Images ({images.length})
                {pendingDeletions.length > 0 && (
                  <Typography component="span" variant="body2" sx={{ ml: 1, color: 'error.main' }}>
                    ({pendingDeletions.length} marked for deletion)
                  </Typography>
                )}
              </Typography>
              <Grid container spacing={2}>
                {images.map((image) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={image.id}>
                    <Card sx={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      },
                      opacity: pendingDeletions.includes(image.id) ? 0.5 : 1,
                      filter: pendingDeletions.includes(image.id) ? 'grayscale(100%)' : 'none'
                    }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={image.path}
                          alt={`Product image ${image.id}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        {image.is_primary && (
                          <Chip
                            label="Primary"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: 'rgba(99, 102, 241, 0.9)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                        {pendingDeletions.includes(image.id) && (
                          <Chip
                            label="To Delete"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(244, 67, 54, 0.9)',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>
                      <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveImage(image.id, 'up')}
                            disabled={images.indexOf(image) === 0 || pendingDeletions.includes(image.id)}
                            sx={{ mr: 0.5 }}
                          >
                            <ArrowUpIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveImage(image.id, 'down')}
                            disabled={images.indexOf(image) === images.length - 1 || pendingDeletions.includes(image.id)}
                            sx={{ mr: 1 }}
                          >
                            <ArrowDownIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(image.id)}
                            color={image.is_primary ? 'primary' : 'default'}
                            disabled={pendingDeletions.includes(image.id)}
                            sx={{ mr: 1 }}
                          >
                            {image.is_primary ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage(image.id)}
                            color="error"
                            disabled={pendingDeletions.includes(image.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Sort: {image.sort_order}
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {images.length === 0 && !uploading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PhotoCameraIcon sx={{ fontSize: 64, color: '#d1d5db', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No images uploaded yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload some images to get started
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !hasChanges}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              ml: 1
            }}
          >
            {submitting ? 'Saving...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
    </>
  );
};

export default ImageUploadModal;
