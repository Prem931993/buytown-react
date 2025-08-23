import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Variations() {
  const navigate = useNavigate();
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    value: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ id: null, label: '' });
  
  // Pagination and search state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSearchLoading(true);
        const response = await axios.get('/variations', {
          params: {
            page: pagination.currentPage,
            limit: 10,
            search: searchTerm
          }
        });
        setVariations(response.data.variations);
        
        // Update pagination state
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching variations:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load variations',
          severity: 'error',
        });
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  const handleOpenForm = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        label: item.label,
        value: item.value,
      });
    } else {
      setCurrentItem(null);
      setFormData({
        label: '',
        value: '',
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveVariation = async () => {
    try {
      const variationData = {
        label: formData.label,
        value: formData.value,
      };
      
      let response;
      if (currentItem) {
        // Update existing variation
        response = await axios.put(`/variations/${currentItem.id}`, variationData);
      } else {
        // Create new variation
        response = await axios.post('/variations', variationData);
      }
      
      setSnackbar({
        open: true,
        message: currentItem ? 'Variation updated successfully' : 'Variation added successfully',
        severity: 'success',
      });
      
      handleCloseForm();
      
      // Refresh the variations list
      const response2 = await axios.get('/variations', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setVariations(response2.data.variations);
      
      // Update pagination state
      if (response2.data.pagination) {
        setPagination(response2.data.pagination);
      }
    } catch (error) {
      console.error('Error saving variation:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save variation',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleDeleteConfirmation = (id, label) => {
    setDeleteItem({ id, label });
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteItem({ id: null, label: '' });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/variations/${deleteItem.id}`);
      
      setSnackbar({
        open: true,
        message: 'Variation deleted successfully',
        severity: 'success',
      });
      
      // Close the dialog
      handleDeleteCancel();
      
      // Refresh the variations list
      const response = await axios.get('/variations', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setVariations(response.data.variations);
      
      // Update pagination state
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error deleting variation:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete variation',
        severity: 'error',
      });
      
      // Close the dialog
      handleDeleteCancel();
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setImportLoading(true);
      
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await axios.post('/variations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success',
      });
      
      setImportDialogOpen(false);
      setImportFile(null);
      
      // Refresh the variations list
      const response2 = await axios.get('/variations', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setVariations(response2.data.variations);
      
      // Update pagination state
      if (response2.data.pagination) {
        setPagination(response2.data.pagination);
      }
    } catch (error) {
      console.error('Error importing variations:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to import variations',
        severity: 'error',
      });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Variations Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setImportDialogOpen(true)}
            sx={{
              borderColor: '#6366f1',
              color: '#6366f1',
              '&:hover': {
                borderColor: '#5254cc',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Import Variations
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
              },
            }}
          >
            Add Variation
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search variations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => setPagination({...pagination, currentPage: 1})}
                disabled={searchLoading}
                sx={{ height: '40px' }}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Import Variations
          <IconButton
            aria-label="close"
            onClick={() => setImportDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="body1" gutterBottom>
              Upload an Excel file with your variations
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Format: Label, Value
            </Typography>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files[0])}
              style={{ display: 'none' }}
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button
                variant="outlined"
                component="span"
                sx={{ mt: 2 }}
              >
                {importFile ? importFile.name : 'Choose File'}
              </Button>
            </label>
            {importFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {importFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!importFile || importLoading}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
              },
            }}
          >
            {importLoading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
              <TableCell>ID</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Value</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variations.map((variation) => (
              <TableRow key={variation.id}>
                <TableCell>{variation.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {variation.label}
                  </Typography>
                </TableCell>
                <TableCell>{variation.value}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenForm(variation)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteConfirmation(variation.id, variation.label)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
            disabled={!pagination.hasPrev}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
            <Typography>
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
            disabled={!pagination.hasNext}
            sx={{ ml: 1 }}
          >
            Next
          </Button>
        </Box>
      )}

      {/* Variation Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentItem ? `Edit Variation: ${currentItem.label}` : 'Add New Variation'}
          <IconButton
            aria-label="close"
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            onClick={handleSaveVariation}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
              },
            }}
          >
            {currentItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the variation "{deleteItem.label}"? This action cannot be undone.
          </Typography>
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
    </Box>
  );
}

export default Variations;