import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import adminService from '../services/adminService';

function ProductImport() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      // Check if file is Excel
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setSnackbar({
          open: true,
          message: 'Please select a valid Excel file (.xlsx or .xls)',
          severity: 'error',
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Handle file upload and import
  const handleImport = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: 'Please select a file to import',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    
    try {
      // Use adminService to import products (includes dual token authentication)
      const response = await adminService.products.import(file);

      // Handle success
      setImportResults(response);
      setSnackbar({
        open: true,
        message: 'Products imported successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error importing products:', error);

      // Check if error.response exists and has status 403 (forbidden)
      if (error.response && error.response.status === 403) {
        setSnackbar({
          open: true,
          message: 'Import forbidden: Please check your authorization tokens.',
          severity: 'error',
        });
      } else if (error.response && error.response.data) {
        setImportResults(error.response.data);
        setSnackbar({
          open: true,
          message: error.response.data.message || 'Failed to import products',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to import products',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Download sample template
  const handleDownloadTemplate = () => {
    // In a real app, this would download a template file from the server
    // For now, we'll just show a message
    setSnackbar({
      open: true,
      message: 'Template download would be implemented here',
      severity: 'info',
    });
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
              Import Products
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Dashboard
              </Link>
              <Link color="inherit" href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
                Products
              </Link>
              <Typography color="text.primary">Import Products</Typography>
            </Breadcrumbs>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/products')}
              sx={{ mr: 2 }}
            >
              Back to Products
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mr: 2 }}
            >
              Download Template
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Import Products from Excel
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Upload an Excel file (.xlsx or .xls) containing product data. The file should have the following columns:
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="name (required) - Product name" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="sku_code (required) - Unique SKU code" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="hsn_code - HSN/SAC code for GST compliance" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="price (required) - Selling price" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="description - Product description" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="category_id - Category ID" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="brand - Brand name (alternative to brand_id)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="brand_id - Brand ID (alternative to brand)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="color - Product color" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="stock - Stock quantity" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="status - Product status (active, out_of_stock)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="unit - Product unit of measurement" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="size_dimension - Product size/dimensions" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="weight_kg - Product weight in kg" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="length_mm - Product length in mm" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="width_mm - Product width in mm" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="height_mm - Product height in mm" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="selling_price - Product selling price" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="discount - Product discount percentage" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="gst - Product GST percentage" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="parent_sku - SKU of parent product (for child products)" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="For parent products, only basic information, category, brand, status, and images are required. All other fields are optional." />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <input
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2, width: '100%' }}
                    >
                      Select Excel File
                    </Button>
                  </label>
                  
                  {file && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        width: '100%', 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: 'rgba(99, 102, 241, 0.08)',
                        borderRadius: 1
                      }}
                    >
                      <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {file.name}
                      </Typography>
                      <IconButton size="small" onClick={() => setFile(null)}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  )}
                  
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={handleImport}
                    disabled={!file || loading}
                    sx={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
                      },
                    }}
                  >
                    {loading ? 'Importing...' : 'Import Products'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Import Results
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : importResults ? (
                  <Box>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                        Successfully imported: {importResults.success || 0} products
                      </Typography>
                    </Box>
                    
                    {importResults.errors && importResults.errors.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ mb: 1, color: 'error.main' }}>
                          Errors ({importResults.errors.length}):
                        </Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                          <List dense>
                            {importResults.errors.map((error, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <ErrorIcon color="error" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={`Row ${error.row || 'Unknown'}`}
                                  secondary={error.message || 'Unknown error'}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                    <Typography variant="body1" color="text.secondary">
                      Import results will appear here
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ProductImport;