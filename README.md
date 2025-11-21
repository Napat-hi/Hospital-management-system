# Hospital Management System

> **Note**: This README was auto-generated.

> **⚠️ Prerequisites**: This project requires **Node.js** (v14.0.0 or higher) and **MySQL 8.0+**. After cloning, run `npm install` in both the root directory and the `backend` directory to install all dependencies.

A comprehensive hospital management system built with React and Node.js, featuring role-based access control, end-to-end encryption, and secure data management.

## 🏥 Overview

This Hospital Management System (HMS) provides a complete solution for managing hospital operations including patient records, appointments, billing, and staff management. The system implements enterprise-grade security with AES-256 encryption for sensitive data and SHA-256 hashing for passwords and identifiers.

## ✨ Key Features

### Security
- **AES-256 Encryption**: All sensitive data (patient PII, contact info, financial data, medical reasons) encrypted at rest
- **SHA-256 Password Hashing**: Secure password storage with unique salts per user
- **Hash-Based Indexing**: Fast lookups without decrypting data using SHA-256 hashes
- **Role-Based Access Control (RBAC)**: Three user roles with specific permissions

### User Roles & Capabilities

#### 👨‍⚕️ Doctor
- View patient information (read-only)
- View appointments
- Mark appointments as completed/uncompleted
- Access decrypted patient data through secure views

#### 👩‍💼 Staff
- Manage patient records (create, read, update)
- Manage appointments (full CRUD)
- Generate and manage bills
- Process payments
- View doctor and staff information (read-only)

#### 👨‍💼 Admin
- Manage doctor accounts (full CRUD)
- Manage staff accounts (full CRUD)
- Manage user credentials (full CRUD)
- Cannot access patient data directly

### Core Functionalities
- **Patient Management**: Comprehensive patient records with encrypted personal information
- **Appointment Scheduling**: Conflict detection and validation via stored procedures
- **Billing System**: Automated bill generation with itemized costs
- **Payment Processing**: Multiple payment methods (Cash, Card, Transfer)
- **Real-time Search**: Fast patient and appointment lookup using hash-based indexing

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI with hooks and functional components
- **React Router**: Client-side routing with protected routes
- **Bootstrap 5**: Responsive design and UI components
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: Runtime environment
- **Express.js**: RESTful API server
- **MySQL 8.0+**: Database with advanced encryption features
- **mysql2**: Database driver with connection pooling

### Security Implementation
- **Encryption**: AES-256-CBC via MySQL's `AES_ENCRYPT`/`AES_DECRYPT`
- **Hashing**: SHA-256 via MySQL's `SHA2` function
- **Database Views**: Decrypted views for authorized access
- **Triggers**: Automatic encryption on INSERT operations
- **Stored Procedures**: Business logic with validation and conflict detection

## 📋 Prerequisites

- **Node.js**: v14.0.0 or higher
- **MySQL**: 8.0 or higher
- **npm**: 6.0.0 or higher

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Napat-hi/Hospital-management-system.git
cd Hospital-management-system
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Run the database script
source database/database.sql
```

The database script will:
- Create the HMS database
- Create 8 tables (patient, doctor, staff, user, appointment, bill, payment, secret_config)
- Set up encryption keys
- Create 7 decrypted views
- Create 6 encryption triggers
- Create 2 stored procedures
- Create 3 database users with role-based privileges
- Set up foreign key relationships

### 5. Configure Environment Variables

Create a `.env` file in the `backend` directory:
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=HMS
```

### 6. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5001`

**Terminal 2 - Frontend Application:**
```bash
npm start
```
Frontend will run on `http://localhost:3000`

## 👤 Default User Credentials

### Database Users (for direct DB access)
```
Admin:  admin_user / AdminPassword123!
Doctor: doctor_user / DoctorPassword123!
Staff:  staff_user / StaffPassword123!
```

### Application Users (for web login)
Create users through the Admin panel or directly in the `user` table.

## 📁 Project Structure

