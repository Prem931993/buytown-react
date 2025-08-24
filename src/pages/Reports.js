import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Print,
  Refresh,
  ShoppingCart,
  Inventory,
  People,
  AttachMoney,
} from '@mui/icons-material';

const mockTopProducts = [
  { id: 1, name: 'Smartphone X', sales: 245, revenue: 24475.55, growth: 12.5 },
  { id: 2, name: 'Laptop Pro', sales: 189, revenue: 189000.00, growth: 8.3 },
  { id: 3, name: 'Wireless Earbuds', sales: 352, revenue: 17600.00, growth: 24.7 },
  { id: 4, name: 'Smart Watch', sales: 147, revenue: 22050.00, growth: -3.2 },
  { id: 5, name: 'Tablet Mini', sales: 95, revenue: 28500.00, growth: 5.8 },
];

const mockTopCategories = [
  { id: 1, name: 'Electronics', sales: 1245, revenue: 298800.00, growth: 15.2 },
  { id: 2, name: 'Clothing', sales: 876, revenue: 43800.00, growth: 7.5 },
  { id: 3, name: 'Home & Kitchen', sales: 543, revenue: 32580.00, growth: 9.8 },
  { id: 4, name: 'Beauty & Personal Care', sales: 421, revenue: 16840.00, growth: 12.3 },
  { id: 5, name: 'Sports & Outdoors', sales: 312, revenue: 21840.00, growth: -2.1 },
];

const mockSalesByRegion = [
  { id: 1, region: 'North America', sales: 3245, revenue: 421850.00, growth: 14.2 },
  { id: 2, region: 'Europe', sales: 2132, revenue: 277160.00, growth: 9.5 },
  { id: 3, region: 'Asia', sales: 1876, revenue: 244880.00, growth: 18.7 },
  { id: 4, region: 'Australia', sales: 654, revenue: 85020.00, growth: 6.3 },
  { id: 5, region: 'South America', sales: 432, revenue: 56160.00, growth: 11.9 },
];

function Reports() {
  const [timeRange, setTimeRange] = useState('last30days');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current data based on selected tab
  const getCurrentData = () => {
    switch (tabValue) {
      case 0:
        return mockTopProducts;
      case 1:
        return mockTopCategories;
      case 2:
        return mockSalesByRegion;
      default:
        return [];
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Reports & Analytics
      </Typography>

      {/* Filters and Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
            size="small"
          >
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="yesterday">Yesterday</MenuItem>
            <MenuItem value="last7days">Last 7 Days</MenuItem>
            <MenuItem value="last30days">Last 30 Days</MenuItem>
            <MenuItem value="thisMonth">This Month</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
            <MenuItem value="thisYear">This Year</MenuItem>
            <MenuItem value="custom">Custom Range</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                  <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
                    $124,592.30
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      +12.5%
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                      vs last period
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'primary.light',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AttachMoney sx={{ color: 'primary.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
                    1,352
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      +8.2%
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                      vs last period
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'info.light',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingCart sx={{ color: 'info.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Products Sold
                  </Typography>
                  <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
                    2,845
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                      +15.3%
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                      vs last period
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'warning.light',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Inventory sx={{ color: 'warning.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    New Customers
                  </Typography>
                  <Typography variant="h5" sx={{ my: 1, fontWeight: 600 }}>
                    432
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
                      -2.8%
                    </Typography>
                    <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary' }}>
                      vs last period
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'success.light',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <People sx={{ color: 'success.main' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Sales Overview
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            [Sales Chart Visualization Would Appear Here]
          </Typography>
        </Box>
      </Paper>

      {/* Detailed Reports */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
            <Tab label="Top Products" />
            <Tab label="Top Categories" />
            <Tab label="Sales by Region" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                {tabValue === 0 && (
                  <>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Units Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </>
                )}
                {tabValue === 1 && (
                  <>
                    <TableCell>Category Name</TableCell>
                    <TableCell align="right">Units Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </>
                )}
                {tabValue === 2 && (
                  <>
                    <TableCell>Region</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentData()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell component="th" scope="row">
                      {tabValue === 0 ? row.name : tabValue === 1 ? row.name : row.region}
                    </TableCell>
                    <TableCell align="right">{row.sales}</TableCell>
                    <TableCell align="right">${row.revenue.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {row.growth >= 0 ? (
                          <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                        ) : (
                          <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: row.growth >= 0 ? 'success.main' : 'error.main',
                            fontWeight: 600,
                          }}
                        >
                          {row.growth >= 0 ? '+' : ''}{row.growth}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={getCurrentData().length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Additional Reports */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment Methods
            </Typography>
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                [Payment Methods Chart Would Appear Here]
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Status Distribution
            </Typography>
            <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                [Order Status Chart Would Appear Here]
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports;