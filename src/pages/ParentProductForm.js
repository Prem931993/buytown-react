import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Breadcrumbs,
  Link,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import axios from 'axios';

function ParentProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku_code: '',
    category_id: '',
    brand_id: '',
    status: 1,
    product_type: 'parent',
  });
  
  // State for parent-child relationships
  const [allProducts, setAllProducts] = useState([]);
  const [selectedChildProducts, setSelectedChildProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        try {
          const categoriesResponse = await axios.get('/categories');
          setCategories(categoriesResponse.data.categories || []);
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Fallback to mock data if API fails
          setCategories([
            { id: 1, name: 'Electronics' },
            { id: 2, name: 'Audio' },
            { id: 3, name: 'Wearables' },
            { id: 4, name: 'Accessories' }
          ]);
        }

        // Fetch brands
        try {
          const brandsResponse = await axios.get('/brands');
          setBrands(brandsResponse.data.brands || []);
        } catch (error) {
          console.error('Error fetching brands:', error);
          // Fallback to mock data if API fails
          setBrands([
            { id: 1, name: 'Samsung' },
            { id: 2, name: 'Apple' },
            { id: 3, name: 'Sony' },
            { id: 4, name: 'Dell' }
          ]);
        }

        // If in edit mode, fetch product details
        if (isEditMode) {
          try {
            const productResponse = await axios.get(`/products/${id}`);
            const productData = productResponse.data.product;
            
            // Format the data for the form
            setFormData({
              name: productData.name || '',
              sku_code: productData.sku_code || '',
              category_id: productData.category_id || '',
              brand_id: productData.brand_id || '',
              status: productData.status || 1,
              product_type: productData.product_type || 'parent',
            });
            
            // Set existing images
            if (productData.images) {
              setProductImages(productData.images);
            }
            
            // Set child products if this is a parent product
            if (productData.product_type === 'parent' && productData.childProducts) {
              // Ensure consistent data types (all numbers)
              setSelectedChildProducts(productData.childProducts.map(child => parseInt(child.id, 10)));
            }
          } catch (error) {
            console.error('Error fetching product details:', error);
            setSnackbar({
              open: true,
              message: 'Failed to load product details',
              severity: 'error',
            });
          }
        }
        
        // Fetch all products for parent-child relationship management
        try {
          const productsResponse = await axios.get('/products');
          setAllProducts(productsResponse.data.products || []);
        } catch (error) {
          console.error('Error fetching all products:', error);
        }
      } catch (error) {
        console.error('Error in initial data fetch:', error);
      } finally {
        setLoading(false);
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
      if (!formData.name || !formData.category_id) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields (Product Name, Category)',
          severity: 'error',
        });
        return;
      }

      setLoading(true);
      console.log('Form Data:', formData);
      // Prepare data for API
      const productData = {
        ...formData,
        // Include images to remove if any
        images_to_remove: imagesToRemove.length > 0 ? imagesToRemove : undefined,
        // Include child product IDs
        child_product_ids: JSON.stringify(selectedChildProducts),
      };

      // Remove empty string values for optional fields
      Object.keys(productData).forEach(key => {
        if (productData[key] === '') {
          delete productData[key];
        }
      });

      // Create FormData object for file uploads
      const formDataObj = new FormData();
      
      // Append all form data fields individually
      Object.keys(productData).forEach(key => {
        formDataObj.append(key, productData[key]);
      });

      // Only append images if there are new images selected
      // This prevents existing images from being deleted when no new images are selected
      if (newImages.length > 0) {
        newImages.forEach((image, index) => {
          formDataObj.append('images', image);
        });
      }

      if (isEditMode) {
        // Update existing product
        await axios.put(`/products/${id}`, formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // Clear the images to remove state after successful update
        setImagesToRemove([]);
        setSnackbar({
          open: true,
          message: 'Parent product updated successfully',
          severity: 'success',
        });
      } else {
        // Create new product
        await axios.post('/products', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSnackbar({
          open: true,
          message: 'Parent product added successfully',
          severity: 'success',
        });
        
        // Redirect to the product list after a short delay
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving parent product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save parent product',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this parent product?')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`/products/${id}`);
      
      setSnackbar({
        open: true,
        message: 'Parent product deleted successfully',
        severity: 'success',
      });
      
      // Redirect to the product list after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (error) {
      console.error('Error deleting parent product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete parent product',
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

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  // Remove an image from the new images array
  const removeImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  // Mark an existing image for removal
  const removeExistingImage = (imageId) => {
    try {
      // Add the image to the list of images to remove
      setImagesToRemove(prev => [...prev, imageId]);
      
      // Remove the image from the local state (for UI update)
      setProductImages(prev => prev.filter(img => img.id !== imageId));
      
      setSnackbar({
        open: true,
        message: 'Image marked for removal. Save changes to apply.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error marking image for removal:', error);
      setSnackbar({
        open: true,
        message: 'Failed to mark image for removal',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              {isEditMode ? 'Edit Parent Product' : 'Add New Parent Product'}
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Dashboard
              </Link>
              <Link color="inherit" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
                Products
              </Link>
              <Typography color="text.primary">{isEditMode ? 'Edit Parent Product' : 'Add Parent Product'}</Typography>
            </Breadcrumbs>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/products')}
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
              {loading ? 'Saving...' : 'Save Product'}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Basic Information Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <TextField
                      fullWidth
                      label="SKU Code"
                      name="sku_code"
                      value={formData.sku_code}
                      onChange={handleInputChange}
                    />
                  </Box>
                </Box>
                
                {/* Category and Brand Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Category & Brand
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category *</InputLabel>
                      <Select
                        label="Category *"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth size="small">
                      <InputLabel>Brand</InputLabel>
                      <Select
                        label="Brand"
                        name="brand_id"
                        value={formData.brand_id}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Select Brand</MenuItem>
                        {brands.map((brand) => (
                          <MenuItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Status Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Status
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <MenuItem value={1}>Active</MenuItem>
                        <MenuItem value={2}>Out of Stock</MenuItem>
                        <MenuItem value={3}>Discontinued</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Child Products Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Child Products
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Search Available Products"
                      placeholder="Search by name or SKU..."
                      onChange={(e) => {
                        // In a real implementation, you would filter the available products based on this search
                        // For now, we'll just leave it as a placeholder
                      }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Available Products</Typography>
                        <Paper sx={{ height: 300, overflow: 'auto' }}>
                          {allProducts
                            .filter(product => product.product_type !== 'parent' && product.id !== parseInt(id || 0, 10))
                            .filter(product => !selectedChildProducts.includes(parseInt(product.id, 10)))
                            .map((product) => (
                              <Box
                                key={product.id}
                                sx={{
                                  p: 1,
                                  borderBottom: '1px solid #eee',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: '#f5f5f5'
                                  }
                                }}
                                onClick={() => {
                                  setSelectedChildProducts(prev => [...prev, parseInt(product.id, 10)]);
                                }}
                              >
                                <Typography variant="body2">{product.name}</Typography>
                                <Typography variant="caption" color="textSecondary">SKU: {product.sku_code}</Typography>
                              </Box>
                            ))
                          }
                        </Paper>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Selected Child Products</Typography>
                        <Paper sx={{ height: 300, overflow: 'auto' }}>
                          {allProducts
                            .filter(product => selectedChildProducts.includes(parseInt(product.id, 10)))
                            .map((product) => (
                              <Box
                                key={product.id}
                                sx={{
                                  p: 1,
                                  borderBottom: '1px solid #eee',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}
                                onClick={() => {
                                  const productId = parseInt(product.id, 10);
                                  setSelectedChildProducts(prev => prev.filter(id => id !== productId));
                                }}
                              >
                                <Box>
                                  <Typography variant="body2">{product.name}</Typography>
                                  <Typography variant="caption" color="textSecondary">SKU: {product.sku_code}</Typography>
                                </Box>
                                <RemoveIcon />
                              </Box>
                            ))
                          }
                        </Paper>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                {/* Product Images Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Product Images
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                    >
                      Select Images
                    </Button>
                  </label>
                  
                  {/* Preview of new images */}
                  {newImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Selected Images ({newImages.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {newImages.map((image, index) => (
                          <Card key={index}>
                            <Box sx={{ position: 'relative' }}>
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index}`}
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeImage(index)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <CardContent>
                              <Typography variant="body2" noWrap>
                                {image.name}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Preview of existing images */}
                  {productImages.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Existing Images ({productImages.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {productImages.map((image, index) => (
                          <Card key={image.id || index}>
                            <Box sx={{ position: 'relative' }}>
                              <img
                                src={image.image_path || `/products/${image.path?.split('/').pop()}`}
                                alt={`Product ${index}`}
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              />
                              <IconButton
                                size="small"
                                onClick={() => removeExistingImage(image.id)}
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <CardContent>
                              <Typography variant="body2" noWrap>
                                {image.path?.split('/').pop() || 'Image'}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
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

export default ParentProductForm;