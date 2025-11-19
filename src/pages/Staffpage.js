// Staffpage.jsx
// Staff Dashboard Page

/*
 * BACKEND INTEGRATION GUIDE
 * =========================
 * 
 * This file is ready for backend database integration. All CRUD operations and data fetching
 * have placeholder functions ready to connect to your API.
 * 
 * CURRENT STATE:
 * ✅ Frontend UI complete with all forms and validation
 * ✅ State management implemented
 * ✅ Placeholder API calls ready with detailed TODO comments
 * ⏳ Needs backend API connection
 * ⏳ Needs real database
 * 
 * 1. API ENDPOINTS TO IMPLEMENT:
 *    - GET    /api/patients              - Fetch all patients
 *    - GET    /api/patients/:id          - Fetch patient by ID
 *    - POST   /api/patients              - Create new patient
 *    - PUT    /api/patients/:id          - Update patient information
 *    - GET    /api/appointments          - Fetch all appointments
 *    - POST   /api/appointments          - Create new appointment
 *    - PUT    /api/appointments/:id      - Update appointment information
 *    - DELETE /api/appointments/:id      - Delete appointment
 *    - GET    /api/appointments/completed - Fetch completed appointments
 *    - POST   /api/billing/generate      - Generate bill for completed appointment
 *    - GET    /api/doctors               - Fetch all doctors
 * 
 * 2. EXPECTED DATA STRUCTURES:
 *    Patient Object: {
 *      id: number,
 *      first_name: string,
 *      last_name: string,
 *      sex: "Male" | "Female",
 *      dob: string (format: "YYYY-MM-DD"),
 *      address: string,
 *      phone: string,
 *      email: string
 *    }
 * 
 *    Appointment Object: {
 *      id: number,
 *      patient_id: number,
 *      patientName: string,
 *      doctor_id: number,
 *      doctorName: string,
 *      appointment_date: string (format: "YYYY-MM-DD"),
 *      appointment_time: string (format: "HH:MM AM/PM"),
 *      reason: string,
 *      status: "scheduled" | "completed"
 *    }
 * 
 *    Doctor Object: {
 *      id: number,
 *      name: string,
 *      department: string
 *    }
 * 
 *    Bill Object: {
 *      id: number,
 *      appointmentId: number,
 *      patient_id: number,
 *      patientName: string,
 *      doctorName: string,
 *      appointment_date: string,
 *      consultationFee: number,
 *      medicationCost: number,
 *      labTestsCost: number,
 *      totalAmount: number,
 *      status: "unpaid" | "paid",
 *      generatedDate: string,
 *      generatedBy: string
 *    }
 * 
 * 3. TODO ITEMS:
 *    - Replace dummyPatients with API call (see useEffect example at Line ~178)
 *    - Replace dummyAppointments with API call (see useEffect example at Line ~197)
 *    - Replace dummyDoctors with API call (see useEffect example at Line ~235)
 *    - Update handleCreatePatient to use POST endpoint (Line ~330)
 *    - Update handleUpdatePatient to use PUT endpoint (Line ~366)
 *    - Update handleCreateAppointment to use POST endpoint (Line ~508)
 *    - Update handleUpdateAppointment to use PUT endpoint (Line ~540)
 *    - Update handleDeleteAppointment to use DELETE endpoint (Line ~567)
 *    - Update handleGenerateBill to use POST endpoint (Line ~598)
 *    - Add loading states during API calls
 *    - Add proper error handling with user-friendly messages
 *    - Consider pagination for large datasets
 * 
 * 4. FUNCTIONS READY FOR BACKEND:
 *    - handleCreatePatient()        → POST /api/patients
 *    - handleUpdatePatient()        → PUT /api/patients/:id
 *    - handleCreateAppointment()    → POST /api/appointments
 *    - handleUpdateAppointment()    → PUT /api/appointments/:id
 *    - handleDeleteAppointment()    → DELETE /api/appointments/:id
 *    - handleGenerateBill()         → POST /api/billing/generate
 *    - handlePatientSearch()        → Uses dummyPatients (ready for API integration)
 *    - handleViewPatient()          → Selects from dummyPatients (ready for GET /api/patients/:id)
 * 
 * 5. FEATURES IMPLEMENTED:
 *    ✅ Patient Management: Create, view, edit, search patients
 *    ✅ Appointment Management: Create, edit, delete, view appointments with search
 *    ✅ Billing System: Generate bills from completed appointments
 *    ✅ Form Validation: All required fields validated
 *    ✅ Time Format Conversion: 12-hour to 24-hour format for editing
 *    ✅ Responsive Design: Works on mobile, tablet, desktop
 *    ✅ User Confirmations: Delete confirmations to prevent accidents
 * 
 * 6. ENVIRONMENT SETUP:
 *    Create a .env file in project root:
 *    REACT_APP_API_URL=http://your-backend-url
 *    
 *    Then use in code:
 *    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
 */

import React, { useMemo, useState, useEffect } from "react";
import { getStaff, disableStaff, activateStaff } from "../api/fetch";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { staffAPI } from "../api/staffAPI";

const calculateAge = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

