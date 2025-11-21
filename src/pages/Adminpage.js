// Adminpage.jsx
// Admin Dashboard Page

import React, { useMemo, useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { adminAPI } from "../api/adminapi";

export default function Adminpage() {
  const location = useLocation();
  const navigate = useNavigate();

  // ---- Router state (ปลอดภัย) ----
  const state = (location && location.state) || {};
  const f_name = state.firstnames || "Admin";
  const l_name = state.lastnames || "User";
  const photo = state.photo || "";

const [listData, setListData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const users = await adminAPI.getUsers();
      setListData(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  fetchUsers();
}, []);



  // ---- UI state ----
  const [view, setView] = useState("create"); // 'create' | 'table'
  const [sortKey, setSortKey] = useState("first_name");
  const [sortDir, setSortDir] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [role, setRole] = useState(""); // Track selected role for Create user page
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
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
    position: ""
  });

  // ---- Validation errors state ----
  const [formErrors, setFormErrors] = useState({
    first_name: "",
    last_name: "",
    department: "",
    specialization: "",
    phone: "",
    email: "",
    position: ""
  });

  // ---- เมนูซ้าย ----
  const menu = [
    { key: "create", label: "Create User" },
    { key: "table", label: "Manage Users" },
  ];

  // Handle menu item click
  const handleMenuClick = (key) => {
    setView(key);
    // Re-fetch users when navigating to Users Table
    if (key === "table") {
      fetchUsers();
    }
    // Close edit form when switching views
    if (key !== "table") {
      setShowEditForm(false);
    }
  };

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

  // ---- Generate username from first name ----
  // Format: firstname (lowercase)
  // Example: "John Doe" -> "john"
  const generateUsername = (firstName, lastName) => {
    if (!firstName) return "";
    
    const firstLower = firstName.trim().toLowerCase();
    
    return firstLower;
  };

  // ---- Generate password from first name and last name ----
  // Format: firstname.first3letters_of_lastname
  // Example: "John Doe" -> "john.doe"
  const generatePassword = (firstName, lastName) => {
    if (!firstName || !lastName) return "";
    
    const firstLower = firstName.trim().toLowerCase();
    const lastLower = lastName.trim().toLowerCase();
    const lastNamePrefix = lastLower.substring(0, 3);
    
    return `${firstLower}.${lastNamePrefix}`;
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
      position: ""
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
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateCreateForm()) {
      return;
    }

    // Generate username and password
    const username = generateUsername(formData.first_name, formData.last_name);
    const password = generatePassword(formData.first_name, formData.last_name);

    // Prepare data to send to backend
    const userData = {
      role: role,
      ...formData,
      username: username,
      password: password,
      dob: '2000-01-01' // Default dob for backend compatibility
    };

    console.log("Sending data to backend:", userData);
    console.log(`Generated credentials - Username: ${username}, Password: ${password}`);

    try {
      const result = await adminAPI.createUser(userData);
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
        position: ""
      });
      setFormErrors({
        first_name: "",
        last_name: "",
        department: "",
        specialization: "",
        phone: "",
        email: "",
        position: ""
      });
      setRole("");
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Failed to create user: ${error.message}`);
    }
  };

  // ---- Handle edit user button click ----
  const handleEditUser = (user) => {
    console.log('Editing user:', user); // Debug log
    console.log('Department value:', user.department);
    console.log('Specialization value:', user.specialization);
    console.log('Position value:', user.position);
    console.log('Role value:', user.role);
    
    setEditFormData({
      id: user.id,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      department: user.department || "",
      specialization: user.specialization || "",
      phone: user.phone || "",
      email: user.email || "",
      position: user.position || "",
      role: user.role || "",
      dob: user.dob || ""
    });
    setShowEditForm(true);
    // Scroll to top to see the edit form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- Handle cancel edit ----
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditFormData({
      id: "",
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
  };

  // ---- Handle delete user (permanent deletion) ----
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.first_name} ${user.last_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(user.id, user.role);
      alert("User deleted successfully!");
      await fetchUsers();
      // Close edit form if the deleted user was being edited
      if (showEditForm && editFormData.id === user.id) {
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
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
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    const updatedData = {
      ...editFormData
    };

    console.log("Updating user:", updatedData);

    try {
      const result = await adminAPI.updateUser(editFormData.id, updatedData);
      alert("User updated successfully!");
      await fetchUsers();
      console.log('Server response:', result);

      // Reset form state after successful update
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Failed to update user: ${error.message}`);
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
              <div className="fw-semibold">
                {localStorage.getItem('role') || 'Admin'}: {localStorage.getItem('username') || 'User'}
              </div>
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
                    onClick={() => handleMenuClick(item.key)}
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
                          <div className="col-md-6">
                            <label className="form-label mt-3">First Name <span className="text-danger">*</span></label>
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
                          <div className="col-md-6">
                            <label className="form-label mt-3">Last Name <span className="text-danger">*</span></label>
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
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label mt-3">Department <span className="text-danger">*</span></label>
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
                          <div className="col-md-6">
                            {/* Conditional field: Specialization for Doctor, Position for Staff */}
                            {role === 'Doctor' ? (
                              <>
                                <label className="form-label mt-3">Specialization <span className="text-danger">*</span></label>
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
                                <label className="form-label mt-3">Position <span className="text-danger">*</span></label>
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
                          <div className="col-md-6">
                            <label className="form-label mt-3">Email Address <span className="text-danger">*</span></label>
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
                          <div className="col-md-6">
                            <label className="form-label mt-3">Phone Number <span className="text-danger">*</span></label>
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

            {view === "table" && (
              <>
                {showEditForm && (
                  <div className="card shadow-sm mb-3">
                    <div className="card-body">
                      <h5 className="card-title mb-3">Edit User Information</h5>
                      <form onSubmit={handleUpdateUser}>
                        <div className="row">
                          <div className="col-md-12 mb-3">
                            <label className="form-label">Role</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={editFormData.role}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">First Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="first_name"
                              className="form-control"
                              placeholder="e.g. John"
                              value={editFormData.first_name}
                              onChange={handleEditInputChange}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Last Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              name="last_name"
                              className="form-control"
                              placeholder="e.g. Doe"
                              value={editFormData.last_name}
                              onChange={handleEditInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Department <span className="text-danger">*</span></label>
                            <select
                              name="department"
                              className="form-select"
                              value={editFormData.department}
                              onChange={handleEditInputChange}
                              required
                            >
                              <option value="">Select Department</option>
                              <option value="General Medicine">General Medicine</option>
                              <option value="General Surgery">General Surgery</option>
                              <option value="Pediatrics">Pediatrics</option>
                              <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                              <option value="Emergency Medicine">Emergency Medicine</option>
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            {editFormData.role === 'Doctor' ? (
                              <>
                                <label className="form-label">Specialization</label>
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
                                <label className="form-label">Position</label>
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
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              className="form-control"
                              placeholder="e.g. johndoe@example.com"
                              value={editFormData.email || ""}
                              onChange={handleEditInputChange}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              className="form-control"
                              placeholder="e.g. 123-456-7890"
                              value={editFormData.phone || ""}
                              onChange={handleEditInputChange}
                            />
                          </div>
                        </div>

                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary"
                          >
                            Update User
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

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
                            Department {sortKey === "department" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                          </th>
                          <th>Specialization/Position</th>
                          <th className="text-center" style={{ width: "180px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSortedList.map((u) => (
                          <tr key={`${u.id}-${u.email}`}>
                            <td>{u.first_name}</td>
                            <td>{u.last_name}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.department}</td>
                            <td>{u.role === 'Doctor' ? u.specialization : u.position}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => handleEditUser(u)}
                                title="Edit user"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteUser(u)}
                                title="Delete user"
                              >
                                Delete
                              </button>
                            </td>
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
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
