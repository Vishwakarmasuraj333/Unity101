# 📻 Unity 101 Community Radio - 20th Anniversary Gala Registration System

A full-stack, enterprise-grade event guest registration and administrative management platform built with **Next.js 16 (App Router + Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **MySQL (Aiven Cloud Compatible)**.

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-Aiven_Cloud-orange?logo=mysql)
![Security](https://img.shields.io/badge/Security-HSTS%20%7C%20RateLimit%20%7C%20JWT-emerald)
![SEO](https://img.shields.io/badge/SEO-JSON--LD%20%7C%20Sitemap%20%7C%20Robots-purple)

---

## 🌟 Key Features

### 1. 🎟️ Public Guest Registration (`/register`)
- **Authentic Brand Experience:** Royal Purple (`#481268`) & Golden Amber theme celebrating Unity 101's 20th Anniversary, closely adhering to the broadcast brand aesthetics.
- **Strict Real-Time Sanitization:** Immediate number-stripping on name and town inputs, strict RFC email validation, and strict 10–15 digit mobile phone caps.
- **Meal Preferences:** Catering selection between Vegetarian and Non-Vegetarian options.
- **Live Reference & Digital Slip:** Generates unique registration references (`U101-XXXXX`) upon submission with print and save capabilities.
- **Duplicate Prevention:** Prevents multiple active registrations with identical email addresses or contact numbers.

### 2. 📧 Automated Email Notification System
- **Responsive HTML Template:** High-end branded confirmation emails featuring event schedule, check-in instructions, dietary choice badge, and reference code.
- **Admin Alerts:** Instant notification to event coordinators whenever a new guest registers.
- **Resend Capability:** Administrators can resend confirmation emails to any guest directly from the guest detail view (`/admin/registrations/[id]`).
- **Live SMTP Verification:** Dedicated SMTP configuration panel with a live "Test Email" dispatch button in `/admin/settings`.
- **Fault-Tolerant Fallback:** Graceful fallback logging when SMTP is not configured, ensuring registration is never blocked.

### 3. 🛡️ Advanced Security
- **Strict HTTP Security Headers:** Automated HSTS, X-Frame-Options (Clickjacking defense), X-Content-Type-Options (MIME sniffing defense), and Permissions-Policy configured via `next.config.ts`.
- **API Rate Limiting:** IP-based sliding-window rate limiting on `/api/registrations` (10 submissions / 15 minutes) to protect against DoS and bot spam.
- **XSS & Injection Protection:** Rigorous server-side string sanitization stripping harmful HTML/script tags.
- **JWT HttpOnly Cookies:** Tamper-proof session storage encrypted with HS256 (`jose`) and secure cookie flags.
- **BCrypt Password Hashing:** Salted hash encryption for administrative authentication credentials.

### 4. 🔍 SEO & Search Optimization
- **Dynamic XML Sitemap (`/sitemap.xml`):** Next.js App Router dynamic sitemap indexing key event pages.
- **Robots Policy (`/robots.txt`):** Search engine crawler instructions allowing public access while shielding administrative endpoints.
- **JSON-LD Structured Data:** Embedded `schema.org/Event` and `schema.org/RadioStation` schemas for rich Google search snippets.
- **Social Metadata:** Complete OpenGraph and Twitter card metadata for link previews on social platforms.

### 5. 👥 Comprehensive Guest Administration (`/admin/registrations`)
- **Live Search & Filter:** Instant debounced search by name, email, phone, town, or postcode. Filter by status (*New*, *Confirmed*, *Cancelled*), catering choice, and registration date.
- **Add Guest Modal:** Full-featured guest creation modal with real-time input sanitization.
- **Export to CSV:** UTF-8 BOM CSV export compatible with Microsoft Excel and Google Sheets, supporting custom filters and row selections.
- **Bulk Operations:** Multi-select guests for bulk confirmation, cancellation, CSV export, or moving to trash.
- **Single Guest Inspector (`/admin/registrations/[id]`):** Dedicated full-page view, guest badge preview, edit form, and status toggles.

### 6. 📊 Real-Time Operations Analytics (`/admin/dashboard`)
- **Catering Breakdown:** Interactive SVG donut chart tracking Vegetarian vs Non-Vegetarian meal quotas.
- **Registration Velocity:** Daily sign-up trends over a 7-day rolling window.
- **Geographic Distribution:** Hampshire and UK town breakdown for logistics planning.
- **Capacity Milestone Gauge:** Dynamic progress bar tracking registrations against hall capacity.

### 7. 🗑️ Soft-Delete & Data Recovery (`/admin/trash`)
- **Trash Quarantine:** Soft-deleted guests are preserved with deletion timestamps.
- **One-Click Restore:** Instant restoration of accidental deletions back to the active directory.
- **Permanent Purge:** Hard deletion option for GDPR compliance and permanent cleanup.

### 8. ⚙️ System & Email Settings (`/admin/settings`)
- Configurable event title, date, venue location, capacity limit, and registration open/closed toggle.
- Full SMTP email delivery settings with test message dispatcher.

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
Create `.env` in the root directory:
```env
# Database Configuration (MySQL / Aiven Cloud)
DATABASE_HOST=mysql-37ec536c-itxsurajofficial-3639.i.aivencloud.com
DATABASE_PORT=20680
DATABASE_USER=avnadmin
DATABASE_PASSWORD=your_aiven_password
DATABASE_NAME=defaultdb
DATABASE_SSL=true

# Authentication
ADMIN_SESSION_SECRET=unity101_secure_jwt_secret_salt_2026_unity_community_radio

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional SMTP Settings (or configure via Admin Settings portal)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=events@unity101.org
SMTP_PASS=your_app_password
SMTP_FROM=Unity 101 Community Radio <events@unity101.org>
EMAIL_NOTIFICATIONS_ENABLED=true
ADMIN_ALERT_EMAIL=events@unity101.org
```

### 4. Build and Run
```bash
# Start development server
npm run dev

# Or build for production
npm run build
npm start
```

Visit the application:
- **Public Registration:** [http://localhost:3000/register](http://localhost:3000/register)
- **Admin Portal:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 🔑 Default Administrator Credentials
- **Login URL:** `/admin/login`
- **Email:** `admin@unity101events.org`
- **Password:** `Admin@Unity101!2026`
