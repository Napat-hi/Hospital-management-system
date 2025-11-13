const express = require('express');
const cors = require('cors');
const db = require('./config/database');
const app = express();

app.use(cors());
app.use(express.json());


// ============================================
// DOCTOR PAGE DATA - Now from HMS Database
// ============================================
// All patient and appointment data comes from the HMS database
// No more dummy arrays!

// Dummy users array for admin/staff pages (keep for now)
let users = [
  { id: 1, first_name: "John", last_name: "Doe", email: "john.doe@hospital.com", role: "Doctor", department: "Cardiology" },
  { id: 2, first_name: "Jane", last_name: "Smith", email: "jane.smith@hospital.com", role: "Doctor", department: "Pediatrics" }
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
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        patient_id as id,
        CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) as first_name,
        CAST(AES_DECRYPT(last_name, get_enc_key()) AS CHAR) as last_name,
        CAST(AES_DECRYPT(dob, get_enc_key()) AS CHAR) as dob,
        CAST(AES_DECRYPT(sex, get_enc_key()) AS CHAR) as sex,
        CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR) as phone,
        CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR) as email,
        CAST(AES_DECRYPT(address, get_enc_key()) AS CHAR) as address
      FROM patient
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// 2. GET patient by ID
app.get('/api/patients/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await db.query(`
      SELECT 
        patient_id as id,
        CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) as first_name,
        CAST(AES_DECRYPT(last_name, get_enc_key()) AS CHAR) as last_name,
        CAST(AES_DECRYPT(dob, get_enc_key()) AS CHAR) as dob,
        CAST(AES_DECRYPT(sex, get_enc_key()) AS CHAR) as sex,
        CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR) as phone,
        CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR) as email,
        CAST(AES_DECRYPT(address, get_enc_key()) AS CHAR) as address,
        CAST(AES_DECRYPT(emergency_contact, get_enc_key()) AS CHAR) as emergency_contact
      FROM patient
      WHERE patient_id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// 3. GET all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.appointment_id as id,
        CONCAT(
          CAST(AES_DECRYPT(p.first_name, get_enc_key()) AS CHAR),
          ' ',
          CAST(AES_DECRYPT(p.last_name, get_enc_key()) AS CHAR)
        ) as patientName,
        CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctorName,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointmentDate,
        DATE_FORMAT(a.appointment_time, '%h:%i %p') as appointmentTime,
        CAST(AES_DECRYPT(a.reason, get_enc_key()) AS CHAR) as reason,
        LOWER(a.status) as status
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
      ORDER BY a.appointment_date, a.appointment_time
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// 4. GET appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await db.query(`
      SELECT 
        a.appointment_id as id,
        CONCAT(
          CAST(AES_DECRYPT(p.first_name, get_enc_key()) AS CHAR),
          ' ',
          CAST(AES_DECRYPT(p.last_name, get_enc_key()) AS CHAR)
        ) as patientName,
        CONCAT('Dr. ', d.first_name, ' ', d.last_name) as doctorName,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') as appointmentDate,
        DATE_FORMAT(a.appointment_time, '%h:%i %p') as appointmentTime,
        CAST(AES_DECRYPT(a.reason, get_enc_key()) AS CHAR) as reason,
        LOWER(a.status) as status
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
      WHERE a.appointment_id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// 5. PATCH - Mark appointment as complete
app.patch('/api/appointments/:id/complete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await db.query(`
      UPDATE appointment 
      SET status = 'COMPLETED'
      WHERE appointment_id = ?
    `, [id]);
    
    res.json({
      message: 'Appointment marked as complete',
      id: id
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});

// 6. PATCH - Unmark appointment (back to scheduled)
app.patch('/api/appointments/:id/uncomplete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await db.query(`
      UPDATE appointment 
      SET status = 'SCHEDULED'
      WHERE appointment_id = ?
    `, [id]);
    
    res.json({
      message: 'Appointment status changed to scheduled',
      id: id
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
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
