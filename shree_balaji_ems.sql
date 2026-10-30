-- =====================================================================
-- SHREE BALAJI — EMPLOYEE MANAGEMENT SYSTEM
-- Database schema + demo data (MySQL 8 / MariaDB / AWS RDS MySQL)
--
-- How to use:
--   mysql -u USER -p < shree_balaji_ems.sql
--   or open this file in MySQL Workbench / phpMyAdmin and run it.
--
-- Note: the HTML website saves data in the browser and does not need this
-- database to run. Use this file when you move to an online database
-- (e.g. AWS RDS) so many computers can share the same live data.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS shree_balaji_ems CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shree_balaji_ems;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payroll, leave_requests, attendance, employees, departments, admin_users, company;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- Company profile (shown on payslips) ----------
CREATE TABLE company (
  id          TINYINT PRIMARY KEY DEFAULT 1,
  name        VARCHAR(150) NOT NULL,
  tagline     VARCHAR(150),
  address     VARCHAR(255),
  phone       VARCHAR(30),
  email       VARCHAR(150),
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ---------- Admin login ----------
CREATE TABLE admin_users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(60) NOT NULL UNIQUE,
  password_hash  CHAR(64) NOT NULL,           -- SHA-256 of the password
  display_name   VARCHAR(100) NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Departments ----------
CREATE TABLE departments (
  id           VARCHAR(20) PRIMARY KEY,
  name         VARCHAR(100) NOT NULL UNIQUE,
  head         VARCHAR(100),
  description  VARCHAR(255)
);

-- ---------- Employees ----------
CREATE TABLE employees (
  id            VARCHAR(20) PRIMARY KEY,
  code          VARCHAR(20) NOT NULL UNIQUE,
  name          VARCHAR(120) NOT NULL,
  dept_id       VARCHAR(20),
  designation   VARCHAR(100) NOT NULL,
  gender        ENUM('Male','Female','Other') DEFAULT 'Male',
  phone         VARCHAR(20) NOT NULL,
  email         VARCHAR(150),
  dob           DATE,
  join_date     DATE,
  address       VARCHAR(255),
  pan           VARCHAR(10),
  bank_account  VARCHAR(30),
  ifsc          VARCHAR(11),
  basic         DECIMAL(10,2) NOT NULL DEFAULT 0,
  hra           DECIMAL(10,2) NOT NULL DEFAULT 0,
  allowance     DECIMAL(10,2) NOT NULL DEFAULT 0,
  status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_emp_dept FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ---------- Daily attendance ----------
-- status: P = Present, A = Absent, H = Half day, L = On leave
CREATE TABLE attendance (
  att_date  DATE NOT NULL,
  emp_id    VARCHAR(20) NOT NULL,
  status    ENUM('P','A','H','L') NOT NULL,
  PRIMARY KEY (att_date, emp_id),
  CONSTRAINT fk_att_emp FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------- Leave requests ----------
CREATE TABLE leave_requests (
  id          VARCHAR(20) PRIMARY KEY,
  emp_id      VARCHAR(20) NOT NULL,
  leave_type  VARCHAR(40) NOT NULL,
  from_date   DATE NOT NULL,
  to_date     DATE NOT NULL,
  reason      VARCHAR(255),
  status      ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  applied_on  DATE NOT NULL,
  CONSTRAINT fk_leave_emp FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- ---------- Monthly payroll ----------
-- Salary rules used by the website:
--   Gross = Basic + HRA + Allowance
--   PF = 12% of Basic, Professional Tax = 200 when Gross >= 15,000
--   Loss of pay = (Gross / 30) x (Absent days + 0.5 x Half days)
--   Net = Gross + Bonus - PF - PT - Loss of pay - Other deductions
CREATE TABLE payroll (
  pay_month        CHAR(7) NOT NULL,            -- e.g. 2026-10
  emp_id           VARCHAR(20) NOT NULL,
  bonus            DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_deduction  DECIMAL(10,2) NOT NULL DEFAULT 0,
  note             VARCHAR(255),
  status           ENUM('Pending','Paid') NOT NULL DEFAULT 'Pending',
  paid_on          DATE,
  PRIMARY KEY (pay_month, emp_id),
  CONSTRAINT fk_pay_emp FOREIGN KEY (emp_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- =====================================================================
-- DEMO DATA
-- =====================================================================
INSERT INTO company (id, name, tagline) VALUES (1, 'Shree Balaji', 'Employee Management System');

-- Demo login: admin / admin123  (change after first login)
INSERT INTO admin_users (username, password_hash, display_name) VALUES ('admin', SHA2('admin123', 256), 'Administrator');

INSERT INTO departments (id, name, head, description) VALUES
  ('D1', 'Administration', 'Rajesh Agarwal', 'Management and office administration'),
  ('D2', 'Sales', 'Amit Verma', 'Customer relations and sales'),
  ('D3', 'Accounts', 'Sneha Gupta', 'Billing, GST and finance'),
  ('D4', 'Operations', 'Vikram Singh', 'Day-to-day business operations'),
  ('D5', 'Warehouse', 'Rohit Jain', 'Stock, storage and dispatch'),
  ('D6', 'Human Resources', 'Priya Sharma', 'Hiring, payroll and staff welfare');

INSERT INTO employees (id, code, name, dept_id, designation, gender, phone, email, dob, join_date, basic, hra, allowance, status) VALUES
  ('E1', 'SB1001', 'Rajesh Agarwal', 'D1', 'General Manager', 'Male', '9830012345', 'rajesh@shreebalaji.in', '1978-08-12', '2015-04-01', 45000, 18000, 7000, 'Active'),
  ('E2', 'SB1002', 'Priya Sharma', 'D6', 'HR Executive', 'Female', '9830023456', 'priya@shreebalaji.in', '1992-03-22', '2019-07-15', 22000, 8800, 3200, 'Active'),
  ('E3', 'SB1003', 'Amit Verma', 'D2', 'Sales Manager', 'Male', '9830034567', 'amit@shreebalaji.in', '1986-11-05', '2017-01-10', 32000, 12800, 5200, 'Active'),
  ('E4', 'SB1004', 'Sneha Gupta', 'D3', 'Senior Accountant', 'Female', '9830045678', 'sneha@shreebalaji.in', '1990-01-30', '2018-06-01', 28000, 11200, 3800, 'Active'),
  ('E5', 'SB1005', 'Vikram Singh', 'D4', 'Operations Lead', 'Male', '9830056789', 'vikram@shreebalaji.in', '1984-05-14', '2016-09-20', 30000, 12000, 4000, 'Active'),
  ('E6', 'SB1006', 'Pooja Das', 'D2', 'Sales Executive', 'Female', '9830067890', 'pooja@shreebalaji.in', '1996-07-09', '2021-02-01', 16000, 6400, 2100, 'Active'),
  ('E7', 'SB1007', 'Rohit Jain', 'D5', 'Warehouse Supervisor', 'Male', '9830078901', 'rohit@shreebalaji.in', '1988-12-19', '2018-11-12', 20000, 8000, 2500, 'Active'),
  ('E8', 'SB1008', 'Anjali Mehta', 'D3', 'Accounts Assistant', 'Female', '9830089012', 'anjali@shreebalaji.in', '1998-09-02', '2022-04-18', 14000, 5600, 1900, 'Active'),
  ('E9', 'SB1009', 'Suresh Yadav', 'D5', 'Store Keeper', 'Male', '9830090123', 'suresh@shreebalaji.in', '1991-04-25', '2020-08-05', 13000, 5200, 1800, 'Active'),
  ('E10', 'SB1010', 'Kavita Banerjee', 'D1', 'Office Administrator', 'Female', '9830101234', 'kavita@shreebalaji.in', '1993-10-16', '2019-03-11', 18000, 7200, 2300, 'Active'),
  ('E11', 'SB1011', 'Manoj Tiwari', 'D4', 'Logistics Coordinator', 'Male', '9830112345', 'manoj@shreebalaji.in', '1994-06-07', '2021-10-25', 17000, 6800, 2200, 'Active'),
  ('E12', 'SB1012', 'Neha Kapoor', 'D2', 'Sales Executive', 'Female', '9830123456', 'neha@shreebalaji.in', '1999-02-28', '2023-01-16', 15000, 6000, 2000, 'Active');

-- Last 25 days of attendance (Sundays off)
INSERT INTO attendance (att_date, emp_id, status) VALUES
  ('2026-10-27', 'E1', 'A'),
  ('2026-10-27', 'E2', 'P'),
  ('2026-10-27', 'E3', 'P'),
  ('2026-10-27', 'E4', 'P'),
  ('2026-10-27', 'E5', 'P'),
  ('2026-10-27', 'E6', 'P'),
  ('2026-10-27', 'E7', 'P'),
  ('2026-10-27', 'E8', 'P'),
  ('2026-10-27', 'E9', 'P'),
  ('2026-10-27', 'E10', 'P'),
  ('2026-10-27', 'E11', 'P'),
  ('2026-10-27', 'E12', 'H'),
  ('2026-10-26', 'E1', 'P'),
  ('2026-10-26', 'E2', 'P'),
  ('2026-10-26', 'E3', 'P'),
  ('2026-10-26', 'E4', 'A'),
  ('2026-10-26', 'E5', 'P'),
  ('2026-10-26', 'E6', 'P'),
  ('2026-10-26', 'E7', 'P'),
  ('2026-10-26', 'E8', 'P'),
  ('2026-10-26', 'E9', 'P'),
  ('2026-10-26', 'E10', 'P'),
  ('2026-10-26', 'E11', 'P'),
  ('2026-10-26', 'E12', 'P'),
  ('2026-10-24', 'E1', 'P'),
  ('2026-10-24', 'E2', 'L'),
  ('2026-10-24', 'E3', 'P'),
  ('2026-10-24', 'E4', 'P'),
  ('2026-10-24', 'E5', 'P'),
  ('2026-10-24', 'E6', 'P'),
  ('2026-10-24', 'E7', 'P'),
  ('2026-10-24', 'E8', 'P'),
  ('2026-10-24', 'E9', 'P'),
  ('2026-10-24', 'E10', 'A'),
  ('2026-10-24', 'E11', 'P'),
  ('2026-10-24', 'E12', 'P'),
  ('2026-10-23', 'E1', 'H'),
  ('2026-10-23', 'E2', 'P'),
  ('2026-10-23', 'E3', 'P'),
  ('2026-10-23', 'E4', 'P'),
  ('2026-10-23', 'E5', 'L'),
  ('2026-10-23', 'E6', 'P'),
  ('2026-10-23', 'E7', 'P'),
  ('2026-10-23', 'E8', 'P'),
  ('2026-10-23', 'E9', 'P'),
  ('2026-10-23', 'E10', 'P'),
  ('2026-10-23', 'E11', 'P'),
  ('2026-10-23', 'E12', 'P'),
  ('2026-10-22', 'E1', 'P'),
  ('2026-10-22', 'E2', 'P'),
  ('2026-10-22', 'E3', 'P'),
  ('2026-10-22', 'E4', 'H'),
  ('2026-10-22', 'E5', 'P'),
  ('2026-10-22', 'E6', 'P'),
  ('2026-10-22', 'E7', 'P'),
  ('2026-10-22', 'E8', 'L'),
  ('2026-10-22', 'E9', 'P'),
  ('2026-10-22', 'E10', 'P'),
  ('2026-10-22', 'E11', 'P'),
  ('2026-10-22', 'E12', 'P'),
  ('2026-10-21', 'E1', 'P'),
  ('2026-10-21', 'E2', 'P'),
  ('2026-10-21', 'E3', 'P'),
  ('2026-10-21', 'E4', 'P'),
  ('2026-10-21', 'E5', 'P'),
  ('2026-10-21', 'E6', 'P'),
  ('2026-10-21', 'E7', 'H'),
  ('2026-10-21', 'E8', 'P'),
  ('2026-10-21', 'E9', 'P'),
  ('2026-10-21', 'E10', 'P'),
  ('2026-10-21', 'E11', 'L'),
  ('2026-10-21', 'E12', 'P'),
  ('2026-10-20', 'E1', 'P'),
  ('2026-10-20', 'E2', 'P'),
  ('2026-10-20', 'E3', 'P'),
  ('2026-10-20', 'E4', 'P'),
  ('2026-10-20', 'E5', 'P'),
  ('2026-10-20', 'E6', 'P'),
  ('2026-10-20', 'E7', 'P'),
  ('2026-10-20', 'E8', 'P'),
  ('2026-10-20', 'E9', 'P'),
  ('2026-10-20', 'E10', 'H'),
  ('2026-10-20', 'E11', 'P'),
  ('2026-10-20', 'E12', 'P'),
  ('2026-10-19', 'E1', 'P'),
  ('2026-10-19', 'E2', 'A'),
  ('2026-10-19', 'E3', 'P'),
  ('2026-10-19', 'E4', 'P'),
  ('2026-10-19', 'E5', 'P'),
  ('2026-10-19', 'E6', 'P'),
  ('2026-10-19', 'E7', 'P'),
  ('2026-10-19', 'E8', 'P'),
  ('2026-10-19', 'E9', 'P'),
  ('2026-10-19', 'E10', 'P'),
  ('2026-10-19', 'E11', 'P'),
  ('2026-10-19', 'E12', 'P'),
  ('2026-10-17', 'E1', 'P'),
  ('2026-10-17', 'E2', 'P'),
  ('2026-10-17', 'E3', 'P'),
  ('2026-10-17', 'E4', 'P'),
  ('2026-10-17', 'E5', 'P'),
  ('2026-10-17', 'E6', 'P'),
  ('2026-10-17', 'E7', 'P'),
  ('2026-10-17', 'E8', 'A'),
  ('2026-10-17', 'E9', 'P'),
  ('2026-10-17', 'E10', 'P'),
  ('2026-10-17', 'E11', 'P'),
  ('2026-10-17', 'E12', 'P'),
  ('2026-10-16', 'E1', 'P'),
  ('2026-10-16', 'E2', 'P'),
  ('2026-10-16', 'E3', 'L'),
  ('2026-10-16', 'E4', 'P'),
  ('2026-10-16', 'E5', 'P'),
  ('2026-10-16', 'E6', 'P'),
  ('2026-10-16', 'E7', 'P'),
  ('2026-10-16', 'E8', 'P'),
  ('2026-10-16', 'E9', 'P'),
  ('2026-10-16', 'E10', 'P'),
  ('2026-10-16', 'E11', 'A'),
  ('2026-10-16', 'E12', 'P'),
  ('2026-10-15', 'E1', 'P'),
  ('2026-10-15', 'E2', 'H'),
  ('2026-10-15', 'E3', 'P'),
  ('2026-10-15', 'E4', 'P'),
  ('2026-10-15', 'E5', 'P'),
  ('2026-10-15', 'E6', 'L'),
  ('2026-10-15', 'E7', 'P'),
  ('2026-10-15', 'E8', 'P'),
  ('2026-10-15', 'E9', 'P'),
  ('2026-10-15', 'E10', 'P'),
  ('2026-10-15', 'E11', 'P'),
  ('2026-10-15', 'E12', 'P'),
  ('2026-10-14', 'E1', 'P'),
  ('2026-10-14', 'E2', 'P'),
  ('2026-10-14', 'E3', 'P'),
  ('2026-10-14', 'E4', 'P'),
  ('2026-10-14', 'E5', 'H'),
  ('2026-10-14', 'E6', 'P'),
  ('2026-10-14', 'E7', 'P'),
  ('2026-10-14', 'E8', 'P'),
  ('2026-10-14', 'E9', 'L'),
  ('2026-10-14', 'E10', 'P'),
  ('2026-10-14', 'E11', 'P'),
  ('2026-10-14', 'E12', 'P'),
  ('2026-10-13', 'E1', 'P'),
  ('2026-10-13', 'E2', 'P'),
  ('2026-10-13', 'E3', 'P'),
  ('2026-10-13', 'E4', 'P'),
  ('2026-10-13', 'E5', 'P'),
  ('2026-10-13', 'E6', 'P'),
  ('2026-10-13', 'E7', 'P'),
  ('2026-10-13', 'E8', 'H'),
  ('2026-10-13', 'E9', 'P'),
  ('2026-10-13', 'E10', 'P'),
  ('2026-10-13', 'E11', 'P'),
  ('2026-10-13', 'E12', 'L'),
  ('2026-10-12', 'E1', 'P'),
  ('2026-10-12', 'E2', 'P'),
  ('2026-10-12', 'E3', 'P'),
  ('2026-10-12', 'E4', 'P'),
  ('2026-10-12', 'E5', 'P'),
  ('2026-10-12', 'E6', 'P'),
  ('2026-10-12', 'E7', 'P'),
  ('2026-10-12', 'E8', 'P'),
  ('2026-10-12', 'E9', 'P'),
  ('2026-10-12', 'E10', 'P'),
  ('2026-10-12', 'E11', 'H'),
  ('2026-10-12', 'E12', 'P'),
  ('2026-10-10', 'E1', 'P'),
  ('2026-10-10', 'E2', 'P'),
  ('2026-10-10', 'E3', 'P'),
  ('2026-10-10', 'E4', 'P'),
  ('2026-10-10', 'E5', 'P'),
  ('2026-10-10', 'E6', 'A'),
  ('2026-10-10', 'E7', 'P'),
  ('2026-10-10', 'E8', 'P'),
  ('2026-10-10', 'E9', 'P'),
  ('2026-10-10', 'E10', 'P'),
  ('2026-10-10', 'E11', 'P'),
  ('2026-10-10', 'E12', 'P'),
  ('2026-10-09', 'E1', 'L'),
  ('2026-10-09', 'E2', 'P'),
  ('2026-10-09', 'E3', 'P'),
  ('2026-10-09', 'E4', 'P'),
  ('2026-10-09', 'E5', 'P'),
  ('2026-10-09', 'E6', 'P'),
  ('2026-10-09', 'E7', 'P'),
  ('2026-10-09', 'E8', 'P'),
  ('2026-10-09', 'E9', 'A'),
  ('2026-10-09', 'E10', 'P'),
  ('2026-10-09', 'E11', 'P'),
  ('2026-10-09', 'E12', 'P'),
  ('2026-10-08', 'E1', 'P'),
  ('2026-10-08', 'E2', 'P'),
  ('2026-10-08', 'E3', 'P'),
  ('2026-10-08', 'E4', 'L'),
  ('2026-10-08', 'E5', 'P'),
  ('2026-10-08', 'E6', 'P'),
  ('2026-10-08', 'E7', 'P'),
  ('2026-10-08', 'E8', 'P'),
  ('2026-10-08', 'E9', 'P'),
  ('2026-10-08', 'E10', 'P'),
  ('2026-10-08', 'E11', 'P'),
  ('2026-10-08', 'E12', 'A'),
  ('2026-10-07', 'E1', 'P'),
  ('2026-10-07', 'E2', 'P'),
  ('2026-10-07', 'E3', 'H'),
  ('2026-10-07', 'E4', 'P'),
  ('2026-10-07', 'E5', 'P'),
  ('2026-10-07', 'E6', 'P'),
  ('2026-10-07', 'E7', 'L'),
  ('2026-10-07', 'E8', 'P'),
  ('2026-10-07', 'E9', 'P'),
  ('2026-10-07', 'E10', 'P'),
  ('2026-10-07', 'E11', 'P'),
  ('2026-10-07', 'E12', 'P'),
  ('2026-10-06', 'E1', 'P'),
  ('2026-10-06', 'E2', 'P'),
  ('2026-10-06', 'E3', 'P'),
  ('2026-10-06', 'E4', 'P'),
  ('2026-10-06', 'E5', 'P'),
  ('2026-10-06', 'E6', 'H'),
  ('2026-10-06', 'E7', 'P'),
  ('2026-10-06', 'E8', 'P'),
  ('2026-10-06', 'E9', 'P'),
  ('2026-10-06', 'E10', 'L'),
  ('2026-10-06', 'E11', 'P'),
  ('2026-10-06', 'E12', 'P'),
  ('2026-10-05', 'E1', 'P'),
  ('2026-10-05', 'E2', 'P'),
  ('2026-10-05', 'E3', 'P'),
  ('2026-10-05', 'E4', 'P'),
  ('2026-10-05', 'E5', 'P'),
  ('2026-10-05', 'E6', 'P'),
  ('2026-10-05', 'E7', 'P'),
  ('2026-10-05', 'E8', 'P'),
  ('2026-10-05', 'E9', 'H'),
  ('2026-10-05', 'E10', 'P'),
  ('2026-10-05', 'E11', 'P'),
  ('2026-10-05', 'E12', 'P'),
  ('2026-10-03', 'E1', 'P'),
  ('2026-10-03', 'E2', 'P'),
  ('2026-10-03', 'E3', 'P'),
  ('2026-10-03', 'E4', 'A'),
  ('2026-10-03', 'E5', 'P'),
  ('2026-10-03', 'E6', 'P'),
  ('2026-10-03', 'E7', 'P'),
  ('2026-10-03', 'E8', 'P'),
  ('2026-10-03', 'E9', 'P'),
  ('2026-10-03', 'E10', 'P'),
  ('2026-10-03', 'E11', 'P'),
  ('2026-10-03', 'E12', 'P');

INSERT INTO leave_requests (id, emp_id, leave_type, from_date, to_date, reason, status, applied_on) VALUES
  ('L1', 'E6', 'Casual Leave', '2026-10-29', '2026-10-30', 'Family function', 'Pending', '2026-10-26'),
  ('L2', 'E2', 'Earned Leave', '2026-11-06', '2026-11-10', 'Travelling to hometown', 'Pending', '2026-10-27'),
  ('L3', 'E9', 'Sick Leave', '2026-10-21', '2026-10-22', 'Fever', 'Approved', '2026-10-20'),
  ('L4', 'E11', 'Casual Leave', '2026-10-15', '2026-10-15', 'Personal work', 'Rejected', '2026-10-13');

-- =====================================================================
-- USEFUL QUERIES
-- =====================================================================
-- Monthly salary sheet for October 2026:
-- SELECT e.code, e.name, d.name AS department,
--        (e.basic + e.hra + e.allowance)                                   AS gross,
--        ROUND(e.basic * 0.12)                                             AS pf,
--        IF(e.basic + e.hra + e.allowance >= 15000, 200, 0)                AS prof_tax,
--        ROUND((e.basic + e.hra + e.allowance) / 30 *
--              (SUM(a.status = 'A') + 0.5 * SUM(a.status = 'H')))         AS loss_of_pay
-- FROM employees e
-- LEFT JOIN departments d ON d.id = e.dept_id
-- LEFT JOIN attendance a  ON a.emp_id = e.id AND DATE_FORMAT(a.att_date, '%Y-%m') = '2026-10'
-- WHERE e.status = 'Active'
-- GROUP BY e.id;
--
-- Who is present today:
-- SELECT e.name FROM attendance a JOIN employees e ON e.id = a.emp_id
-- WHERE a.att_date = CURDATE() AND a.status = 'P';
