import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
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
  Avatar,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Description as PageIcon,
  FilterList as FilterIcon,
  Public as PublishedIcon,
  Drafts as DraftIcon,
} from '@mui/icons-material';

function Pages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await adminService.pages.getAll();
      setPages(response.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load pages',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = () => {
    navigate('/pages/create');
  };

  const handleEditPage = (page) => {
    navigate(`/pages/edit/${page.id}`);
  };

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await adminService.pages.delete(pageId);
        const updatedPages = pages.filter((page) => page.id !== pageId);
        setPages(updatedPages);
        setSnackbar({
          open: true,
          message: 'Page deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting page:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.error || 'Failed to delete page',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredPages = pages.filter((page) => {
    // Filter by status
    if (filterStatus !== 'all' && page.status !== filterStatus) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        page.title?.toLowerCase().includes(query) ||
        page.slug?.toLowerCase().includes(query) ||
        page.content?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getStatusChip = (status) => {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const isPublished = status === 'published';

    return (
      <Chip
        icon={isPublished ? <PublishedIcon /> : <DraftIcon />}
        label={statusText}
        size="small"
        color={isPublished ? 'success' : 'default'}
        variant={isPublished ? 'filled' : 'outlined'}
      />
    );
  };



  const getAvatarColor = (id) => {
    const colors = [
      '#6366f1', // indigo
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // emerald
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#ef4444', // red
    ];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Pages Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPage}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
            },
          }}
        >
          Add Page
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                placeholder="Search pages..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="status-filter-label">Filter by Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={filterStatus}
                  onChange={handleFilterChange}
                  label="Filter by Status"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}>
              <TableCell>Page</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(page.id),
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      <PageIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {page.title || 'Untitled Page'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {page.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    /{page.slug}
                  </Typography>
                </TableCell>
                <TableCell>{getStatusChip(page.status)}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(page.created_at).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {page.updated_at
                      ? new Date(page.updated_at).toLocaleDateString()
                      : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit Page">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditPage(page)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Page">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeletePage(page.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredPages.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No pages found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default Pages;
