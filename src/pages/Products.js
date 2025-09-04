import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import adminService, { adminApiClient } from '../services/adminService';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category_id: '',
    brand: '',
    color: '',
    min_price: '',
    max_price: '',
    in_stock: false,
    has_discount: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  const fetchProducts = useCallback(async (isSearch = false) => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        category_id: filters.category_id || undefined,
        brand_id: filters.brand || undefined,
      };
      
      // Remove undefined parameters
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      
      // Fetch products from API
      const response = await adminApiClient.get('/products', { params });

      // Set products and pagination data
      setProducts(response.data.products || []);
      setPagination(prevPagination => ({
        ...prevPagination,
        total: response.data.pagination?.totalCount || 0,
        totalPages: response.data.pagination?.totalPages || 0,
        hasNext: response.data.pagination?.hasNext || false,
        hasPrev: response.data.pagination?.hasPrev || false,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load products',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [pagination, searchQuery, filters.category_id, filters.brand]);
  
  // Separate function for initial data fetching to avoid dependency issues
  const fetchInitialProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters with default values for initial load
      const params = {
        page: 1,
        limit: 10,
      };
      
      // Fetch products from API
      const response = await adminApiClient.get('/products', { params });

      // Set products and pagination data
      setProducts(response.data.products || []);
      setPagination(prevPagination => ({
        ...prevPagination,
        page: 1,
        limit: 10,
        total: response.data.pagination?.totalCount || 0,
        totalPages: response.data.pagination?.totalPages || 0,
        hasNext: response.data.pagination?.hasNext || false,
        hasPrev: response.data.pagination?.hasPrev || false,
      }));
    } catch (error) {
      console.error('Error fetching initial products:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load products',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [setProducts, setPagination, setSnackbar, setLoading]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        try {
          const categoriesResponse = await adminApiClient.get('/categories');
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
        
        // Fetch products with filters and pagination
        await fetchInitialProducts();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load initial data',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fetchInitialProducts]);

  // Navigation to detail page is now handled with react-router
  const navigate = useNavigate();
  
  const handleAddProduct = () => {
    navigate('/products/add');
  };
  
  const handleEditProduct = (product) => {
    // If this is a parent product, navigate to the parent product form
    if (product.product_type === 'parent') {
      navigate(`/parent-products/${product.id}`);
    } else {
      navigate(`/products/edit/${product.id}`);
    }
  };


  const handleDelete = async (id) => {
    try {
      // Delete product from API
      await adminApiClient.delete(`/products/${id}`);
      
      // Update the products list
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete product',
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Products Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate('/products/import')}
            sx={{ mr: 2 }}
          >
            Import Products
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/parent-products')}
            sx={{ mr: 2 }}
          >
            Add Parent Product
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
              },
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex' }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Reset to first page when searching
                      setPagination({ ...pagination, page: 1 });
                      fetchProducts(true);
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  sx={{
                    ml: 1,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
                    },
                  }}
                  onClick={() => {
                    // Reset to first page when searching
                    setPagination({ ...pagination, page: 1 });
                    fetchProducts(true);
                  }}
                >
                  <SearchIcon />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select 
                  label="Category" 
                  value={filters.category_id}
                  onChange={(e) => setFilters({...filters, category_id: e.target.value})}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select 
                  label="Status" 
                  value={filters.in_stock ? 'in_stock' : filters.has_discount ? 'has_discount' : ''}
                  onChange={(e) => {
                    if (e.target.value === 'in_stock') {
                      setFilters({...filters, in_stock: true, has_discount: false});
                    } else if (e.target.value === 'has_discount') {
                      setFilters({...filters, in_stock: false, has_discount: true});
                    } else {
                      setFilters({...filters, in_stock: false, has_discount: false});
                    }
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="in_stock">In Stock</MenuItem>
                  <MenuItem value="has_discount">On Sale</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                   // Reset to first page when applying new filters
                   setPagination({ ...pagination, page: 1 });
                   
                   // For search functionality, we would use the searchProducts endpoint
                   if (searchQuery) {
                     fetchProducts(true); // true indicates this is a search operation
                   } else {
                     // Otherwise just apply filters to the product list
                     fetchProducts(false);
                   }
                 }}
                sx={{ height: '40px' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
          
          {/* Advanced Filters */}
          <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={filters.min_price}
                onChange={(e) => setFilters({...filters, min_price: e.target.value})}
                InputProps={{
                  startAdornment: <span style={{ marginRight: '8px' }}>₹</span>,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={filters.max_price}
                onChange={(e) => setFilters({...filters, max_price: e.target.value})}
                InputProps={{
                  startAdornment: <span style={{ marginRight: '8px' }}>₹</span>,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Brand</InputLabel>
                <Select 
                  label="Brand" 
                  value={filters.brand}
                  onChange={(e) => setFilters({...filters, brand: e.target.value})}
                >
                  <MenuItem value="">All Brands</MenuItem>
                  <MenuItem value="Apple">Apple</MenuItem>
                  <MenuItem value="Samsung">Samsung</MenuItem>
                  <MenuItem value="Sony">Sony</MenuItem>
                  <MenuItem value="Dell">Dell</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Color</InputLabel>
                <Select 
                  label="Color" 
                  value={filters.color}
                  onChange={(e) => setFilters({...filters, color: e.target.value})}
                >
                  <MenuItem value="">All Colors</MenuItem>
                  <MenuItem value="Black">Black</MenuItem>
                  <MenuItem value="White">White</MenuItem>
                  <MenuItem value="Blue">Blue</MenuItem>
                  <MenuItem value="Red">Red</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body1" sx={{ py: 5 }}>
                        No products found. Try adjusting your search or filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].image_path || `/products/${product.images[0].path?.split('/').pop()}`}
                            alt={product.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => {
                              e.target.src = '/products/placeholder.png';
                              e.target.onerror = null;
                            }}
                          />
                        ) : (
                          <Box sx={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="caption">No Image</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {product.name}
                          </Typography>
                          {product.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                              {product.description.length > 50
                                ? `${product.description.substring(0, 50)}...`
                                : product.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>₹{product.price && !isNaN(parseFloat(product.price)) ? parseFloat(product.price).toFixed(2) : '0.00'}</TableCell>
                      <TableCell>{product.category_name || 'N/A'}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status === 1 ? 'Active' : product.status === 2 ? 'Out of Stock' : 'Discontinued'}
                          color={product.status === 1 ? 'success' : product.status === 2 ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {product.product_type ? product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1) : 'N/A'}
                        <br />
                        <small>({product.product_type})</small>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            handleEditProduct(product);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(product.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1} // MUI uses 0-based indexing
              onPageChange={(event, newPage) => {
                setPagination({ ...pagination, page: newPage + 1 });
                // Fetch products with new page, using search if there's a search query
                fetchProducts(!!searchQuery);
              }}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={(event) => {
                setPagination({
                  ...pagination,
                  limit: parseInt(event.target.value, 10),
                  page: 1 // Reset to first page when changing rows per page
                });
                // Fetch products with new limit, using search if there's a search query
                fetchProducts(!!searchQuery);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </>
      )}

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

export default Products;