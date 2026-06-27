# 🗂️ Lost and Found System

A web-based Lost and Found Management System developed for Universiti Teknologi Malaysia (UTM) to streamline the process of reporting lost items, managing found items, and processing claims.

---

## 📖 Overview

The Lost and Found System is a centralized web platform designed to help university students, staff, and administrators manage lost and found items efficiently. Currently, most lost and found communications happen through WhatsApp or Telegram groups, where messages get lost and there is no proper record-keeping.

This system solves these problems by providing:
- A centralized platform for all lost and found activities
- Proper record-keeping with database storage
- Role-based access for different users
- Streamlined claim processing with verification

---

## ✨ Features

### 🔐 Authentication & Session Management
- User registration with validation
- Secure login with username/email and password
- Password reset functionality
- Session management with PHP sessions
- Role-based access control

### 👥 Multi-Role System

| Role | Access Level |
|------|--------------|
| **Admin** | Full system management, user management, view all records |
| **Staff** | Manage found items, review claims, view lost reports |
| **User** | Report lost items, browse found items, submit claims |

### 📦 Core Modules

**Found Item Management (Staff/Admin)**
- Add found items with photo upload
- View and search found items
- Edit item details
- Delete items (Admin only)

**Lost Report Management (User/Admin)**
- Submit lost item reports with photos
- View personal lost reports (User)
- View all lost reports (Staff/Admin)
- Edit and delete reports (Admin only)

**Claim Management (User/Staff/Admin)**
- 4-step wizard for claim submission
- Link lost reports to claims
- Upload evidence photos
- Review and approve/reject claims (Staff/Admin)
- Automatic status updates upon approval

**User Management (Admin only)**
- View all registered users
- Add new user accounts
- Edit user details
- Delete user accounts
- Search and filter users

**Dashboard & Statistics**
- Role-specific dashboards
- Animated statistics cards
- Monthly statistics with bar charts
- Quick access to key functions

### 🔍 Search & Filter
- Real-time search with debouncing
- Filter by category, status, and date range
- Pagination for large datasets

### 📷 Image Upload
- Photo upload for found items
- Photo upload for lost reports
- Evidence upload for claims
- File validation (JPG, JPEG, PNG)
- Automatic placeholder images

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | HTML5 | Page structure |
| | CSS3 | Styling and layout |
| | JavaScript | Client-side interactivity |
| | Bootstrap 5.3.8 | Responsive design framework |
| | Font Awesome 6.4.0 | Icons |
| **Backend** | PHP 8.2 | Server-side processing |
| **Database** | MySQL 8.0 | Data storage and retrieval |

---

## 👥 User Roles

### Admin
- Manage all user accounts (CRUD)
- View all found items, lost reports, and claims
- Edit and delete any record
- Access system statistics and dashboards
- Approve or reject any claim

### Office Staff
- Add found items with photo upload
- Edit own found item records
- View all lost reports
- Review and approve/reject claims on their items

### Users (Students & Lecturers)
- Register and log in to the system
- Report lost items with photos
- Browse found items
- Submit claims via 4-step wizard
- Track claim status
- View personal lost reports and claims

---

## 💻 Installation Guide

### Prerequisites

- XAMPP / WAMP / MAMP (PHP 8.2+ and MySQL 8.0+)
- Web browser (Chrome, Firefox, Edge)

### Step 1: Clone or Download

```bash
git clone https://github.com/your-username/lost-and-found-system.git
```

Or download the ZIP file and extract it.

### Step 2: Move to Web Server Root

Copy the project folder to your web server root directory:

- **XAMPP**: `C:\xampp\htdocs\`
- **WAMP**: `C:\wamp64\www\`
- **MAMP**: `/Applications/MAMP/htdocs/`

### Step 3: Start Apache and MySQL

Start your web server and MySQL services:
- **XAMPP**: Start Apache and MySQL from the control panel
- **WAMP**: Click the icon and start services
- **MAMP**: Click "Start Servers"

### Step 4: Import Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Click "New" to create a database
3. Name it `lost_and_found_db`
4. Select `utf8_general_ci` collation
5. Click "Create"
6. Go to the "Import" tab
7. Click "Choose File" and select the SQL file located at:
   ```
   /config/db.sql
   ```
8. Click "Go" to import

### Step 5: Configure Database Connection

Open `/config/db_connect.php` and update the database credentials if needed:

```php
<?php
$host = 'localhost';
$username = 'root';
$password = '';
$database = 'lost_and_found_db';