```
Hospital-management-system/
├── backend/
│   ├── server.js              # Main Express server
│   ├── auth.js                # Authentication routes
│   ├── user.js                # User management routes
│   └── config/
│       ├── databaseadmin.js   # Admin DB connection
│       ├── databasedoctor.js  # Doctor DB connection
│       └── databasestaff.js   # Staff DB connection
├── database/
│   └── database.sql           # Complete DB schema & setup
├── src/
│   ├── pages/
│   │   ├── Home.js           # Login page
│   │   ├── Adminpage.js      # Admin dashboard
│   │   ├── Doctorpage.js     # Doctor dashboard
│   │   └── Staffpage.js      # Staff dashboard
│   ├── components/
│   │   ├── Header.js         # Navigation header
│   │   └── ProtectedRoute.js # Route protection
│   └── api/
│       ├── config.js         # API base URL
│       ├── fetch.js          # Axios instance
│       └── doctorAPI.js      # Doctor API calls
└── public/
```

## 🔐 Security Features

### Data Encryption
All sensitive fields are automatically encrypted before storage:
- **Patient**: First name, last name, DOB, sex, email, phone, address, emergency contact
- **Doctor/Staff**: Email, phone
- **Bill**: Consultation fee, medication cost, lab tests cost, total
- **Payment**: Amount
- **Appointment**: Reason
- **User**: Username (password is hashed, not encrypted)

### Hash-Based Indexing
Email and phone fields have corresponding hash columns:
- `email_hash`: SHA-256 hash for fast lookups and uniqueness constraints
- `phone_hash`: SHA-256 hash for indexed searches

### Privilege Matrix

| Entity      | Admin | Doctor | Staff |
|-------------|-------|--------|-------|
| Patient     | —     | R      | CRU   |
| Doctor      | CRUD  | —      | R     |
| Staff       | CRUD  | —      | R     |
| Appointment | —     | RU     | CRUD  |
| Bill        | —     | —      | CRUD  |
| Payment     | —     | —      | CRUD  |
| User        | CRUD  | —      | —     |

*Legend: C=Create, R=Read, U=Update, D=Delete*

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with username/password

### Admin Endpoints
- `GET /api/users` - Get all doctors and staff
- `POST /api/users` - Create new doctor or staff
- `PUT /api/users/:id` - Update doctor or staff
- `PATCH /api/users/:id/disable` - Delete doctor or staff

### Doctor Endpoints
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/appointments` - Get all appointments
- `PATCH /api/appointments/:id/complete` - Mark appointment complete
- `PATCH /api/appointments/:id/uncomplete` - Unmark appointment

### Staff Endpoints
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/search` - Search patients
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/doctors` - Get all doctors
- `POST /api/bills` - Generate bill
- `GET /api/bills` - Get all bills
- `GET /api/bills/:id` - Get bill by ID
- `PUT /api/bills/:id` - Update bill
- `DELETE /api/bills/:id` - Delete bill

## 🗃️ Database Schema

### Key Tables
- **patient**: Encrypted patient records
- **doctor**: Doctor information with encrypted contact details
- **staff**: Staff information with encrypted contact details
- **user**: User credentials with hashed passwords
- **appointment**: Appointment scheduling with encrypted reasons
- **bill**: Billing information with encrypted amounts
- **payment**: Payment records with encrypted amounts
- **secret_config**: Encryption key storage

### Stored Procedures
- `sp_book_appointment`: Create appointment with conflict detection
- `sp_update_appointment`: Update appointment with validation

### Triggers (BEFORE INSERT)
- `trg_patient_bi`: Encrypts patient data
- `trg_doctor_bi`: Encrypts doctor contact info
- `trg_staff_bi`: Encrypts staff contact info
- `trg_bill_bi`: Encrypts billing amounts
- `trg_payment_bi`: Encrypts payment amounts
- `trg_appointment_bi`: Encrypts appointment reason
- `trg_user_bi`: Hashes password with unique salt

## 📖 Documentation

For detailed technical documentation, see:
- [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) - Complete system architecture and database design
- [ADMIN_BACKEND_INTEGRATION.md](./ADMIN_BACKEND_INTEGRATION.md) - Admin features integration guide
- [DOCTOR_BACKEND_INTEGRATION.md](./DOCTOR_BACKEND_INTEGRATION.md) - Doctor features integration guide
- [STAFF_BACKEND_INTEGRATION.md](./STAFF_BACKEND_INTEGRATION.md) - Staff features integration guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of an academic/learning exercise.

## 👨‍💻 Author

**Napat-hi**
- GitHub: [@Napat-hi](https://github.com/Napat-hi)

## 🙏 Acknowledgments

- Built with Create React App
- Bootstrap for UI components
- MySQL for secure data storage with encryption
