SHREE BALAJI — EMPLOYEE MANAGEMENT SYSTEM
==========================================

Plain HTML / CSS / JavaScript. No server, no database, no build step.

FILES
-----
index.html        Opens login or dashboard automatically
login.html        Admin sign in
dashboard.html    Overview: staff, attendance, leave, payroll
employees.html    Add / edit / delete employees, salary structure
attendance.html   Daily attendance + monthly summary
leave.html        Leave requests, approve / reject
salary.html       Monthly payroll, bonus, deductions, printable payslips
departments.html  Departments and heads
settings.html     Company details, change password, backup / restore
assets/style.css  Design (colours, fonts)
assets/app.js     Shared logic and data

Demo login:  username  admin   password  admin123
(Change it in Settings after your first login.)


DEPLOY ON AWS — OPTION A: AWS AMPLIFY (easiest, gives HTTPS)
-------------------------------------------------------------
1. Open AWS Console -> search "Amplify" -> "Create new app".
2. Choose "Deploy without Git".
3. Give it a name, then drag & drop the ZIP file (with index.html at the top level).
4. Click "Save and deploy". You get a https://....amplifyapp.com link.


DEPLOY ON AWS — OPTION B: S3 STATIC WEBSITE
-------------------------------------------
1. AWS Console -> S3 -> "Create bucket" (e.g. shree-balaji-ems).
   Untick "Block all public access" and confirm.
2. Open the bucket -> Upload -> add ALL files AND the "assets" folder
   (index.html must be at the top level, not inside another folder).
3. Properties tab -> "Static website hosting" -> Enable.
   Index document: index.html
4. Permissions tab -> Bucket policy -> paste (replace BUCKET-NAME):

   {
     "Version": "2012-10-17",
     "Statement": [{
       "Sid": "PublicRead",
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::BUCKET-NAME/*"
     }]
   }

5. Go back to Properties -> Static website hosting -> open the website URL.
   (For HTTPS + custom domain, put CloudFront in front of the bucket.)


IMPORTANT
---------
* Data is stored in the browser (localStorage) of the computer you use.
  Another computer/phone will NOT see the same data.
* Use Settings -> "Download backup" regularly, and "Restore backup" to move
  data to another computer.
* The login protects the screens from casual visitors only. Because there is
  no server, it is not bank-level security. For multiple users sharing live
  data, an online database/backend is needed.


DATABASE FILE (database/shree_balaji_ems.sql)
---------------------------------------------
The website works WITHOUT a database (it saves in the browser).
The SQL file is ready for when you move to an online database such as
AWS RDS (MySQL / MariaDB). It creates the database "shree_balaji_ems" with
tables: company, admin_users, departments, employees, attendance,
leave_requests, payroll — plus the same demo data.

Run it:   mysql -h YOUR-RDS-ENDPOINT -u admin -p < database/shree_balaji_ems.sql
or open it in MySQL Workbench / phpMyAdmin and click Run.

When uploading the website to S3 / Amplify you do not need to upload
the "database" folder.
