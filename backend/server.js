const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Place your dummy user data here
let users = [
  { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@hospital.com", role: "Doctor", department: "Cardiology" },
  { id: 2, first_name: "Jane", last_name: "Smith", email: "jane.smith@hospital.com", role: "Doctor", department: "Pediatrics" },
  { id: 3, first_name: "Michael", last_name: "Johnson", email: "michael.j@hospital.com", role: "Staff", position: "Nurse" },
  { id: 4, first_name: "Emily", last_name: "Davis", email: "emily.davis@hospital.com", role: "Doctor", department: "Emergency Medicine" },
  { id: 5, first_name: "Robert", last_name: "Wilson", email: "robert.w@hospital.com", role: "Staff", position: "Pharmacist" },
  { id: 6, first_name: "Sarah", last_name: "Brown", email: "sarah.brown@hospital.com", role: "Doctor", department: "General Surgery" },
  { id: 7, first_name: "David", last_name: "Martinez", email: "david.m@hospital.com", role: "Staff", position: "Laboratory Technician" },
  { id: 8, first_name: "Lisa", last_name: "Anderson", email: "lisa.anderson@hospital.com", role: "Doctor", department: "Neurology" },
  { id: 9, first_name: "James", last_name: "Taylor", email: "james.taylor@hospital.com", role: "Staff", position: "Medical Assistant" },
  { id: 10, first_name: "Maria", last_name: "Garcia", email: "maria.garcia@hospital.com", role: "Doctor", department: "Obstetrics & Gynecology" }
];

// ============================================
// DOCTOR PAGE DATA - Patients & Appointments
// ============================================
let patients = [
  { id: 1, first_name: "Alice", last_name: "Johnson", sex: "Female", dob: "1985-03-15", address: "123 Main St, Springfield", phone: "555-1001", email: "alice.j@email.com" },
  { id: 2, first_name: "Bob", last_name: "Smith", sex: "Male", dob: "1978-07-22", address: "456 Oak Ave, Riverside", phone: "555-1002", email: "bob.s@email.com" },
  { id: 3, first_name: "Carol", last_name: "Williams", sex: "Female", dob: "1990-11-30", address: "789 Pine Rd, Lakewood", phone: "555-1003", email: "carol.w@email.com" },
  { id: 4, first_name: "David", last_name: "Brown", sex: "Male", dob: "1965-05-18", address: "321 Elm St, Hillside", phone: "555-1004", email: "david.b@email.com" },
  { id: 5, first_name: "Emma", last_name: "Davis", sex: "Female", dob: "2000-09-08", address: "654 Maple Dr, Greenfield", phone: "555-1005", email: "emma.d@email.com" }
];

let appointments = [
  { id: 1, patientName: "Alice Johnson", doctorName: "Dr. Sarah Brown", appointmentDate: "2025-11-15", appointmentTime: "09:00 AM", reason: "Annual physical examination", status: "scheduled" },
  { id: 2, patientName: "Bob Smith", doctorName: "Dr. John Doe", appointmentDate: "2025-11-15", appointmentTime: "10:30 AM", reason: "Follow-up for hypertension", status: "scheduled" },
  { id: 3, patientName: "Carol Williams", doctorName: "Dr. Emily Davis", appointmentDate: "2025-11-16", appointmentTime: "02:00 PM", reason: "Prenatal checkup", status: "scheduled" },
  { id: 4, patientName: "David Brown", doctorName: "Dr. Lisa Anderson", appointmentDate: "2025-11-16", appointmentTime: "11:00 AM", reason: "Neurological assessment", status: "scheduled" },
  { id: 5, patientName: "Emma Davis", doctorName: "Dr. Jane Smith", appointmentDate: "2025-11-17", appointmentTime: "03:30 PM", reason: "Vaccination", status: "scheduled" },
  { id: 6, patientName: "Alice Johnson", doctorName: "Dr. Sarah Brown", appointmentDate: "2025-11-18", appointmentTime: "01:00 PM", reason: "X-ray results", status: "scheduled" }
];

// Then define your API routes below
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  users = users.map(u => u.id === id ? { ...u, ...req.body } : u);
  res.json({ success: true });
});

app.patch('/api/users/:id/disable', (req, res) => {
  const id = parseInt(req.params.id);
  users = users.map(u => u.id === id ? { ...u, status: 'disabled' } : u);
  res.json({ success: true });
});


// DOCTOR PAGE API ENDPOINTS

// 1. GET all patients
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

// 2. GET patient by ID
app.get('/api/patients/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const patient = patients.find(p => p.id === id);
  
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  res.json(patient);
});

// 3. GET all appointments
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// 4. GET appointment by ID
app.get('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);
  
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  res.json(appointment);
});

// 5. PATCH - Mark appointment as complete
app.patch('/api/appointments/:id/complete', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);
  
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  // Change status to 'completed'
  appointment.status = 'completed';
  
  res.json({
    message: 'Appointment marked as complete',
    appointment: appointment
  });
});

// 6. PATCH - Unmark appointment (back to scheduled)
app.patch('/api/appointments/:id/uncomplete', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);
  
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  // Change status back to 'scheduled'
  appointment.status = 'scheduled';
  
  res.json({
    message: 'Appointment status changed to scheduled',
    appointment: appointment
  });
});

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
  console.log('');
  console.log('Available endpoints:');
  console.log('  Users:');
  console.log('    - GET    /api/users');
  console.log('  Doctor Page:');
  console.log('    - GET    /api/patients');
  console.log('    - GET    /api/patients/:id');
  console.log('    - GET    /api/appointments');
  console.log('    - GET    /api/appointments/:id');
  console.log('    - PATCH  /api/appointments/:id/complete');
  console.log('    - PATCH  /api/appointments/:id/uncomplete');
});
