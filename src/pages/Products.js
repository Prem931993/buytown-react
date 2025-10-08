import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CloudUpload as CloudUploadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { adminApiClient } from '../services/adminService';
import adminService from '../services/adminService';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ id: null, name: '' });

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category_ids: [],
    in_stock: false,
    has_discount: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Ref to track initial mount
  const isInitialMount = useRef(true);
  
  const fetchProducts = useCallback(async (isSearch = false, pageOverride = null) => {
    try {
      setLoading(true);

      // Prepare query parameters
      const params = {
        page: pageOverride !== null ? pageOverride : pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        category_id: filters.category_ids.length > 0 ? filters.category_ids.join(',') : undefined,
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
  }, [pagination.page, pagination.limit, searchQuery, filters.category_ids]);
  
  // Separate function for initial data fetching to avoid dependency issues
  const fetchInitialProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters with default values for initial load
      const params = {
        page: 1,
        limit: 20,
      };
      
      // Fetch products from API
      const response = await adminApiClient.get('/products', { params });

      // Set products and pagination data
      setProducts(response.data.products || []);
      setPagination(prevPagination => ({
        ...prevPagination,
        page: 1,
        limit: 20,
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

        // Fetch categories for dropdown
        try {
          const categoriesResponse = await adminService.categories.getForDropdown();
          setCategories(categoriesResponse.categories || []);
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

  // Auto-fetch products when category or status filters change
  useEffect(() => {
    // Skip the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const applyFilters = async () => {
      try {
        setLoading(true);
        setPagination(prev => ({ ...prev, page: 1 }));

        // Prepare query parameters
        const params = {
          page: 1,
          limit: pagination.limit,
          search: searchQuery || undefined,
          category_id: filters.category_ids.length > 0 ? filters.category_ids.join(',') : undefined,
        };

        // Remove undefined parameters
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

        // Fetch products from API
        const response = await adminApiClient.get('/products', { params });

        // Set products and pagination data
        setProducts(response.data.products || []);
        setPagination(prevPagination => ({
          ...prevPagination,
          page: 1,
          total: response.data.pagination?.totalCount || 0,
          totalPages: response.data.pagination?.totalPages || 0,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrev: response.data.pagination?.hasPrev || false,
        }));
      } catch (error) {
        console.error('Error fetching filtered products:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load filtered products',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    applyFilters();
  }, [filters.category_ids, filters.in_stock, filters.has_discount, pagination.limit, searchQuery]);

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
      // Delete product from API
      await adminApiClient.delete(`/products/${deleteItem.id}`);

      // Update the products list
      const updatedProducts = products.filter((p) => p.id !== deleteItem.id);
      setProducts(updatedProducts);
      setSnackbar({
        open: true,
        message: 'Product deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setDeleteItem({ id: null, name: '' });
    } catch (error) {
      console.error('Error deleting product:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete product',
        severity: 'error',
      });
      setDeleteDialogOpen(false);
      setDeleteItem({ id: null, name: '' });
    }
  };

  // Add Delete Confirmation Dialog JSX here

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

      <Card sx={{
        mb: 4,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#374151' }}>
            Search & Filters
          </Typography>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setPagination({ ...pagination, page: 1 });
                      fetchProducts(true);
                    }
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                        },
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    setPagination({ ...pagination, page: 1 });
                    fetchProducts(true);
                  }}
                  sx={{
                    minWidth: '48px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: '8px',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <SearchIcon />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl
                fullWidth
                size="small"
                sx={{
                  minWidth: '160px',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6366f1',
                      },
                    },
                  },
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  multiple
                  value={filters.category_ids}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilters({...filters, category_ids: typeof value === 'string' ? value.split(',') : value});
                  }}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return 'All Categories';
                    }
                    const selectedNames = categories.filter(cat => selected.includes(cat.id)).map(cat => cat.name);
                    return selectedNames.join(', ');
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    category_ids: [],
                    in_stock: false,
                    has_discount: false
                  });
                  setPagination({ ...pagination, page: 1 });
                  fetchProducts(false);
                }}
                sx={{
                  minWidth: '120px',
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: '#fef2f2',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  },
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Reset
              </Button>
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
                        <img
                          src={product.images && product.images.length > 0 ? (product.images[0].image_path || `/products/${product.images[0].path?.split('/').pop()}`) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdGV4dC1iYXNlPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='}
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            if (!e.target.src.includes('data:image/svg+xml')) {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjI1IiB5PSIyNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgdGV4dC1iYXNlPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                            }
                            e.target.onerror = null;
                          }}
                        />
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
                          onClick={() => handleDeleteConfirmation(product.id, product.name)}
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
                const newPageNumber = newPage + 1;
                setPagination({ ...pagination, page: newPageNumber });
                // Fetch products with new page, using search if there's a search query
                fetchProducts(!!searchQuery, newPageNumber);
              }}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={(event) => {
                setPagination({
                  ...pagination,
                  limit: parseInt(event.target.value, 20),
                  page: 1 // Reset to first page when changing rows per page
                });
                // Fetch products with new limit, using search if there's a search query
                fetchProducts(!!searchQuery);
              }}
              rowsPerPageOptions={[10, 20, 50, 100]}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the product "{deleteItem.name}"? This action cannot be undone.
          </DialogContentText>
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
    </Box>
  );
}

export default Products;