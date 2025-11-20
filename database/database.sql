/* =========================================================
   Hospital Management DB (MySQL 8.0+)
   - AES-256 Encryption (AES_ENCRYPT / AES_DECRYPT)
   - SHA-256 Hashing for passwords and identifiers
   ========================================================= */

DROP DATABASE IF EXISTS HMS;
CREATE DATABASE HMS
  DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;
USE HMS;

SET SQL_MODE = 'STRICT_ALL_TABLES,NO_ENGINE_SUBSTITUTION';

/* =========================================================
   TABLES
   ========================================================= */

CREATE TABLE patient (
  patient_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  first_name        VARBINARY(255),
  last_name         VARBINARY(255),
  dob               VARBINARY(64),
  sex               VARBINARY(64),
  email             VARBINARY(255),
  email_hash        CHAR(64),
  phone             VARBINARY(64),
  phone_hash        CHAR(64),
  address           VARBINARY(2048),
  emergency_contact VARBINARY(255),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_patient_email_hash (email_hash),
  KEY ix_patient_phone_hash (phone_hash)
) ENGINE=InnoDB;

CREATE TABLE doctor (
  doctor_id      INT AUTO_INCREMENT PRIMARY KEY,
  first_name     VARCHAR(80) NOT NULL,
  last_name      VARCHAR(80) NOT NULL,
  department     VARCHAR(120),
  specialization VARCHAR(120),
  email          VARBINARY(255),
  email_hash     CHAR(64),
  phone          VARBINARY(64),
  phone_hash     CHAR(64),
  user_id        INT,
  hire_date      DATE,
  UNIQUE KEY uq_doctor_email_hash (email_hash),
  KEY ix_doctor_phone_hash (phone_hash)
) ENGINE=InnoDB;

CREATE TABLE staff (
  staff_id   INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name  VARCHAR(80) NOT NULL,
  position   VARCHAR(60),
  department VARCHAR(60),
  email      VARBINARY(255),
  email_hash CHAR(64),
  phone      VARBINARY(64),
  phone_hash CHAR(64),
  user_id    INT,
  hire_date  DATE,
  UNIQUE KEY uq_staff_email_hash (email_hash),
  KEY ix_staff_phone_hash (phone_hash)
) ENGINE=InnoDB;

