# Hospital Management System - Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Design](#database-design)
3. [Security Implementation](#security-implementation)
4. [Database Objects](#database-objects)
5. [Backend API Architecture](#backend-api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Data Flow & Integration](#data-flow--integration)

---

## 1. System Architecture

### Technology Stack

**Frontend Layer:**
- React 18+ (JavaScript)
- React Router v6 (client-side routing)
- Bootstrap 5 (UI framework)
- Fetch API (HTTP client)

**Backend Layer:**
- Node.js (runtime environment)
- Express.js v5.1.0 (web framework)
- mysql2 (MySQL driver with promise support)
- CORS middleware (cross-origin resource sharing)

**Database Layer:**
- MySQL 8.0+ (relational database)
- InnoDB storage engine
- UTF-8MB4 character set (Unicode support)

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                    (localhost:3000)                         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │ Admin Page  │  │ Doctor Page │  │ Staff Page  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/JSON
                          │ (RESTful API)
┌─────────────────────────▼───────────────────────────────────┐
│                  Express.js Server                          │
│                   (localhost:5001)                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  API Endpoints (server.js)                           │ │
│  │  - Patient Management (CRUD)                         │ │
│  │  - Appointment Scheduling (CRUD)                     │ │
│  │  - Billing System (CRUD)                             │ │
│  │  - User Management (CRUD)                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Database Connections                                │ │
│  │  - dbAdmin  (admin_user@localhost)                   │ │
│  │  - dbDoctor (doctor_user@localhost)                  │ │
│  │  - dbStaff  (staff_user@localhost)                   │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │ MySQL Protocol
                          │ (Port 3306)
┌─────────────────────────▼───────────────────────────────────┐
│                    MySQL Database                           │
│                      (HMS Database)                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Tables (8)                                          │ │
│  │  - patient, doctor, staff, user                      │ │
│  │  - appointment, bill, payment                        │ │
│  │  - secret_config                                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Views (7 Decrypted Views)                           │ │
│  │  - v_patient_decrypted                               │ │
│  │  - v_doctor_decrypted, v_staff_decrypted             │ │
│  │  - v_appointment_decrypted                           │ │
│  │  - v_bill_decrypted, v_payment_decrypted             │ │
│  │  - v_user_decrypted                                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Triggers (6 BEFORE INSERT)                          │ │
│  │  - Auto-encryption on INSERT                         │ │
│  │  - Password hashing with salt                        │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Stored Procedures (2)                               │ │
│  │  - sp_book_appointment (with conflict detection)     │ │
│  │  - sp_update_appointment (with validation)           │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
Hospital-management-system/
├── backend/
│   ├── config/
│   │   ├── databaseadmin.js      # Admin connection pool
│   │   ├── databasedoctor.js     # Doctor connection pool
│   │   └── databasestaff.js      # Staff connection pool
│   ├── auth.js                   # Authentication router
│   ├── user.js                   # User router
│   └── server.js                 # Main Express server
│
├── database/
│   ├── database.sql              # Schema, triggers, procedures
│   └── synthetic data.sql        # Sample data for testing
│
├── src/
│   ├── api/
│   │   ├── config.js             # API base URL
│   │   ├── fetch.js              # Fetch wrapper
│   │   ├── adminapi.js           # Admin API methods
│   │   ├── doctorAPI.js          # Doctor API methods
│   │   └── staffAPI.js           # Staff API methods
│   ├── components/
│   │   └── Header.js             # Navigation header
│   ├── pages/
│   │   ├── Home.js               # Login page
│   │   ├── Adminpage.js          # Admin dashboard
│   │   ├── Doctorpage.js         # Doctor dashboard
│   │   └── Staffpage.js          # Staff dashboard
│   ├── App.js                    # Main router component
│   └── index.js                  # React entry point
│
└── package.json                  # Dependencies
```

---

## 2. Database Design

### Database Name: `HMS`

### Character Set Configuration
```sql
CREATE DATABASE HMS
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```
- **UTF-8MB4**: Supports full Unicode including emojis and special characters
- **InnoDB Engine**: ACID-compliant, supports foreign keys and transactions

---

### Table Schemas

#### 2.1 `patient` Table
Stores patient demographic and contact information with full encryption.

```sql
CREATE TABLE patient (
  patient_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name        VARBINARY(255),        -- Encrypted
  last_name         VARBINARY(255),        -- Encrypted
  dob               VARBINARY(64),         -- Encrypted (Date of Birth)
  sex               VARBINARY(64),         -- Encrypted
  email             VARBINARY(255),        -- Encrypted
  email_hash        CHAR(64),              -- SHA-256 hash for uniqueness
  phone             VARBINARY(64),         -- Encrypted
  phone_hash        CHAR(64),              -- SHA-256 hash for indexing
  address           VARBINARY(2048),       -- Encrypted
  emergency_contact VARBINARY(255),        -- Encrypted
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_patient_email_hash (email_hash),
  KEY ix_patient_phone_hash (phone_hash)
) ENGINE=InnoDB;
```

**Design Notes:**
- All PII (Personally Identifiable Information) encrypted
- Hashed email/phone for uniqueness checks without decryption
- Large VARBINARY sizes to accommodate encrypted data
- Emergency contact stored as free text (name + phone)

---

#### 2.2 `doctor` Table
Stores doctor information with partial encryption.

```sql
CREATE TABLE doctor (
  doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
  first_name     VARCHAR(80) NOT NULL,     -- Plain text
  last_name      VARCHAR(80) NOT NULL,     -- Plain text
  department     VARCHAR(120),              -- Plain text
  specialization VARCHAR(120),              -- Plain text
  email          VARBINARY(255),            -- Encrypted
  email_hash     CHAR(64),                  -- SHA-256 hash
  phone          VARBINARY(64),             -- Encrypted
  phone_hash     CHAR(64),                  -- SHA-256 hash
  user_id        INT,                       -- FK to user table
  hire_date      DATE,
  UNIQUE KEY uq_doctor_email_hash (email_hash),
  KEY ix_doctor_phone_hash (phone_hash)
) ENGINE=InnoDB;
```

**Design Notes:**
- Names NOT encrypted (used for display/searching)
- Contact information IS encrypted
- Links to `user` table for authentication
- Department/specialization for filtering

---

#### 2.3 `staff` Table
Stores staff information with same structure as doctor table.

```sql
CREATE TABLE staff (
  staff_id   INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name  VARCHAR(80) NOT NULL,
  position   VARCHAR(60),                   -- Job title
  department VARCHAR(60),
  email      VARBINARY(255),                -- Encrypted
  email_hash CHAR(64),
  phone      VARBINARY(64),                 -- Encrypted
  phone_hash CHAR(64),
  user_id    INT,                           -- FK to user table
  hire_date  DATE,
  UNIQUE KEY uq_staff_email_hash (email_hash),
  KEY ix_staff_phone_hash (phone_hash)
) ENGINE=InnoDB;
```

---

#### 2.4 `user` Table
Stores authentication credentials with encrypted username and hashed password.

```sql
CREATE TABLE user (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARBINARY(80),                 -- Encrypted
  password   CHAR(64) NOT NULL,             -- SHA-256 hash
  salt       CHAR(64) NOT NULL,             -- Random salt
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Design Notes:**
- Username encrypted for privacy
- Password NEVER stored in plain text
- Unique salt per user (64 hex characters = 256 bits)
- Password hash = SHA256(password + salt)

---

#### 2.5 `appointment` Table
Stores appointment scheduling with encrypted reason.

```sql
CREATE TABLE appointment (
  appointment_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id       BIGINT,                  -- FK to patient
  doctor_id        INT,                     -- FK to doctor
  appointment_date DATE,                    -- Plain text
  appointment_time TIMESTAMP,               -- Plain text
  reason           VARBINARY(255),          -- Encrypted
  status           ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW','RESCHEDULED') 
                   DEFAULT 'SCHEDULED',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Status Values:**
- `SCHEDULED`: Appointment booked
- `COMPLETED`: Patient visited doctor
- `CANCELLED`: Appointment cancelled
- `NO_SHOW`: Patient didn't show up
- `RESCHEDULED`: Moved to different time

---

#### 2.6 `bill` Table
Stores billing information with all amounts encrypted.

```sql
CREATE TABLE bill (
  bill_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT,                -- FK to patient
  consultation_fee  VARBINARY(64),         -- Encrypted decimal
  medication_cost   VARBINARY(64),         -- Encrypted decimal
  lab_tests_cost    VARBINARY(64),         -- Encrypted decimal
  status            ENUM('OPEN','CLOSED','PAID') DEFAULT 'OPEN',
  total             VARBINARY(64),         -- Encrypted decimal
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Design Notes:**
- All financial amounts encrypted
- Total is sum of three components
- Status tracks payment lifecycle

---

#### 2.7 `payment` Table
Stores payment transactions with encrypted amounts.

```sql
CREATE TABLE payment (
  payment_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
  bill_id     BIGINT,                      -- FK to bill
  amount      VARBINARY(64),               -- Encrypted decimal
  paid_at     DATETIME,
  method      ENUM('CASH','CARD','TRANSFER','OTHER') NOT NULL,
  received_by INT                          -- FK to staff
) ENGINE=InnoDB;
```

**Payment Methods:**
- `CASH`: Cash payment
- `CARD`: Credit/debit card
- `TRANSFER`: Bank transfer
- `OTHER`: Other payment methods

---

#### 2.8 `secret_config` Table
Stores AES encryption key (critical security component).

```sql
CREATE TABLE secret_config (
  id      TINYINT PRIMARY KEY,
  enc_key VARBINARY(32) NOT NULL          -- 256-bit key
);

INSERT INTO secret_config VALUES (1, LEFT(SHA2('xHMEeykkS!Y$dj1T7H6UeL*@qTBKFkS$', 256), 32));
```

**Security Notes:**
- Single row (id=1) contains encryption key
- Key is 32 bytes (256 bits) for AES-256
- Derived from SHA-256 hash of secret passphrase
- **CRITICAL**: Backup this table separately!

---

### Foreign Key Relationships

```sql
-- Bills → Patient
ALTER TABLE bill
  ADD CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id)
  REFERENCES patient(patient_id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- Payments → Bill (CASCADE delete with bill)
ALTER TABLE payment
  ADD CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id)
  REFERENCES bill(bill_id)
  ON UPDATE CASCADE ON DELETE CASCADE;

-- Payments → Staff (received by)
ALTER TABLE payment
  ADD CONSTRAINT fk_payment_staff FOREIGN KEY (received_by)
  REFERENCES staff(staff_id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- Appointments → Patient (CASCADE delete with patient)
ALTER TABLE appointment
  ADD CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id)
  REFERENCES patient(patient_id)
  ON UPDATE CASCADE ON DELETE CASCADE;

-- Appointments → Doctor (SET NULL if doctor deleted)
ALTER TABLE appointment
  ADD CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id)
  REFERENCES doctor(doctor_id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- Doctor → User (CASCADE delete account)
ALTER TABLE doctor
  ADD CONSTRAINT fk_doctor_user FOREIGN KEY (user_id)
  REFERENCES user(user_id)
  ON UPDATE RESTRICT ON DELETE CASCADE;

-- Staff → User (CASCADE delete account)
ALTER TABLE staff
  ADD CONSTRAINT fk_staff_user FOREIGN KEY (user_id)
  REFERENCES user(user_id)
  ON UPDATE RESTRICT ON DELETE CASCADE;
```

**Cascading Rules:**
- Delete patient → Delete appointments and bills
- Delete bill → Delete associated payments
- Delete user → Delete doctor/staff record
- Delete doctor → Appointments keep reference (SET NULL)

---

### Entity-Relationship Diagram

```
┌──────────┐       ┌─────────────┐       ┌────────┐
│   user   │──1:1──│   doctor    │──1:N──│  appt  │
└──────────┘       └─────────────┘       └────────┘
                                               │
┌──────────┐       ┌─────────────┐            │
│   user   │──1:1──│   staff     │            │
└──────────┘       └─────────────┘       ┌────▼───┐
                         │                │ patient│
                         │ (received_by)  └────┬───┘
                         │                     │
                   ┌─────▼──┐            ┌────▼───┐
                   │ payment│───N:1──────│  bill  │
                   └────────┘            └────────┘
```

---

## 3. Security Implementation

### Encryption Strategy

#### AES-256 Encryption

**Algorithm**: Advanced Encryption Standard with 256-bit key  
**Mode**: ECB (Electronic Codebook)  
**Key Management**: Single key stored in `secret_config` table

**Encrypted Fields:**
| Table | Encrypted Fields |
|-------|-----------------|
| patient | first_name, last_name, dob, sex, email, phone, address, emergency_contact |
| doctor | email, phone |
| staff | email, phone |
| user | username |
| appointment | reason |
| bill | consultation_fee, medication_cost, lab_tests_cost, total |
| payment | amount |

**Encryption Function:**
```sql
CREATE FUNCTION get_enc_key()
RETURNS VARBINARY(32)
DETERMINISTIC
BEGIN
  DECLARE k VARBINARY(32);
  SELECT enc_key INTO k FROM secret_config WHERE id = 1;
  RETURN k;
END
```

**Usage Examples:**
```sql
-- Encrypt
INSERT INTO patient (first_name, last_name)
VALUES (
  AES_ENCRYPT('John', get_enc_key()),
  AES_ENCRYPT('Doe', get_enc_key())
);

-- Decrypt
SELECT 
  CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) AS first_name
FROM patient;
```

---

#### Password Hashing with Salt

**Algorithm**: SHA-256 (256-bit hash)  
**Salt Generation**: UUID + RAND() + NOW(6) → SHA-256  
**Password Storage**: SHA-256(password + salt)

**Process:**

1. **Generate unique salt** (64 hex characters):
```sql
SET random_salt = SHA2(CONCAT(UUID(), RAND(), NOW(6)), 256);
```

2. **Hash password with salt**:
```sql
SET password_hash = SHA2(CONCAT(password, random_salt), 256);
```

3. **Store both**:
```sql
INSERT INTO user (username, password, salt)
VALUES (username, password_hash, random_salt);
```

4. **Verification** (backend):
```javascript
// Retrieve user with salt
const user = await db.query('SELECT password, salt FROM user WHERE ...');

// Hash submitted password with stored salt
const hashedInput = crypto.createHash('sha256')
  .update(submittedPassword + user.salt)
  .digest('hex');

// Compare
if (hashedInput === user.password) {
  // Login successful
}
```

**Why Salting?**
- Prevents rainbow table attacks
- Same password → Different hash for each user
- Unique 256-bit salt per user
- Even if database is breached, passwords remain secure

---

#### Hash-Based Indexing

**Problem**: Cannot create unique index on encrypted email (VARBINARY)  
**Solution**: Store SHA-256 hash of email alongside encrypted version

```sql
-- Store both encrypted value and hash
SET NEW.email = AES_ENCRYPT(email_value, get_enc_key());
SET NEW.email_hash = SHA2(LOWER(email_value), 256);

-- Create unique index on hash
UNIQUE KEY uq_patient_email_hash (email_hash)
```

**Benefits:**
- Fast uniqueness checks without decryption
- Indexed searches by hash
- Original value remains encrypted

---

### Role-Based Access Control (RBAC)

#### Database Users

Three separate MySQL user accounts with different privileges:

```sql
CREATE USER 'admin_user'@'%' IDENTIFIED BY 'AdminPassword123!';
CREATE USER 'doctor_user'@'%' IDENTIFIED BY 'DoctorPassword123!';
CREATE USER 'staff_user'@'%' IDENTIFIED BY 'StaffPassword123!';
```

#### Privilege Matrix

| Entity | Admin | Doctor | Staff |
|--------|-------|--------|-------|
| Admin | — | — | — |
| Doctor | R | CRUD | — |
| Staff | CRU | — | — |
| User | CRUD | — | — |
| Patient | — | R | CRUD |
| Appointment | — | RU | CRUD |
| Bill | — | — | CRUD |
| Payment | — | — | CRUD |

**Legend:**
- **R**: Read (SELECT)
- **C**: Create (INSERT)
- **U**: Update (UPDATE)
- **D**: Delete (DELETE)
- **—**: No access

---

#### Grant Statements

**Admin User:**
```sql
-- Doctor: Read-only
GRANT SELECT ON HMS.v_doctor_decrypted TO 'admin_user'@'%';

-- Staff: Create, Read, Update
GRANT SELECT, INSERT, UPDATE ON HMS.v_staff_decrypted TO 'admin_user'@'%';

-- User: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_user_decrypted TO 'admin_user'@'%';
```

**Doctor User:**
```sql
-- Doctor: Full CRUD (own profile)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_doctor_decrypted TO 'doctor_user'@'%';

-- Patient: Read-only
GRANT SELECT ON HMS.v_patient_decrypted TO 'doctor_user'@'%';

-- Appointment: Read and Update (mark complete)
GRANT SELECT, UPDATE ON HMS.v_appointment_decrypted TO 'doctor_user'@'%';
```

**Staff User:**
```sql
-- Patient: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_patient_decrypted TO 'staff_user'@'%';

-- Appointment: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_appointment_decrypted TO 'staff_user'@'%';

-- Bill: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_bill_decrypted TO 'staff_user'@'%';

-- Payment: Full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_payment_decrypted TO 'staff_user'@'%';
```

---

## 4. Database Objects

### Decrypted Views

Views provide automatic decryption of encrypted fields without exposing raw VARBINARY data.

#### 4.1 `v_patient_decrypted`
```sql
CREATE OR REPLACE VIEW v_patient_decrypted AS
SELECT
  patient_id,
  CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR(80)) AS first_name,
  CAST(AES_DECRYPT(last_name, get_enc_key()) AS CHAR(80))  AS last_name,
  CAST(AES_DECRYPT(dob, get_enc_key()) AS CHAR(20))        AS dob,
  CAST(AES_DECRYPT(sex, get_enc_key()) AS CHAR(5))         AS sex,
  CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR(255))     AS email,
  CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR(64))      AS phone,
  CAST(AES_DECRYPT(address, get_enc_key()) AS CHAR(2048))  AS address,
  CAST(AES_DECRYPT(emergency_contact, get_enc_key()) AS CHAR(255)) AS emergency_contact,
  created_at
FROM patient;
```

**Usage:**
```sql
-- Instead of complex decryption in queries:
SELECT CAST(AES_DECRYPT(first_name, get_enc_key()) AS CHAR) FROM patient;

-- Use view:
SELECT first_name FROM v_patient_decrypted;
```

---

#### 4.2 `v_bill_decrypted`
```sql
CREATE OR REPLACE VIEW v_bill_decrypted AS
SELECT
  bill_id,
  patient_id,
  CAST(AES_DECRYPT(consultation_fee, get_enc_key()) AS DECIMAL(12,2)) AS consultation_fee,
  CAST(AES_DECRYPT(medication_cost, get_enc_key()) AS DECIMAL(12,2)) AS medication_cost,
  CAST(AES_DECRYPT(lab_tests_cost, get_enc_key()) AS DECIMAL(12,2)) AS lab_tests_cost,
  status,
  CAST(AES_DECRYPT(total, get_enc_key()) AS DECIMAL(12,2)) AS total,
  created_at
FROM bill;
```

**Note**: Financial amounts cast to DECIMAL for proper numeric handling.

---

#### Other Views

- **v_doctor_decrypted**: Decrypts email and phone
- **v_staff_decrypted**: Decrypts email and phone
- **v_user_decrypted**: Decrypts username
- **v_appointment_decrypted**: Decrypts reason
- **v_payment_decrypted**: Decrypts amount

---

### Triggers

Triggers automatically encrypt data BEFORE insertion, ensuring no plain text is ever stored.

#### 4.3 `trg_patient_bi` (Patient - BEFORE INSERT)

```sql
DROP TRIGGER IF EXISTS trg_patient_bi;
DELIMITER $$
CREATE TRIGGER trg_patient_bi
BEFORE INSERT ON patient
FOR EACH ROW
BEGIN
  -- Encrypt all PII fields
  SET NEW.first_name = AES_ENCRYPT(NEW.first_name, get_enc_key());
  SET NEW.last_name  = AES_ENCRYPT(NEW.last_name,  get_enc_key());
  SET NEW.dob        = AES_ENCRYPT(NEW.dob,        get_enc_key());
  SET NEW.sex        = AES_ENCRYPT(NEW.sex,        get_enc_key());
  SET NEW.address    = AES_ENCRYPT(NEW.address,    get_enc_key());
  SET NEW.emergency_contact = AES_ENCRYPT(NEW.emergency_contact, get_enc_key());

  -- Hash and encrypt email
  IF NEW.email IS NOT NULL THEN
    SET NEW.email_hash = SHA2(LOWER(CAST(NEW.email AS CHAR)), 256);
    SET NEW.email = AES_ENCRYPT(NEW.email, get_enc_key());
  END IF;

  -- Hash and encrypt phone
  IF NEW.phone IS NOT NULL THEN
    SET NEW.phone_hash = SHA2(CAST(NEW.phone AS CHAR), 256);
    SET NEW.phone = AES_ENCRYPT(NEW.phone, get_enc_key());
  END IF;
END$$
DELIMITER ;
```

**Purpose:**
- Application inserts plain text
- Trigger automatically encrypts before storage
- Generates hashes for uniqueness/indexing
- Developers don't need to handle encryption in code

---

#### 4.4 `trg_user_bi` (User - BEFORE INSERT)

```sql
DROP TRIGGER IF EXISTS trg_user_bi;
DELIMITER $$
CREATE TRIGGER trg_user_bi
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
  DECLARE random_salt CHAR(64);
  
  -- Generate random salt: UUID + RAND() + NOW(6) → SHA-256
  SET random_salt = SHA2(CONCAT(UUID(), RAND(), NOW(6)), 256);
  
  -- Encrypt username
  SET NEW.username = AES_ENCRYPT(NEW.username, get_enc_key());
  
  -- Store salt
  SET NEW.salt = random_salt;
  
  -- Hash password with salt: SHA-256(password + salt)
  SET NEW.password = SHA2(CONCAT(NEW.password, random_salt), 256);
END$$
DELIMITER ;
```

**Process:**
1. Application inserts plain text password
2. Trigger generates unique 256-bit salt
3. Trigger hashes password with salt
4. Stores hash and salt (NOT plain text)
5. Username also encrypted

---

#### Other Triggers

- **trg_doctor_bi**: Encrypts doctor email/phone, generates hashes
- **trg_staff_bi**: Encrypts staff email/phone, generates hashes
- **trg_bill_bi**: Encrypts all financial amounts
- **trg_payment_bi**: Encrypts payment amount
- **trg_appointment_bi**: Encrypts appointment reason

**All triggers follow BEFORE INSERT pattern for automatic encryption.**

---

### Stored Procedures

#### 4.5 `sp_book_appointment` - Create Appointment with Validation

```sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_book_appointment;
CREATE PROCEDURE sp_book_appointment (
  IN  p_patient_id BIGINT,
  IN  p_doctor_id  INT,
  IN  p_date       DATE,
  IN  p_time       TIME,
  IN  p_reason     VARCHAR(255),
  OUT p_appointment_id BIGINT
)
BEGIN
  DECLARE v_conflict INT DEFAULT 0;

  -- Check for scheduling conflict
  SELECT COUNT(*) INTO v_conflict
  FROM appointment
  WHERE doctor_id = p_doctor_id
    AND appointment_date = p_date
    AND TIME(appointment_time) = p_time
    AND status IN ('SCHEDULED','RESCHEDULED');

  -- If conflict exists, raise error
  IF v_conflict > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Doctor already booked';
  END IF;

  -- Insert appointment (reason auto-encrypted by trigger)
  INSERT INTO appointment (
    patient_id, doctor_id, appointment_date, appointment_time, reason, status, created_at
  ) VALUES (
    p_patient_id, p_doctor_id, p_date, TIMESTAMP(p_date, p_time),
    AES_ENCRYPT(p_reason, get_enc_key()), 'SCHEDULED', NOW()
  );

  -- Return new appointment ID
  SET p_appointment_id = LAST_INSERT_ID();
END$$
DELIMITER ;
```

**Features:**
- **Conflict Detection**: Prevents double-booking same doctor at same time
- **Error Handling**: Raises SQL error if conflict found
- **Automatic Encryption**: Reason field encrypted inline
- **Return Value**: Returns new appointment_id via OUT parameter

**Usage Example:**
```sql
CALL sp_book_appointment(
  5,                           -- patient_id
  2,                           -- doctor_id
  '2025-12-15',               -- date
  '14:30:00',                 -- time
  'Annual health checkup',    -- reason
  @new_id                     -- OUT: returns appointment_id
);

SELECT @new_id;  -- Get the generated ID
```

---

#### 4.6 `sp_update_appointment` - Update Appointment with Validation

```sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_update_appointment;
CREATE PROCEDURE sp_update_appointment (
  IN p_appointment_id BIGINT,
  IN p_patient_id     BIGINT,
  IN p_doctor_id      INT,
  IN p_date           DATE,
  IN p_time           TIME,
  IN p_reason         VARCHAR(255)
)
BEGIN
  DECLARE v_conflict INT DEFAULT 0;

  -- Check for scheduling conflict (exclude current appointment)
  SELECT COUNT(*) INTO v_conflict
  FROM appointment
  WHERE doctor_id = p_doctor_id
    AND appointment_date = p_date
    AND TIME(appointment_time) = p_time
    AND status IN ('SCHEDULED','RESCHEDULED')
    AND appointment_id != p_appointment_id;  -- Exclude self

  -- If conflict exists, raise error
  IF v_conflict > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Doctor already booked at this time';
  END IF;

  -- Update appointment
  UPDATE appointment
  SET patient_id = p_patient_id,
      doctor_id = p_doctor_id,
      appointment_date = p_date,
      appointment_time = TIMESTAMP(p_date, p_time),
      reason = AES_ENCRYPT(p_reason, get_enc_key())
  WHERE appointment_id = p_appointment_id;
END$$
DELIMITER ;
```

**Features:**
- **Conflict Detection**: Prevents rescheduling to occupied slot
- **Self-Exclusion**: Excludes current appointment from conflict check
- **Reason Re-encryption**: Updates encrypted reason field
- **Error Handling**: Raises error if conflict found

**Usage Example:**
```sql
CALL sp_update_appointment(
  10,                          -- appointment_id to update
  5,                           -- new patient_id
  2,                           -- new doctor_id
  '2025-12-20',               -- new date
  '15:00:00',                 -- new time
  'Follow-up consultation'    -- new reason
);
```

---

## 5. Backend API Architecture

### Server Configuration

**File**: `backend/server.js`

```javascript
const express = require("express");
const cors = require("cors");
const dbAdmin = require('./config/databaseadmin');
const dbDoctor = require('./config/databasedoctor');
const dbStaff = require("./config/databasestaff");
const authRouter = require("./auth");
const userRouter = require("./user");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

---

### Database Connection Pools

Each role has separate connection pool with different credentials.

**File**: `backend/config/databaseadmin.js`

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_ADMIN_USER || 'admin_user',
  password: process.env.DB_ADMIN_PASSWORD || 'AdminPassword123!',
  database: process.env.DB_NAME || 'HMS',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
```

**Similar files:**
- `databasedoctor.js` - Uses `doctor_user` credentials
- `databasestaff.js` - Uses `staff_user` credentials

**Why Separate Pools?**
- Database-enforced permissions
- Cannot bypass via application
- Each role has limited access
- Prevents privilege escalation

---

### API Endpoint Structure

#### Patient Endpoints (Staff Access)

```javascript
// GET /api/patients - Fetch all patients
app.get('/api/patients', async (req, res) => {
  try {
    const [rows] = await dbStaff.query('SELECT * FROM v_patient_decrypted');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/patients - Create patient
app.post('/api/patients', async (req, res) => {
  try {
    const { first_name, last_name, dob, sex, phone, email, address, emergency_contact } = req.body;
    
    // Insert plain text - trigger will encrypt
    const [result] = await dbStaff.query(`
      INSERT INTO patient (first_name, last_name, dob, sex, phone, email, address, emergency_contact)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [first_name, last_name, dob, sex, phone, email, address, emergency_contact]);
    
    res.json({ success: true, patient_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// PUT /api/patients/:id - Update patient
app.put('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, dob, sex, phone, email, address, emergency_contact } = req.body;
    
    // Update - trigger will re-encrypt
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
    `, [first_name, last_name, dob, sex, phone, email, address, emergency_contact, id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id - Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbStaff.query('DELETE FROM patient WHERE patient_id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});
```

---

#### Appointment Endpoints (Staff Access)

```javascript
// POST /api/appointments - Create appointment using stored procedure
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    // Call stored procedure with conflict detection
    const [result] = await dbStaff.query(`
      CALL sp_book_appointment(?, ?, ?, ?, ?, @appointment_id)
    `, [patient_id, doctor_id, appointment_date, appointment_time, reason]);
    
    // Get the OUT parameter
    const [[{ '@appointment_id': appointmentId }]] = await dbStaff.query('SELECT @appointment_id');
    
    res.json({ success: true, appointment_id: appointmentId });
  } catch (error) {
    if (error.sqlMessage?.includes('already booked')) {
      res.status(409).json({ error: 'Doctor is already booked at this time' });
    } else {
      res.status(500).json({ error: 'Failed to create appointment' });
    }
  }
});

// PUT /api/appointments/:id - Update appointment using stored procedure
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;
    
    // Call stored procedure with validation
    await dbStaff.query(`
      CALL sp_update_appointment(?, ?, ?, ?, ?, ?)
    `, [id, patient_id, doctor_id, appointment_date, appointment_time, reason]);
    
    res.json({ success: true });
  } catch (error) {
    if (error.sqlMessage?.includes('already booked')) {
      res.status(409).json({ error: 'Doctor is already booked at this time' });
    } else {
      res.status(500).json({ error: 'Failed to update appointment' });
    }
  }
});

// PATCH /api/appointments/:id/complete - Mark as completed (Doctor access)
app.patch('/api/appointments/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    await dbDoctor.query(`
      UPDATE appointment SET status = 'COMPLETED' WHERE appointment_id = ?
    `, [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete appointment' });
  }
});
```

---

## 6. Frontend Architecture

### React Component Structure

```
App (Router)
├── Home (Login Page)
├── Adminpage
│   ├── Create User Form
│   └── Users Table
├── Doctorpage
│   ├── Patients List
│   └── Appointments List
└── Staffpage
    ├── Patient Management
    │   ├── Patient List
    │   ├── Create Patient Form
    │   └── Edit Patient Form
    ├── Appointment Management
    │   ├── Appointments List
    │   ├── Create Appointment Form
    │   └── Edit Appointment Form
    └── Billing System
        ├── Bills List
        └── Generate Bill Form
```

---

### API Integration Layer

**File**: `src/api/staffAPI.js`

```javascript
const API_BASE_URL = 'http://localhost:5001/api';

// Helper function with error handling
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`API Call: ${method} ${url}`, data || '');
  
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) options.body = JSON.stringify(data);
  
  const response = await fetch(url, options);
  console.log(`Response Status: ${response.status}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API error: ${response.status}`);
  }
  
  return response.json();
};

// Patient API methods
export const getPatients = () => apiCall('/patients');
export const getPatient = (id) => apiCall(`/patients/${id}`);
export const createPatient = (data) => apiCall('/patients', 'POST', data);
export const updatePatient = (id, data) => apiCall(`/patients/${id}`, 'PUT', data);
export const deletePatient = (id) => apiCall(`/patients/${id}`, 'DELETE');

// Appointment API methods
export const getAppointments = () => apiCall('/appointments');
export const createAppointment = (data) => {
  // Convert camelCase to snake_case for backend
  const backendData = {
    patient_id: data.patientId,
    doctor_id: data.doctorId,
    appointment_date: data.appointmentDate,
    appointment_time: data.appointmentTime,
    reason: data.reason
  };
  return apiCall('/appointments', 'POST', backendData);
};
export const updateAppointment = (id, data) => {
  const backendData = {
    patient_id: data.patientId,
    doctor_id: data.doctorId,
    appointment_date: data.appointmentDate,
    appointment_time: data.appointmentTime,
    reason: data.reason
  };
  return apiCall(`/appointments/${id}`, 'PUT', backendData);
};
export const deleteAppointment = (id) => apiCall(`/appointments/${id}`, 'DELETE');

// Bill API methods
export const getBills = () => apiCall('/bills');
export const createBill = (data) => apiCall('/bills', 'POST', data);
export const deleteBill = (id) => apiCall(`/bills/${id}`, 'DELETE');
```

**Key Features:**
- Centralized API calls
- Automatic error handling
- Console logging for debugging
- Field name conversion (camelCase ↔ snake_case)
- Type-safe function exports

---

### State Management Example

**File**: `src/pages/Staffpage.js`

```javascript
const [patients, setPatients] = useState([]);
const [appointments, setAppointments] = useState([]);
const [bills, setBills] = useState([]);
const [doctors, setDoctors] = useState([]);

// Load data on mount
useEffect(() => {
  const fetchData = async () => {
    try {
      const [patientsData, appointmentsData, billsData, doctorsData] = await Promise.all([
        staffAPI.getPatients(),
        staffAPI.getAppointments(),
        staffAPI.getBills(),
        staffAPI.getDoctors()
      ]);
      
      setPatients(patientsData);
      setAppointments(appointmentsData);
      setBills(billsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    }
  };
  
  fetchData();
}, []);

// Create patient
const handleCreatePatient = async (formData) => {
  try {
    await staffAPI.createPatient(formData);
    alert('Patient created successfully');
    
    // Reload patients
    const patientsData = await staffAPI.getPatients();
    setPatients(patientsData);
  } catch (error) {
    alert('Error creating patient: ' + error.message);
  }
};
```

---

## 7. Data Flow & Integration

### Complete Data Flow: Creating a Patient

```
1. User Action (Frontend)
   ↓
   User fills out form:
   - First Name: "John"
   - Last Name: "Doe"
   - DOB: "1990-05-15"
   - Sex: "Male"
   - Phone: "0812345678"
   - Email: "john.doe@email.com"
   
2. Form Validation (Frontend)
   ↓
   - Check all required fields
   - Validate email format
   - Validate phone format
   - Show errors if invalid
   
3. API Call (Frontend)
   ↓
   staffAPI.createPatient(formData)
   → POST http://localhost:5001/api/patients
   → Body: { first_name: "John", last_name: "Doe", ... }
   
4. Express Endpoint (Backend)
   ↓
   app.post('/api/patients', async (req, res) => {
     const { first_name, last_name, dob, sex, phone, email, ... } = req.body;
     
     const [result] = await dbStaff.query(`
       INSERT INTO patient (first_name, last_name, dob, sex, phone, email, ...)
       VALUES (?, ?, ?, ?, ?, ?, ...)
     `, [first_name, last_name, dob, sex, phone, email, ...]);
   })
   
5. Database Trigger (MySQL)
   ↓
   trg_patient_bi executes BEFORE INSERT:
   - Encrypt first_name: AES_ENCRYPT("John", key)
   - Encrypt last_name: AES_ENCRYPT("Doe", key)
   - Encrypt dob: AES_ENCRYPT("1990-05-15", key)
   - Hash email: SHA2("john.doe@email.com", 256)
   - Encrypt email: AES_ENCRYPT("john.doe@email.com", key)
   - Hash phone: SHA2("0812345678", 256)
   - Encrypt phone: AES_ENCRYPT("0812345678", key)
   
6. Database Storage (MySQL)
   ↓
   patient table stores:
   - patient_id: 11 (auto-increment)
   - first_name: 0x8A7B3F... (binary encrypted)
   - last_name: 0x3D9E2C... (binary encrypted)
   - email_hash: "7f8e9d..." (64-char hash)
   - email: 0x4B7A1E... (binary encrypted)
   - phone_hash: "2c3d4e..." (64-char hash)
   - phone: 0x9E2F3A... (binary encrypted)
   
7. Response (Backend → Frontend)
   ↓
   res.json({ success: true, patient_id: 11 })
   
8. UI Update (Frontend)
   ↓
   - Show success alert
   - Reload patient list
   - Reset form
   - Close modal
```

---

### Authentication Flow

```
1. User Login (Frontend)
   ↓
   POST /api/auth/login
   Body: { username: "john", password: "john.smi" }
   
2. Authentication (Backend)
   ↓
   - Query: SELECT password, salt FROM user WHERE username = AES_ENCRYPT(?, key)
   - Retrieve user record with salt
   - Hash submitted password: SHA256("john.smi" + salt)
   - Compare: hashedInput === storedPasswordHash
   
3. Role Determination (Backend)
   ↓
   - Check doctor table: SELECT * FROM doctor WHERE user_id = ?
   - Check staff table: SELECT * FROM staff WHERE user_id = ?
   - If found in doctor → role = "doctor"
   - If found in staff → role = "staff"
   - If username = "admin" → role = "admin"
   
4. JWT Token Generation (Backend)
   ↓
   const token = jwt.sign(
     { user_id, username, role },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );
   
5. Response (Backend → Frontend)
   ↓
   {
     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     username: "john",
     role: "doctor",
     firstName: "John",
     lastName: "Smith"
   }
   
6. Session Storage (Frontend)
   ↓
   localStorage.setItem('token', token);
   localStorage.setItem('username', username);
   localStorage.setItem('role', role);
   localStorage.setItem('firstName', firstName);
   localStorage.setItem('lastName', lastName);
   
7. Redirect (Frontend)
   ↓
   if (role === 'admin') navigate('/admin');
   if (role === 'doctor') navigate('/doctor');
   if (role === 'staff') navigate('/staff');
```

---

### Security Best Practices

**✅ Implemented:**
1. AES-256 encryption for sensitive data
2. Password hashing with unique salts
3. Parameterized queries (SQL injection prevention)
4. Role-based access control (database-level)
5. Separate database users per role
6. Views for decryption (controlled access)
7. Triggers for automatic encryption
8. Foreign key constraints (data integrity)

**🔒 Production Recommendations:**
1. HTTPS/TLS for all connections
2. JWT token refresh mechanism
3. Rate limiting on login endpoint
4. Account lockout after failed attempts
5. Audit logging for sensitive operations
6. Regular security updates
7. Encrypted backups
8. Key rotation strategy
9. Input sanitization
10. CORS configuration for production domain

---

**Last Updated**: November 20, 2025  
**Version**: 1.0  
**Database Version**: MySQL 8.0+  
**Node.js Version**: 16+  
**React Version**: 18+
