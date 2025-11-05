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
 *      patientId: number,
 *      patientName: string,
 *      doctorId: number,
 *      doctorName: string,
 *      appointmentDate: string (format: "YYYY-MM-DD"),
 *      appointmentTime: string (format: "HH:MM AM/PM"),
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
 *      patientId: number,
 *      patientName: string,
 *      doctorName: string,
 *      appointmentDate: string,
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

import React, { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

export default function Staffpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Staff";
  const l_name = state.lastnames || "User";
  const photo  = state.photo || "";
  const listData = Array.isArray(state.listdata) ? state.listdata : [];

  // ---- UI state ----
  const [view, setView] = useState("appointments"); // 'patients' | 'billing' | 'appointments'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");
  
  // Patient view states
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showCreatePatientForm, setShowCreatePatientForm] = useState(false);
  const [showEditPatientForm, setShowEditPatientForm] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    first_name: "",
    last_name: "",
    sex: "",
    dob: "",
    address: "",
    phone: "",
    email: ""
  });
  const [editPatientFormData, setEditPatientFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    sex: "",
    dob: "",
    address: "",
    phone: "",
    email: ""
  });
  
  // Appointment view states
  const [showCreateAppointmentForm, setShowCreateAppointmentForm] = useState(false);
  const [showEditAppointmentForm, setShowEditAppointmentForm] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");
  const [appointmentFormData, setAppointmentFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: ""
  });
  const [editAppointmentFormData, setEditAppointmentFormData] = useState({
    id: "",
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
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

  // ---- Dummy data for testing ----
  // TODO: Replace with API calls
  // Example implementation:
  // const [patients, setPatients] = useState([]);
  // useEffect(() => {
  //   const fetchPatients = async () => {
  //     try {
  //       const response = await fetch('http://your-backend-url/api/patients');
  //       const data = await response.json();
  //       setPatients(data);
  //     } catch (error) {
  //       console.error('Error fetching patients:', error);
  //       alert('Failed to load patients. Please try again.');
  //     }
  //   };
  //   fetchPatients();
  // }, []);
  const dummyPatients = [
    { id: 1, first_name: "Alice", last_name: "Johnson", sex: "Female", dob: "1985-03-15", address: "123 Main St, Springfield", phone: "555-0101", email: "alice.j@email.com" },
    { id: 2, first_name: "Bob", last_name: "Smith", sex: "Male", dob: "1978-07-22", address: "456 Oak Ave, Riverside", phone: "555-0102", email: "bob.s@email.com" },
    { id: 3, first_name: "Carol", last_name: "Williams", sex: "Female", dob: "1990-11-30", address: "789 Pine Rd, Lakewood", phone: "555-0103", email: "carol.w@email.com" },
    { id: 4, first_name: "David", last_name: "Brown", sex: "Male", dob: "1965-05-18", address: "321 Elm St, Hillside", phone: "555-0104", email: "david.b@email.com" },
    { id: 5, first_name: "Emma", last_name: "Davis", sex: "Female", dob: "2000-09-08", address: "654 Maple Dr, Greenfield", phone: "555-0105", email: "emma.d@email.com" },
  ];

  // TODO: Replace with API calls
  // Example implementation:
  // const [appointments, setAppointments] = useState([]);
  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     try {
  //       const response = await fetch('http://your-backend-url/api/appointments');
  //       const data = await response.json();
  //       setAppointments(data);
  //     } catch (error) {
  //       console.error('Error fetching appointments:', error);
  //       alert('Failed to load appointments. Please try again.');
  //     }
  //   };
  //   fetchAppointments();
  // }, []);
  const dummyAppointments = [
    { 
      id: 1, 
      patientId: 1,
      patientName: "Alice Johnson", 
      doctorId: 1,
      doctorName: "Dr. Sarah Brown", 
      appointmentDate: "2025-11-05", 
      appointmentTime: "09:00 AM", 
      reason: "Annual physical examination and blood work",
      status: "scheduled"
    },
    { 
      id: 2, 
      patientId: 2,
      patientName: "Bob Smith", 
      doctorId: 2,
      doctorName: "Dr. John Doe", 
      appointmentDate: "2025-11-05", 
      appointmentTime: "10:30 AM", 
      reason: "Follow-up consultation for hypertension",
      status: "completed"
    },
    { 
      id: 3, 
      patientId: 3,
      patientName: "Carol Williams", 
      doctorId: 3,
      doctorName: "Dr. Emily Davis", 
      appointmentDate: "2025-11-06", 
      appointmentTime: "02:00 PM", 
      reason: "Prenatal checkup - 20 weeks",
      status: "completed"
    },
    { 
      id: 4, 
      patientId: 4,
      patientName: "David Brown", 
      doctorId: 4,
      doctorName: "Dr. Lisa Anderson", 
      appointmentDate: "2025-11-06", 
      appointmentTime: "11:00 AM", 
      reason: "Neurological assessment for recurring headaches",
      status: "scheduled"
    },
  ];

  // TODO: Replace with API calls
  // Example implementation:
  // const [doctors, setDoctors] = useState([]);
  // useEffect(() => {
  //   const fetchDoctors = async () => {
  //     try {
  //       const response = await fetch('http://your-backend-url/api/doctors');
  //       const data = await response.json();
  //       setDoctors(data);
  //     } catch (error) {
  //       console.error('Error fetching doctors:', error);
  //     }
  //   };
  //   fetchDoctors();
  // }, []);
  const dummyDoctors = [
    { id: 1, name: "Dr. Sarah Brown", department: "General Practice" },
    { id: 2, name: "Dr. John Doe", department: "Cardiology" },
    { id: 3, name: "Dr. Emily Davis", department: "Obstetrics" },
    { id: 4, name: "Dr. Lisa Anderson", department: "Neurology" },
    { id: 5, name: "Dr. Jane Smith", department: "Pediatrics" },
  ];

  // ---- เมนูซ้าย (สไตล์เดียวกับ Doctorpage) ----
  const menu = [
    { key: "patients",   label: "Patient Information" },
    { key: "appointments", label: "Appointments" },
    { key: "billing",    label: "Generate Bill" },
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

  // ---- Handle patient search ----
  const handlePatientSearch = () => {
    setShowPatientResults(true);
  };

  // ---- Handle patient selection ----
  const handleViewPatient = () => {
    if (!selectedPatientId) {
      alert("Please select a patient to view");
      return;
    }

    const patient = dummyPatients.find(p => p.id === parseInt(selectedPatientId));
    if (patient) {
      setSelectedPatient(patient);
    }
  };

  // ---- Handle patient form input changes ----
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientFormData(prev => ({
      ...prev,
      [name]: value
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
    
    // Validate required fields
    if (!patientFormData.first_name || !patientFormData.last_name || !patientFormData.sex || !patientFormData.dob) {
      alert("Please fill in all required fields (First Name, Last Name, Sex, Date of Birth)");
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://your-backend-url/api/patients', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(patientFormData)
      // });
      // const data = await response.json();

      alert("Patient created successfully!");
      
      // Reset form
      setPatientFormData({
        first_name: "",
        last_name: "",
        sex: "",
        dob: "",
        address: "",
        phone: "",
        email: ""
      });
      setShowCreatePatientForm(false);
      
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error connecting to server. Please try again later.');
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
      // TODO: Replace with actual API call
      // const response = await fetch(`http://your-backend-url/api/patients/${editPatientFormData.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editPatientFormData)
      // });
      // const data = await response.json();

      alert("Patient information updated successfully!");
      
      // Update selected patient with new data
      setSelectedPatient({
        ...editPatientFormData
      });
      setShowEditPatientForm(false);
      
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle appointment form input changes ----
  const handleAppointmentInputChange = (e) => {
    const { name, value } = e.target;
    setAppointmentFormData(prev => ({
      ...prev,
      [name]: value
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
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: convertTo24Hour(appointment.appointmentTime),
      reason: appointment.reason
    });
    setSelectedAppointmentId(appointment.id);
    setShowEditAppointmentForm(true);
    
    // Scroll to top to see the edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- Filter patients by search query ----
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) return dummyPatients;
    const query = patientSearchQuery.toLowerCase();
    return dummyPatients.filter(patient => 
      patient.first_name.toLowerCase().includes(query) ||
      patient.last_name.toLowerCase().includes(query) ||
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(query)
    );
  }, [patientSearchQuery]);

  // ---- Filter doctors by search query ----
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchQuery.trim()) return dummyDoctors;
    const query = doctorSearchQuery.toLowerCase();
    return dummyDoctors.filter(doctor => 
      doctor.name.toLowerCase().includes(query) ||
      doctor.department.toLowerCase().includes(query)
    );
  }, [doctorSearchQuery]);

  // ---- Handle create appointment ----
  // TODO: Replace with actual backend endpoint
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!appointmentFormData.patientId || !appointmentFormData.doctorId || 
        !appointmentFormData.appointmentDate || !appointmentFormData.appointmentTime || 
        !appointmentFormData.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('http://your-backend-url/api/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(appointmentFormData)
      // });
      // const data = await response.json();

      alert("Appointment created successfully!");
      
      // Reset form
      setAppointmentFormData({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
      });
      setPatientSearchQuery("");
      setDoctorSearchQuery("");
      setShowCreateAppointmentForm(false);
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle update appointment ----
  // TODO: Replace with actual backend endpoint
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!editAppointmentFormData.patientId || !editAppointmentFormData.doctorId || 
        !editAppointmentFormData.appointmentDate || !editAppointmentFormData.appointmentTime || 
        !editAppointmentFormData.reason) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`http://your-backend-url/api/appointments/${editAppointmentFormData.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(editAppointmentFormData)
      // });
      // const data = await response.json();

      alert("Appointment updated successfully!");
      
      // Reset form
      setShowEditAppointmentForm(false);
      setSelectedAppointmentId("");
      
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle delete appointment ----
  // TODO: Replace with actual backend endpoint
  const handleDeleteAppointment = async (appointmentId) => {
    // Confirm deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone."
    );
    
    if (!confirmed) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`http://your-backend-url/api/appointments/${appointmentId}`, {
      //   method: 'DELETE',
      //   headers: { 'Content-Type': 'application/json' }
      // });
      // const data = await response.json();

      alert("Appointment deleted successfully!");
      
      // Close edit form if this appointment was being edited
      if (selectedAppointmentId === appointmentId) {
        setShowEditAppointmentForm(false);
        setSelectedAppointmentId("");
      }
      
      // TODO: Refresh appointments list after successful deletion
      // This will happen automatically when you connect to backend
      
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle bill form input changes ----
  const handleBillInputChange = (e) => {
    const { name, value } = e.target;
    setBillFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validate costs
    if (!billFormData.consultationFee || !billFormData.medicationCost || !billFormData.labTestsCost) {
      alert("Please fill in all cost fields");
      return;
    }

    try {
      const appointment = dummyAppointments.find(a => a.id === parseInt(selectedBillingAppointmentId));
      
      const totalAmount = 
        parseFloat(billFormData.consultationFee) + 
        parseFloat(billFormData.medicationCost) + 
        parseFloat(billFormData.labTestsCost);

      const bill = {
        id: Math.floor(Math.random() * 10000),
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        appointmentDate: appointment.appointmentDate,
        consultationFee: parseFloat(billFormData.consultationFee),
        medicationCost: parseFloat(billFormData.medicationCost),
        labTestsCost: parseFloat(billFormData.labTestsCost),
        totalAmount: totalAmount,
        status: "unpaid",
        generatedDate: new Date().toISOString().split('T')[0],
        generatedBy: `${f_name} ${l_name}`
      };

      // TODO: Replace with actual API call
      // const response = await fetch('http://your-backend-url/api/billing/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     appointmentId: selectedBillingAppointmentId,
      //     ...billFormData
      //   })
      // });
      // const data = await response.json();

      setGeneratedBill(bill);
      setGeneratedBills(prev => [...prev, bill]);
      alert("Bill generated successfully!");
      
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle delete bill ----
  // TODO: Replace with actual backend endpoint
  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`http://your-backend-url/api/billing/${billId}`, {
      //   method: 'DELETE'
      // });
      // if (!response.ok) {
      //   throw new Error('Failed to delete bill');
      // }

      setGeneratedBills(prev => prev.filter(bill => bill.id !== billId));
      
      // If the deleted bill is the currently displayed one, clear it
      if (generatedBill && generatedBill.id === billId) {
        setGeneratedBill(null);
      }
      
      alert("Bill deleted successfully!");
      
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Error connecting to server. Please try again later.');
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
                      <form className="row gy-2 gx-2">
                        <div className="col-md-8">
                          <label className="form-label">Patient Name Search</label>
                          <input type="text" className="form-control" placeholder="Search patient by name..." />
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
                      <h5 className="card-title mb-3">Search Results</h5>
                      <form className="row gy-2 gx-2">
                        <div className="col-md-8">
                          <label className="form-label">Select Patient</label>
                          <select 
                            className="form-select"
                            value={selectedPatientId}
                            onChange={(e) => setSelectedPatientId(e.target.value)}
                          >
                            <option value="">Select a patient to view</option>
                            {dummyPatients.map((patient) => (
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
                            value={`${new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()} years old`}
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
                              name="patientId"
                              value={editAppointmentFormData.patientId}
                              onChange={handleEditAppointmentInputChange}
                              required
                            >
                              <option value="">Select Patient</option>
                              {dummyPatients.map((patient) => (
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
                              name="doctorId"
                              value={editAppointmentFormData.doctorId}
                              onChange={handleEditAppointmentInputChange}
                              required
                            >
                              <option value="">Select Doctor</option>
                              {dummyDoctors.map((doctor) => (
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
                              name="appointmentDate"
                              value={editAppointmentFormData.appointmentDate}
                              onChange={handleEditAppointmentInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Appointment Time <span className="text-danger">*</span></label>
                            <input 
                              type="time" 
                              className="form-control" 
                              name="appointmentTime"
                              value={editAppointmentFormData.appointmentTime}
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
                              placeholder="Search patient by name..."
                              value={patientSearchQuery}
                              onChange={(e) => setPatientSearchQuery(e.target.value)}
                            />
                            <select 
                              className="form-select"
                              name="patientId"
                              value={appointmentFormData.patientId}
                              onChange={handleAppointmentInputChange}
                              required
                              size="5"
                            >
                              <option value="">Select Patient</option>
                              {filteredPatients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                  {patient.first_name} {patient.last_name} (DOB: {patient.dob})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Doctor <span className="text-danger">*</span></label>
                            <input 
                              type="text" 
                              className="form-control mb-2" 
                              placeholder="Search doctor by name or department..."
                              value={doctorSearchQuery}
                              onChange={(e) => setDoctorSearchQuery(e.target.value)}
                            />
                            <select 
                              className="form-select"
                              name="doctorId"
                              value={appointmentFormData.doctorId}
                              onChange={handleAppointmentInputChange}
                              required
                              size="5"
                            >
                              <option value="">Select Doctor</option>
                              {filteredDoctors.map((doctor) => (
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
                              name="appointmentDate"
                              value={appointmentFormData.appointmentDate}
                              onChange={handleAppointmentInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Appointment Time <span className="text-danger">*</span></label>
                            <input 
                              type="time" 
                              className="form-control" 
                              name="appointmentTime"
                              value={appointmentFormData.appointmentTime}
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
                            <button type="submit" className="btn btn-primary">
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
                  {dummyAppointments.map((appointment) => (
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
                            <strong>{appointment.appointmentDate}</strong>
                            <span className="ms-2 text-primary">{appointment.appointmentTime}</span>
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

                {dummyAppointments.length === 0 && (
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
                            {dummyAppointments
                              .filter(a => a.status === 'completed')
                              .map((appointment) => (
                                <option key={appointment.id} value={appointment.id}>
                                  #{appointment.id} - {appointment.patientName} with {appointment.doctorName} on {appointment.appointmentDate}
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
                          <strong>Billed To (Patient ID):</strong> #{generatedBill.patientId}
                        </div>
                        <div className="col-md-6">
                          <strong>Status:</strong> 
                          <span className="badge bg-warning text-dark ms-2">{generatedBill.status.toUpperCase()}</span>
                        </div>
                        <div className="col-md-6">
                          <strong>Patient:</strong> {generatedBill.patientName}
                        </div>
                        <div className="col-md-6">
                          <strong>Doctor:</strong> {generatedBill.doctorName}
                        </div>
                        <div className="col-md-6">
                          <strong>Appointment Date:</strong> {generatedBill.appointmentDate}
                        </div>
                        <div className="col-md-6">
                          <strong>Bill Generated:</strong> {generatedBill.generatedDate}
                        </div>
                        <div className="col-md-12">
                          <strong>Generated By:</strong> {generatedBill.generatedBy}
                        </div>
                        
                        <div className="col-12">
                          <hr />
                          <h6>Cost Breakdown</h6>
                        </div>
                        
                        <div className="col-12">
                          <table className="table table-sm">
                            <tbody>
                              <tr>
                                <td>Consultation Fee</td>
                                <td className="text-end">${generatedBill.consultationFee.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td>Medication Cost</td>
                                <td className="text-end">${generatedBill.medicationCost.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td>Lab Tests Cost</td>
                                <td className="text-end">${generatedBill.labTestsCost.toFixed(2)}</td>
                              </tr>
                              <tr className="fw-bold border-top border-2">
                                <td>TOTAL</td>
                                <td className="text-end text-success fs-5">${generatedBill.totalAmount.toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
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
                                {bill.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="card-body">
                              <div className="mb-2">
                                <small className="text-muted">Patient</small>
                                <div className="fw-semibold">{bill.patientName}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Doctor</small>
                                <div>{bill.doctorName}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Date</small>
                                <div>{bill.appointmentDate}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Total Amount</small>
                                <div className="fs-5 fw-bold text-success">${bill.totalAmount.toFixed(2)}</div>
                              </div>
                              <div className="mb-2">
                                <small className="text-muted">Generated By</small>
                                <div className="small">{bill.generatedBy}</div>
                              </div>
                            </div>
                            <div className="card-footer bg-light d-flex justify-content-end gap-2">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setGeneratedBill(bill)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                View
                              </button>
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
                )}                {dummyAppointments.filter(a => a.status === 'completed').length === 0 && (
                  <div className="alert alert-warning">
                    No completed appointments available for billing.
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
