# GS FAKIBOGORA (GSFAK) — School Website & Integrated Admin System
## Local Deployment Guide for Windows with XAMPP (PHP 8.2 & MySQL)

This package contains the complete, production-ready source code and database schema for **Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA)**, established in 1969 in Kibogora, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda.

---

### 1. Requirements

- **Windows 10 or 11**
- **XAMPP 8.2+** (includes Apache and MySQL/MariaDB)
  Download from: https://www.apachefriends.org/
- Web browser (Chrome, Edge, Firefox)

---

### 2. Step-by-Step Installation

#### Step 2.1: Start XAMPP Services
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.
4. Ensure both services show green status indicators.

#### Step 2.2: Place Application in XAMPP `htdocs`
1. Navigate to your XAMPP installation directory:
   `C:\xampp\htdocs\`
2. Create a folder named `gsfakibogora`:
   `C:\xampp\htdocs\gsfakibogora`
3. Copy all files from this `php-app` folder into `C:\xampp\htdocs\gsfakibogora\`:
   - `index.php`
   - `config.php`
   - `auth.php`
   - `login_view.php`
   - `admin_view.php`
   - `database.sql`
   - `README.md`

#### Step 2.3: Import the MySQL Database
1. Open your browser and navigate to:
   `http://localhost/phpmyadmin/`
2. Click **New** in the left sidebar to create a new database.
3. Database name: **`gsfakibogora`**
   Collation: `utf8mb4_unicode_ci`
4. Click **Create**.
5. With the newly created `gsfakibogora` database selected, click on the **Import** tab at the top.
6. Click **Choose File** and select `C:\xampp\htdocs\gsfakibogora\database.sql`.
7. Scroll down and click **Import** (or **Go**).
8. Verify that all 11 tables (`admins`, `roles`, `school_info`, `news_announcements`, `gallery_items`, `staff_members`, `activities`, `contact_messages`, `sessions`, `password_resets`, `audit_logs`) were created successfully.

#### Step 2.4: Launch the Website
Open your browser and navigate to:
```
http://localhost/gsfakibogora/
```

---

### 3. Administrator Credentials

| Role | Email | Password |
|---|---|---|
| **Super Administrator** | `superadmin@gsfakibogora.rw` | `GSFak@1969#Admin` |
| **Content Administrator** | `editor@gsfakibogora.rw` | `Editor@GSFAK2026` |

> **Security Note:** In production, immediately log in and change default passwords using the built-in Password Change module.

---

### 4. Admin Navigation Behavior

The website implements the required dual-state administration routing:
1. **Public Visitor:** Clicking **Admin** in the navigation bar displays an access-denied security notice (`"Access Denied: You are not authorized to access the administration area."`).
2. **Authorized Staff:** Authorized personnel can click **"Authorized Staff & Administrator Sign In"** to open the login form.
3. **Authenticated Administrator:** Clicking **Admin** directly opens the Administration Dashboard without re-authenticating while their session remains active.

---

### 5. Multilingual Support

The website supports:
- **English (EN)**
- **Ikinyarwanda (RW)**
- **Français (FR)**

Switch between languages using the top bar language selector (`EN` · `RW` · `FR`).

---

### 6. Gallery Photo Management & Secure Deletion

- **Admin Dashboard Gallery Module (`?page=admin&tab=gallery`)**:
  - Administrators can review all active gallery photos with thumbnails, categories, titles, captions, and upload timestamps.
  - **Uploading Photos**: Direct file upload (JPEG, PNG, WEBP up to 10MB) automatically saves files to `uploads/gallery/` with randomly generated secure filenames. Administrators may also provide external image URLs.
  - **Deleting Photos**:
    - Each photo card features a prominent **Delete** button with a trash icon.
    - Clicking Delete triggers the confirmation prompt: `"Are you sure you want to delete this photo?"`.
    - Upon confirmation, the backend checks administrator authentication, validates the CSRF token, verifies the photo record, safely deletes the associated image file from `uploads/gallery/` (with strict path-traversal prevention), and deletes the record from `gallery_items`.
    - All deletions are permanently logged in `audit_logs` (`GALLERY_PHOTO_DELETED`).
    - Unauthenticated visitors attempting to delete content are strictly blocked with HTTP 403 Forbidden.

---

