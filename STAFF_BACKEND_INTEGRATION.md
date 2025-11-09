# Backend Integration Guide - Staff Page
meme
## Quick Reference
**File**: `src/pages/Staffpage.js` (1600+ lines)  
**Features**: Patient Management, Appointment Management, Billing System  
**API Endpoints Required**: 11 endpoints  
**Ready Status**: ✅ 100% Frontend Complete | ⏳ Awaiting Backend

## Overview
The Staff page (`Staffpage.js`) is fully prepared for backend database integration. All CRUD operations and data fetching have placeholder functions ready to connect to your API. Staff members can manage patients, appointments, and billing with full create, read, update, and delete capabilities.

## Current State
- ✅ Frontend UI complete with all forms and validation
- ✅ State management implemented with React hooks
- ✅ Placeholder API calls ready with detailed TODO comments
- ✅ Form validation for all input fields
- ✅ Search functionality for patients and doctors
- ✅ Time format conversion (12-hour ↔ 24-hour)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ User confirmations for destructive actions
- ⏳ Needs backend API connection
- ⏳ Needs real database

## Quick Start Integration

### 1. API Endpoints Required

#### Patients
```
GET    /api/patients              - Fetch all patients
GET    /api/patients/:id          - Fetch specific patient details
POST   /api/patients              - Create new patient
PUT    /api/patients/:id          - Update patient information
```

#### Appointments
```
GET    /api/appointments          - Fetch all appointments
POST   /api/appointments          - Create new appointment
PUT    /api/appointments/:id      - Update appointment information
DELETE /api/appointments/:id      - Delete appointment
GET    /api/appointments/completed - Fetch only completed appointments
```

#### Doctors
```
GET    /api/doctors               - Fetch all doctors (for appointment creation)
```

#### Billing
```
POST   /api/billing/generate      - Generate bill for completed appointment
GET    /api/billing/:id           - Retrieve generated bill
DELETE /api/billing/:id           - Delete a generated bill
```

### 2. Expected Data Structures

#### Patient Object
```json
{
  "id": 1,
  "first_name": "Alice",
  "last_name": "Johnson",
  "sex": "Female",
  "dob": "1985-03-15",
  "address": "123 Main St, Springfield",
  "phone": "555-0101",
  "email": "alice.j@email.com"
}
```

#### Appointment Object
```json
{
  "id": 1,
  "patientId": 1,
  "patientName": "Alice Johnson",
  "doctorId": 1,
  "doctorName": "Dr. Sarah Brown",
  "appointmentDate": "2025-11-05",
  "appointmentTime": "09:00 AM",
  "reason": "Annual physical examination and blood work",
  "status": "scheduled"
}
```

#### Doctor Object
```json
{
  "id": 1,
  "name": "Dr. Sarah Brown",
  "department": "General Practice"
}
```

#### Bill Object
```json
{
  "id": 1001,
  "appointmentId": 1,
  "patientId": 1,
  "patientName": "Alice Johnson",
  "doctorName": "Dr. Sarah Brown",
  "appointmentDate": "2025-11-05",
  "consultationFee": 150.00,
  "medicationCost": 45.50,
  "labTestsCost": 220.00,
  "totalAmount": 415.50,
  "status": "unpaid",
  "generatedDate": "2025-11-04",
  "generatedBy": "Staff Member Name"
}
```

### 3. Integration Steps

#### Step 1: Replace Dummy Patients Data
In `Staffpage.js`, replace the `dummyPatients` array:

```javascript
// Add state for patients
const [patients, setPatients] = useState([]);

// Add useEffect to fetch patients
useEffect(() => {
  const fetchPatients = async () => {
    try {
      const response = await fetch('http://your-backend-url/api/patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      alert('Failed to load patients. Please try again.');
    }
  };
  fetchPatients();
}, []);
```

#### Step 2: Replace Dummy Appointments Data
Replace the `dummyAppointments` array:

```javascript
// Add state for appointments
const [appointments, setAppointments] = useState([]);

// Add useEffect to fetch appointments
useEffect(() => {
  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://your-backend-url/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      alert('Failed to load appointments. Please try again.');
    }
  };
  fetchAppointments();
}, []);
```

#### Step 3: Replace Dummy Doctors Data
Replace the `dummyDoctors` array:

```javascript
// Add state for doctors
const [doctors, setDoctors] = useState([]);

// Add useEffect to fetch doctors
useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://your-backend-url/api/doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };
  fetchDoctors();
}, []);
```

#### Step 4: Update Functions to Use Backend

The following functions already have TODO comments with backend integration structure:
- `handleCreatePatient()` - Lines ~193
- `handleUpdatePatient()` - Lines ~232
- `handleCreateAppointment()` - Lines ~272
- `handleUpdateAppointment()` - Lines ~320
- `handleDeleteAppointment()` - Lines ~355
- `handleGenerateBill()` - Lines ~390
- `handleDeleteBill()` - Lines ~425 (NEW)

## Backend Database Schema

### Patients Table
```sql
CREATE TABLE patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  sex ENUM('Male', 'Female') NOT NULL,
  dob DATE NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES users(id)
);
```

### Bills Table
```sql
CREATE TABLE bills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT NOT NULL,
  patient_id INT NOT NULL,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  medication_cost DECIMAL(10, 2) NOT NULL,
  lab_tests_cost DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
  generated_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (generated_by) REFERENCES users(id)
);
```

## API Response Examples

### POST /api/patients
**Request:**
```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "sex": "Female",
  "dob": "1985-03-15",
  "address": "123 Main St, Springfield",
  "phone": "555-0101",
  "email": "alice.j@email.com"
}
```

