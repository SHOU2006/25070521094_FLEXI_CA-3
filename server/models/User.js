const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['student'],
      default: 'student',
    },
    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    // Preferences
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    emailReminders: { type: Boolean, default: true },
    // Stats
    totalTasksCompleted: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 },
    totalStudyGroups: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak logic
userSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastActiveDate) {
    this.streak = 1;
  } else {
    const lastActive = new Date(this.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    const diff = (today - lastActive) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      this.streak += 1;
    } else if (diff > 1) {
      this.streak = 1;
    }
  }
  this.lastActiveDate = new Date();
};

// Update XP and level
userSchema.methods.addXP = function (points) {
  this.xp += points;
  this.level = Math.floor(this.xp / 500) + 1;
};

module.exports = mongoose.model('User', userSchema);
