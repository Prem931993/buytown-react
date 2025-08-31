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
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import axios from 'axios';

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone_no: '',
    password: '',
    address: '',
    gstin: '',
    profile_photo: null,
    license: null,
    status: 'active',
    role: 'user',
  });
  const [filePreviews, setFilePreviews] = useState({
    profile_photo: null,
    license: null,
  });
  const [showPassword, setShowPassword] = useState(false);
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
          // In a real implementation, this would be a GET request
          // Using POST here to match the backend API pattern
          const response = await axios.get(`/users/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          const userData = response.data;

          setFormData({
            firstname: userData.firstname || '',
            lastname: userData.lastname || '',
            email: userData.email || '',
            phone_no: userData.phone_no || '',
            password: '', // Don't populate password for security reasons
            address: userData.address || '',
            gstin: userData.gstin || '',
            profile_photo: userData.profile_photo || null,
            license: userData.license || null,
            role: userData.role_id ? roleIdToRole(userData.role_id) : 'user',
            status: userData.status ? statusBoolToString(userData.status) : 'active',
          });
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'Failed to load user details',
            severity: 'error',
          });

          // Mock data for demonstration if API fails
          if (process.env.NODE_ENV === 'development') {
            setFormData({
              firstname: 'John',
              lastname: 'Doe',
              email: 'john.doe@example.com',
              phone_no: '1234567890',
              password: '',
              role: 'user',
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

  // Helper functions to convert role_id and status to string values
  const roleIdToRole = (role_id) => {
    switch (role_id) {
      case 1:
        return 'admin';
      case 3:
        return 'user';
      case 4:
        return 'delivery_person';
      default:
        return 'user';
    }
  };

  const statusBoolToString = (status) => {
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    }
    return status;
  };

  const roleToRoleId = (role) => {
    switch (role) {
      case 'admin':
        return 1;
      case 'user':
        return 3;
      case 'delivery_person':
        return 4;
      default:
        return 3;
    }
  };

  const statusStringToBool = (status) => {
    switch (status) {
      case 'active':
        return true;
      case 'inactive':
        return false;
      case 'suspended':
        return false; // You might want to handle suspended differently
      default:
        return true;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (fieldName) => (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB for profile photos, 10MB for licenses)
      const maxSize = fieldName === 'profile_photo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setSnackbar({
          open: true,
          message: `File size too large. Maximum size is ${fieldName === 'profile_photo' ? '5MB' : '10MB'}`,
          severity: 'error',
        });
        return;
      }

      // Validate file type
      const allowedTypes = fieldName === 'profile_photo'
        ? ['image/jpeg', 'image/jpg', 'image/png']
        : ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: `Invalid file type. ${fieldName === 'profile_photo' ? 'Only JPEG, JPG, PNG allowed' : 'Only JPEG, JPG, PNG, PDF allowed'}`,
          severity: 'error',
        });
        return;
      }

      setFormData({
        ...formData,
        [fieldName]: file,
      });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews({
            ...filePreviews,
            [fieldName]: e.target.result,
          });
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews({
          ...filePreviews,
          [fieldName]: null,
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.email && !formData.phone_no) {
        setSnackbar({
          open: true,
          message: 'Please provide either email or phone number',
          severity: 'error',
        });
        return;
      }

      // Password is required for admin role on creation
      if (!isEditMode && !formData.password && formData.role === 'admin') {
        setSnackbar({
          open: true,
          message: 'Password is required for admin role',
          severity: 'error',
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        setSnackbar({
          open: true,
          message: 'Please enter a valid email address',
          severity: 'error',
        });
        return;
      }

      setLoading(true);

      if (isEditMode) {
        // Update existing user
        // Remove password if it's empty (user didn't change it)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }

        // Convert role and status to database format
        updateData.role_id = roleToRoleId(updateData.role);
        updateData.status = statusStringToBool(updateData.status);
        delete updateData.role; // Remove the string role field

        // Check if we have files to upload
        const hasFiles = updateData.profile_photo instanceof File || updateData.license instanceof File;

        if (hasFiles) {
          // Use FormData for file uploads
          const formDataToSend = new FormData();
          for (const key in updateData) {
            if (updateData[key] !== null && updateData[key] !== undefined && updateData[key] !== '') {
              if (key === 'profile_photo' || key === 'license') {
                if (updateData[key] instanceof File) {
                  formDataToSend.append(key, updateData[key], updateData[key].name);
                }
              } else {
                formDataToSend.append(key, updateData[key]);
              }
            }
          }

          await axios.put(`/users/${id}`, formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        } else {
          // No files, send as JSON
          await axios.put(`/users/${id}`, updateData, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
        }

        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success',
        });
      } else {
        // Create new user (register)
        // Prepare form data for submission
        const submitData = new FormData();
        for (const key in formData) {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            if (key === 'profile_photo' || key === 'license') {
              submitData.append(key, formData[key], formData[key].name);
            } else {
              submitData.append(key, formData[key]);
            }
          }
        }

        await axios.post('/users', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSnackbar({
          open: true,
          message: 'User added successfully',
          severity: 'success',
        });

        // Redirect to the user list after a short delay
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to save user',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setLoading(true);

      // Fix: Use a more robust approach to construct the API URL
      // If axios.defaults.baseURL is not set, use a default value
      const baseUrl = axios.defaults.baseURL;
      const deleteUrl = `${baseUrl}/users/${id}`;

      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success',
      });

      // Redirect to the user list after a short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete user',
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
              {isEditMode ? 'Edit User' : 'Add New User'}
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Dashboard
              </Link>
              <Link color="inherit" href="/users" onClick={(e) => { e.preventDefault(); navigate('/users'); }}>
                Users
              </Link>
              <Typography color="text.primary">{isEditMode ? 'Edit User' : 'Add User'}</Typography>
            </Breadcrumbs>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/users')}
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
              {loading ? 'Saving...' : 'Save User'}
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
                {/* First Name and Last Name in single row */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>

                {/* Email separate */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>

                {/* Phone separate */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone_no"
                    value={formData.phone_no}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>

                {/* Password */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Address separate */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>

                {/* GSTIN separate */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="GSTIN Number"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                </Grid>

                {/* Role and Status in single row */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Role</InputLabel>
                    <Select
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="delivery_person">Delivery Person</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
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
                      <MenuItem value="suspended">Suspended</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Profile Photo Upload - Full width */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Profile Photo
                    </Typography>
                    <input
                      accept="image/jpeg,image/jpg,image/png"
                      style={{ display: 'none' }}
                      id="profile-photo-upload"
                      type="file"
                      onChange={handleFileChange('profile_photo')}
                    />
                    <label htmlFor="profile-photo-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        fullWidth
                        sx={{
                          py: 2,
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            borderColor: 'primary.dark',
                          }
                        }}
                      >
                        {formData.profile_photo instanceof File
                          ? formData.profile_photo.name
                          : (formData.profile_photo ? 'Change Profile Photo' : 'Select Profile Photo')
                        }
                      </Button>
                    </label>

                    {/* Display existing profile photo or preview */}
                    {(filePreviews.profile_photo || (formData.profile_photo && !(formData.profile_photo instanceof File))) && (
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <img
                          src={filePreviews.profile_photo ||
                                (formData.profile_photo && !(formData.profile_photo instanceof File)
                                  ? (formData.profile_photo.startsWith('http')
                                      ? formData.profile_photo
                                      : (() => {
                                          // Construct base URL without /api/v1 for static files
                                          const baseURL = axios.defaults.baseURL || 'http://localhost:3000/api/v1';
                                          const baseWithoutApi = baseURL.replace('/api/v1', '').replace('/api', '');
                                          return `${baseWithoutApi}/uploads/${formData.profile_photo}`;
                                        })())
                                  : null)}
                          alt="Profile Photo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            borderRadius: 8,
                            border: '1px solid #ddd',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Max 5MB. JPEG, JPG, PNG only.
                    </Typography>
                  </Box>
                </Grid>

                {/* License Upload - Only for delivery_person role - Full width */}
                {formData.role === 'delivery_person' && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        License Document *
                      </Typography>
                      <input
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        style={{ display: 'none' }}
                        id="license-upload"
                        type="file"
                        onChange={handleFileChange('license')}
                      />
                      <label htmlFor="license-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                          sx={{
                            py: 2,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              borderColor: 'primary.dark',
                            }
                          }}
                        >
                          {formData.license instanceof File
                            ? formData.license.name
                            : (formData.license ? 'Change License Document' : 'Select License Document')
                          }
                        </Button>
                      </label>

                      {/* Display existing license or preview */}
                      {(filePreviews.license || (formData.license && !(formData.license instanceof File))) && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          {formData.license && !(formData.license instanceof File) && formData.license.toLowerCase().endsWith('.pdf') ? (
                            <Box sx={{
                              p: 2,
                              border: '1px solid #ddd',
                              borderRadius: 1,
                              backgroundColor: '#f5f5f5'
                            }}>
                              <Typography variant="body2" color="text.secondary">
                                📄 PDF Document: {formData.license}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={() => {
                                  const url = formData.license.startsWith('http')
                                    ? formData.license
                                    : (() => {
                                        // Construct base URL without /api/v1 for static files
                                        const baseURL = axios.defaults.baseURL || 'http://localhost:3000/api/v1';
                                        const baseWithoutApi = baseURL.replace('/api/v1', '').replace('/api', '');
                                        return `${baseWithoutApi}/uploads/${formData.license}`;
                                      })();
                                  window.open(url, '_blank');
                                }}
                              >
                                View PDF
                              </Button>
                            </Box>
                          ) : (
                            <img
                              src={filePreviews.license ||
                                    (formData.license && !(formData.license instanceof File)
                                      ? (formData.license.startsWith('http')
                                          ? formData.license
                                          : (() => {
                                              // Construct base URL without /api/v1 for static files
                                              const baseURL = axios.defaults.baseURL || 'http://localhost:3000/api/v1';
                                              const baseWithoutApi = baseURL.replace('/api/v1', '').replace('/api', '');
                                              return `${baseWithoutApi}/uploads/${formData.license}`;
                                            })())
                                      : null)}
                              alt="License Document"
                              style={{
                                maxWidth: '100%',
                                maxHeight: 200,
                                borderRadius: 8,
                                border: '1px solid #ddd',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                        </Box>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        Max 10MB. JPEG, JPG, PNG, PDF allowed.
                      </Typography>
                    </Box>
                  </Grid>
                )}
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

export default UserDetail;
