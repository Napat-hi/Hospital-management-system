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

app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
