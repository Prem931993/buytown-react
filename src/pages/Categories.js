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
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Category as CategoryIcon,
  SubdirectoryArrowRight as SubcategoryIcon,
} from '@mui/icons-material';
import axios from 'axios';

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [parentCategory, setParentCategory] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
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
  const [deleteItem, setDeleteItem] = useState({ id: null, name: '', type: '' });
  
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
        const response = await axios.get('/categories', {
          params: {
            page: pagination.currentPage,
            limit: 10,
            search: searchTerm
          }
        });
        // Transform the flat list of categories into a hierarchical structure
        const transformedCategories = transformCategories(response.data.categories);
        setCategories(transformedCategories);
        
        // Update pagination state
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load categories',
          severity: 'error',
        });
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    };
    
    fetchData();
  }, [pagination.currentPage, searchTerm]);

  // Transform flat list of categories into hierarchical structure
  const transformCategories = (categories) => {
    const categoryMap = {};
    const rootCategories = [];

    // Create a map of all categories by ID
    categories.forEach(category => {
      categoryMap[category.id] = {
        ...category,
        subcategories: []
      };
    });

    // Build the hierarchy
    categories.forEach(category => {
      if (category.parent_id) {
        // This is a subcategory
        if (categoryMap[category.parent_id]) {
          categoryMap[category.parent_id].subcategories.push(categoryMap[category.id]);
        }
      } else {
        // This is a root category
        rootCategories.push(categoryMap[category.id]);
      }
    });

    return rootCategories;
  };

  const handleToggleExpand = (categoryId) => {
    setExpanded({
      ...expanded,
      [categoryId]: !expanded[categoryId],
    });
  };

  const handleOpenForm = (item = null, isSubcat = false, parent = null) => {
    setIsSubcategory(isSubcat);
    setParentCategory(parent);
    
    if (item) {
      setCurrentItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        status: item.status,
        image: item.image || null,
      });
    } else {
      setCurrentItem(null);
      setFormData({
        name: '',
        description: '',
        status: 'active',
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

  // Form submission is now handled in CategoryDetail page


  const handleSaveCategory = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      
      if (formData.image && typeof formData.image !== 'string') {
        formDataToSend.append('image', formData.image);
      }
      
      if (isSubcategory && parentCategory) {
        formDataToSend.append('parent_id', parentCategory.id);
      }
      
      let response;
      if (currentItem) {
        // Update existing category
        response = await axios.put(`/categories/${currentItem.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new category
        response = await axios.post('/categories', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setSnackbar({
        open: true,
        message: currentItem ? 'Category updated successfully' : 'Category added successfully',
        severity: 'success',
      });
      
      handleCloseForm();
      
      // Refresh the categories list
      const response2 = await axios.get('/categories', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      const transformedCategories = transformCategories(response2.data.categories);
      setCategories(transformedCategories);
      
      // Update pagination state
      if (response2.data.pagination) {
        setPagination(response2.data.pagination);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save category',
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

  const handleDeleteConfirmation = (id, name, type) => {
    setDeleteItem({ id, name, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteItem({ id: null, name: '', type: '' });
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteItem.type === 'subcategory') {
        // Find the parent category ID for the subcategory
        let parentId = null;
        for (const category of categories) {
          if (category.subcategories.some(sub => sub.id === deleteItem.id)) {
            parentId = category.id;
            break;
          }
        }
        
        if (parentId) {
          await axios.delete(`/categories/${deleteItem.id}`);
          
          setSnackbar({
            open: true,
            message: 'Subcategory deleted successfully',
            severity: 'success',
          });
        } else {
          throw new Error('Parent category not found');
        }
      } else {
        await axios.delete(`/categories/${deleteItem.id}`);
        
        setSnackbar({
          open: true,
          message: 'Category deleted successfully',
          severity: 'success',
        });
      }
      
      // Close the dialog
      handleDeleteCancel();
      
      // Refresh the categories list
      const response = await axios.get('/categories', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      const transformedCategories = transformCategories(response.data.categories);
      setCategories(transformedCategories);
      
      // Update pagination state
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete category',
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
      
      const response = await axios.post('/categories/import', formData, {
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
      
      // Refresh the categories list
      const response2 = await axios.get('/categories', {
        params: {
          page: pagination.currentPage,
          limit: 10,
          search: searchTerm
        }
      });
      const transformedCategories = transformCategories(response2.data.categories);
      setCategories(transformedCategories);
      
      // Update pagination state
      if (response2.data.pagination) {
        setPagination(response2.data.pagination);
      }
    } catch (error) {
      console.error('Error importing categories:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to import categories',
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
          Categories Management
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
            Import Categories
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
            Add Category
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                placeholder="Search categories..."
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
          Import Categories
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
              Upload an Excel file with your categories
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Format: Category Name, Description, Image (optional)
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
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Subcategories</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <React.Fragment key={category.id}>
                <TableRow>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CategoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {category.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.status === 'active' ? 'Active' : 'Inactive'}
                      color={category.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {category.subcategories.length} subcategories
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleExpand(category.id)}
                      >
                        {expanded[category.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenForm(null, true, category)}
                      sx={{ mr: 1 }}
                    >
                      Add Sub
                    </Button>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenForm(category)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteConfirmation(category.id, category.name, 'category')}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={expanded[category.id]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Subcategories
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID</TableCell>
                              <TableCell>Name</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {category.subcategories.map((subcategory) => (
                              <TableRow key={subcategory.id}>
                                <TableCell>{subcategory.id}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <SubcategoryIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                    <Typography variant="body2">
                                      {subcategory.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>{subcategory.description}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={subcategory.status === 'active' ? 'Active' : 'Inactive'}
                                    color={subcategory.status === 'active' ? 'success' : 'default'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenForm(subcategory, true, category)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteConfirmation(subcategory.id, subcategory.name, 'subcategory')}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                            {category.subcategories.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} align="center">
                                  No subcategories found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
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

      {/* Category/Subcategory Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          {isSubcategory
            ? currentItem
              ? `Edit Subcategory: ${currentItem.name}`
              : `Add New Subcategory to ${parentCategory?.name}`
            : currentItem
            ? `Edit Category: ${currentItem.name}`
            : 'Add New Category'}
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
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                margin="normal"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
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
                        alt="Category"
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
            onClick={handleSaveCategory}
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
            Are you sure you want to delete the {deleteItem.type} "{deleteItem.name}"? This action cannot be undone.
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

export default Categories;