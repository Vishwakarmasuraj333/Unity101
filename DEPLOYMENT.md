# Unity 101 Community Radio - Production Deployment Guide
## Vercel + Aiven MySQL Free Deployment Architecture

This document provides step-by-step instructions for deploying the **Unity 101 Community Radio Event Registration & Admin Management System** to **Vercel** with **Aiven Free MySQL** database.

---

## 1. Production Architecture Overview

```
User / Admin Web Browser
         │
         ▼  (HTTPS / Edge CDN)
    Vercel Hosting
         │
  Next.js 16 (App Router)
  ├── Public Registration UI (/register)
  ├── Protected Admin Panel (/admin/*)
  ├── Server-Side Middleware (JWT Cookie Auth)
  ├── Next.js Route Handlers (/api/*)
  └── Zod Server Validation
         │
         ▼  (Encrypted TLS / SSL Connection Pooling)
   Aiven MySQL Free Cloud Database
  ├── admin_users
  ├── registrations (with soft-delete & composite indexes)
  ├── admin_activity_logs (immutable audit trail)
  └── settings (system configuration)
```

---

## 2. Aiven MySQL Free Database Setup

1. **Sign Up / Log In**: Navigate to [Aiven Console](https://console.aiven.io/) and create an account.
2. **Create MySQL Service**:
   - Choose **MySQL**
   - Cloud Provider: **AWS**, **Google Cloud**, or **Azure** in your closest geographic region (e.g., `eu-west-1` or `eu-west-2` London for UK audience)
   - Plan: **Free** (or Starter)
   - Service Name: `unity101-mysql`
3. **Retrieve Connection Details**:
   Once the service is active, navigate to the **Overview** tab:
   - **Host**: e.g., `mysql-xxxxx-unity101.aivencloud.com`
   - **Port**: e.g., `11020` or `24089` (unique assigned high port)
   - **User**: e.g., `avnadmin`
   - **Password**: Provided in service overview
   - **Database Name**: `defaultdb` (or create `unity101_db`)
   - **SSL Mode**: `REQUIRED` (Automatically supported by our `src/lib/db.ts`)
4. **Execute Database Migrations**:
   Run the schema migration from your terminal using MySQL CLI connected to Aiven:
   ```bash
   mysql -h <AIVEN_HOST> -P <AIVEN_PORT> -u <AIVEN_USER> -p <AIVEN_DB_NAME> < scripts/schema.sql
   ```
   Or open the **Aiven Service URI** in tools like MySQL Workbench, DBeaver, or TablePlus and run `scripts/schema.sql`.

---

## 3. GitHub Repository Preparation

1. **Verify `.gitignore`**:
   Ensure local environment files and build artifacts are ignored:
   ```gitignore
   node_modules
   .next
   .env
   .env.local
   .env.production
   *.pem
   ```
2. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete Unity 101 event registration system"
   git push origin main
   ```

---

## 4. Vercel Project Deployment

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository (`Vishwakarmasuraj333/Unity101`).
4. Framework Preset: **Next.js** (Auto-detected).
5. Root Directory: `./`

---

## 5. Configuring Vercel Environment Variables

Before triggering the deployment build, expand **Environment Variables** in the Vercel dashboard and add the following:

| Variable Name | Example / Format | Environment | Client Exposed? |
| :--- | :--- | :--- | :--- |
| `DATABASE_HOST` | `mysql-xxxxx.aivencloud.com` | Production, Preview | ❌ No (Server Only) |
| `DATABASE_PORT` | `11020` | Production, Preview | ❌ No (Server Only) |
| `DATABASE_USER` | `avnadmin` | Production, Preview | ❌ No (Server Only) |
| `DATABASE_PASSWORD` | `[Aiven Generated Password]` | Production, Preview | ❌ No (Server Only) |
| `DATABASE_NAME` | `defaultdb` | Production, Preview | ❌ No (Server Only) |
| `DATABASE_SSL` | `true` | Production, Preview | ❌ No (Server Only) |
| `ADMIN_SESSION_SECRET` | `64_char_cryptographically_secure_random_string` | Production, Preview | ❌ No (Server Only) |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` | Production, Preview | ✅ Yes (Public domain) |

> 🔒 **SECURITY ENFORCEMENT**:
> - Never prefix sensitive credentials (`DATABASE_PASSWORD`, `DATABASE_USER`, `ADMIN_SESSION_SECRET`) with `NEXT_PUBLIC_`.
> - Next.js and Vercel automatically prevent non-`NEXT_PUBLIC_` variables from leaking into the client-side JavaScript bundles.

---

## 6. Verification Checklist After Deployment

- [ ] **Public Form**: Open `https://your-project.vercel.app/register` and submit a test registration.
- [ ] **Real MySQL Insertion**: Verify that the submitted record is saved directly in Aiven MySQL.
- [ ] **Duplicate Prevention**: Try submitting the same email or mobile number; verify that HTTP 409 conflict is handled cleanly.
- [ ] **Admin Authentication**: Navigate to `https://your-project.vercel.app/admin/login` and authenticate with default admin credentials.
- [ ] **Password Rotation**: Go to `/admin/profile` and immediately update the default administrator password to a secure custom passphrase.
- [ ] **Dashboard Metrics**: Confirm that `/admin/dashboard` aggregates real metrics (`COUNT(*)`, `GROUP BY`) from the database.
- [ ] **CSV Export**: Click Export CSV on `/admin/registrations` and verify downloaded file contains accurate database records.
- [ ] **Trash & Restore**: Soft-delete a test record, verify in `/admin/trash`, and restore it.
- [ ] **Route Protection**: Open an incognito browser tab and verify accessing `/admin/dashboard` immediately redirects to `/admin/login`.
