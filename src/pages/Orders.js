import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Alert,
  Snackbar,
  DialogContentText,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  ShoppingCart,
  LocalShipping,
  CheckCircle,
  Cancel,
  Refresh,
  ThumbUp,
  ThumbDown,
  Person,
} from '@mui/icons-material';





function Orders() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New state variables for approve/reject functionality
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedOrderForAction, setSelectedOrderForAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState('');
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


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

  // Handle view order details
  const handleViewOrderDetails = (order) => {
    navigate(`/orders/${order.id}`);
  };

  // Handle approve order
  const handleApproveOrder = (order) => {
    setSelectedOrderForAction(order);
    setOpenApproveDialog(true);
  };

  // Handle reject order
  const handleRejectOrder = (order) => {
    setSelectedOrderForAction(order);
    setOpenRejectDialog(true);
  };

  // Handle assign delivery person
  const handleAssignDeliveryPerson = (order) => {
    setSelectedOrderForAction(order);
    setOpenAssignDialog(true);
    fetchDeliveryPersons();
  };

  // Fetch delivery persons
  const fetchDeliveryPersons = async () => {
    try {
      const response = await adminService.users.getAll();
      const deliveryPersons = response.users.filter(user => user.role === 'delivery_person');
      setDeliveryPersons(deliveryPersons);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
    }
  };

  // Submit approve order
  const handleSubmitApprove = async () => {
    try {
      const response = await adminService.orders.approve(selectedOrderForAction.id, deliveryPersonId, parseFloat(deliveryDistance));
      if (response.success) {
        setSnackbar({ open: true, message: 'Order approved successfully!', severity: 'success' });
        setOpenApproveDialog(false);
        fetchOrders();
        setDeliveryPersonId('');
        setDeliveryDistance('');
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to approve order', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error approving order', severity: 'error' });
    }
  };

  // Submit reject order
  const handleSubmitReject = async () => {
    try {
      const response = await adminService.orders.reject(selectedOrderForAction.id, rejectionReason);
      if (response.success) {
        setSnackbar({ open: true, message: 'Order rejected successfully!', severity: 'success' });
        setOpenRejectDialog(false);
        fetchOrders();
        setRejectionReason('');
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to reject order', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error rejecting order', severity: 'error' });
    }
  };

  // Submit assign delivery person
  const handleSubmitAssign = async () => {
    try {
      const response = await adminService.orders.assignDeliveryPerson(selectedOrderForAction.id, deliveryPersonId, parseFloat(deliveryDistance));
      if (response.success) {
        setSnackbar({ open: true, message: 'Delivery person assigned successfully!', severity: 'success' });
        setOpenAssignDialog(false);
        fetchOrders();
        setDeliveryPersonId('');
        setDeliveryDistance('');
      } else {
        setSnackbar({ open: true, message: response.error || 'Failed to assign delivery person', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Error assigning delivery person', severity: 'error' });
    }
  };

  // Handle close dialogs
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setDeliveryPersonId('');
    setDeliveryDistance('');
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason('');
  };

  const handleCloseAssignDialog = () => {
    setOpenAssignDialog(false);
    setDeliveryPersonId('');
    setDeliveryDistance('');
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
                <TableCell>Order Number</TableCell>
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
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Loading orders...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
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
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {order.order_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>₹{order.total?.toFixed(2) || '0.00'}</TableCell>
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
                        {order.status === 'Pending' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleApproveOrder(order)}
                              sx={{ color: 'success.main' }}
                            >
                              <ThumbUp fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRejectOrder(order)}
                              sx={{ color: 'error.main' }}
                            >
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {(order.status === 'Approved' || order.status === 'Processing') && (
                          <IconButton
                            size="small"
                            onClick={() => handleAssignDeliveryPerson(order)}
                            sx={{ color: 'info.main' }}
                          >
                            <Person fontSize="small" />
                          </IconButton>
                        )}
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



      {/* Approve Order Dialog */}
      <Dialog
        open={openApproveDialog}
        onClose={handleCloseApproveDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Approve order #{selectedOrderForAction?.id}? This will change the order status to "Approved".
          </DialogContentText>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="delivery-person-label">Assign Delivery Person</InputLabel>
            <Select
              labelId="delivery-person-label"
              value={deliveryPersonId}
              label="Assign Delivery Person"
              onChange={(e) => setDeliveryPersonId(e.target.value)}
            >
              {deliveryPersons.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name} ({person.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Delivery Distance (km)"
            type="number"
            value={deliveryDistance}
            onChange={(e) => setDeliveryDistance(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitApprove}
            variant="contained"
            color="success"
            disabled={!deliveryPersonId || !deliveryDistance}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog
        open={openRejectDialog}
        onClose={handleCloseRejectDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Reject order #{selectedOrderForAction?.id}? This will change the order status to "Rejected".
          </DialogContentText>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitReject}
            variant="contained"
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Delivery Person Dialog */}
      <Dialog
        open={openAssignDialog}
        onClose={handleCloseAssignDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Delivery Person</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Assign a delivery person to order #{selectedOrderForAction?.id}.
          </DialogContentText>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="assign-delivery-person-label">Select Delivery Person</InputLabel>
            <Select
              labelId="assign-delivery-person-label"
              value={deliveryPersonId}
              label="Select Delivery Person"
              onChange={(e) => setDeliveryPersonId(e.target.value)}
            >
              {deliveryPersons.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.name} ({person.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Delivery Distance (km)"
            type="number"
            value={deliveryDistance}
            onChange={(e) => setDeliveryDistance(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitAssign}
            variant="contained"
            color="primary"
            disabled={!deliveryPersonId || !deliveryDistance}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Orders;