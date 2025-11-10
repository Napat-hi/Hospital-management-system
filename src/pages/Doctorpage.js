// Doctorpage.jsx
// Doctor's Dashboard Page

/*
 * BACKEND INTEGRATION GUIDE
 * =========================
 * 
 * This file is ready for backend database integration. Here's what you need to connect:
 * 
 * 1. API ENDPOINTS TO IMPLEMENT:
 *    - GET    /api/patients              - Fetch all patients (replace dummyPatients)
 *    - GET    /api/patients/:id          - Fetch patient by ID (handleViewPatient)
 *    - GET    /api/appointments          - Fetch all appointments (replace dummyAppointments)
 *    - GET    /api/appointments/completed - Fetch completed appointments
 *    - PATCH  /api/appointments/:id/complete   - Mark appointment as complete
 *    - PATCH  /api/appointments/:id/uncomplete - Unmark appointment as complete
 * 
 * 2. EXPECTED DATA STRUCTURES:
 *    Patient Object: {
 *      id: number,
 *      first_name: string,
 *      last_name: string,
 *      sex: "Male" | "Female",
 *      dob: string (format: "YYYY-MM-DD"),
 *      address: string
 *    }
 * 
 *    Appointment Object: {
 *      id: number,
 *      patientName: string,
 *      doctorName: string,
 *      appointmentDate: string (format: "YYYY-MM-DD"),
 *      appointmentTime: string (format: "HH:MM AM/PM"),
 *      reason: string,
 *      status: "scheduled" | "completed"
 *    }
 * 
 * 3. TODO ITEMS:
 *    - Replace dummyPatients with API call: useEffect(() => { fetchPatients() }, [])
 *    - Replace dummyAppointments with API call: useEffect(() => { fetchAppointments() }, [])
 *    - Update handleCompleteAppointment to use PATCH endpoint
 *    - Update handleUnmarkComplete to use PATCH endpoint
 *    - Update handlePatientSearch to filter on backend
 *    - Add loading states during API calls
 *    - Add proper error handling with user-friendly messages
 *    - Consider pagination for large appointment/patient lists
 * 
 * 4. FUNCTIONS READY FOR BACKEND:
 *    - handleCompleteAppointment()   → PATCH /api/appointments/:id/complete
 *    - handleUnmarkComplete()        → PATCH /api/appointments/:id/uncomplete
 *    - handlePatientSearch()         → GET /api/patients?search=query
 *    - handleViewPatient()           → GET /api/patients/:id
 */

