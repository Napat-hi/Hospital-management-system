// Staff API Helper Functions
// This file handles all API calls from the Staff page to the backend

const API_URL = 'http://localhost:5001';

// Helper function to make API calls with error handling
const apiCall = async (url, options = {}) => {
  try {
    console.log('API Call:', url, options);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    return data;
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};

// ============================================
// PATIENT OPERATIONS
// ============================================

// Get all patients
const getPatients = async () => {
  return apiCall(`${API_URL}/api/patients`);
};

// Get single patient by ID
const getPatient = async (id) => {
  return apiCall(`${API_URL}/api/patients/${id}`);
};

// Create new patient
const createPatient = async (patientData) => {
  return apiCall(`${API_URL}/api/patients`, {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
};

// Update existing patient
const updatePatient = async (id, patientData) => {
  return apiCall(`${API_URL}/api/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
  });
};

// ============================================
// APPOINTMENT OPERATIONS
// ============================================

// Get all appointments
const getAppointments = async () => {
  return apiCall(`${API_URL}/api/appointments`);
};

// Get single appointment by ID
const getAppointment = async (id) => {
  return apiCall(`${API_URL}/api/appointments/${id}`);
};

// Create new appointment
const createAppointment = async (appointmentData) => {
  // Convert camelCase to snake_case for backend
  const backendData = {
    patient_id: appointmentData.patientId,
    doctor_id: appointmentData.doctorId,
    appointment_date: appointmentData.appointmentDate,
    appointment_time: appointmentData.appointmentTime,
    reason: appointmentData.reason
  };
  
  return apiCall(`${API_URL}/api/appointments`, {
    method: 'POST',
    body: JSON.stringify(backendData),
  });
};

// Update existing appointment
const updateAppointment = async (id, appointmentData) => {
  // Convert camelCase to snake_case for backend
  const backendData = {
    patient_id: appointmentData.patientId,
    doctor_id: appointmentData.doctorId,
    appointment_date: appointmentData.appointmentDate,
    appointment_time: appointmentData.appointmentTime,
    reason: appointmentData.reason,
    status: appointmentData.status
  };
  
  return apiCall(`${API_URL}/api/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(backendData),
  });
};

// Delete appointment
const deleteAppointment = async (id) => {
  return apiCall(`${API_URL}/api/appointments/${id}`, {
    method: 'DELETE',
  });
};

// ============================================
// DOCTOR OPERATIONS
// ============================================

// Get all doctors (for appointment creation dropdown)
const getDoctors = async () => {
  return apiCall(`${API_URL}/api/doctors`);
};

// ============================================
// BILLING OPERATIONS
// ============================================

// Generate bill for an appointment
const generateBill = async (billData) => {
  console.log('generateBill received:', billData);
  
  // Convert camelCase to snake_case for backend
  // Note: patient_id is automatically retrieved by backend from appointment
  const backendData = {
    appointment_id: billData.appointmentId,
    consultation_fee: billData.consultationFee,
    medication_cost: billData.medicationCost || 0,
    lab_tests_cost: billData.labTestsCost || 0
  };
  
  console.log('Converted to backend format:', backendData);
  
  return apiCall(`${API_URL}/api/bills`, {
    method: 'POST',
    body: JSON.stringify(backendData),
  });
};

// Get all bills
const getBills = async () => {
  return apiCall(`${API_URL}/api/bills`);
};

// Get single bill by ID
const getBill = async (id) => {
  return apiCall(`${API_URL}/api/bills/${id}`);
};

// Update bill
const updateBill = async (id, billData) => {
  console.log('staffAPI.updateBill called with:', { id, billData });
  return apiCall(`${API_URL}/api/bills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(billData),
  });
};

// Delete bill
const deleteBill = async (id) => {
  return apiCall(`${API_URL}/api/bills/${id}`, {
    method: 'DELETE',
  });
};

// Export all functions
export const staffAPI = {
  // Patients
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  
  // Appointments
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  
  // Doctors
  getDoctors,
  
  // Billing
  generateBill,
  getBills,
  getBill,
  updateBill,
  deleteBill,
};
