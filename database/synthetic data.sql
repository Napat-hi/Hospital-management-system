USE HMS;

-- =========================================================
-- INITIALIZE ENCRYPTION KEY
-- =========================================================
DELETE FROM secret_config;
INSERT INTO secret_config VALUES (
  1, LEFT(SHA2('xHMEeykkS!Y$dj1T7H6UeL*@qTBKFkS$', 256), 32)
);

-- =========================================================
-- PATIENT
-- =========================================================
INSERT INTO patient (first_name, last_name, dob, sex, email, phone, address, emergency_contact) VALUES
('Ananda', 'Chaiyasit', '1985-03-12', 'M', 'ananda85@gmail.com', '0812345671', 'Bangkok, Thailand', '0819991111'),
('Kanya', 'Thongdee', '1990-07-08', 'F', 'kanya.td@gmail.com', '0898765432', 'Chiang Mai, Thailand', '0861122334'),
('Somchai', 'Rattanakorn', '1978-01-24', 'M', 'somchai78@yahoo.com', '0812123434', 'Khon Kaen, Thailand', '0813434334'),
('Mayuree', 'Nimman', '1995-09-17', 'F', 'mayuree95@gmail.com', '0823332221', 'Phuket, Thailand', '0813334444'),
('Arthit', 'Sirisuk', '2000-11-05', 'M', 'arthit2000@outlook.com', '0835678890', 'Bangkok, Thailand', '0812223344'),
('Benjamas', 'Chan', '1988-04-28', 'F', 'benjamas88@gmail.com', '0859080706', 'Rayong, Thailand', '0853334567'),
('Preecha', 'Sukjai', '1975-12-10', 'M', 'preecha75@gmail.com', '0892223334', 'Chiang Rai, Thailand', '0845556667'),
('Thanya', 'Wong', '1998-02-15', 'F', 'thanya98@gmail.com', '0821112244', 'Nonthaburi, Thailand', '0833335555'),
('Surasak', 'Boonyasiri', '1982-06-06', 'M', 'surasak82@gmail.com', '0815556661', 'Udon Thani, Thailand', '0867778888'),
('Manita', 'Yodrak', '2001-10-25', 'F', 'manita01@gmail.com', '0844445555', 'Bangkok, Thailand', '0811112222');

-- =========================================================
-- DOCTOR
-- =========================================================
INSERT INTO doctor (first_name, last_name, department, specialization, phone, email, hire_date) VALUES
('Pawat', 'Kittipong', 'Cardiology', 'Cardiologist', '0811113333', 'pawat.k@hms.com', '2015-05-01'),
('Siriwan', 'Boonsong', 'Neurology', 'Neurologist', '0822224444', 'siriwan.b@hms.com', '2016-08-15'),
('Thanakorn', 'Meechai', 'Pediatrics', 'Pediatrician', '0833335555', 'thanakorn.m@hms.com', '2019-01-20'),
('Jirapat', 'Suntorn', 'Orthopedics', 'Orthopedic Surgeon', '0844446666', 'jirapat.s@hms.com', '2018-07-07'),
('Kanchana', 'Sriwan', 'General Medicine', 'Physician', '0855557777', 'kanchana.s@hms.com', '2020-09-10');

-- =========================================================
-- STAFF
-- =========================================================
INSERT INTO staff (first_name, last_name, position, department, email, phone, hire_date, status) VALUES
('Nattapong', 'Wilaikul', 'Cashier', 'Billing', 'nattapong@hms.com', '0812223344', '2021-01-15', 'ACTIVE'),
('Chutima', 'Korn', 'Receptionist', 'Front Desk', 'chutima@hms.com', '0813334455', '2022-02-20', 'ACTIVE'),
('Wirat', 'Thammasak', 'Nurse', 'Pediatrics', 'wirat@hms.com', '0824445566', '2019-06-12', 'ACTIVE'),
('Somsri', 'Kaew', 'Technician', 'Radiology', 'somsri@hms.com', '0835556677', '2018-09-01', 'ACTIVE'),
('Phudit', 'Saelee', 'Accountant', 'Finance', 'phudit@hms.com', '0846667788', '2017-04-18', 'ACTIVE');

-- =========================================================
-- BILL (note: totals are quoted as strings for AES_ENCRYPT)
-- =========================================================
INSERT INTO bill (patient_id, status, total) VALUES
(1, 'OPEN', '3500.00'),
(2, 'PAID', '1200.00'),
(3, 'OPEN', '2700.00'),
(4, 'PAID', '5400.00'),
(5, 'OPEN', '1800.00');

-- =========================================================
-- PAYMENT (amount quoted as strings)
-- =========================================================
INSERT INTO payment (bill_id, amount, paid_at, method, received_by) VALUES
(1, '1500.00', '2025-11-01 09:45:00', 'CASH', 1),
(2, '1200.00', '2025-10-29 14:20:00', 'CARD', 5),
(3, '1000.00', '2025-11-03 16:10:00', 'TRANSFER', 1),
(4, '5400.00', '2025-10-28 11:30:00', 'CARD', 5),
(5, '1000.00', '2025-11-04 13:55:00', 'CASH', 1);

-- =========================================================
-- APPOINTMENT
-- =========================================================
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason, status) VALUES
(1, 1, '2025-11-07', '2025-11-07 09:00:00', 'Routine heart check-up', 'SCHEDULED'),
(2, 2, '2025-11-08', '2025-11-08 10:30:00', 'Migraine consultation', 'SCHEDULED'),
(3, 3, '2025-11-06', '2025-11-06 13:00:00', 'Child vaccination', 'COMPLETED'),
(4, 4, '2025-11-05', '2025-11-05 15:00:00', 'Knee pain follow-up', 'COMPLETED'),
(5, 5, '2025-11-09', '2025-11-09 08:30:00', 'General health screening', 'SCHEDULED');

-- =========================================================
-- USER
-- =========================================================
INSERT INTO user (username, password, role) VALUES
('ananda.cha', '12031985', 'patient'),
('kanya.tho', '08071990', 'patient'),
('somchai.rat', '24011978', 'patient'),
('mayuree.nim', '17091995', 'patient'),
('arthit.sir', '05112000', 'patient'),
('benjamas.cha', '28041988', 'patient'),
('preecha.suk', '10121975', 'patient'),
('thanya.won', '15021998', 'patient'),
('surasak.boo', '06061982', 'patient'),
('manita.yod', '25102001', 'patient'),

('pawat.kit', '01051980', 'doctor'),
('siriwan.boo', '15081979', 'doctor'),
('thanakorn.mee', '20011985', 'doctor'),
('jirapat.sun', '07071981', 'doctor'),
('kanchana.sri', '10092083', 'doctor'),

('nattapong.wil', '15011990', 'staff'),
('chutima.kor', '20021993', 'staff'),
('wirat.tha', '12061987', 'staff'),
('somsri.kae', '01091985', 'staff'),
('phudit.sae', '18041988', 'staff'),

('admin.admin', 'admin', 'admin');
