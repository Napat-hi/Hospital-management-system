# Hospital Management System - Technical Documentation

## Project Demonstration Guide

This document explains the technical architecture, database design, and implementation details of our Hospital Management System. It includes explanations for database concepts like triggers, stored procedures, and encryption that may be discussed during the presentation.

---

## 🎯 What Does This System Do?

Imagine you're running a hospital. You need to:
1. Keep track of patients (their names, phone numbers, etc.)
2. Schedule appointments between patients and doctors
3. Generate bills after appointments

Our system does all of this through a website!

---

## 🏗️ The Big Picture: How It's Built

Think of our system like a restaurant:

```
┌─────────────────────────────────────────────────────────┐
│                    THE RESTAURANT                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  FRONT (What customers see)                              │
│  ├─ Menu (Website pages)                                 │
│  ├─ Waiters (React - shows info, takes orders)          │
│  └─ Tables (Your browser - Chrome, Firefox, etc.)       │
│                                                           │
│  KITCHEN (Behind the scenes)                             │
│  ├─ Chef (Node.js + Express - processes requests)       │
│  ├─ Recipe Book (Our code in server.js)                 │
│  └─ Pantry (MySQL Database - stores everything)         │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Technologies We Used

### 1. **React** (The Waiter - Frontend)
- **What it is**: A JavaScript library for building user interfaces
- **What it does in our project**: Creates the website pages you see
- **Real example**: 
  - When you click "Create Patient", React shows you a form
  - When you type in the search box, React filters the list instantly
  - When you click "Generate Bill", React sends the request

**Files using React:**
- `src/pages/Doctorpage.js` - Doctor's dashboard
- `src/pages/Staffpage.js` - Staff's dashboard (patients, appointments, bills)
- `src/pages/Adminpage.js` - Admin's dashboard
- `src/components/Header.js` - Navigation menu

### 2. **Node.js** (The Chef - Backend Engine)
- **What it is**: JavaScript that runs on the server (not in the browser)
- **What it does**: Listens for requests and responds
- **Real example**:
  - You click "Create Patient" → Node.js receives the request
  - Node.js processes it → Saves to database
  - Node.js sends back "Success!" → You see the confirmation

**Why Node.js?**
- We already know JavaScript (same language for frontend and backend!)
- It's fast and popular
- Lots of helpful libraries available

### 3. **Express.js** (The Recipe Book - Backend Framework)
- **What it is**: A framework that makes Node.js easier to use
- **What it does**: Helps us organize our backend code
- **Real example**:

```javascript
// Without Express (hard):
if (url === '/api/patients' && method === 'GET') {
  // Get patients code here...
}

// With Express (easy):
app.get('/api/patients', async (req, res) => {
  // Get patients code here...
});
```

**File using Express:**
- `backend/server.js` - Our main backend file (485 lines)

### 4. **MySQL** (The Pantry - Database)
- **What it is**: A system for storing and organizing data
- **What it does**: Keeps all patient, appointment, and bill information
- **Real example**:

```
PATIENT TABLE:
┌────┬────────────┬──────────────┬───────────┐
│ ID │ First Name │  Last Name   │   Phone   │
├────┼────────────┼──────────────┼───────────┤
│ 1  │ Ananda     │ Chaiyasit    │ 0812345678│
│ 2  │ Kanya      │ Thongdee     │ 0823456789│
│ 3  │ Somchai    │ Rattanakorn  │ 0834567890│
└────┴────────────┴──────────────┴───────────┘
```

**Database tool we use:**
- MAMP (runs MySQL server on port 3306)

### 5. **API** (The Menu - How Frontend Talks to Backend)
- **What it is**: A set of rules for how the frontend and backend communicate
- **What it does**: Defines what requests you can make
- **Real example**:

```javascript
// API Endpoints (like menu items):
GET    /api/patients        → "Give me all patients"
POST   /api/patients        → "Create a new patient"
PUT    /api/patients/5      → "Update patient #5"
DELETE /api/patients/5      → "Delete patient #5"
```

---

## 📱 How Data Flows (Step by Step)

Let's say a staff member wants to **create a new patient**:

### Step 1: User Action (Frontend)
```javascript
// In Staffpage.js
User fills out form:
  First Name: "John"
  Last Name: "Doe"
  Phone: "0891234567"

