import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

function Users() {
  const [users, setUsers] = useState([]);
  // Removed form state as it's now handled in UserDetail page
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load users',
          severity: 'error',
        });

        // Fallback to mock data for demonstration if API fails
        if (process.env.NODE_ENV === 'development') {
          setUsers([
            {
              id: 1,
              firstname: 'John',
              lastname: 'Doe',
              email: 'john.doe@example.com',
              phone_no: '+1 (555) 123-4567',
              role: 'admin',
              status: 'active',
              address: '123 Main St',
              created_at: '2023-01-15T08:30:00Z',
              updated_at: '2023-06-10T14:45:00Z',
            },
            {
              id: 2,
              firstname: 'Jane',
              lastname: 'Smith',
              email: 'jane.smith@example.com',
              phone_no: '+1 (555) 987-6543',
              role: 'user',
              status: 'active',
              address: '456 Oak Ave',
              created_at: '2023-02-20T10:15:00Z',
              updated_at: '2023-06-08T09:30:00Z',
            },
            {
              id: 3,
              firstname: 'Robert',
              lastname: 'Johnson',
              email: 'robert.johnson@example.com',
              phone_no: '+1 (555) 456-7890',
              role: 'user',
              status: 'inactive',
              address: '789 Pine Blvd',
              created_at: '2023-03-05T15:45:00Z',
              updated_at: '2023-05-20T11:20:00Z',
            },
            {
              id: 4,
              firstname: 'Emily',
              lastname: 'Davis',
              email: 'emily.davis@example.com',
              phone_no: '+1 (555) 234-5678',
              role: 'delivery_person',
              status: 'active',
              address: '321 Maple Dr',
              created_at: '2023-04-12T09:00:00Z',
              updated_at: '2023-06-09T16:15:00Z',
            },
          ]);
        }
      }
    };

    fetchData();
  }, []);

  // Navigation to detail page is now handled with react-router
  const navigate = useNavigate();
  
  const handleAddUser = () => {
    navigate('/users/add');
  };
  
  const handleEditUser = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  // Form submission is now handled in UserDetail page

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Call backend API to delete user
        await axios.delete(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Update local state after successful deletion
        const updatedUsers = users.filter((user) => user.id !== userId);
        setUsers(updatedUsers);

        setSnackbar({
          open: true,
          message: 'User deleted successfully',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.error || 'Failed to delete user',
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
    setFilterRole(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = users.filter((user) => {
    // Filter by role
    if (filterRole !== 'all' && user.role !== filterRole) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.firstname?.toLowerCase().includes(query) ||
        user.lastname?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone_no?.includes(query)
      );
    }

    return true;
  });

  const getRoleChip = (role) => {
    switch (role) {
      case 'admin':
        return (
          <Chip
            icon={<AdminIcon />}
            label="Admin"
            size="small"
            color="error"
          />
        );
      case 'user':
        return (
          <Chip
            icon={<PersonIcon />}
            label="User"
            size="small"
            color="primary"
          />
        );
      case 'delivery_person':
        return (
          <Chip
            icon={<PersonIcon />}
            label="Delivery Person"
            size="small"
            color="success"
          />
        );
      default:
        return (
          <Chip
            icon={<PersonIcon />}
            label={role}
            size="small"
          />
        );
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status === 'active' ? 'Active' : 'Inactive'}
        color={status === 'active' ? 'success' : 'default'}
        size="small"
      />
    );
  };

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      '#1976d2', // blue
      '#388e3c', // green
      '#d32f2f', // red
      '#f57c00', // orange
      '#7b1fa2', // purple
      '#0288d1', // light blue
      '#388e3c', // green
      '#fbc02d', // yellow
    ];
    return colors[id % colors.length];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5254cc 0%, #7a4fd3 100%)',
            },
          }}
        >
          Add User
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
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
                <InputLabel id="role-filter-label">Filter by Role</InputLabel>
                <Select
                  labelId="role-filter-label"
                  value={filterRole}
                  onChange={handleFilterChange}
                  label="Filter by Role"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="delivery_person">Delivery Person</MenuItem>
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
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(user.id),
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      {getInitials(user.firstname, user.lastname)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.firstname || ''} {user.lastname || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">{user.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                      <Typography variant="body2">{user.phone_no}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{getRoleChip(user.role)}</TableCell>
                <TableCell>{getStatusChip(user.status)}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(user.created_at).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleDateString()
                      : 'Never'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit User">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No users found matching your criteria
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Form Dialog removed - now using separate UserDetail page */}

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

export default Users;
