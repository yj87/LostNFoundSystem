# 🎒 UTM Lost and Found System

A web-based Lost and Found management system developed for Universiti Teknologi Malaysia (UTM) as part of a Web Programming course project.  
This system helps students and staff report, track, and claim lost items efficiently within the campus.

---

## 📌 Project Overview

The UTM Lost and Found System is designed to connect people who lose items with those who find them.  
Items found on campus are submitted by staff or students and stored in a centralized system.  
Students can browse found items and submit claims, while the admin manages and approves all claim requests.

---

## 🏫 System Scenario

### 👤 Admin (UTM Security Office)
- Oversees the entire system
- Reviews and approves/rejects claims
- Manages users and records
- Ensures items are properly tracked

### 👨‍🏫 Staff (Lecturers / Faculty Staff / Office Staff / Cleaners)
- Finds lost items on campus
- Submits found item records into the system
- Stores item at their respective office/counter (e.g., Library Counter, Faculty Office)

### 🎓 Student (UTM Students)
- Reports lost items
- Browses found items
- Submits claim requests for their belongings
- Collects item from the location stated after approval

---

## 🚀 Features

### 🔐 Authentication System
- User registration and login
- Role-based access (Admin / Staff / Student)
- Secure session handling

### 📦 Lost Item Module
- Students report lost items
- View personal lost item history

### 📥 Found Item Module
- Staff/students submit found items
- Include item details and location
- Upload item image (optional)

### 📩 Claim Management
- Students submit claims for found items
- Admin approves or rejects claims
- Track claim status (Pending / Approved / Rejected / Collected)

### 🧑‍💼 Admin Dashboard
- View all users
- Manage all lost and found items
- Handle all claims
- View system statistics

### 🔍 Search & Filter
- Search items by keyword
- Filter by category or status

---

## 🗄️ Database Structure

### Main Tables:
- `users`
- `lost_items`
- `found_items`
- `claims`

### Key Relationships:
- One user → many lost items
- One user → many found items
- One user → many claims
- One found item → many claims

---

## 🧰 Tech Stack

- HTML5
- CSS3
- JavaScript
- PHP (Backend)
- MySQL (Database)
- XAMPP (Local Server)

---

## 📁 Project Structure
