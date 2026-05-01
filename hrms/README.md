# HRMS — Human Resource Management System

A complete role-based HRMS built with **React + Redux Toolkit + JSON Server + Bootstrap**.

---

## 🚀 Quick Setup

### 1. Install dependencies
```bash
cd hrms
npm install
```

### 2. Run the app (both JSON Server + React)
```bash
npm run dev
```

- **React App** → http://localhost:3000
- **JSON Server (API)** → http://localhost:3001

---

## 👥 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hrms.com | admin123 |
| Manager | manager@hrms.com | manager123 |
| Employee | employee@hrms.com | emp123 |

> 💡 Use the **Quick Login** buttons on the login screen!

---

## ✨ Features

### 🔐 Authentication
- Role-based login/logout (Admin / Manager / Employee)
- Auto-login via `localStorage` persistence
- Protected routes per role

### 👑 Admin
- Full **CRUD** for employees (create, read, update, delete)
- View attendance calendar for any employee
- View salary breakdown for any employee
- Approve / Reject leave requests
- Own check-in / check-out

### 👔 Manager
- View all employees with present/absent status
- View individual employee attendance calendar & salary
- Approve / Reject leave requests
- Own check-in / check-out + salary

### 👤 Employee
- Own profile view
- Check-in / Check-out with live clock
- Attendance calendar (color-coded)
- Salary breakdown with deductions
- Apply for leave

---

## ⏰ Attendance Rules

| Rule | Detail |
|------|--------|
| Work Hours | 9:00 AM – 5:00 PM (8 hrs) |
| Late threshold | 9:45 AM → Half day |
| Missed checkout | ₹500 penalty + half-day salary |
| Sunday | Not counted as working day |
| Absent | Full day salary deducted |

## 💰 Salary Rules

| Rule | Detail |
|------|--------|
| Rate | Hourly-based (set per employee) |
| 1 Paid Leave | Free — no deduction |
| Extra paid leaves | Salary deducted per extra day |
| Sunday | Not counted |
| Penalty | ₹500 per missed checkout |

---

## 🗂 Project Structure

```
src/
├── store/
│   ├── store.js
│   └── slices/
│       ├── authSlice.js       # Login, logout, localStorage
│       ├── usersSlice.js      # Employee CRUD
│       ├── attendanceSlice.js # Check-in/out
│       └── leavesSlice.js     # Leave management
├── pages/
│   ├── LoginPage.js
│   ├── admin/AdminDashboard.js
│   ├── manager/ManagerDashboard.js
│   └── employee/EmployeeDashboard.js
├── components/
│   ├── Sidebar.js
│   ├── Topbar.js
│   ├── AttendanceWidget.js    # Check-in/out UI
│   ├── AttendanceCalendar.js  # Monthly calendar
│   ├── LeaveSection.js        # Apply & view leaves
│   └── SalaryCard.js          # Salary breakdown
├── utils/
│   └── salaryUtils.js         # All salary/attendance logic
├── App.js                     # Routes
├── index.js
└── index.css                  # Global dark theme
db.json                        # JSON Server database
```

---

## 🎨 UI Design

- **Dark theme** with accent blue (#4f7df3)
- **Space Mono** for numeric/mono display
- **DM Sans** for body text
- Color-coded attendance calendar
- Circular check-in / check-out buttons
- Role badges (red=admin, blue=manager, green=employee)