User clicks "Create Patient" button
```

### Step 2: React Sends Request (Frontend)
```javascript
// In staffAPI.js
const response = await fetch('http://localhost:5000/api/patients', {
  method: 'POST',
  body: JSON.stringify({
    first_name: "John",
    last_name: "Doe",
    phone: "0891234567"
  })
});
```

### Step 3: Express Receives Request (Backend)
```javascript
// In server.js
app.post('/api/patients', async (req, res) => {
  // Get data from request
  const { first_name, last_name, phone } = req.body;
  
  // Continue to Step 4...
});
```

### Step 4: Save to Database (Backend)
```javascript
// Still in server.js
await db.query(`
  INSERT INTO patient (first_name, last_name, phone)
  VALUES (?, ?, ?)
`, [first_name, last_name, phone]);
```

### Step 5: Send Response Back (Backend → Frontend)
```javascript
// Still in server.js
res.json({ success: true, patient_id: 11 });
```

### Step 6: Show Success Message (Frontend)
```javascript
// Back in Staffpage.js
alert("Patient created successfully!");
// Reload the patient list
```

---

## 🔐 Security: Encryption

**Problem**: Patient data is sensitive (names, phone numbers, addresses)

**Solution**: We encrypt it!

### How Encryption Works:

```javascript
// What we want to store:
"John Doe"

// What actually gets stored in database:
"x8k#mP9$qL2vN@4zR"

// When we need it:
"John Doe" (decrypted automatically)
```

**In our code:**
```sql
-- When saving (ENCRYPT):
INSERT INTO patient (first_name)
VALUES (AES_ENCRYPT('John', get_enc_key()))

-- When reading (DECRYPT):
SELECT CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR)
FROM patient
```

---

## 🎨 Frontend Structure (React)

### How React Components Work:

Think of components like LEGO blocks - you build the website by combining them.

```
App.js (The Box)
├── Header.js (Navigation at top)
├── Home.js (Landing page)
├── Doctorpage.js (Doctor dashboard)
│   ├── Patient Search
│   ├── Patient List
│   └── Appointment Cards
├── Staffpage.js (Staff dashboard)
│   ├── Patient Management
│   ├── Appointment Management
│   └── Billing System
└── Adminpage.js (Admin dashboard)
```

### State Management (Memory)

React uses "state" to remember things:

```javascript
const [patients, setPatients] = useState([]);
//      ↑          ↑              ↑
//   Variable   Function      Initial value
//              to change it
```

**Real example:**
```javascript
// Initially: patients = []
// After loading: patients = [{id: 1, name: "John"}, {id: 2, name: "Jane"}]
// After adding new patient: patients = [..., {id: 3, name: "Bob"}]
```

---

## 🔧 Backend Structure (Express + Node.js)

### How the Server Works:

1. **Start the server:**
```bash
cd backend
node server.js
```

2. **Server listens on port 5000:**
```javascript
app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
```

3. **Handle requests:**
```javascript
// 17 different endpoints (17 different things you can do)
app.get('/api/patients', ...)      // Get all patients
app.post('/api/patients', ...)     // Create patient
app.put('/api/patients/:id', ...)  // Update patient
app.delete('/api/patients/:id', ...) // Delete patient
// ... and 13 more
```

---

## 💾 Database Structure

### Tables in Our Database:

```
HMS Database
├── patient (stores patient info)
│   ├── patient_id
│   ├── first_name (encrypted)
│   ├── last_name (encrypted)
│   ├── dob (encrypted)
│   ├── sex (encrypted)
│   ├── phone (encrypted)
│   ├── email (encrypted)
│   └── address (encrypted)
│
├── doctor (stores doctor info)
│   ├── doctor_id
│   ├── first_name
│   ├── last_name
│   ├── specialization
│   └── email
│
├── appointment (stores appointments)
│   ├── appointment_id
│   ├── patient_id (links to patient)
│   ├── doctor_id (links to doctor)
│   ├── appointment_datetime
│   ├── reason (encrypted)
│   └── status (SCHEDULED or COMPLETED)
│
└── bill (stores bills)
    ├── bill_id
    ├── patient_id (links to patient)
    ├── total
    ├── status (OPEN or PAID)
    └── created_at
