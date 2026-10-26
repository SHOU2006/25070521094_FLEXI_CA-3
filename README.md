# ⚡ FLEXI — Smart Student Dashboard

> A full-stack web application to help students manage assignments, deadlines, subjects, and study goals through one powerful dashboard.

---

## 🚀 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, React Router, Recharts  |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB (via MongoDB Compass)      |
| Auth       | JWT + bcryptjs                    |
| Styling    | Vanilla CSS (custom design system) |

---

## 📁 Project Structure

```
project_flexi/
├── backend/                  ← Express + MongoDB API
│   ├── config/db.js          ← MongoDB connection
│   ├── controllers/          ← Route logic
│   ├── middleware/           ← Auth & upload
│   ├── models/               ← Mongoose schemas
│   ├── routes/               ← API routes
│   ├── uploads/              ← File storage (auto-created)
│   ├── server.js             ← App entry point
│   ├── .env                  ← 🔑 YOUR ENV KEYS GO HERE
│   └── .env.example          ← Template
└── frontend/                 ← React app
    └── src/
        ├── context/          ← Auth & Theme contexts
        ├── pages/            ← All page components
        ├── services/api.js   ← Axios API service
        └── index.css         ← Design system
```

---

## 🔑 Environment Variables (WHERE TO PUT YOUR KEYS)

Open **`backend/.env`** and fill in:

```env
# ⭐ MOST IMPORTANT — Your MongoDB Compass connection string
MONGODB_URI=mongodb://localhost:27017/flexi_db

# Change this to any long random string for security
JWT_SECRET=your_very_long_random_secret_here

# Server
PORT=5000
CLIENT_URL=http://localhost:3000

# Optional: Email reminders (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 📦 MongoDB Compass Setup

1. Open **MongoDB Compass**
2. Click **"Connect"** (default: `mongodb://localhost:27017`)
3. The `flexi_db` database will be created automatically when you first register
4. You can monitor all collections live in Compass

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v16+
- MongoDB installed & running locally (or MongoDB Atlas)
- MongoDB Compass (for visual DB management)

### 1. Install all dependencies

```bash
npm run install-all
```

### 2. Configure environment

Edit **`backend/.env`** with your MongoDB URI and JWT secret.

### 3. Start the app (both servers)

```bash
npm run dev
```

This starts:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

### Or start separately:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

---

## 🌟 Features

### Core
- ✅ Secure signup, login & personalized dashboard
- ✅ Create, edit, delete, complete study tasks
- ✅ Subject-wise organization with color & icon
- ✅ Priority levels (Low / Medium / High / Urgent)
- ✅ Upcoming deadline section & task filters
- ✅ Progress charts & analytics

### Advanced
- 🍅 **Pomodoro Focus Timer** with session history & bar chart
- 🔥 **Study Streaks** — daily login streaks
- ⚡ **XP & Leveling System** — earn XP for every action
- 🏆 **Badges** — unlock achievements as you study
- 📊 **GPA Tracker** — per-subject grade calculator
- 📅 **Calendar View** — see all deadlines on a calendar
- 👥 **Study Groups** — create/join with invite codes
- 🎯 **Study Goals** — set goals with milestones
- 📝 **Notes** — attach notes & files to subjects
- 🌙 **Dark / Light Mode** toggle
- 📱 Responsive design

---

## 🔗 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/dashboard-stats` | Dashboard statistics |
| GET/POST | `/api/tasks` | Get all / create task |
| PUT/DELETE | `/api/tasks/:id` | Update / delete task |
| GET | `/api/tasks/analytics` | Task analytics |
| GET/POST | `/api/subjects` | Get all / add subject |
| POST | `/api/subjects/:id/grades` | Add grade |
| POST | `/api/focus/start` | Start focus session |
| PUT | `/api/focus/:id/complete` | Complete session |
| GET/POST | `/api/goals` | Study goals |
| GET/POST | `/api/groups` | Study groups |
| POST | `/api/groups/join` | Join with invite code |

---

## 🎨 Design

- **Dark mode** by default (toggle in profile)
- Brand color: `#7c3aed` (purple) + `#06b6d4` (cyan)
- Font: Inter + Space Grotesk
- Smooth animations & glassmorphism effects
