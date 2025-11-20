const express = require("express");
const cors = require("cors");
const dbAdmin = require('./config/databaseadmin');
const dbDoctor = require('./config/databasedoctor');
const dbStaff = require("./config/databasestaff");
const authRouter = require("./auth");
const userRouter = require("./user"); // ✅ ADD THIS
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ✅ Mount routers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter); // ✅ ADD THIS LINE

// ============================================
// DOCTOR PAGE DATA - Now from HMS Database
// ============================================
// All patient and appointment data comes from the HMS database

// ============================================
// ADMIN PAGE API ENDPOINTS
// ============================================

// 1. GET - Get all users (doctors and staff combined)
app.get('/api/users', async (req, res) => {
  try {
    // Get all doctors (Admin has READ permission)
    const [doctors] = await dbAdmin.query(`
      SELECT 
        doctor_id as id,
        first_name,
        last_name,
        COALESCE(CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR), '') as email,
        COALESCE(CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR), '') as phone,
        'Doctor' as role,
        department,
        specialization,
        NULL as position,
        hire_date,
        user_id
      FROM doctor
    `);
    
    // Get all staff (Admin has READ permission)
    const [staff] = await dbAdmin.query(`
      SELECT 
        staff_id as id,
        first_name,
        last_name,
        COALESCE(CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR), '') as email,
        COALESCE(CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR), '') as phone,
        'Staff' as role,
        department,
        NULL as specialization,
        position,
        hire_date,
        user_id
      FROM staff
    `);
    
    // Combine and return
    const allUsers = [...doctors, ...staff];
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 2. POST - Create new user (doctor or staff)
app.post('/api/users', async (req, res) => {
  try {
    console.log('Create user request:', req.body);
    
    const { 
      role, 
      first_name, 
      last_name, 
      username, 
      password, 
      dob, 
      department, 
      specialization, 
      position, 
      phone, 
      email 
    } = req.body;
    
    // Validation
    if (!role || !first_name || !last_name || !username || !password || !dob) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (role !== 'Doctor' && role !== 'Staff') {
      return res.status(400).json({ error: 'Role must be either Doctor or Staff' });
    }
    
    // Start transaction - need admin connection for staff/user operations
    const connection = await dbAdmin.getConnection();
    await connection.beginTransaction();
    
    try {
      // 1. Create user account first
      const [userResult] = await connection.query(`
        INSERT INTO user (username, password)
        VALUES (?, ?)
      `, [username, password]);
      
      const userId = userResult.insertId;
      
      // 2. Create doctor or staff record
      if (role === 'Doctor') {
        if (!specialization) {
          throw new Error('Specialization is required for doctors');
        }
        
        const [doctorResult] = await connection.query(`
          INSERT INTO doctor (first_name, last_name, department, specialization, email, phone, user_id, hire_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
        `, [first_name, last_name, department, specialization, email || null, phone || null, userId]);
        
      } else if (role === 'Staff') {
        if (!position) {
          throw new Error('Position is required for staff');
        }
        
        const [staffResult] = await connection.query(`
          INSERT INTO staff (first_name, last_name, department, position, email, phone, user_id, hire_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
        `, [first_name, last_name, department, position, email || null, phone || null, userId]);
      }
      
      // Commit transaction
      await connection.commit();
      
      res.status(201).json({
        message: `${role} created successfully`,
        userId: userId
      });
      
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// 3. PUT - Update user (doctor or staff)
app.put('/api/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      role, 
      first_name, 
      last_name, 
      department, 
      specialization, 
      position, 
      phone, 
      email,
      dob
    } = req.body;
    
    console.log('Update user request:', { id, role, ...req.body });
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    // Update based on role
    if (role === 'Doctor') {
      await dbAdmin.query(`
        UPDATE doctor 
        SET first_name = ?,
            last_name = ?,
            department = ?,
            specialization = ?,
            phone = AES_ENCRYPT(?, get_enc_key()),
            email = AES_ENCRYPT(?, get_enc_key())
        WHERE doctor_id = ?
      `, [first_name, last_name, department, specialization || '', phone || '', email || '', id]);
      
    } else if (role === 'Staff') {
      await dbAdmin.query(`
        UPDATE staff 
        SET first_name = ?,
            last_name = ?,
            department = ?,
            position = ?,
            phone = AES_ENCRYPT(?, get_enc_key()),
            email = AES_ENCRYPT(?, get_enc_key())
        WHERE staff_id = ?
      `, [first_name, last_name, department, position || '', phone || '', email || '', id]);
    }
    
    res.json({
      message: `${role} updated successfully`,
      userId: id
    });
    
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// 4. PATCH - Delete user (permanently removes doctor/staff and user account)
app.patch('/api/users/:id/disable', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { role } = req.body;
    
    console.log('Delete user request:', { id, role });
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required to delete user' });
    }
    
    const connection = await dbAdmin.getConnection();
    await connection.beginTransaction();
    
    try {
      let userId = null;
      
      if (role === 'Doctor') {
        // Get user_id first
        const [rows] = await connection.query('SELECT user_id FROM doctor WHERE doctor_id = ?', [id]);
        if (rows.length === 0) {
          throw new Error('Doctor not found');
        }
        userId = rows[0].user_id;
        
        // Delete doctor record first
        await connection.query('DELETE FROM doctor WHERE doctor_id = ?', [id]);
        
      } else if (role === 'Staff') {
        // Get user_id first
        const [rows] = await connection.query('SELECT user_id FROM staff WHERE staff_id = ?', [id]);
        if (rows.length === 0) {
          throw new Error('Staff not found');
        }
        userId = rows[0].user_id;
        
        // Delete staff record first
        await connection.query('DELETE FROM staff WHERE staff_id = ?', [id]);
      }
      
      // Delete user account
      if (userId) {
        await connection.query('DELETE FROM user WHERE user_id = ?', [userId]);
      }
      
      await connection.commit();
      
      res.json({
        message: `${role} deleted successfully`,
        userId: id
      });
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});


// DOCTOR PAGE API ENDPOINTS (use dbDoctor for read-only access)

// 1. GET all patients
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await dbDoctor.query(`
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
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.get("/api/patients/search", async (req, res) => {
  try {
    const term = req.query.q || "";

    const [rows] = await dbStaff.query(`
      SELECT 
        patient_id AS id,
        CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) AS first_name,
        CAST(AES_DECRYPT(last_name, get_enc_key()) AS CHAR) AS last_name
      FROM patient
      WHERE CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) LIKE ? 
         OR CAST(AES_DECRYPT(last_name, get_enc_key()) AS CHAR) LIKE ?
    `, [`%${term}%`, `%${term}%`]);

    res.json(rows);
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Failed to search patients" });
  }
});

// 2. GET patient by ID
app.get('/api/patients/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    const [rows] = await dbDoctor.query(`
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
    const [rows] = await dbDoctor.query(`
      SELECT 
        a.appointment_id as id,
        a.patient_id as patient_id,
        a.doctor_id as doctor_id,
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
    const [rows] = await dbDoctor.query(`
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

// 5. PATCH - Mark appointment as completed (doctor can update)
app.patch('/api/appointments/:id/complete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await dbDoctor.query(`
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
    
    await dbDoctor.query(`
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

// ============================================
// STAFF PAGE API ENDPOINTS
// ============================================

// 7. POST - Create new patient

const crypto = require("crypto");

app.post("/api/patients", async (req, res) => {
  try {
    const { first_name, last_name, dob, sex, phone, email, address, emergency_contact } = req.body;
    
    // Validation
    if (!first_name || !last_name || !dob || !sex) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const [result] = await dbStaff.query(`
      INSERT INTO patient (first_name, last_name, dob, sex, phone, email, address, emergency_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [first_name, last_name, dob, sex, phone || null, email || null, address || null, emergency_contact || null]);
    
    res.status(201).json({
      message: 'Patient created successfully',
      patientId: result.insertId
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// 8. PUT - Update patient information (staff updates patients)
app.put('/api/patients/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { first_name, last_name, dob, sex, phone, email, address, emergency_contact } = req.body;
    
    await dbStaff.query(`
      UPDATE patient 
      SET first_name = AES_ENCRYPT(?, get_enc_key()),
          last_name = AES_ENCRYPT(?, get_enc_key()),
          dob = AES_ENCRYPT(?, get_enc_key()),
          sex = AES_ENCRYPT(?, get_enc_key()),
          phone = AES_ENCRYPT(?, get_enc_key()),
          email = AES_ENCRYPT(?, get_enc_key()),
          address = AES_ENCRYPT(?, get_enc_key()),
          emergency_contact = AES_ENCRYPT(?, get_enc_key())
      WHERE patient_id = ?
    `, [first_name, last_name, dob, sex, phone || '', email || '', address || '', emergency_contact || '', id]);
    
    res.json({
      message: 'Patient updated successfully',
      patientId: id
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// 9. POST - Create new appointment (staff creates appointments)
// Uses sp_book_appointment stored procedure for validation and conflict checking
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    // Validation
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Ensure time format is HH:MM:SS
    let timeOnly = appointment_time.split(' ')[0]; // Remove AM/PM if present
    // Add seconds if not present (e.g., "20:00" becomes "20:00:00")
    if (timeOnly.split(':').length === 2) {
      timeOnly = timeOnly + ':00';
    }
    
    console.log('Booking appointment:', { patient_id, doctor_id, appointment_date, timeOnly });
    
    // Call stored procedure sp_book_appointment
    // This procedure validates patient_id, doctor_id, checks for conflicts, and encrypts reason
    const [result] = await dbStaff.query(`
      CALL sp_book_appointment(?, ?, ?, ?, ?, @appointment_id)
    `, [patient_id, doctor_id, appointment_date, timeOnly, reason || '']);
    
    // Get the output parameter
    const [output] = await dbStaff.query('SELECT @appointment_id as appointmentId');
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointmentId: output[0].appointmentId
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    // Check for specific error messages from stored procedure
    if (error.sqlMessage) {
      if (error.sqlMessage.includes('Invalid patient_id')) {
        return res.status(400).json({ error: 'Invalid patient ID' });
      }
      if (error.sqlMessage.includes('Invalid doctor_id')) {
        return res.status(400).json({ error: 'Invalid doctor ID' });
      }
      if (error.sqlMessage.includes('Doctor already booked')) {
        return res.status(409).json({ error: 'This time slot is already booked for this doctor' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// 10. PUT - Update appointment (staff updates appointments)
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    const datetime = `${appointment_date} ${appointment_time}`;
    
    // Note: Must manually encrypt for UPDATE (no trigger for updates)
    await dbStaff.query(`
      UPDATE appointment 
      SET patient_id = ?,
          doctor_id = ?,
          appointment_date = ?,
          appointment_time = ?,
          reason = AES_ENCRYPT(?, get_enc_key())
      WHERE appointment_id = ?
    `, [patient_id, doctor_id, appointment_date, datetime, reason || '', id]);
    
    res.json({
      message: 'Appointment updated successfully',
      appointmentId: id
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// 11. DELETE - Delete appointment (staff deletes appointments)
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await dbStaff.query('DELETE FROM appointment WHERE appointment_id = ?', [id]);
    
    res.json({
      message: 'Appointment deleted successfully',
      appointmentId: id
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// 12. GET - Get all doctors (for appointment dropdown)
app.get('/api/doctors', async (req, res) => {
  try {
    const [rows] = await dbStaff.query(`
      SELECT 
        doctor_id as id,
        first_name,
        last_name,
        department,
        specialization,
        CONCAT('Dr. ', first_name, ' ', last_name) as name
      FROM doctor
      ORDER BY last_name, first_name
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// 13. POST - Generate bill
app.post('/api/bills', async (req, res) => {
  try {
    console.log('Received bill request body:', req.body);
    const { appointment_id, consultation_fee, medication_cost, lab_tests_cost } = req.body;
    
    console.log('Extracted values:', { appointment_id, consultation_fee, medication_cost, lab_tests_cost });
    
    // Validation
    if (!appointment_id || consultation_fee === undefined) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ error: 'Missing required fields: appointment_id and consultation_fee are required' });
    }
    
    // Get patient_id from appointment
    const [appointmentRows] = await dbStaff.query(`
      SELECT patient_id FROM appointment WHERE appointment_id = ?
    `, [appointment_id]);
    
    if (appointmentRows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    const patient_id = appointmentRows[0].patient_id;
    
    // Calculate total
    const total = parseFloat(consultation_fee) + parseFloat(medication_cost || 0) + parseFloat(lab_tests_cost || 0);
    
    // Note: Values are NOT encrypted here because trg_bill_bi trigger handles encryption automatically
    const [result] = await dbStaff.query(`
      INSERT INTO bill (patient_id, consultation_fee, medication_cost, lab_tests_cost, status, total)
      VALUES (?, ?, ?, ?, 'OPEN', ?)
    `, [patient_id, consultation_fee, medication_cost || '0', lab_tests_cost || '0', total.toFixed(2)]);
    
    // Return the full bill object
    res.status(201).json({
      id: result.insertId,
      patient_id: patient_id,
      consultation_fee: parseFloat(consultation_fee),
      medication_cost: parseFloat(medication_cost || 0),
      lab_tests_cost: parseFloat(lab_tests_cost || 0),
      total: total.toFixed(2),
      status: 'OPEN',
      message: 'Bill generated successfully'
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ error: 'Failed to generate bill' });
  }
});

// 14. GET - Get all bills (staff reads bills)
app.get('/api/bills', async (req, res) => {
  try {
    const [rows] = await dbStaff.query(`
      SELECT 
        b.bill_id as id,
        b.patient_id,
        CONCAT(
          CAST(AES_DECRYPT(p.first_name, get_enc_key()) AS CHAR),
          ' ',
          CAST(AES_DECRYPT(p.last_name, get_enc_key()) AS CHAR)
        ) as patientName,
        CAST(AES_DECRYPT(b.consultation_fee, get_enc_key()) AS DECIMAL(10,2)) as consultationFee,
        CAST(AES_DECRYPT(b.medication_cost, get_enc_key()) AS DECIMAL(10,2)) as medicationCost,
        CAST(AES_DECRYPT(b.lab_tests_cost, get_enc_key()) AS DECIMAL(10,2)) as labTestsCost,
        CAST(AES_DECRYPT(b.total, get_enc_key()) AS DECIMAL(10,2)) as totalAmount,
        b.status,
        DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i') as generatedDate
      FROM bill b
      LEFT JOIN patient p ON b.patient_id = p.patient_id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// 15. GET - Get single bill by ID
app.get('/api/bills/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await dbStaff.query(`
      SELECT 
        b.bill_id as id,
        b.patient_id,
        CONCAT(
          CAST(AES_DECRYPT(p.first_name, get_enc_key()) AS CHAR),
          ' ',
          CAST(AES_DECRYPT(p.last_name, get_enc_key()) AS CHAR)
        ) as patientName,
        CAST(AES_DECRYPT(b.consultation_fee, get_enc_key()) AS DECIMAL(10,2)) as consultationFee,
        CAST(AES_DECRYPT(b.medication_cost, get_enc_key()) AS DECIMAL(10,2)) as medicationCost,
        CAST(AES_DECRYPT(b.lab_tests_cost, get_enc_key()) AS DECIMAL(10,2)) as labTestsCost,
        CAST(AES_DECRYPT(b.total, get_enc_key()) AS DECIMAL(10,2)) as totalAmount,
        b.status,
        DATE_FORMAT(b.created_at, '%Y-%m-%d') as generatedDate
      FROM bill b
      LEFT JOIN patient p ON b.patient_id = p.patient_id
      WHERE b.bill_id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

// 16. PUT - Update bill (staff updates bills)
app.put('/api/bills/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { consultation_fee, medication_cost, lab_tests_cost, status } = req.body;
    
    console.log('Updating bill:', id, { consultation_fee, medication_cost, lab_tests_cost, status });
    
    // Validation
    if (consultation_fee === undefined && medication_cost === undefined && lab_tests_cost === undefined && !status) {
      return res.status(400).json({ error: 'Must provide at least one cost field or status to update' });
    }
    
    // Build dynamic update query
    let updateFields = [];
    let values = [];
    
    if (consultation_fee !== undefined) {
      updateFields.push('consultation_fee = AES_ENCRYPT(?, get_enc_key())');
      values.push(parseFloat(consultation_fee).toFixed(2));
    }
    
    if (medication_cost !== undefined) {
      updateFields.push('medication_cost = AES_ENCRYPT(?, get_enc_key())');
      values.push(parseFloat(medication_cost).toFixed(2));
    }
    
    if (lab_tests_cost !== undefined) {
      updateFields.push('lab_tests_cost = AES_ENCRYPT(?, get_enc_key())');
      values.push(parseFloat(lab_tests_cost).toFixed(2));
    }
    
    // Calculate new total if any cost field is provided
    if (consultation_fee !== undefined || medication_cost !== undefined || lab_tests_cost !== undefined) {
      // Get current values if not all provided
      const [currentBill] = await dbStaff.query(`
        SELECT 
          CAST(AES_DECRYPT(consultation_fee, get_enc_key()) AS DECIMAL(10,2)) as consultation_fee,
          CAST(AES_DECRYPT(medication_cost, get_enc_key()) AS DECIMAL(10,2)) as medication_cost,
          CAST(AES_DECRYPT(lab_tests_cost, get_enc_key()) AS DECIMAL(10,2)) as lab_tests_cost
        FROM bill WHERE bill_id = ?
      `, [id]);
      
      if (currentBill.length === 0) {
        return res.status(404).json({ error: 'Bill not found' });
      }
      
      const newConsultationFee = consultation_fee !== undefined ? parseFloat(consultation_fee) : parseFloat(currentBill[0].consultation_fee);
      const newMedicationCost = medication_cost !== undefined ? parseFloat(medication_cost) : parseFloat(currentBill[0].medication_cost);
      const newLabTestsCost = lab_tests_cost !== undefined ? parseFloat(lab_tests_cost) : parseFloat(currentBill[0].lab_tests_cost);
      
      const newTotal = newConsultationFee + newMedicationCost + newLabTestsCost;
      updateFields.push('total = AES_ENCRYPT(?, get_enc_key())');
      values.push(newTotal.toFixed(2));
    }
    
    if (status) {
      updateFields.push('status = ?');
      values.push(status.toUpperCase());
    }
    
    values.push(id);
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    // Safely construct query with whitelisted fields only
    const allowedFields = ['consultation_fee', 'medication_cost', 'lab_tests_cost', 'total', 'status'];
    const validatedFields = updateFields.filter(field => {
      const fieldName = field.split(' ')[0].split('=')[0].trim();
      return allowedFields.includes(fieldName);
    });
    
    if (validatedFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const [result] = await dbStaff.query(
      `UPDATE bill SET ${validatedFields.join(', ')} WHERE bill_id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json({
      success: true,
      message: 'Bill updated successfully',
      billId: id
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

// 17. DELETE - Delete bill (staff deletes bills)
app.delete('/api/bills/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    console.log('Deleting bill:', id);
    
    const [result] = await dbStaff.query('DELETE FROM bill WHERE bill_id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json({
      success: true,
      message: 'Bill deleted successfully',
      billId: id
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

// GET all staff
app.get('/api/staff', async (req, res) => {
  try {
    const [rows] = await dbStaff.query(`
      SELECT 
        staff_id as id,
        first_name,
        last_name,
        position,
        department,
        email
      FROM staff
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET staff by ID
app.get('/api/staff/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rows] = await dbStaff.query("SELECT * FROM staff WHERE staff_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// POST - Create new staff
app.post('/api/staff', async (req, res) => {
  try {
    const { first_name, last_name, position, department, email } = req.body;
    const [result] = await dbStaff.query(
      "INSERT INTO staff (first_name, last_name, position, department, email) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, position, department, email]
    );
    res.status(201).json({ id: result.insertId, message: 'Staff created successfully' });
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

// PUT - Update staff
app.put('/api/staff/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { first_name, last_name, position, department, email } = req.body;
    await dbStaff.query(
      "UPDATE staff SET first_name=?, last_name=?, position=?, department=?, email=? WHERE staff_id=?",
      [first_name, last_name, position, department, email, id]
    );
    res.json({ message: 'Staff updated successfully', id });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

// PATCH - Disable staff
app.patch('/api/staff/:id/disable', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await dbStaff.query(
      "UPDATE staff SET status='INACTIVE' WHERE staff_id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    res.json({ message: 'Staff disabled successfully', id });
  } catch (error) {
    console.error('Error disabling staff:', error);
    res.status(500).json({ error: 'Failed to disable staff' });
  }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
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
  console.log('  Staff Page:');
  console.log('    - POST   /api/patients           (create patient)');
  console.log('    - PUT    /api/patients/:id       (update patient)');
  console.log('    - POST   /api/appointments       (create appointment)');
  console.log('    - PUT    /api/appointments/:id   (update appointment)');
  console.log('    - DELETE /api/appointments/:id   (delete appointment)');
  console.log('    - GET    /api/doctors            (get all doctors)');
  console.log('    - POST   /api/bills              (generate bill)');
  console.log('    - GET    /api/bills              (get all bills)');
  console.log('    - GET    /api/bills/:id          (get bill by ID)');
  console.log('    - PUT    /api/bills/:id          (update bill)');
  console.log('    - DELETE /api/bills/:id          (delete bill)');
});