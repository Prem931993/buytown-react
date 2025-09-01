import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// Categories import moved up
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductImport from './pages/ProductImport';
import ParentProductForm from './pages/ParentProductForm';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import Reports from './pages/Reports';
import PlaceholderPage from './pages/PlaceholderPage';
import Brands from './pages/Brands';
import Variations from './pages/Variations';
import Layout from './components/Layout';
import BannerUpload from './pages/BannerUpload';
import GeneralSettings from './pages/GeneralSettings';
import SMSConfiguration from './pages/SMSConfiguration';
import EmailConfig from './pages/EmailConfig';
import TaxConfig from './pages/TaxConfig';
import PaymentConfig from './pages/PaymentConfig';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Don't redirect while still loading
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="products/add" element={<ProductDetail />} />
              <Route path="products/edit/:id" element={<ProductDetail />} />
              <Route path="products/import" element={<ProductImport />} />
              <Route path="parent-products/:id" element={<ParentProductForm />} />
              <Route path="parent-products" element={<ParentProductForm />} />
              <Route path="categories" element={<Categories />} />
              <Route path="categories/add" element={<CategoryDetail />} />
              <Route path="categories/edit/:id" element={<CategoryDetail />} />
              <Route path="brands" element={<Brands />} />
              <Route path="variations" element={<Variations />} />
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<UserDetail />} />
              <Route path="users/edit/:id" element={<UserDetail />} />
              <Route path="reports" element={<Reports />} />
              <Route path="delivery" element={<PlaceholderPage />} />
              <Route path="tax" element={<TaxConfig />} />
              <Route path="payment" element={<PaymentConfig />} />
              <Route path="sms" element={<SMSConfiguration />} />
              <Route path="email" element={<EmailConfig />} />
              <Route path="general/settings" element={<GeneralSettings />} />
              <Route path="general/banner-upload" element={<BannerUpload />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
