// API Configuration File
// Replace these values with your actual backend configuration

// Base URL for your backend API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // User Management
  USERS: '/api/users',
  USER_BY_ID: (id) => `/api/users/${id}`,

  // Staff Management
  STAFF: '/api/staff',
  STAFF_BY_ID: (id) => `/api/staff/${id}`,
  STAFF_DISABLE: (id) => `/api/staff/${id}/disable`,

  // Patients
  PATIENTS: '/api/patients',
  PATIENT_BY_ID: (id) => `/api/patients/${id}`,

  // Appointments
  APPOINTMENTS: '/api/appointments',
  APPOINTMENT_BY_ID: (id) => `/api/appointments/${id}`,
  APPOINTMENT_COMPLETE: (id) => `/api/appointments/${id}/complete`,
  APPOINTMENT_UNCOMPLETE: (id) => `/api/appointments/${id}/uncomplete`,

  // Doctors
  DOCTORS: '/api/doctors',

  // Bills
  BILLS: '/api/bills',
  BILL_BY_ID: (id) => `/api/bills/${id}`,

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

// API request helper function
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ==============================
// User API functions
// ==============================
export const userAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.USERS, { method: 'GET' }),
  getById: (id) => apiRequest(API_ENDPOINTS.USER_BY_ID(id), { method: 'GET' }),
  create: (userData) => apiRequest(API_ENDPOINTS.USERS, {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id, userData) => apiRequest(API_ENDPOINTS.USER_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  delete: (id) => apiRequest(API_ENDPOINTS.USER_BY_ID(id), { method: 'DELETE' }),
};

// ==============================
// Staff API functions
// ==============================
export const staffAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.STAFF, { method: 'GET' }),
  getById: (id) => apiRequest(API_ENDPOINTS.STAFF_BY_ID(id), { method: 'GET' }),
  create: (staffData) => apiRequest(API_ENDPOINTS.STAFF, {
    method: 'POST',
    body: JSON.stringify(staffData),
  }),
  update: (id, staffData) => apiRequest(API_ENDPOINTS.STAFF_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(staffData),
  }),
  disable: (id) => apiRequest(API_ENDPOINTS.STAFF_DISABLE(id), { method: 'PATCH' }),
};

// ==============================
// Patient API functions
// ==============================
export const patientAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.PATIENTS, { method: 'GET' }),
  getById: (id) => apiRequest(API_ENDPOINTS.PATIENT_BY_ID(id), { method: 'GET' }),
  create: (patientData) => apiRequest(API_ENDPOINTS.PATIENTS, {
    method: 'POST',
    body: JSON.stringify(patientData),
  }),
  update: (id, patientData) => apiRequest(API_ENDPOINTS.PATIENT_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(patientData),
  }),
};

// ==============================
// Appointment API functions
// ==============================
export const appointmentAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.APPOINTMENTS, { method: 'GET' }),
  getById: (id) => apiRequest(API_ENDPOINTS.APPOINTMENT_BY_ID(id), { method: 'GET' }),
  create: (appointmentData) => apiRequest(API_ENDPOINTS.APPOINTMENTS, {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  }),
  update: (id, appointmentData) => apiRequest(API_ENDPOINTS.APPOINTMENT_BY_ID(id), {
    method: 'PUT',
    body: JSON.stringify(appointmentData),
  }),
  delete: (id) => apiRequest(API_ENDPOINTS.APPOINTMENT_BY_ID(id), { method: 'DELETE' }),
  complete: (id) => apiRequest(API_ENDPOINTS.APPOINTMENT_COMPLETE(id), { method: 'PATCH' }),
  uncomplete: (id) => apiRequest(API_ENDPOINTS.APPOINTMENT_UNCOMPLETE(id), { method: 'PATCH' }),
};

// ==============================
// Doctor API functions
// ==============================
export const doctorAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.DOCTORS, { method: 'GET' }),
};

// ==============================
// Bill API functions
// ==============================
export const billAPI = {
  getAll: () => apiRequest(API_ENDPOINTS.BILLS, { method: 'GET' }),
  getById: (id) => apiRequest(API_ENDPOINTS.BILL_BY_ID(id), { method: 'GET' }),
  create: (billData) => apiRequest(API_ENDPOINTS.BILLS, {
    method: 'POST',
    body: JSON.stringify(billData),
  }),
  delete: (id) => apiRequest(API_ENDPOINTS.BILL_BY_ID(id), { method: 'DELETE' }),
};
