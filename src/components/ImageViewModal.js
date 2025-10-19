import React from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';

const ImageViewModal = ({ open, onClose, image, alt }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxHeight: '90vh',
          maxWidth: '90vw'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={image}
          alt={alt}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '12px'
          }}
          onError={(e) => {
            if (!e.target.src.includes('data:image/svg+xml')) {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiB0ZXh0LWJhc2U9Im1pZGRsZSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzk5OTk5OSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
            }
            e.target.onerror = null;
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewModal;