import React, { useMemo, useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { doctorAPI } from "../api/doctorAPI";

export default function Doctorpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Doctor";
  const l_name = state.lastnames || "User";
  const photo  = state.photo || "";
  const listData = Array.isArray(state.listdata) ? state.listdata : [];

  // ---- UI state ----
  const [view, setView] = useState("appointments"); // 'patients' | 'complete' | 'appointments' | 'table'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [showPatientResults, setShowPatientResults] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // ---- Backend data state ----
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- เมนูซ้าย ----
  const menu = [
    { key: "patients",     label: "View Patient Information" },
    { key: "complete",     label: "Completed Appointments" },
    { key: "appointments", label: "View Appointments" },
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
    navigate("/"); // กลับหน้าแรก/หน้า login
  };

  // ============================================
  // FETCH DATA FROM BACKEND
  // ============================================
  useEffect(() => {
    loadPatients();
    loadAppointments();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await doctorAPI.getPatients();
      setPatients(data);
    } catch (error) {
      alert('Failed to load patients. Make sure backend is running!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await doctorAPI.getAppointments();
      setAppointments(data);
    } catch (error) {
      alert('Failed to load appointments. Make sure backend is running!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Data is now loaded from backend (see useEffect above)
  // No more dummy data needed!

  // ---- Handle patient search ----
  // TODO: Replace with actual backend search/filter
  const handlePatientSearch = () => {
    // TODO: Implement search filtering on backend
    // const searchQuery = document.querySelector('input[placeholder*="Search patient"]').value;
    // const fetchSearchResults = async () => {
    //   try {
    //     const response = await fetch(`http://your-backend-url/api/patients?search=${searchQuery}`);
    //     const data = await response.json();
    //     // Update patients list with search results
    //   } catch (error) {
    //     console.error('Error searching patients:', error);
    //   }
    // };
    // fetchSearchResults();
    setShowPatientResults(true);
  };

  // ---- Handle patient selection ----
  const handleViewPatient = async () => {
    if (!selectedPatientId) {
      alert("Please select a patient to view");
      return;
    }

    try {
      const patient = await doctorAPI.getPatient(selectedPatientId);
      setSelectedPatient(patient);
    } catch (error) {
      alert('Failed to load patient details');
      console.error(error);
    }
  };

  // ---- Handle marking appointment as complete ----
  const handleCompleteAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to mark this appointment as complete?")) {
      return;
    }

    try {
      await doctorAPI.completeAppointment(appointmentId);
      alert("Appointment marked as complete!");
      
      // Reload appointments to show updated status
      await loadAppointments();
      
    } catch (error) {
      alert('Error marking appointment as complete. Please try again later.');
      console.error(error);
    }
  };

  // ---- Handle unmarking appointment as complete ----
  const handleUnmarkComplete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to unmark this appointment as complete?")) {
      return;
    }

    try {
      await doctorAPI.uncompleteAppointment(appointmentId);
      alert("Appointment unmarked as complete!");
      
      // Reload appointments to show updated status
      await loadAppointments();
      
    } catch (error) {
      alert('Error unmarking appointment. Please try again later.');
      console.error(error);
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
              src="/images/hospital.png" /* วางไฟล์ใน public/images/hospital.png (ไม่บังคับ) */
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
              <div className="avatar placeholder">{(f_name[0] || "D").toUpperCase()}</div>
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
            </div>

            {view === "appointments" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Upcoming Appointments</h5>
                  <span className="badge bg-primary">
                    {appointments.filter(a => a.status === 'scheduled').length} Active
                  </span>
                </div>
                
                <div className="row g-3">
                  {appointments
                    .filter(appointment => appointment.status === 'scheduled')
                    .map((appointment) => (
                      <div key={appointment.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">Appointment #{appointment.id}</h6>
                              <span className="badge bg-info text-white">Scheduled</span>
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
                          <div className="card-footer bg-light">
                            <button 
                              className="btn btn-sm btn-primary w-100"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                            >
                              Mark as Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {appointments.filter(a => a.status === 'scheduled').length === 0 && (
                  <div className="alert alert-info">
                    No upcoming appointments at this time.
                  </div>
                )}
              </div>
            )}

            {view === "patients" && (
              <>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Patient Information</h5>
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
                            {patients.map((patient) => (
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

                {/* Show patient details after selection */}
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
                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Address</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={selectedPatient.address}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === "complete" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Appointments Marked as Completed</h5>
                  <span className="badge bg-success">
                    {appointments.filter(a => a.status === 'completed').length} Completed
                  </span>
                </div>
                
                <div className="row g-3">
                  {appointments
                    .filter(appointment => appointment.status === 'completed')
                    .map((appointment) => (
                      <div key={appointment.id} className="col-12 col-md-6 col-lg-4">
                        <div className="card shadow-sm h-100">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0">Appointment #{appointment.id}</h6>
                              <span className="badge bg-success text-white">Completed</span>
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
                          <div className="card-footer bg-light">
                            <div className="d-flex gap-2 align-items-center">
                              <button className="btn btn-sm btn-success flex-grow-1" disabled>
                                ✓ Completed
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                type="button" 
                                onClick={() => handleUnmarkComplete(appointment.id)}
                                title="Unmark as Complete"
                                style={{ padding: '0.25rem 0.5rem' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {appointments.filter(a => a.status === 'completed').length === 0 && (
                  <div className="alert alert-info">
                    No completed appointments yet.
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
