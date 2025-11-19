// Adminpage.jsx
// Purin's Page

/*
 * BACKEND INTEGRATION GUIDE
 * =========================
 * 
 * This file is ready for backend database integration. Here's what you need to connect:
 * 
 * 1. API ENDPOINTS TO IMPLEMENT:
 *    - POST   /api/users              - Create new user (handleCreateUser)
 *    - GET    /api/users              - Fetch all users (replace dummyUsers)
 *    - PUT    /api/users/:id          - Update user by ID (handleUpdateUser)
 *    - PATCH  /api/users/:id/disable  - Disable user by ID (handleDisableUser)
 * 
 * 2. EXPECTED DATA STRUCTURE:
 *    User Object: {
 *      id: number,
 *      first_name: string,
 *      last_name: string,
 *      username: string,        // Auto-generated: firstname.first3letters_of_lastname
 *      password: string,        // Auto-generated: DDMMYYYY from date of birth
 *      dob: string,            // Date of Birth in format "YYYY-MM-DD"
 *      email: string,
 *      phone: string,
 *      role: "Doctor" | "Staff",
 *      department: string,
 *      specialization: string (for Doctors),
 *      position: string (for Staff)
 *    }
 * 
 * 3. USERNAME & PASSWORD GENERATION:
 *    - Username format: firstname.first3letters_of_lastname
 *      Example: "John Doe" -> "john.doe"
 *    - Password format: DDMMYYYY (from date of birth)
 *      Example: DOB "2004-10-17" -> "17102004"
 *    - Both are automatically generated when creating a user
 * 
 * 4. TODO ITEMS:
 *    - Replace dummy data (dummyUsers array) with API call to fetch real users
 *    - Update all 'http://your-backend-url/api/users' endpoints with actual backend URL
 *    - Add authentication token to API requests if required
 *    - Implement proper error handling and loading states
 *    - Add search functionality to filter users on backend
 *    - Consider pagination for large user lists
 *    - Store hashed passwords in database (never store plain text!)
 * 
 * 5. FUNCTIONS READY FOR BACKEND:
 *    - handleCreateUser()   → POST new user
 *    - handleUpdateUser()   → PUT update existing user
 *    - handleDisableUser()  → PATCH disable user (soft delete)
 */