CREATE TABLE bill (
  bill_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id        BIGINT,
  consultation_fee  VARBINARY(64),
  medication_cost   VARBINARY(64),
  lab_tests_cost    VARBINARY(64),
  status            ENUM('OPEN','CLOSED','PAID') DEFAULT 'OPEN',
  total             VARBINARY(64),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE payment (
  payment_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
  bill_id     BIGINT,
  amount      VARBINARY(64),
  paid_at     DATETIME,
  method      ENUM('CASH','CARD','TRANSFER','OTHER') NOT NULL,
  received_by INT
) ENGINE=InnoDB;

CREATE TABLE appointment (
  appointment_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  patient_id       BIGINT,
  doctor_id        INT,
  appointment_date DATE,
  appointment_time TIMESTAMP,
  reason           VARBINARY(255),
  status           ENUM('SCHEDULED','COMPLETED','CANCELLED','NO_SHOW','RESCHEDULED') DEFAULT 'SCHEDULED',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  username   VARBINARY(80),
  password   CHAR(64) NOT NULL,
  salt       CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* =========================================================
   FOREIGN KEYS
   ========================================================= */
ALTER TABLE bill
  ADD CONSTRAINT fk_bill_patient FOREIGN KEY (patient_id)
  REFERENCES patient(patient_id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE payment
  ADD CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id)
  REFERENCES bill(bill_id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE payment
  ADD CONSTRAINT fk_payment_staff FOREIGN KEY (received_by)
  REFERENCES staff(staff_id)
  ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE appointment
  ADD CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id)
  REFERENCES patient(patient_id)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE appointment
  ADD CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id)
  REFERENCES doctor(doctor_id)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- Doctor ↔ user_account
ALTER TABLE doctor
  ADD CONSTRAINT fk_doctor_user
    FOREIGN KEY (user_id)
    REFERENCES user(user_id)
    ON UPDATE RESTRICT
    ON DELETE CASCADE;

-- Staff ↔ user_account
ALTER TABLE staff
  ADD CONSTRAINT fk_staff_user
    FOREIGN KEY (user_id)
    REFERENCES user(user_id)
    ON UPDATE RESTRICT
    ON DELETE CASCADE;


/* =========================================================
   ENCRYPTION KEY MANAGEMENT
   ========================================================= */
DROP TABLE IF EXISTS secret_config;
CREATE TABLE secret_config (
  id TINYINT PRIMARY KEY,
  enc_key VARBINARY(32) NOT NULL
);
INSERT INTO secret_config VALUES (1, LEFT(SHA2('xHMEeykkS!Y$dj1T7H6UeL*@qTBKFkS$', 256),32));

DELIMITER $$
CREATE FUNCTION get_enc_key()
RETURNS VARBINARY(32)
DETERMINISTIC
BEGIN
  DECLARE k VARBINARY(32);
  SELECT enc_key INTO k FROM secret_config WHERE id = 1;
  RETURN k;
END$$
DELIMITER ;

/* =========================================================
   TRIGGERS (ENCRYPTION + HASHING)
   ========================================================= */
DELIMITER $$

-- PATIENT
DROP TRIGGER IF EXISTS trg_patient_bi $$
CREATE TRIGGER trg_patient_bi
BEFORE INSERT ON patient
FOR EACH ROW
BEGIN
  SET NEW.first_name = AES_ENCRYPT(NEW.first_name, get_enc_key());
  SET NEW.last_name  = AES_ENCRYPT(NEW.last_name,  get_enc_key());
  SET NEW.dob        = AES_ENCRYPT(NEW.dob,        get_enc_key());
  SET NEW.sex        = AES_ENCRYPT(NEW.sex,        get_enc_key());
  SET NEW.address    = AES_ENCRYPT(NEW.address,    get_enc_key());
  SET NEW.emergency_contact = AES_ENCRYPT(NEW.emergency_contact, get_enc_key());

  IF NEW.email IS NOT NULL THEN
    SET NEW.email_hash = SHA2(LOWER(CAST(NEW.email AS CHAR)),256);
    SET NEW.email = AES_ENCRYPT(NEW.email, get_enc_key());
  END IF;

  IF NEW.phone IS NOT NULL THEN
    SET NEW.phone_hash = SHA2(CAST(NEW.phone AS CHAR),256);
    SET NEW.phone = AES_ENCRYPT(NEW.phone, get_enc_key());
  END IF;
END$$

-- DOCTOR
DROP TRIGGER IF EXISTS trg_doctor_bi $$
CREATE TRIGGER trg_doctor_bi
BEFORE INSERT ON doctor
FOR EACH ROW
BEGIN
  IF NEW.email IS NOT NULL THEN
    SET NEW.email_hash = SHA2(LOWER(CAST(NEW.email AS CHAR)),256);
    SET NEW.email = AES_ENCRYPT(NEW.email, get_enc_key());
  END IF;
  IF NEW.phone IS NOT NULL THEN
    SET NEW.phone_hash = SHA2(CAST(NEW.phone AS CHAR),256);
    SET NEW.phone = AES_ENCRYPT(NEW.phone, get_enc_key());
  END IF;
END$$

-- STAFF
DROP TRIGGER IF EXISTS trg_staff_bi $$
CREATE TRIGGER trg_staff_bi
BEFORE INSERT ON staff
FOR EACH ROW
BEGIN
  IF NEW.email IS NOT NULL THEN
    SET NEW.email_hash = SHA2(LOWER(CAST(NEW.email AS CHAR)),256);
    SET NEW.email = AES_ENCRYPT(NEW.email, get_enc_key());
  END IF;
  IF NEW.phone IS NOT NULL THEN
    SET NEW.phone_hash = SHA2(CAST(NEW.phone AS CHAR),256);
    SET NEW.phone = AES_ENCRYPT(NEW.phone, get_enc_key());
  END IF;
END$$

-- BILL
DROP TRIGGER IF EXISTS trg_bill_bi $$
CREATE TRIGGER trg_bill_bi
BEFORE INSERT ON bill
FOR EACH ROW
BEGIN
  -- Encrypt individual cost components
  IF NEW.consultation_fee IS NOT NULL THEN
    SET NEW.consultation_fee = AES_ENCRYPT(NEW.consultation_fee, get_enc_key());
  END IF;
  
  IF NEW.medication_cost IS NOT NULL THEN
    SET NEW.medication_cost = AES_ENCRYPT(NEW.medication_cost, get_enc_key());
  END IF;
  
  IF NEW.lab_tests_cost IS NOT NULL THEN
    SET NEW.lab_tests_cost = AES_ENCRYPT(NEW.lab_tests_cost, get_enc_key());
  END IF;
  
  -- Encrypt total
  IF NEW.total IS NOT NULL THEN
    SET NEW.total = AES_ENCRYPT(NEW.total, get_enc_key());
  END IF;
END$$

-- PAYMENT
DROP TRIGGER IF EXISTS trg_payment_bi $$
CREATE TRIGGER trg_payment_bi
BEFORE INSERT ON payment
FOR EACH ROW
BEGIN
  SET NEW.amount = AES_ENCRYPT(NEW.amount, get_enc_key());
END$$

-- APPOINTMENT
DROP TRIGGER IF EXISTS trg_appointment_bi $$
CREATE TRIGGER trg_appointment_bi
BEFORE INSERT ON appointment
FOR EACH ROW
BEGIN
  SET NEW.reason = AES_ENCRYPT(NEW.reason, get_enc_key());
END$$

-- USER (SHA-256 password hashing with random salt)
DROP TRIGGER IF EXISTS trg_user_bi $$
CREATE TRIGGER trg_user_bi
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
  DECLARE random_salt CHAR(64);
  
  -- Generate random salt using UUID and SHA2
  SET random_salt = SHA2(CONCAT(UUID(), RAND(), NOW(6)), 256);
  
  -- Encrypt username
  SET NEW.username = AES_ENCRYPT(NEW.username, get_enc_key());
  
  -- Store salt
  SET NEW.salt = random_salt;
  
  -- Hash password with salt: SHA2(password + salt)
  SET NEW.password = SHA2(CONCAT(NEW.password, random_salt), 256);
END$$
DELIMITER ;

/* =========================================================
   VIEWS (DECRYPTED OUTPUT)
   ========================================================= */

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

CREATE OR REPLACE VIEW v_payment_decrypted AS
SELECT
  payment_id,
  bill_id,
  CAST(AES_DECRYPT(amount, get_enc_key()) AS DECIMAL(12,2)) AS amount,
  paid_at,
  method,
  received_by
FROM payment;

CREATE OR REPLACE VIEW v_user_decrypted AS
SELECT
  user_id,
  CAST(AES_DECRYPT(username, get_enc_key()) AS CHAR(80)) AS username,
  created_at
FROM user;

CREATE OR REPLACE VIEW v_doctor_decrypted AS
SELECT
  doctor_id,
  first_name,
  last_name,
  department,
  specialization,
  CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR(255)) AS email,
  CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR(64)) AS phone,
  user_id,
  hire_date