**Response:**
```json
{
  "message": "Patient created successfully",
  "patient": {
    "id": 1,
    "first_name": "Alice",
    "last_name": "Johnson",
    ...
  }
}
```

### PUT /api/patients/:id
**Request:**
```json
{
  "first_name": "Alice",
  "last_name": "Johnson-Smith",
  "sex": "Female",
  "dob": "1985-03-15",
  "address": "456 New Address St, Springfield",
  "phone": "555-0199",
  "email": "alice.js@email.com"
}
```

**Response:**
```json
{
  "message": "Patient information updated successfully",
  "patient": {
    "id": 1,
    "first_name": "Alice",
    "last_name": "Johnson-Smith",
    ...
  }
}
```

### POST /api/appointments
**Request:**
```json
{
  "patientId": 1,
  "doctorId": 1,
  "appointmentDate": "2025-11-05",
  "appointmentTime": "09:00",
  "reason": "Annual physical examination"
}
```

**Response:**
```json
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": 1,
    "patientId": 1,
    "patientName": "Alice Johnson",
    "doctorId": 1,
    "doctorName": "Dr. Sarah Brown",
    ...
  }
}
```

### PUT /api/appointments/:id
**Request:**
```json
{
  "patientId": 1,
  "doctorId": 2,
  "appointmentDate": "2025-11-06",
  "appointmentTime": "10:30",
  "reason": "Follow-up consultation"
}
```

**Response:**
```json
{
  "message": "Appointment updated successfully",
  "appointment": {
    "id": 1,
    "patientId": 1,
    "patientName": "Alice Johnson",
    "doctorId": 2,
    "doctorName": "Dr. John Doe",
    "appointmentDate": "2025-11-06",
    "appointmentTime": "10:30",
    "reason": "Follow-up consultation",
    "status": "scheduled"
  }
}
```

### DELETE /api/appointments/:id
**Request:**
```
DELETE /api/appointments/1
```

**Response:**
```json
{
  "message": "Appointment deleted successfully",
  "deletedAppointmentId": 1
}
```

### POST /api/billing/generate
**Request:**
```json
{
  "appointmentId": 1,
  "patientId": 1,
  "consultationFee": 150.00,
  "medicationCost": 45.50,
  "labTestsCost": 220.00,
  "status": "unpaid"
}
```

**Response:**
```json
{
  "message": "Bill generated successfully",
  "bill": {
    "id": 1001,
    "appointmentId": 1,
    "patientId": 1,
    "totalAmount": 415.50,
    "status": "unpaid",
    ...
  }
}
```

### DELETE /api/billing/:id
**Request:**
```
DELETE /api/billing/1001
```

**Response:**
```json
{
  "message": "Bill deleted successfully",
  "deletedBillId": 1001
}
```

## Features Ready for Backend

### 1. Patient Management
- Search patients by name
- View detailed patient information
- Create new patients with validation
- **Edit patient information** (all fields editable)
- Display patient demographics (age calculated from DOB)

### 2. Appointment Management
- Display all appointments (scheduled and completed)
- Create new appointments with patient and doctor selection
- **Search for patients and doctors** when creating/editing appointments
- **Edit appointment information** (patient, doctor, date, time, reason)
- **Delete appointments** with confirmation dialog
- Filter appointments by status
- Visual status indicators (badges)

### 3. Billing System
- Select from completed appointments only
- Enter cost breakdown (consultation, medication, lab tests)
- Auto-calculate total amount
- **Bill includes:**
  - Patient ID (Billed To)
  - Payment status (unpaid/paid)
  - Total amount prominently displayed
  - Complete cost breakdown
- Display formatted bill with all details
- Print bill functionality
- Generate multiple bills
- **View all generated bills** in card grid layout
- **Delete bills** with confirmation dialog
- Quick view and delete actions for each bill

## Testing Checklist
- [ ] Backend API endpoints are running
- [ ] CORS is configured for frontend domain
- [ ] Database tables are created with proper relationships
- [ ] Patient creation endpoint works
- [ ] Appointment creation endpoint works
- [ ] Bill generation endpoint works
- [ ] GET endpoints return proper data format
- [ ] Foreign key constraints are enforced
- [ ] Error responses include meaningful messages
- [ ] Authentication (if required) is working
- [ ] Staff user permissions are properly configured

## Additional Features to Consider
1. **Patient Search Enhancement**: Add filters by DOB, phone, email
2. **Appointment Filters**: Filter by date range, doctor, status
3. **Bill History**: View all generated bills
4. **Payment Tracking**: Add payment status to bills
5. **Email/SMS Notifications**: Send appointment confirmations
6. **Prescription Management**: Attach prescriptions to appointments
7. **Insurance Integration**: Add insurance information to patients
8. **Report Generation**: Monthly/yearly billing reports
9. **Appointment Rescheduling**: Allow staff to modify appointments
10. **Patient Notes**: Add medical notes to patient records

## Environment Variables
Create a `.env` file in your project root:
```
REACT_APP_API_URL=http://your-backend-url
```

Then use it in your code:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## Validation Rules
- **Patient Creation**: First name, last name, sex, and DOB are required
- **Appointment Creation**: All fields are required
- **Bill Generation**: Must select completed appointment, all cost fields required
- **Cost Fields**: Must be non-negative numbers
- **Date Fields**: Must be valid dates
- **Email**: Must be valid email format (if provided)
- **Phone**: Should follow standard format (if provided)

## Support
For issues or questions, refer to:
- Frontend code comments (search for "TODO")
- This integration guide
- Backend API documentation
