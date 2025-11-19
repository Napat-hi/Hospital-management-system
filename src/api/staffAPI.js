// Staff API Helper Functions
// This file handles all API calls from the Staff page to the backend

const API_URL = 'http://localhost:5001';

// Helper function to make API calls with error handling
const apiCall = async (url, options = {}) => {
  try {
    console.log("API Call:", url, options);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...options.headers,
      },
      ...options,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(
        `API Error: ${response.status} - ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const data = await response.json();
    console.log("API Response data:", data);
    return data;
  } catch (error) {
    console.error("API Call Failed:", error);
    throw error;
  }
};

// ============================================
// PATIENT OPERATIONS (Protected)
// ============================================
const searchPatients = async (term, token) =>
  apiCall(`${API_URL}/api/patients/search?q=${encodeURIComponent(term)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

const getPatients = async (token) =>
  apiCall(`${API_URL}/api/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });

const getPatient = async (id, token) =>
  apiCall(`${API_URL}/api/patients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

const createPatient = async (patientData, token) =>
  apiCall(`${API_URL}/api/patients`, {
    method: "POST",
    body: JSON.stringify(patientData),
    headers: { 
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
  });

const updatePatient = async (id, patientData, token) =>
  apiCall(`${API_URL}/api/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patientData),
    headers: { Authorization: `Bearer ${token}` },
  });

// ============================================
// APPOINTMENT OPERATIONS (Protected)
// ============================================

const getAppointments = async (token) =>
  apiCall(`${API_URL}/api/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

const createAppointment = async (appointmentData, token) =>
  apiCall(`${API_URL}/api/appointments`, {
    method: "POST",
    body: JSON.stringify(appointmentData),
    headers: { Authorization: `Bearer ${token}` },
  });

const updateAppointment = async (id, appointmentData, token) =>
  apiCall(`${API_URL}/api/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(appointmentData),
    headers: { Authorization: `Bearer ${token}` },
  });

const deleteAppointment = async (id, token) =>
  apiCall(`${API_URL}/api/appointments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

// ============================================
// DOCTOR OPERATIONS (Protected)
// ============================================

const getDoctors = async (token) =>
  apiCall(`${API_URL}/api/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ============================================
// BILL OPERATIONS (Protected)
// ============================================

// Get all bills
const getBills = async (token) =>
  apiCall(`${API_URL}/api/bills`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Generate a new bill
const generateBill = async (billData, token) =>
  apiCall(`${API_URL}/api/bills`, {
    method: "POST",
    body: JSON.stringify(billData),
    headers: { Authorization: `Bearer ${token}` },
  });

// ============================================
// STAFF MANAGEMENT (Protected)
// ============================================

const getStaff = async (token) =>
  apiCall(`${API_URL}/api/staff`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================

export const staffAPI = {
  // Patients
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  searchPatients,

  // Appointments
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,

  // Doctors
  getDoctors,

  // Bills
  getBills,
  generateBill,

  // Staff
  getStaff,
};
