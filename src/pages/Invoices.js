import React, { useState, useEffect } from 'react';
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
  TextField,
  InputAdornment,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Download,
  Visibility,
  MoreVert,
  Receipt,
  CheckCircle,
  Cancel,
  Pending,
  Print,
  Email,
} from '@mui/icons-material';
import { adminService } from '../services/adminService';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuInvoice, setMenuInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [page, rowsPerPage, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const response = await adminService.orders.getInvoices(params);
      setInvoices(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      const response = await adminService.orders.downloadInvoice(invoice.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      setError('Failed to download invoice. Please try again.');
    }
  };

  const handleMenuClick = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setMenuInvoice(invoice);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuInvoice(null);
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await adminService.orders.updateInvoiceStatus(invoiceId, { status: newStatus });
      fetchInvoices();
      handleMenuClose();
    } catch (err) {
      console.error('Failed to update invoice status:', err);
      setError('Failed to update invoice status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'overdue':
        return <Cancel />;
      case 'cancelled':
        return <Cancel />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Receipt />}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5855eb 0%, #7c3aed 100%)',
            },
          }}
        >
          Generate Invoice
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by invoice number, customer name, or order ID..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={fetchInvoices}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Invoices Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {invoice.invoice_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.customer_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {invoice.customer_email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        #{invoice.order_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(invoice.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(invoice.status)}
                        label={invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        color={getStatusColor(invoice.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(invoice.issue_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(invoice.due_date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuClick(event, invoice)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={invoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewInvoice(menuInvoice)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleDownloadInvoice(menuInvoice)}>
          <Download sx={{ mr: 1 }} />
          Download PDF
        </MenuItem>
        <MenuItem>
          <Print sx={{ mr: 1 }} />
          Print
        </MenuItem>
        <MenuItem>
          <Email sx={{ mr: 1 }} />
          Send Email
        </MenuItem>
        {menuInvoice?.status === 'pending' && (
          <>
            <MenuItem onClick={() => handleStatusUpdate(menuInvoice.id, 'paid')}>
              <CheckCircle sx={{ mr: 1 }} />
              Mark as Paid
            </MenuItem>
            <MenuItem onClick={() => handleStatusUpdate(menuInvoice.id, 'cancelled')}>
              <Cancel sx={{ mr: 1 }} />
              Cancel Invoice
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Invoice Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Invoice Details - {selectedInvoice?.invoice_number}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {selectedInvoice.customer_name}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {selectedInvoice.customer_email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {selectedInvoice.customer_phone}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Invoice Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Invoice Number:</strong> {selectedInvoice.invoice_number}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Order ID:</strong> #{selectedInvoice.order_id}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Issue Date:</strong> {formatDate(selectedInvoice.issue_date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Due Date:</strong> {formatDate(selectedInvoice.due_date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong>{' '}
                      <Chip
                        icon={getStatusIcon(selectedInvoice.status)}
                        label={selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                        color={getStatusColor(selectedInvoice.status)}
                        size="small"
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Items
                    </Typography>
                    {/* Add order items table here */}
                    <Typography variant="body2" color="text.secondary">
                      Order items will be displayed here
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        Total Amount
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatCurrency(selectedInvoice.total_amount)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleDownloadInvoice(selectedInvoice)}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
