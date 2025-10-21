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
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { adminApiClient } from '../services/adminService.js';

function Brands() {
  useNavigate();
  const [brands, setBrands] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
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
  const [deleteItem, setDeleteItem] = useState({ id: null, name: '' });
  
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
        setSearchLoading(true);
        const response = await adminApiClient.get('/brands', {
          params: {
            page: pagination.currentPage,
            limit: 10,
            search: searchTerm
          }
        });
        setBrands(response.data.brands);
        
        // Update pagination state
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load brands',
          severity: 'error',
        });
      } finally {
        setSearchLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  const handleOpenForm = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        image: item.image || null,
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: '',
        description: '',
        image: null,
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

  const handleSaveBrand = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      
      if (formData.image && typeof formData.image !== 'string') {
        formDataToSend.append('image', formData.image);
      }
      
      if (currentItem) {
        // Update existing brand
        await adminApiClient.put(`/brands/${currentItem.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new brand
        await adminApiClient.post('/brands', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setSnackbar({
        open: true,
        message: currentItem ? 'Brand updated successfully' : 'Brand added successfully',
        severity: 'success',
      });
      
      handleCloseForm();
      
      // Refresh the brands list
      const response2 = await adminApiClient.get('/brands', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setBrands(response2.data.brands);
      
      // Update pagination state
      if (response2.data.pagination) {
        setPagination(response2.data.pagination);
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save brand',
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
      await adminApiClient.delete(`/brands/${deleteItem.id}`);
      
      setSnackbar({
        open: true,
        message: 'Brand deleted successfully',
        severity: 'success',
      });
      
      // Close the dialog
      handleDeleteCancel();
      
      // Refresh the brands list
      const response = await adminApiClient.get('/brands', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setBrands(response.data.brands);
      
      // Update pagination state
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete brand',
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
      
      const response = await adminApiClient.post('/brands/import', formData, {
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
      
      // Refresh the brands list
      const response2 = await adminApiClient.get('/brands', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      setBrands(response2.data.brands);
      
      // Update pagination state
      if (response2.data.pagination) {
        setPagination(response2.data.pagination);
      }
    } catch (error) {
      console.error('Error importing brands:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to import brands',
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
          Brands Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setImportDialogOpen(true)}
            sx={{
              borderColor: '#E7BE4C',
              color: '#E7BE4C',
              '&:hover': {
                borderColor: '#C69C4B',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Import Brands
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            sx={{
              background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
              },
            }}
          >
            Add Brand
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search brands..."
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
          Import Brands
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
              Upload an Excel file with your brands
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Format: Brand Name, Description, Image (optional)
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
              background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Image</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.length > 0 ? brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {brand.name}
                  </Typography>
                </TableCell>
                <TableCell>{brand.description}</TableCell>
                <TableCell>
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                    />
                  ) : (
                    'No image'
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenForm(brand)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteConfirmation(brand.id, brand.name)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Brands Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Get started by adding your first brand
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenForm()}
                      sx={{
                        background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
                        },
                      }}
                    >
                      Add First Brand
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
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

      {/* Brand Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentItem ? `Edit Brand: ${currentItem.name}` : 'Add New Brand'}
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
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                style={{ display: 'none' }}
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                >
                  Upload Image
                </Button>
              </label>
              {formData.image && (
                <Box sx={{ mt: 2 }}>
                  {typeof formData.image === 'string' ? (
                    // Existing image from database
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <img
                        src={formData.image}
                        alt="Brand"
                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                      />
                      <Typography variant="body2">
                        Current image: {formData.image.split('/').pop()}
                      </Typography>
                    </Box>
                  ) : (
                    // New image selected
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {formData.image.name}
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            onClick={handleSaveBrand}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
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
            Are you sure you want to delete the brand "{deleteItem.name}"? This action cannot be undone.
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

export default Brands;