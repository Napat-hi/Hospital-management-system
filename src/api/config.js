// API Configuration File
// Replace these values with your actual backend configuration

// Base URL for your backend API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// API Endpoints
export const API_ENDPOINTS = {
  // User Management
  USERS: '/api/users',
  USER_BY_ID: (id) => `/api/users/${id}`,
  
  // Authentication (if needed)
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REGISTER: '/api/auth/register',
};

// Default headers for API requests
export const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add authentication token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// API request helper functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  // Get all users
  getAll: () => apiRequest(API_ENDPOINTS.USERS, { method: 'GET' }),
  
  // Get user by ID
  getById: (id) => apiRequest(API_ENDPOINTS.USER_BY_ID(id), { method: 'GET' }),
  
  // Create new user
  create: (userData) => apiRequest(API_ENDPOINTS.USERS, {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  // Update user
  update: (id, userData) => apiRequest(API_ENDPOINTS.USER_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  
  // Delete/disable user
  delete: (id) => apiRequest(API_ENDPOINTS.USER_BY_ID(id), {
    method: 'DELETE',
  }),
};
