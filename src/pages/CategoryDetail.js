import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';

function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    image: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await axios.get(`/categories/${id}`);
          const categoryData = response.data.category;
          
          setFormData({
            name: categoryData.name || '',
            description: categoryData.description || '',
            status: categoryData.is_active ? 'active' : 'inactive',
            image: categoryData.image || null,
          });
        } catch (error) {
          console.error('Error fetching category details:', error);
          setSnackbar({
            open: true,
            message: 'Failed to load category details',
            severity: 'error',
          });
          
          // Mock data for demonstration if API fails
          if (process.env.NODE_ENV === 'development') {
            setFormData({
              name: 'Sample Category',
              description: 'This is a sample category description',
              status: 'active',
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error',
        });
        return;
      }

      setLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('status', formData.status);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (isEditMode && formData.image && typeof formData.image === 'string') {
        // If editing and there's an existing image but no new image selected,
        // we don't need to send the image field
      }
      
      let response;
      if (isEditMode) {
        // Update existing category
        response = await axios.put(`/categories/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success',
        });
      } else {
        // Create new category
        response = await axios.post('/categories', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSnackbar({
          open: true,
          message: 'Category added successfully',
          severity: 'success',
        });
        
        // Redirect to the category list after a short delay
        setTimeout(() => {
          navigate('/categories');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save category',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/categories/${id}`);
      
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success',
      });
      
      // Redirect to the category list after a short delay
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete category',
        severity: 'error',
      });
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {isEditMode ? 'Edit Category' : 'Add New Category'}
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Dashboard
              </Link>
              <Link color="inherit" href="/categories" onClick={(e) => { e.preventDefault(); navigate('/categories'); }}>
                Categories
              </Link>
              <Typography color="text.primary">{isEditMode ? 'Edit Category' : 'Add Category'}</Typography>
            </Breadcrumbs>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/categories')}
              sx={{ mr: 2 }}
            >
              Back to List
            </Button>
            {isEditMode && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{ mr: 2 }}
              >
                Delete
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
                },
              }}
            >
              {loading ? 'Saving...' : 'Save Category'}
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category Name"
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
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
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
                  {imageFile ? (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {imageFile.name}
                    </Typography>
                  ) : isEditMode && formData.image ? (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={formData.image}
                        alt="Category"
                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Current image: {formData.image.split('/').pop()}
                      </Typography>
                    </Box>
                  ) : null}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default CategoryDetail;