import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../services/adminService.js';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  AccountCircle,
  Logout,
  Notifications,
  Settings,
  ChevronLeft,
  ChevronRight,
  Inventory,
  People,
  LocalShipping,
  Receipt,
  Payment,
  Sms,
  Email,
  ShoppingCart,
  Assessment,
  Business,
  Tune,
  Description,
  DirectionsCar,
  Route,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/',
    badge: null
  },
  {
    text: 'Products',
    icon: <Inventory />,
    path: null,
    badge: null,
    children: [
      { text: 'All Products', path: '/products', icon: <Inventory /> },
      { text: 'Categories', path: '/categories', icon: <CategoryIcon /> },
      { text: 'Brands', path: '/brands', icon: <Business /> },
      { text: 'Variations', path: '/variations', icon: <Tune /> }
    ]
  },
  {
    text: 'Orders',
    icon: <ShoppingCart />,
    path: null,
    badge: null,
    children: [
      { text: 'All Orders', path: '/orders', icon: <ShoppingCart /> },
      { text: 'Ordered Customers', path: '/orders/customers', icon: <People /> }
    ]
  },
  {
    text: 'Users',
    icon: <People />,
    path: '/users',
    badge: null
  },
  {
    text: 'Reports & Analytics',
    icon: <Assessment />,
    path: '/reports',
    badge: null
  },
  {
    text: 'Content',
    icon: <Description />,
    path: null,
    badge: null,
    children: [
      { text: 'Pages', path: '/pages', icon: <Description /> },
      { text: 'Banner Upload', path: '/general/banner-upload', icon: <Settings /> }
    ]
  },
  {
    text: 'Settings',
    icon: <Settings />,
    path: null,
    badge: null,
    children: [
      { text: 'General', path: '/general/settings', icon: <Settings /> },
      { text: 'Vehicle Management', path: '/vehicles', icon: <DirectionsCar /> },
      { text: 'Delivery', path: '/delivery', icon: <Route /> },
      { text: 'Payment Gateway', path: '/payment', icon: <Payment /> },
      { text: 'Tax Management', path: '/tax', icon: <Receipt /> },
      { text: 'SMS Configuration', path: '/sms', icon: <Sms /> },
      { text: 'Email Configuration', path: '/email', icon: <Email /> }
    ]
  }
];

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const drawerWidth = drawerCollapsed ? 80 : 240;

  const handleDrawerToggle = () => {
    setMobileOpen(true);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleAccordionToggle = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Notification functions
  const fetchNotifications = async () => {
    try {
      const response = await adminService.notifications.getNotifications({ limit: 20 });
      console.log("notifications", response.data);
      setNotifications(response.data.notifications || []);

      // Fetch unread count
      const countResponse = await adminService.notifications.getUnreadCount();
      setUnreadCount(countResponse.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminService.notifications.markAsRead(id);
      // Refresh notifications after marking as read
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingCart sx={{ color: 'primary.main' }} />;
      case 'product':
        return <Inventory sx={{ color: 'error.main' }} />;
      case 'shipping':
        return <LocalShipping sx={{ color: 'info.main' }} />;
      case 'user':
        return <People sx={{ color: 'success.main' }} />;
      default:
        return <Notifications sx={{ color: 'primary.main' }} />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: drawerCollapsed ? 1 : 3,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: drawerCollapsed ? 'center' : 'space-between',
        }}
      >
        {!drawerCollapsed && (
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => {
              navigate('/');
              setMobileOpen(false);
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                BT
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                BuyTown
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Admin Panel
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton
          onClick={() => setDrawerCollapsed(!drawerCollapsed)}
          sx={{ color: 'white' }}
        >
          {drawerCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus[item.text] || false;
            const isActive = location.pathname === item.path ||
              (hasChildren && item.children.some(child =>
                child.path === location.pathname ||
                (child.children && child.children.some(subChild => subChild.path === location.pathname))
              ));

            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => {
                      if (hasChildren) {
                        handleAccordionToggle(item.text);
                      } else {
                        navigate(item.path);
                        setMobileOpen(false);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      justifyContent: drawerCollapsed ? 'center' : 'flex-start',
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        },
                      },
                      '&:hover': {
                        background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : 'rgba(99, 102, 241, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? 'white' : 'inherit',
                        minWidth: drawerCollapsed ? 0 : 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!drawerCollapsed && (
                      <>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: isActive ? 600 : 500,
                          }}
                        />
                        {hasChildren && (
                          <IconButton
                            size="small"
                            sx={{
                              color: isActive ? 'white' : 'inherit',
                              p: 0.5,
                              ml: 'auto',
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                            }}
                          >
                            <ChevronRight sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                        {item.badge && (
                          <Badge badgeContent={item.badge} color="error" />
                        )}
                      </>
                    )}
                  </ListItemButton>
                </ListItem>

                {/* Render children items with accordion */}
                {hasChildren && !drawerCollapsed && isExpanded && (
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.children.map((child) => {
                      const hasSubChildren = child.children && child.children.length > 0;
                      const isChildActive = location.pathname === child.path ||
                        (hasSubChildren && child.children.some(subChild => subChild.path === location.pathname));

                      return (
                        <React.Fragment key={child.text}>
                          <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                              selected={isChildActive}
                              onClick={() => {
                                if (hasSubChildren) {
                                  handleAccordionToggle(`${item.text}-${child.text}`);
                                } else {
                                  navigate(child.path);
                                  setMobileOpen(false);
                                }
                              }}
                              sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  color: '#6366f1',
                                },
                                '&:hover': {
                                  background: isChildActive ? 'rgba(99, 102, 241, 0.1)' : 'rgba(0, 0, 0, 0.04)',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={child.text}
                                primaryTypographyProps={{
                                  fontSize: '0.875rem',
                                  fontWeight: isChildActive ? 600 : 400,
                                }}
                              />
                              {hasSubChildren && (
                                <IconButton
                                  size="small"
                                  sx={{
                                    p: 0.5,
                                    ml: 'auto',
                                    transform: expandedMenus[`${item.text}-${child.text}`] ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                  }}
                                >
                                  <ChevronRight sx={{ fontSize: 14 }} />
                                </IconButton>
                              )}
                            </ListItemButton>
                          </ListItem>

                          {/* Render sub-children */}
                          {hasSubChildren && expandedMenus[`${item.text}-${child.text}`] && (
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                              {child.children.map((subChild) => (
                                <ListItem key={subChild.text} disablePadding sx={{ mb: 0.5 }}>
                                  <ListItemButton
                                    selected={location.pathname === subChild.path}
                                    onClick={() => {
                                      navigate(subChild.path);
                                      setMobileOpen(false);
                                    }}
                                    sx={{
                                      borderRadius: 2,
                                      '&.Mui-selected': {
                                        background: 'rgba(99, 102, 241, 0.08)',
                                        color: '#6366f1',
                                      },
                                      '&:hover': {
                                        background: location.pathname === subChild.path ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                      },
                                    }}
                                  >
                                    <ListItemText
                                      primary={subChild.text}
                                      primaryTypographyProps={{
                                        fontSize: '0.8rem',
                                        fontWeight: location.pathname === subChild.path ? 600 : 400,
                                      }}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </List>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: drawerCollapsed ? 'center' : 'flex-start' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              mr: drawerCollapsed ? 0 : 2,
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          {!drawerCollapsed && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.email || 'Admin User'}
              </Typography>
              <Chip
                label="Admin"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20,
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)`, xs: mobileOpen ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: `${drawerWidth}px`, xs: mobileOpen ? `${drawerWidth}px` : 0 },
          background: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {location.pathname === '/' ? 'Dashboard' :
               location.pathname === '/categories' ? 'Categories Management' :
               location.pathname === '/brands' ? 'Brands Management' :
               location.pathname === '/variations' ? 'Variations Management' :
               location.pathname === '/products' ? 'Products Management' :
               location.pathname === '/users' ? 'Users Management' :
               location.pathname === '/orders' ? 'Orders Management' :
               location.pathname === '/orders/customers' ? 'Ordered Customers' :
               location.pathname === '/invoices' ? 'Invoices Management' :
               location.pathname === '/reports' ? 'Reports & Analytics' :
               location.pathname === '/sms' ? 'SMS Configuration & OTP Management' :
               location.pathname === '/email' ? 'Email Configuration' :
               location.pathname === '/pages' ? 'Pages Management' :

               location.pathname === '/general/settings' ? 'General Settings' :
               location.pathname === '/general/banner-upload' ? 'Banner Upload' : 'Admin Panel'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="large"
              sx={{ color: 'text.secondary' }}
              onClick={handleNotificationClick}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              sx={{ color: 'text.secondary' }}
            >
              <Settings />
            </IconButton>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuClick}
              sx={{ color: 'text.secondary' }}
            >
              <AccountCircle />
            </IconButton>
          </Box>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              },
            }}
          >

          <Menu
            id="notification-menu"
            anchorEl={notificationAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: {
                mt: 1,
                width: 320,
                borderRadius: 2,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxHeight: 400,
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>

            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsRead(notification.id);
                    }
                    handleNotificationClose();
                  }}
                  sx={{
                    py: 2,
                    backgroundColor: !notification.is_read ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                    '&:hover': {
                      backgroundColor: !notification.is_read ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.message}
                    primaryTypographyProps={{
                      fontWeight: !notification.is_read ? 700 : 600,
                      variant: 'body1'
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      sx: {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }
                    }}
                  />
                  {!notification.is_read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        ml: 1,
                      }}
                    />
                  )}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled sx={{ py: 4, textAlign: 'center' }}>
                <ListItemText
                  primary="No notifications"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                    textAlign: 'center'
                  }}
                />
              </MenuItem>
            )}

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
                onClick={handleNotificationClose}
              >
                View All Notifications
              </Typography>
            </Box>
          </Menu>
            <MenuItem disabled>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    mr: 2,
                  }}
                >
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.email || 'Admin User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Administrator
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="persistent"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              overflowX: 'hidden',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          background: '#f8fafc',
          minHeight: '100vh',
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
