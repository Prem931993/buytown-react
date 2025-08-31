import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
    return response.data;
  } catch (error) {
    throw error;
  }
}
