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
  IconButton,
  FormControlLabel,
  Checkbox,
  Grid,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Remove as RemoveIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import adminService from '../services/adminService';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [variations, setVariations] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]); // Track images marked for removal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku_code: '',
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    color: '',
    size_dimension: '',
    unit: '',
    weight_kg: '',
    length_mm: '',
    width_mm: '',
    height_mm: '',
    selling_price: '',
    price: '', // This is the original price field
    discount: '',
    gst: '',
    stock: '',
    min_order_qty: '1',
    delivery_flag: true,
    status: 1, // Default to active status
    product_type: 'simple', // Default to simple product
    parent_product_id: '', // For child products
  });
  
  // State for parent-child relationships
  const [allProducts, setAllProducts] = useState([]); // All products for selection
  const [selectedChildProducts, setSelectedChildProducts] = useState([]); // Selected child products for parent
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
          const categoriesResponse = await adminService.categories.getAll();
          // Ensure we always have an array
          const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse :
                                (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) ? categoriesResponse.data :
                                [];
          setCategories(categoriesData);
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
          const brandsResponse = await adminService.brands.getAll();
          // Ensure we always have an array
          const brandsData = Array.isArray(brandsResponse) ? brandsResponse :
                            (brandsResponse?.data && Array.isArray(brandsResponse.data)) ? brandsResponse.data :
                            [];
          setBrands(brandsData);
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

        // Fetch variations
        try {
          const variationsResponse = await adminService.variations.getAll();
          // Ensure we always have an array
          const variationsData = Array.isArray(variationsResponse) ? variationsResponse :
                                (variationsResponse?.data && Array.isArray(variationsResponse.data)) ? variationsResponse.data :
                                [];
          setVariations(variationsData);
        } catch (error) {
          console.error('Error fetching variations:', error);
          // Fallback to mock data if API fails
          setVariations([
            { id: 1, label: 'Color', value: 'Red' },
            { id: 2, label: 'Color', value: 'Blue' },
            { id: 3, label: 'Size', value: 'Small' },
            { id: 4, label: 'Size', value: 'Large' }
          ]);
        }

        // If in edit mode, fetch product details
        if (isEditMode) {
          try {
            const productResponse = await adminService.products.getById(id);
            console.log('Product response:', productResponse); // Debug log

            // Handle different possible response structures
            let productData = productResponse;
            if (productResponse?.data) {
              productData = productResponse.data;
            } else if (productResponse?.product) {
              productData = productResponse.product;
            }

            console.log('Product data:', productData); // Debug log

            if (!productData || typeof productData !== 'object') {
              throw new Error('Invalid product data received');
            }

            // Format the data for the form
            setFormData({
              name: productData.name || '',
              description: productData.description || '',
              sku_code: productData.sku_code || '',
              category_id: productData.category_id || '',
              subcategory_id: productData.subcategory_id || '',
              brand_id: productData.brand_id || '',
              color: productData.color || '',
              size_dimension: productData.size_dimension || '',
              unit: productData.unit || '',
              weight_kg: productData.weight_kg ? productData.weight_kg.toString() : '',
              length_mm: productData.length_mm ? productData.length_mm.toString() : '',
              width_mm: productData.width_mm ? productData.width_mm.toString() : '',
              height_mm: productData.height_mm ? productData.height_mm.toString() : '',
              selling_price: productData.selling_price ? productData.selling_price.toString() : '',
              price: productData.price ? productData.price.toString() : '', // Original price field
              discount: productData.discount ? productData.discount.toString() : '',
              gst: productData.gst ? productData.gst.toString() : '',
              stock: productData.stock ? productData.stock.toString() : '',
              min_order_qty: productData.min_order_qty ? productData.min_order_qty.toString() : '1',
              delivery_flag: productData.delivery_flag !== undefined ? productData.delivery_flag : true,
              status: productData.status || 1,
              product_type: productData.product_type || 'simple',
              parent_product_id: productData.parent_product_id || '',
            });

            // Set existing images
            if (productData.images && Array.isArray(productData.images)) {
              setProductImages(productData.images);
            }

            // Set child products if this is a parent product
            if (productData.product_type === 'parent' && productData.childProducts && Array.isArray(productData.childProducts)) {
              setSelectedChildProducts(productData.childProducts.map(child => child.id));
            }

            console.log('Form data set:', {
              name: productData.name || '',
              description: productData.description || '',
              sku_code: productData.sku_code || '',
              category_id: productData.category_id || '',
              subcategory_id: productData.subcategory_id || '',
              brand_id: productData.brand_id || '',
              color: productData.color || '',
              size_dimension: productData.size_dimension || '',
              unit: productData.unit || '',
              weight_kg: productData.weight_kg ? productData.weight_kg.toString() : '',
              length_mm: productData.length_mm ? productData.length_mm.toString() : '',
              width_mm: productData.width_mm ? productData.width_mm.toString() : '',
              height_mm: productData.height_mm ? productData.height_mm.toString() : '',
              selling_price: productData.selling_price ? productData.selling_price.toString() : '',
              price: productData.price ? productData.price.toString() : '', // Original price field
              discount: productData.discount ? productData.discount.toString() : '',
              gst: productData.gst ? productData.gst.toString() : '',
              stock: productData.stock ? productData.stock.toString() : '',
              min_order_qty: productData.min_order_qty ? productData.min_order_qty.toString() : '1',
              delivery_flag: productData.delivery_flag !== undefined ? productData.delivery_flag : true,
              status: productData.status || 1,
              product_type: productData.product_type || 'simple',
              parent_product_id: productData.parent_product_id || '',
            }); // Debug log

          } catch (error) {
            console.error('Error fetching product details:', error);
            setSnackbar({
              open: true,
              message: `Failed to load product details: ${error.message}`,
              severity: 'error',
            });
          }
        }
        
        // Fetch all products for parent-child relationship management
        try {
          const productsResponse = await adminService.products.getAll();
          setAllProducts(productsResponse || []);
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
      if (!formData.name || !formData.category_id || formData.stock === '') {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields (Product Name, Category, Stock)',
          severity: 'error',
        });
        return;
      }
      
      // Only validate price for non-parent products
      if (formData.product_type !== 'parent' && (!formData.price || formData.price === '')) {
        setSnackbar({
          open: true,
          message: 'Price is required for simple and child products',
          severity: 'error',
        });
        return;
      }

      // Additional validation for numeric fields
      if (formData.price && isNaN(parseFloat(formData.price))) {
        setSnackbar({
          open: true,
          message: 'Price must be a valid number',
          severity: 'error',
        });
        return;
      }

      if (formData.stock !== '' && isNaN(parseInt(formData.stock, 10))) {
        setSnackbar({
          open: true,
          message: 'Stock must be a valid number',
          severity: 'error',
        });
        return;
      }

      setLoading(true);
      // Prepare data for API
      const productData = {
        ...formData,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : '',
        price: formData.price ? parseFloat(formData.price) : '',
        discount: formData.discount ? parseFloat(formData.discount) : '',
        gst: formData.gst ? parseFloat(formData.gst) : '',
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : '',
        length_mm: formData.length_mm ? parseFloat(formData.length_mm) : '',
        width_mm: formData.width_mm ? parseFloat(formData.width_mm) : '',
        height_mm: formData.height_mm ? parseFloat(formData.height_mm) : '',
        stock: parseInt(formData.stock, 10) || 0,
        min_order_qty: parseInt(formData.min_order_qty, 10) || 1,
        delivery_flag: formData.delivery_flag,
        // Convert status to number if it's a string
        status: typeof formData.status === 'string' ? parseInt(formData.status, 10) : formData.status,
        // Include images to remove if any
        images_to_remove: imagesToRemove.length > 0 ? imagesToRemove : undefined,
        // Include child product IDs if this is a parent product
        child_product_ids: formData.product_type === 'parent' ? JSON.stringify(selectedChildProducts) : undefined,
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
        await adminService.products.update(id, formDataObj);
        // Clear the images to remove state after successful update
        setImagesToRemove([]);
        setSnackbar({
          open: true,
          message: 'Product updated successfully',
          severity: 'success',
        });
      } else {
        // Create new product
        await adminService.products.create(formDataObj);
        setSnackbar({
          open: true,
          message: 'Product added successfully',
          severity: 'success',
        });

        // Redirect to the product list after a short delay
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save product',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      await adminService.products.delete(id);

      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success',
      });

      // Redirect to the product list after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete product',
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
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Dashboard
              </Link>
              <Link color="inherit" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
                Products
              </Link>
              <Typography color="text.primary">{isEditMode ? 'Edit Product' : 'Add Product'}</Typography>
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
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                    />
                  </Box>
                </Box>
                
                {/* Product Type Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Product Type
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Product Type</InputLabel>
                      <Select
                        label="Product Type"
                        name="product_type"
                        value={formData.product_type}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="simple">Simple Product</MenuItem>
                        <MenuItem value="child">Child Product</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {/* Show parent product selection only for child products */}
                    {formData.product_type === 'child' && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Parent Product</InputLabel>
                        <Select
                          label="Parent Product"
                          name="parent_product_id"
                          value={formData.parent_product_id}
                          onChange={handleInputChange}
                        >
                        <MenuItem value="">Select Parent Product</MenuItem>
                        {Array.isArray(allProducts) && allProducts
                          .filter(product => product.product_type === 'parent' || product.product_type === 'simple')
                          .map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name} (SKU: {product.sku_code})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    
                    {/* Show child product selection only for parent products */}
                    {formData.product_type === 'parent' && (
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          For a simplified parent product form, <Link href={`/parent-products/${id || 'new'}`}>click here</Link>.
                        </Typography>
                        <TextField
                          fullWidth
                          label="Search Available Products"
                          placeholder="Search by name or SKU..."
                          sx={{ mb: 2 }}
                          onChange={(e) => {
                            // In a real implementation, you would filter the available products based on this search
                            // For now, we'll just leave it as a placeholder
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Available Products</Typography>
                            <Paper sx={{ height: 300, overflow: 'auto' }}>
                              {Array.isArray(allProducts) && allProducts
                                .filter(product => product.product_type !== 'parent' && product.id !== parseInt(id))
                                .filter(product => !selectedChildProducts.includes(product.id))
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
                                      setSelectedChildProducts(prev => [...prev, product.id]);
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
                              {Array.isArray(allProducts) && allProducts
                                .filter(product => selectedChildProducts.includes(product.id))
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
                                      setSelectedChildProducts(prev => prev.filter(id => id !== product.id));
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
                    )}
                  </Box>
                </Box>
                
                {/* Category and Brand Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Category & Brand
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        label="Category"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {Array.isArray(categories) && categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth size="small">
                      <InputLabel>Subcategory</InputLabel>
                      <Select
                        label="Subcategory"
                        name="subcategory_id"
                        value={formData.subcategory_id}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Select Subcategory</MenuItem>
                        {Array.isArray(categories) && categories.filter(cat => cat.parent_id).map((subcategory) => (
                          <MenuItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
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

                    <FormControl fullWidth size="small">
                      <InputLabel>Variation</InputLabel>
                      <Select
                        label="Variation"
                        name="variation_id"
                        value={formData.variation_id}
                        onChange={handleInputChange}
                      >
                        <MenuItem value="">Select Variation</MenuItem>
                        {variations.map((variation) => (
                          <MenuItem key={variation.id} value={variation.id}>
                            {variation.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {/* Pricing Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Pricing
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Original Price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      InputProps={{ startAdornment: '₹' }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Selling Price"
                      name="selling_price"
                      type="number"
                      value={formData.selling_price}
                      onChange={handleInputChange}
                      InputProps={{ startAdornment: '₹' }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Discount (%)"
                      name="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleInputChange}
                      InputProps={{ endAdornment: '%' }}
                    />
                    
                    <TextField
                      fullWidth
                      label="GST (%)"
                      name="gst"
                      type="number"
                      value={formData.gst}
                      onChange={handleInputChange}
                      InputProps={{ endAdornment: '%' }}
                    />
                  </Box>
                </Box>
                
                {/* Inventory Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Inventory
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Minimum Order Quantity"
                      name="min_order_qty"
                      type="number"
                      value={formData.min_order_qty}
                      onChange={handleInputChange}
                    />
                    
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
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.delivery_flag}
                          onChange={(e) => handleInputChange({ target: { name: 'delivery_flag', value: e.target.checked } })}
                          name="delivery_flag"
                        />
                      }
                      label="Available for Delivery"
                    />
                  </Box>
                </Box>
                
                {/* Physical Attributes Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Physical Attributes
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                    
                    <TextField
                      fullWidth
                      label="Size/Dimension"
                      name="size_dimension"
                      value={formData.size_dimension}
                      onChange={handleInputChange}
                    />
                    
                    <TextField
                      fullWidth
                      label="Unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                    />
                    
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      name="weight_kg"
                      type="number"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                    />
                    
                    <TextField
                      fullWidth
                      label="Length (mm)"
                      name="length_mm"
                      type="number"
                      value={formData.length_mm}
                      onChange={handleInputChange}
                    />
                    
                    <TextField
                      fullWidth
                      label="Width (mm)"
                      name="width_mm"
                      type="number"
                      value={formData.width_mm}
                      onChange={handleInputChange}
                    />
                    
                    <TextField
                      fullWidth
                      label="Height (mm)"
                      name="height_mm"
                      type="number"
                      value={formData.height_mm}
                      onChange={handleInputChange}
                    />
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
                      <Grid container spacing={2}>
                        {newImages.map((image, index) => (
                          <Grid item xs={12} key={index}>
                            <Card>
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
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Preview of existing images */}
                  {productImages.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Existing Images ({productImages.length})
                      </Typography>
                      <Grid container spacing={2}>
                        {productImages.map((image, index) => (
                          <Grid item xs={12} key={image.id || index}>
                            <Card>
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
                          </Grid>
                        ))}
                      </Grid>
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

export default ProductDetail;
