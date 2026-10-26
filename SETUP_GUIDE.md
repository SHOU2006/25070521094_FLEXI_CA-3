# ⚡ FLEXI — MongoDB Compass & ENV Setup Guide

## 🔑 WHERE TO PUT YOUR ENV KEYS

Open this file: **`backend/.env`**

```
project_flexi/
└── backend/
    └── .env   ← OPEN THIS FILE AND FILL IN YOUR VALUES
```

---

## 📦 Step 1: Connect MongoDB Compass

### If you already have MongoDB Compass installed:

1. Open **MongoDB Compass** on your desktop
2. On the connection screen, your default URI will be:
   ```
   mongodb://localhost:27017
   ```
3. Click **Connect**
4. That's it! The `flexi_db` database will be **created automatically** when you register your first account

### Your `.env` connection string:
```env
MONGODB_URI=mongodb://localhost:27017/flexi_db
```

---

## ⚙️ Step 2: Fill in your `backend/.env` file

Open `c:\Users\SHOURYAM GARG\Desktop\project_flexi\backend\.env` and it should look like this:

```env
# ─── REQUIRED ──────────────────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/flexi_db

# Change this to any long random text (keeps your tokens secure)
JWT_SECRET=flexi_super_secret_jwt_key_change_in_production_2024

# ─── OPTIONAL (Email Reminders) ────────────────────────────────────
# Only needed if you want email deadline reminders
# Use Gmail → Settings → Security → App Passwords
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password

# ─── DO NOT CHANGE THESE ───────────────────────────────────────────
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_EXPIRES_IN=7d
NODE_ENV=development
MAX_FILE_SIZE=10
```

---

## 🚀 Step 3: Start the App

### Open **TWO** terminal windows:

**Terminal 1 — Backend:**
```bash
cd "C:\Users\SHOURYAM GARG\Desktop\project_flexi\backend"
npm run dev
```
You should see:
```
🚀 FLEXI Backend running on port 5000
✅ MongoDB Connected: localhost
📁 Database: flexi_db
```

**Terminal 2 — Frontend:**
```bash
cd "C:\Users\SHOURYAM GARG\Desktop\project_flexi\frontend"
npm start
```
Then open → **http://localhost:3000**

---

## 🔍 View your data in MongoDB Compass

After registering, open MongoDB Compass and you'll see:
- **flexi_db** database with these collections:
  - `users` — your account data, XP, badges, streaks
  - `tasks` — all your assignments and deadlines
  - `subjects` — your subjects with GPA data
  - `studygoals` — your goals and milestones
  - `focussessions` — pomodoro timer history
  - `studygroups` — collaborative study groups

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB Connection Error` | Make sure MongoDB service is running. Open Services or run `net start MongoDB` |
| `Port 5000 already in use` | Change `PORT=5001` in `.env` and update `CLIENT_URL` |
| `Cannot connect to localhost:3000` | Make sure `npm start` is running in the frontend folder |
| Blank page in browser | Check browser console (F12) for errors |
