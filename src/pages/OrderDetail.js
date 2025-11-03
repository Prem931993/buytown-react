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
  IconButton,
  InputAdornment,
  TablePagination,
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
  Edit,
  Delete,
  Add,
  Save,
  Search,
} from '@mui/icons-material';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);

  const [loading, setLoading] = useState(true);

  // Calculated totals state
  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [calculatedDeliveryTax, setCalculatedDeliveryTax] = useState(0);
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

  // Ongoing orders state
  const [ongoingOrders, setOngoingOrders] = useState(0);

  // Item editing state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [productsPage, setProductsPage] = useState(0);
  const [productsRowsPerPage, setProductsRowsPerPage] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);
  const [itemFormData, setItemFormData] = useState({
    product_id: '',
    quantity: 1,
  });
  const [itemLoading, setItemLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const calculateDeliveryCharges = useCallback(async (vehicleId, distance) => {
    if (!vehicleId || !distance || isNaN(distance) || Number(distance) <= 0) {
      setCalculatedDeliveryCharges(0);
      return;
    }

    try {
      // Use the new API endpoint to calculate delivery charges based on vehicle
      const response = await adminService.orders.calculateDeliveryCharge(orderDetails.id, vehicleId, distance);

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

  // Item editing functions
  const fetchAvailableProducts = useCallback(async (search = '', page = 0, rowsPerPage = 10) => {
    try {
      const params = {
        search: search.trim(),
        page: page + 1, // API likely uses 1-based pagination
        limit: rowsPerPage,
      };
      const response = await adminService.products.getAvailableForOrder(id, params);
      const products = response.products || response || [];
      setAvailableProducts(products);
      setTotalProducts(response.pagination?.total_items || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setAvailableProducts([]);
      setTotalProducts(0);
    }
  }, [id]);

  // Fetch products when search term, page, or rows per page changes
  useEffect(() => {
    if (addDialogOpen) {
      fetchAvailableProducts(searchTerm, productsPage, productsRowsPerPage);
    }
  }, [searchTerm, addDialogOpen, fetchAvailableProducts, productsPage, productsRowsPerPage]);

  // Reset page when search term changes
  useEffect(() => {
    setProductsPage(0);
  }, [searchTerm]);


  
  // Calculate subtotal, tax, discount, and total from orderDetails.items and other fields
  useEffect(() => {
    if (orderDetails && orderDetails.items) {
      const subtotalCalc = orderDetails.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const taxCalc = orderDetails.items.reduce((acc, item) => acc + (item.tax_amount || 0), 0);
      const discountCalc = orderDetails.discount || 0;
      const deliveryChargesCalc = (orderDetails.deliveryCharges && orderDetails.deliveryCharges > 0) ? orderDetails.deliveryCharges : calculatedDeliveryCharges;

      // Delivery charges already include 18% GST, so extract the GST portion
      const deliveryBase = deliveryChargesCalc / 1.18;
      const deliveryTaxCalc = deliveryChargesCalc - deliveryBase;

      const totalTax = taxCalc; // includes delivery GST
      const totalCalc = subtotalCalc + deliveryChargesCalc + totalTax - discountCalc;

      setCalculatedSubtotal(subtotalCalc);
      setCalculatedTax(totalTax);
      setCalculatedDeliveryTax(deliveryTaxCalc);
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



  const handleProductSelectFromTable = (product) => {
    setSelectedProduct(product);
    setItemFormData({
      ...itemFormData,
      product_id: product.id,
    });
  };

  const handleEditItem = (item) => {
    setEditingRowId(item.id);
    const qty = parseInt(item.quantity, 10);
    setEditingQuantity(isNaN(qty) ? 1 : Math.max(1, qty));
  };

  const handleSaveInlineEdit = async (itemId) => {
    // Validate quantity
    if (!editingQuantity || isNaN(editingQuantity) || editingQuantity < 1) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid quantity (minimum 1)',
        severity: 'error',
      });
      return;
    }

    try {
      setItemLoading(true);
      const response = await adminService.orders.updateOrderItem(id, itemId, {
        quantity: editingQuantity,
      });

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Item updated successfully',
          severity: 'success',
        });
        setEditingRowId(null);
        setEditingQuantity(1);
        // Refresh order details to update calculations
        await fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to update item',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update item',
        severity: 'error',
      });
    } finally {
      setItemLoading(false);
    }
  };

  const handleCancelInlineEdit = () => {
    setEditingRowId(null);
    setEditingQuantity(1);
  };

  const handleAddItem = () => {
    setItemFormData({
      product_id: '',
      quantity: 1,
    });
    setSelectedProduct(null);
    setAddDialogOpen(true);
    fetchAvailableProducts();
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      setItemLoading(true);
      const response = await adminService.orders.addOrderItem(id, itemFormData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Item added successfully',
          severity: 'success',
        });
        setAddDialogOpen(false);
        setSelectedProduct(null);
        setItemFormData({
          product_id: '',
          quantity: 1,
        });
        // Refresh order details to update calculations
        await fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to save item',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save item',
        severity: 'error',
      });
    } finally {
      setItemLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setItemLoading(true);
      const response = await adminService.orders.removeOrderItem(id, itemToDelete.id);

      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Item removed successfully',
          severity: 'success',
        });
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        // Refresh order details to update calculations
        await fetchOrderDetails();
      } else {
        setSnackbar({
          open: true,
          message: response.error || 'Failed to remove item',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove item',
        severity: 'error',
      });
    } finally {
      setItemLoading(false);
    }
  };

  const handleCloseDialogs = () => {
    setAddDialogOpen(false);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setSelectedProduct(null);
    setItemFormData({
      product_id: '',
      quantity: 1,
    });
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
        setOngoingOrders(selectedVehicleData.ongoing_orders_count || 0);

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
        setOngoingOrders(0);
      }
    } else {
      setDeliveryPersons([]);
      setSelectedDeliveryPerson('');
      setCalculatedDeliveryCharges(0);
      setOngoingOrders(0);
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
    <Box sx={{
      minHeight: '100vh',
      py: 4
    }}>
      <Box sx={{ maxWidth: 1800, mx: 'auto', px: 3 }}>
        {/* Modern Header Section */}
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Order Details
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                #{orderDetails.order_number || orderDetails.id}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={orderDetails.status || 'N/A'}
                size="large"
                color={getStatusColor(orderDetails.status)}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: 2
                }}
              />
              <Chip
                label={orderDetails.paymentStatus || 'N/A'}
                size="large"
                color="success"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 2,
                  py: 1,
                  borderRadius: 3,
                  boxShadow: 2
                }}
              />
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => window.print()}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                borderColor: 'rgba(102, 126, 234, 0.3)',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#667eea',
                  bgcolor: 'rgba(102, 126, 234, 0.04)',
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                transition: 'all 0.3s ease'
              }}
            >
              Print
            </Button>
            {orderDetails.status && ['completed', 'approved', 'rejected', 'delivered'].includes(orderDetails.status.toLowerCase()) && (
              <Button
                variant="outlined"
                startIcon={pdfLoading.invoice ? <CircularProgress size={20} /> : <PictureAsPdf />}
                onClick={handleInvoicePDFDownload}
                disabled={pdfLoading.invoice}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#667eea',
                    bgcolor: 'rgba(102, 126, 234, 0.04)',
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {pdfLoading.invoice ? 'Downloading...' : 'Invoice PDF'}
              </Button>
            )}

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
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
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #4caf50 30%, #388e3c 90%)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #45a049 30%, #2e7d32 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {actionLoading ? 'Approving...' : 'Approve Order'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleRejectClick}
                  disabled={actionLoading}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                    boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #e53935 30%, #c62828 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
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
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
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
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #4caf50 30%, #388e3c 90%)',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #45a049 30%, #2e7d32 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {actionLoading ? 'Marking...' : 'Mark as Delivered'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AssignmentTurnedIn />}
                  onClick={() => handleOrderAction('mark_completed')}
                  disabled={actionLoading}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                    boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
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
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196f3 30%, #1976d2 90%)',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e88e5 30%, #1565c0 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {actionLoading ? 'Completing...' : 'Mark as Complete'}
              </Button>
            )}
          </Box>
        </Box>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{
                mb: 3,
                minWidth: 250,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Person sx={{ mr: 2, color: '#667eea', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                      Customer Information
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 80 }}>
                        Name:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {orderDetails.customer?.name || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 80 }}>
                        Email:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {orderDetails.customer?.email || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 80 }}>
                        Phone:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {orderDetails.customer?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                mb: 3,
                minWidth: 350,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AssignmentTurnedIn sx={{ mr: 2, color: '#667eea', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                      Order Summary
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Order ID:</Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {orderDetails.id || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Order Number:</Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {orderDetails.order_number || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Order Date:</Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {orderDetails.orderDate || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Status:</Typography>
                      <Chip
                        label={orderDetails.status || 'N/A'}
                        size="small"
                        color={getStatusColor(orderDetails.status)}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Payment Method:</Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {orderDetails.paymentMethod || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Payment Status:</Typography>
                      <Chip
                        label={orderDetails.paymentStatus || 'N/A'}
                        size="small"
                        color="success"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2
                        }}
                      />
                    </Box>
                    {orderDetails.rejection_reason && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: 'error.dark', fontWeight: 600 }}>
                          Rejection Reason:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'error.dark' }}>
                          {orderDetails.rejection_reason}
                        </Typography>
                      </Box>
                    )}
                    {orderDetails.notes && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: 'info.dark', fontWeight: 600 }}>
                          Notes:
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'info.dark' }}>
                          {orderDetails.notes}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                mb: 3,
                minWidth: 250,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocationOn sx={{ mr: 2, color: '#667eea', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                      Shipping Address
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                      {orderDetails.shippingAddress?.street || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                      {orderDetails.shippingAddress?.city || 'N/A'},{' '}
                      {orderDetails.shippingAddress?.state || 'N/A'} {orderDetails.shippingAddress?.zip || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {orderDetails.shippingAddress?.country || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationOn sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                        Delivery Distance:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {deliveryDistance ? `${deliveryDistance} km` : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <MonetizationOn sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                        Delivery Charges:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        ₹{orderDetails?.deliveryCharges ? orderDetails.deliveryCharges : calculatedDeliveryCharges.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocalShipping sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                        Delivery Vehicle:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {orderDetails?.vehicle ? `${orderDetails.vehicle.vehicle_number} (${orderDetails.vehicle.vehicle_type})` : selectedVehicle ? `${vehicles.find(v => v.id === selectedVehicle)?.vehicle_number || 'N/A'} (${vehicles.find(v => v.id === selectedVehicle)?.vehicle_type || 'N/A'})` : 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Person sx={{ color: '#667eea', fontSize: 20 }} />
                      <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 140 }}>
                        Delivery Person:
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        {orderDetails?.deliveryDriver ? orderDetails.deliveryDriver : selectedDeliveryPerson ? deliveryPersons.find(p => p.id === selectedDeliveryPerson)?.name || 'N/A' : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                mb: 3,
                minWidth: 200,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocationOn sx={{ mr: 2, color: '#667eea', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                      Billing Address
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                      {orderDetails.billingAddress?.street || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                      {orderDetails.billingAddress?.city || 'N/A'},{' '}
                      {orderDetails.billingAddress?.state || 'N/A'} {orderDetails.billingAddress?.zip || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {orderDetails.billingAddress?.country || 'N/A'}
                    </Typography>
                  </Box>
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
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{ minWidth: 250 }}>
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
                    {selectedVehicle && (
                      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                        Ongoing Orders: {ongoingOrders}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{ minWidth: 250 }}>
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

          <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Order Items
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddItem}
              disabled={itemLoading}
            >
              Add Item
            </Button>
          </Box>
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
                  <TableCell align="right">CGST</TableCell>
                  <TableCell align="right">SGST</TableCell>
                  <TableCell align="right">Tax Amount</TableCell>
                  <TableCell align="right">Total without Tax</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(orderDetails.items || []).map((item) => {
                  const taxAmount = item.tax_amount || 0;
                  const cgst = taxAmount / 2;
                  const sgst = taxAmount / 2;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.hsn_code || 'N/A'}</TableCell>
                      <TableCell align="right">₹{item.price?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="right">
                        {editingRowId === item.id ? (
                          <TextField
                            type="number"
                            value={editingQuantity}
                            onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 1)}
                            size="small"
                            inputProps={{ min: 1 }}
                            sx={{ width: 80 }}
                          />
                        ) : (
                          item.quantity
                        )}
                      </TableCell>
                      <TableCell align="right">{item.gst_rate ? `${item.gst_rate}%` : '0%'}</TableCell>
                      <TableCell align="right">₹{cgst.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{sgst.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{taxAmount.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{item.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="center">
                        {editingRowId === item.id ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleSaveInlineEdit(item.id)}
                              disabled={itemLoading}
                              sx={{ mr: 1 }}
                            >
                              <Save fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleCancelInlineEdit}
                              disabled={itemLoading}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleEditItem(item)}
                              disabled={itemLoading}
                              sx={{ mr: 1 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem(item)}
                              disabled={itemLoading}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              <TableRow>
                <TableCell colSpan={8} />
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
              <TableRow>
                <TableCell colSpan={8} />
                <TableCell align="right">
                  <Typography variant="body2">Delivery Charges:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">₹{(orderDetails.deliveryCharges && orderDetails.deliveryCharges > 0) ? orderDetails.deliveryCharges.toFixed(2) : (calculatedDeliveryCharges > 0 ? calculatedDeliveryCharges.toFixed(2) : '0.00')}</Typography>
                </TableCell>
              </TableRow>
              {calculatedTax > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={8} />
                    <TableCell align="right">
                      <Typography variant="body2">CGST:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">₹{(calculatedTax / 2).toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={8} />
                    <TableCell align="right">
                      <Typography variant="body2">SGST:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">₹{(calculatedTax / 2).toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                </>
              )}
                {orderDetails.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={8} />
                    <TableCell align="right">
                      <Typography variant="body2">Discount:</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      -₹{calculatedDiscount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={8} />
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

        {/* Delivery Charges Breakdown Table */}
        {(orderDetails.deliveryCharges > 0 || calculatedDeliveryCharges > 0) && (
          <>
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Delivery Charges Breakdown
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Delivery Charges (Base)</TableCell>
                    <TableCell align="right">₹{(orderDetails.deliveryCharges && orderDetails.deliveryCharges > 0) ? (orderDetails.deliveryCharges / 1.18).toFixed(2) : (calculatedDeliveryCharges / 1.18).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CGST (9%)</TableCell>
                    <TableCell align="right">₹{(calculatedDeliveryTax / 2).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SGST (9%)</TableCell>
                    <TableCell align="right">₹{(calculatedDeliveryTax / 2).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Total Delivery Charges</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{(orderDetails.deliveryCharges && orderDetails.deliveryCharges > 0) ? orderDetails.deliveryCharges.toFixed(2) : calculatedDeliveryCharges.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
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



      {/* Add Item Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Add Order Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Available Products:
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">GST Rate</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">₹{Number(product.price || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">{product.gst_rate ? `${product.gst_rate}%` : '0%'}</TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleProductSelectFromTable(product)}
                            disabled={selectedProduct?.id === product.id}
                          >
                            {selectedProduct?.id === product.id ? 'Selected' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={totalProducts}
                  page={productsPage}
                  onPageChange={(event, newPage) => setProductsPage(newPage)}
                  rowsPerPage={productsRowsPerPage}
                  onRowsPerPageChange={(event) => {
                    setProductsRowsPerPage(parseInt(event.target.value, 10));
                    setProductsPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </TableContainer>
            </Grid>
            {selectedProduct && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Selected Product:</strong> {selectedProduct.name} - ₹{Number(selectedProduct.price || 0).toFixed(2)}
                  </Typography>
                </Alert>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={itemFormData.quantity}
                onChange={(e) => setItemFormData({ ...itemFormData, quantity: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            disabled={itemLoading || !itemFormData.product_id}
            startIcon={itemLoading ? <CircularProgress size={20} /> : <Add />}
          >
            {itemLoading ? 'Adding...' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Item Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Order Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item from the order? This action cannot be undone.
          </Typography>
          {itemToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Product:</strong> {itemToDelete.name}
              </Typography>
              <Typography variant="body2">
                <strong>Quantity:</strong> {itemToDelete.quantity}
              </Typography>
              <Typography variant="body2">
                <strong>Price:</strong> ₹{itemToDelete.price?.toFixed(2)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={itemLoading}
            startIcon={itemLoading ? <CircularProgress size={20} /> : <Delete />}
          >
            {itemLoading ? 'Deleting...' : 'Delete Item'}
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
