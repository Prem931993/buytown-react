import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService.js';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Refresh,
  Print,
} from '@mui/icons-material';





function Orders() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);


  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search term change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Handle close order details dialog
  const handleCloseOrderDetails = () => {
    setOpenOrderDetails(false);
  };

  // Handle tab change in order details
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.orders.getAll();
      // API returns { success: true, orders: [...] }, so access response.orders
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to empty array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await adminService.orders.getById(orderId);
      // API returns { success: true, order: {...} }, so access response.order
      setOrderDetails(response.order || null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderDetails(null);
    }
  };

  // Handle view order details
  const handleViewOrderDetails = async (order) => {
    setSelectedOrder(order);
    setOpenOrderDetails(true);
    await fetchOrderDetails(order.id);
  };



  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.id?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
        return 'info';
      case 'Processing':
        return 'warning';
      case 'Pending':
        return 'secondary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle fontSize="small" />;
      case 'Shipped':
        return <LocalShipping fontSize="small" />;
      case 'Processing':
        return <Refresh fontSize="small" />;
      case 'Pending':
        return <ShoppingCart fontSize="small" />;
      case 'Cancelled':
        return <Cancel fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Orders Management
      </Typography>

      {/* Filters and Search */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
        >
          More Filters
        </Button>
      </Box>

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading orders...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" fontWeight={600}>
                          {order.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status}
                          size="small"
                          color={getStatusColor(order.status)}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewOrderDetails(order)}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: 'error.main' }}
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
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Order Details Dialog */}
      <Dialog
        open={openOrderDetails}
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Order Details: {orderDetails?.id || selectedOrder?.id}</Typography>
            <Box>
              <Button
                startIcon={<Print />}
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              >
                Print
              </Button>
              <Button
                variant="contained"
                size="small"
              >
                Update Status
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Order Info" />
            <Tab label="Timeline" />
          </Tabs>

          {tabValue === 0 && (
            <>
              {/* Order Summary */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Customer Information
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {orderDetails?.customer?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {orderDetails?.customer?.email || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {orderDetails?.customer?.phone || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Order Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Order Date:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {orderDetails?.orderDate || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Status:</Typography>
                        <Chip
                          label={orderDetails?.status || 'N/A'}
                          size="small"
                          color={getStatusColor(orderDetails?.status)}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Payment Method:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {orderDetails?.paymentMethod || 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Payment Status:</Typography>
                        <Chip
                          label={orderDetails?.paymentStatus || 'N/A'}
                          size="small"
                          color="success"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Shipping Address
                      </Typography>
                      <Typography variant="body2">
                        {orderDetails?.shippingAddress?.street || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {orderDetails?.shippingAddress?.city || 'N/A'}, {orderDetails?.shippingAddress?.state || 'N/A'} {orderDetails?.shippingAddress?.zip || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {orderDetails?.shippingAddress?.country || 'N/A'}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Shipping Method:</strong> {orderDetails?.shippingMethod || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tracking Number:</strong> {orderDetails?.trackingNumber || 'N/A'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Billing Address
                      </Typography>
                      <Typography variant="body2">
                        {orderDetails?.billingAddress?.street || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {orderDetails?.billingAddress?.city || 'N/A'}, {orderDetails?.billingAddress?.state || 'N/A'} {orderDetails?.billingAddress?.zip || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {orderDetails?.billingAddress?.country || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Order Items */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Order Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(orderDetails?.items || []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell align="right">${item.price?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.total?.toFixed(2) || '0.00'}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          Subtotal:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          ${orderDetails?.subtotal?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="body2">
                          Shipping:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${orderDetails?.shippingCost?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {(orderDetails?.tax || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="body2">
                            Tax:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${orderDetails?.tax?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {(orderDetails?.discount || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="body2">
                            Discount:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: 'error.main' }}>
                            -${orderDetails?.discount?.toFixed(2) || '0.00'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} />
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Total:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight={600}>
                          ${orderDetails?.total?.toFixed(2) || '0.00'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              {(orderDetails?.timeline || []).map((event, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      mt: 0.5,
                      position: 'relative',
                      '&::after': index !== (orderDetails?.timeline || []).length - 1 ? {
                        content: '""',
                        position: 'absolute',
                        top: 16,
                        left: 7,
                        width: 2,
                        height: 'calc(100% + 8px)',
                        bgcolor: 'divider',
                      } : {},
                    }}
                  />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {event.status}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.date}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {event.note}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Orders;