import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { log, warn, error } from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_TOKEN_KEY = 'api_token';
const API_TOKEN_EXPIRY_KEY = 'api_token_expiry';
const API_TOKEN_EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_CLIENT_ID = process.env.REACT_APP_API_CLIENT_ID || 'buytownapiadmin';
const API_CLIENT_SECRET = process.env.REACT_APP_API_CLIENT_SECRET || 'C7l@i46HuQec';

async function getApiToken() {
  const now = Date.now();
  const token = localStorage.getItem(API_TOKEN_KEY);
  const expiry = localStorage.getItem(API_TOKEN_EXPIRY_KEY);
  if (token && expiry && now < parseInt(expiry, 10)) {
    return token;
  }
  // Generate new token
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/generate-token`, {
      client_id: API_CLIENT_ID,
      client_secret: API_CLIENT_SECRET,
    });
    const newToken = response.data.apiToken;
    localStorage.setItem(API_TOKEN_KEY, newToken);
    localStorage.setItem(API_TOKEN_EXPIRY_KEY, (now + API_TOKEN_EXPIRY_MS).toString());
    return newToken;
  } catch (err) {
    throw err;
  }
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [apiToken, setApiToken] = useState(null);
  
  console.log('AuthProvider initialized - loading:', loading);

  // Set up axios defaults and interceptors
  useEffect(() => {
    let isMounted = true;
    async function setupApiToken() {
      try {
        const token = await getApiToken();
        if (!isMounted) return;
        setApiToken(token);
        axios.defaults.baseURL = API_BASE_URL;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        error('Error setting up API token:', err);
      }
    }
    setupApiToken();
    return () => { isMounted = false; };
  }, []);

  // Check for existing user token on mount
  useEffect(() => {
    let isMounted = true;
    
    // Define a function to check if a token is valid and extract user info
    const parseAndSetUserFromToken = (token) => {
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.warn('Invalid token format - not a JWT token');
          return { id: 'unknown' };
        }
        
        // Decode the payload
        const base64Url = tokenParts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const payload = JSON.parse(jsonPayload);
        console.log('Decoded token payload:', payload);
        
        if (payload.id) {
          return {
            id: payload.id,
            role_id: payload.role_id
          };
        }
        
        return { id: 'unknown' };
      } catch (err) {
        console.error('Error parsing token:', err);
        return { id: 'unknown' };
      }
    };
    
    async function checkAuthStatus() {
      try {
        console.log('Checking auth status...');
        const userToken = localStorage.getItem('token');
        console.log('User token from localStorage:', userToken ? 'exists' : 'not found');
        
        if (userToken && isMounted) {
          // If token exists, consider user authenticated immediately
          // This ensures we don't redirect to login while trying to parse the token
          setIsAuthenticated(true);
          console.log('Setting isAuthenticated to true based on token presence');
          
          // Parse the token and set user data
          const userData = parseAndSetUserFromToken(userToken);
          setUser(userData);
          console.log('User data set from token payload:', userData);
          
          // Set up axios defaults
          try {
            const apiToken = await getApiToken();
            if (!isMounted) return;
            
            axios.defaults.baseURL = API_BASE_URL;
            // Set user token in headers for authenticated requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
            console.log('Axios headers set with user token');
          } catch (apiErr) {
            console.error('Error setting up API token:', apiErr);
            // Continue with authentication even if API token setup fails
          }
        } else if (isMounted) {
          // No token found, user is not authenticated
          console.log('No token found, user is not authenticated');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        error('Error checking auth status:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Auth loading complete, isAuthenticated:', isAuthenticated);
        }
      }
    }
    
    checkAuthStatus();
    return () => { isMounted = false; };
  }, []);

  // Handle token expiration and regeneration on demand
  const ensureApiToken = async () => {
    const now = Date.now();
    const expiry = localStorage.getItem(API_TOKEN_EXPIRY_KEY);
    if (!apiToken || !expiry || now >= parseInt(expiry, 10)) {
      const token = await getApiToken();
      setApiToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return token;
    }
    return apiToken;
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      const token = await ensureApiToken();
      console.log('API token obtained for login request');
      
      const response = await axios.post('/auth/admin/login', { identity: email, password }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Login response received:', response.data);
      
      // Backend returns accessToken instead of token
      const { accessToken, user } = response.data;
      
      if (!accessToken) {
        console.error('No accessToken in response data:', response.data);
        return { success: false, error: 'No access token received' };
      }
      
      console.log('Storing token in localStorage');
      localStorage.setItem('token', accessToken);
      
      console.log('Setting authentication state');
      setIsAuthenticated(true);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Get the current API token
      const token = await ensureApiToken();
      
      // Make a request to the backend to invalidate the session
      await axios.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if the server request fails
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      
      // Reset axios default headers
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    apiToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};