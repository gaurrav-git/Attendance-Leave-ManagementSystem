# 🎓 EduAttend — College Attendance & Leave Management System

A full-stack MERN application for managing student attendance and leave requests in a college setting.

## 🏗️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth, bcryptjs
- **Frontend**: React 18, React Router v6, Recharts, React Hot Toast, Lucide Icons

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# In /backend, create .env from example
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_super_secret_key_change_me
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

### 4. Run the Application

```bash
# Terminal 1 - Start backend
cd backend
npm run dev     # or: npm start

# Terminal 2 - Start frontend
cd frontend
npm start
```

Open `http://localhost:3000`

---

## 📋 Features

### 👤 Authentication & Roles
- JWT-based authentication
- Three roles: **Admin**, **Faculty**, **Student**
- Protected routes per role
- Password change functionality

### 🏛️ Admin Dashboard
- System-wide statistics (students, faculty, courses, pending leaves)
- Monthly attendance trend charts
- Pending leave requests at a glance
- Full CRUD for courses and users

### 👨‍🏫 Faculty Features
- View and manage assigned courses
- **Mark Attendance**: Select course → date → mark each student (Present/Absent)
- Bulk mark all students
- Review and approve/reject leave requests
- Attendance history per course
- Generate student-wise reports

### 🧑‍🎓 Student Features
- Dashboard with overall attendance percentage
- Course-wise attendance breakdown with donut charts
- Shortage warnings (< 75% attendance)
- Apply for leaves (sick, personal, emergency, academic, etc.)
- Track leave status (pending/approved/rejected)
- Cancel pending leaves

### 📊 Reports
- Filter by student and course
- Bar charts: Present / Absent / Late per course
- Line chart: Attendance percentage trend
- Detailed table with shortage flags
- Overall attendance summary

---

## 📁 Project Structure

```
attendance-system/
├── backend/
│   ├── models/
│   │   ├── User.js          # Student/Faculty/Admin model
│   │   ├── Course.js        # Course with schedule
│   │   ├── Attendance.js    # Session-based attendance
│   │   └── Leave.js         # Leave requests
│   ├── routes/
│   │   ├── auth.js          # Login, register, me, password
│   │   ├── users.js         # User CRUD
│   │   ├── courses.js       # Course management + enrollment
│   │   ├── attendance.js    # Mark & view attendance
│   │   ├── leaves.js        # Leave applications & review
│   │   └── dashboard.js     # Role-specific stats
│   ├── middleware/
│   │   └── auth.js          # JWT protect + role authorize
│   ├── server.js
│   ├── seed.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── Dashboard.js
        │   ├── Attendance.js
        │   ├── MarkAttendance.js
        │   ├── Leaves.js
        │   ├── Courses.js
        │   ├── Students.js
        │   ├── Reports.js
        │   └── Profile.js
        ├── components/
        │   └── Layout.js
        ├── utils/
        │   └── api.js
        └── App.js
```

---

## 🗃️ API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/updatepassword` | Change password |

### Courses
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/courses` | List courses (role-filtered) |
| POST | `/api/courses` | Create course (admin) |
| PUT | `/api/courses/:id` | Update course |
| POST | `/api/courses/:id/enroll` | Enroll students |

### Attendance
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/attendance` | List attendance records |
| POST | `/api/attendance` | Mark attendance (faculty) |
| GET | `/api/attendance/summary/:studentId` | Student summary |
| GET | `/api/attendance/course/:courseId` | Course records |

### Leaves
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/leaves` | List leaves |
| POST | `/api/leaves` | Apply for leave |
| PUT | `/api/leaves/:id/review` | Approve/reject |
| PUT | `/api/leaves/:id/cancel` | Cancel pending |

---

## 🔒 Security
- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens expire in 30 days
- Role-based middleware on all sensitive routes
- Students can only view their own data
