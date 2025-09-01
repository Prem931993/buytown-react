import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Token management utilities
export const tokenManager = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getAccessToken: () => {
    return localStorage.getItem('token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
};

// Refresh token function
export async function refreshAccessToken() {
  try {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken: refreshToken
    });

    if (response.data.accessToken && response.data.refreshToken) {
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data.accessToken;
    } else {
      throw new Error('Invalid refresh token response');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    tokenManager.clearTokens();
    window.location.href = '/login';
    throw error;
  }
}

export async function adminLogin(identity, password, apiToken) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/admin/login`,
      { identity, password },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    // Store both access and refresh tokens
    if (response.data.accessToken && response.data.refreshToken) {
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function logout(token) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Clear tokens on logout
    tokenManager.clearTokens();

    return response.data;
  } catch (error) {
    // Clear tokens even if logout request fails
    tokenManager.clearTokens();
    throw error;
  }
}
