# Backend Integration Guide - Doctor Page

## Overview
The Doctor page (`Doctorpage.js`) is fully prepared for backend database integration. All data fetching and appointment management operations have placeholder functions ready to connect to your API.

## Current State
- ✅ Frontend UI complete with patient search, appointment viewing, and completion features
- ✅ State management implemented
- ✅ Placeholder API calls ready
- ⏳ Needs backend API connection
- ⏳ Needs real database

## Quick Start Integration

### 1. API Endpoints Required

#### Patients
```
GET    /api/patients              - Fetch all patients
GET    /api/patients/:id          - Fetch specific patient details
GET    /api/patients?search=query - Search patients by name
```

#### Appointments
```
GET    /api/appointments                  - Fetch all appointments
GET    /api/appointments/completed        - Fetch completed appointments only
PATCH  /api/appointments/:id/complete     - Mark appointment as complete
PATCH  /api/appointments/:id/uncomplete   - Unmark appointment as complete
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
  "address": "123 Main St, Springfield"
}
```

#### Appointment Object
```json
{
  "id": 1,
  "patientName": "Alice Johnson",
  "doctorName": "Dr. Sarah Brown",
  "appointmentDate": "2025-11-05",
  "appointmentTime": "09:00 AM",
  "reason": "Annual physical examination and blood work",
  "status": "scheduled"
}
```

### 3. Integration Steps

#### Step 1: Replace Dummy Patients Data
In `Doctorpage.js`, replace the `dummyPatients` array:

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

#### Step 3: Update Functions to Use Backend

The following functions already have TODO comments with backend integration code ready:
- `handlePatientSearch()` - Lines ~208
- `handleViewPatient()` - Lines ~226
- `handleCompleteAppointment()` - Lines ~248 (already has backend structure)
- `handleUnmarkComplete()` - Lines ~270 (already has backend structure)

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

## API Response Examples

### GET /api/patients
```json
[
  {
    "id": 1,
    "first_name": "Alice",
    "last_name": "Johnson",
    "sex": "Female",
    "dob": "1985-03-15",
    "address": "123 Main St, Springfield"
  }
]
```

### GET /api/appointments
```json
[
  {
    "id": 1,
    "patientName": "Alice Johnson",
    "doctorName": "Dr. Sarah Brown",
    "appointmentDate": "2025-11-05",
    "appointmentTime": "09:00 AM",
    "reason": "Annual physical examination and blood work",
    "status": "scheduled"
  }
]
```

### PATCH /api/appointments/:id/complete
Request: Empty body or `{ "status": "completed" }`

Response:
```json
{
  "message": "Appointment marked as complete",
  "appointment": {
    "id": 1,
    "status": "completed"
  }
}
```

## Features Ready for Backend

### 1. Patient Information View
- Search patients by name
- View detailed patient information (name, sex, DOB, address)
- Display calculated age from DOB

### 2. Appointments View
- Display all scheduled (active) appointments
- Mark appointments as complete
- Filter completed appointments from active view

### 3. Completed Appointments View
- Show all completed appointments
- Unmark appointments as complete (move back to scheduled)
- Visual distinction with green badges and disabled buttons

## Testing Checklist
- [ ] Backend API endpoints are running
- [ ] CORS is configured for frontend domain
- [ ] Database tables are created with proper relationships
- [ ] Patient data can be fetched and displayed
- [ ] Appointments data can be fetched and displayed
- [ ] Mark as complete functionality works
- [ ] Unmark as complete functionality works
- [ ] Patient search returns filtered results
- [ ] Patient details view shows correct information
- [ ] Error responses include meaningful messages
- [ ] Authentication (if required) is working

## Additional Features to Consider
1. **Loading States**: Add spinners during API calls
2. **Error Handling**: Better error messages with retry options
3. **Real-time Updates**: WebSocket for live appointment updates
4. **Pagination**: Handle large datasets efficiently
5. **Filtering**: Add date range filters for appointments
6. **Sorting**: Allow sorting appointments by date/time/patient
7. **Notifications**: Alert doctors of upcoming appointments
8. **Notes**: Allow doctors to add notes to completed appointments

## Environment Variables
Create a `.env` file in your project root:
```
REACT_APP_API_URL=http://your-backend-url
```

Then use it in your code:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## Support
For issues or questions, refer to:
- Frontend code comments (search for "TODO")
- This integration guide
- Backend API documentation
