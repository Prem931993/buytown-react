import React, { useState } from 'react';
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

// Mock data for orders
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    date: '2023-06-15',
    total: 129.99,
    status: 'Delivered',
    items: 3,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    date: '2023-06-14',
    total: 79.50,
    status: 'Processing',
    items: 2,
    paymentMethod: 'PayPal',
    shippingMethod: 'Standard',
  },
  {
    id: 'ORD-003',
    customer: 'Robert Johnson',
    date: '2023-06-13',
    total: 249.99,
    status: 'Shipped',
    items: 1,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express',
  },
  {
    id: 'ORD-004',
    customer: 'Emily Davis',
    date: '2023-06-12',
    total: 45.00,
    status: 'Cancelled',
    items: 1,
    paymentMethod: 'Debit Card',
    shippingMethod: 'Standard',
  },
  {
    id: 'ORD-005',
    customer: 'Michael Wilson',
    date: '2023-06-11',
    total: 189.95,
    status: 'Delivered',
    items: 4,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express',
  },
  {
    id: 'ORD-006',
    customer: 'Sarah Brown',
    date: '2023-06-10',
    total: 59.99,
    status: 'Processing',
    items: 1,
    paymentMethod: 'PayPal',
    shippingMethod: 'Standard',
  },
  {
    id: 'ORD-007',
    customer: 'David Miller',
    date: '2023-06-09',
    total: 299.99,
    status: 'Pending',
    items: 2,
    paymentMethod: 'Credit Card',
    shippingMethod: 'Express',
  },
];

// Order details mock data
const mockOrderDetails = {
  id: 'ORD-001',
  customer: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
  },
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
  billingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
  },
  orderDate: '2023-06-15 14:30:45',
  status: 'Delivered',
  paymentMethod: 'Credit Card',
  paymentStatus: 'Paid',
  shippingMethod: 'Express',
  trackingNumber: 'TRK12345678',
  subtotal: 119.99,
  shippingCost: 10.00,
  tax: 0.00,
  discount: 0.00,
  total: 129.99,
  items: [
    {
      id: 1,
      name: 'Smartphone X',
      sku: 'SMX-001',
      price: 99.99,
      quantity: 1,
      total: 99.99,
    },
    {
      id: 2,
      name: 'Phone Case',
      sku: 'PC-101',
      price: 10.00,
      quantity: 2,
      total: 20.00,
    },
  ],
  timeline: [
    {
      status: 'Order Placed',
      date: '2023-06-15 14:30:45',
      note: 'Order was placed by customer',
    },
    {
      status: 'Payment Confirmed',
      date: '2023-06-15 14:35:12',
      note: 'Payment was confirmed',
    },
    {
      status: 'Processing',
      date: '2023-06-16 09:12:33',
      note: 'Order is being processed',
    },
    {
      status: 'Shipped',
      date: '2023-06-17 11:45:20',
      note: 'Order has been shipped via Express',
    },
    {
      status: 'Delivered',
      date: '2023-06-18 15:22:10',
      note: 'Order was delivered to customer',
    },
  ],
};

function Orders() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabValue, setTabValue] = useState(0);

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

  // Handle view order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOpenOrderDetails(true);
  };

  // Handle close order details dialog
  const handleCloseOrderDetails = () => {
    setOpenOrderDetails(false);
  };

  // Handle tab change in order details
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter orders based on search term and status filter
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
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
              {filteredOrders
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
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status)}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        className= {selectedOrder}
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
                ))}
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
            <Typography variant="h6">Order Details: {mockOrderDetails.id}</Typography>
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
                        <strong>Name:</strong> {mockOrderDetails.customer.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {mockOrderDetails.customer.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {mockOrderDetails.customer.phone}
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
                          {mockOrderDetails.orderDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Status:</Typography>
                        <Chip
                          label={mockOrderDetails.status}
                          size="small"
                          color={getStatusColor(mockOrderDetails.status)}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Payment Method:</Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {mockOrderDetails.paymentMethod}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Payment Status:</Typography>
                        <Chip
                          label={mockOrderDetails.paymentStatus}
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
                        {mockOrderDetails.shippingAddress.street}
                      </Typography>
                      <Typography variant="body2">
                        {mockOrderDetails.shippingAddress.city}, {mockOrderDetails.shippingAddress.state} {mockOrderDetails.shippingAddress.zip}
                      </Typography>
                      <Typography variant="body2">
                        {mockOrderDetails.shippingAddress.country}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Shipping Method:</strong> {mockOrderDetails.shippingMethod}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Tracking Number:</strong> {mockOrderDetails.trackingNumber}
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
                        {mockOrderDetails.billingAddress.street}
                      </Typography>
                      <Typography variant="body2">
                        {mockOrderDetails.billingAddress.city}, {mockOrderDetails.billingAddress.state} {mockOrderDetails.billingAddress.zip}
                      </Typography>
                      <Typography variant="body2">
                        {mockOrderDetails.billingAddress.country}
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
                    {mockOrderDetails.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">${item.total.toFixed(2)}</TableCell>
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
                          ${mockOrderDetails.subtotal.toFixed(2)}
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
                          ${mockOrderDetails.shippingCost.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {mockOrderDetails.tax > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="body2">
                            Tax:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${mockOrderDetails.tax.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {mockOrderDetails.discount > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} />
                        <TableCell align="right">
                          <Typography variant="body2">
                            Discount:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ color: 'error.main' }}>
                            -${mockOrderDetails.discount.toFixed(2)}
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
                          ${mockOrderDetails.total.toFixed(2)}
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
              {mockOrderDetails.timeline.map((event, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 3 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      mt: 0.5,
                      position: 'relative',
                      '&::after': index !== mockOrderDetails.timeline.length - 1 ? {
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