# Unity 101 Community Radio - Database Setup & Architecture Guide

This document describes the complete MySQL database architecture, environment configuration, setup, migrations, and local development instructions for the **Unity 101 Community Radio Event Registration & Admin Management System**.

---

## 1. System Requirements

- **MySQL Server** (8.0+) or **MariaDB** (10.4+)
- **Node.js** (v20+ or v22+)
- **npm** (v10+)
- **Next.js** (App Router with TypeScript)

---

## 2. Environment Configuration

Create a `.env` file in the root directory (based on `.env.example`):

```env
# Database Connection
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=unity101_db

# Admin Authentication Session Secret (Min 32 characters)
ADMIN_SESSION_SECRET=unity101_secure_jwt_secret_salt_2026_unity_community_radio

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 3. Database Schema Overview

The database uses UTF-8 (`utf8mb4`) and relational tables designed for event registration, audit logging, system settings, and administrator credentials.

### Tables:

### 1. `admins`
Stores authorized administrative accounts with bcrypt-hashed passwords.
- `id` (INT, Primary Key, AUTO_INCREMENT)
- `name` (VARCHAR 100)
- `email` (VARCHAR 150, UNIQUE, Indexed)
- `password_hash` (VARCHAR 255)
- `role` (VARCHAR 50, default 'admin')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. `registrations`
Primary guest registration table with soft-delete support (`deleted_at`).
- `id` (INT, Primary Key, AUTO_INCREMENT)
- `first_name` (VARCHAR 100)
- `last_name` (VARCHAR 100)
- `address` (VARCHAR 255)
- `town` (VARCHAR 100, Indexed)
- `post_code` (VARCHAR 20)
- `email` (VARCHAR 150, Indexed)
- `mobile` (VARCHAR 30, Indexed)
- `food_preference` (ENUM: 'Veg Food', 'Non Veg Food', Indexed)
- `gdpr_consent` (TINYINT 1, default 1)
- `status` (ENUM: 'new', 'confirmed', 'cancelled', default 'new', Indexed)
- `notes` (TEXT, optional admin notes)
- `deleted_at` (TIMESTAMP, NULL for active records, set on soft-delete)
- `created_at` (TIMESTAMP, Indexed)
- `updated_at` (TIMESTAMP)

### 3. `admin_activity_logs`
Audit log recording every administrative operation.
- `id` (INT, Primary Key, AUTO_INCREMENT)
- `admin_id` (INT, optional)
- `admin_email` (VARCHAR 150, optional)
- `action` (VARCHAR 50: LOGIN, REGISTRATION_CREATED, STATUS_CHANGED, etc.)
- `entity_type` (VARCHAR 50: registration, admin, settings, export)
- `entity_id` (INT, optional)
- `description` (TEXT)
- `created_at` (TIMESTAMP, Indexed)

### 4. `system_settings`
Configurable key-value store for event parameters.
- `setting_key` (VARCHAR 100, Primary Key)
- `setting_value` (TEXT)
- `updated_at` (TIMESTAMP)

---

## 4. Setup & Migration Commands

### Step A: Initialize Database and Tables
Run the SQL schema located in `scripts/schema.sql`:

```bash
# Using MySQL CLI
mysql -u root -p < scripts/schema.sql

# Or on Windows PowerShell:
Get-Content scripts/schema.sql | mysql -u root
```

### Step B: Seed Initial Data (Optional for Development)
```bash
npm run db:seed
```

---

## 5. Default Administrator Credentials

Upon initial database initialization, a default super-administrator account is provisioned:

- **Login URL**: `/admin/login`
- **Email**: `admin@unity101events.org`
- **Password**: `Admin@Unity101!2026`

> **Security Note**: Change this password immediately after first login via `/admin/profile`.

---

## 6. Local Development Server

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser:
# Public Registration: http://localhost:3000/register
# Admin Dashboard:     http://localhost:3000/admin/dashboard
# Admin Login:         http://localhost:3000/admin/login
```

---

## 7. Production Verification

```bash
npm run build
npm run start
```
