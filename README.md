# 📻 Unity 101 Community Radio - 20th Anniversary Gala Registration System

A full-stack event guest registration and administrative management platform built with **Next.js 16 (App Router + Turbopack)**, **TypeScript**, **Tailwind CSS**, and **MySQL**.

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)

---

## 🌟 Key Features

### 1. 🎟️ Public Guest Registration (`/register`)
- **Event Branding:** Royal Purple & Gold Gala design celebrating Unity 101's 20th Anniversary.
- **Full Guest Data:** Name, postal address, town, postcode, email, and mobile contact.
- **Meal Preferences:** Catering choice between Vegetarian and Non-Vegetarian food.
- **Instant Validation:** Client-side and server-side checks with postal code formatting and GDPR compliance.
- **Confirmation Slip:** Real-time confirmation badge with registration reference code.

### 2. 📊 Operations Analytics & Dashboard (`/admin/dashboard`)
- **Real Meal Donut Chart:** Interactive SVG chart displaying Veg vs Non-Veg breakdown with percentage metrics and slice hover.
- **Velocity Bar Diagram:** 7-day registration trend bar chart with interactive floating tooltips.
- **Geographic Reach:** Hampshire locality breakdown with progress indicators for top towns.
- **Venue Milestone Gauge:** Live hall quota progress bar with capacity tracking.
- **Latest Signups Table:** Real-time guest list with status tags and quick inspection.

### 3. 👥 Comprehensive Guest Management (`/admin/registrations`)
- **Search & Filter:** Search by name, email, phone, or postcode. Filter by food choice and confirmation status.
- **Status Workflows:** Mark guests as *New*, *Confirmed*, or *Cancelled*.
- **Bulk Actions:** Bulk confirm or soft-delete multiple guests simultaneously.
- **CSV Data Export:** One-click instant export of all registration records.

### 4. 🗑️ Trash & Data Recovery (`/admin/trash`)
- **Soft-Delete Architecture:** Safe deletion with ability to restore accidental deletions.
- **Permanent Purge:** Hard deletion option for verified admin users.

### 5. 🛡️ Admin Profile & Security (`/admin/profile`)
- **Identity Card:** Super Administrator profile with role badges.
- **Password Strength Meter:** Real-time password health bar with criteria checklists.
- **Show/Hide Password:** Easy toggle for authentication fields.
- **BCrypt Hashing:** Secure credential encryption with JWT session cookies.

---

## 🚀 Quick Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Vishwakarmasuraj333/Unity101.git
cd Unity101
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your MySQL database credentials:
```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=unity101_db
ADMIN_SESSION_SECRET=unity101_secure_jwt_secret_salt_2026_unity_community_radio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Initialize Database
Import schema and seed initial data:
```bash
# Initialize tables
mysql -u root -p < scripts/schema.sql

# Seed initial records (optional)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit the application:
- **Public Registration:** [http://localhost:3000/register](http://localhost:3000/register)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🔑 Default Administrator Credentials
- **Login URL:** `/admin/login`
- **Email:** `admin@unity101events.org`
- **Password:** `Admin@Unity101!2026`

---

## 📁 Project Architecture

```
├── public/
│   └── images/
│       ├── mandala-pattern.svg    # Gold royal mandala pattern
│       └── unity101-logo.png      # 20th Anniversary official emblem
├── scripts/
│   ├── schema.sql                 # MySQL relational database schema
│   └── seed.js                    # Sample seed data
├── src/
│   ├── app/
│   │   ├── admin/                 # Admin management routes
│   │   │   ├── dashboard/         # Analytics and live charts
│   │   │   ├── login/             # Administrator authentication
│   │   │   ├── profile/           # Security & credentials manager
│   │   │   ├── registrations/     # Full guest table & actions
│   │   │   ├── settings/          # Event system parameters
│   │   │   └── trash/             # Soft-deleted records recovery
│   │   ├── api/                   # REST API routes
│   │   └── register/              # Public guest registration page
│   ├── components/
│   │   ├── admin/                 # Admin layout and charts
│   │   │   └── charts/            # SVG Donut, Velocity Bar & Reach diagrams
│   │   └── registration/          # Public registration form components
│   ├── lib/                       # MySQL connection pool & JWT auth
│   └── types/                     # TypeScript data models
└── package.json
```

---

## 📜 License
Developed for **Unity 101 Community Radio (99.8 FM)** Southampton, UK.
