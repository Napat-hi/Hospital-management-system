# Hospital Management System - Complete Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [Security & Encryption](#security--encryption)
7. [Setup & Running](#setup--running)
8. [Data Flow](#data-flow)
9. [Troubleshooting](#troubleshooting)

---

## System Overview

### What This System Does
The Hospital Management System (HMS) is a web application for managing hospital operations including:
- **Patient Management**: Create, view, update patient records
- **Appointment Scheduling**: Schedule and manage appointments between patients and doctors
- **Billing System**: Generate and manage medical bills
- **User Management**: Manage doctors, staff, and admin accounts

### Technology Stack
- **Frontend**: React (JavaScript)
- **Backend**: Node.js with Express.js v5.1.0
- **Database**: MySQL on MAMP (port 3306)
- **Security**: AES-256 encryption for sensitive data
- **API**: RESTful API with JSON responses

### Current Status
✅ **Fully Functional**:
- **Doctor Page**: Patient viewing, appointment completion, patient search
- **Staff Page**: Complete CRUD operations for:
  - Patient Management (Create, Read, Update, Delete with search)
  - Appointment Management (Create, Read, Update, Delete with validation)
  - Billing System (Generate bills, view all bills, delete bills)
- **Backend API**: 16 RESTful endpoints with full database integration
- **Database Integration**: MySQL with AES-256 encryption for sensitive data
- **Search Functionality**: Real-time filtering with result counts
- **Form Validation**: Client-side validation with user feedback
- **Error Handling**: Comprehensive error messages and alerts

⏳ **Partially Complete**:
- Admin Page (Basic structure, needs backend integration)

---

## Architecture

### System Components

```
┌─────────────────┐      HTTP/JSON       ┌──────────────────┐
│   React App     │ ◄─────────────────► │  Express Server  │
│  (Port 3000)    │                      │   (Port 5000)    │
└─────────────────┘                      └──────────────────┘
                                                   │
                                                   │ mysql2
                                                   ▼
                                         ┌──────────────────┐
                                         │  MySQL Database  │
                                         │   (Port 3306)    │
                                         │   HMS Database   │
                                         └──────────────────┘
```

### Directory Structure
```
Hospital-management-system/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── routes/                  # (Empty - routes in server.js)
│   ├── scripts/                 # Database setup scripts
│   └── server.js                # Main Express server (485 lines)
├── src/
│   ├── api/
│   │   ├── config.js            # API base URL configuration
│   │   ├── fetch.js             # Fetch utility wrapper
│   │   ├── doctorAPI.js         # Doctor page API calls
│   │   └── staffAPI.js          # Staff page API calls (186 lines)
│   ├── components/
│   │   └── Header.js            # Navigation header
│   ├── pages/
│   │   ├── Adminpage.js         # Admin dashboard
│   │   ├── Doctorpage.js        # Doctor dashboard (1376 lines)
│   │   ├── Staffpage.js         # Staff dashboard (1997 lines)
│   │   └── Home.js              # Landing page
│   └── App.js                   # Main app with routing
└── package.json                 # Dependencies
```

---

## Database Schema

### Tables in HMS Database

#### 1. `patient` Table
Stores patient information with encryption.

| Column | Type | Encrypted | Description |
|--------|------|-----------|-------------|
| patient_id | INT | No | Primary key (auto-increment) |
| first_name | VARBINARY | Yes | Patient's first name |
| last_name | VARBINARY | Yes | Patient's last name |
| dob | VARBINARY | Yes | Date of birth (YYYY-MM-DD) |
| sex | VARBINARY | Yes | Gender (Male/Female/Other) |
| phone | VARBINARY | Yes | Contact phone number |
| email | VARBINARY | Yes | Email address |
| address | VARBINARY | Yes | Home address |
| emergency_contact | VARBINARY | Yes | Emergency contact info |

#### 2. `appointment` Table
Stores appointment scheduling and status.

| Column | Type | Encrypted | Description |
|--------|------|-----------|-------------|
| appointment_id | INT | No | Primary key (auto-increment) |
| patient_id | INT | No | Foreign key to patient |
| doctor_id | INT | No | Foreign key to doctor |
| appointment_datetime | DATETIME | No | Date and time of appointment |
| reason | VARBINARY | Yes | Reason for visit |
| status | ENUM | No | 'SCHEDULED' or 'COMPLETED' |

#### 3. `doctor` Table
Stores doctor information.

| Column | Type | Encrypted | Description |
|--------|------|-----------|-------------|
| doctor_id | INT | No | Primary key (auto-increment) |
| first_name | VARBINARY | Yes | Doctor's first name |
| last_name | VARBINARY | Yes | Doctor's last name |
| specialization | VARBINARY | Yes | Medical specialization |
| phone | VARBINARY | Yes | Contact phone |
| email | VARBINARY | Yes | Email address |

#### 4. `bill` Table
Stores billing information.

| Column | Type | Encrypted | Description |
|--------|------|-----------|-------------|
| bill_id | INT | No | Primary key (auto-increment) |
| appointment_id | INT | No | Foreign key to appointment |
| patient_id | INT | No | Foreign key to patient |
| total_amount | DECIMAL(10,2) | No | Total bill amount |
| billing_date | DATETIME | No | Date bill was generated |
| payment_status | ENUM | No | 'PAID' or 'UNPAID' |

### Encryption Function
```sql
CREATE FUNCTION get_enc_key()
RETURNS VARCHAR(32)
DETERMINISTIC
RETURN 'your-32-character-secret-key';
```

---

## Backend API Endpoints

### Base URL
```
http://localhost:5000
```

### Patient Endpoints

#### 1. GET /api/patients
**Purpose**: Fetch all patients  
**Response**: Array of patient objects with decrypted data  
**Example**:
```json
[
  {
    "id": 1,
    "first_name": "Ananda",
    "last_name": "Chaiyasit",
    "dob": "1990-05-15",
    "sex": "Male",
    "phone": "0812345678",
    "email": "ananda.c@email.com",
    "address": "123 Sukhumvit Rd, Bangkok",
    "emergency_contact": "0898765432"
  }
]
```

#### 2. GET /api/patients/:id
**Purpose**: Fetch single patient by ID  
**Parameters**: `id` (patient_id)  
**Response**: Single patient object  

#### 3. POST /api/patients
**Purpose**: Create new patient  
**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "dob": "1985-03-20",
  "sex": "Male",
  "phone": "0891234567",
  "email": "john@email.com",
  "address": "456 Street",
  "emergency_contact": "0887654321"
}
```
**Response**: `{ success: true, patient_id: 11 }`

#### 4. PUT /api/patients/:id
**Purpose**: Update existing patient  
**Parameters**: `id` (patient_id)  
**Request Body**: Same as POST (all fields required)  
**Response**: `{ success: true }`

#### 5. DELETE /api/patients/:id
**Purpose**: Delete patient  
**Parameters**: `id` (patient_id)  
**Response**: `{ success: true }`

---

### Appointment Endpoints

#### 6. GET /api/appointments
**Purpose**: Fetch all appointments with patient and doctor names  
**Response**:
```json
[
  {
    "id": 1,
    "patient_id": 1,
    "doctor_id": 1,
    "patientName": "Ananda Chaiyasit",
    "doctorName": "Dr. Pawat Kittipong",
    "appointment_date": "2024-11-07",
    "appointment_time": "09:00:00",
    "reason": "Heart check-up and consultation",
    "status": "SCHEDULED"
  }
]
```

#### 7. GET /api/appointments/:id
**Purpose**: Fetch single appointment  
**Parameters**: `id` (appointment_id)  
**Response**: Single appointment object  

#### 8. POST /api/appointments
**Purpose**: Create new appointment  
**Request Body**:
```json
{
  "patient_id": 3,
  "doctor_id": 2,
  "appointment_date": "2024-11-20",
  "appointment_time": "14:30",
  "reason": "Follow-up consultation for previous treatment"
}
```
**Note**: Backend combines date and time into `appointment_datetime`  
**Response**: `{ success: true, appointment_id: 6 }`

#### 9. PUT /api/appointments/:id
**Purpose**: Update appointment  
**Parameters**: `id` (appointment_id)  
**Request Body**: Same as POST plus optional `status`  
**Response**: `{ success: true }`

#### 10. DELETE /api/appointments/:id
**Purpose**: Delete appointment  
**Parameters**: `id` (appointment_id)  
**Response**: `{ success: true }`

#### 11. PATCH /api/appointments/:id/complete
**Purpose**: Mark appointment as completed  
**Parameters**: `id` (appointment_id)  
**Response**: `{ success: true }`

#### 12. PATCH /api/appointments/:id/uncomplete
**Purpose**: Mark appointment as scheduled  
**Parameters**: `id` (appointment_id)  
**Response**: `{ success: true }`

---

### Doctor Endpoints

#### 13. GET /api/doctors
**Purpose**: Fetch all doctors  
**Response**:
```json
[
  {
    "id": 1,
    "first_name": "Pawat",
    "last_name": "Kittipong",
    "specialization": "Cardiology",
    "phone": "0823456789",
    "email": "pawat.k@hospital.com"
  }
]
```

---

### Bill Endpoints

#### 14. GET /api/bills
**Purpose**: Fetch all bills with patient names  
**Response**:
```json
[
  {
    "id": 1,
    "appointment_id": 1,
    "patient_id": 1,
    "patientName": "Ananda Chaiyasit",
    "total_amount": "1500.00",
    "billing_date": "2024-11-07T09:30:00.000Z",
    "payment_status": "PAID"
  }
]
```

#### 15. GET /api/bills/:id
**Purpose**: Fetch single bill  
**Parameters**: `id` (bill_id)  
**Response**: Single bill object  

#### 16. POST /api/bills
**Purpose**: Create new bill (patient_id automatically retrieved from appointment)
**Request Body**:
```json
{
  "appointment_id": 5,
  "consultation_fee": 500,
  "medication_cost": 200,
  "lab_tests_cost": 150
}
```
**Backend Processing**:
- Retrieves `patient_id` from appointment table automatically
- Calculates total: `consultation_fee + medication_cost + lab_tests_cost`
- Sets status to 'OPEN' by default

**Response**:
```json
{
  "id": 4,
  "patient_id": 3,
  "total": "850.00",
  "status": "OPEN",
  "message": "Bill generated successfully"
}
```

#### 17. DELETE /api/bills/:id
**Purpose**: Delete a bill
**Parameters**: `id` (bill_id)
**Response**:
```json
{
  "success": true,
  "message": "Bill deleted successfully",
  "billId": 4
}
```

---

### Admin/User Endpoints (Not Yet Integrated)

#### GET /api/users
**Purpose**: Fetch all users (dummy data)  
**Status**: Not connected to database  

#### POST /api/users
**Purpose**: Create user (dummy data)  
**Status**: Not connected to database  

#### PUT /api/users/:id
**Purpose**: Update user (dummy data)  
**Status**: Not connected to database  

#### PATCH /api/users/:id/disable
**Purpose**: Disable user (dummy data)  
**Status**: Not connected to database  

---

## Frontend Pages

### 1. Doctor Page (`Doctorpage.js`)

#### Features
- **Patient Search**: Search by name, view all patients
- **Appointment List**: View scheduled and completed appointments
- **Complete Appointments**: Mark appointments as complete/incomplete
- **Patient Details**: View full patient information

#### Key Components
- **Search Section**: Input field with search button, shows results badge
- **Patient Table**: Displays all patients with ID, name, DOB, sex, address
- **Appointment Tabs**: Toggle between "Scheduled" and "Completed"
- **Appointment Cards**: Show patient name, doctor, date/time, reason, complete button

#### State Management
```javascript
const [patients, setPatients] = useState([]);
const [appointments, setAppointments] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [selectedPatient, setSelectedPatient] = useState(null);
const [activeAppointmentTab, setActiveAppointmentTab] = useState('scheduled');
```

#### API Integration
```javascript
// Load data on mount
useEffect(() => {
  const fetchData = async () => {
    const patientsData = await doctorAPI.getPatients();
    const appointmentsData = await doctorAPI.getAppointments();
    setPatients(patientsData);
    setAppointments(appointmentsData);
  };
  fetchData();
}, []);

// Complete appointment
const handleCompleteAppointment = async (id) => {
  await doctorAPI.completeAppointment(id);
  // Reload appointments...
};
```

---

### 2. Staff Page (`Staffpage.js`)

#### Features
- **Patient Management**: Full CRUD (Create, Read, Update, Delete)
- **Appointment Management**: Full CRUD with searchable dropdowns
- **Billing System**: Create bills, view payment status
- **Search Functionality**: Real-time filtering of patients
- **Form Validation**: Client-side validation for all forms

#### Sections
1. **Patient Management**
   - Main patient list with search
   - Create new patient form
   - Edit patient form
   - View patient details modal
   - Delete with confirmation

2. **Appointment Management**
   - All appointments list
   - Create appointment with searchable patient/doctor dropdowns
   - Edit appointment
   - View appointment details
   - Delete with confirmation

3. **Billing System**
   - All bills list
   - Generate bill from completed appointments
   - View bill details

#### Key State
```javascript
const [patients, setPatients] = useState([]);
const [appointments, setAppointments] = useState([]);
const [bills, setBills] = useState([]);
const [doctors, setDoctors] = useState([]);

const [mainPatientSearchQuery, setMainPatientSearchQuery] = useState('');
const [patientSearchQuery, setPatientSearchQuery] = useState('');
const [doctorSearchQuery, setDoctorSearchQuery] = useState('');

const [selectedPatient, setSelectedPatient] = useState(null);
const [editingPatient, setEditingPatient] = useState(null);
const [patientFormData, setPatientFormData] = useState({...});
```

#### Form Validation
```javascript
const validatePatientForm = (data) => {
  const errors = {};
  let isValid = true;

  if (!data.first_name.trim()) {
    errors.first_name = "First name is required";
    isValid = false;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.email = "Invalid email format";
    isValid = false;
  }
  
  return { isValid, errors };
};
```

#### Appointment Validation
```javascript
const validateAppointmentForm = (data) => {
  // Patient and doctor required
  if (!data.patientId) errors.patientId = "Patient is required";
  if (!data.doctorId) errors.doctorId = "Doctor is required";
  
  // Date cannot be in the past
  const selectedDate = new Date(data.appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    errors.appointmentDate = "Appointment date cannot be in the past";
  }
  
  // Reason must be at least 10 characters
  if (data.reason.trim().length < 10) {
    errors.reason = "Reason must be at least 10 characters";
  }
  
  // Show validation errors to user
  if (!isValid) {
    const errorMessages = [];
    if (errors.patientId) errorMessages.push('• ' + errors.patientId);
    if (errors.doctorId) errorMessages.push('• ' + errors.doctorId);
    if (errors.appointmentDate) errorMessages.push('• ' + errors.appointmentDate);
    if (errors.appointmentTime) errorMessages.push('• ' + errors.appointmentTime);
    if (errors.reason) errorMessages.push('• ' + errors.reason);
    alert('Please fix the following errors:\n\n' + errorMessages.join('\n'));
  }
  
  return isValid;
};
```

#### API Integration (`src/api/staffAPI.js`)
```javascript
// Helper function with logging
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Call: ${method} ${url}`, data ? data : '');
  
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) options.body = JSON.stringify(data);
  
  const response = await fetch(url, options);
  console.log(`Response Status: ${response.status}`);
  
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  
  const result = await response.json();
  console.log('Response Data:', result);
  return result;
};

// Create appointment with field name conversion
export const createAppointment = async (appointmentData) => {
  // Convert camelCase to snake_case for backend
  const backendData = {
    patient_id: appointmentData.patientId,
    doctor_id: appointmentData.doctorId,
    appointment_date: appointmentData.appointmentDate,
    appointment_time: appointmentData.appointmentTime,
    reason: appointmentData.reason
  };
  return apiCall('/appointments', 'POST', backendData);
};
```

---

### 3. Admin Page (`Adminpage.js`)

#### Current Status
- Basic user management UI
- Uses dummy data (not integrated with database)
- CRUD operations on local state only

#### Needs Integration
- Connect to `/api/users` endpoints
- Implement real user creation/editing
- Add authentication and authorization

---

## Security & Encryption

### AES-256 Encryption

#### What's Encrypted
- Patient personal information (names, DOB, contact details)
- Doctor information (names, specialization, contact)
- Appointment reasons
- All sensitive text fields

#### How It Works

**Backend (Encryption)**:
```javascript
// When creating/updating patient
await db.query(`
  INSERT INTO patient (first_name, last_name, dob, sex, phone, email, address, emergency_contact)
  VALUES (
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key()),
    AES_ENCRYPT(?, get_enc_key())
  )
`, [first_name, last_name, dob, sex, phone, email, address, emergency_contact]);
```

**Backend (Decryption)**:
```javascript
// When fetching patients
await db.query(`
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
```

#### Security Best Practices
1. **Encryption key stored in database function** (not in code)
2. **All sensitive fields encrypted at rest** in database
3. **Data only decrypted when retrieved** via API
4. **Frontend never sees encrypted data** (backend handles it)
5. **CORS enabled only for localhost:3000** (restrict in production)

---

## Setup & Running

### Prerequisites
1. **MAMP** installed with MySQL running on port 3306
2. **Node.js** v14+ installed
3. **npm** package manager

### Initial Setup

#### 1. Database Setup
```sql
-- 1. Create HMS database
CREATE DATABASE HMS;
USE HMS;

-- 2. Create encryption key function
DELIMITER //
CREATE FUNCTION get_enc_key()
RETURNS VARCHAR(32)
DETERMINISTIC
RETURN 'your-32-character-secret-key';
//
DELIMITER ;

-- 3. Create tables (see Database Schema section)
-- 4. Insert test data (see backend/scripts/)
```

#### 2. Backend Configuration
```bash
cd backend
npm install express cors mysql2 dotenv
```

**Create `backend/config/database.js`**:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'HMS',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

#### 3. Frontend Configuration
```bash
npm install
```

**Edit `src/api/config.js`**:
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

### Running the Application

#### Terminal 1: Start Backend
```bash
cd backend
node server.js
```

Expected output:
```
Backend running on http://localhost:5000
✅ Database connected successfully!
```

#### Terminal 2: Start Frontend
```bash
npm start
```

Browser automatically opens to `http://localhost:3000`

### Verify Setup
1. Navigate to Doctor page
2. Should see 10 Thai patients listed
3. Should see 5 appointments (3 scheduled, 2 completed)
4. Try searching for a patient
5. Try completing an appointment

---

## Data Flow

### Example: Creating an Appointment

#### 1. User Action
- User fills out appointment form on Staff page
- Selects patient from dropdown: "Ananda Chaiyasit" (ID: 1)
- Selects doctor from dropdown: "Dr. Pawat Kittipong" (ID: 1)
- Enters date: "2024-11-20"
- Enters time: "14:30"
- Enters reason: "Follow-up consultation for heart condition"
- Clicks "Create Appointment"

#### 2. Frontend Validation
```javascript
const validateAppointmentForm = (appointmentFormData) => {
  // Check all fields are filled
  // Check date is not in past
  // Check reason is at least 10 characters
  // Show alert if validation fails
};
```

#### 3. Frontend API Call
```javascript
// Convert camelCase to snake_case
const handleCreateAppointment = async () => {
  if (!validateAppointmentForm(appointmentFormData)) return;
  
  try {
    await staffAPI.createAppointment(appointmentFormData);
    // Reload appointments
    alert('Appointment created successfully!');
  } catch (error) {
    alert('Error creating appointment');
  }
};
```

#### 4. staffAPI.js Processing
```javascript
export const createAppointment = async (appointmentData) => {
  const backendData = {
    patient_id: appointmentData.patientId,      // 1
    doctor_id: appointmentData.doctorId,        // 1
    appointment_date: appointmentData.appointmentDate,  // "2024-11-20"
    appointment_time: appointmentData.appointmentTime,  // "14:30"
    reason: appointmentData.reason              // "Follow-up..."
  };
  
  return apiCall('/appointments', 'POST', backendData);
};
```

#### 5. Backend Processing (server.js)
```javascript
app.post('/api/appointments', async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
  
  // Combine date and time
  const datetime = `${appointment_date} ${appointment_time}:00`;
  
  // Insert with encryption
  const [result] = await db.query(`
    INSERT INTO appointment (patient_id, doctor_id, appointment_datetime, reason, status)
    VALUES (?, ?, ?, AES_ENCRYPT(?, get_enc_key()), 'SCHEDULED')
  `, [patient_id, doctor_id, datetime, reason]);
  
  res.json({ success: true, appointment_id: result.insertId });
});
```

#### 6. Database Storage
```
appointment table:
┌────────────────┬────────────┬───────────┬─────────────────────┬──────────────────┬───────────┐
│ appointment_id │ patient_id │ doctor_id │ appointment_datetime│ reason (encrypted)│ status    │
├────────────────┼────────────┼───────────┼─────────────────────┼──────────────────┼───────────┤
│ 6              │ 1          │ 1         │ 2024-11-20 14:30:00 │ <binary data>    │ SCHEDULED │
└────────────────┴────────────┴───────────┴─────────────────────┴──────────────────┴───────────┘
```

#### 7. Response Flow
```
Database → Backend → Frontend → User
{success: true, appointment_id: 6} → Alert: "Appointment created successfully!"
```

---

## Troubleshooting

### Common Issues

#### 1. "Database connection failed"
**Symptoms**: Backend won't start, error in console  
**Causes**:
- MAMP MySQL not running
- Wrong port (not 3306)
- Wrong credentials (not root/root)
- Database HMS doesn't exist

**Solutions**:
```bash
# Check MAMP is running
# Check MySQL port in MAMP settings
# Verify credentials in backend/config/database.js
# Create HMS database if missing
```

#### 2. "Cannot GET /api/patients"
**Symptoms**: Frontend shows no data, network errors  
**Causes**:
- Backend not running
- Wrong API_BASE_URL in config.js
- CORS issues

**Solutions**:
```bash
# Start backend: cd backend && node server.js
# Check src/api/config.js has correct URL
# Verify CORS is enabled in server.js
```

#### 3. "Validation failed" on appointment creation
**Symptoms**: Button does nothing, console shows "Validation failed"  
**Causes**:
- Missing required fields
- Date in the past
- Reason too short (<10 characters)

**Solutions**:
- Check alert message for specific errors
- Ensure reason is at least 10 characters
- Use future date for appointments

#### 4. Encrypted data shows as gibberish
**Symptoms**: Names show as "����" or binary data  
**Causes**:
- Encryption key missing
- get_enc_key() function not created
- Wrong CAST in SQL query

**Solutions**:
```sql
-- Verify encryption function exists
SELECT get_enc_key();  -- Should return your key

-- Verify decryption works
SELECT CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) FROM patient LIMIT 1;
```

#### 5. "Port 5000 already in use"
**Symptoms**: Backend won't start  
**Causes**:
- Another process using port 5000
- Previous backend instance still running

**Solutions**:
```powershell
# Windows PowerShell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### 6. Frontend shows empty lists
**Symptoms**: No patients/appointments visible  
**Causes**:
- No data in database
- API call failing silently
- useEffect not triggering

**Solutions**:
```javascript
// Check console for errors
// Verify data exists in database
SELECT COUNT(*) FROM patient;
SELECT COUNT(*) FROM appointment;

// Check Network tab in browser DevTools
// Should see successful GET requests to /api/patients, /api/appointments
```

---

## Sample Data

### 10 Thai Patients in Database
1. Ananda Chaiyasit (M, 1990-05-15)
2. Kanya Thongdee (F, 1985-08-22)
3. Somchai Rattanakorn (M, 1978-12-03)
4. Mayuree Nimman (F, 1992-03-10)
5. Arthit Sirisuk (M, 1988-07-18)
6. Benjamas Chan (F, 1995-01-25)
7. Preecha Sukjai (M, 1983-09-14)
8. Thanya Wong (F, 1990-11-30)
9. Surasak Boonyasiri (M, 1975-04-07)
10. Manita Yodrak (F, 1987-06-21)

### 5 Doctors in Database
1. Dr. Pawat Kittipong (Cardiology)
2. Dr. Siriwan Boonsong (Neurology)
3. Dr. Thanakorn Meechai (Pediatrics)
4. Dr. Jirapat Suntorn (Orthopedics)
5. Dr. Kanchana Sriwan (General Medicine)

### 5 Sample Appointments
1. Ananda → Dr. Pawat - Nov 7, 9:00 AM - Heart check-up (SCHEDULED)
2. Kanya → Dr. Siriwan - Nov 8, 10:30 AM - Migraine consultation (SCHEDULED)
3. Arthit → Dr. Kanchana - Nov 9, 8:30 AM - Health screening (SCHEDULED)
4. Mayuree → Dr. Thanakorn - Nov 6, 1:00 PM - Child vaccination (COMPLETED)
5. Somchai → Dr. Jirapat - Nov 5, 3:00 PM - Knee pain treatment (COMPLETED)

---

## Development Notes

### Code Quality
- **Extensive logging**: Console logs throughout for debugging
- **Error handling**: Try-catch blocks in all API calls
- **User feedback**: Alerts for success/failure, validation errors
- **Form validation**: Client-side validation before API calls
- **Responsive design**: Mobile-friendly layouts

### Recent Updates (November 15, 2025)
✅ **Billing System Complete**:
- Bill generation from completed appointments
- Backend automatically retrieves patient_id from appointments
- Display bill ID, patient ID, total amount, and status
- Delete bills with confirmation
- All bills list with proper formatting

✅ **Bug Fixes**:
- Fixed appointment creation validation with user alerts
- Fixed bill generation missing required fields
- Fixed bill display showing undefined values
- Added safety checks for all data fields (?.toUpperCase(), parseFloat)
- Fixed search functionality with null/undefined handling

✅ **Database Optimization**:
- Appointments now include patient_id and doctor_id in response
- Bills query no longer tries to decrypt non-encrypted total field
- Enhanced DELETE endpoint with existence checking

### Known Limitations
1. **Admin page**: Not yet connected to database
2. **Authentication**: No login system implemented
3. **Authorization**: No role-based access control
4. **Search optimization**: Client-side filtering (could be server-side)
5. **Pagination**: No pagination for large datasets
6. **Bill breakdown**: Shows only total amount, not itemized costs in bills list

### Future Enhancements
- [ ] Add user authentication (login/logout)
- [ ] Implement role-based permissions
- [ ] Add pagination for large lists
- [ ] Server-side search with SQL LIKE
- [ ] Export reports (PDF, Excel)
- [ ] Email notifications for appointments
- [ ] Dashboard with statistics
- [ ] Medical records management
- [ ] Prescription tracking
- [ ] Payment processing integration

---

## Quick Command Reference

### Start Everything
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm start
```

### Check Database
```sql
USE HMS;
SELECT COUNT(*) FROM patient;
SELECT COUNT(*) FROM appointment;
SELECT * FROM patient LIMIT 1;
```

### Stop Everything
```bash
# Ctrl+C in both terminals
# Or kill processes by port
netstat -ano | findstr :5000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Support & Contact

For issues or questions:
1. Check console logs (browser and terminal)
2. Check Network tab in browser DevTools
3. Verify database connection
4. Review this documentation
5. Check error messages in alerts

---

**Last Updated**: November 15, 2025  
**Version**: 1.1  
**Status**: Fully Functional (Doctor & Staff pages with complete billing system)