$conn = mysqli_connect($host, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>
```

### Step 6: Access the System

Open your browser and navigate to:

```
http://localhost/LostNFoundSystem/
```

---

## 🗄️ Database Schema

The database consists of 5 main tables:

| Table | Purpose |
|-------|---------|
| `users` | Stores user account information |
| `categories` | Stores item categories |
| `found_items` | Stores found item records |
| `lost_reports` | Stores lost item reports |
| `claims` | Stores claim submissions and reviews |

### Table Structures

**users**
| Field | Type | Description |
|-------|------|-------------|
| user_id | INT (PK) | Unique user identifier |
| username | VARCHAR(50) | Login username |
| name | VARCHAR(100) | User's full name |
| email | VARCHAR(100) | User email address |
| password | VARCHAR(255) | Encrypted password |
| role | ENUM | admin, staff, user |
| phone | VARCHAR(20) | Contact number |
| created_at | DATETIME | Account creation date |

**categories**
| Field | Type | Description |
|-------|------|-------------|
| category_id | INT (PK) | Unique category identifier |
| category_name | VARCHAR(100) | Category name |

**found_items**
| Field | Type | Description |
|-------|------|-------------|
| item_id | INT (PK) | Unique item identifier |
| user_id | INT (FK) | Staff who registered the item |
| item_name | VARCHAR(100) | Name of item |
| description | TEXT | Item description |
| location_found | VARCHAR(100) | Location where item was found |
| date_found | DATE | Date item was found |
| found_status | ENUM | unclaimed, pending, claimed |
| category_id | INT (FK) | Item category |
| created_at | DATETIME | Record creation date |
| photo | VARCHAR(500) | Item image path |

**lost_reports**
| Field | Type | Description |
|-------|------|-------------|
| report_id | INT (PK) | Unique report identifier |
| user_id | INT (FK) | User who submitted report |
| item_name | VARCHAR(100) | Lost item name |
| description | TEXT | Item description |
| location_lost | VARCHAR(100) | Location where item was lost |
| date_lost | DATE | Date item was lost |
| lost_status | ENUM | searching, found, closed |
| category_id | INT (FK) | Item category |
| created_at | DATETIME | Report creation date |
| photo | VARCHAR(500) | Uploaded image path |

**claims**
| Field | Type | Description |
|-------|------|-------------|
| claim_id | INT (PK) | Unique claim identifier |
| item_id | INT (FK) | Claimed item |
| user_id | INT (FK) | User making claim |
| reviewed_by | INT (FK) | Admin or staff reviewing claim |
| lost_report_id | INT (FK) | Link to a lost report record |
| ownership_proof | TEXT | Proof of ownership |
| identifying_details | TEXT | Additional identifying information |
| claim_status | ENUM | pending, approved, rejected |
| review_note | TEXT | Review remarks |
| submitted_at | DATETIME | Claim submission date |
| reviewed_at | DATETIME | Review completion date |
| evidence_photo | VARCHAR(255) | Store photo path |

### Entity Relationships

```
users (1) ──────< found_items (Many)
users (1) ──────< lost_reports (Many)
users (1) ──────< claims (Many)
found_items (1) ─< claims (Many)
categories (1) ──< found_items (Many)
categories (1) ──< lost_reports (Many)
lost_reports (1) ─< claims (Many)
users (1) ──────< claims (reviewed_by)
```

---

## 🔑 Default Login Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| **Admin** | `admin_utm` | `admin@utm.my` | `admin123` |
| **Staff** | `siti_staff` | `siti@utm.my` | `staff123` |
| **User** | `ahmad_faris` | `ahmad@utm.my` | `student123` |

---

## 👨‍💻 Team Members

| Name | Matric Number | Role | Responsibilities |
|------|---------------|------|------------------|
| **Ung Yii Jia** | A24CS0310 | Project Director | Authentication, User Management, Database Design, Multi-Role Login, Session Management |
| **Wong Ya Jing** | A24CS0211 | Lead Developer | Found Item Management, Search Functionality, System Design |
| **Chia Thung Thung** | A24CS0060 | UI/UX Designer | Interface Design, Dashboard Development, Testing, Documentation |
| **Yeoh Huey Ting** | A24CS0315 | Operations Manager | Lost Reports, Claims Module, User Manual, Technology Stack |

---

## 📝 License

This project was developed as a group project for **SECV2223 Web Programming** at Universiti Teknologi Malaysia (UTM).

---

## 🙏 Acknowledgments

- **Dr. Aida Binti Ali** - Course Lecturer
- **Universiti Teknologi Malaysia (UTM)** - Academic Institution
- All team members for their dedication and hard work

---

**© 2026 Group 5 - Error 404 | SECV2223 Web Programming | Universiti Teknologi Malaysia**