```

### Relationships (How Tables Connect):

```
patient ──┬── has many ──> appointments
          └── has many ──> bills

doctor ──── has many ──> appointments

appointment ── generates ──> bill
```

---

## 🚀 How to Run the System

### Prerequisites (What you need installed):
1. **Node.js** - To run JavaScript on the server
2. **MAMP** - To run MySQL database
3. **Browser** - Chrome, Firefox, etc.

### Starting the System:

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
# You should see: "Backend running on http://localhost:5000"
```

**Terminal 2 - Frontend:**
```bash
npm start
# Browser opens automatically to http://localhost:3000
```

**What's happening:**
- Backend listens on port 5000 (waits for requests)
- Frontend runs on port 3000 (shows the website)
- When you use the website, frontend talks to backend
- Backend talks to database, then responds to frontend

---

## 🎯 Real-World Example: Creating an Appointment

Let's walk through what happens when you create an appointment:

### 1. **User fills the form:**
```
Patient: Ananda Chaiyasit (ID: 1)
Doctor: Dr. Pawat Kittipong (ID: 1)
Date: 2025-11-20
Time: 14:30
Reason: Regular checkup for heart condition
```

### 2. **Frontend validates:**
```javascript
if (!appointmentDate) {
  alert("Please select a date!");
  return;
}

if (reason.length < 10) {
  alert("Reason must be at least 10 characters");
  return;
}
```

### 3. **Frontend sends to backend:**
```javascript
// staffAPI.js converts to backend format
{
  patient_id: 1,
  doctor_id: 1,
  appointment_date: "2025-11-20",
  appointment_time: "14:30",
  reason: "Regular checkup for heart condition"
}
```

### 4. **Backend processes:**
```javascript
// server.js combines date and time
const datetime = "2025-11-20 14:30:00";

// Encrypts the reason
INSERT INTO appointment (
  patient_id, 
  doctor_id, 
  appointment_datetime, 
  reason, 
  status
) VALUES (
  1, 
  1, 
  "2025-11-20 14:30:00", 
  AES_ENCRYPT("Regular checkup...", key),
  "SCHEDULED"
)
```

### 5. **Database saves it:**
```
New row in appointment table:
ID: 6 | patient_id: 1 | doctor_id: 1 | datetime: 2025-11-20 14:30:00
```

### 6. **Backend responds:**
```javascript
res.json({ success: true, appointment_id: 6 });
```

### 7. **Frontend shows success:**
```javascript
alert("Appointment created successfully!");
// Reloads the appointment list to show the new one
```

---

## 🐛 Common Issues and Solutions

### Issue 1: "Cannot connect to backend"
**Problem**: Frontend can't reach backend  
**Solution**: Make sure `node server.js` is running in backend folder  
**Check**: Open http://localhost:5000 - should show "Cannot GET /"

### Issue 2: "Database connection failed"
**Problem**: Can't connect to MySQL  
**Solution**: 
1. Open MAMP
2. Click "Start Servers"
3. Check MySQL port is 3306

### Issue 3: "Port 5000 already in use"
**Problem**: Another program is using port 5000  
**Solution**:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

---

## 📚 Code Organization

### Frontend (src folder):
```
src/
├── api/
│   ├── config.js         - API URL configuration
│   ├── fetch.js          - Basic fetch helper
│   ├── doctorAPI.js      - Doctor page API calls (6 functions)
│   └── staffAPI.js       - Staff page API calls (13 functions)
├── components/
│   └── Header.js         - Navigation header
├── pages/
│   ├── Home.js           - Landing page
│   ├── Doctorpage.js     - Doctor dashboard (1376 lines)
│   ├── Staffpage.js      - Staff dashboard (2020 lines)
│   └── Adminpage.js      - Admin dashboard
└── App.js                - Main app with routing
```