### 7. Staff Management (Teachers & School Leaders)

- **Admin Dashboard Staff Module (`?page=admin&tab=staff`)**:
  - **Adding Staff**: Administrators can add a staff member specifying their full name, staff category (`leader` vs `teacher`), official title/role, photograph (file upload or URL), department, qualification, and contact placeholder.
  - **Public Display Distinction**:
    - **Teachers**: On public pages (About Us, etc.), only their **name** and **photograph** are displayed.
    - **School Leaders**: On public pages, their **name**, **photograph**, and **official role/position** are displayed.
  - **Editing Staff**: Update staff names, categories, titles, department, qualification, and safely replace photographs. Replaced old managed images in `uploads/staff/` are automatically deleted from server storage.
  - **Deleting Staff**:
    - Each staff profile in the dashboard has a **Delete** button.
    - Clicking Delete triggers the confirmation prompt: `"Are you sure you want to delete this staff member?"`.
    - Upon confirmation, the backend validates admin authentication and CSRF token, safely unlinks the associated image file from `uploads/staff/` (if managed), and removes the record from the database.
    - Both the administration dashboard and public website immediately reflect the deletion.
    - All deletions are logged in the institutional audit log (`STAFF_MEMBER_DELETED`).

---

### 8. Administrator Account Management & Security

- **Admin Dashboard Administrator Accounts Module (`?page=admin&tab=admins`)**:
  - **View Accounts**: View all administrative users, emails, roles (`super_admin` vs `content_admin`), active status, and last login timestamps.
  - **Add Administrator Account**: Super Administrators can provision new administrator accounts with full name, email, role, and temporary password (hashed using `password_hash()` with `PASSWORD_DEFAULT`).
  - **Edit Administrator Account**: Super Administrators can update names, emails, roles, and notes. Administrators can also edit their own profile details.
  - **Enable / Disable Account**: Toggle account active status. When deactivated, all active sessions for that account are immediately terminated in the `sessions` table.
  - **Delete Administrator Account**:
    - Click **Delete** on an administrator account to trigger the confirmation prompt: `"Are you sure you want to delete this administrator account?"`.
    - Upon confirmation, the account and any active sessions are deleted.
  - **Self-Protection & Last-Admin Invariants**:
    - An administrator cannot deactivate or delete their own account while logged in.
    - The system strictly blocks deleting or deactivating the last remaining active administrator.
    - The system strictly blocks deleting or demoting the last remaining Super Administrator.
  - **Change Password**:
    - Any logged-in administrator can change their password securely via **Change My Password**.
    - Requires current password (verified using `password_verify()`), minimum 8 characters for the new password, and confirmation matching.
    - Passwords are never displayed or stored in plain text.

---

### 9. Testing Features Locally with XAMPP

1. **Staff Management Testing**:
   - Log in as Super Admin (`superadmin@gsfakibogora.rw` / `GSFak@1969#Admin`).
   - Go to **Staff Management** (`?page=admin&tab=staff`).
   - Click **Add Staff Member**; choose category **Teacher**; fill in name and upload a JPG/PNG file; save.
   - Click **View Public Site** -> **About Us**; verify that the teacher appears showing **only name and photograph**.
   - Return to admin dashboard, click **Add Staff Member**; choose category **School Leader**; fill in name and title ("Deputy Headmaster"); save.
   - In **About Us**, verify that the leader appears showing **name, photograph, and official title**.
   - In admin dashboard, click **Edit** on a staff member and replace their photo; verify new photo appears.
   - Click **Delete** on a staff member, confirm deletion; verify the record and file are removed and no longer show publicly.

2. **Administrator Accounts Testing**:
   - Go to **Administrator Accounts** (`?page=admin&tab=admins`).
   - Click **Add Administrator**; enter details for a new Content Admin; save.
   - Click **Edit** to update their name or notes.
   - Click **Deactivate** to disable their account; verify status changes to Deactivated.
   - Try to deactivate your own account (`superadmin@gsfakibogora.rw`); verify the button is hidden/blocked.
   - Click **Delete** on the newly created admin account, confirm deletion; verify account is removed.
   - Click **Change My Password**; test with incorrect current password (error shown), then with correct password; verify success.
   - Log out, and verify that public visitors cannot access administrative endpoints or delete content.


