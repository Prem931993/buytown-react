import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  Inventory as ProductIcon,
  Person as UserIcon,
  AttachMoney as RevenueIcon,
  ArrowForward,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    products: 0,
    users: 0,
    revenue: 0
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    // Simulate API call with setTimeout
    const timer = setTimeout(() => {
      // Set mock data
      setStats({
        revenue: 24580,
        orders: 1254,
        products: 567,
        users: 3890,
      });

      // Set mock pending orders
      setPendingOrders([
        { id: 'ORD-7351', customer: 'John Doe', date: new Date(), amount: 245.99, status: 'Pending' },
        { id: 'ORD-7352', customer: 'Jane Smith', date: new Date(), amount: 189.50, status: 'Pending' },
        { id: 'ORD-7353', customer: 'Robert Johnson', date: new Date(), amount: 345.75, status: 'Pending' },
        { id: 'ORD-7354', customer: 'Emily Davis', date: new Date(), amount: 129.99, status: 'Pending' },
        { id: 'ORD-7355', customer: 'Michael Brown', date: new Date(), amount: 499.99, status: 'Pending' },
      ]);

      // Set mock low stock products
      setLowStockProducts([
        { id: 'PRD-1001', name: 'Wireless Earbuds', category: 'Electronics', stock: 3, status: 'Low Stock' },
        { id: 'PRD-1002', name: 'Bluetooth Speaker', category: 'Electronics', stock: 0, status: 'Out of Stock' },
        { id: 'PRD-1003', name: 'Smart Watch', category: 'Electronics', stock: 2, status: 'Low Stock' },
        { id: 'PRD-1004', name: 'Phone Case', category: 'Accessories', stock: 5, status: 'Low Stock' },
        { id: 'PRD-1005', name: 'USB-C Cable', category: 'Accessories', stock: 0, status: 'Out of Stock' },
      ]);

      // Set mock recent sales
      setRecentSales([
        { id: 'SALE-8001', customer: 'Alice Johnson', date: new Date(2023, 6, 15), amount: 329.99 },
        { id: 'SALE-8002', customer: 'Bob Williams', date: new Date(2023, 6, 14), amount: 124.50 },
        { id: 'SALE-8003', customer: 'Carol Martinez', date: new Date(2023, 6, 14), amount: 259.99 },
        { id: 'SALE-8004', customer: 'David Anderson', date: new Date(2023, 6, 13), amount: 499.95 },
        { id: 'SALE-8005', customer: 'Eva Wilson', date: new Date(2023, 6, 12), amount: 149.99 },
      ]);

      // Set mock popular products
      setPopularProducts([
        { id: 'PRD-1001', name: 'Wireless Earbuds', category: 'Electronics', sales: 124 },
        { id: 'PRD-1003', name: 'Smart Watch', category: 'Electronics', sales: 98 },
        { id: 'PRD-1002', name: 'Bluetooth Speaker', category: 'Electronics', sales: 87 },
        { id: 'PRD-1004', name: 'Phone Case', category: 'Accessories', sales: 76 },
        { id: 'PRD-1005', name: 'USB-C Cable', category: 'Accessories', sales: 65 },
      ]);

      setLoading(false);
    }, 1000); // 1 second delay to simulate network request

    return () => clearTimeout(timer);
  }, []);

  // Dashboard card component with hover effect
  const DashboardCard = ({ title, value, icon, color, onClick }) => (
    <Card 
      sx={{ 
        height: '100%', 
        width: '100%',
        position: 'relative', 
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        borderRadius: 3,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '30%',
          height: '100%',
          background: `linear-gradient(to bottom right, ${color}1A, transparent)`,
          opacity: 0.5,
          zIndex: 0
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" component="div" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          <Avatar
            sx={{
              backgroundColor: color,
              width: 40,
              height: 40,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
          {loading ? <CircularProgress size={32} /> : value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <ArrowForward sx={{ fontSize: 16, color: color, mr: 0.5 }} />
          <Typography variant="body2" sx={{ color: color, fontWeight: 500 }}>
            View Details
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Handle navigation to detail pages
  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1, pb: 3, bgcolor: '#f5f7fa' }}>
      <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 2, sm: 3 }, py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, width: '100%' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>

        {/* Welcome Banner */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 5,
            width: '100%',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2), 0 4px 6px -2px rgba(99, 102, 241, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', 
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)', 
            transform: 'translateX(30%)',
            display: { xs: 'none', md: 'block' }
          }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back, Admin!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: '80%' }}>
            Here's what's happening with your store today.
          </Typography>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 5, width: '100%', mx: 0 }}>
          <Grid item xs={12} sm={6} md={6}>
            <DashboardCard
              title="Total Revenue"
              value={`$${stats.revenue.toLocaleString()}`}
              icon={<RevenueIcon sx={{ color: '#fff' }} />}
              color="#22c55e"
              onClick={() => handleCardClick('/reports')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <DashboardCard
              title="Total Orders"
              value={stats.orders.toLocaleString()}
              icon={<OrderIcon sx={{ color: '#fff' }} />}
              color="#6366f1"
              onClick={() => handleCardClick('/orders')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <DashboardCard
              title="Total Products"
              value={stats.products.toLocaleString()}
              icon={<ProductIcon sx={{ color: '#fff' }} />}
              color="#f59e0b"
              onClick={() => handleCardClick('/products')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <DashboardCard
              title="Total Users"
              value={stats.users.toLocaleString()}
              icon={<UserIcon sx={{ color: '#fff' }} />}
              color="#8b5cf6"
              onClick={() => handleCardClick('/users')}
            />
          </Grid>
        </Grid>

        {/* Data Visualization Section */}
        <Grid container spacing={4} sx={{ mb: 5, width: '100%', mx: 0 }}>
        {/* Orders Awaiting Confirmation */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(99, 102, 241, 0.05), transparent)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                Orders Awaiting Confirmation
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                onClick={() => handleCardClick('/orders')}
                sx={{ color: '#6366f1', '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' } }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : pendingOrders.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No orders awaiting confirmation.
                </Typography>
              </Box>
            ) : (
              <Box>
                {pendingOrders.slice(0, 5).map((order) => (
                  <Box 
                    key={order.id} 
                    sx={{ 
                      p: 2, 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                                              {order.customer} • ${typeof order.amount === 'number' ? order.amount.toFixed(2) : '0.00'}
                                            </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        color="success" 
                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)' }}
                        onClick={() => navigate(`/orders/edit/${order.id}`)}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)' }}
                        onClick={() => console.log(`Cancel Order ${order.id}`)}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Low Stock Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                Low Stock Products
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                onClick={() => handleCardClick('/products')}
                sx={{ color: '#f59e0b', '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.08)' } }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : lowStockProducts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No low stock products found.
                </Typography>
              </Box>
            ) : (
              <Box>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <Box 
                    key={product.id} 
                    sx={{ 
                      p: 2, 
                      borderBottom: '1px solid', 
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.id} • Stock: {product.stock}
                      </Typography>
                    </Box>
                    <Box>
                      <Button 
                        size="small" 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                      >
                        Restock
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Sales */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
                Recent Sales
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                onClick={() => handleCardClick('/reports')}
                sx={{ color: '#10b981', '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.08)' } }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <Box>
                {recentSales.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent sales found.
                    </Typography>
                  </Box>
                ) : (
                  recentSales.map((sale) => (
                    <Box 
                      key={sale.id} 
                      sx={{ 
                        p: 2, 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        '&:hover': { bgcolor: 'action.hover' },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleCardClick(`/orders/${sale.id}`)}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {sale.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sale.customer} • {sale.date.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 600, mr: 1 }}>
                                                  ${typeof sale.amount === 'number' ? sale.amount.toFixed(2) : '0.00'}
                                                </Typography>
                        <ArrowForward fontSize="small" sx={{ color: '#10b981', fontSize: 16 }} />
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Popular Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: '100%', width: '100%', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                Popular Products
              </Typography>
              <Button 
                size="small" 
                endIcon={<ArrowForward />} 
                onClick={() => handleCardClick('/products')}
                sx={{ color: '#8b5cf6', '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.08)' } }}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <Box>
                {popularProducts.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No popular products found.
                    </Typography>
                  </Box>
                ) : (
                  popularProducts.map((product) => (
                    <Box 
                      key={product.id} 
                      sx={{ 
                        p: 2, 
                        borderBottom: '1px solid', 
                        borderColor: 'divider',
                        '&:hover': { bgcolor: 'action.hover' },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.category} • {product.sales} sales
                        </Typography>
                      </Box>
                      <Box>
                        <Chip 
                          label="View" 
                          size="small" 
                          color="primary" 
                          onClick={() => handleCardClick(`/products/${product.id}`)}
                          sx={{ cursor: 'pointer', bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;