FROM doctor;

CREATE OR REPLACE VIEW v_staff_decrypted AS
SELECT
  staff_id,
  first_name,
  last_name,
  position,
  department,
  CAST(AES_DECRYPT(email, get_enc_key()) AS CHAR(255)) AS email,
  CAST(AES_DECRYPT(phone, get_enc_key()) AS CHAR(64)) AS phone,
  user_id,
  hire_date
FROM staff;

CREATE OR REPLACE VIEW v_appointment_decrypted AS
SELECT
  appointment_id,
  patient_id,
  doctor_id,
  appointment_date,
  appointment_time,
  CAST(AES_DECRYPT(reason, get_enc_key()) AS CHAR(255)) AS reason,
  status,
  created_at
FROM appointment;

/* =========================================================
   BUSINESS TRIGGER
   ========================================================= */
DELIMITER $$
DROP TRIGGER IF EXISTS trg_payment_after_insert $$
CREATE TRIGGER trg_payment_after_insert
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
  DECLARE v_total DECIMAL(12,2);
  DECLARE v_paid  DECIMAL(12,2);

  SELECT CAST(AES_DECRYPT(total, get_enc_key()) AS DECIMAL(12,2))
    INTO v_total FROM bill WHERE bill_id = NEW.bill_id FOR UPDATE;

  SELECT COALESCE(SUM(CAST(AES_DECRYPT(amount, get_enc_key()) AS DECIMAL(12,2))),0)
    INTO v_paid FROM payment WHERE bill_id = NEW.bill_id;

  IF v_paid > v_total THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment exceeds bill total';
  END IF;

  IF v_paid >= v_total THEN
    UPDATE bill SET status = 'PAID' WHERE bill_id = NEW.bill_id;
  ELSE
    UPDATE bill SET status = 'OPEN' WHERE bill_id = NEW.bill_id AND status <> 'OPEN';
  END IF;
