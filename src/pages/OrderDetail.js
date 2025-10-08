import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Cancel,
  Print,
  Person,
  LocationOn,
  MonetizationOn,
  PictureAsPdf,
  AssignmentTurnedIn,
} from '@mui/icons-material';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculated totals state
  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Delivery assignment state
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [deliveryDistance, setDeliveryDistance] = useState('');
  const [calculatedDeliveryCharges, setCalculatedDeliveryCharges] = useState(0);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [error, setError] = useState('');

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // PDF download state
  const [pdfLoading, setPdfLoading] = useState({
    invoice: false,
    confirmation: false,
  });

  const calculateDeliveryCharges = useCallback(async (vehicleId, distance) => {
    if (!vehicleId || !distance || isNaN(distance) || Number(distance) <= 0) {
      setCalculatedDeliveryCharges(0);
      return;
    }

    try {
      // Use the new API endpoint to calculate delivery charges based on vehicle
      const response = await adminService.orders.calculateDeliveryCharge(orderDetails.id, vehicleId);

      if (response.success) {
        setCalculatedDeliveryCharges(response.delivery_charge);
      } else {
        setCalculatedDeliveryCharges(0);
        console.error('Failed to calculate delivery charges:', response.error);
      }
    } catch (error) {
      console.error('Error calculating delivery charges:', error);
      setCalculatedDeliveryCharges(0);
    }
  }, [orderDetails?.id]);

  useEffect(() => {
    fetchOrderDetails();
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // When orderDetails or selectedDeliveryPerson or deliveryDistance changes, update deliveryDistance state and recalc charges
  useEffect(() => {
    if (orderDetails && orderDetails.deliveryDistance) {
      setDeliveryDistance(orderDetails.deliveryDistance.toString());
    }
  }, [orderDetails]);

  useEffect(() => {
    const dist = deliveryDistance && !isNaN(Number(deliveryDistance)) ? Number(deliveryDistance) : 0;
    if (selectedVehicle && dist > 0) {
      calculateDeliveryCharges(selectedVehicle, dist);
    } else {
      setCalculatedDeliveryCharges(0);
    }
  }, [selectedVehicle, deliveryDistance, calculateDeliveryCharges]);
  
  // Calculate subtotal, tax, discount, and total from orderDetails.items and other fields
  useEffect(() => {
    if (orderDetails && orderDetails.items) {
      const subtotalCalc = orderDetails.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const taxCalc = orderDetails.items.reduce((acc, item) => acc + (item.tax_amount || 0), 0);
      const discountCalc = orderDetails.discount || 0;
      const deliveryChargesCalc = (orderDetails.deliveryCharges && orderDetails.deliveryCharges > 0) ? orderDetails.deliveryCharges : calculatedDeliveryCharges;

      const totalCalc = subtotalCalc + taxCalc + deliveryChargesCalc - discountCalc;

      setCalculatedSubtotal(subtotalCalc);
      setCalculatedTax(taxCalc);
      setCalculatedDiscount(discountCalc);
      setCalculatedTotal(totalCalc);
    }
  }, [orderDetails, calculatedDeliveryCharges]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.orders.getById(id);
      setOrderDetails(response.order || null);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'Completed':
      case 'Delivered':
        return 'success';
      case 'In transit':
      case 'Shipped':
        return 'info';
      case 'processed':
      case 'approved':
      case 'Processing':
        return 'warning';
      case 'awaiting_confirmation':
      case 'Pending':
        return 'secondary';
      case 'cancelled':
      case 'rejected':
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to determine if "Mark as Complete" button should be shown
  const shouldShowMarkCompleteButton = (status) => {
    const completableStatuses = ['processed', 'approved', 'In transit', 'Shipped', 'Processing'];
    return completableStatuses.includes(status);
  };

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const response = await adminService.vehicles.getAll();
      // Handle both response structures: direct array or wrapped in vehicles property
      const vehiclesData = Array.isArray(response) ? response : (response.vehicles || []);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleVehicleChange = (event) => {
    const vehicleId = event.target.value;
    setSelectedVehicle(vehicleId);
    setSelectedDeliveryPerson('');
    setCalculatedDeliveryCharges(0);

    // Filter delivery persons based on selected vehicle
    if (vehicleId) {
      const selectedVehicleData = vehicles.find(v => v.id === vehicleId);
      if (selectedVehicleData && selectedVehicleData.deliveryPersons) {
        setDeliveryPersons(selectedVehicleData.deliveryPersons);

        // If delivery persons exist, preselect the first one and calculate charges
        if (selectedVehicleData.deliveryPersons.length > 0) {
          const firstDeliveryPerson = selectedVehicleData.deliveryPersons[0];
          setSelectedDeliveryPerson(firstDeliveryPerson.id);

          // Use deliveryDistance state or fallback to orderDetails.deliveryDistance
          const dist = deliveryDistance && !isNaN(Number(deliveryDistance)) ? Number(deliveryDistance) : (orderDetails?.deliveryDistance || 0);
          if (dist > 0) {
            calculateDeliveryCharges(vehicleId, dist);
          } else {
            setCalculatedDeliveryCharges(0);
          }
        }
      } else {
        setDeliveryPersons([]);
        setSelectedDeliveryPerson('');
        setCalculatedDeliveryCharges(0);
      }
    } else {
      setDeliveryPersons([]);
      setSelectedDeliveryPerson('');
      setCalculatedDeliveryCharges(0);
    }
  };

  const handleDeliveryPersonChange = (event) => {
    const deliveryPersonId = event.target.value;
    setSelectedDeliveryPerson(deliveryPersonId);

    // Calculate delivery charges when delivery person is selected
    // Use deliveryDistance from state or from orderDetails
    const effectiveDistance = deliveryDistance && Number(deliveryDistance) > 0
      ? Number(deliveryDistance)
      : orderDetails?.deliveryDistance || 0;

    if (deliveryPersonId && effectiveDistance > 0) {
      calculateDeliveryCharges(selectedVehicle, effectiveDistance);
    } else {
      setCalculatedDeliveryCharges(0);
    }
  };



  const handleOrderAction = async (action) => {
    try {
      setActionLoading(true);
      let response;
      // Use deliveryDistance from orderDetails if not set in state
      const effectiveDeliveryDistance = deliveryDistance && Number(deliveryDistance) > 0
        ? Number(deliveryDistance)
        : orderDetails?.deliveryDistance || 0;

      switch (action) {
        case 'approve':
          if (!selectedVehicle) {
            setError('Please select a vehicle before approving the order.');
            setActionLoading(false);
            return;
          }
          if (!selectedDeliveryPerson) {
            setError('Please select a delivery person before approving the order.');
            setActionLoading(false);
            return;
          }
          if (!effectiveDeliveryDistance || isNaN(effectiveDeliveryDistance) || effectiveDeliveryDistance <= 0) {
            setError('Please enter a valid delivery distance in kilometers.');
            setActionLoading(false);
            return;
          }
          setError('');
          response = await adminService.orders.approve(id, selectedVehicle, effectiveDeliveryDistance, selectedDeliveryPerson);
          break;
        case 'reject':
          if (!rejectReason.trim()) {
            setSnackbar({
              open: true,
              message: 'Please provide a reason for rejection.',
              severity: 'error',
            });
            setActionLoading(false);
            return;
          }
          response = await adminService.orders.reject(id, rejectReason);
          setRejectDialogOpen(false);
          setRejectReason('');
          break;
        case 'assign_delivery':
          if (!selectedDeliveryPerson) {
            setError('Please select a delivery person before assigning.');
            setActionLoading(false);
            return;
          }
          if (!effectiveDeliveryDistance || isNaN(effectiveDeliveryDistance) || effectiveDeliveryDistance <= 0) {
            setError('Please enter a valid delivery distance in kilometers.');
            setActionLoading(false);
            return;
          }
          setError('');
          response = await adminService.orders.assignDeliveryPerson(id, selectedDeliveryPerson, effectiveDeliveryDistance);
          break;
        case 'mark_delivered':
          response = await adminService.orders.updateStatus(id, 'Delivered');
          break;
        case 'mark_completed':
          response = await adminService.orders.markOrderCompleted(id);
          break;
        default:
          setActionLoading(false);
          return;
      }

      if (response && response.success) {
        setSnackbar({
          open: true,
          message: `Order ${action.replace('_', ' ')} successfully`,
          severity: 'success',
        });
        // Refresh order details
        await fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: `Failed to ${action.replace('_', ' ')} order`,
          severity: 'error',
        });
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      setSnackbar({
        open: true,
        message: `Failed to ${action.replace('_', ' ')} order`,
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // PDF download handlers
  const handleInvoicePDFDownload = async () => {
    try {
      setPdfLoading(prev => ({ ...prev, invoice: true }));

      // Call generateInvoicePDF which returns the PDF blob directly
      const blob = await adminService.orders.generateInvoicePDF(id);

      if (blob) {
        const url = window.URL.createObjectURL(blob);

        // Generate filename that matches backend
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `invoice_${orderDetails?.order_number || id}_${timestamp}.pdf`;

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setSnackbar({
          open: true,
          message: 'Invoice PDF downloaded successfully',
          severity: 'success',
        });
      } else {
        throw new Error('Failed to download invoice PDF');
      }
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download invoice PDF',
        severity: 'error',
      });
    } finally {
      setPdfLoading(prev => ({ ...prev, invoice: false }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Loading order details...
        </Typography>
      </Box>
    );
  }

  if (!orderDetails) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="error">
          Order not found.
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 3, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: 'primary.main' }}>
          Order Details: {orderDetails.order_number || orderDetails.id}
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => window.print()}
            sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.50' } }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={pdfLoading.invoice ? <CircularProgress size={20} /> : <PictureAsPdf />}
            onClick={handleInvoicePDFDownload}
            disabled={pdfLoading.invoice}
            sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'grey.50' } }}
          >
            {pdfLoading.invoice ? 'Downloading...' : 'Invoice PDF'}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate('/orders')}
            sx={{ ml: 'auto' }}
          >
            Back to Orders
          </Button>
          {(orderDetails.status === 'Pending' || orderDetails.status === 'awaiting_confirmation') && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleOrderAction('approve')}
                disabled={actionLoading}
                sx={{ boxShadow: 2 }}
              >
                {actionLoading ? 'Approving...' : 'Approve Order'}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={handleRejectClick}
                disabled={actionLoading}
                sx={{ boxShadow: 2 }}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Order'}
              </Button>
            </>
          )}
          {orderDetails.status === 'Processing' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<LocalShipping />}
              onClick={() => handleOrderAction('assign_delivery')}
              disabled={actionLoading}
              sx={{ boxShadow: 2 }}
            >
              {actionLoading ? 'Assigning...' : 'Assign Delivery Person'}
            </Button>
          )}
          {orderDetails.status === 'Shipped' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => handleOrderAction('mark_delivered')}
                disabled={actionLoading}
                sx={{ mr: 2, boxShadow: 2 }}
              >
                {actionLoading ? 'Marking...' : 'Mark as Delivered'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssignmentTurnedIn />}
                onClick={() => handleOrderAction('mark_completed')}
                disabled={actionLoading}
                sx={{ boxShadow: 2 }}
              >
                {actionLoading ? 'Completing...' : 'Mark as Complete'}
              </Button>
            </>
          )}
          {shouldShowMarkCompleteButton(orderDetails.status) && orderDetails.status !== 'Shipped' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentTurnedIn />}
              onClick={() => handleOrderAction('mark_completed')}
              disabled={actionLoading}
              sx={{ boxShadow: 2 }}
            >
              {actionLoading ? 'Completing...' : 'Mark as Complete'}
            </Button>
          )}
        </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Order Info" />
        <Tab label="Timeline" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Customer Information
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {orderDetails.customer?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {orderDetails.customer?.email || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {orderDetails.customer?.phone || 'N/A'}
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
                    <Typography variant="body2">Order ID:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {orderDetails.id || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Order Number:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {orderDetails.order_number || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Order Date:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {orderDetails.orderDate || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Status:</Typography>
                    <Chip
                      label={orderDetails.status || 'N/A'}
                      size="small"
                      color={getStatusColor(orderDetails.status)}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Payment Method:</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {orderDetails.paymentMethod || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Payment Status:</Typography>
                    <Chip label={orderDetails.paymentStatus || 'N/A'} size="small" color="success" />
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
                  <Typography variant="body2">{orderDetails.shippingAddress?.street || 'N/A'}</Typography>
                  <Typography variant="body2">
                    {orderDetails.shippingAddress?.city || 'N/A'},{' '}
                    {orderDetails.shippingAddress?.state || 'N/A'} {orderDetails.shippingAddress?.zip || 'N/A'}
                  </Typography>
                  <Typography variant="body2">{orderDetails.shippingAddress?.country || 'N/A'}</Typography>
                  <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" />
                    <strong>Delivery Distance:</strong> {deliveryDistance ? `${deliveryDistance} km` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonetizationOn fontSize="small" />
                    <strong>Delivery Charges:</strong> ₹{orderDetails?.deliveryCharges ? orderDetails.deliveryCharges : calculatedDeliveryCharges.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping fontSize="small" />
                    <strong>Delivery Vehicle:</strong> {orderDetails?.vehicle ? `${orderDetails.vehicle.vehicle_number} (${orderDetails.vehicle.vehicle_type})` : selectedVehicle ? `${vehicles.find(v => v.id === selectedVehicle)?.vehicle_number || 'N/A'} (${vehicles.find(v => v.id === selectedVehicle)?.vehicle_type || 'N/A'})` : 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" />
                    <strong>Delivery Person:</strong> {orderDetails?.deliveryDriver ? orderDetails.deliveryDriver :selectedDeliveryPerson ? deliveryPersons.find(p => p.id === selectedDeliveryPerson)?.name || 'N/A' : 'N/A'}
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
                  <Typography variant="body2">{orderDetails.billingAddress?.street || 'N/A'}</Typography>
                  <Typography variant="body2">
                    {orderDetails.billingAddress?.city || 'N/A'},{' '}
                    {orderDetails.billingAddress?.state || 'N/A'} {orderDetails.billingAddress?.zip || 'N/A'}
                  </Typography>
                  <Typography variant="body2">{orderDetails.billingAddress?.country || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Delivery Assignment Section - Only for awaiting_confirmation status */}
          {(orderDetails.status === 'awaiting_confirmation') && (
            <Card variant="outlined"  sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: 3,
                p: 3,
                width: "100%",
              }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Delivery Assignment (Required for Approval)
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Vehicle</InputLabel>
                      <Select
                        value={selectedVehicle}
                        onChange={handleVehicleChange}
                        disabled={loadingVehicles}
                      >
                        <MenuItem value="">
                          <em>Select a vehicle</em>
                        </MenuItem>
                        {vehicles.map((vehicle) => (
                          <MenuItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicle_type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <FormControl fullWidth>
                      <InputLabel>Select Delivery Person</InputLabel>
                      <Select
                        value={selectedDeliveryPerson}
                        onChange={handleDeliveryPersonChange}
                        disabled={!selectedVehicle || deliveryPersons.length === 0}
                      >
                        <MenuItem value="">
                          <em>Select a delivery person</em>
                        </MenuItem>
                        {deliveryPersons.map((person) => (
                          <MenuItem key={person.id} value={person.id}>
                            {person.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Order Items
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                  <TableCell>Product</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>HSN Code</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Tax Rate</TableCell>
                  <TableCell align="right">Tax Amount</TableCell>
                  <TableCell align="right">Total without Tax</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(orderDetails.items || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.hsn_code || 'N/A'}</TableCell>
                    <TableCell align="right">₹{item.price?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{item.gst_rate ? `${item.gst_rate}%` : '0%'}</TableCell>
                    <TableCell align="right">₹{item.tax_amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell align="right">₹{item.total?.toFixed(2) || '0.00'}</TableCell>
                  </TableRow>
                ))}
              <TableRow>
                <TableCell colSpan={6} />
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>
                    Subtotal:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={500}>
                    ₹{calculatedSubtotal.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
              {orderDetails.tax > 0 && (
                <TableRow>
                  <TableCell colSpan={6} />
                  <TableCell align="right">
                    <Typography variant="body2">Tax:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">₹{calculatedTax.toFixed(2)}</Typography>
                  </TableCell>
                </TableRow>
              )}
                <TableRow>
                  <TableCell colSpan={6} />
                  <TableCell align="right">
                    <Typography variant="body2">Delivery Charges:</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">₹{(orderDetails.deliveryCharges && orderDetails.deliveryCharges > 0) ? orderDetails.deliveryCharges?.toFixed(2) || '0.00' : calculatedDeliveryCharges.toFixed(2)}</Typography>
                  </TableCell>
                </TableRow>
                {orderDetails.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} />
                    <TableCell align="right">
                      <Typography variant="body2">Discount:</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      -₹{calculatedDiscount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={6} />
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight={600}>
                      Total:
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight={600}>
                      ₹{calculatedTotal.toFixed(2)}
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
          {(orderDetails.timeline || []).map((event, index) => (
            <Box key={index} sx={{ display: 'flex', mb: 3 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  mt: 0.5,
                  position: 'relative',
                  '&::after':
                    index !== (orderDetails.timeline || []).length - 1
                      ? {
                          content: '""',
                          position: 'absolute',
                          top: 16,
                          left: 7,
                          width: 2,
                          height: 'calc(100% + 8px)',
                          bgcolor: 'divider',
                        }
                      : {},
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

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={handleRejectDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this order..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => handleOrderAction('reject')}
            color="error"
            variant="contained"
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? 'Rejecting...' : 'Reject Order'}
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
    </Box>
  );
}

export default OrderDetail;
