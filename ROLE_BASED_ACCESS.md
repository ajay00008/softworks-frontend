# Role-Based Access Control System

This application now includes a comprehensive role-based access control system with completely separate dashboard views based on user roles.

## User Roles

### 1. Super Admin (`super_admin`)
- **Access**: System administration and admin management only
- **Dashboard**: Super Admin Dashboard - focused on admin management
- **Features**:
  - Create, read, update, and delete admin accounts
  - View system statistics and admin activity
  - Configure system-wide settings
  - Monitor admin activity and system health
  - **NO access to educational content management**

### 2. Admin (`admin`)
- **Access**: Educational content management only
- **Dashboard**: Regular Admin Dashboard - focused on educational management
- **Features**:
  - Manage students and teachers
  - Upload books and create questions
  - Access educational analytics
  - Manage educational content and assessments
  - **NO access to admin management features**

## API Integration

The application now makes real API calls to your backend server:

- **API Base URL**: `http://localhost:4000/api`
- **Login Endpoint**: `POST /auth/login`
- **Admin Management Endpoints**: `GET/POST/PUT/DELETE /admins`

### Expected API Response Format

**Login Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string", 
    "role": "super_admin" | "admin",
    "name": "string",
    "createdAt": "string"
  },
  "token": "string"
}
```

**Admin Management Response:**
```json
{
  "id": "string",
  "email": "string",
  "role": "super_admin" | "admin", 
  "name": "string",
  "createdAt": "string"
}
```

## Features Implemented

### 1. Completely Separate Dashboards
- **Super Admin Dashboard**: Only admin management and system administration features
- **Regular Admin Dashboard**: Only educational content management features
- No overlap between the two dashboard types

### 2. Role-Based Navigation
- **Super Admin Sidebar**: Admin Management, System Settings, System Analytics
- **Regular Admin Sidebar**: Students, Teachers, Books, Questions, Educational Analytics
- Role is displayed in the header

### 3. Admin Management (Super Admin Only)
- Complete CRUD operations for admin accounts
- Create new admin users with different roles
- Edit existing admin information
- Delete admin accounts (except super admin)
- Search and filter functionality
- Role-based badges and icons

### 4. Protected Routes
- **Super Admin Routes**: `/dashboard/super-admin`, `/dashboard/admin-management`, `/dashboard/settings`, `/dashboard/analytics`
- **Regular Admin Routes**: `/dashboard`, `/dashboard/students`, `/dashboard/teachers`, `/dashboard/books`, etc.
- Automatic redirection based on user permissions
- Cross-role access is blocked

### 5. Clear Separation of Concerns
- Super admins cannot access educational content management
- Regular admins cannot access admin management features
- Each role has its own dedicated interface and functionality

## Technical Implementation

### Components Created
- `SuperAdminDashboard.tsx` - Main dashboard for super admins
- `AdminManagement.tsx` - CRUD interface for admin management
- Updated `DashboardLayout.tsx` - Role-based navigation
- Updated `App.tsx` - Role-based routing

### API Functions Added
- `adminsAPI.getAll()` - Get all admin users
- `adminsAPI.create()` - Create new admin
- `adminsAPI.update()` - Update admin information
- `adminsAPI.delete()` - Delete admin (with super admin protection)

### Security Features
- Super admin accounts cannot be deleted
- Role-based access control on all admin management features
- Automatic redirection for unauthorized access
- Protected routes with role validation

## Usage

1. **Login as Super Admin**: Use `superadmin@edu.com` / `password`
   - Access full admin management capabilities
   - Create and manage other admin accounts
   - View comprehensive system statistics

2. **Login as Regular Admin**: Use `admin@edu.com` / `password`
   - Access standard educational management features
   - Cannot access admin management functions
   - Standard dashboard experience

The system automatically detects the user's role and provides the appropriate interface and permissions.
