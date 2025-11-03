import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatStrikethrough,
  Undo,
  Redo,
} from '@mui/icons-material';

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
    weight_kg: '',
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
    hsn_code: '', // Added HSN code field
    related_product_ids: [], // Added related products field
    variation_id: '', // Added variation field
  });

  // State for parent-child relationships
  const [allProducts, setAllProducts] = useState([]); // All products for selection
  const [selectedChildProducts, setSelectedChildProducts] = useState([]); // Selected child products for parent
  const [childProductsSearch, setChildProductsSearch] = useState(''); // Search for child products
  const [relatedProductsSearch, setRelatedProductsSearch] = useState(''); // Search for related products
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        description: editor.getHTML(),
      }));
    },
  });

  // Update editor content when formData.description changes
  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || '');
    }
  }, [formData.description, editor]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          // Fetch categories
        try {
            const categoriesResponse = await adminService.categories.getForDropdown();
            setCategories(categoriesResponse.categories || []);

          } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([
              { id: 1, name: 'Electronics' },
              { id: 2, name: 'Audio' },
              { id: 3, name: 'Wearables' },
              { id: 4, name: 'Accessories' }
            ]);
          }

          // Fetch brands
          try {
            const brandsResponse = await adminService.brands.getForDropdown();
            setBrands(brandsResponse.brands || []);

          } catch (error) {
            console.error('Error fetching brands:', error);
            setBrands([
              { id: 1, name: 'Samsung' },
              { id: 2, name: 'Apple' },
              { id: 3, name: 'Sony' },
              { id: 4, name: 'Dell' }
            ]);
          }

          // Fetch variations for dropdown
          try {
            const variationsResponse = await adminService.variations.getForDropdown();
            setVariations(variationsResponse.variations || []);
          } catch (error) {
            console.error('Error fetching variations:', error);
            setVariations([]);
          }

        // If in edit mode, fetch product details
        if (isEditMode) {
          try {
            const productResponse = await adminService.products.getById(id);

            // Handle different possible response structures
            let productData = productResponse;
            if (productResponse?.data) {
              productData = productResponse.data;
            } else if (productResponse?.product) {
              productData = productResponse.product;
            }

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
              weight_kg: productData.weight_kg ? productData.weight_kg.toString() : '',
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
              hsn_code: productData.hsn_code || '', // Added HSN code field
              variation_id: productData.variation_id || '', // Added variation field
            });

            // Set existing images
            if (productData.images && Array.isArray(productData.images)) {
              setProductImages(productData.images);
            }

            // Set child products if this is a parent product
            if (productData.product_type === 'parent' && productData.childProducts && Array.isArray(productData.childProducts)) {
              setSelectedChildProducts(productData.childProducts.map(child => child.id));
            }

            // Set related products if available
            if (productData.relatedProducts && Array.isArray(productData.relatedProducts)) {
              setFormData(prev => ({
                ...prev,
                related_product_ids: productData.relatedProducts.map(rp => rp.id)
              }));
            }

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
          const productsResponse = await adminService.products.getAll({ limit: 10000 });
          setAllProducts(productsResponse.products || []);
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

  // Removed variation related useEffects as per user request

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
        stock: parseInt(formData.stock, 10) || 0,
        min_order_qty: parseInt(formData.min_order_qty, 10) || 1,
        delivery_flag: formData.delivery_flag,
        // Convert status to number if it's a string
        status: typeof formData.status === 'string' ? parseInt(formData.status, 10) : formData.status,
        // Include images to remove if any
        images_to_remove: imagesToRemove.length > 0 ? imagesToRemove : undefined,
        // Include child product IDs if this is a parent product
        child_product_ids: formData.product_type === 'parent' ? JSON.stringify(selectedChildProducts) : undefined,
        // Include related product IDs
        related_product_ids: formData.related_product_ids.length > 0 ? JSON.stringify(formData.related_product_ids) : undefined,
        // Include variation ID
        variation_id: formData.variation_id || undefined,
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
        <Box sx={{
          position: 'sticky',
          top: 64,
          zIndex: 1100,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)',
          padding: '16px 0',
          borderBottom: '1px solid rgba(231, 190, 76, 0.3)',
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
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
                background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
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
                      label="HSN Code"
                      name="hsn_code"
                      value={formData.hsn_code}
                      onChange={handleInputChange}
                    />
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
                          variant="contained"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          fullWidth
                          sx={{
                            background: 'linear-gradient(135deg, #E7BE4C 0%, #C69C4B 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #C69C4B 0%, #E7BE4C 100%)',
                            },
                          }}
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
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        Description
                      </Typography>
                      {/* Editor Toolbar */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          sx={{
                            backgroundColor: editor?.isActive('bold') ? 'primary.main' : 'transparent',
                            color: editor?.isActive('bold') ? 'white' : 'inherit',
                            '&:hover': { backgroundColor: editor?.isActive('bold') ? 'primary.dark' : 'grey.100' }
                          }}
                        >
                          <FormatBold fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          sx={{
                            backgroundColor: editor?.isActive('italic') ? 'primary.main' : 'transparent',
                            color: editor?.isActive('italic') ? 'white' : 'inherit',
                            '&:hover': { backgroundColor: editor?.isActive('italic') ? 'primary.dark' : 'grey.100' }
                          }}
                        >
                          <FormatItalic fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().toggleStrike().run()}
                          sx={{
                            backgroundColor: editor?.isActive('strike') ? 'primary.main' : 'transparent',
                            color: editor?.isActive('strike') ? 'white' : 'inherit',
                            '&:hover': { backgroundColor: editor?.isActive('strike') ? 'primary.dark' : 'grey.100' }
                          }}
                        >
                          <FormatStrikethrough fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().toggleBulletList().run()}
                          sx={{
                            backgroundColor: editor?.isActive('bulletList') ? 'primary.main' : 'transparent',
                            color: editor?.isActive('bulletList') ? 'white' : 'inherit',
                            '&:hover': { backgroundColor: editor?.isActive('bulletList') ? 'primary.dark' : 'grey.100' }
                          }}
                        >
                          <FormatListBulleted fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                          sx={{
                            backgroundColor: editor?.isActive('orderedList') ? 'primary.main' : 'transparent',
                            color: editor?.isActive('orderedList') ? 'white' : 'inherit',
                            '&:hover': { backgroundColor: editor?.isActive('orderedList') ? 'primary.dark' : 'grey.100' }
                          }}
                        >
                          <FormatListNumbered fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().undo().run()}
                          disabled={!editor?.can().undo()}
                        >
                          <Undo fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => editor?.chain().focus().redo().run()}
                          disabled={!editor?.can().redo()}
                        >
                          <Redo fontSize="small" />
                        </IconButton>
                      </Box>
                      {/* Editor Content */}
                      <Paper
                        sx={{
                          border: '1px solid #ccc',
                          borderRadius: 1,
                          minHeight: 120,
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          '&:focus-within': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                          }
                        }}
                      >
                        <EditorContent
                          editor={editor}
                          style={{
                            flex: 1,
                            outline: 'none',
                            minHeight: 0,
                          }}
                        />
                      </Paper>
                    </Box>
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
                          value={childProductsSearch}
                          onChange={(e) => {
                            setChildProductsSearch(e.target.value);
                          }}
                        />
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>Available Products</Typography>
                            <Paper sx={{ height: 300, overflow: 'auto' }}>
                              {Array.isArray(allProducts) && allProducts
                                .filter(product => product.product_type !== 'parent' && product.id !== parseInt(id))
                                .filter(product => !selectedChildProducts.includes(product.id))
                                .filter(product => {
                                  const searchLower = childProductsSearch.toLowerCase();
                                  return (
                                    product.name.toLowerCase().includes(searchLower) ||
                                    (product.sku_code && product.sku_code.toLowerCase().includes(searchLower))
                                  );
                                })
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

                {/* Related Products Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                    Related Products (Max: 5)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Search Available Products"
                      placeholder="Search by name or SKU..."
                      sx={{ mb: 2 }}
                      value={relatedProductsSearch}
                      onChange={(e) => {
                        setRelatedProductsSearch(e.target.value);
                      }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Available Products
                          {formData.related_product_ids.length >= 5 && (
                            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                              (Maximum limit reached)
                            </Typography>
                          )}
                        </Typography>
                        <Paper sx={{ height: 300, overflow: 'auto' }}>
                          {Array.isArray(allProducts) && allProducts.length > 0 ? (
                            allProducts
                              .filter(product => product.id !== parseInt(id) && !formData.related_product_ids.includes(product.id))
                              .filter(product => {
                                const searchLower = relatedProductsSearch.toLowerCase();
                                return (
                                  product.name.toLowerCase().includes(searchLower) ||
                                  (product.sku_code && product.sku_code.toLowerCase().includes(searchLower))
                                );
                              })
                              .map((product) => (
                                <Box
                                  key={product.id}
                                  sx={{
                                    p: 1,
                                    borderBottom: '1px solid #eee',
                                    cursor: formData.related_product_ids.length >= 5 ? 'not-allowed' : 'pointer',
                                    opacity: formData.related_product_ids.length >= 5 ? 0.5 : 1,
                                    '&:hover': {
                                      backgroundColor: formData.related_product_ids.length >= 5 ? 'transparent' : '#f5f5f5'
                                    }
                                  }}
                                  onClick={() => {
                                    if (formData.related_product_ids.length >= 5) {
                                      setSnackbar({
                                        open: true,
                                        message: 'Maximum of 5 related products allowed',
                                        severity: 'warning',
                                      });
                                      return;
                                    }
                                    setFormData(prev => ({
                                      ...prev,
                                      related_product_ids: [...prev.related_product_ids, product.id]
                                    }));
                                  }}
                                >
                                  <Typography variant="body2">{product.name}</Typography>
                                  <Typography variant="caption" color="textSecondary">SKU: {product.sku_code}</Typography>
                                </Box>
                              ))
                          ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" color="textSecondary">
                                No products available
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                          Selected Related Products ({formData.related_product_ids.length}/5)
                        </Typography>
                        <Paper sx={{ height: 300, overflow: 'auto' }}>
                          {Array.isArray(allProducts) && allProducts.length > 0 ? (
                            allProducts
                              .filter(product => formData.related_product_ids.includes(product.id))
                              .map((product) => (
                                <Box
                                  key={product.id}
                                  sx={{
                                    p: 1,
                                    borderBottom: '1px solid #eee',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    '&:hover': {
                                      backgroundColor: '#f5f5f5'
                                    }
                                  }}
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      related_product_ids: prev.related_product_ids.filter(id => id !== product.id)
                                    }));
                                  }}
                                >
                                  <Box>
                                    <Typography variant="body2">{product.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">SKU: {product.sku_code}</Typography>
                                  </Box>
                                  <RemoveIcon />
                                </Box>
                              ))
                          ) : (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" color="textSecondary">
                                No related products selected
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    </Box>
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
                    {Array.isArray(brands) && brands.map((brand) => (
                      <MenuItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Variation Field */}
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
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
                        {variation.label || variation.name}
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
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      InputProps={{ startAdornment: '₹' }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Selling Price"
                      name="selling_price"
                      value={formData.selling_price}
                      onChange={handleInputChange}
                      InputProps={{ startAdornment: '₹' }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Discount (%)"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      InputProps={{ endAdornment: '%' }}
                    />
                    
                    <TextField
                      fullWidth
                      label="GST (%)"
                      name="gst"
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
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Minimum Order Quantity"
                      name="min_order_qty"
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
                      label="Weight (kg)"
                      name="weight_kg"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                    />
                  </Box>
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