import React, { useMemo, useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

export default function Adminpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Admin";
  const l_name = state.lastnames || "User";
  const photo = state.photo || "";

const [listData, setListData] = useState([]);

const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/users');
    if (response.ok) {
      const users = await response.json();
      setListData(users);
    } else {
      console.error('Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

useEffect(() => {
  fetchUsers();
}, []);



  // ---- UI state ----
  const [view, setView] = useState("create"); // 'create' | 'add' | 'delete' | 'edit' | 'table'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [role, setRole] = useState(""); // Track selected role for Create user page
  const [showDeleteResults, setShowDeleteResults] = useState(false);
  const [showEditResults, setShowEditResults] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(""); // For edit functionality
  const [selectedDeleteUserId, setSelectedDeleteUserId] = useState(""); // For delete functionality
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    department: "",
    specialization: "",
    phone: "",
    email: "",
    position: "",
    role: "",
    dob: ""
  });

  // ---- Form data state ----
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    department: "",
    specialization: "",
    phone: "",
    email: "",
    position: "",
    dob: ""
  });

  // ---- Validation errors state ----
  const [formErrors, setFormErrors] = useState({
    first_name: "",
    last_name: "",
    department: "",
    specialization: "",
    phone: "",
    email: "",
    position: "",
    dob: ""
  });

  // ---- เมนูซ้าย ----
  const menu = [
    { key: "create", label: "Create" },
    { key: "disable", label: "Disable" },
    { key: "edit", label: "Edit" },
    { key: "table", label: "Users Table" },
  ];

  // ---- ตาราง users (เหมือนหน้าอื่น) ----
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

  const cameWithState = listData.length > 0;

  const toggleSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    
    // Navigate back to login page
    navigate("/");
  };

  // ---- Generate username from first name and last name ----
  // Format: firstname.first3letters_of_lastname
  // Example: "John Doe" -> "john.doe"
  const generateUsername = (firstName, lastName) => {
    if (!firstName || !lastName) return "";
    
    const firstLower = firstName.trim().toLowerCase();
    const lastLower = lastName.trim().toLowerCase();
    const lastNamePrefix = lastLower.substring(0, 3);
    
    return `${firstLower}.${lastNamePrefix}`;
  };

  // ---- Generate password from date of birth ----
  // Format: DDMMYYYY
  // Example: "2004-10-17" -> "17102004"
  const generatePassword = (dob) => {
    if (!dob) return "";
    
    // dob format is "YYYY-MM-DD" from date input
    const [year, month, day] = dob.split('-');
    return `${day}${month}${year}`;
  };

  // ---- Validate email format ----
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ---- Validate phone format ----
  const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone);
  };

  // ---- Validate create user form ----
  const validateCreateForm = () => {
    const errors = {
      first_name: "",
      last_name: "",
      department: "",
      specialization: "",
      phone: "",
      email: "",
      position: "",
      dob: ""
    };
    let isValid = true;

    // Role validation (must be selected first)
    if (!role) {
      alert("Please select a role (Doctor or Staff) before creating a user");
      isValid = false;
      return false;
    }

    // First Name validation
    if (!formData.first_name || !formData.first_name.trim()) {
      errors.first_name = "First name is required";
      isValid = false;
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = "First name must be at least 2 characters";
      isValid = false;
    }

    // Last Name validation
    if (!formData.last_name || !formData.last_name.trim()) {
      errors.last_name = "Last name is required";
      isValid = false;
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Department validation
    if (!formData.department) {
      errors.department = "Department is required";
      isValid = false;
    }

    // Role-specific validation
    if (role === "Doctor") {
      if (!formData.specialization) {
        errors.specialization = "Specialization is required for doctors";
        isValid = false;
      }
    } else if (role === "Staff") {
      if (!formData.position) {
        errors.position = "Position is required for staff";
        isValid = false;
      }
    }

    // Date of Birth validation
    if (!formData.dob) {
      errors.dob = "Date of birth is required";
      isValid = false;
    } else {
      const dob = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      if (age < 18 || age > 100) {
        errors.dob = "Age must be between 18 and 100 years";
        isValid = false;
      }
    }

    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Invalid phone number format";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // ---- Handle form input changes ----
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    setFormErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  // ---- Handle form submission ----
  // TODO: Replace with actual backend endpoint
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateCreateForm()) {
      return;
    }

    // Generate username and password
    const username = generateUsername(formData.first_name, formData.last_name);
    const password = generatePassword(formData.dob);

    // Prepare data to send to backend
    const userData = {
      role: role,
      ...formData,
      username: username,
      password: password
    };

    console.log("Sending data to backend:", userData);
    console.log(`Generated credentials - Username: ${username}, Password: ${password}`);

    try {
      // TODO: Replace 'http://your-backend-url/api/users' with actual API endpoint
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('User created successfully!');
        console.log('Server response:', result);

        // Reset form after successful creation
        setFormData({
          first_name: "",
          last_name: "",
          department: "",
          specialization: "",
          phone: "",
          email: "",
          position: "",
          dob: ""
        });
        setFormErrors({
          first_name: "",
          last_name: "",
          department: "",
          specialization: "",
          phone: "",
          email: "",
          position: "",
          dob: ""
        });
        setRole("");
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error connecting to server:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle search button clicks ----
  const handleDeleteSearch = () => {
    // TODO: Optionally filter results based on search input before displaying
    setShowDeleteResults(true);
  };

  const handleEditSearch = () => {
    // TODO: Optionally filter results based on search input before displaying
    setShowEditResults(true);
  };

  // ---- Handle disable user (soft delete) ----
  // TODO: Replace with actual backend endpoint
  const handleDisableUser = async (userId) => {
    if (!userId) {
      alert("Please select a user to disable");
      return;
    }

    if (!window.confirm("Are you sure you want to disable this user?")) {
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      // This is a PATCH request to disable (soft delete), NOT a DELETE request
      const response = await fetch(`http://localhost:5000/api/users/${userId}/disable`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'disabled' })
      });

      if (response.ok) {
        alert("User disabled successfully!");
        await fetchUsers();
        // Reset state
        setShowDeleteResults(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to disable user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error disabling user:', error);
      alert('Error connecting to server. Please try again later.');
    }
  };

  // ---- Handle edit user selection and form display ----
  const handleEditUserClick = (userId) => {
    const userIdToEdit = userId || selectedUserId;
    
    if (!userIdToEdit) {
      alert("Please select a user to edit");
      return;
    }

    // Find the selected user
    const user = listData.find(u => u.id === parseInt(userIdToEdit));
    if (user) {
      // Populate edit form with user data
      setEditFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        department: user.department || "",
        specialization: user.specialization || user.department || "",
        phone: user.phone || "",
        email: user.email || "",
        position: user.position || "",
        role: user.role || "",
        dob: user.dob || ""
      });
      setShowEditForm(true);
    }
  };

  // ---- Handle edit form input changes ----
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ---- Handle edit form submission ----
  // TODO: Replace with actual backend endpoint
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    // Prepare updated data for backend
    // Expected format: { id, role, fullName, department, specialization/position, phone, email }
    const updatedData = {
      id: selectedUserId,
      ...editFormData
    };

    console.log("Updating user:", updatedData);

    try {
      // TODO: Replace with actual API endpoint - use PUT or PATCH method
      const response = await fetch(`http://localhost:5000/api/users/${selectedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const result = await response.json();
        alert("User updated successfully!");
        await fetchUsers();
        console.log('Server response:', result);

        // Reset form state after successful update
        setShowEditForm(false);
        setShowEditResults(false);
        setSelectedUserId("");
        setEditFormData({
          first_name: "",
          last_name: "",
          department: "",
          specialization: "",
          phone: "",
          email: "",
          position: "",
          role: "",
          dob: ""
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to update user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
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
              onError={(e) => { e.currentTarget.style.display = "none"; }}
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
              <div className="avatar placeholder">{(f_name[0] || "A").toUpperCase()}</div>
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

            {/* === ADMIN VIEWS === */}
            {view === "create" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Create Users</h5>
                  <p className="text-muted mb-3">
                    Fill in the details about creating new users Doctors/Staff.
                  </p>
                  <form className="row gy-2 gx-2">
                    <div className="col-md-12">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="">Select Role</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </div>
                    {/* Form Fields - Doctor or Staff */}
                    {(role === 'Doctor' || role === 'Staff') && (
                      <>
                        <div className="row">
                          <div className="col-md-4">
                            <label className="form-label mt-4">First Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="first_name"
                              className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                              placeholder="e.g. John"
                              value={formData.first_name}
                              onChange={handleInputChange}
                            />
                            {formErrors.first_name && (
                              <div className="invalid-feedback">{formErrors.first_name}</div>
                            )}
                          </div>
                          <div className="col-md-4">
                            <label className="form-label mt-4">Last Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="last_name"
                              className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                              placeholder="e.g. Doe"
                              value={formData.last_name}
                              onChange={handleInputChange}
                            />
                            {formErrors.last_name && (
                              <div className="invalid-feedback">{formErrors.last_name}</div>
                            )}
                          </div>
                          <div className="col-md-4">
                            <label className="form-label mt-4">Department <span className="text-danger">*</span></label>
                            <select
                              name="department"
                              className={`form-select ${formErrors.department ? 'is-invalid' : ''}`}
                              value={formData.department}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Department</option>
                              <option value="General Medicine">General Medicine</option>
                              <option value="General Surgery">General Surgery</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                              <option value="Emergency Medicine">Emergency Medicine</option>
                            </select>
                            {formErrors.department && (
                              <div className="invalid-feedback">{formErrors.department}</div>
                            )}
                          </div>
                          <div className="col-4">
                            {/* Conditional field: Specialization for Doctor, Position for Staff */}
                            {role === 'Doctor' ? (
                              <>
                                <label className="form-label mt-4">Specialization <span className="text-danger">*</span></label>
                                <select
                                  name="specialization"
                                  className={`form-select ${formErrors.specialization ? 'is-invalid' : ''}`}
                                  value={formData.specialization || ""}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select Specialization</option>
                                  <option value="Cardiology">Cardiology</option>
                                  <option value="Neurology">Neurology</option>
                                  <option value="Orthopedics">Orthopedics</option>
                                  <option value="Pediatrics">Pediatrics</option>
                                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                                </select>
                                {formErrors.specialization && (
                                  <div className="invalid-feedback">{formErrors.specialization}</div>
                                )}
                              </>
                            ) : (
                              <>
                                <label className="form-label mt-4">Position <span className="text-danger">*</span></label>
                                <select
                                  name="position"
                                  className={`form-select ${formErrors.position ? 'is-invalid' : ''}`}
                                  value={formData.position || ""}
                                  onChange={handleInputChange}
                                >
                                  <option value="">Select Position</option>
                                  <option value="Nurse">Nurse</option>
                                  <option value="Pharmacist">Pharmacist</option>
                                  <option value="Medical Assistant">Medical Assistant</option>
                                  <option value="Laboratory Technician">Laboratory Technician</option>
                                  <option value="Radiologic Technologist">Radiologic Technologist</option>
                                  <option value="Nurse Practitioner">Nurse Practitioner</option>
                                  <option value="Physician Assistant">Physician Assistant</option>
                                  <option value="Therapist">Therapist</option>
                                  <option value="Paramedic">Paramedic</option>
                                  <option value="Hospital Administrator">Hospital Administrator</option>
                                </select>
                                {formErrors.position && (
                                  <div className="invalid-feedback">{formErrors.position}</div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-4">
                            <label className="form-label mt-2">Date of Birth <span className="text-danger">*</span></label>
                            <input
                              type="date"
                              name="dob"
                              className={`form-control ${formErrors.dob ? 'is-invalid' : ''}`}
                              value={formData.dob || ""}
                              onChange={handleInputChange}
                              max={new Date().toISOString().split('T')[0]}
                            />
                            <small className="text-muted">Used to generate login password</small>
                            {formErrors.dob && (
                              <div className="invalid-feedback">{formErrors.dob}</div>
                            )}
                          </div>
                          <div className="col-4">
                            <label className="form-label mt-2">Phone Number <span className="text-danger">*</span></label>
                            <input
                              type="tel"
                              name="phone"
                              className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                              placeholder="e.g. 123-456-7890"
                              value={formData.phone || ""}
                              onChange={handleInputChange}
                            />
                            {formErrors.phone && (
                              <div className="invalid-feedback">{formErrors.phone}</div>
                            )}
                          </div>
                          <div className="col-4">
                            <label className="form-label mt-2">Email Address <span className="text-danger">*</span></label>
                            <input
                              type="email"
                              name="email"
                              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                              placeholder="e.g. johndoe@example.com"
                              value={formData.email || ""}
                              onChange={handleInputChange}
                            />
                            {formErrors.email && (
                              <div className="invalid-feedback">{formErrors.email}</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Create Button */}
                    {(role === 'Doctor' || role === 'Staff') && (
                      <>
                        <div className="row mt-4">
                          <div className="col-2"></div>
                          <div className="col-8">
                            <button
                              type="submit"
                              className="btn btn-primary w-100"
                              onClick={handleCreateUser}
                            >
                              Create
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* TODO rename to Disable */}
            {view === "disable" && (
              <>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Disable User</h5>
                    <p className="text-muted mb-3">

                    </p>
                    <form className="row gy-2 gx-2">
                      <div className="col-md-8">
                        <label className="form-label">Full name Search</label>
                        <input type="text" className="form-control" placeholder="Search user to disable..." />
                      </div>
                      <div className="col-md-4 d-flex align-items-end">
                        <button 
                          type="button" 
                          className="btn btn-outline-primary w-100"
                          onClick={handleDeleteSearch}
                        >
                          Search
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                
                {/* Show results only after search */}
                {showDeleteResults && (
                  <div className="card shadow-sm mt-3">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Search Results</h5>
                      <form className="row gy-2 gx-2">
                        <div className="col-md-8">
                          <label className="form-label">Select User</label>
                          <select 
                            className="form-select"
                            value={selectedDeleteUserId}
                            onChange={(e) => setSelectedDeleteUserId(e.target.value)}
                          >
                            <option value="">Select a user to disable</option>
                            {listData.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.email} ({user.role})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button 
                            type="button" 
                            className="btn btn-danger w-100"
                            onClick={() => handleDisableUser(selectedDeleteUserId)}
                          >
                            Disable
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === "edit" && (
              <>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-3">Edit User Data</h5>
                    <p className="text-muted mb-3">

                    </p>
                    <form className="row gy-2 gx-2">
                      <div className="col-md-8">
                        <label className="form-label">Full name Search</label>
                        <input type="text" className="form-control" placeholder="Search user to edit..." />
                      </div>
                      <div className="col-md-4 d-flex align-items-end">
                        <button 
                          type="button" 
                          className="btn btn-outline-primary w-100"
                          onClick={handleEditSearch}
                        >
                          Search
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                
                {/* Show results only after search */}
                {showEditResults && (
                  <div className="card shadow-sm mt-3">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Search Results</h5>
                      <form className="row gy-2 gx-2">
                        <div className="col-md-12">
                          <label className="form-label">Select User to Edit</label>
                          <select 
                            className="form-select"
                            value={selectedUserId}
                            onChange={(e) => {
                              const userId = e.target.value;
                              setSelectedUserId(userId);
                              if (userId) {
                                handleEditUserClick(userId);
                              }
                            }}
                          >
                            <option value="">Select a user to edit</option>
                            {listData.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} - {user.email} ({user.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Show edit form after selecting user */}
                {showEditForm && (
                  <div className="card shadow-sm mt-3">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Edit User Information</h5>
                      <p className="text-muted mb-3">
                        Update the user details below.
                      </p>
                      <form className="row gy-2 gx-2">
                        <div className="col-md-12">
                          <label className="form-label">Role</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={editFormData.role}
                            disabled
                          />
                        </div>

                        {/* Form Fields */}
                        <>
                          <div className="row">
                            <div className="col-md-4">
                              <label className="form-label mt-4">First Name</label>
                              <input
                                type="text"
                                name="first_name"
                                className="form-control"
                                placeholder="e.g. John"
                                value={editFormData.first_name}
                                onChange={handleEditInputChange}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label mt-4">Last Name</label>
                              <input
                                type="text"
                                name="last_name"
                                className="form-control"
                                placeholder="e.g. Doe"
                                value={editFormData.last_name}
                                onChange={handleEditInputChange}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label mt-4">Department</label>
                              <select
                                name="department"
                                className="form-select"
                                value={editFormData.department}
                                onChange={handleEditInputChange}
                              >
                                <option value="">Select Department</option>
                                <option value="General Medicine">General Medicine</option>
                                <option value="General Surgery">General Surgery</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                                <option value="Emergency Medicine">Emergency Medicine</option>
                              </select>
                            </div>
                            <div className="col-4">
                              {/* Conditional field: Specialization for Doctor, Position for Staff */}
                              {editFormData.role === 'Doctor' ? (
                                <>
                                  <label className="form-label mt-4">Specialization</label>
                                  <select
                                    name="specialization"
                                    className="form-select"
                                    value={editFormData.specialization || ""}
                                    onChange={handleEditInputChange}
                                  >
                                    <option value="">Select Specialization</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                                  </select>
                                </>
                              ) : (
                                <>
                                  <label className="form-label mt-4">Position</label>
                                  <select
                                    name="position"
                                    className="form-select"
                                    value={editFormData.position || ""}
                                    onChange={handleEditInputChange}
                                  >
                                    <option value="">Select Position</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Pharmacist">Pharmacist</option>
                                    <option value="Medical Assistant">Medical Assistant</option>
                                    <option value="Laboratory Technician">Laboratory Technician</option>
                                    <option value="Radiologic Technologist">Radiologic Technologist</option>
                                    <option value="Nurse Practitioner">Nurse Practitioner</option>
                                    <option value="Physician Assistant">Physician Assistant</option>
                                    <option value="Therapist">Therapist</option>
                                    <option value="Paramedic">Paramedic</option>
                                    <option value="Hospital Administrator">Hospital Administrator</option>
                                  </select>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="row">
                            <div className="col-4">
                              <label className="form-label mt-2">Date of Birth</label>
                              <input
                                type="date"
                                name="dob"
                                className="form-control"
                                value={editFormData.dob || ""}
                                onChange={handleEditInputChange}
                              />
                            </div>
                            <div className="col-4">
                              <label className="form-label mt-2">Phone Number</label>
                              <input
                                type="text"
                                name="phone"
                                className="form-control"
                                placeholder="e.g. 123-456-7890"
                                value={editFormData.phone || ""}
                                onChange={handleEditInputChange}
                              />
                            </div>
                            <div className="col-4">
                              <label className="form-label mt-2">Email Address</label>
                              <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="e.g. johndoe@example.com"
                                value={editFormData.email || ""}
                                onChange={handleEditInputChange}
                              />
                            </div>
                          </div>
                        </>

                        {/* Update Button */}
                        <div className="row mt-4">
                          <div className="col-2"></div>
                          <div className="col-4">
                            <button
                              type="button"
                              className="btn btn-secondary w-100"
                              onClick={() => {
                                setShowEditForm(false);
                                setSelectedUserId("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="col-4">
                            <button
                              type="submit"
                              className="btn btn-warning w-100"
                              onClick={handleUpdateUser}
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}

            {view === "table" && (
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filter by name or email…"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      style={{ maxWidth: 320 }}
                    />
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th role="button" onClick={() => toggleSort("first_name")}>
                            First Name {sortKey === "first_name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th role="button" onClick={() => toggleSort("last_name")}>
                            Last Name {sortKey === "last_name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th role="button" onClick={() => toggleSort("email")}>
                            Email {sortKey === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th role="button" onClick={() => toggleSort("role")}>
                            Role {sortKey === "role" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th role="button" onClick={() => toggleSort("department")}>
                            Department/Position {sortKey === "department" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSortedList.map((u) => (
                          <tr key={`${u.id}-${u.email}`}>
                            <td>{u.first_name}</td>
                            <td>{u.last_name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.role === 'Doctor' ? u.department : u.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-muted small">
                    Showing {filteredSortedList.length} of {listData.length}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