export default function Staffpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Staff";
  const l_name = state.lastnames || "User";
  const photo  = state.photo || "";
  const listData = Array.isArray(state.listdata) ? state.listdata : [];
  const [staffList, setStaffList] = useState([]);

  // ---- UI state ----
  const [view, setView] = useState("appointments"); // 'patients' | 'billing' | 'appointments'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");
  
  // Patient view states
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [selectedpatient_id, setSelectedpatient_id] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [mainPatientSearchQuery, setMainPatientSearchQuery] = useState("");
  const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
  const [showEditPatientForm, setShowEditPatientForm] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    first_name: "",
    last_name: "",
    sex: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    emergency_contact: ""
  });
  const [editPatientFormData, setEditPatientFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    sex: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    emergency_contact: ""
  });
  
  // Appointment view states
  const [showCreateAppointmentForm, setShowCreateAppointmentForm] = useState(false);
  const [showEditAppointmentForm, setShowEditAppointmentForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [appointmentFormData, setAppointmentFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: ""
  });
  const [editAppointmentFormData, setEditAppointmentFormData] = useState({
    id: "",
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: ""
  });
  
  // Billing view states
  const [selectedBillingAppointmentId, setSelectedBillingAppointmentId] = useState("");
  const [generatedBill, setGeneratedBill] = useState(null);
  const [generatedBills, setGeneratedBills] = useState([]);
  const [billFormData, setBillFormData] = useState({
    consultationFee: "",
    medicationCost: "",
    labTestsCost: "",
    status: "unpaid"
  });

  // Validation errors states
  const [patientFormErrors, setPatientFormErrors] = useState({
    first_name: "",
    last_name: "",
    sex: "",
    dob: "",
    address: "",
    phone: "",
    email: "",
    emergency_contact: ""
  });

  const [appointmentFormErrors, setAppointmentFormErrors] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: ""
  });

  const [billFormErrors, setBillFormErrors] = useState({
    consultationFee: "",
    medicationCost: "",
    labTestsCost: ""
  });

  // ---- Dummy data for testing ----
  // ============================================
  // BACKEND DATA - Load from database
  // ============================================
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Load all data on component mount
  useEffect(() => {
    loadPatients();
    loadAppointments();
    loadDoctors();
    loadBills();
    loadStaff();
  }, []);

  const loadPatients = async () => {
try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const data = await staffAPI.getPatients(token);
    setPatients(data);
  } catch (error) {
    console.error("Error loading patients:", error);
    setError("Failed to load patients");
  } finally {
    setLoading(false);
  }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const data = await staffAPI.getAppointments(token);
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Failed to load appointments. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const data = await staffAPI.getDoctors();
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadBills = async () => {
    try {
      const data = await staffAPI.getCompletedAppointments();
      setBills(data);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const loadStaff = async () => {
  try {
      const token = localStorage.getItem("token");
      const data = await staffAPI.getStaff(token);
      setStaffList(data);
  } catch (error) {
    console.error("Error loading staff:", error);
    alert("Failed to load staff. Make sure backend is running!");
  }
};


  // ---- เมนูซ้าย (สไตล์เดียวกับ Doctorpage) ----
  const menu = [
    { key: "patients",   label: "Patient Information" },
    { key: "appointments", label: "Appointments" },
    { key: "billing",    label: "Generate Bill" },
    { key: "staff", label: "Staff Management" }
  ];

  // ---- Derived list ----
  const filteredSortedList = useMemo(() => {
    const copy = [...listData];
    const ft = filterText.trim().toLowerCase();
    const visible = ft
      ? copy.filter(u =>
          ["first_name", "last_name", "email"]
            .some(k => String(u[k] || "").toLowerCase().includes(ft))
        )
      : copy;

    const dir = sortDir === "asc" ? 1 : -1;
    visible.sort((a, b) => {
      const av = String(a?.[sortKey] ?? "");
      const bv = String(b?.[sortKey] ?? "");
      return av.localeCompare(bv) * dir;
    });
    return visible;
  }, [listData, filterText, sortKey, sortDir]);

  const cameWithState = f_name || l_name || photo || listData.length > 0;

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleLogout = () => {
    navigate("/"); // กลับหน้า login/หน้าแรก
  };

  const toggleStaffStatus = async (id, currentStatus) => {
  try {
    if (currentStatus === "ACTIVE") {
      await disableStaff(id);
      setStaffList(prev =>
        prev.map(s => s.id === id ? { ...s, status: "INACTIVE" } : s)
      );
    } else {
      await activateStaff(id);
      setStaffList(prev =>
        prev.map(s => s.id === id ? { ...s, status: "ACTIVE" } : s)
      );
    }
  } catch (error) {
    console.error("Error toggling staff status:", error);
    alert("Failed to update staff status.");
  }
};

  // ---- Validation helper functions ----
  const validateEmail = (email) => {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
  };

  // ---- Validate patient form ----
  const validatePatientForm = () => {
    const errors = {
      first_name: "",
      last_name: "",
      sex: "",
      dob: "",
      address: "",
      phone: "",
      email: "",
      emergency_contact: ""
    };
    let isValid = true;

    // First name validation
    if (!patientFormData.first_name.trim()) {
      errors.first_name = "First name is required";
      isValid = false;
    } else if (patientFormData.first_name.trim().length < 2) {
      errors.first_name = "First name must be at least 2 characters";
      isValid = false;
    }

    // Last name validation
    if (!patientFormData.last_name.trim()) {
      errors.last_name = "Last name is required";
      isValid = false;
    } else if (patientFormData.last_name.trim().length < 2) {
      errors.last_name = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Sex validation
    if (!patientFormData.sex) {
      errors.sex = "Sex is required";
      isValid = false;
    }

    // DOB validation
    if (!patientFormData.dob) {
      errors.dob = "Date of birth is required";
      isValid = false;
    } else {
      const dob = new Date(patientFormData.dob);
      const today = new Date();
      if (dob > today) {
        errors.dob = "Date of birth cannot be in the future";
        isValid = false;
      }
    }

    // Phone validation
    if (patientFormData.phone && !validatePhone(patientFormData.phone)) {
      errors.phone = "Invalid phone number format";
      isValid = false;
    }

    // Email validation
    if (patientFormData.email && !validateEmail(patientFormData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    setPatientFormErrors(errors);
    return isValid;
  };

  // ---- Validate appointment form ----
  const validateAppointmentForm = () => {
    const errors = {
      patient_id: "",
      doctor_id: "",
      appointment_date: "",
      appointment_time: "",
      reason: ""
    };
    let isValid = true;

    if (!appointmentFormData.patient_id) {
      errors.patient_id = "Please select a patient";
      isValid = false;
    }

    if (!appointmentFormData.doctor_id) {
      errors.doctor_id = "Please select a doctor";
      isValid = false;
    }

    if (!appointmentFormData.appointment_date) {
      errors.appointment_date = "Appointment date is required";
      isValid = false;
    } else {
      const appointment_date = new Date(appointmentFormData.appointment_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointment_date < today) {
        errors.appointment_date = "Appointment date cannot be in the past";
        isValid = false;
      }
    }

    if (!appointmentFormData.appointment_time) {
      errors.appointment_time = "Appointment time is required";
      isValid = false;
    }

    if (!appointmentFormData.reason.trim()) {
      errors.reason = "Reason for appointment is required";
      isValid = false;
    } else if (appointmentFormData.reason.trim().length < 10) {
      errors.reason = "Reason must be at least 10 characters";
      isValid = false;
    }

    setAppointmentFormErrors(errors);
    
    // Show validation errors to user
    if (!isValid) {
      const errorMessages = [];
      if (errors.patient_id) errorMessages.push('• ' + errors.patient_id);
      if (errors.doctor_id) errorMessages.push('• ' + errors.doctor_id);
      if (errors.appointment_date) errorMessages.push('• ' + errors.appointment_date);
      if (errors.appointment_time) errorMessages.push('• ' + errors.appointment_time);
      if (errors.reason) errorMessages.push('• ' + errors.reason);
      
      if (errorMessages.length > 0) {
        alert('Please fix the following errors:\n\n' + errorMessages.join('\n'));
      }
    }
    
    return isValid;
  };

  // ---- Validate bill form ----
  const validateBillForm = () => {
    const errors = {
      consultationFee: "",
      medicationCost: "",
      labTestsCost: ""
    };
    let isValid = true;

    if (!billFormData.consultationFee) {
      errors.consultationFee = "Consultation fee is required";
      isValid = false;
    } else if (parseFloat(billFormData.consultationFee) < 0) {
      errors.consultationFee = "Consultation fee must be non-negative";
      isValid = false;
    }

    if (!billFormData.medicationCost) {
      errors.medicationCost = "Medication cost is required";
      isValid = false;
    } else if (parseFloat(billFormData.medicationCost) < 0) {
      errors.medicationCost = "Medication cost must be non-negative";
      isValid = false;
    }

    if (!billFormData.labTestsCost) {
      errors.labTestsCost = "Lab tests cost is required";
      isValid = false;
    } else if (parseFloat(billFormData.labTestsCost) < 0) {
      errors.labTestsCost = "Lab tests cost must be non-negative";
      isValid = false;
    }

    setBillFormErrors(errors);
    return isValid;
  };

  // ---- Handle patient search ----
  const handlePatientSearch = async () => {
    console.log("Searching patients with:", mainPatientSearchQuery);
  try {
    const token = localStorage.getItem("token");
    const results = await staffAPI.searchPatients(mainPatientSearchQuery, token);
    setPatients(results); // or setSearchResults if you use a separate state
    setShowPatientResults(true);
    setSelectedPatient(null);
  } catch (error) {
    console.error("Error searching patients:", error);
    alert("Failed to search patients. Please check your connection.");
  }
};


  // ---- Handle patient selection ----
const handleViewPatient = async () => {
  if (!selectedpatient_id) {
    alert("Please select a patient to view");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const patient = await staffAPI.getPatient(selectedpatient_id, token);
    setSelectedPatient(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    alert("Failed to fetch patient details");
  }
};

  // ---- Handle patient form input changes ----
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setPatientFormErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // ---- Handle edit patient form input changes ----
  const handleEditPatientInputChange = (e) => {
    const { name, value } = e.target;
    setEditPatientFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ---- Handle edit patient button click ----
  const handleEditPatientClick = () => {
    if (selectedPatient) {
      setEditPatientFormData({
        id: selectedPatient.id,
        first_name: selectedPatient.first_name,
        last_name: selectedPatient.last_name,
        sex: selectedPatient.sex,
        dob: selectedPatient.dob,
        address: selectedPatient.address,
        phone: selectedPatient.phone || "",
        email: selectedPatient.email || ""
      });
      setShowEditPatientForm(true);
    }
  };

  // ---- Handle create patient ----
  // TODO: Replace with actual backend endpoint
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    console.log("Creating patient with:", patientFormData);
    // Validate form
    if (!validatePatientForm()) {
      return;
    }

    try {
      // Call backend API to create patient
      console.log("PatientFormData before send:", patientFormData);

      const cleanData = Object.fromEntries(
  Object.entries(patientFormData).map(([key, value]) => [key, value.trim()])
);

      console.log("CleanData being sent:", cleanData);

await staffAPI.createPatient(cleanData, localStorage.getItem("token"));

      
      alert("Patient created successfully!");
      
      // Reload patients from database
      await loadPatients();
      
      // Reset form
      setPatientFormData({
        first_name: "",
        last_name: "",
        sex: "",
        dob: "",
        address: "",
        phone: "",
        email: "",
        emergency_contact: ""
      });
      setPatientFormErrors({
        first_name: "",
        last_name: "",
        sex: "",
        dob: "",
        address: "",
        phone: "",
        email: "",
        emergency_contact: ""
      });
      setShowCreatePatientForm(false);
      
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  // ---- Handle update patient ----
  // TODO: Replace with actual backend endpoint
  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editPatientFormData.first_name || !editPatientFormData.last_name || !editPatientFormData.sex || !editPatientFormData.dob) {
      alert("Please fill in all required fields (First Name, Last Name, Sex, Date of Birth)");
      return;
    }

    try {
      // Call backend API to update patient
      await staffAPI.updatePatient(editPatientFormData.id, editPatientFormData, localStorage.getItem("token"));
      
      alert("Patient information updated successfully!");
      
      // Reload patients from database
      await loadPatients();
      
      // Update selected patient with new data
      setSelectedPatient({
        ...editPatientFormData
      });
      setShowEditPatientForm(false);
      
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  // ---- Handle appointment form input changes ----
  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setAppointmentFormErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // ---- Handle edit appointment form input changes ----
  const handleEditAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setEditAppointmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ---- Helper function to convert 12-hour time to 24-hour format ----
  const convertTo24Hour = (time12h) => {
    if (!time12h) return "";
    
    // If already in 24-hour format (no AM/PM), return as is
    if (!time12h.includes("AM") && !time12h.includes("PM")) {
      return time12h;
    }
    
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");
    
    if (hours === "12") {
      hours = modifier === "AM" ? "00" : "12";
    } else if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    
    // Ensure hours is always 2 digits
    hours = hours.padStart(2, "0");
    
    return `${hours}:${minutes}`;
  };

  // ---- Handle edit appointment button click ----
  const handleEditAppointmentClick = (appointment) => {
    // Close create form if open
    setShowCreateAppointmentForm(false);
    
    // Populate edit form with appointment data
    // Convert time to 24-hour format for the time input field
    setEditAppointmentFormData({
      id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date,
      appointment_time: convertTo24Hour(appointment.appointment_time),
      reason: appointment.reason
    });
    setSelectedAppointmentId(appointment.id);
    setShowEditAppointmentForm(true);
    
    // Scroll to top to see the edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- Filter patients by main search query (for viewing patient details) ----
  const mainSearchFilteredPatients = useMemo(() => {
    if (!mainPatientSearchQuery.trim()) return patients;
    const query = mainPatientSearchQuery.toLowerCase();
    return patients.filter(patient => {
      const firstName = patient.first_name || '';
      const lastName = patient.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return firstName.toLowerCase().includes(query) ||
             lastName.toLowerCase().includes(query) ||
             fullName.toLowerCase().includes(query);
    });
  }, [mainPatientSearchQuery, patients]);

  // ---- Filter patients by search query (for appointment form) ----
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) return patients;
    const query = patientSearchQuery.toLowerCase();
    return patients.filter(patient => {
      const firstName = patient.first_name || '';
      const lastName = patient.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return firstName.toLowerCase().includes(query) ||
             lastName.toLowerCase().includes(query) ||
             fullName.toLowerCase().includes(query);
    });
  }, [patientSearchQuery, patients]);

  // ---- Filter doctors by search query ----
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchQuery.trim()) return doctors;
    const query = doctorSearchQuery.toLowerCase();
    return doctors.filter(doctor => {
      const name = doctor.name || '';
      const department = doctor.department || doctor.specialization || '';
      return name.toLowerCase().includes(query) ||
             department.toLowerCase().includes(query);
    });
  }, [doctorSearchQuery, doctors]);

  // ---- Handle create appointment ----
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', appointmentFormData);
    
    // Validate form
    if (!validateAppointmentForm()) {
      console.log('Validation failed - check errors below');
      // Show validation errors to user
      const errorMessages = [];
      if (appointmentFormErrors.patient_id) errorMessages.push(appointmentFormErrors.patient_id);
      if (appointmentFormErrors.doctor_id) errorMessages.push(appointmentFormErrors.doctor_id);
      if (appointmentFormErrors.appointment_date) errorMessages.push(appointmentFormErrors.appointment_date);
      if (appointmentFormErrors.appointment_time) errorMessages.push(appointmentFormErrors.appointment_time);
      if (appointmentFormErrors.reason) errorMessages.push(appointmentFormErrors.reason);
      
      if (errorMessages.length > 0) {
        alert('Please fix the following errors:\n\n' + errorMessages.join('\n'));
      }
      return;
    }

    console.log('Validation passed, sending to API...');

    try {
      // Call backend API to create appointment
      const result = await staffAPI.createAppointment(appointmentFormData, localStorage.getItem("token"));
      console.log('API response:', result);
      
      alert("Appointment created successfully!");
      
      // Reload appointments from database
      await loadAppointments();
      
      // Reset form
      setAppointmentFormData({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: ""
      });
      setAppointmentFormErrors({
        patient_id: "",
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: ""
      });
      setPatientSearchQuery("");
      setDoctorSearchQuery("");
      setShowCreateAppointmentForm(false);
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  // ---- Handle update appointment ----
  // TODO: Replace with actual backend endpoint
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editAppointmentFormData.patient_id || !editAppointmentFormData.doctor_id || 
        !editAppointmentFormData.appointment_date || !editAppointmentFormData.appointment_time || 
        !editAppointmentFormData.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Call backend API to update appointment
      await staffAPI.updateAppointment(editAppointmentFormData.id, editAppointmentFormData, localStorage.getItem("token"));
      
      alert("Appointment updated successfully!");
      
      // Reload appointments from database
      await loadAppointments();
      
      // Reset form
      setShowEditAppointmentForm(false);
      setSelectedAppointmentId("");
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  // ---- Handle delete appointment ----
  const handleDeleteAppointment = async (appointmentId) => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone."
    );
    
    if (!confirmed) {
      return;
    }

    try {
      // Call backend API to delete appointment
      await staffAPI.deleteAppointment(appointmentId, localStorage.getItem("token"));
      
      alert("Appointment deleted successfully!");
      
      // Reload appointments from database
      await loadAppointments();
      
      // Close edit form if this appointment was being edited
      if (selectedAppointmentId === appointmentId) {
        setShowEditAppointmentForm(false);
        setSelectedAppointmentId("");
      }
      
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  // ---- Handle bill form input changes ----
  const handleBillInputChange = (e) => {
    const { name, value } = e.target;
    setBillFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setBillFormErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // ---- Handle generate bill ----
  // TODO: Replace with actual backend endpoint
  const handleGenerateBill = async (e) => {
    e.preventDefault();
    
    if (!selectedBillingAppointmentId) {
      alert("Please select a completed appointment");
      return;
    }

    // Validate form
    if (!validateBillForm()) {
      return;
    }

    try{
      const appointment = appointments.find(a => a.id === parseInt(selectedBillingAppointmentId));
      
      console.log('Selected appointment:', appointment);
      
      if (!appointment) {
        alert('Appointment not found!');
        return;
      }
      
      // Prepare bill data for backend
      // Note: patient_id will be automatically retrieved by backend from appointment
      const billData = {
        appointmentId: parseInt(selectedBillingAppointmentId),
        consultationFee: parseFloat(billFormData.consultationFee),
        medicationCost: parseFloat(billFormData.medicationCost) || 0,
        labTestsCost: parseFloat(billFormData.labTestsCost) || 0
      };
      
      console.log('Sending bill data:', billData);

      // Call backend API to generate bill
      const newBill = await staffAPI.generatBill(billFormData, localStorage.getItem("token"));
      
      setGeneratedBill(newBill);
      
      // Reload bills from database
      await loadBills();
      
      alert("Bill generated successfully!");
      
      // Reset form
      setBillFormData({
        consultationFee: "",
        medicationCost: "",
        labTestsCost: ""
      });
      setSelectedBillingAppointmentId("");
      
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  // ---- Handle delete bill ----
    const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Prefer a dedicated deleteBill API; fallback to other names if not available
      if (staffAPI.deleteBill) {
        await staffAPI.deleteBill(billId, token);
      } else if (staffAPI.deleteGeneratedBill) {
        await staffAPI.deleteGeneratedBill(billId, token);
      } else if (staffAPI.deleteAppointment) {
        // last resort: call deleteAppointment only if your backend expects the bill id there
        await staffAPI.deleteAppointment(billId, token);
      } else {
        throw new Error("No delete method available on staffAPI");
      }
      
      // Reload bills from database
      await loadBills();
      
      // If the deleted bill is the currently displayed one, clear it
      if (generatedBill && generatedBill.id === billId) {
        setGeneratedBill(null);
      }
      
      alert("Bill deleted successfully!");
      
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Error connecting to server. Please make sure backend is running!');
    }
  };

  return (
    <div className="doctor-layout">
      {/* Topbar */}
      <header className="doctor-topbar shadow-sm">
        <div className="container-fluid d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <img
              className="brand-icon"
              src="/images/hospital.png"
              alt=""
              onError={(e)=>{e.currentTarget.style.display="none";}}
            />
            <h1 className="h5 m-0 fw-semibold">Hospital Management System</h1>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="small text-muted">Signed in</div>
              <div className="fw-semibold">{f_name} {l_name}</div>
            </div>

            {photo ? (
              <img src={photo} alt="avatar" className="avatar" />
            ) : (
              <div className="avatar placeholder">{(f_name[0] || "S").toUpperCase()}</div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <aside className="col-12 col-md-3 col-lg-2 bg-light-subtle doctor-sidebar border-end">
            <div className="sticky-top pt-3">
              <ListGroup variant="flush" className="doctor-menu">
                {menu.map(item => (
                  <ListGroup.Item
                    key={item.key}
                    action
                    onClick={() => setView(item.key)}
                    className={`menu-item ${view === item.key ? "active" : ""}`}
                  >
                    {item.label}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {!cameWithState && (
                <div className="p-3 small text-warning">
                  No user data. Go back to <Link to="/home">Home</Link> and log in.
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="col-12 col-md-9 col-lg-10 py-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 m-0 text-muted">
                {menu.find(m => m.key === view)?.label || "Dashboard"}
              </h2>
              <div className="text-muted small">
                Total users: {listData.length}
              </div>
            </div>

            {/* PATIENT INFORMATION VIEW */}
            {view === "patients" && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Patient Information</h5>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowCreatePatientForm(true);
                      setShowPatientResults(false);
                      setSelectedPatient(null);
                    }}
                  >
                    + Create New Patient
                  </button>
                </div>

                {/* Create Patient Form */}
                {showCreatePatientForm && (
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Create New Patient</h5>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowCreatePatientForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <form onSubmit={handleCreatePatient}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">First Name <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="first_name"
                              value={patientFormData.first_name}
                              onChange={handlePatientInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Last Name <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="last_name"
                              value={patientFormData.last_name}
                              onChange={handlePatientInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Sex <span className="text-danger">*</span></label>
                            <select 
                              className="form-select"
                              name="sex"
                              value={patientFormData.sex}
                              onChange={handlePatientInputChange}
                              required
                            >
                              <option value="">Select Sex</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                            <input 
                              type="date" 
                              className="form-control" 
                              name="dob"
                              value={patientFormData.dob}
                              onChange={handlePatientInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Phone</label>
                            <input 
                              type="tel" 
                              className="form-control" 
                              name="phone"
                              value={patientFormData.phone}
                              onChange={handlePatientInputChange}
                              placeholder="555-0123"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input 
                              type="email" 
                              className="form-control" 
                              name="email"
                              value={patientFormData.email}
                              onChange={handlePatientInputChange}
                              placeholder="patient@email.com"
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Address</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="address"
                              value={patientFormData.address}
                              onChange={handlePatientInputChange}
                              placeholder="123 Main St, City"
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Emergency Contact</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="emergency_contact"
                              value={patientFormData.emergency_contact}
                              onChange={handlePatientInputChange}
                              placeholder="Contact name and phone number"
                            />
                          </div>
                          <div className="col-12">
                            <button type="submit" className="btn btn-primary">
                              Create Patient
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Search Patient */}
                {!showCreatePatientForm && (
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Search Patient</h5>
                      <p className="text-muted mb-3">
                        Search for a patient to view their information
                      </p>
                      <form className="row gy-2 gx-2" onSubmit={(e) => { e.preventDefault(); handlePatientSearch(); }}>
                        <div className="col-md-8">
                          <label className="form-label">Patient Name Search</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Search patient by name..." 
                            value={mainPatientSearchQuery}
                            onChange={(e) => setMainPatientSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button 
                            type="button" 
                            className="btn btn-outline-primary w-100"
                            onClick={handlePatientSearch}
                          >
                            Search
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {showPatientResults && !selectedPatient && (
                  <div className="card shadow-sm mt-3">
                    <div className="card-body">
                      <h5 className="card-title mb-3">
                        Search Results 
                        <span className="badge bg-info ms-2">{mainSearchFilteredPatients.length} found</span>
                      </h5>
                      <form className="row gy-2 gx-2">
                        <div className="col-md-8">
                          <label className="form-label">Select Patient</label>
                          <select 
                            className="form-select"
                            value={selectedpatient_id}
                            onChange={(e) => setSelectedpatient_id(e.target.value)}
                          >
                            <option value="">Select a patient to view</option>
                            {mainSearchFilteredPatients.map((patient) => (
                              <option key={patient.id} value={patient.id}>
                                {patient.first_name} {patient.last_name} - DOB: {patient.dob}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button 
                            type="button" 
                            className="btn btn-primary w-100"
                            onClick={handleViewPatient}
                          >
                            View Details
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Patient Details */}
                {selectedPatient && (
                  <div className="card shadow-sm mt-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Patient Details</h5>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setSelectedPatient(null);
                            setShowPatientResults(true);
                          }}
                        >
                          ← Back to Search
                        </button>
                      </div>
                      
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Full Name</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
                            disabled
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Sex</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.sex}
                            disabled
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Date of Birth</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.dob}
                            disabled
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Age</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={`${calculateAge(selectedPatient.dob)} years old`}
                            disabled
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Phone</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.phone || "N/A"}
                            disabled
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Email</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.email || "N/A"}
                            disabled
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Address</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.address}
                            disabled
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Emergency Contact</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.emergency_contact || "N/A"}
                            disabled
                          />
                        </div>
                        <div className="col-12">
                          <button 
                            type="button" 
                            className="btn btn-warning"
                            onClick={handleEditPatientClick}
                          >
                            Edit Patient Information
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Patient Form */}
                {showEditPatientForm && (
                  <div className="card shadow-sm mt-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">Edit Patient Information</h5>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setShowEditPatientForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <form onSubmit={handleUpdatePatient}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">First Name <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="first_name"
                              value={editPatientFormData.first_name}
                              onChange={handleEditPatientInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Last Name <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="last_name"
                              value={editPatientFormData.last_name}
                              onChange={handleEditPatientInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Sex <span className="text-danger">*</span></label>
                            <select 
                              className="form-select"
                              name="sex"
                              value={editPatientFormData.sex}
                              onChange={handleEditPatientInputChange}
                              required
                            >
                              <option value="">Select Sex</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                            <input 
                              type="date" 
                              className="form-control" 
                              name="dob"
                              value={editPatientFormData.dob}
                              onChange={handleEditPatientInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Phone</label>
                            <input 
                              type="tel" 
                              className="form-control" 
                              name="phone"
                              value={editPatientFormData.phone}
                              onChange={handleEditPatientInputChange}
                              placeholder="555-0123"
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input 
                              type="email" 
                              className="form-control" 
                              name="email"
                              value={editPatientFormData.email}
                              onChange={handleEditPatientInputChange}
                              placeholder="patient@email.com"
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Address</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="address"
                              value={editPatientFormData.address}
                              onChange={handleEditPatientInputChange}
                              placeholder="123 Main St, City"
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Emergency Contact</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              name="emergency_contact"
                              value={editPatientFormData.emergency_contact}
                              onChange={handleEditPatientInputChange}
                              placeholder="Contact name and phone number"
                            />
                          </div>
                          <div className="col-12">
                            <button type="submit" className="btn btn-primary">
                              Update Patient
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* APPOINTMENTS VIEW */}
            {view === "appointments" && (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Manage Appointments</h5>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateAppointmentForm(!showCreateAppointmentForm)}
                  >
                    {showCreateAppointmentForm ? "Cancel" : "+ Create New Appointment"}
                  </button>
                </div>

                {/* Edit Appointment Form */}
                {showEditAppointmentForm && (
                  <div className="card shadow-sm mb-3 border-warning" style={{ borderWidth: '3px' }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-pencil-square me-2"></i>
                          Edit Appointment #{selectedAppointmentId}
                        </h5>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setShowEditAppointmentForm(false);
                            setSelectedAppointmentId("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <form onSubmit={handleUpdateAppointment}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Patient <span className="text-danger">*</span></label>
                            <select 
                              className="form-select"
                              name="patient_id"
                              value={editAppointmentFormData.patient_id}
                              onChange={handleEditAppointmentInputChange}
                              required
                            >
                              <option value="">Select Patient</option>
                              {patients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name} (DOB: {patient.dob})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Doctor <span className="text-danger">*</span></label>
                            <select 
                              className="form-select"
                              name="doctor_id"
                              value={editAppointmentFormData.doctor_id}
                              onChange={handleEditAppointmentInputChange}
                              required
                            >
                              <option value="">Select Doctor</option>
                              {doctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                  {doctor.name} - {doctor.department}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Appointment Date <span className="text-danger">*</span></label>
                            <input 
                              type="date" 
                              className="form-control" 
                              name="appointment_date"
                              value={editAppointmentFormData.appointment_date}
                              onChange={handleEditAppointmentInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Appointment Time <span className="text-danger">*</span></label>
                            <input 
                              type="time" 
                              className="form-control" 
                              name="appointment_time"
                              value={editAppointmentFormData.appointment_time}
                              onChange={handleEditAppointmentInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Reason for Visit <span className="text-danger">*</span></label>
                            <textarea 
                              className="form-control" 
                              name="reason"
                              value={editAppointmentFormData.reason}
                              onChange={handleEditAppointmentInputChange}
                              rows="3"
                              placeholder="Describe the reason for this appointment..."
                              required
                            />
                          </div>
                          <div className="col-12">
                            <button type="submit" className="btn btn-warning">
                              <i className="bi bi-check-circle me-2"></i>
                              Update Appointment
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Create Appointment Form */}
                {showCreateAppointmentForm && (
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Create New Appointment</h5>
                      
                      <form onSubmit={handleCreateAppointment}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Patient <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control mb-2" 
                              placeholder="Type to search patient by name..."
                              value={patientSearchQuery}
                              onChange={(e) => setPatientSearchQuery(e.target.value)}
                            />
                            <select 
                              className="form-select"
                              name="patient_id"
                              value={appointmentFormData.patient_id}
                              onChange={handleAppointmentInputChange}
                              required
                            >
                              <option value="">-- Select Patient --</option>
                              {filteredPatients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name} (DOB: {patient.dob})
                                </option>
                              ))}
                            </select>
                            <small className="text-muted">{filteredPatients.length} patient(s) shown</small>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Doctor <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control mb-2" 
                              placeholder="Type to search doctor by name or department..."
                              value={doctorSearchQuery}
                              onChange={(e) => setDoctorSearchQuery(e.target.value)}
                            />
                            <select 
                              className="form-select"
                              name="doctor_id"
                              value={appointmentFormData.doctor_id}
                              onChange={handleAppointmentInputChange}
                              required
                            >
                              <option value="">-- Select Doctor --</option>
                              {filteredDoctors.map((doctor) => (
                                <option key={doctor.id} value={doctor.id}>
                                  {doctor.name} - {doctor.department || doctor.specialization || ''}
                                </option>
                              ))}
                            </select>
                            <small className="text-muted">{filteredDoctors.length} doctor(s) shown</small>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Appointment Date <span className="text-danger">*</span></label>
                            <input 
                              type="date" 
                              className="form-control" 
                              name="appointment_date"
                              value={appointmentFormData.appointment_date}
                              onChange={handleAppointmentInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Appointment Time <span className="text-danger">*</span></label>
                            <input 
                              type="time" 
                              className="form-control" 
                              name="appointment_time"
                              value={appointmentFormData.appointment_time}
                              onChange={handleAppointmentInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Reason for Visit <span className="text-danger">*</span></label>
                            <textarea 
                              className="form-control" 
                              name="reason"
                              value={appointmentFormData.reason}
                              onChange={handleAppointmentInputChange}
                              rows="3"
                              placeholder="Describe the reason for this appointment..."
                              required
                            />
                          </div>
                          <div className="col-12">
                            <button 
                              type="submit" 
                              className="btn btn-primary"
                              onClick={handleCreateAppointment}
                            >
                              Create Appointment
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Appointments List */}
                <div className="row g-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="col-12 col-md-6 col-lg-4">
                      <div className="card shadow-sm h-100 d-flex flex-column">
                        <div className="card-body flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="card-title mb-0">Appointment #{appointment.id}</h6>
                            <span className={`badge ${appointment.status === 'completed' ? 'bg-success' : 'bg-info'} text-white`}>
                              {appointment.status === 'completed' ? 'Completed' : 'Scheduled'}
                            </span>
                          </div>
                          <hr className="my-2" />
                          
                          <div className="mb-2">
                            <small className="text-muted d-block">Patient</small>
                            <strong>{appointment.patientName}</strong>
                          </div>
                          
                          <div className="mb-2">
                            <small className="text-muted d-block">Doctor</small>
                            <strong>{appointment.doctorName}</strong>
                          </div>
                          
                          <div className="mb-2">
                            <small className="text-muted d-block">Date & Time</small>
                            <strong>{appointment.appointment_date}</strong>
                            <span className="ms-2 text-primary">{appointment.appointment_time}</span>
                          </div>
                          
                          <div className="mb-0">
                            <small className="text-muted d-block">Reason</small>
                            <p className="mb-0 small">{appointment.reason}</p>
                          </div>
                        </div>
                        
                        <div className="card-footer bg-light d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditAppointmentClick(appointment)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {appointments.length === 0 && (
                  <div className="alert alert-info">
                    No appointments scheduled.
                  </div>
                )}
              </>
            )}

            {/* BILLING VIEW */}
            {view === "billing" && (
              <>
                <h5 className="mb-3">Generate Bill from Completed Appointment</h5>
                
                <div className="card shadow-sm mb-3">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Select Completed Appointment</h5>
                    
                    <form onSubmit={handleGenerateBill}>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label className="form-label">Completed Appointment <span className="text-danger">*</span></label>
                          <select 
                            className="form-select"
                            value={selectedBillingAppointmentId}
                            onChange={(e) => {
                              setSelectedBillingAppointmentId(e.target.value);
                              setGeneratedBill(null);
                            }}
                            required
                          >
                            <option value="">Select a completed appointment</option>
                            {appointments
                              .filter(a => a.status === 'completed')
                              .map((appointment) => (
                                <option key={appointment.id} value={appointment.id}>
                                  #{appointment.id} - {appointment.patientName} with {appointment.doctorName} on {appointment.appointment_date}
                                </option>
                              ))}
                          </select>
                        </div>

                        {selectedBillingAppointmentId && !generatedBill && (
                          <>
                            <div className="col-md-12">
                              <hr />
                              <h6 className="mb-3">Enter Cost Details</h6>
                            </div>
                            
                            <div className="col-md-4">
                              <label className="form-label">Consultation Fee ($) <span className="text-danger">*</span></label>
                              <input 
                                type="number" 
                                className="form-control" 
                                name="consultationFee"
                                value={billFormData.consultationFee}
                                onChange={handleBillInputChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                              />
                            </div>
                            
                            <div className="col-md-4">
                              <label className="form-label">Medication Cost ($) <span className="text-danger">*</span></label>
                              <input 
                                type="number" 
                                className="form-control" 
                                name="medicationCost"
                                value={billFormData.medicationCost}
                                onChange={handleBillInputChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                              />
                            </div>
                            
                            <div className="col-md-4">
                              <label className="form-label">Lab Tests Cost ($) <span className="text-danger">*</span></label>
                              <input 
                                type="number" 
                                className="form-control" 
                                name="labTestsCost"
                                value={billFormData.labTestsCost}
                                onChange={handleBillInputChange}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                required
                              />
                            </div>

                            <div className="col-12">
                              <button type="submit" className="btn btn-success">
                                Generate Bill
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </form>
                  </div>
                </div>

                {/* Generated Bill Display */}
                {generatedBill && (
                  <div className="card shadow-sm border-success">
                    <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Bill #{generatedBill.id}</h5>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteBill(generatedBill.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete Bill
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <strong>Bill ID:</strong> #{generatedBill.id}
                        </div>
                        <div className="col-md-6">
                          <strong>Status:</strong> 
                          <span className="badge bg-warning text-dark ms-2">{(generatedBill.status || 'OPEN').toUpperCase()}</span>
                        </div>
                        <div className="col-md-6">
                          <strong>Patient ID:</strong> #{generatedBill.patient_id}
                        </div>
                        <div className="col-md-6">
                          <strong>Total Amount:</strong> 
                          <span className="text-success fs-5 fw-bold">${parseFloat(generatedBill.total || 0).toFixed(2)}</span>
                        </div>
                        
                        <div className="col-12 mt-3">
                          <div className="alert alert-success">
                            <i className="bi bi-check-circle me-2"></i>
                            Bill generated successfully! Bill ID: #{generatedBill.id}
                          </div>
                        </div>

                        <div className="col-12">
                          <button 
                            className="btn btn-primary me-2"
                            onClick={() => window.print()}
                          >
                            Print Bill
                          </button>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setGeneratedBill(null);
                          setSelectedBillingAppointmentId("");
                          setBillFormData({
                            consultationFee: "",
                            medicationCost: "",
                            labTestsCost: "",
                            status: "unpaid"
                          });
                        }}
                      >
                        Generate New Bill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

                {/* All Generated Bills List */}
                {generatedBills.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-3">All Generated Bills</h5>
                    <div className="row g-3">
                      {generatedBills.map((bill) => (
                        <div key={bill.id} className="col-md-6 col-lg-4">
                          <div className="card shadow-sm h-100">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">Bill #{bill.id}</h6>
                              <span className={`badge ${bill.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {(bill.status || 'OPEN').toUpperCase()}
                              </span>
                            </div>
                            <div className="card-body">
                              <div className="mb-2">
                                <small className="text-muted">Patient</small>
                                <div className="fw-semibold">{bill.patientName || 'N/A'}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Patient ID</small>
                                <div>#{bill.patient_id}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Generated Date</small>
                                <div>{bill.generatedDate || 'N/A'}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Total Amount</small>
                                <div className="fs-5 fw-bold text-success">${parseFloat(bill.totalAmount || 0).toFixed(2)}</div>
                              </div>
                            </div>
                            <div className="card-footer bg-light d-flex justify-content-end gap-2">
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteBill(bill.id)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}                {appointments.filter(a => a.status === 'completed').length === 0 && (
                  <div className="alert alert-warning">
                    No completed appointments available for billing.
                  </div>
                )}
              </>
            )}
            {view === "staff" && (
  <div>
    <h3>Staff List</h3>
    <table border="1" cellPadding="8">
      <thead>
        <tr>
          <th>Name</th><th>Position</th><th>Department</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {staffList.map(s => (
          <tr key={s.id}>
            <td>{s.first_name} {s.last_name}</td>
            <td>{s.position}</td>
            <td>{s.department}</td>
            <td>{s.status}</td>
            <td>
              <button onClick={() => toggleStaffStatus(s.id, s.status)}>
                {s.status === "ACTIVE" ? "Disable" : "Activate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
          </main>
        </div>
      </div>
    </div>
  );
}
