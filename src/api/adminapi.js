// Simple API helper for Admin Page
// This file makes it easy to call backend endpoints

const API_URL = 'http://localhost:5001';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}


// ADMIN PAGE API FUNCTIONS

export const adminAPI = {
  // Get all users (doctors and staff)
  getUsers: () => {
    return apiCall('/api/users');
  },
  
  // Create a new user (doctor or staff)
  createUser: (userData) => {
    return apiCall('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
  },
  
  // Update user by ID
  updateUser: (id, userData) => {
    return apiCall(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
  },
  
  // Delete/disable user by ID
  deleteUser: (id, role) => {
    return apiCall(`/api/users/${id}/disable`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role })
    });
  }
};
