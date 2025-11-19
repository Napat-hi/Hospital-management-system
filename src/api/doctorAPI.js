// Simple API helper for Doctor Page
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


// DOCTOR PAGE API FUNCTIONS

export const doctorAPI = {
  // Get all patients
  getPatients: () => {
    return apiCall('/api/patients');
  },
  
  // Get one patient by ID
  getPatient: (id) => {
    return apiCall(`/api/patients/${id}`);
  },
  
  // Get all appointments
  getAppointments: () => {
    return apiCall('/api/appointments');
  },
  
  // Get one appointment by ID
  getAppointment: (id) => {
    return apiCall(`/api/appointments/${id}`);
  },
  
  // Mark appointment as complete
  completeAppointment: (id) => {
    return apiCall(`/api/appointments/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
  },
  
  // Unmark appointment (back to scheduled)
  uncompleteAppointment: (id) => {
    return apiCall(`/api/appointments/${id}/uncomplete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