### Backend (backend folder):
```
backend/
├── config/
│   └── database.js       - MySQL connection setup
├── routes/
│   └── (empty - all routes in server.js)
├── scripts/
│   └── (database setup scripts)
└── server.js             - Main backend file (505 lines)
```

---

## 🔄 Data Format Conversion

One tricky thing: JavaScript uses **camelCase**, but MySQL uses **snake_case**

```javascript
// Frontend (JavaScript - camelCase):
{
  firstName: "John",
  lastName: "Doe",
  appointmentDate: "2025-11-20"
}

// Backend (MySQL - snake_case):
{
  first_name: "John",
  last_name: "Doe",
  appointment_date: "2025-11-20"
}
```

**We handle this in staffAPI.js:**
```javascript
const createPatient = async (patientData) => {
  // Convert camelCase to snake_case
  const backendData = {
    first_name: patientData.firstName,
    last_name: patientData.lastName,
    // ... etc
  };
  
  return apiCall('/patients', 'POST', backendData);
};
```

---

## 🎓 Key Concepts to Understand

### 1. **Asynchronous Programming (async/await)**

JavaScript doesn't wait - it keeps going! But sometimes we NEED to wait:

```javascript
// Bad (doesn't wait):
const data = getPatients();
console.log(data); // undefined! Didn't wait for database

// Good (waits):
const data = await getPatients();
console.log(data); // [patient1, patient2, ...] Got the data!
```

### 2. **Promises**

A promise is like ordering food:
- **Pending**: Food is being prepared
- **Fulfilled**: Food is ready! ✅
- **Rejected**: Kitchen ran out of ingredients ❌

```javascript
fetch('/api/patients')
  .then(response => response.json())  // When it succeeds
  .catch(error => console.error(error)) // When it fails
```

### 3. **RESTful API**

REST = Representational State Transfer (fancy name for simple concept)

```
GET    = Read (like reading a book)
POST   = Create (like writing a new book)
PUT    = Update (like editing a book)
DELETE = Delete (like throwing away a book)
```

### 4. **JSON (JavaScript Object Notation)**

The language frontend and backend use to talk:

```javascript
// JavaScript object:
const patient = { name: "John", age: 30 };

// Convert to JSON string (to send):
JSON.stringify(patient)
// Result: '{"name":"John","age":30}'

// Convert back to object (when received):
JSON.parse('{"name":"John","age":30}')
// Result: { name: "John", age: 30 }
```

---

## 🎯 Summary: The Complete Flow

1. **User opens browser** → React loads website
2. **User clicks button** → React sends HTTP request
3. **Backend receives request** → Express routes to correct function
4. **Server queries database** → MySQL returns data
5. **Server encrypts/decrypts if needed** → AES encryption
6. **Server sends response** → JSON format
7. **React receives response** → Updates the page
8. **User sees result** → Success message or updated list

---

## 💡 Why We Built It This Way

1. **React**: Makes the UI interactive and fast
2. **Node.js + Express**: We already know JavaScript, easy to learn
3. **MySQL**: Reliable, popular, good for structured data
4. **REST API**: Standard way everyone does it
5. **Encryption**: Keeps patient data safe
6. **Separation (Frontend/Backend)**: Each part can be updated independently

---

## 🚀 What You Can Learn From This

1. **Full-stack development**: Frontend + Backend + Database
2. **API design**: How to create a good API
3. **Database design**: How to structure data
4. **Security**: Encryption, validation, error handling
5. **Real-world application**: Hospitals actually need systems like this!

---

## 📖 Further Learning

Want to learn more? Check out:

1. **React**: https://react.dev/learn
2. **Node.js**: https://nodejs.org/en/learn
3. **Express**: https://expressjs.com/en/starter/basic-routing.html
4. **MySQL**: https://dev.mysql.com/doc/
5. **REST API**: https://restfulapi.net/

---

## 🎉 You Did It!

You now understand:
- How the frontend (React) works
- How the backend (Node.js + Express) works
- How the database (MySQL) stores data
- How they all talk to each other (API)
- How data stays secure (Encryption)

**This is a real, production-ready system that could actually be used in a hospital!**

---

*Created: November 15, 2025*  
*For: Your Friend Learning About the Project* 😊