END$$
DELIMITER ;

/* =========================================================
   STORED PROCEDURE
   ========================================================= */
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_book_appointment $$
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

  IF NOT EXISTS (SELECT 1 FROM patient WHERE patient_id = p_patient_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid patient_id';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM doctor WHERE doctor_id = p_doctor_id) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid doctor_id';
  END IF;

  SELECT COUNT(*) INTO v_conflict
  FROM appointment
  WHERE doctor_id = p_doctor_id
    AND appointment_date = p_date
    AND TIME(appointment_time) = p_time
    AND status IN ('SCHEDULED','RESCHEDULED');

  IF v_conflict > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Doctor already booked';
  END IF;

  INSERT INTO appointment (
    patient_id, doctor_id, appointment_date, appointment_time, reason, status, created_at
  ) VALUES (
    p_patient_id, p_doctor_id, p_date, TIMESTAMP(p_date, p_time),
    AES_ENCRYPT(p_reason, get_enc_key()), 'SCHEDULED', NOW()
  );

  SET p_appointment_id = LAST_INSERT_ID();
END$$
DELIMITER ;


/* =========================================================
   USER CREATION
   ========================================================= */
DROP USER IF EXISTS 'admin_user'@'%';
DROP USER IF EXISTS 'doctor_user'@'%';
DROP USER IF EXISTS 'staff_user'@'%';

CREATE USER 'admin_user'@'%' IDENTIFIED BY 'AdminPassword123!';
CREATE USER 'doctor_user'@'%' IDENTIFIED BY 'DoctorPassword123!';
CREATE USER 'staff_user'@'%' IDENTIFIED BY 'StaffPassword123!';


/* =========================================================
   PRIVILEGES (Based on requirement matrix)
   - Encrypted tables grant access to decrypted VIEWS ONLY
   
   Matrix:
   Entity      | Admin | Doctor | Staff
   ------------|-------|--------|-------
   Admin       | —     | —      | —
   Doctor      | R     | CRUD   | —
   Staff       | CRU   | —      | —
   Patient     | —     | R      | CRUD
   Appointment | —     | RU     | CRUD
   Bill        | —     | —      | CRUD
   User        | CRUD  | —      | —
   ========================================================= */

/* ----------------------------------------------------------
   ADMIN USER
   ---------------------------------------------------------- */

-- Doctor table → R (Read only)
GRANT SELECT ON HMS.v_doctor_decrypted TO 'admin_user'@'%';

-- Staff table → CRU (Create, Read, Update)
GRANT SELECT, INSERT, UPDATE ON HMS.v_staff_decrypted TO 'admin_user'@'%';

-- Patient → no privileges
-- Appointment → no privileges
-- Bill → no privileges

-- User table → CRUD (Create, Read, Update, Delete)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_user_decrypted TO 'admin_user'@'%';


/* ----------------------------------------------------------
   DOCTOR USER
   ---------------------------------------------------------- */

-- Doctor table → CRUD (Create, Read, Update, Delete)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_doctor_decrypted TO 'doctor_user'@'%';

-- Staff table → no access

-- Patient → R (Read only)
GRANT SELECT ON HMS.v_patient_decrypted TO 'doctor_user'@'%';

-- Appointment table → RU (Read, Update)
GRANT SELECT, UPDATE ON HMS.v_appointment_decrypted TO 'doctor_user'@'%';

-- Bill → no access
-- User → no access


/* ----------------------------------------------------------
   STAFF USER
   ---------------------------------------------------------- */

-- Doctor table → no access

-- Staff table → no access

-- Patient → CRUD (Create, Read, Update, Delete)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_patient_decrypted TO 'staff_user'@'%';

-- Appointment table → CRUD (Create, Read, Update, Delete)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_appointment_decrypted TO 'staff_user'@'%';

-- Bill → CRUD (Create, Read, Update, Delete)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_bill_decrypted TO 'staff_user'@'%';

-- Payment → CRUD (Create, Read, Update, Delete)
GRANT SELECT, INSERT, UPDATE, DELETE ON HMS.v_payment_decrypted TO 'staff_user'@'%';

-- User table → no access


FLUSH PRIVILEGES;
